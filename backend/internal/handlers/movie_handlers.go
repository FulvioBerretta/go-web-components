package handlers

import (
	"encoding/json"
	"log"
	"main/internal/models"
	"main/internal/repository"
	"net/http"
	"strconv"
)

func CreateMovieHandler(movieRepo *repository.MovieRepository) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		var movie models.Movie
		err := json.NewDecoder(r.Body).Decode(&movie)
		if err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
			return
		}

		if movie.Title == "" {
			http.Error(w, "'title' must not be null or empty", http.StatusBadRequest)
			return
		}

		if movie.ReleaseDate == "" {
			http.Error(w, "'release date' must not be null or empty", http.StatusBadRequest)
			return
		}

		err = movieRepo.Create(&movie)
		if err != nil {
			http.Error(w, "Failed to create Movie", http.StatusInternalServerError)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(movie)

	}

}

func GetMovieHandler(movieRepo *repository.MovieRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		}
		retrieved, err := movieRepo.GetByID(id)
		if err != nil {
			http.Error(w, "Failed to get Movie", http.StatusInternalServerError)
			return
		}
		if retrieved == nil {
			http.Error(w, "Movie not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(retrieved)

	}
}

func DeleteMovieHandler(movieRepo *repository.MovieRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid request body: "+err.Error(), http.StatusBadRequest)
		}

		deleted, err := movieRepo.Delete(id)
		if err != nil {
			http.Error(w, "Failed to delete Movie", http.StatusInternalServerError)
		}

		if !deleted {
			http.Error(w, "Failed to delete Movie", http.StatusNotFound)
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNoContent)
	}
}

func SearchMoviesHandler(movieRepo *repository.MovieRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query().Get("q")

		log.Printf("Received search query: %s", query)

		limitStr := r.URL.Query().Get("limit")
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit <= 0 { // Se c'è un errore o il limite è non valido, imposta un default
			limit = 20 // Valore di default per il limite di risultati
		}

		offsetStr := r.URL.Query().Get("offset")
		offset, err := strconv.Atoi(offsetStr)
		if err != nil || offset < 0 { // Se c'è un errore o l'offset è non valido, imposta un default
			offset = 0 // Valore di default per l'offset (inizio)
		}

		foundMovies, err := movieRepo.SearchMoviesByTitle(query, limit, offset)
		if err != nil {
			http.Error(w, "Failed to search movies: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(foundMovies)
	}
}
