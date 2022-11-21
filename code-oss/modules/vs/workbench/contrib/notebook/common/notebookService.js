/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const INotebookService = createDecorator('notebookService');
export class ComplexNotebookProviderInfo {
    viewType;
    controller;
    extensionData;
    constructor(viewType, controller, extensionData) {
        this.viewType = viewType;
        this.controller = controller;
        this.extensionData = extensionData;
    }
}
export class SimpleNotebookProviderInfo {
    viewType;
    serializer;
    extensionData;
    constructor(viewType, serializer, extensionData) {
        this.viewType = viewType;
        this.serializer = serializer;
        this.extensionData = extensionData;
    }
}
