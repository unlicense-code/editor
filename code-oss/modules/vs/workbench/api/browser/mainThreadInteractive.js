/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { DisposableStore } from 'vs/base/common/lifecycle';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { ExtHostContext, MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IInteractiveDocumentService } from 'vs/workbench/contrib/interactive/browser/interactiveDocumentService';
let MainThreadInteractive = class MainThreadInteractive {
    _proxy;
    _disposables = new DisposableStore();
    constructor(extHostContext, interactiveDocumentService) {
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostInteractive);
        this._disposables.add(interactiveDocumentService.onWillAddInteractiveDocument((e) => {
            this._proxy.$willAddInteractiveDocument(e.inputUri, '\n', PLAINTEXT_LANGUAGE_ID, e.notebookUri);
        }));
        this._disposables.add(interactiveDocumentService.onWillRemoveInteractiveDocument((e) => {
            this._proxy.$willRemoveInteractiveDocument(e.inputUri, e.notebookUri);
        }));
    }
    dispose() {
        this._disposables.dispose();
    }
};
MainThreadInteractive = __decorate([
    extHostNamedCustomer(MainContext.MainThreadInteractive),
    __param(1, IInteractiveDocumentService)
], MainThreadInteractive);
export { MainThreadInteractive };
