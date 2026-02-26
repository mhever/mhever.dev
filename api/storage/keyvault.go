package storage

import (
	"fmt"
)

// GetSecret retrieves a secret from Azure Key Vault.
// In local development, use environment variables instead.
func GetSecret(vaultURL string, secretName string) (string, error) {
	// TODO: Implement Azure Key Vault integration
	// cred, err := azidentity.NewDefaultAzureCredential(nil)
	// if err != nil {
	//     return "", fmt.Errorf("create credential: %w", err)
	// }
	//
	// client, err := azsecrets.NewClient(vaultURL, cred, nil)
	// if err != nil {
	//     return "", fmt.Errorf("create KV client: %w", err)
	// }
	//
	// resp, err := client.GetSecret(context.Background(), secretName, "", nil)
	// if err != nil {
	//     return "", fmt.Errorf("get secret %s: %w", secretName, err)
	// }
	//
	// return *resp.Value, nil

	return "", fmt.Errorf("Key Vault not yet implemented — set environment variables for local dev")
}
