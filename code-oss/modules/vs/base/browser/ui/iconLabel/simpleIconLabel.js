/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { reset } from 'vs/base/browser/dom';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
export class SimpleIconLabel {
    _container;
    constructor(_container) {
        this._container = _container;
    }
    set text(text) {
        reset(this._container, ...renderLabelWithIcons(text ?? ''));
    }
    set title(title) {
        this._container.title = title;
    }
}
