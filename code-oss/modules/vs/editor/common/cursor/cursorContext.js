/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class CursorContext {
    _cursorContextBrand = undefined;
    model;
    viewModel;
    coordinatesConverter;
    cursorConfig;
    constructor(model, viewModel, coordinatesConverter, cursorConfig) {
        this.model = model;
        this.viewModel = viewModel;
        this.coordinatesConverter = coordinatesConverter;
        this.cursorConfig = cursorConfig;
    }
}
