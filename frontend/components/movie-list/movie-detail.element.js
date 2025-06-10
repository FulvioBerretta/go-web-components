import { fetchDiscussionPoints } from '../services/geminiService.js';
import { ArrowLeftIconSVG } from './icons.js';
import '../comment-section/comment-section.element.js';
import '../comment-section/comment-form.element.js';
import './gemini-insights.element.js';
import '../loading-spinner.element.js';
import '../alert-message.element.js';

class MovieDetail extends HTMLElement {
  shadow;
  _movies = [];
  _users = [];
  _comments = [];
  _currentUser = null;
  _movieId = null;
  
  _movie = null;
  _geminiInsights = [];
  _isLoadingInsights = false;
  _errorInsights = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set movies(value) { this._movies = value; this.updateMovie(); }
  get movies() { return this._movies; }
  set users(value) { this._users = value; this.render(); }
  get users() { return this._users; }
  set comments(value) { this._comments = value; this.render(); }
  get comments() { return this._comments; }
  set currentUser(value) { this._currentUser = value; this.render(); }
  get currentUser() { return this._currentUser; }
  set movieId(value) { this._movieId = value; this.updateMovie(); }
  get movieId() { return this._movieId; }

  async updateMovie() {
    if (this._movieId && this._movies.length > 0) {
      this._movie = this._movies.find(m => m.id === this._movieId) || null;
      if (this._movie) {
        await this.loadGeminiInsights();
      }
      this.render();
    }
  }

  async loadGeminiInsights() {
    if (this._movie && process.env.API_KEY) {
      this._isLoadingInsights = true;
      this._errorInsights = null;
      this.render(); 
      try {
        const points = await fetchDiscussionPoints(this._movie.title, this._movie.description);
        this._geminiInsights = points;
      } catch (error) {
        console.error("Failed to fetch Gemini insights:", error);
        this._errorInsights = "Failed to load AI discussion points. Please try again later.";
      } finally {
        this._isLoadingInsights = false;
        this.render(); 
      }
    } else if (this._movie && !process.env.API_KEY) {
      this._errorInsights = "AI features are disabled. API key is missing.";
      this._geminiInsights = [];
      this._isLoadingInsights = false;
      this.render();
    }
  }
  
  connectedCallback() {
    this.updateMovie(); 
  }

  handleAddComment(text, parentCommentId) {
    if (!this._movie) return;
    this.dispatchEvent(new CustomEvent('add-comment', {
      bubbles: true,
      composed: true,
      detail: {
        movieId: this._movie.id,
        text,
        parentCommentId
      }
    }));
  }
  
