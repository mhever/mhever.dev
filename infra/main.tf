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
  # shared_access_key_enabled = false is not possible with azurerm 3.x - the provider
  # uses key auth for Table ACL reads regardless of storage_use_azuread. The Function
  # App uses managed identity (storage_uses_managed_identity = true) and has no key in
  # app_settings, so shared keys are present but never used by the application.

  tags = azurerm_resource_group.main.tags
}

# Blob container for system prompt
resource "azurerm_storage_container" "config" {
  name                  = "config"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Blob container for function app deployment packages
resource "azurerm_storage_container" "deployments" {
  name                  = "deployments"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# Function App package zip - re-uploaded whenever api/deploy.zip changes
# Build first: cd api && GOOS=linux GOARCH=amd64 go build -o handler . && zip -r deploy.zip handler host.json chat/ fit/ health/ adminlogs/
resource "azurerm_storage_blob" "function_package" {
  name                   = "handler.zip"
  storage_account_name   = azurerm_storage_account.main.name
  storage_container_name = azurerm_storage_container.deployments.name
  type                   = "Block"
  source                 = "${path.module}/../api/deploy.zip"
  content_md5            = filemd5("${path.module}/../api/deploy.zip")
}

# Read-only SAS URL for WEBSITE_RUN_FROM_PACKAGE (fixed window avoids regenerating on every plan)
data "azurerm_storage_account_blob_container_sas" "function_package" {
  connection_string = azurerm_storage_account.main.primary_connection_string
  container_name    = azurerm_storage_container.deployments.name
  https_only        = true

  start  = "2024-01-01"
  expiry = "2030-01-01"

  permissions {
    read   = true
    add    = false
    create = false
    write  = false
    delete = false
    list   = false
  }
}

# Table for usage logs
resource "azurerm_storage_table" "logs" {
  name                 = "usagelogs"
  storage_account_name = azurerm_storage_account.main.name
}

# NOTE: The deployer identity (CI service principal or local user) requires:
#   - Storage Blob Data Contributor on this storage account
#   - Key Vault Secrets Officer on the key vault
# These must be granted manually as a one-time bootstrap step - they cannot be
# managed by Terraform because the deployer needs them to run Terraform.

# Function App managed identity → storage: blob read/write (for runtime deployment packages + Go code)
resource "azurerm_role_assignment" "function_blob_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_linux_function_app.api.identity[0].principal_id
}

# Function App managed identity → storage: queue (required by Functions runtime)
resource "azurerm_role_assignment" "function_queue_contributor" {
  scope                = azurerm_storage_account.main.id
  role_definition_name = "Storage Queue Data Contributor"
  principal_id         = azurerm_linux_function_app.api.identity[0].principal_id
}

# Function App managed identity → storage: table (Go usage logs)
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

  enable_rbac_authorization  = true
  purge_protection_enabled   = true
  soft_delete_retention_days = 7 # cannot be changed after initial creation

  tags = azurerm_resource_group.main.tags
}

# Function App managed identity: read-only secret access
resource "azurerm_role_assignment" "kv_function_app" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_function_app.api.identity[0].principal_id
}

# Store secrets
resource "azurerm_key_vault_secret" "anthropic_key" {
  name         = "anthropic-api-key"
  value        = var.anthropic_api_key
  key_vault_id = azurerm_key_vault.main.id

}

resource "azurerm_key_vault_secret" "admin_password" {
  name         = "admin-password"
  value        = var.admin_password
  key_vault_id = azurerm_key_vault.main.id
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
  storage_uses_managed_identity = true # no shared keys; managed identity handles all storage access

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
    "KEY_VAULT_URL"              = azurerm_key_vault.main.vault_uri
    "AZURE_STORAGE_ACCOUNT"      = azurerm_storage_account.main.name
    "AZURE_TABLE_NAME"           = azurerm_storage_table.logs.name
    "RATE_LIMIT_PER_IP"          = tostring(var.rate_limit_per_ip)
    "RATE_LIMIT_GLOBAL"          = tostring(var.rate_limit_global)
    "CORS_ORIGIN"                = "https://mhever.dev"
    "WEBSITE_RUN_FROM_PACKAGE"   = "https://${azurerm_storage_account.main.name}.blob.core.windows.net/${azurerm_storage_container.deployments.name}/${azurerm_storage_blob.function_package.name}${data.azurerm_storage_account_blob_container_sas.function_package.sas}"
  }

  tags = azurerm_resource_group.main.tags
}
