class Navbar extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = ` 
        <nav class="navbar flex space-between">
            <div class="align-start u-pull-left space-evenly"> 
                <h4>Movie Plot For Dummies</h4>
                <cite class="flex-start u-pull-left">
                    Did you get that?
                </cite>
            </div>
            <div class="flex small-gap pad centered">
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