  render() {
    if (!this._movie) {
      this.shadow.innerHTML = `
        <style>
          .loading-container { text-align: center; padding: 40px 0; }
          .loading-title { font-size: 1.5rem; color: var(--text-secondary-color, #B0B3B8); }
          .back-link { color: var(--brand-color, #FFD700); text-decoration: underline; margin-top: 16px; display: inline-block; }
          .back-link:hover { text-decoration: none; }
        </style>
        <div class="loading-container">
          <h2 class="loading-title">Movie not found or still loading...</h2>
          <a href="#/movies" class="back-link">Back to Movies</a>
        </div>
      `;
      return;
    }

    const movieComments = this._comments.filter(comment => comment.movieId === this._movie.id);

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .page-container { display: flex; flex-direction: column; gap: 32px; /* space-y-8 */ }
        
        .back-to-movies-link {
          display: inline-flex;
          align-items: center;
          color: var(--brand-color, #FFD700);
          margin-bottom: 24px; /* mb-6 */
          text-decoration: none;
        }
        .back-to-movies-link:hover {
          color: var(--highlight-color, #778DA9);
        }
        .back-to-movies-link svg {
          width: 20px; /* w-5 */
          height: 20px; /* h-5 */
          margin-right: 8px; /* mr-2 */
          stroke: currentColor;
        }

        .movie-info-layout {
          display: flex;
          flex-direction: column;
          gap: 32px; /* gap-8 */
        }
        @media (min-width: 768px) { /* md: */
          .movie-info-layout {
            flex-direction: row;
          }
        }
        
        .poster-container {
          flex-shrink: 0;
        }
        @media (min-width: 768px) { /* md: */
          .poster-container {
            width: 33.333333%; /* md:w-1/3 */
          }
        }
        .poster-image {
          width: 100%;
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-xl */
          object-fit: cover;
        }

        .details-container {
          display: flex;
          flex-direction: column;
          gap: 16px; /* space-y-4 */
        }
        @media (min-width: 768px) { /* md: */
          .details-container {
            width: 66.666667%; /* md:w-2/3 */
          }
        }
        .movie-title {
          font-size: 2.25rem; /* text-4xl */
          font-weight: bold;
          color: var(--highlight-color, #778DA9);
        }
        .movie-year {
          font-size: 1.5rem; /* text-2xl */
          color: var(--accent-color, #415A77);
        }
        .movie-description {
          color: var(--text-secondary-color, #B0B3B8);
          line-height: 1.6; /* leading-relaxed */
        }
        .imdb-link {
          display: inline-block;
          background-color: var(--brand-color, #FFD700);
          color: var(--primary-color, #0D1B2A); /* text-primary */
          padding: 8px 16px; /* px-4 py-2 */
          border-radius: 0.375rem; /* rounded-md */
          font-weight: 600; /* font-semibold */
          text-decoration: none;
          transition: background-color 0.2s ease-in-out;
        }
        .imdb-link:hover {
          background-color: #e6c200; /* darker gold/yellow-400 */
        }

        .section-box {
          background-color: var(--secondary-color, #1B263B);
          padding: 24px; /* p-6 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); /* shadow-lg */
        }
        .section-title {
          font-size: 1.5rem; /* text-2xl */
          font-weight: 600; /* font-semibold */
          color: var(--highlight-color, #778DA9);
          margin-bottom: 16px; /* mb-4 or mb-6 */
        }
        .status-text {
            color: var(--text-secondary-color, #B0B3B8);
        }
      </style>
      <div class="page-container">
        <div>
          <a href="#/movies" class="back-to-movies-link">
            ${ArrowLeftIconSVG()}
            Back to Movies
          </a>
        </div>
        <div class="movie-info-layout">
          <div class="poster-container">
            <img 
              src="${this._movie.posterUrl}" 
              alt="${this._movie.title} Poster" 
              class="poster-image"
            />
          </div>
          <div class="details-container">
            <h1 class="movie-title">${this._movie.title} <span class="movie-year">(${this._movie.year})</span></h1>
            <p class="movie-description">${this._movie.description}</p>
            <a 
              href="https://www.imdb.com/title/${this._movie.imdbId}/" 
              target="_blank" 
              rel="noopener noreferrer"
              class="imdb-link"
            >
              View on IMDb
            </a>
          </div>
        </div>

        <div class="section-box">
          <h2 class="section-title">AI-Generated Discussion Starters</h2>
          ${this._isLoadingInsights ? `<loading-spinner message="Generating insights..."></loading-spinner>` : ''}
          ${this._errorInsights ? `<alert-message type="error" message="${this._errorInsights}"></alert-message>` : ''}
          ${!this._isLoadingInsights && !this._errorInsights && this._geminiInsights.length > 0 ? `<gemini-insights id="gemini-insights-component"></gemini-insights>` : ''}
          ${!this._isLoadingInsights && !this._errorInsights && this._geminiInsights.length === 0 && !process.env.API_KEY ? `<p class="status-text">AI discussion starters are unavailable because the API key is not configured.</p>` : ''}
          ${!this._isLoadingInsights && !this._errorInsights && this._geminiInsights.length === 0 && process.env.API_KEY && !this._movie ? `<p class="status-text">Could not load movie details to generate insights.</p>` : ''}
           ${!this._isLoadingInsights && !this._errorInsights && this._geminiInsights.length === 0 && process.env.API_KEY && this._movie && this._geminiInsights.length === 0 && !this._errorInsights ? `<p class="status-text">The AI couldn't formulate specific points, but what are your initial thoughts on the movie's meaning?</p>` : ''}
        </div>

        <div class="section-box">
          <h2 class="section-title" style="margin-bottom: 24px;">Discuss the Meaning</h2>
          <comment-form id="main-comment-form" submit-label="Post Comment"></comment-form>
          <comment-section id="comment-section-component"></comment-section>
        </div>
      </div>
    `;
    
    const geminiInsightsComponent = this.shadow.getElementById('gemini-insights-component');
    if (geminiInsightsComponent) {
      geminiInsightsComponent.points = this._geminiInsights;
    }

    const mainCommentForm = this.shadow.getElementById('main-comment-form');
    if (mainCommentForm && this._currentUser) {
      mainCommentForm.currentUserAvatar = this._currentUser.avatarUrl;
      mainCommentForm.onSubmit = (text) => this.handleAddComment(text);
    }
    
    const commentSectionComponent = this.shadow.getElementById('comment-section-component');
    if (commentSectionComponent && this._currentUser && this._movie) {
      commentSectionComponent.comments = movieComments;
      commentSectionComponent.users = this._users;
      commentSectionComponent.currentUser = this._currentUser;
      commentSectionComponent.movieId = this._movie.id;
      commentSectionComponent.onReply = (text, parentCommentId) => this.handleAddComment(text, parentCommentId);
    }
  }
}

customElements.define('movie-detail', MovieDetail);