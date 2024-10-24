/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import 'mdui';
import 'mdui/components/icon.js';
/**
 * An example element.
 *
 * @fires coun-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
let BlockEditor = class BlockEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.checked = false;
        this.order = "201";
        this.text = "";
        this.tag = "";
        this.figureOutText = (newText) => {
            if (this.checked) {
                const order = this.order.split('').map(char => parseInt(char, 10));
                const data = newText.split('\n\n\n').map(i => i.split('\n'));
                const separator = `\ntags: ${this.tag}`;
                const formattedData = data
                    .filter(i => i.length === 3)
                    .map(i => `${i[order[0]]}\n${i[order[1]]} ${i[order[2]]}`)
                    .join(separator + '\n\n');
                this.text = formattedData + separator;
            }
            else {
                this.text = String(newText);
            }
        };
    }
    render() {
        return html `
  <div class="parent">
    <mdui-switch @input=${(e) => { this.checked = e.target.checked; }}>
      <mdui-icon slot="unchecked-icon" name="code"></mdui-icon>
      <mdui-icon slot="checked-icon" name="quiz"></mdui-icon>
    </mdui-switch>
    ${!this.checked ? html `
      <mdui-text-field label="Tag" style="justify-self: right;" @change=${(e) => { this.tag = e.target.value; }}></mdui-text-field>
    ` : html ``}

    <br>

    <textarea id="e0" class="code-editor" @input=${(e) => { this.text = String(this.figureOutText(e.target.value)); console.log(this.text); }}>
    </textarea>
  </div>
    `;
    }
};
BlockEditor.styles = css `
    // from https://stackoverflow.com/questions/6490252/vertically-centering-a-div-inside-another-div
    .parent {
      width: 600px;
    }

    .parent mdui-switch {
      transform: translateY(50%);
    }
    .parent mdui-text-field {
      width: 100px;
    }
  `;
__decorate([
    state()
], BlockEditor.prototype, "checked", void 0);
__decorate([
    property({ type: String })
], BlockEditor.prototype, "order", void 0);
__decorate([
    property({ type: String })
], BlockEditor.prototype, "text", void 0);
__decorate([
    state()
], BlockEditor.prototype, "tag", void 0);
BlockEditor = __decorate([
    customElement('block-editor')
], BlockEditor);
export { BlockEditor };
//# sourceMappingURL=block-editor.js.map