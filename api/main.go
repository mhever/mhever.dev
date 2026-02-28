package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/martonhever/marton-hever.dev/api/handlers"
	"github.com/martonhever/marton-hever.dev/api/middleware"
	"github.com/martonhever/marton-hever.dev/api/storage"
)

// loadDotEnv reads key=value pairs from .env and sets them as environment
// variables, skipping any key that is already set. Silently does nothing if
// the file does not exist.
func loadDotEnv() {
	f, err := os.Open(".env")
	if err != nil {
		return // file doesn't exist or isn't readable — not an error
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.TrimSpace(value)
		// Strip optional surrounding quotes
		if len(value) >= 2 && value[0] == '"' && value[len(value)-1] == '"' {
			value = value[1 : len(value)-1]
		} else if len(value) >= 2 && value[0] == '\'' && value[len(value)-1] == '\'' {
			value = value[1 : len(value)-1]
		}
		if os.Getenv(key) == "" {
			os.Setenv(key, value)
		}
	}
}

func main() {
	loadDotEnv()

	// Azure Functions custom handler uses FUNCTIONS_CUSTOMHANDLER_PORT;
	// fall back to PORT, then 8080 for local development.
	port := os.Getenv("FUNCTIONS_CUSTOMHANDLER_PORT")
	if port == "" {
		port = os.Getenv("PORT")
	}
	if port == "" {
		port = "8080"
	}

	// Initialize storage backend (Azure Table Storage in prod, in-memory locally)
	logger := storage.NewLogger()

	// Load system prompt (Azure Blob in prod, local file in dev)
	prompt, err := storage.LoadSystemPrompt()
	if err != nil {
		log.Fatalf("Failed to load system prompt: %v", err)
	}

	// Load API key (Azure Key Vault in prod, env var locally)
	apiKey := os.Getenv("ANTHROPIC_API_KEY")
	if apiKey == "" {
		vaultURL := os.Getenv("KEY_VAULT_URL")
		if vaultURL != "" {
			var kvErr error
			apiKey, kvErr = storage.GetSecret(vaultURL, "anthropic-api-key")
			if kvErr != nil {
				log.Fatalf("Failed to get API key from Key Vault: %v", kvErr)
			}
		} else {
			log.Fatal("ANTHROPIC_API_KEY not set and KEY_VAULT_URL not configured")
		}
	}

	// Load admin password
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		vaultURL := os.Getenv("KEY_VAULT_URL")
		if vaultURL != "" {
			adminPassword, _ = storage.GetSecret(vaultURL, "admin-password")
		}
	}
	if adminPassword == "" {
		log.Println("WARNING: ADMIN_PASSWORD not set, admin endpoint disabled")
	}

	// Rate limiter
	limiter := middleware.NewRateLimiter()

	// Create handler dependencies
	deps := &handlers.Deps{
		APIKey:        apiKey,
		SystemPrompt:  prompt,
		AdminPassword: adminPassword,
		Logger:        logger,
	}

	// Routes
	mux := http.NewServeMux()
	mux.HandleFunc("/api/chat", chain(deps.HandleChat, middleware.SecurityHeaders, limiter.Limit, middleware.CORS))
	mux.HandleFunc("/api/fit", chain(deps.HandleFit, middleware.SecurityHeaders, limiter.Limit, middleware.CORS))
	mux.HandleFunc("/api/admin/logs", chain(deps.HandleAdminLogs, middleware.SecurityHeaders, middleware.CORS))
	mux.HandleFunc("/api/health", chain(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	}, middleware.SecurityHeaders))

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("API server starting on :%s", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

// chain applies middleware in order: last middleware wraps first
func chain(handler http.HandlerFunc, middlewares ...func(http.HandlerFunc) http.HandlerFunc) http.HandlerFunc {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}
