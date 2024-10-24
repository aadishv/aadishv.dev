/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { LitElement } from 'lit';
import 'mdui';
import 'mdui/components/icon.js';
/**
 * An example element.
 *
 * @fires coun-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class BlockEditor extends LitElement {
    static styles: import("lit").CSSResult;
    checked: boolean;
    order: string;
    text: string;
    tag: string;
    render(): import("lit-html").TemplateResult<1>;
    figureOutText: (newText: String) => void;
}
declare global {
    interface HTMLElementTagNameMap {
        'block-editor': BlockEditor;
    }
}
//# sourceMappingURL=block-editor.d.ts.map