/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditorTheme } from 'vs/editor/common/editorTheme';
export class ViewContext {
    configuration;
    viewModel;
    viewLayout;
    theme;
    constructor(configuration, theme, model) {
        this.configuration = configuration;
        this.theme = new EditorTheme(theme);
        this.viewModel = model;
        this.viewLayout = model.viewLayout;
    }
    addEventHandler(eventHandler) {
        this.viewModel.addViewEventHandler(eventHandler);
    }
    removeEventHandler(eventHandler) {
        this.viewModel.removeViewEventHandler(eventHandler);
    }
}
