const { LitElement, html, css } = window;

class PeriodicTable extends LitElement {
  static properties = {
    elements: { type: Array },
    selectedElement: { type: Object },
  };

  static styles = css`
    :host {
      display: block;
    }

    .container {
      display: flex;
      flex-direction: column;
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem;
    }

    .content {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }

    .periodic-grid {
      display: grid;
      grid-template-columns: repeat(18, minmax(0, 1fr));
      gap: 4px;
      width: 79.17%;
    }

    .details-panel {
      width: 20.83%;
    }

    .empty-cell {
      aspect-ratio: 1;
    }

    .lanthanides-actinides {
      margin-top: 2rem;
      display: grid;
      grid-template-columns: repeat(15, minmax(0, 1fr));
      gap: 4px;
    }

    .element-container {
      grid-column-start: var(--x-pos);
      grid-row-start: var(--y-pos);
    }

    .spacer {
      grid-column: span 3;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-family: monospace;
    }

    .lanthanides {
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      gap: 4px;
      margin: 1rem 0;
    }

    .actinides {
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      gap: 4px;
    }
  `;

  constructor() {
    super();
    this.elements = [];
    this.selectedElement = null;
    this.fetchPeriodicData();
  }

  async fetchPeriodicData() {
    try {
      const response = await fetch(
        'https://gist.githubusercontent.com/aadishv/8e146859aa985767b50aeffdffb1630a/raw/e02725b8584cb5d77be6cf571241e1789793117e/periodic.json'
      );
      this.elements = await response.json();
      this.selectedElement = this.elements[Math.floor(Math.random() * this.elements.length)];
    } catch (error) {
      console.error('Error fetching periodic data:', error);
    }
  }

  _handleElementSelected(e) {
    this.selectedElement = e.detail;
  }

  _handleElementFound(e) {
    this.selectedElement = e.detail;
    const elementTile = this.shadowRoot.querySelector(`element-tile[tabindex="${e.detail.number}"]`);
    if (elementTile) {
      elementTile.focus();
    }
  }

  _createElement(element) {
    if (!element) return html`<div class="empty-cell"></div>`;
    return html`
      <div 
        class="element-container"
        style="--x-pos: ${element.xpos}; --y-pos: ${element.ypos}"
      >
        <element-tile
          .element=${element}
          ?selected=${this.selectedElement?.number === element.number}
          @element-selected=${this._handleElementSelected}
        ></element-tile>
      </div>
    `;
  }

  render() {
    // Split elements into main block and lanthanides/actinides
    const mainBlock = this.elements.filter(e => !e.block?.includes('f'));
    const lanthanides = this.elements.filter(e => e.block === 'f' && e.period === 6);
    const actinides = this.elements.filter(e => e.block === 'f' && e.period === 7);

    return html`
      <div class="container">
        <search-bar
          .elements=${this.elements || []}
          @element-found=${this._handleElementFound}
        ></search-bar>
        
        <div class="content">
          <div class="periodic-grid">
            ${mainBlock.map(element => this._createElement(element))}
          </div>

          <div class="details-panel">
            <element-details .element=${this.selectedElement}></element-details>
          </div>
        </div>

        <div class="lanthanides-actinides">
          <div class="lanthanides">
            <div class="spacer">*</div>
            ${lanthanides.map(element => this._createElement(element))}
          </div>
          <div class="actinides">
            <div class="spacer">**</div>
            ${actinides.map(element => this._createElement(element))}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('periodic-table', PeriodicTable); 