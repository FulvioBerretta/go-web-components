package routes

import (
	"main/internal/handlers"
	"main/internal/repository"
	"net/http"
)

// RegisterMovieRoutes registers all movie-related routes with the given mux.
func RegisterMovieRoutes(mux *http.ServeMux, movieRepo *repository.MovieRepository) {
	// Movie Routes
	mux.HandleFunc("POST /movies", handlers.CreateMovieHandler(movieRepo))
	mux.HandleFunc("GET /movies/{id}", handlers.GetMovieHandler(movieRepo))
	mux.HandleFunc("DELETE /movies/{id}", handlers.DeleteMovieHandler(movieRepo))
	// User:Movie routes
	//mux.HandleFunc("GET /users/{id}/movies", handlers.GetMoviesByUserIdHandler(movieRepo))
}
