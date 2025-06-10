class MovieCard extends HTMLElement {
  _movie = null;
  shadow;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set movie(movie) {
    this._movie = movie;
    this.render();
  }

  get movie() {
    return this._movie;
  }
  
  connectedCallback() {
    if (this._movie) {
        this.render();
    }
  }

  render() {
    if (!this._movie) {
      this.shadow.innerHTML = `
        <style>
          .loading-message {
            padding: 16px; /* p-4 */
            color: var(--text-secondary-color, #B0B3B8);
          }
        </style>
        <div class="loading-message">Loading movie...</div>`;
      return;
    }
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block; /* Ensures the <a> tag behaves as a block */
        }
        .card-link {
          display: block;
          background-color: var(--secondary-color, #1B263B);
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-xl */
          overflow: hidden;
          transition: box-shadow 0.3s ease-in-out;
          text-decoration: none;
          color: inherit;
        }
        .card-link:hover {
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); /* shadow-2xl */
        }
        .card-image {
          width: 100%;
          height: 384px; /* h-96 */
          object-fit: cover;
          transition: transform 0.3s ease-in-out;
        }
        .card-link:hover .card-image {
          transform: scale(1.05);
        }
        .card-content {
          padding: 16px; /* p-4 */
        }
        .card-title {
          font-size: 1.25rem; /* text-xl */
          font-weight: 600; /* font-semibold */
          color: var(--text-main-color, #E0E1DD);
          margin-bottom: 4px; /* mb-1 */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-link:hover .card-title {
          color: var(--brand-color, #FFD700);
        }
        .card-year {
          font-size: 0.875rem; /* text-sm */
          color: var(--text-secondary-color, #B0B3B8);
        }
      </style>
      <a href="#/movie/${this._movie.id}" class="card-link">
        <img 
          src="${this._movie.posterUrl}" 
          alt="${this._movie.title} Poster" 
          class="card-image" 
        />
        <div class="card-content">
          <h3 class="card-title">${this._movie.title}</h3>
          <p class="card-year">${this._movie.year}</p>
        </div>
      </a>
    `;
  }
}

customElements.define('movie-card', MovieCard);