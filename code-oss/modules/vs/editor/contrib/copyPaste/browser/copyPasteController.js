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
import { DataTransfers } from 'vs/base/browser/dnd';
import { addDisposableListener } from 'vs/base/browser/dom';
import { createCancelablePromise, raceCancellation } from 'vs/base/common/async';
import { createStringDataTransferItem, UriList } from 'vs/base/common/dataTransfer';
import { Disposable } from 'vs/base/common/lifecycle';
import { Mimes } from 'vs/base/common/mime';
import { Schemas } from 'vs/base/common/network';
import { generateUuid } from 'vs/base/common/uuid';
import { toVSDataTransfer } from 'vs/editor/browser/dnd';
import { IBulkEditService, ResourceTextEdit } from 'vs/editor/browser/services/bulkEditService';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { EditorStateCancellationTokenSource } from 'vs/editor/contrib/editorState/browser/editorState';
import { SnippetParser } from 'vs/editor/contrib/snippet/browser/snippetParser';
import { localize } from 'vs/nls';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProgressService } from 'vs/platform/progress/common/progress';
const vscodeClipboardMime = 'application/vnd.code.copyMetadata';
let CopyPasteController = class CopyPasteController extends Disposable {
    _bulkEditService;
    _clipboardService;
    _configurationService;
    _languageFeaturesService;
    _progressService;
    static ID = 'editor.contrib.copyPasteActionController';
    static get(editor) {
        return editor.getContribution(CopyPasteController.ID);
    }
    _editor;
    _currentClipboardItem;
    constructor(editor, _bulkEditService, _clipboardService, _configurationService, _languageFeaturesService, _progressService) {
        super();
        this._bulkEditService = _bulkEditService;
        this._clipboardService = _clipboardService;
        this._configurationService = _configurationService;
        this._languageFeaturesService = _languageFeaturesService;
        this._progressService = _progressService;
        this._editor = editor;
        const container = editor.getContainerDomNode();
        this._register(addDisposableListener(container, 'copy', e => this.handleCopy(e)));
        this._register(addDisposableListener(container, 'cut', e => this.handleCopy(e)));
        this._register(addDisposableListener(container, 'paste', e => this.handlePaste(e), true));
    }
    arePasteActionsEnabled(model) {
        if (this._configurationService.getValue('editor.experimental.pasteActions.enabled', { resource: model.uri })) {
            return true;
        }
        // TODO: This check is only here to support enabling `ipynb.pasteImagesAsAttachments.enabled` by default
        return model.uri.scheme === Schemas.vscodeNotebookCell;
    }
    handleCopy(e) {
        if (!e.clipboardData || !this._editor.hasTextFocus()) {
            return;
        }
        const model = this._editor.getModel();
        const selections = this._editor.getSelections();
        if (!model || !selections?.length) {
            return;
        }
        if (!this.arePasteActionsEnabled(model)) {
            return;
        }
        const ranges = [...selections];
        const primarySelection = selections[0];
        const wasFromEmptySelection = primarySelection.isEmpty();
        if (wasFromEmptySelection) {
            if (!this._editor.getOption(33 /* EditorOption.emptySelectionClipboard */)) {
                return;
            }
            ranges[0] = new Range(primarySelection.startLineNumber, 0, primarySelection.startLineNumber, model.getLineLength(primarySelection.startLineNumber));
        }
        const providers = this._languageFeaturesService.documentPasteEditProvider.ordered(model).filter(x => !!x.prepareDocumentPaste);
        if (!providers.length) {
            this.setCopyMetadata(e.clipboardData, { wasFromEmptySelection });
            return;
        }
        const dataTransfer = toVSDataTransfer(e.clipboardData);
        // Save off a handle pointing to data that VS Code maintains.
        const handle = generateUuid();
        this.setCopyMetadata(e.clipboardData, {
            id: handle,
            wasFromEmptySelection,
        });
        const promise = createCancelablePromise(async (token) => {
            const results = await Promise.all(providers.map(provider => {
                return provider.prepareDocumentPaste(model, ranges, dataTransfer, token);
            }));
            for (const result of results) {
                result?.forEach((value, key) => {
                    dataTransfer.replace(key, value);
                });
            }
            return dataTransfer;
        });
        this._currentClipboardItem?.dataTransferPromise.cancel();
        this._currentClipboardItem = { handle: handle, dataTransferPromise: promise };
    }
    setCopyMetadata(dataTransfer, metadata) {
        dataTransfer.setData(vscodeClipboardMime, JSON.stringify(metadata));
    }
    async handlePaste(e) {
        if (!e.clipboardData || !this._editor.hasTextFocus()) {
            return;
        }
        const selections = this._editor.getSelections();
        if (!selections?.length || !this._editor.hasModel()) {
            return;
        }
        const model = this._editor.getModel();
        if (!this.arePasteActionsEnabled(model)) {
            return;
        }
        let metadata;
        const rawMetadata = e.clipboardData?.getData(vscodeClipboardMime);
        if (rawMetadata && typeof rawMetadata === 'string') {
            metadata = JSON.parse(rawMetadata);
        }
        const providers = this._languageFeaturesService.documentPasteEditProvider.ordered(model);
        if (!providers.length) {
            return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
        const tokenSource = new EditorStateCancellationTokenSource(this._editor, 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */);
        try {
            const dataTransfer = toVSDataTransfer(e.clipboardData);
            if (metadata?.id && this._currentClipboardItem?.handle === metadata.id) {
                const toMergeDataTransfer = await this._currentClipboardItem.dataTransferPromise;
                if (tokenSource.token.isCancellationRequested) {
                    return;
                }
                toMergeDataTransfer.forEach((value, key) => {
                    dataTransfer.replace(key, value);
                });
            }
            if (!dataTransfer.has(Mimes.uriList)) {
                const resources = await this._clipboardService.readResources();
                if (tokenSource.token.isCancellationRequested) {
                    return;
                }
                if (resources.length) {
                    dataTransfer.append(Mimes.uriList, createStringDataTransferItem(UriList.create(resources)));
                }
            }
            dataTransfer.delete(vscodeClipboardMime);
            const providerEdit = await this._progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                delay: 750,
                title: localize('pasteProgressTitle', "Running paste handlers..."),
                cancellable: true,
            }, () => {
                return this.getProviderPasteEdit(providers, dataTransfer, model, selections, tokenSource.token);
            }, () => {
                return tokenSource.cancel();
            });
            if (tokenSource.token.isCancellationRequested) {
                return;
            }
            if (providerEdit) {
                const snippet = typeof providerEdit.insertText === 'string' ? SnippetParser.escape(providerEdit.insertText) : providerEdit.insertText.snippet;
                const combinedWorkspaceEdit = {
                    edits: [
                        new ResourceTextEdit(model.uri, {
                            range: Selection.liftSelection(this._editor.getSelection()),
                            text: snippet,
                            insertAsSnippet: true,
                        }),
                        ...(providerEdit.additionalEdit?.edits ?? [])
                    ]
                };
                await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor });
                return;
            }
            await this.applyDefaultPasteHandler(dataTransfer, metadata, tokenSource.token);
        }
        finally {
            tokenSource.dispose();
        }
    }
    getProviderPasteEdit(providers, dataTransfer, model, selections, token) {
        return raceCancellation((async () => {
            for (const provider of providers) {
                if (token.isCancellationRequested) {
                    return;
                }
                if (!isSupportedProvider(provider, dataTransfer)) {
                    continue;
                }
                const edit = await provider.provideDocumentPasteEdits(model, selections, dataTransfer, token);
                if (edit) {
                    return edit;
                }
            }
            return undefined;
        })(), token);
    }
    async applyDefaultPasteHandler(dataTransfer, metadata, token) {
        const textDataTransfer = dataTransfer.get(Mimes.text) ?? dataTransfer.get('text');
        if (!textDataTransfer) {
            return;
        }
        const text = await textDataTransfer.asString();
        if (token.isCancellationRequested) {
            return;
        }
        this._editor.trigger('keyboard', "paste" /* Handler.Paste */, {
            text: text,
            pasteOnNewLine: metadata?.wasFromEmptySelection,
            multicursorText: null
        });
    }
};
CopyPasteController = __decorate([
    __param(1, IBulkEditService),
    __param(2, IClipboardService),
    __param(3, IConfigurationService),
    __param(4, ILanguageFeaturesService),
    __param(5, IProgressService)
], CopyPasteController);
export { CopyPasteController };
function isSupportedProvider(provider, dataTransfer) {
    return provider.pasteMimeTypes.some(type => {
        if (type.toLowerCase() === DataTransfers.FILES.toLowerCase()) {
            return [...dataTransfer.values()].some(item => item.asFile());
        }
        return dataTransfer.has(type);
    });
}
