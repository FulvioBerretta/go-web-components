class Navbar extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = ` 
        <nav class="navbar flex column centered">
            <div class="flex medium-gap pad centered">
                <mn-navbar-item>Profile</mn-navbar-item>
                <mn-navbar-item>Services</mn-navbar-item>
                <mn-navbar-item>About</mn-navbar-item>
                <mn-navbar-item>Products</mn-navbar-item>
            </div>
        </nav>
        `
    }
}

customElements.define("custom-navbar", Navbar);
