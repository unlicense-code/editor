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
import { raceCancellation } from 'vs/base/common/async';
import { UriList, VSDataTransfer } from 'vs/base/common/dataTransfer';
import { Disposable } from 'vs/base/common/lifecycle';
import { Mimes } from 'vs/base/common/mime';
import { relativePath } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { addExternalEditorsDropData, toVSDataTransfer } from 'vs/editor/browser/dnd';
import { EditorContributionInstantiation, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { IBulkEditService, ResourceTextEdit } from 'vs/editor/browser/services/bulkEditService';
import { Range } from 'vs/editor/common/core/range';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { EditorStateCancellationTokenSource } from 'vs/editor/contrib/editorState/browser/editorState';
import { SnippetParser } from 'vs/editor/contrib/snippet/browser/snippetParser';
import { localize } from 'vs/nls';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
let DropIntoEditorController = class DropIntoEditorController extends Disposable {
    _bulkEditService;
    _languageFeaturesService;
    _progressService;
    static ID = 'editor.contrib.dropIntoEditorController';
    constructor(editor, _bulkEditService, _languageFeaturesService, _progressService, workspaceContextService) {
        super();
        this._bulkEditService = _bulkEditService;
        this._languageFeaturesService = _languageFeaturesService;
        this._progressService = _progressService;
        this._register(editor.onDropIntoEditor(e => this.onDropIntoEditor(editor, e.position, e.event)));
        this._languageFeaturesService.documentOnDropEditProvider.register('*', new DefaultOnDropProvider(workspaceContextService));
    }
    async onDropIntoEditor(editor, position, dragEvent) {
        if (!dragEvent.dataTransfer || !editor.hasModel()) {
            return;
        }
        const model = editor.getModel();
        const initialModelVersion = model.getVersionId();
        const ourDataTransfer = await this.extractDataTransferData(dragEvent);
        if (ourDataTransfer.size === 0) {
            return;
        }
        if (editor.getModel().getVersionId() !== initialModelVersion) {
            return;
        }
        const tokenSource = new EditorStateCancellationTokenSource(editor, 1 /* CodeEditorStateFlag.Value */);
        try {
            const providers = this._languageFeaturesService.documentOnDropEditProvider.ordered(model);
            const providerEdit = await this._progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                delay: 750,
                title: localize('dropProgressTitle', "Running drop handlers..."),
                cancellable: true,
            }, () => {
                return raceCancellation((async () => {
                    for (const provider of providers) {
                        const edit = await provider.provideDocumentOnDropEdits(model, position, ourDataTransfer, tokenSource.token);
                        if (tokenSource.token.isCancellationRequested) {
                            return undefined;
                        }
                        if (edit) {
                            return edit;
                        }
                    }
                    return undefined;
                })(), tokenSource.token);
            }, () => {
                tokenSource.cancel();
            });
            if (tokenSource.token.isCancellationRequested || editor.getModel().getVersionId() !== initialModelVersion) {
                return;
            }
            if (providerEdit) {
                const snippet = typeof providerEdit.insertText === 'string' ? SnippetParser.escape(providerEdit.insertText) : providerEdit.insertText.snippet;
                const combinedWorkspaceEdit = {
                    edits: [
                        new ResourceTextEdit(model.uri, {
                            range: new Range(position.lineNumber, position.column, position.lineNumber, position.column),
                            text: snippet,
                            insertAsSnippet: true,
                        }),
                        ...(providerEdit.additionalEdit?.edits ?? [])
                    ]
                };
                await this._bulkEditService.apply(combinedWorkspaceEdit, { editor });
                return;
            }
        }
        finally {
            tokenSource.dispose();
        }
    }
    async extractDataTransferData(dragEvent) {
        if (!dragEvent.dataTransfer) {
            return new VSDataTransfer();
        }
        const textEditorDataTransfer = toVSDataTransfer(dragEvent.dataTransfer);
        addExternalEditorsDropData(textEditorDataTransfer, dragEvent);
        return textEditorDataTransfer;
    }
};
DropIntoEditorController = __decorate([
    __param(1, IBulkEditService),
    __param(2, ILanguageFeaturesService),
    __param(3, IProgressService),
    __param(4, IWorkspaceContextService)
], DropIntoEditorController);
export { DropIntoEditorController };
let DefaultOnDropProvider = class DefaultOnDropProvider {
    _workspaceContextService;
    constructor(_workspaceContextService) {
        this._workspaceContextService = _workspaceContextService;
    }
    async provideDocumentOnDropEdits(_model, _position, dataTransfer, _token) {
        const urlListEntry = dataTransfer.get(Mimes.uriList);
        if (urlListEntry) {
            const urlList = await urlListEntry.asString();
            const snippet = this.getUriListInsertText(urlList);
            if (snippet) {
                return { insertText: snippet };
            }
        }
        const textEntry = dataTransfer.get('text') ?? dataTransfer.get(Mimes.text);
        if (textEntry) {
            const text = await textEntry.asString();
            return { insertText: text };
        }
        return undefined;
    }
    getUriListInsertText(strUriList) {
        const uris = [];
        for (const resource of UriList.parse(strUriList)) {
            try {
                uris.push(URI.parse(resource));
            }
            catch {
                // noop
            }
        }
        if (!uris.length) {
            return;
        }
        return uris
            .map(uri => {
            const root = this._workspaceContextService.getWorkspaceFolder(uri);
            if (root) {
                const rel = relativePath(root.uri, uri);
                if (rel) {
                    return rel;
                }
            }
            return uri.fsPath;
        })
            .join(' ');
    }
};
DefaultOnDropProvider = __decorate([
    __param(0, IWorkspaceContextService)
], DefaultOnDropProvider);
registerEditorContribution(DropIntoEditorController.ID, DropIntoEditorController, EditorContributionInstantiation.Idle);
