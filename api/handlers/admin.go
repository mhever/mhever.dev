package handlers

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
	"strings"
)

type adminLogsResponse struct {
	Logs []logEntryJSON `json:"logs"`
}

type logEntryJSON struct {
	Timestamp string `json:"timestamp"`
	IP        string `json:"ip"`
	Endpoint  string `json:"endpoint"`
	Question  string `json:"question"`
	Response  string `json:"response"`
	UserAgent string `json:"userAgent"`
}

func (d *Deps) HandleAdminLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if d.AdminPassword == "" {
		http.Error(w, "Admin disabled", http.StatusServiceUnavailable)
		return
	}

	// Check authorization - constant-time compare prevents timing attacks
	auth := r.Header.Get("Authorization")
	token := strings.TrimPrefix(auth, "Bearer ")
	if token == "" || subtle.ConstantTimeCompare([]byte(token), []byte(d.AdminPassword)) != 1 {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Fetch logs
	entries := d.Logger.GetAll()

	logs := make([]logEntryJSON, len(entries))
	for i, e := range entries {
		logs[i] = logEntryJSON{
			Timestamp: e.Timestamp.Format("2006-01-02T15:04:05Z"),
			IP:        e.IP,
			Endpoint:  e.Endpoint,
			Question:  e.Question,
			Response:  e.Response,
			UserAgent: e.UserAgent,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(adminLogsResponse{Logs: logs})
}
