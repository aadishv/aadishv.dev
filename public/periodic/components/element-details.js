const { LitElement, html, css } = window;

class ElementDetails extends LitElement {
  static properties = {
    element: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }

    .details {
      font-family: monospace;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 2px solid;
      display: flex;
      flex-direction: column;
      margin: 1rem;
      flex-grow: 1;
    }

    h1 {
      font-size: 1.875rem;
      line-height: 2.25rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .detail-label {
      border: 1px solid;
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
      font-weight: bold;
      margin-right: 0.25rem;
    }

    .detail-value {
      border: 1px solid transparent;
      border-radius: 0.375rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  `;

  render() {
    if (!this.element) {
      return html`<div class="details">Select an element to view details</div>`;
    }

    const { name, number, symbol, type, electron_configuration_semantic, 
            electron_configuration, atomic_mass, electronegativity_pauling, fun_fact } = this.element;

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

    const generateDetail = (label, value) => {
      if (!value) return '';
      return html`
        <div class="detail-row">
          <span class="detail-label" style="border-color: ${textColors[type]}">${label}</span>
          <span class="detail-value">${value}</span>
        </div>
      `;
    };

    return html`
      <div
        class="details"
        style="
          color: ${textColors[type]};
          background-color: ${backgroundColors[type]};
          border-color: ${textColors[type]};
        "
      >
        <h1>${name}<br>(${number}, ${symbol})</h1>
        ${generateDetail('Electron config', electron_configuration_semantic)}
        ${generateDetail('Full config', electron_configuration)}
        ${generateDetail('Group', type)}
        ${generateDetail('Atomic mass', atomic_mass)}
        ${generateDetail('Electronegativity', electronegativity_pauling)}
        ${generateDetail('Fun fact', fun_fact)}
      </div>
    `;
  }
}

customElements.define('element-details', ElementDetails); 