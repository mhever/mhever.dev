# CLAUDE.md — mhever.dev

## Rule #1

**Do not modify application code.** Work is limited to text content files:
- `frontend/src/content.ts` — all site copy, experience, projects, chat suggestions
- `system-prompt/system-prompt.md` — AI assistant context (gitignored; real file is in Azure Blob Storage)

## Project Overview

Personal portfolio site for Marton Hever. AI-powered: visitors can chat with a Claude-backed assistant that knows his background, and submit job descriptions for a fit assessment.

## Architecture

```
React SPA (Azure Static Web Apps)  →  Go API (Azure Functions custom handler)
                                             ↓
                          Azure Key Vault (secrets) | Azure Blob Storage (system prompt) | Azure Table Storage (logs)
                                             ↓
                                       Anthropic API
```

- Frontend: `https://mhever.dev` — React + Vite, deployed via GitHub Actions → Azure Static Web Apps
- API: `https://mh-site-api.azurewebsites.net` — Go custom handler, deployed via Terraform + GitHub Actions
- Infra: Terraform in `infra/`, all Azure resources defined there

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/content.ts` | All site text — profile, experience, skills, certifications, chat suggestions |
| `system-prompt/system-prompt.md` | AI system prompt (gitignored; use `system-prompt.example.md` as template) |
| `frontend/.env.production` | `VITE_API_URL=https://mh-site-api.azurewebsites.net` — committed to git (not a secret) |
| `frontend/.env.development` | Empty `VITE_API_URL` — local dev uses Vite proxy to localhost:8080 |
| `infra/main.tf` | All Azure resources: Storage, Key Vault, Static Web App, Function App |
| `api/main.go` | Go HTTP server entry point, route registration |
| `api/middleware/cors.go` | CORS middleware — reads `CORS_ORIGIN` env var |

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev    # → http://localhost:5173
```

### API
```bash
cd api
cp .env.example .env   # add ANTHROPIC_API_KEY and SYSTEM_PROMPT_PATH
go run .               # → http://localhost:8080
```

## Deployment

Push to `main` → GitHub Actions runs both workflows:
- `deploy-frontend.yml` — builds Vite SPA, deploys to Azure Static Web Apps
- `deploy-api.yml` — builds Go binary, zips it, runs `terraform apply`

Manual deploy if needed: `./manual_deploy.sh`

API build command (for Terraform):
```bash
cd api && GOOS=linux GOARCH=amd64 go build -o handler . && zip -r deploy.zip handler host.json chat/ fit/ health/ adminlogs/
```

## CORS

Azure Functions platform handles OPTIONS preflight (configured via `cors` block in `infra/main.tf`).
Go middleware sets headers on actual responses using `CORS_ORIGIN=https://mhever.dev` env var.

## Rate Limiting

In-memory: 10 requests/IP/hour, 100 requests/day global (configurable via `RATE_LIMIT_PER_IP` and `RATE_LIMIT_GLOBAL`).

## Content Style Notes

- No em dashes (—) in `system-prompt.md` — use regular hyphens (-)
- System prompt tone: honest, specific, concise — never oversell skills, always acknowledge gaps
- `chatSuggestions` in `content.ts` should reflect the most interesting/differentiating stories
