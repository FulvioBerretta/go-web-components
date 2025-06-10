// 1. Define the mn-navbar-item custom element
// This component encapsulates a single list item (<li>) and its content (e.g., an <a> tag).
class NavbarItem extends HTMLElement {
    constructor() {
        super();
        // Attach a shadow DOM to encapsulate the component's internal structure and styles.
        // 'open' mode allows JavaScript access to the shadow DOM from outside.
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // The connectedCallback is invoked when the custom element is inserted into the DOM.
        // This is where we trigger the rendering of the component's content.
        this.render();
    }

    render() {
        // Capture the light DOM content (what's written between <mn-navbar-item> tags)
        // This will typically be the <a> tag for the navigation link.
        const content = this.innerHTML;

        // Set the inner HTML of the shadow DOM.
        // This includes the component's internal <style> block and its HTML structure.
        this.shadowRoot.innerHTML = `
            <style>
           
               

            <li>${content}</li>
        `;
    }
}

customElements.define("mn-navbar-item", NavbarItem);