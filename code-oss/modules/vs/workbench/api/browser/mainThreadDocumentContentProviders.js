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
import { onUnexpectedError } from 'vs/base/common/errors';
import { dispose, DisposableMap } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Range } from 'vs/editor/common/core/range';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { extHostNamedCustomer } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ExtHostContext, MainContext } from '../common/extHost.protocol';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
let MainThreadDocumentContentProviders = class MainThreadDocumentContentProviders {
    _textModelResolverService;
    _languageService;
    _modelService;
    _editorWorkerService;
    _resourceContentProvider = new DisposableMap();
    _pendingUpdate = new Map();
    _proxy;
    constructor(extHostContext, _textModelResolverService, _languageService, _modelService, _editorWorkerService) {
        this._textModelResolverService = _textModelResolverService;
        this._languageService = _languageService;
        this._modelService = _modelService;
        this._editorWorkerService = _editorWorkerService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocumentContentProviders);
    }
    dispose() {
        this._resourceContentProvider.dispose();
        dispose(this._pendingUpdate.values());
    }
    $registerTextContentProvider(handle, scheme) {
        const registration = this._textModelResolverService.registerTextModelContentProvider(scheme, {
            provideTextContent: (uri) => {
                return this._proxy.$provideTextDocumentContent(handle, uri).then(value => {
                    if (typeof value === 'string') {
                        const firstLineText = value.substr(0, 1 + value.search(/\r?\n/));
                        const languageSelection = this._languageService.createByFilepathOrFirstLine(uri, firstLineText);
                        return this._modelService.createModel(value, languageSelection, uri);
                    }
                    return null;
                });
            }
        });
        this._resourceContentProvider.set(handle, registration);
    }
    $unregisterTextContentProvider(handle) {
        this._resourceContentProvider.deleteAndDispose(handle);
    }
    $onVirtualDocumentChange(uri, value) {
        const model = this._modelService.getModel(URI.revive(uri));
        if (!model) {
            return;
        }
        // cancel and dispose an existing update
        const pending = this._pendingUpdate.get(model.id);
        pending?.cancel();
        // create and keep update token
        const myToken = new CancellationTokenSource();
        this._pendingUpdate.set(model.id, myToken);
        this._editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: value, range: model.getFullModelRange() }]).then(edits => {
            // remove token
            this._pendingUpdate.delete(model.id);
            if (myToken.token.isCancellationRequested) {
                // ignore this
                return;
            }
            if (edits && edits.length > 0) {
                // use the evil-edit as these models show in readonly-editor only
                model.applyEdits(edits.map(edit => EditOperation.replace(Range.lift(edit.range), edit.text)));
            }
        }).catch(onUnexpectedError);
    }
};
MainThreadDocumentContentProviders = __decorate([
    extHostNamedCustomer(MainContext.MainThreadDocumentContentProviders),
    __param(1, ITextModelService),
    __param(2, ILanguageService),
    __param(3, IModelService),
    __param(4, IEditorWorkerService)
], MainThreadDocumentContentProviders);
export { MainThreadDocumentContentProviders };
