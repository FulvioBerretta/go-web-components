package routes

import (
	"main/internal/handlers"
	"main/internal/repository"
	"net/http"
)

// RegisterUserRoutes registers all user-related routes with the given mux.
func RegisterUserRoutes(mux *http.ServeMux, userRepo *repository.UserRepository) {
	// User Routes
	mux.HandleFunc("POST /users", handlers.CreateUserHandler(userRepo))
	mux.HandleFunc("GET /users/{id}", handlers.GetUserHandler(userRepo))
	mux.HandleFunc("DELETE /users/{id}", handlers.DeleteUserHandler(userRepo))
}
