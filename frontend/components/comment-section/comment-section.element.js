import './comment-item.element.js';

class CommentSection extends HTMLElement {
  shadow;
  _comments = [];
  _users = [];
  _currentUser = null;
  _movieId = null;
  onReply = () => {};

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set comments(value) { this._comments = value; this.render(); }
  get comments() { return this._comments; }
  set users(value) { this._users = value; this.render(); }
  get users() { return this._users; }
  set currentUser(value) { this._currentUser = value; this.render(); }
  get currentUser() { return this._currentUser; }
  set movieId(value) { this._movieId = value; this.render(); } 
  get movieId() { return this._movieId; }


  connectedCallback() {
    this.render();
  }

  findUser(userId) {
    return this._users.find(u => u.id === userId);
  }

  render() {
    const topLevelComments = this._comments.filter(comment => !comment.parentCommentId)
                                       .sort((a,b) => b.timestamp - a.timestamp);

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .comments-container {
          margin-top: 32px; /* mt-8 */
          display: flex;
          flex-direction: column;
          gap: 24px; /* space-y-6 */
          border: 1px solid black;
        }
        .no-comments-message {
          color: var(--text-secondary-color, #B0B3B8);
        }
      </style>
      <div class="comments-container">
        ${topLevelComments.length === 0 ? 
          `<p class="no-comments-message">No comments yet. Be the first to share your thoughts!</p>` :
          topLevelComments.map(comment => `
            <comment-item data-comment-id="${comment.id}"></comment-item>
          `).join('')
        }
      </div>
    `;
    
    topLevelComments.forEach(comment => {
      const commentItemEl = this.shadow.querySelector(`comment-item[data-comment-id="${comment.id}"]`);
      if (commentItemEl && this._currentUser) {
        const commentUser = this.findUser(comment.userId);
        const replies = this._comments
          .filter(reply => reply.parentCommentId === comment.id)
          .sort((a,b) => a.timestamp - b.timestamp)
          .map(r => ({ ...r, user: this.findUser(r.userId) }));
        
        commentItemEl.comment = comment;
        commentItemEl.user = commentUser;
        commentItemEl.currentUser = this._currentUser;
        commentItemEl.replies = replies;
        commentItemEl.onReply = this.onReply; 
      }
    });
  }
}

customElements.define('comment-section', CommentSection);