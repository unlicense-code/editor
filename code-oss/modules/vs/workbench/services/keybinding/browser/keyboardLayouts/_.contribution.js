/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class KeyboardLayoutContribution {
    static INSTANCE = new KeyboardLayoutContribution();
    _layoutInfos = [];
    get layoutInfos() {
        return this._layoutInfos;
    }
    constructor() {
    }
    registerKeyboardLayout(layout) {
        this._layoutInfos.push(layout);
    }
}
