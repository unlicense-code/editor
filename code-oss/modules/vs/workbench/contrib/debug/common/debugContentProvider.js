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
import { localize } from 'vs/nls';
import { getMimeTypes } from 'vs/editor/common/services/languagesAssociations';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { DEBUG_SCHEME, IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { Source } from 'vs/workbench/contrib/debug/common/debugSource';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Range } from 'vs/editor/common/core/range';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { PLAINTEXT_LANGUAGE_ID } from 'vs/editor/common/languages/modesRegistry';
import { ErrorNoTelemetry } from 'vs/base/common/errors';
/**
 * Debug URI format
 *
 * a debug URI represents a Source object and the debug session where the Source comes from.
 *
 *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
 *       \___/ \____________/ \__________________________________________/ \______/
 *         |          |                             |                          |
 *      scheme   source.path                    session id            source.reference
 *
 * the arbitrary_path and the session id are encoded with 'encodeURIComponent'
 *
 */
let DebugContentProvider = class DebugContentProvider {
    debugService;
    modelService;
    languageService;
    editorWorkerService;
    static INSTANCE;
    pendingUpdates = new Map();
    constructor(textModelResolverService, debugService, modelService, languageService, editorWorkerService) {
        this.debugService = debugService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.editorWorkerService = editorWorkerService;
        textModelResolverService.registerTextModelContentProvider(DEBUG_SCHEME, this);
        DebugContentProvider.INSTANCE = this;
    }
    dispose() {
        this.pendingUpdates.forEach(cancellationSource => cancellationSource.dispose());
    }
    provideTextContent(resource) {
        return this.createOrUpdateContentModel(resource, true);
    }
    /**
     * Reload the model content of the given resource.
     * If there is no model for the given resource, this method does nothing.
     */
    static refreshDebugContent(resource) {
        DebugContentProvider.INSTANCE?.createOrUpdateContentModel(resource, false);
    }
    /**
     * Create or reload the model content of the given resource.
     */
    createOrUpdateContentModel(resource, createIfNotExists) {
        const model = this.modelService.getModel(resource);
        if (!model && !createIfNotExists) {
            // nothing to do
            return null;
        }
        let session;
        if (resource.query) {
            const data = Source.getEncodedDebugData(resource);
            session = this.debugService.getModel().getSession(data.sessionId);
        }
        if (!session) {
            // fallback: use focused session
            session = this.debugService.getViewModel().focusedSession;
        }
        if (!session) {
            return Promise.reject(new ErrorNoTelemetry(localize('unable', "Unable to resolve the resource without a debug session")));
        }
        const createErrModel = (errMsg) => {
            this.debugService.sourceIsNotAvailable(resource);
            const languageSelection = this.languageService.createById(PLAINTEXT_LANGUAGE_ID);
            const message = errMsg
                ? localize('canNotResolveSourceWithError', "Could not load source '{0}': {1}.", resource.path, errMsg)
                : localize('canNotResolveSource', "Could not load source '{0}'.", resource.path);
            return this.modelService.createModel(message, languageSelection, resource);
        };
        return session.loadSource(resource).then(response => {
            if (response && response.body) {
                if (model) {
                    const newContent = response.body.content;
                    // cancel and dispose an existing update
                    const cancellationSource = this.pendingUpdates.get(model.id);
                    cancellationSource?.cancel();
                    // create and keep update token
                    const myToken = new CancellationTokenSource();
                    this.pendingUpdates.set(model.id, myToken);
                    // update text model
                    return this.editorWorkerService.computeMoreMinimalEdits(model.uri, [{ text: newContent, range: model.getFullModelRange() }]).then(edits => {
                        // remove token
                        this.pendingUpdates.delete(model.id);
                        if (!myToken.token.isCancellationRequested && edits && edits.length > 0) {
                            // use the evil-edit as these models show in readonly-editor only
                            model.applyEdits(edits.map(edit => EditOperation.replace(Range.lift(edit.range), edit.text)));
                        }
                        return model;
                    });
                }
                else {
                    // create text model
                    const mime = response.body.mimeType || getMimeTypes(resource)[0];
                    const languageSelection = this.languageService.createByMimeType(mime);
                    return this.modelService.createModel(response.body.content, languageSelection, resource);
                }
            }
            return createErrModel();
        }, (err) => createErrModel(err.message));
    }
};
DebugContentProvider = __decorate([
    __param(0, ITextModelService),
    __param(1, IDebugService),
    __param(2, IModelService),
    __param(3, ILanguageService),
    __param(4, IEditorWorkerService)
], DebugContentProvider);
export { DebugContentProvider };
