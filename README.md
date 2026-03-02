# marton-hever.dev

Personal portfolio site with AI-powered experience exploration and fit assessment.

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   React Frontend    │────▶│    Go API Server    │
│  (Azure Static Web) │     │  (Azure Functions)  │
└─────────────────────┘     └──────────┬──────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
   ┌──────────┴──────────┐  ┌──────────┴──────────┐  ┌──────────┴──────────┐
   │   Azure Key Vault   │  │  Azure Blob Storage │  │ Azure Table Storage │
   │      (secrets)      │  │    (sys prompt)     │  │       (logs)        │
   └─────────────────────┘  └──────────┬──────────┘  └─────────────────────┘
                                       │
                            ┌──────────┴──────────┐
                            │    Anthropic API    │
                            └─────────────────────┘
```

## What's Here

| Directory | Contents |
|-----------|----------|
| `frontend/` | React + TypeScript + Vite SPA |
| `api/` | Go HTTP server — chat, fit assessment, logging, admin |
| `infra/` | Terraform IaC for all Azure resources |
| `system-prompt/` | Template for the AI system prompt (actual content stored in Azure Blob Storage) |
| `.github/workflows/` | GitHub Actions CI/CD pipeline |

## Sensitive Data Handling

| Data | Location | Public? |
|------|----------|---------|
| Application code | GitHub repo | ✅ Yes |
| Terraform IaC | GitHub repo | ✅ Yes |
| System prompt **template** | GitHub repo | ✅ Yes |
| System prompt **content** | Azure Blob Storage | ❌ No |
| Anthropic API key | Azure Key Vault | ❌ No |
| Admin password | Azure Key Vault | ❌ No |
| Usage logs | Azure Table Storage | ❌ No |

## Local Development

### Prerequisites
- Go 1.25+
- Node.js 20+
- npm

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### API
```bash
cd api
cp .env.example .env
# Edit .env with your Anthropic API key
go run .
# → http://localhost:8080
```

### Environment Variables (API)

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes |
| `SYSTEM_PROMPT_PATH` | Path to system prompt file (local dev) | Yes |
| `ADMIN_PASSWORD` | Password for admin log viewer | Yes |
| `AZURE_STORAGE_ACCOUNT` | Azure Storage account name | Production only |
| `AZURE_STORAGE_KEY` | Azure Storage account key | Production only |
| `AZURE_BLOB_CONTAINER` | Blob container for system prompt | Production only |
| `AZURE_TABLE_NAME` | Table name for logs | Production only |
| `RATE_LIMIT_PER_IP` | Max requests per IP per hour (default: 10) | No |
| `RATE_LIMIT_GLOBAL` | Max total requests per day (default: 100) | No |

## Deployment

### 1. Azure Setup (Terraform)
```bash
cd infra
terraform init
terraform plan -var="anthropic_api_key=sk-..." -var="admin_password=..."
terraform apply
```

### 2. Upload System Prompt
```bash
az storage blob upload \
  --account-name <storage_account> \
  --container-name config \
  --name system-prompt.md \
  --file ./my-system-prompt.md
```

### 3. CI/CD
Push to `main` → GitHub Actions builds frontend + API → deploys to Azure.

## Cost

- **Azure Static Web Apps (Free tier):** $0
- **Azure Functions (Consumption):** Free tier covers 1M executions/month
- **Azure Table Storage:** Fractions of a cent
- **Azure Blob Storage:** Fractions of a cent
- **Azure Key Vault:** ~$0.03/month
- **Anthropic API:** Hard cap set in dashboard (recommended: $10/month)
- **Estimated total:** $0–2/month Azure + up to $10/month API
