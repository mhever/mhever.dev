package middleware

import (
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

type RateLimiter struct {
	mu         sync.Mutex
	ipCounts   map[string][]time.Time
	globalCount []time.Time
	perIPLimit  int
	globalLimit int
}

func NewRateLimiter() *RateLimiter {
	perIP := 10
	global := 100

	if v := os.Getenv("RATE_LIMIT_PER_IP"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			perIP = n
		}
	}
	if v := os.Getenv("RATE_LIMIT_GLOBAL"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			global = n
		}
	}

	return &RateLimiter{
		ipCounts:    make(map[string][]time.Time),
		globalCount: make([]time.Time, 0),
		perIPLimit:  perIP,
		globalLimit: global,
	}
}

func (rl *RateLimiter) Limit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip := getClientIP(r)
		now := time.Now()
		hourAgo := now.Add(-1 * time.Hour)
		dayAgo := now.Add(-24 * time.Hour)

		rl.mu.Lock()

		// Clean and count per-IP (hourly window)
		rl.ipCounts[ip] = filterAfter(rl.ipCounts[ip], hourAgo)
		if len(rl.ipCounts[ip]) >= rl.perIPLimit {
			rl.mu.Unlock()
			http.Error(w, "Rate limit exceeded. Try again in a few minutes.", http.StatusTooManyRequests)
			return
		}

		// Clean and count global (daily window)
		rl.globalCount = filterAfter(rl.globalCount, dayAgo)
		if len(rl.globalCount) >= rl.globalLimit {
			rl.mu.Unlock()
			http.Error(w, "Service temporarily unavailable. Try again later.", http.StatusServiceUnavailable)
			return
		}

		// Record this request
		rl.ipCounts[ip] = append(rl.ipCounts[ip], now)
		rl.globalCount = append(rl.globalCount, now)

		rl.mu.Unlock()

		next(w, r)
	}
}

func filterAfter(times []time.Time, after time.Time) []time.Time {
	result := make([]time.Time, 0, len(times))
	for _, t := range times {
		if t.After(after) {
			result = append(result, t)
		}
	}
	return result
}

func getClientIP(r *http.Request) string {
	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		return ip
	}
	if ip := r.Header.Get("X-Real-IP"); ip != "" {
		return ip
	}
	return r.RemoteAddr
}
