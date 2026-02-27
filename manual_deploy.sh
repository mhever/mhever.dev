#!/bin/bash
# deploy.sh — Manual deployment commands
set -e

TOKEN=$(terraform -chdir=infra output -raw static_web_app_api_key)

echo "=== Deploying frontend ==="
cd frontend
npm run build
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token "$TOKEN" \
  --env production
cd ..

echo "=== Uploading system prompt ==="
az storage blob upload \
  --account-name mhsitestore \
  --container-name config \
  --name system-prompt.md \
  --file system-prompt/system-prompt.md \
  --overwrite

echo "=== Done ==="
