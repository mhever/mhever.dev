output "static_web_app_url" {
  description = "Frontend URL"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "function_app_url" {
  description = "API URL"
  value       = "https://${azurerm_linux_function_app.api.default_hostname}"
}

output "static_web_app_api_key" {
  description = "API key for GitHub Actions deployment (keep secret)"
  value       = azurerm_static_web_app.frontend.api_key
  sensitive   = true
}

output "key_vault_url" {
  description = "Key Vault URL"
  value       = azurerm_key_vault.main.vault_uri
}

output "storage_account_name" {
  description = "Storage account for system prompt upload"
  value       = azurerm_storage_account.main.name
}
