variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "mh-site"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "canadaeast"
}

variable "anthropic_api_key" {
  description = "Anthropic API key"
  type        = string
  sensitive   = true
}

variable "admin_password" {
  description = "Password for the admin log viewer"
  type        = string
  sensitive   = true
}

variable "rate_limit_per_ip" {
  description = "Max API requests per IP per hour"
  type        = number
  default     = 10
}

variable "rate_limit_global" {
  description = "Max total API requests per day"
  type        = number
  default     = 100
}

variable "custom_domain" {
  description = "Custom domain name (optional)"
  type        = string
  default     = ""
}
