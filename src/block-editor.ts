/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import 'mdui';
import 'mdui/components/icon.js';
/**
 * An example element.
 *
 * @fires coun-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('block-editor')
export class BlockEditor extends LitElement {
  static override styles = css`
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
  @state()
  checked = false;

  @property({type: String})
  order = "201";

  @property({type: String})
  text = "";

  @state()
  tag = "";
  override render() {
    return html`
  <div class="parent">
    <mdui-switch @input=${(e: Object) => {this.checked = e.target.checked}}>
      <mdui-icon slot="unchecked-icon" name="code"></mdui-icon>
      <mdui-icon slot="checked-icon" name="quiz"></mdui-icon>
    </mdui-switch>
    ${!this.checked ? html`
      <mdui-text-field label="Tag" style="justify-self: right;" @change=${(e: Object) => {this.tag = e.target.value}}></mdui-text-field>
    ` : html``}

    <br>

    <textarea id="e0" class="code-editor" @input=${(e: Object) => {this.text = String(this.figureOutText(e.target.value)); console.log(this.text)}}>
    </textarea>
  </div>
    `;
  }

  figureOutText = (newText: String) => {
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
      this.text = String(newText)
    }
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'block-editor': BlockEditor;
  }
}

