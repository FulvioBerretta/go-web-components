package models

type Movie struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Genre       string `json:"genre"`
	Length      string `json:"length"`
	ReleaseDate string `json:"release_date"`
}
