const { LitElement, html, css } = window;

class ElementTile extends LitElement {
  static properties = {
    element: { type: Object },
    selected: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      aspect-ratio: 1;
      position: relative;
    }

    .element-tile {
      font-family: monospace;
      padding: 0.25rem;
      border-radius: 0.25rem;
      border: 2px solid;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 100%;
      box-sizing: border-box;
      position: relative;
      min-height: 2.5rem;
      background-color: var(--bg-color, transparent);
      color: var(--text-color, inherit);
      border-color: var(--border-color, transparent);
    }

    .element-tile:hover {
      transform: scale(1.1);
      z-index: 1;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }

    .element-tile:focus {
      outline: none;
      border-width: 3px;
      transform: scale(1.1);
      z-index: 1;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }

    .number {
      font-size: 0.6em;
      line-height: 1;
      flex-grow: 0;
      display: flex;
      justify-content: flex-start;
      opacity: 0.8;
    }

    .symbol {
      font-size: 1em;
      line-height: 1;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
    }

    .empty {
      border-color: transparent;
      background: transparent;
    }
  `;

  render() {
    if (!this.element) {
      return html`<div class="element-tile empty"></div>`;
    }

    const { number, symbol, type } = this.element;
    const textColors = {
      'Alkali Metal': '#00768D',
      'Alkaline Earth Metal': '#D60024',
      'Transition Metal': '#6232EC',
      'Post-transition Metal': '#002C00',
      'Metalloid': '#945801',
      'Reactive Nonmetal': '#0060F1',
      'Noble Gas': '#CD1D5F',
      'Lanthanide': '#003356',
      'Actinide': '#C73201',
      'Unknown Chemical Properties': '#3F3750',
    };

    const backgroundColors = {
      'Alkali Metal': '#D7F8FF',
      'Alkaline Earth Metal': '#FFE6E5',
      'Transition Metal': '#F3E7FE',
      'Post-transition Metal': '#D8F9E9',
      'Metalloid': '#FEF8E2',
      'Reactive Nonmetal': '#E1EDFF',
      'Noble Gas': '#FFE6EA',
      'Lanthanide': '#E1F3FF',
      'Actinide': '#FFE7D7',
      'Unknown Chemical Properties': '#E7E7EA',
    };

    const style = {
      '--text-color': textColors[type],
      '--bg-color': backgroundColors[type],
      '--border-color': textColors[type],
    };

    return html`
      <div
        class="element-tile"
        style=${Object.entries(style).map(([k, v]) => `${k}:${v}`).join(';')}
        tabindex="${number}"
        @click=${this._handleClick}
        @keyup=${this._handleKeyup}
      >
        <div class="number">${number}</div>
        <div class="symbol">${symbol}</div>
      </div>
    `;
  }

  _handleClick() {
    this.dispatchEvent(new CustomEvent('element-selected', {
      detail: this.element,
      bubbles: true,
      composed: true
    }));
  }

  _handleKeyup(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      this._handleClick();
    }
  }
}

customElements.define('element-tile', ElementTile); 