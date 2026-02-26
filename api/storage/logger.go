package storage

import (
	"log"
	"os"
	"sync"
	"time"
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
	mu      sync.Mutex
	entries []LogEntry
	// TODO: Add Azure Table Storage client for production
	// tableClient *aztables.Client
	useAzure bool
}

func NewLogger() *Logger {
	useAzure := os.Getenv("AZURE_STORAGE_ACCOUNT") != ""

	if useAzure {
		log.Println("Logger: Using Azure Table Storage")
		// TODO: Initialize Azure Table Storage client
		// account := os.Getenv("AZURE_STORAGE_ACCOUNT")
		// key := os.Getenv("AZURE_STORAGE_KEY")
		// tableName := os.Getenv("AZURE_TABLE_NAME")
		// serviceURL := fmt.Sprintf("https://%s.table.core.windows.net", account)
		// cred, _ := aztables.NewSharedKeyCredential(account, key)
		// client, _ := aztables.NewClientWithSharedKey(serviceURL, tableName, cred, nil)
	} else {
		log.Println("Logger: Using in-memory storage (local dev)")
	}

	return &Logger{
		entries:  make([]LogEntry, 0),
		useAzure: useAzure,
	}
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
		// TODO: Write to Azure Table Storage
		// entity := aztables.EDMEntity{
		//     Entity: aztables.Entity{
		//         PartitionKey: entry.Timestamp.Format("2006-01-02"),
		//         RowKey:       entry.Timestamp.Format("150405.000") + "-" + entry.IP,
		//     },
		//     Properties: map[string]interface{}{
		//         "IP":        entry.IP,
		//         "Endpoint":  entry.Endpoint,
		//         "Question":  entry.Question,
		//         "Response":  entry.Response,
		//         "UserAgent": entry.UserAgent,
		//     },
		// }
		// marshal, _ := json.Marshal(entity)
		// l.tableClient.AddEntity(context.Background(), marshal, nil)
	}

	// Always keep in memory too (for simplicity in admin endpoint)
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
