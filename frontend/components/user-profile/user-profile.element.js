import '../movie-list/movie-card.element.js';
import { ArrowLeftIconSVG } from './icons.js';

class UserProfile extends HTMLElement {
  shadow;
  _users = [];
  _movies = [];
  _comments = [];
  _userId = null;
  
  _user = null;
  _commentedMovies = [];

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set users(value) { this._users = value; this.updateProfileData(); }
  get users() { return this._users; }
  set movies(value) { this._movies = value; this.updateProfileData(); }
  get movies() { return this._movies; }
  set comments(value) { this._comments = value; this.updateProfileData(); }
  get comments() { return this._comments; }
  set userId(value) { this._userId = value; this.updateProfileData(); }
  get userId() { return this._userId; }

  updateProfileData() {
    if (this._userId && this._users.length > 0 && this._movies.length > 0 && this._comments.length > 0) {
      this._user = this._users.find(u => u.id === this._userId) || null;
      if (this._user) {
        const userComments = this._comments.filter(comment => comment.userId === this._user.id);
        const commentedMovieIds = [...new Set(userComments.map(comment => comment.movieId))];
        this._commentedMovies = this._movies.filter(movie => commentedMovieIds.includes(movie.id));
      } else {
        this._commentedMovies = [];
      }
      this.render();
    }
  }

  connectedCallback() {
    this.updateProfileData();
  }

  render() {
    if (!this._user) {
      this.shadow.innerHTML = `
        <style>
          .loading-container { text-align: center; padding: 40px 0; }
          .loading-title { font-size: 1.5rem; color: var(--text-secondary-color, #B0B3B8); }
          .back-link { color: var(--brand-color, #FFD700); text-decoration: underline; margin-top: 16px; display: inline-block; }
          .back-link:hover { text-decoration: none; }
        </style>
        <div class="loading-container">
          <h2 class="loading-title">User not found or loading...</h2>
          <a href="#/movies" class="back-link">Back to Movies</a>
        </div>
      `;
      return;
    }

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .page-container { display: flex; flex-direction: column; gap: 32px; /* space-y-8 */ }
        
        .back-to-list-link {
          display: inline-flex;
          align-items: center;
          color: var(--brand-color, #FFD700);
          margin-bottom: 24px; /* mb-6 */
          text-decoration: none;
        }
        .back-to-list-link:hover {
          color: var(--highlight-color, #778DA9);
        }
        .back-to-list-link svg {
          width: 20px; /* w-5 */
          height: 20px; /* h-5 */
          margin-right: 8px; /* mr-2 */
          stroke: currentColor;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 24px; /* space-x-6 */
          background-color: var(--secondary-color, #1B263B);
          padding: 24px; /* p-6 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); /* shadow-lg */
        }
        .profile-avatar {
          width: 96px; /* w-24 */
          height: 96px; /* h-24 */
          border-radius: 50%; /* rounded-full */
          border: 4px solid var(--brand-color, #FFD700);
        }
        .profile-name {
          font-size: 1.875rem; /* text-3xl */
          font-weight: bold;
          color: var(--highlight-color, #778DA9);
        }
        .profile-subtitle {
          color: var(--text-secondary-color, #B0B3B8);
        }

        .section-title {
          font-size: 1.5rem; /* text-2xl */
          font-weight: 600; /* font-semibold */
          color: var(--highlight-color, #778DA9);
          margin-bottom: 16px; /* mb-4 */
        }
        .no-comments-message {
          color: var(--text-secondary-color, #B0B3B8);
        }
        .movies-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 24px; /* gap-6 */
        }
        @media (min-width: 640px) { /* sm: */
          .movies-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 768px) { /* md: */
          .movies-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1024px) { /* lg: */
          .movies-grid { grid-template-columns: repeat(4, 1fr); }
        }
      </style>
      <div class="page-container">
        <div>
          <a href="#/movies" class="back-to-list-link">
            ${ArrowLeftIconSVG()}
            Back to Movie List
          </a>
        </div>
        <div class="profile-header">
          <img 
            src="${this._user.avatarUrl}" 
            alt="${this._user.name}" 
            class="profile-avatar" 
          />
          <div>
            <h1 class="profile-name">${this._user.name}</h1>
            <p class="profile-subtitle">Movie Enthusiast</p>
          </div>
        </div>

        <div>
          <h2 class="section-title">Movies Commented On</h2>
          ${this._commentedMovies.length === 0 ? 
            `<p class="no-comments-message">${this._user.name} hasn't commented on any movies yet.</p>` :
            `<div class="movies-grid">
              ${this._commentedMovies.map(movie => `<movie-card data-movie-id="${movie.id}"></movie-card>`).join('')}
            </div>`
          }
        </div>
      </div>
    `;

    this._commentedMovies.forEach(movie => {
      const card = this.shadow.querySelector(`movie-card[data-movie-id="${movie.id}"]`);
      if (card) {
        card.movie = movie;
      }
    });
  }
}

customElements.define('user-profile', UserProfile);