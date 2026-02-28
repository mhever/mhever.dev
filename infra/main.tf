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
  name                            = replace("${var.project_name}store", "-", "")
  resource_group_name             = azurerm_resource_group.main.name
  location                        = azurerm_resource_group.main.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false

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

resource "azurerm_role_assignment" "function_blob_reader" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Reader"
  principal_id         = azurerm_linux_function_app.api.identity[0].principal_id
}

resource "azurerm_role_assignment" "function_table_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Table Data Contributor"
  principal_id         = azurerm_linux_function_app.api.identity[0].principal_id
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
  # would have been 
  # location            = "azurerm_resource_group.main.location"
  # but resource type is only available in 'westus2,centralus,eastus2,westeurope,eastasia'
  location = "eastus2"
  sku_tier = "Free"
  sku_size = "Free"

  tags = azurerm_resource_group.main.tags
}

# ──────────────────────────────────────────────
# App Service Plan + Function App (Go API)
# ──────────────────────────────────────────────

resource "azurerm_log_analytics_workspace" "main" {
  name                = "mh-site-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = azurerm_resource_group.main.tags
}

resource "azurerm_application_insights" "main" {
  name                = "mh-site-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "other"
  tags                = azurerm_resource_group.main.tags
}

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
  https_only          = true

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_insights_connection_string = azurerm_application_insights.main.connection_string
    application_insights_key               = azurerm_application_insights.main.instrumentation_key
    ftps_state                             = "Disabled"
    minimum_tls_version                    = "1.2"

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
    "KEY_VAULT_URL"         = azurerm_key_vault.main.vault_uri
    "AZURE_STORAGE_ACCOUNT" = azurerm_storage_account.main.name
    "AZURE_STORAGE_KEY"     = azurerm_storage_account.main.primary_access_key
    "AZURE_BLOB_CONTAINER"  = azurerm_storage_container.config.name
    "AZURE_TABLE_NAME"      = azurerm_storage_table.logs.name
    "RATE_LIMIT_PER_IP"     = tostring(var.rate_limit_per_ip)
    "RATE_LIMIT_GLOBAL"     = tostring(var.rate_limit_global)
    "CORS_ORIGIN"           = "https://mhever.dev"
  }

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
    ]
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
