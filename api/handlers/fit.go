package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/mhever/mhever.dev/api/storage"
)

type fitRequest struct {
	JobDescription string `json:"jobDescription"`
}

type fitResponse struct {
	Score    string `json:"score"`
	Analysis string `json:"analysis"`
}

const fitPromptPrefix = `You are evaluating whether Marton Hever is a good fit for a specific role.
Based on the system context about Marton's background, analyze the job description and provide:

1. A fit score: "strong", "moderate", or "weak"
2. An honest analysis covering:
   - What matches well from Marton's background
   - What gaps exist
   - A clear recommendation

Be honest. If the role requires skills Marton doesn't have (like production Kubernetes, AWS, 
people management, or consumer product experience), say so directly. Do not oversell.

If the fit is weak, explain what DOES transfer and suggest what kind of role would be a better match.

Start your response with exactly one of these on the first line:
SCORE:strong
SCORE:moderate
SCORE:weak

Then provide your analysis on the following lines.`

func (d *Deps) HandleFit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 64*1024)

	var req fitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.JobDescription) > 8000 {
		http.Error(w, "Job description too long (max 8000 chars)", http.StatusBadRequest)
		return
	}

	if len(req.JobDescription) < 50 {
		http.Error(w, "Job description too short", http.StatusBadRequest)
		return
	}

	// Build the fit assessment prompt
	userMessage := fmt.Sprintf("Analyze this job description for fit:\n\n%s", req.JobDescription)

	messages := []chatMessage{
		{Role: "user", Content: userMessage},
	}

	// Use system prompt + fit prefix
	fullSystem := d.SystemPrompt + "\n\n" + fitPromptPrefix

	response, err := d.callAnthropic(fullSystem, messages)

	if err != nil {
		d.Logger.Log(storage.LogEntry{
			Timestamp: time.Now().UTC(),
			IP:        getIP(r),
			Endpoint:  "/api/fit",
			Question:  truncateForLog(req.JobDescription, 500),
			Response:  fmt.Sprintf("ERROR: %v", err),
			UserAgent: r.UserAgent(),
		})
		http.Error(w, "AI service error", http.StatusBadGateway)
		return
	}

	// Parse score from response
	score := "moderate" // default
	analysis := response

	lines := strings.SplitN(response, "\n", 2)
	if len(lines) >= 2 {
		scoreLine := strings.TrimSpace(lines[0])
		if strings.HasPrefix(scoreLine, "SCORE:") {
			score = strings.TrimPrefix(scoreLine, "SCORE:")
			analysis = strings.TrimSpace(lines[1])
		}
	}

	// Validate score
	if score != "strong" && score != "moderate" && score != "weak" {
		score = "moderate"
	}

	// Log the interaction
	d.Logger.Log(storage.LogEntry{
		Timestamp: time.Now().UTC(),
		IP:        getIP(r),
		Endpoint:  "/api/fit",
		Question:  truncateForLog(req.JobDescription, 500),
		Response:  fmt.Sprintf("[%s] %s", score, truncateForLog(analysis, 500)),
		UserAgent: r.UserAgent(),
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fitResponse{
		Score:    score,
		Analysis: analysis,
	})
}

func truncateForLog(s string, max int) string {
	if len(s) > max {
		return s[:max] + "..."
	}
	return s
}
