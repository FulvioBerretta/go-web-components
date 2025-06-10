package main

import (
	"fmt"
	_ "github.com/mattn/go-sqlite3" // SQLite driver for database/sql
	"log"
	"main/internal/repository"
	"main/internal/routes"
	"net/http"
)

func main() {

	userRepo, err := repository.NewUserRepository("./internal/db/tables/users.db")
	if err != nil {
		log.Fatalf("Failed to initialize user repository: %v", err)
	}
	defer userRepo.Close()

	movieRepo, err := repository.NewMovieRepository("./internal/db/tables/movies.db")
	if err != nil {
		log.Fatalf("Failed to initialize movie repository: %v", err)
	}
	defer movieRepo.Close() // Ensure movie database connection is closed

	mux := routes.NewRouter(userRepo, movieRepo)

	fmt.Println("Server starting on :8081")
	err = http.ListenAndServe(":8081", mux)
	if err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
