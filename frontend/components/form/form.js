class Form extends HTMLElement {

    /**
     * containing the names of all attributes for which the element needs change notifications
     * @type {String[]}
     */
        // Ora osserviamo solo 'action-url' e il nuovo attributo 'type'.
        // Rimuoviamo 'registration' e 'login' come attributi booleani.
    static observedAttributes = ['action-url', 'type'];

    constructor() {
        super();
    }

    connectedCallback() {
        this.render(); // Il rendering iniziale avviene qui

        // Defer event listener until DOM is fully attached
        // Utilizzo requestAnimationFrame per assicurarsi che il DOM sia pronto
        requestAnimationFrame(() => {
            const form = this.querySelector('form');
            if (form) {
                form.addEventListener('submit', this.handleSubmit.bind(this));
            } else {
                console.warn('Form not found in custom element');
            }
        });
    }

    // `attributeChangedCallback` viene chiamato quando uno degli attributi osservati cambia.
    // Lo usiamo per ri-renderizzare il componente quando il 'type' cambia.
    attributeChangedCallback(name, oldValue, newValue) {
        // Se l'attributo 'type' cambia, ri-renderizziamo il componente.
        if (name === 'type' && oldValue !== newValue) {
            this.render();
        }
        // Per 'action-url', `getAttribute` lo recupera già ogni volta nel handleSubmit.
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

        // Recupera l'actionUrl. Se il 'type' è 'registration', potresti voler usare un endpoint diverso
        // es. actionUrl = `http://${this.getAttribute('action-url') || ''}/${formType}`;
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
                alert('Success!'); // Messaggio generico, puoi differenziarlo
            } else {
                const errorText = await response.text();
                console.error('Error:', response.status, errorText);
                alert(`Operation failed: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Network or CORS error:', error);
            alert('An error occurred. Check console for details.');
        }
    }

    render() {
        // Recupera il valore dell'attributo 'type'. Default a una stringa vuota se non presente.
        const formType = this.getAttribute('type') || '';

        let linkText = '';
        let linkHref = '';
        let buttonValue = '';

        // Utilizza uno switch o if/else if per gestire i diversi tipi di form.
        switch (formType) {
            case 'login':
                linkText = 'Non sei ancora iscritto? Registrati';
                linkHref = '../../pages/register.html'; // Assumendo una pagina di registrazione
                buttonValue = 'Accedi'; // Modificato il testo del bottone in italiano
                break;
            case 'registration':
                linkText = 'Sei già un membro? Accedi';
                linkHref = '../../pages/login.html'; // Assumendo una pagina di login
                buttonValue = 'Registrati'; // Modificato il testo del bottone in italiano
                break;
            // Puoi aggiungere altri casi qui per 'reset-password', 'profile-update', ecc.
            default:
                // Default se l'attributo 'type' non è presente o non riconosciuto
                linkText = 'Gestisci Account';
                linkHref = '#';
                buttonValue = 'Invia'; // Modificato il testo del bottone in italiano
                break;
        }

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
                    <a href="${linkHref}">${linkText}</a>
                </small>
                <input
                    class ="button"
                    type="submit"
                    value="${buttonValue}"
                />
            </fieldset>
        </form>
        `;
    }
}

customElements.define("custom-form", Form);
