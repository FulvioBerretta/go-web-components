import './comment-form.element.js';

class CommentItem extends HTMLElement {
  shadow;
  _comment = null;
  _user;
  _currentUser = null;
  _replies = [];
  onReply = () => {};

  _showReplyForm = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  set comment(value) { this._comment = value; this.render(); }
  get comment() { return this._comment; }
  set user(value) { this._user = value; this.render(); }
  get user() { return this._user; }
  set currentUser(value) { this._currentUser = value; this.render(); }
  get currentUser() { return this._currentUser; }
  set replies(value) { this._replies = value; this.render(); }
  get replies() { return this._replies; }

  connectedCallback() {
    this.render();
  }

  toggleReplyForm() {
    this._showReplyForm = !this._showReplyForm;
    this.render();
  }

  handleReplySubmit(text) {
    if (this._comment) {
      this.onReply(text, this._comment.id);
      this._showReplyForm = false;
      this.render(); 
    }
  }

  render() {
    if (!this._comment || !this._currentUser) {
      this.shadow.innerHTML = ``; 
      return;
    }

    const userName = this._user?.name || 'Unknown User';
    const userAvatar = this._user?.avatarUrl || 'https://picsum.photos/seed/default/50/50';

    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .comment-wrapper {
          padding: 16px; /* p-4 */
          background-color: rgba(65, 90, 119, 0.3); /* bg-accent/30 */
          border-radius: 0.5rem; /* rounded-lg */
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06); /* shadow */
        }
        .comment-header {
          display: flex;
          align-items: flex-start;
          gap: 12px; /* space-x-3 */
        }
        .avatar {
          width: 40px; /* w-10 */
          height: 40px; /* h-10 */
          border-radius: 50%; /* rounded-full */
        }
        .comment-body {
          flex: 1;
        }
        .comment-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .user-name {
          font-weight: 600; /* font-semibold */
          color: var(--highlight-color, #778DA9);
        }
        .timestamp {
          font-size: 0.75rem; /* text-xs */
          color: var(--text-secondary-color, #B0B3B8);
        }
        .comment-text {
          color: var(--text-main-color, #E0E1DD);
          margin-top: 4px; /* mt-1 */
          word-break: break-word;
        }
        .reply-button {
          margin-top: 8px; /* mt-2 */
          font-size: 0.875rem; /* text-sm */
          color: var(--brand-color, #FFD700);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .reply-button:hover {
          color: #e6c200; /* darker brand */
        }
        .reply-button svg {
          width: 16px; /* w-4 */
          height: 16px; /* h-4 */
          margin-right: 4px; /* mr-1 */
          stroke: currentColor;
        }
        .reply-form-container {
          margin-left: 48px; /* ml-12 (avatar width + gap) */
          margin-top: 16px; /* mt-4 */
        }
        .replies-container {
          margin-left: 48px; /* ml-12 */
          margin-top: 16px; /* mt-4 */
          display: flex;
          flex-direction: column;
          gap: 12px; /* space-y-3 */
          padding-left: 16px; /* pl-4 */
          border-left: 2px solid var(--accent-color, #415A77);
        }
      </style>
      <div class="comment-wrapper">
        <div class="comment-header">
          <img src="${userAvatar}" alt="${userName}" class="avatar" />
          <div class="comment-body">
            <div class="comment-meta">
              <span class="user-name">${userName}</span>
              <span class="timestamp">
                ${new Date(this._comment.timestamp).toLocaleString()}
              </span>
            </div>
            <p class="comment-text">${this._comment.text}</p>
            <button id="reply-button" class="reply-button" aria-label="Reply to this comment">
              ${ReplyIconSVG()}
              Reply
            </button>
          </div>
        </div>

        ${this._showReplyForm ? `
          <div class="reply-form-container">
            <comment-form id="reply-form-${this._comment.id}" submit-label="Post Reply" is-reply="true"></comment-form>
          </div>
        ` : ''}

        ${this._replies.length > 0 ? `
          <div class="replies-container">
            ${this._replies.map(reply => `<comment-item data-reply-id="${reply.id}"></comment-item>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    this.shadow.getElementById('reply-button')?.addEventListener('click', () => this.toggleReplyForm());
    
    const replyForm = this.shadow.getElementById(`reply-form-${this._comment.id}`);
    if (this._showReplyForm && replyForm && this._currentUser) {
      replyForm.currentUserAvatar = this._currentUser.avatarUrl;
      replyForm.onSubmit = (text) => this.handleReplySubmit(text);
    }

    this._replies.forEach(reply => {
      const replyItemEl = this.shadow.querySelector(`comment-item[data-reply-id="${reply.id}"]`);
      if (replyItemEl && this._currentUser) {
        replyItemEl.comment = reply;
        replyItemEl.user = reply.user;
        replyItemEl.currentUser = this._currentUser;
        replyItemEl.replies = []; 
        replyItemEl.onReply = this.onReply;
      }
    });
  }
}

customElements.define('comment-item', CommentItem);