package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/storage/azblob"
)

// LoadSystemPrompt loads the system prompt from a local file (dev)
// or Azure Blob Storage (production).
func LoadSystemPrompt() (string, error) {
	// Try local file first (development)
	localPath := os.Getenv("SYSTEM_PROMPT_PATH")
	if localPath != "" {
		data, err := os.ReadFile(localPath)
		if err != nil {
			return "", fmt.Errorf("read local system prompt %s: %w", localPath, err)
		}
		log.Printf("System prompt loaded from file: %s (%d bytes)", localPath, len(data))
		return string(data), nil
	}

	// Try Azure Blob Storage (production)
	account := os.Getenv("AZURE_STORAGE_ACCOUNT")
	if account != "" {
		return loadFromBlobStorage(account)
	}

	return "", fmt.Errorf("no system prompt source configured (set SYSTEM_PROMPT_PATH or AZURE_STORAGE_ACCOUNT)")
}

func loadFromBlobStorage(account string) (string, error) {
	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return "", fmt.Errorf("create credential: %w", err)
	}

	serviceURL := fmt.Sprintf("https://%s.blob.core.windows.net/", account)
	client, err := azblob.NewClient(serviceURL, cred, nil)
	if err != nil {
		return "", fmt.Errorf("create blob client: %w", err)
	}

	resp, err := client.DownloadStream(context.Background(), "config", "system-prompt.md", nil)
	if err != nil {
		return "", fmt.Errorf("download system prompt blob: %w", err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read blob data: %w", err)
	}

	log.Printf("System prompt loaded from Azure Blob Storage (%d bytes)", len(data))
	return string(data), nil
}
