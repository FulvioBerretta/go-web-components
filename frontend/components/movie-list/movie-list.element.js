import './movie-card.element.js';

class MovieList extends HTMLElement {
  _movies = [];
  shadow;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set movies(movies) {
    this._movies = movies;
    this.render();
  }

  get movies() {
    return this._movies;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        .list-container {
          /* space-y-6, but applied by gap in grid or margin on h1 */
          border: 1px solid black;
        }
        .list-title {
          font-size: 1.875rem; /* text-3xl */
          font-weight: bold;
          color: var(--highlight-color, #778DA9);
          margin-bottom: 32px; /* mb-8 */
        }
        .grid-container {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px; /* gap-6 */
        }
        @media (min-width: 640px) { /* sm: */
          .grid-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 768px) { /* md: */
          .grid-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) { /* lg: */
          .grid-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        .no-movies-message {
          color: var(--text-secondary-color, #B0B3B8);
        }
      </style>
      <div class="list-container">
        <h1 class="list-title">Discover Movies</h1>
        ${this._movies.length === 0 ? 
          `<p class="no-movies-message">No movies available at the moment.</p>` :
          `<div class="grid-container">
            ${this._movies.map(movie => `<movie-card data-movie-id="${movie.id}"></movie-card>`).join('')}
          </div>`
        }
      </div>
    `;

    this._movies.forEach(movie => {
      const card = this.shadow.querySelector(`movie-card[data-movie-id="${movie.id}"]`);
      if (card) {
        card.movie = movie;
      }
    });
  }
}

customElements.define('movie-list', MovieList);