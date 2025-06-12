class NavbarLink extends HTMLElement {
    static get observedAttributes() {
        return ['href'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute('role', 'navigation');
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Re-render if the 'href' attribute changes
        if (name === 'href' && oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const href = this.getAttribute('href') || '#';
        // Create the anchor element and append a slot for dynamic content
        this.innerHTML = `
            <a href="${href}" class="navbar-link">
                ${this.innerText} 
            </a>
        `;
    }
}

customElements.define('mn-navbar-link', NavbarLink);