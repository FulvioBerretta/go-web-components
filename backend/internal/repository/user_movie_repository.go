package repository

import (
	"database/sql"
	"fmt"
	"main/internal/models"
)

type UserMovieRepository struct {
	db *sql.DB
}

func NewUserMovieRepository(dbPath string) (*UserMovieRepository, error) {
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
	CREATE TABLE IF NOT EXISTS user_movies (
		user_id INTEGER NOT NULL,
		movie_id INTEGER NOT NULL,
		PRIMARY KEY (user_id, movie_id),
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		db.Close() // Close connection if table creation fails
		return nil, fmt.Errorf("failed to create user_movies table: %w", err)
	}

	return &UserMovieRepository{db: db}, nil
}

// Close closes the database connection.
func (um *UserMovieRepository) Close() error {
	return um.db.Close()
}

func (um *UserMovieRepository) AddMovieToUser(userId, movieId int) error {
	_, err := um.db.Exec("INSERT INTO user_movies(user_id, movie_id) VALUES(?, ?)", userId, movieId)
	if err != nil {
		return fmt.Errorf("failed to associate movie to user: %w", err)
	}
	return nil
}

func (um *UserMovieRepository) RemoveMovieFromUser(userId, movieId int) error {
	result, err := um.db.Exec("DELETE FROM user_movies WHERE user_id = ? AND movie_id = ?", userId, movieId)
	if err != nil {
		return fmt.Errorf("failed to remove movie from user: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to retrieve affected rows: %w", err)
	}
	if rowsAffected != 1 {
		return fmt.Errorf("no association found to delete for user_id=%d and movie_id=%d", userId, movieId)
	}
	return nil
}

func (um *UserMovieRepository) GetMoviesByUser(userId int) ([]models.Movie, error) {
	query := `
	SELECT m.id, m.title, m.release_date 
	FROM movies m
	INNER JOIN user_movies um ON m.id = um.movie_id
	WHERE um.user_id = ?`

	rows, err := um.db.Query(query, userId)
	if err != nil {
		return nil, fmt.Errorf("failed to get movies by user: %w", err)
	}
	defer rows.Close()

	var movies []models.Movie
	for rows.Next() {
		var movie models.Movie
		err := rows.Scan(&movie.ID, &movie.Title, &movie.ReleaseDate)
		if err != nil {
			return nil, fmt.Errorf("failed to scan movie row: %w", err)
		}
		movies = append(movies, movie)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %w", err)
	}

	return movies, nil
}

func (um *UserMovieRepository) CheckUserHasMovie(userID, movieID int) (bool, error) {
	query := `SELECT COUNT(*) FROM user_movies WHERE user_id = ? AND movie_id = ?`
	var count int
	err := um.db.QueryRow(query, userID, movieID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check if user has movie: %w", err)
	}
	return count > 0, nil
}

func (r *MovieRepository) GetAllMovies() ([]models.Movie, error) {
	return r.SearchMoviesByTitle("", 10, 0)
}
