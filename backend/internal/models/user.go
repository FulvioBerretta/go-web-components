package models

// User represents a user with an ID, username, and password.
// The `json:"id"` tags are used by the JSON encoder/decoder.
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"` // IMPORTANT: In a real application, always hash passwords!
}
