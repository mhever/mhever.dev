#!/bin/bash
set -e
TOKEN=$(terraform -chdir=infra output -raw static_web_app_api_key)

echo "=== Waiting for Azure to catch up ==="
sleep 60

echo "=== Uploading system prompt ==="
az storage blob upload \
  --account-name mhsitestore \
  --container-name config \
  --name system-prompt.md \
  --file system-prompt/system-prompt.md \
  --overwrite

echo "=== Deploying API ==="
cd api
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o handler .
zip -r deploy.zip handler host.json chat/ fit/ health/ adminlogs/
az functionapp deployment source config-zip \
  --resource-group rg-mh-site --name mh-site-api --src deploy.zip
rm -f handler deploy.zip
cd ..

echo "=== Deploying frontend ==="
cd frontend
npm run build
npx @azure/static-web-apps-cli deploy -y ./dist \
  --deployment-token "$TOKEN" \
  --env production
cd ..

echo "=== Done ==="
