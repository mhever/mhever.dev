package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/martonhever/marton-hever.dev/api/storage"
)

type Deps struct {
	APIKey        string
	SystemPrompt  string
	AdminPassword string
	Logger        *storage.Logger
}

type chatRequest struct {
	Messages []chatMessage `json:"messages"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatResponse struct {
	Response string `json:"response"`
}

type anthropicRequest struct {
	Model     string        `json:"model"`
	MaxTokens int           `json:"max_tokens"`
	System    string        `json:"system"`
	Messages  []chatMessage `json:"messages"`
}

type anthropicResponse struct {
	Content []struct {
		Text string `json:"text"`
	} `json:"content"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (d *Deps) HandleChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req chatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate message count to prevent abuse
	if len(req.Messages) > 20 {
		http.Error(w, "Too many messages in conversation", http.StatusBadRequest)
		return
	}

	// Validate individual message length
	for _, msg := range req.Messages {
		if len(msg.Content) > 2000 {
			http.Error(w, "Message too long (max 2000 chars)", http.StatusBadRequest)
			return
		}
	}

	// Call Anthropic API
	response, err := d.callAnthropic(req.Messages)
	if err != nil {
		// Log the error
		d.Logger.Log(storage.LogEntry{
			Timestamp: time.Now().UTC(),
			IP:        getIP(r),
			Endpoint:  "/api/chat",
			Question:  lastUserMessage(req.Messages),
			Response:  fmt.Sprintf("ERROR: %v", err),
			UserAgent: r.UserAgent(),
		})
		http.Error(w, "AI service error", http.StatusBadGateway)
		return
	}

	// Log successful interaction
	d.Logger.Log(storage.LogEntry{
		Timestamp: time.Now().UTC(),
		IP:        getIP(r),
		Endpoint:  "/api/chat",
		Question:  lastUserMessage(req.Messages),
		Response:  response,
		UserAgent: r.UserAgent(),
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chatResponse{Response: response})
}

func (d *Deps) callAnthropic(messages []chatMessage) (string, error) {
	body := anthropicRequest{
		Model:     "claude-haiku-4-5-20251001",
		MaxTokens: 1024,
		System:    d.SystemPrompt,
		Messages:  messages,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.anthropic.com/v1/messages", bytes.NewReader(jsonBody))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", d.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("API call failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("API returned %d: %s", resp.StatusCode, string(respBody))
	}

	var apiResp anthropicResponse
	if err := json.Unmarshal(respBody, &apiResp); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	if apiResp.Error != nil {
		return "", fmt.Errorf("API error: %s", apiResp.Error.Message)
	}

	if len(apiResp.Content) == 0 {
		return "", fmt.Errorf("empty response from API")
	}

	return apiResp.Content[0].Text, nil
}

func lastUserMessage(messages []chatMessage) string {
	for i := len(messages) - 1; i >= 0; i-- {
		if messages[i].Role == "user" {
			return messages[i].Content
		}
	}
	return ""
}

func getIP(r *http.Request) string {
	// Check common proxy headers
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}
