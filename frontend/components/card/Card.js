class Card extends HTMLElement {

    /**
     * containing the names of all attributes for which the element needs change notifications
     * @type {String[]}
     */
    static observedAttributes = ['title', 'release-date', 'genre', 'duration'];

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || 'Untitled Movie';
        const releaseDate = this.getAttribute('release-date') || 'N/A';
        const genre = this.getAttribute('genre') || 'Unknown Genre';
        const duration = this.getAttribute('duration') || 'N/A';

        // URL dell'immagine placeholder migliorato: userà il titolo come testo
        const placeholderImageUrl = `https://placehold.co/100x100/e0e0e0/333333?text=${encodeURIComponent(title.substring(0,15))}`; // Limita a 15 caratteri per leggibilità

        this.innerHTML = `
            <div class="movie-card centered">
                <img src="${placeholderImageUrl}" alt="Poster for ${title}" class="card-image">
                <div class="card-content">
                    <div class="card-title">${title}</div>
                </div>
                <button class="button-small">
                    Add to Favorites
                </button>
            </div>
        `;
    }

}
customElements.define("mn-card", Card);