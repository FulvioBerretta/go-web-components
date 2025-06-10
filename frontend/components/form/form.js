class Form extends HTMLElement {

    /**
     * containing the names of all attributes for which the element needs change notifications
     * @type {String[]}
     */
    static observedAttributes = ['action-url'];

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();

        // Defer event listener until DOM is fully attached
        requestAnimationFrame(() => {
            const form = this.querySelector('form');
            if (form) {
                form.addEventListener('submit', this.handleSubmit.bind(this));
            } else {
                console.warn('Form not found in custom element');
            }
        });
    }
    async handleSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const usernameInput = form.querySelector('#username');
        const passwordInput = form.querySelector('#password');

        const username = usernameInput.value;
        const password = passwordInput.value;

        const data = {
            username: username,
            password: password
        };

        console.log('Data to be sent:', data); // LOG: Mostra l'oggetto dati
        console.log('JSON body:', JSON.stringify(data));

        const actionUrl = `http://${this.getAttribute('action-url') || ''}`;

        try {
            const response = await fetch(actionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Success:', result);
                alert('Login successful!');
            } else {
                const errorText = await response.text();
                console.error('Error:', response.status, errorText);
                alert(`Login failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Network or CORS error:', error);
            alert('An error occurred. Check console for details.');
        }
    }

    render() {
        this.innerHTML = ` 
        <form>
            <fieldset class="flex column">

                <!--  username -->
                <input 
                    id="username"
                    name="username"
                    placeholder="username"
                    autocomplete="username"
                    required
                    minlength="3"
                    maxlength="15"
                />

                <!-- password -->
                <input 
                    id="password"
                    type="password"
                    name="password"
                    placeholder="password"
                    autocomplete="password"
                    required
                    minlength="8"
                    maxlength="20"
                />
                <br>
                <small id="email-helper">
                    <a href="../../pages/login.html">Not yet subscribed? Register </a>
                </small>
                <input
                    class ="button"
                    type="submit"
                    value="Login"
                />
            </fieldset>
        </form>
        `
    }
}

customElements.define("custom-form", Form);
