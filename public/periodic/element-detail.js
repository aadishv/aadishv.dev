import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

const textColors = {
  'Alkali Metal': '#00768D',
  'Alkaline Earth Metal': '#D60024',
  'Transition Metal': '#6232EC',
  'Post-transition Metal': '#002C00',
  Metalloid: '#945801',
  'Reactive Nonmetal': '#0060F1',
  'Noble Gas': '#CD1D5F',
  Lanthanide: '#003356',
  Actinide: '#C73201',
  'Unknown Chemical Properties': '#3F3750',
};

const backgroundColors = {
  'Alkali Metal': '#D7F8FF',
  'Alkaline Earth Metal': '#FFE6E5',
  'Transition Metal': '#F3E7FE',
  'Post-transition Metal': '#D8F9E9',
  Metalloid: '#FEF8E2',
  'Reactive Nonmetal': '#E1EDFF',
  'Noble Gas': '#FFE6EA',
  Lanthanide: '#E1F3FF',
  Actinide: '#FFE7D7',
  'Unknown Chemical Properties': '#E7E7EA',
};

export class ElementDetail extends LitElement {
  static properties = {
    element: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Roboto Flex', sans-serif;
    }
    .detail-container {
      width: 5/24;
      margin: 1rem;
      border: 2px solid;
      border-radius: 0.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      font-family: monospace;
      padding: 0.75rem;
      flex-grow: 1;
    }
    .title {
      font-size: 1.875rem;
      display: flex;
      width: 100%;
      font-weight: bold;
    }
    .detail-row {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem;
    }
    .detail-label {
      border: 1px solid;
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      font-weight: bold;
      font-family: sans-serif;
    }
    .detail-value {
      border: 1px solid transparent;
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      margin-left: 0.25rem;
    }
    .search-button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      border: 1px solid;
      background-color: white;
      cursor: pointer;
      font-family: sans-serif;
      font-weight: bold;
      transition: all 0.2s ease;
    }
    .search-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `;

  constructor() {
    super();
    this.element = null;
  }

  _searchElement() {
    if (this.element) {
      const searchQuery = encodeURIComponent(`${this.element.name} chemical element`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  }

  render() {
    if (!this.element) return html`<div>Select an element to view details</div>`;

    const style = `
      background-color: ${backgroundColors[this.element.type]};
      color: ${textColors[this.element.type]};
      border-color: ${textColors[this.element.type]};
    `;

    const generateDetail = (name, value) => html`
      <span class="detail-row">
        <span class="detail-label" style="border-color: ${textColors[this.element.type]}">${name}</span>
        <span class="detail-value">${value}</span>
      </span>
    `;

    return html`
      <div class="detail-container" style="${style}">
        <h1 class="title">
          ${this.element.name}<br>
          (${this.element.number}, ${this.element.symbol})
        </h1>
        ${generateDetail('Electron config', this.element.electron_configuration_semantic)}
        ${generateDetail('Full config', this.element.electron_configuration)}
        ${generateDetail('Group', this.element.type)}
        ${generateDetail('Atomic mass', this.element.atomic_mass)}
        ${generateDetail('Electronegativity', this.element.electronegativity_pauling)}
        ${generateDetail('Fun fact', this.element.fun_fact)}
        <button 
          class="search-button" 
          style="border-color: ${textColors[this.element.type]}; color: ${textColors[this.element.type]}"
          @click=${this._searchElement}
        >
          Search on Google
        </button>
      </div>
    `;
  }
}

customElements.define('element-detail', ElementDetail); 