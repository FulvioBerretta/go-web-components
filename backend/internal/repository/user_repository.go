package repository

import (
	"database/sql"
	"fmt"
	"main/internal/models"
)

// UserRepository handles database operations for User objects.
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new UserRepository instance and initializes the database.
func NewUserRepository(dbPath string) (*UserRepository, error) {
	fmt.Println("NewUserRepository")
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		db.Close() // Close connection if ping fails
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// SQL statement to create the users table if it doesn't exist.
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		db.Close() // Close connection if table creation fails
		return nil, fmt.Errorf("failed to create users table: %w", err)
	}

	return &UserRepository{db: db}, nil
}

// Close closes the database connection.
func (r *UserRepository) Close() error {
	return r.db.Close()
}

func (r *UserRepository) Create(user *models.User) error {
	stmt, err := r.db.Prepare("INSERT INTO users(username, password) VALUES(?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer stmt.Close()

	result, err := stmt.Exec(user.Username, user.Password)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to retrieve last insert ID: %w", err)
	}
	user.ID = int(id) // Assign the auto-generated ID

	return nil
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	var user models.User
	row := r.db.QueryRow("SELECT id, username, password FROM users WHERE id = ?", id)
	err := row.Scan(&user.ID, &user.Username, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, fmt.Errorf("failed to scan user row: %w", err)
	}
	return &user, nil
}

func (r *UserRepository) Delete(id int) (bool, error) {
	result, err := r.db.Exec("DELETE FROM users WHERE id = ?", id)
	if err != nil {
		return false, fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("failed to check rows affected: %w", err)
	}

	return rowsAffected > 0, nil // Return true if a user was deleted, false otherwise
}
