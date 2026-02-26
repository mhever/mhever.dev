data "azurerm_client_config" "current" {}

# ──────────────────────────────────────────────
# Resource Group
# ──────────────────────────────────────────────

resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}"
  location = var.location

  tags = {
    project = var.project_name
    managed = "terraform"
  }
}

# ──────────────────────────────────────────────
# Storage Account (Blob + Table)
# ──────────────────────────────────────────────

resource "azurerm_storage_account" "main" {
  name                     = replace("${var.project_name}store", "-", "")
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  tags = azurerm_resource_group.main.tags
}

# Blob container for system prompt
resource "azurerm_storage_container" "config" {
  name                  = "config"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Table for usage logs
resource "azurerm_storage_table" "logs" {
  name                 = "usagelogs"
  storage_account_name = azurerm_storage_account.main.name
}

# ──────────────────────────────────────────────
# Key Vault
# ──────────────────────────────────────────────

resource "azurerm_key_vault" "main" {
  name                = "${var.project_name}-kv"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  tags = azurerm_resource_group.main.tags
}

# Key Vault access for current user (Terraform deployer)
resource "azurerm_key_vault_access_policy" "deployer" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  secret_permissions = [
    "Get", "Set", "Delete", "List", "Purge",
  ]
}

# Store secrets
resource "azurerm_key_vault_secret" "anthropic_key" {
  name         = "anthropic-api-key"
  value        = var.anthropic_api_key
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.deployer]
}

resource "azurerm_key_vault_secret" "admin_password" {
  name         = "admin-password"
  value        = var.admin_password
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault_access_policy.deployer]
}

# ──────────────────────────────────────────────
# Static Web App (Frontend)
# ──────────────────────────────────────────────

resource "azurerm_static_web_app" "frontend" {
  name                = "${var.project_name}-web"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = azurerm_resource_group.main.tags
}

# ──────────────────────────────────────────────
# App Service Plan + Function App (Go API)
# ──────────────────────────────────────────────

resource "azurerm_service_plan" "api" {
  name                = "${var.project_name}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "Y1" # Consumption (serverless)

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_linux_function_app" "api" {
  name                = "${var.project_name}-api"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.api.id

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      use_custom_runtime = true
    }

    cors {
      allowed_origins = compact([
        "https://${azurerm_static_web_app.frontend.default_host_name}",
        var.custom_domain != "" ? "https://${var.custom_domain}" : "",
      ])
    }
  }

  app_settings = {
    "AZURE_KEYVAULT_URL"     = azurerm_key_vault.main.vault_uri
    "AZURE_STORAGE_ACCOUNT"  = azurerm_storage_account.main.name
    "AZURE_STORAGE_KEY"      = azurerm_storage_account.main.primary_access_key
    "AZURE_BLOB_CONTAINER"   = azurerm_storage_container.config.name
    "AZURE_TABLE_NAME"       = azurerm_storage_table.logs.name
    "RATE_LIMIT_PER_IP"      = tostring(var.rate_limit_per_ip)
    "RATE_LIMIT_GLOBAL"      = tostring(var.rate_limit_global)
    "CORS_ORIGIN"            = "https://${azurerm_static_web_app.frontend.default_host_name}"
  }

  tags = azurerm_resource_group.main.tags
}

# Key Vault access for Function App's managed identity
resource "azurerm_key_vault_access_policy" "function_app" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = azurerm_linux_function_app.api.identity[0].tenant_id
  object_id    = azurerm_linux_function_app.api.identity[0].principal_id

  secret_permissions = [
    "Get",
  ]
}
