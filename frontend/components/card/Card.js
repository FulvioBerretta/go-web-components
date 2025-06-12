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

        this.innerHTML = `
            <div class="card-title">${title}</div>
            <div class="release-date">Release Date: ${releaseDate}</div>
            <div class="genre">Genre: ${genre}</div>
        `;
    }

}
customElements.define("mn-card", Card);