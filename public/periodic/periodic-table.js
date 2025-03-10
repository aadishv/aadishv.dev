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

export class PeriodicTable extends LitElement {
  static properties = {
    elements: { type: Array },
    selectedElement: { type: Number },
  };

  static styles = css`
    :host {
      display: block;
      font-family: 'Roboto Flex', sans-serif;
    }
    .elements {
      display: flex;
      flex-direction: column;
      width: 19/24;
    }
    .element-row {
      display: flex;
      flex-direction: row;
    }
    .element {
      display: flex;
      flex-direction: column;
      font-family: monospace;
      padding: 0 0.25rem;
      border-radius: 0.75rem;
      border: 1px solid;
      font-size: calc(0.27 * (19 / 24) * 100vw / 18);
      width: calc(1.2 * (19 / 24) * 100vw / 18);
      height: calc(0.9 * (19 / 24) * 100vw / 18);
      margin: calc(0.1 * (19 / 24) * 100vw / 18);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .element:focus {
      border-width: 2px;
      outline: none;
    }
    .element-number {
      flex-grow: 1;
      display: flex;
      justify-content: flex-start;
    }
    .element-symbol {
      flex-grow: 1;
      display: flex;
      justify-content: flex-end;
    }
    .empty-element {
      border-color: transparent;
    }
    .spacer-row {
      height: 1rem;
    }
    .f-block-label {
      font-size: 0.8em;
      color: #666;
      margin: 0.5rem 0;
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
    this.selectedElement = 1 + Math.floor(Math.random() * this.elements.length);
  }

  _handleElementClick(elementNumber) {
    this.selectedElement = elementNumber;
    this.dispatchEvent(new CustomEvent('element-selected', {
      detail: { elementNumber },
      bubbles: true,
      composed: true
    }));
  }

  renderElement(element, empty = false) {
    if (empty || !element) {
      return html`
        <div class="element empty-element">
          <div class="element-number"></div>
          <div class="element-symbol"></div>
        </div>
      `;
    }

    const style = `
      color: ${textColors[element.type]};
      background-color: ${backgroundColors[element.type]};
      border-color: ${textColors[element.type]};
    `;

    return html`
      <div
        class="element"
        style="${style}"
        tabindex="${element.number === this.selectedElement ? '0' : '-1'}"
        @click=${() => this._handleElementClick(element.number)}
        @focus=${() => this._handleElementClick(element.number)}
      >
        <div class="element-number">${element.number}</div>
        <div class="element-symbol">${element.symbol}</div>
      </div>
    `;
  }

  render() {
    if (!this.elements.length) return html`<div>Loading...</div>`;

    // Separate elements into main block, lanthanides, and actinides
    const mainElements = this.elements.filter(e => !['Lanthanide', 'Actinide'].includes(e.type));
    const lanthanides = this.elements.filter(e => e.type === 'Lanthanide');
    const actinides = this.elements.filter(e => e.type === 'Actinide');

    // Group main elements by period
    const elementsByPeriod = {};
    mainElements.forEach(element => {
      if (!elementsByPeriod[element.period]) {
        elementsByPeriod[element.period] = Array(18).fill(null);
      }
      elementsByPeriod[element.period][element.xpos - 1] = element;
    });

    return html`
      <div class="elements">
        ${Object.entries(elementsByPeriod).map(([period, rowElements]) => html`
          <div class="element-row">
            ${rowElements.map(element => this.renderElement(element))}
          </div>
        `)}
        
        <div class="spacer-row"></div>
        
        <div class="f-block-label">Lanthanides</div>
        <div class="element-row">
          ${lanthanides.map(element => this.renderElement(element))}
        </div>
        
        <div class="f-block-label">Actinides</div>
        <div class="element-row">
          ${actinides.map(element => this.renderElement(element))}
        </div>
      </div>
    `;
  }
}

customElements.define('periodic-table', PeriodicTable); 