package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"main/internal/models"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type MovieRepository struct {
	db *sql.DB
}

func NewMovieRepository(dbPath string) (*MovieRepository, error) {
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
	CREATE TABLE IF NOT EXISTS movies (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT NOT NULL UNIQUE,
		length TEXT NOT NULL,
	    genre TEXT NOT NULL,
	    release_date TEXT
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		db.Close() // Close connection if table creation fails
		return nil, fmt.Errorf("failed to create movies table: %w", err)
	}

	return &MovieRepository{db: db}, nil
}

// Close closes the database connection.
func (r *MovieRepository) Close() error {
	return r.db.Close()
}

func (r *MovieRepository) Create(movie *models.Movie) error {
	stmt, err := r.db.Prepare("INSERT INTO movies(title, genre, length, release_date) VALUES(?, ?, ?, ?)")
	if err != nil {
		return fmt.Errorf("failed to prepare insert statement: %w", err)
	}
	defer stmt.Close()

	result, err := stmt.Exec(movie.Title, movie.Genre, movie.Length, movie.ReleaseDate)
	if err != nil {
		return fmt.Errorf("failed to insert movie: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("failed to retrieve last insert ID: %w", err)
	}
	movie.ID = int(id) // Assign the auto-generated ID

	return nil
}

func (r *MovieRepository) GetByID(id int) (*models.Movie, error) {
	var movie models.Movie
	// Corretto: Seleziona tutti i campi che il modello Movie ha
	row := r.db.QueryRow("SELECT id, title, length, genre, release_date FROM movies WHERE id = ?", id)
	// Corretto: Scansiona tutti i campi nel modello Movie
	err := row.Scan(&movie.ID, &movie.Title, &movie.Length, &movie.Genre, &movie.ReleaseDate)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to scan movie row: %w", err) // Corretto: "user" a "movie"
	}
	return &movie, nil
}

func (r *MovieRepository) Delete(id int) (bool, error) {
	result, err := r.db.Exec("DELETE FROM movies WHERE id = ?", id)
	if err != nil {
		return false, fmt.Errorf("failed to delete movie: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("failed to check rows affected: %w", err)
	}

	return rowsAffected > 0, nil
}

func (r *MovieRepository) SearchMoviesByTitle(query string) ([]models.Movie, error) {
	// DEBUG: Logga la query SQL e gli argomenti
	fmt.Printf("Inside SearchMoviesByTitle query: %s", query)
	var sqlQuery string
	var args []interface{}

	if query == "" {
		sqlQuery = `SELECT id, title, length, genre, release_date FROM movies`
	} else {
		sqlQuery = `SELECT id, title, length, genre, release_date FROM movies WHERE lower(title) LIKE ?`
		args = append(args, "%"+strings.ToLower(query)+"%")
	}

	// DEBUG: Logga la query SQL e gli argomenti
	fmt.Printf("Executing SQL query: %s with args: %v\n", sqlQuery, args)

	rows, err := r.db.Query(sqlQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying movies: %w", err)
	}
	defer rows.Close()

	// Corretto: INIZIALIZZA LA SLICE COME VUOTA MA NON NIL
	var movies []models.Movie = make([]models.Movie, 0)

	for rows.Next() {
		var movie models.Movie
		err := rows.Scan(&movie.ID, &movie.Title, &movie.Length, &movie.Genre, &movie.ReleaseDate)
		if err != nil {
			return nil, fmt.Errorf("error scanning movie row: %w", err)
		}
		movies = append(movies, movie)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error during rows iteration: %w", err)
	}

	return movies, nil // Ora restituirà [] (array vuoto) se non ci sono film
}
