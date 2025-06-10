package routes

import (
	"main/internal/repository"
	"net/http"
)

// NewMux creates and configures a new http.ServeMux with all application routes.
// It takes the necessary repositories as arguments to inject them into the handlers.
func NewRouter(userRepo *repository.UserRepository, movieRepo *repository.MovieRepository) *http.ServeMux {
	mux := http.NewServeMux()

	// Simple root handler (can remain here or be moved to a separate handlers file if more complex)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World! User and Movie API with SQLite is running."))
	})

	// Register User Routes
	RegisterUserRoutes(mux, userRepo)

	// Register Movie Routes
	RegisterMovieRoutes(mux, movieRepo)

	return mux
}
