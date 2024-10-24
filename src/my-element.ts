/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, css, html, /*css*/} from 'lit';
import {customElement, /*property*/} from 'lit/decorators.js';
import './block-editor.js';
import siteData from './data.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

// Generate a color scheme based on #0061a4 and set the <html> element to that color scheme
/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  static override styles = css`
    h1.top-text {
      font-size: 100px;
    }
    .top-text {
      justify-self: center;
    }
    .main-text {
      justify-self: center;
    }
  `;

  override render() {
    let topText = siteData.main_page.top_text;
    return html`
    <div style="display: inline; width: 50px"></div>
    <h1 class="top-text">👋 Hi, I'm Aadish</h1>
    <p class="main-text">
      ${unsafeHTML(topText)}
    </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
