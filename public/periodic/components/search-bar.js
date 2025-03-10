const { LitElement, html, css } = window;

class SearchBar extends LitElement {
  static properties = {
    elements: { type: Array },
  };

  static styles = css`
    :host {
      display: block;
      margin: 1rem;
    }

    .search-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    input {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 9999px;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #6232EC;
      box-shadow: 0 0 0 2px rgba(98, 50, 236, 0.2);
    }

    .help-text {
      font-size: 0.875rem;
      color: #666;
      margin-left: 1rem;
    }
  `;

  constructor() {
    super();
    this.elements = [];
    this.fuse = null;
  }

  firstUpdated() {
    this.initializeFuse();
  }

  initializeFuse() {
    const options = {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'symbol', weight: 0.3 },
        { name: 'number', weight: 0.1 }
      ],
      threshold: 0.4
    };
    this.fuse = new window.Fuse(this.elements, options);
  }

  _handleInput(e) {
    const query = e.target.value.trim();
    if (!query) return;

    const results = this.fuse.search(query);
    if (results.length > 0) {
      this.dispatchEvent(new CustomEvent('element-found', {
        detail: results[0].item,
        bubbles: true,
        composed: true
      }));
    }
  }

  render() {
    return html`
      <div class="search-container">
        <input
          type="text"
          placeholder="Search elements..."
          @input=${this._handleInput}
        />
        <div class="help-text">
          Tip: typing in the element's number also works!
        </div>
      </div>
    `;
  }
}

customElements.define('search-bar', SearchBar); 