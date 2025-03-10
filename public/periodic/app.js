import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';
import './periodic-table.js';
import './element-detail.js';

export class PeriodicApp extends LitElement {
  static properties = {
    elements: { type: Array },
    selectedElement: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Roboto Flex', sans-serif;
    }
    .container {
      display: flex;
      flex-direction: column;
    }
    .search-container {
      margin: 0.75rem;
      padding-bottom: 0;
    }
    .content {
      display: flex;
      flex-direction: row;
    }
  `;

  constructor() {
    super();
    this.elements = [];
    this.selectedElement = null;
  }

  async firstUpdated() {
    const response = await fetch(
      'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
    );
    this.elements = await response.json();
    // Select a random element on load
    const randomIndex = Math.floor(Math.random() * this.elements.length);
    this.selectedElement = this.elements[randomIndex];
  }

  _handleElementSelected(e) {
    const elementNumber = e.detail.elementNumber;
    this.selectedElement = this.elements.find(el => el.number === elementNumber);
  }

  _handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    if (!query) return;

    // Simple search implementation
    const element = this.elements.find(el => 
      el.name.toLowerCase().includes(query) ||
      el.symbol.toLowerCase().includes(query) ||
      el.number.toString() === query
    );

    if (element) {
      this.selectedElement = element;
      this.dispatchEvent(new CustomEvent('element-selected', {
        detail: { elementNumber: element.number },
        bubbles: true,
        composed: true
      }));
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="search-container">
          <sl-input
            label="Search for elements"
            help-text="Tip: typing in the element's number also works!"
            pill
            @sl-change=${this._handleSearch}
          ></sl-input>
        </div>
        <div class="content">
          <periodic-table
            .elements=${this.elements}
            .selectedElement=${this.selectedElement?.number}
            @element-selected=${this._handleElementSelected}
          ></periodic-table>
          <element-detail
            .element=${this.selectedElement}
          ></element-detail>
        </div>
      </div>
    `;
  }
}

customElements.define('periodic-app', PeriodicApp); 