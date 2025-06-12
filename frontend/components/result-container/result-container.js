class ResultContainer extends HTMLElement {

    constructor() {
        super();
    }

    render() {
        // Create the anchor element and append a slot for dynamic content
        this.innerHTML = `
        <div>
        </div>
        `;
    }

}

customElements.define("mn-result-container", ResultContainer);