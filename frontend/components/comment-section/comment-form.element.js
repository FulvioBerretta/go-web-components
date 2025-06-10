class CommentForm extends HTMLElement {
  shadow;
  _currentUserAvatar = 'https://picsum.photos/seed/default-avatar/50/50';
  _submitLabel = "Submit";
  _isReply = false;
  
  onSubmit = () => {};

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['current-user-avatar', 'submit-label', 'is-reply'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'current-user-avatar') this._currentUserAvatar = newValue;
    if (name === 'submit-label') this._submitLabel = newValue;
    if (name === 'is-reply') this._isReply = newValue === 'true';
    this.render();
  }
  
  set currentUserAvatar(val) {
    if (this._currentUserAvatar === val) return;
    this._currentUserAvatar = val;
    this.render();
  }
  get currentUserAvatar() { return this._currentUserAvatar; }

  set submitLabel(val) {
    if (this._submitLabel === val) return;
    this._submitLabel = val;
    this.render();
  }
  get submitLabel() { return this._submitLabel; }

  set isReply(val) {
    if (this._isReply === val) return;
    this._isReply = val;
    this.render();
  }
  get isReply() { return this._isReply; }


  connectedCallback() {
    if (this.hasAttribute('current-user-avatar')) this._currentUserAvatar = this.getAttribute('current-user-avatar');
    if (this.hasAttribute('submit-label')) this._submitLabel = this.getAttribute('submit-label');
    if (this.hasAttribute('is-reply')) this._isReply = this.getAttribute('is-reply') === 'true';
    this.render();
  }

  handleSubmit(e) {
    e.preventDefault();
    const textarea = this.shadow.querySelector('textarea');
    if (textarea && textarea.value.trim()) {
      this.onSubmit(textarea.value.trim());
      textarea.value = ''; 
      const button = this.shadow.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
    }
  }

  handleInput(e) {
    const textarea = e.target;
    const button = this.shadow.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = !textarea.value.trim();
    }
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        :host { display: block; }
        .comment-form {
          display: flex;
          align-items: flex-start;
          gap: 12px; /* space-x-3 */
          margin: ${this._isReply ? '8px 0 0 0' : '24px 0'}; /* mt-2 or my-6 */
        }
        .avatar {
          width: 40px; /* w-10 */
          height: 40px; /* h-10 */
          border-radius: 50%; /* rounded-full */
        }
        .input-area {
          flex: 1;
        }
        textarea {
          width: 100%;
          padding: 12px; /* p-3 */
          background-color: var(--primary-color, #0D1B2A);
          border: 1px solid var(--accent-color, #415A77);
          border-radius: 0.375rem; /* rounded-md */
          outline: none;
          color: var(--text-main-color, #E0E1DD);
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.5;
        }
        textarea::placeholder {
          color: var(--text-secondary-color, #B0B3B8);
        }
        textarea:focus {
          border-color: var(--brand-color, #FFD700);
          box-shadow: 0 0 0 2px var(--brand-color, #FFD700); /* ring-2 ring-brand */
        }
        .submit-button {
          margin-top: 8px; /* mt-2 */
          padding: 8px 16px; /* px-4 py-2 */
          background-color: var(--brand-color, #FFD700);
          color: var(--primary-color, #0D1B2A);
          font-weight: 600; /* font-semibold */
          border-radius: 0.375rem; /* rounded-md */
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .submit-button:hover:not(:disabled) {
          background-color: #e6c200; /* darker brand */
        }
        .submit-button:disabled {
          background-color: #6B7280; /* gray-500 */
          cursor: not-allowed;
        }
      </style>
      <form class="comment-form">
        <img src="${this._currentUserAvatar}" alt="Current user avatar" class="avatar" />
        <div class="input-area">
          <textarea
            placeholder="${this._isReply ? "Write your reply..." : "Share your thoughts on the movie's meaning..."}"
            rows="${this._isReply ? 2 : 3}"
            aria-label="${this._isReply ? 'Reply text' : 'Comment text'}"
          ></textarea>
          <button
            type="submit"
            class="submit-button"
            disabled 
          >
            ${this._submitLabel}
          </button>
        </div>
      </form>
    `;

    this.shadow.querySelector('form')?.addEventListener('submit', this.handleSubmit.bind(this));
    this.shadow.querySelector('textarea')?.addEventListener('input', this.handleInput.bind(this));
  }
}

customElements.define('comment-form', CommentForm);