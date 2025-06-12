class SearchBar extends HTMLElement {

    /**
     * containing the names of all attributes for which the element needs change notifications
     * @type {String[]}
     */
    static observedAttributes = ['action-url', 'data-placeholder'];

    constructor() {
        super();
        this.searchResults = [];
        this.dataPlaceholder = this.getAttribute("data-placeholder") || "Search...";
        this.actionUrlBase = '';
        this.debounceTimeout = null;
        this.placeholderInterval = null; // Per gestire l'intervallo dell'animazione del placeholder
    }

    connectedCallback() {
        this.render();

        const rawActionUrl = this.getAttribute('action-url');
        if (rawActionUrl) {
            if (!rawActionUrl.startsWith('http://') && !rawActionUrl.startsWith('https://')) {
                this.actionUrlBase = `http://${rawActionUrl}`;
            } else {
                this.actionUrlBase = rawActionUrl;
            }
            if (this.actionUrlBase.endsWith('/')) {
                this.actionUrlBase = this.actionUrlBase.slice(0, -1);
            }
        } else {
            console.error('ERROR: action-url attribute is missing or empty on custom-search element. Cannot perform search.');
            this.actionUrlBase = '';
        }
        console.log('SearchBar connectedCallback: actionUrlBase initialized to:', this.actionUrlBase);

        this.attachEventListeners();
        // Avvia l'animazione del placeholder
        this.startPlaceholderAnimation();
    }

    // Metodo per avviare o riavviare l'animazione del placeholder
    startPlaceholderAnimation() {
        if (this.placeholderInterval) {
            clearInterval(this.placeholderInterval); // Pulisce qualsiasi animazione precedente
        }
        const searchInput = this.querySelector('#searchQueryInput');
        if (searchInput) {
            this.animatePlaceholder(this.dataPlaceholder, searchInput);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-placeholder' && oldValue !== newValue) {
            this.dataPlaceholder = newValue || "Search...";
            // Ri-renderizza per applicare il nuovo placeholder
            this.render();
            // Riavvia l'animazione con il nuovo testo del placeholder
            this.startPlaceholderAnimation();
        } else if (name === 'action-url' && oldValue !== newValue) {
            if (newValue) {
                if (!newValue.startsWith('http://') && !newValue.startsWith('https://')) {
                    this.actionUrlBase = `http://${newValue}`;
                } else {
                    this.actionUrlBase = newValue;
                }
                if (this.actionUrlBase.endsWith('/')) {
                    this.actionUrlBase = this.actionUrlBase.slice(0, -1);
                }
            } else {
                this.actionUrlBase = '';
            }
            console.log('SearchBar attributeChangedCallback: actionUrlBase updated to:', this.actionUrlBase);
        }
    }

    attachEventListeners() {
        const searchButton = this.querySelector('#searchQuerySubmit');
        const searchInput = this.querySelector('#searchQueryInput');

        if (searchButton) {
            searchButton.addEventListener('click', (event) => {
                event.preventDefault();
                clearTimeout(this.debounceTimeout);
                this.performSearch();
            });
        } else {
            console.warn('Search button not found in SearchBar component.');
        }

        if (searchInput) {
            searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    clearTimeout(this.debounceTimeout);
                    this.performSearch();
                } else {
                    // Quando l'utente inizia a digitare, ferma l'animazione del placeholder
                    if (this.placeholderInterval) {
                        clearInterval(this.placeholderInterval);
                        this.placeholderInterval = null;
                        searchInput.classList.remove('typing-animation-active'); // Rimuove la classe per il cursore
                    }
                    clearTimeout(this.debounceTimeout);
                    this.debounceTimeout = setTimeout(() => {
                        this.performSearch();
                    }, 300);
                }
            });
            // Esegui una ricerca iniziale se l'input ha già un valore al caricamento
            if (searchInput.value.length > 0) {
                this.performSearch();
            }
        } else {
            console.warn('Search input not found in SearchBar component.');
        }
    }

    // Nuovo metodo per animare il placeholder lettera per lettera
    animatePlaceholder(phrase, el) {
        let index = 0;
        el.placeholder = ''; // Pulisce il placeholder iniziale
        el.classList.add('typing-animation-active'); // Aggiunge una classe per il cursore

        // Anima l'aggiunta di lettere
        this.placeholderInterval = setInterval(() => {
            el.placeholder = phrase.substring(0, index);
            index++;

            if (index > phrase.length) {
                clearInterval(this.placeholderInterval); // Ferma l'animazione
                this.placeholderInterval = null; // Resetta l'intervallo
                // Non rimuovere la classe qui se vuoi che il cursore lampegghi dopo aver finito
            }
        }, 100); // Intervallo tra le lettere (100ms per un effetto più lento)
    }

    async performSearch() {
        const searchQuery = this.querySelector('#searchQueryInput').value;

        if (searchQuery.trim() === '') {
            this.searchResults = [];
            this.updateResultsDisplay('Digita un titolo per iniziare la ricerca...');
            // Riavvia l'animazione se l'input diventa vuoto
            this.startPlaceholderAnimation();
            return;
        }

        // Quando l'utente esegue una ricerca, ferma l'animazione del placeholder se attiva
        if (this.placeholderInterval) {
            clearInterval(this.placeholderInterval);
            this.placeholderInterval = null;
        }
        const searchInput = this.querySelector('#searchQueryInput');
        if (searchInput) {
            searchInput.classList.remove('typing-animation-active'); // Rimuove la classe per il cursore
        }

        if (!this.actionUrlBase) {
            this.updateResultsDisplay('Configuration error: Search URL is missing. Please check the "action-url" attribute.');
            return;
        }

        const fetchUrl = `${this.actionUrlBase}?q=${encodeURIComponent(searchQuery)}`;

        console.log('Searching for:', searchQuery);
        console.log('Fetching from:', fetchUrl);
        console.log('DEBUG: Final URL for fetch:', fetchUrl);

        try {
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const results = await response.json();
                this.searchResults = results;
                this.updateResultsDisplay();
                console.log('Search results:', results);
            } else {
                const errorText = await response.text();
                console.error('Search failed:', response.status, errorText);
                this.searchResults = [];
                this.updateResultsDisplay(`Error: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('Network or backend error during search:', error);
            this.searchResults = [];
            this.updateResultsDisplay('An error occurred during search. Please check your network or backend.');
        }
    }

    updateResultsDisplay(message = null) {
        const resultsContainer = this.querySelector('#searchResults');
        if (!resultsContainer) {
            console.warn('Search results container not found.');
            return;
        }

        resultsContainer.innerHTML = '';

        if (message) {
            resultsContainer.innerHTML = `<p class="search-results-message">${message}</p>`;
            return;
        }

        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `<p class="search-results-message">Nessun film trovato per la ricerca.</p>`;
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'search-results-list';

        this.searchResults.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'search-results-item';
            li.textContent = `${movie.title} (${movie.length} min, Genere: ${movie.genre})`;
            ul.appendChild(li);
        });
        resultsContainer.appendChild(ul);
    }

    render() {
        this.innerHTML = ` 
        <div class="searchBar">
            <input 
                id="searchQueryInput" 
                type="text" 
                name="searchQueryInput" 
                placeholder="${this.dataPlaceholder}" 
                value=""
                />
            <button id="searchQuerySubmit" type="submit" name="searchQuerySubmit">
              <svg style="width:24px;height:24px" viewBox="0 0 24 24"><path fill="#666666" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
            </button>
        </div>
        <div id="searchResults" class="search-results-container">
        </div>
        `;
    }
}

customElements.define("custom-search", SearchBar);
