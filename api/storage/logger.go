package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/data/aztables"
)

type LogEntry struct {
	Timestamp time.Time
	IP        string
	Endpoint  string
	Question  string
	Response  string
	UserAgent string
}

// Logger handles log storage. Uses in-memory storage locally,
// Azure Table Storage in production.
type Logger struct {
	mu          sync.Mutex
	entries     []LogEntry
	tableClient *aztables.Client
	useAzure    bool
}

func NewLogger() *Logger {
	account := os.Getenv("AZURE_STORAGE_ACCOUNT")
	if account == "" {
		log.Println("Logger: Using in-memory storage (local dev)")
		return &Logger{entries: make([]LogEntry, 0)}
	}

	log.Println("Logger: Initializing Azure Table Storage")

	cred, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		log.Fatalf("Logger: create credential: %v", err)
	}

	tableName := os.Getenv("AZURE_TABLE_NAME")
	if tableName == "" {
		tableName = "usagelogs"
	}

	serviceURL := fmt.Sprintf("https://%s.table.core.windows.net/", account)
	serviceClient, err := aztables.NewServiceClient(serviceURL, cred, nil)
	if err != nil {
		log.Fatalf("Logger: create Table Storage service client: %v", err)
	}

	tableClient := serviceClient.NewClient(tableName)
	log.Printf("Logger: Using Azure Table Storage (account=%s, table=%s)", account, tableName)

	return &Logger{
		entries:     make([]LogEntry, 0),
		tableClient: tableClient,
		useAzure:    true,
	}
}

// tableEntity is the JSON shape written to Azure Table Storage.
type tableEntity struct {
	PartitionKey string `json:"PartitionKey"`
	RowKey       string `json:"RowKey"`
	IP           string `json:"IP"`
	Endpoint     string `json:"Endpoint"`
	Question     string `json:"Question"`
	Response     string `json:"Response"`
	UserAgent    string `json:"UserAgent"`
}

func (l *Logger) Log(entry LogEntry) {
	l.mu.Lock()
	defer l.mu.Unlock()

	// Always log to stdout
	log.Printf("[%s] %s %s | Q: %.80s | A: %.80s",
		entry.Timestamp.Format("15:04:05"),
		entry.IP,
		entry.Endpoint,
		entry.Question,
		entry.Response,
	)

	if l.useAzure {
		entity := tableEntity{
			PartitionKey: entry.Timestamp.Format("2006-01-02"),
			RowKey:       fmt.Sprintf("%d", entry.Timestamp.UnixNano()),
			IP:           entry.IP,
			Endpoint:     entry.Endpoint,
			Question:     entry.Question,
			Response:     entry.Response,
			UserAgent:    entry.UserAgent,
		}
		data, err := json.Marshal(entity)
		if err == nil {
			if _, err := l.tableClient.AddEntity(context.Background(), data, nil); err != nil {
				log.Printf("Logger: failed to write to Table Storage: %v", err)
			}
		}
	}

	// Always keep in memory too (for admin endpoint)
	l.entries = append(l.entries, entry)

	// Cap in-memory storage at 1000 entries
	if len(l.entries) > 1000 {
		l.entries = l.entries[len(l.entries)-1000:]
	}
}

func (l *Logger) GetAll() []LogEntry {
	l.mu.Lock()
	defer l.mu.Unlock()

	// Return newest first
	result := make([]LogEntry, len(l.entries))
	for i, e := range l.entries {
		result[len(l.entries)-1-i] = e
	}
	return result
}
