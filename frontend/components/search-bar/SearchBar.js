class SearchBar extends HTMLElement {
    /**
     * An array containing the names of all attributes for which the element needs change notifications.
     * @type {String[]}
     */
    static observedAttributes = ['action-url', 'data-placeholder'];

    /**
     * Initializes the SearchBar element, setting up internal state.
     * @constructor
     */
    constructor() {
        super();
        /**
         * Stores the search results fetched from the API.
         * @type {Array}
         */
        this.searchResults = [];
        /**
         * The placeholder text for the search input, defaults to "Search...".
         * @type {string}
         */
        this.dataPlaceholder = this.getAttribute("data-placeholder") || "Search...";
        /**
         * The base URL for the search API endpoint.
         * @type {string}
         */
        this.actionUrlBase = '';
        /**
         * Timeout ID for debouncing search input.
         * @type {number|null}
         */
        this.debounceTimeout = null;
        /**
         * Interval ID for the placeholder animation.
         * @type {number|null}
         */
        this.placeholderInterval = null;
    }

    /**
     * Called when the element is inserted into the DOM.
     * Renders the component, initializes the action URL, attaches event listeners,
     * and starts the placeholder animation.
     */
    connectedCallback() {
        this.render();
        this.initializeActionUrl();
        this.attachEventListeners();
    }

    /**
     * Initializes the `actionUrlBase` property based on the 'action-url' attribute.
     * Ensures the URL is valid and properly formatted (starts with http/https and no trailing slash).
     * Logs an error if the 'action-url' attribute is missing or empty.
     */
    initializeActionUrl() {
        const rawActionUrl = this.getAttribute('action-url');
        if (rawActionUrl) {
            this.actionUrlBase = this.formatActionUrl(rawActionUrl);
        } else {
            console.error('ERROR: action-url attribute is missing or empty on custom-search element. Cannot perform search.');
            this.actionUrlBase = '';
        }
        console.log('SearchBar connectedCallback: actionUrlBase initialized to:', this.actionUrlBase);
    }

    /**
     * Formats a raw URL string by ensuring it starts with 'http://' or 'https://'
     * and removes any trailing slashes.
     * @param {string} rawUrl - The raw URL string from the attribute.
     * @returns {string} The formatted URL.
     */
    formatActionUrl(rawUrl) {
        let formattedUrl = rawUrl;
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `http://${formattedUrl}`;
        }
        if (formattedUrl.endsWith('/')) {
            formattedUrl = formattedUrl.slice(0, -1);
        }
        return formattedUrl;
    }

    /**
     * Called when an observed attribute's value changes.
     * Updates the component's state and re-renders or restarts animations as needed.
     * @param {string} name - The name of the attribute that changed.
     * @param {string} oldValue - The old value of the attribute.
     * @param {string} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        if (name === 'data-placeholder') {
            this.updatePlaceholder(newValue);
        } else if (name === 'action-url') {
            this.updateActionUrl(newValue);
        }
    }

    /**
     * Updates the data placeholder and restarts the animation.
     * @param {string} newValue - The new value for the placeholder.
     */
    updatePlaceholder(newValue) {
        this.dataPlaceholder = newValue || "Search...";
        this.render(); // Re-render to apply the new placeholder
    }

    /**
     * Updates the action URL base.
     * @param {string} newValue - The new value for the action URL.
     */
    updateActionUrl(newValue) {
        this.actionUrlBase = newValue ? this.formatActionUrl(newValue) : '';
        console.log('SearchBar attributeChangedCallback: actionUrlBase updated to:', this.actionUrlBase);
    }

    /**
     * Attaches event listeners to the search button and input field.
     * Handles click events for the button and keyup events for the input,
     * including debouncing for search queries and managing placeholder animation.
     */
    attachEventListeners() {
        const searchButton = this.querySelector('#searchQuerySubmit');
        const searchInput = this.querySelector('#searchQueryInput');

        if (searchButton) {
            searchButton.addEventListener('click', this.handleSearchButtonClick.bind(this));
        } else {
            console.warn('Search button not found in SearchBar component.');
        }

        if (searchInput) {
            searchInput.addEventListener('keyup', this.handleSearchInputKeyup.bind(this));
            // Perform an initial search if the input already has a value on load
            if (searchInput.value.length > 0) {
                this.performSearch();
            }
        } else {
            console.warn('Search input not found in SearchBar component.');
        }
    }

    /**
     * Handles the click event on the search button.
     * Prevents default form submission, clears any pending debounce timeout, and performs a search.
     * @param {Event} event - The click event object.
     */
    handleSearchButtonClick(event) {
        event.preventDefault();
        clearTimeout(this.debounceTimeout);
        this.performSearch();
    }

    /**
     * Handles the keyup event on the search input field.
     * Triggers a search on 'Enter' key press, otherwise debounces the search.
     * Manages stopping and starting the placeholder animation during typing.
     * @param {KeyboardEvent} event - The keyboard event object.
     */
    handleSearchInputKeyup(event) {
        if (event.key === 'Enter') {
            clearTimeout(this.debounceTimeout);
            this.performSearch();
        } else {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        }
    }



    /**
     * Performs a search based on the current input query.
     * Fetches data from the `actionUrlBase` and updates the search results display.
     * Handles empty queries, configuration errors, and network/backend errors.
     * @async
     */
    async performSearch() {
        const searchQuery = this.querySelector('#searchQueryInput').value.trim();

        if (searchQuery === '') {
            this.handleEmptySearchQuery();
            return;
        }

        if (!this.actionUrlBase) {
            this.updateResultsDisplay('Configuration error: Search URL is missing. Please check the "action-url" attribute.');
            return;
        }

        const fetchUrl = `${this.actionUrlBase}?q=${encodeURIComponent(searchQuery)}&limit=5`;
        console.log('Searching for:', searchQuery);
        console.log('Fetching from:', fetchUrl);

        try {
            const response = await fetch(fetchUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            await this.handleSearchResponse(response);
        } catch (error) {
            console.error('Network or backend error during search:', error);
            this.searchResults = [];
            this.updateResultsDisplay('An error occurred during search. Please check your network or backend.');
        }
    }

    /**
     * Handles the case where the search query is empty.
     * Clears search results and restarts the placeholder animation.
     */
    handleEmptySearchQuery() {
        this.searchResults = [];
        this.updateResultsDisplay(); // Clear results display
    }

    /**
     * Processes the response from the search API.
     * Parses JSON results if successful, otherwise handles error responses.
     * @param {Response} response - The fetch API response object.
     * @async
     */
    async handleSearchResponse(response) {
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
    }

    /**
     * Updates the display of search results in the `mn-result-container`.
     * Can display a message if no results or an error occurs.
     * @param {string|null} message - An optional message to display instead of results.
     */
    updateResultsDisplay(message = null) {
        const resultsContainer = document.querySelector('#global-search');
        if (!resultsContainer) {
            console.warn('Search results container not found.');
            return;
        }

        resultsContainer.innerHTML = '';
        resultsContainer.className = 'search-results-list'; // Ensure correct class

        if (message) {
            resultsContainer.innerHTML = `<p class="search-results-message">${message}</p>`;
            return;
        }

        if (this.searchResults.length === 0) {
            return;
        }

        this.populateResultsContainer(resultsContainer, this.searchResults);
    }

    /**
     * Populates the results container with movie cards based on search results.
     * @param {HTMLElement} resultContainer - The container element to populate.
     * @param {Array<Object>} searchResults - An array of movie data objects.
     */
    populateResultsContainer(resultContainer, searchResults) {
        searchResults.forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            resultContainer.appendChild(movieCard);
        });
    }

    /**
     * Creates an `<mn-card>` custom element for a given movie object.
     * @param {Object} movie - The movie data object (e.g., {title, releaseDate, genre}).
     * @returns {HTMLElement} The created `<mn-card>` element.
     */
    createMovieCard(movie) {
        const card = document.createElement('mn-card');
        card.setAttribute("title", movie.title);
        card.setAttribute("release-date", movie.releaseDate);
        card.setAttribute("genre", movie.genre);
        return card;
    }

    /**
     * Renders the initial HTML structure of the search bar, including the input,
     * search button, and results container.
     */
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
        `;
    }
}

customElements.define("custom-search", SearchBar);