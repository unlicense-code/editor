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
import { assertIsDefined } from 'vs/base/common/types';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { toAction } from 'vs/base/common/actions';
import { VIEWLET_ID, TEXT_FILE_EDITOR_ID, BINARY_TEXT_FILE_MODE } from 'vs/workbench/contrib/files/common/files';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { AbstractTextCodeEditor } from 'vs/workbench/browser/parts/editor/textCodeEditor';
import { isTextEditorViewState, DEFAULT_EDITOR_ASSOCIATION } from 'vs/workbench/common/editor';
import { applyTextEditorOptions } from 'vs/workbench/common/editor/editorOptions';
import { BinaryEditorModel } from 'vs/workbench/common/editor/binaryEditorModel';
import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { FileOperationError, IFileService } from 'vs/platform/files/common/files';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { createErrorWithActions } from 'vs/base/common/errorMessage';
import { EditorActivation } from 'vs/platform/editor/common/editor';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
/**
 * An implementation of editor for file system resources.
 */
let TextFileEditor = class TextFileEditor extends AbstractTextCodeEditor {
    paneCompositeService;
    contextService;
    textFileService;
    explorerService;
    uriIdentityService;
    pathService;
    configurationService;
    static ID = TEXT_FILE_EDITOR_ID;
    constructor(telemetryService, fileService, paneCompositeService, instantiationService, contextService, storageService, textResourceConfigurationService, editorService, themeService, editorGroupService, textFileService, explorerService, uriIdentityService, pathService, configurationService) {
        super(TextFileEditor.ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService);
        this.paneCompositeService = paneCompositeService;
        this.contextService = contextService;
        this.textFileService = textFileService;
        this.explorerService = explorerService;
        this.uriIdentityService = uriIdentityService;
        this.pathService = pathService;
        this.configurationService = configurationService;
        // Clear view state for deleted files
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        // Move view state for moved files
        this._register(this.fileService.onDidRunOperation(e => this.onDidRunOperation(e)));
    }
    onDidFilesChange(e) {
        for (const resource of e.rawDeleted) {
            this.clearEditorViewState(resource);
        }
    }
    onDidRunOperation(e) {
        if (e.operation === 2 /* FileOperation.MOVE */ && e.target) {
            this.moveEditorViewState(e.resource, e.target.resource, this.uriIdentityService.extUri);
        }
    }
    getTitle() {
        if (this.input) {
            return this.input.getName();
        }
        return localize('textFileEditor', "Text File Editor");
    }
    get input() {
        return this._input;
    }
    async setInput(input, options, context, token) {
        // Set input and resolve
        await super.setInput(input, options, context, token);
        try {
            const resolvedModel = await input.resolve();
            // Check for cancellation
            if (token.isCancellationRequested) {
                return;
            }
            // There is a special case where the text editor has to handle binary file editor input: if a binary file
            // has been resolved and cached before, it maybe an actual instance of BinaryEditorModel. In this case our text
            // editor has to open this model using the binary editor. We return early in this case.
            if (resolvedModel instanceof BinaryEditorModel) {
                return this.openAsBinary(input, options);
            }
            const textFileModel = resolvedModel;
            // Editor
            const control = assertIsDefined(this.editorControl);
            control.setModel(textFileModel.textEditorModel);
            // Restore view state (unless provided by options)
            if (!isTextEditorViewState(options?.viewState)) {
                const editorViewState = this.loadEditorViewState(input, context);
                if (editorViewState) {
                    if (options?.selection) {
                        editorViewState.cursorState = []; // prevent duplicate selections via options
                    }
                    control.restoreViewState(editorViewState);
                }
            }
            // Apply options to editor if any
            if (options) {
                applyTextEditorOptions(options, control, 1 /* ScrollType.Immediate */);
            }
            // Since the resolved model provides information about being readonly
            // or not, we apply it here to the editor even though the editor input
            // was already asked for being readonly or not. The rationale is that
            // a resolved model might have more specific information about being
            // readonly or not that the input did not have.
            control.updateOptions({ readOnly: textFileModel.isReadonly() });
        }
        catch (error) {
            await this.handleSetInputError(error, input, options);
        }
    }
    async handleSetInputError(error, input, options) {
        // In case we tried to open a file inside the text editor and the response
        // indicates that this is not a text file, reopen the file through the binary
        // editor.
        if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */) {
            return this.openAsBinary(input, options);
        }
        // Similar, handle case where we were asked to open a folder in the text editor.
        if (error.fileOperationResult === 0 /* FileOperationResult.FILE_IS_DIRECTORY */) {
            let action;
            if (this.contextService.isInsideWorkspace(input.preferredResource)) {
                action = toAction({
                    id: 'workbench.files.action.reveal', label: localize('reveal', "Reveal in Explorer View"), run: async () => {
                        await this.paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
                        return this.explorerService.select(input.preferredResource, true);
                    }
                });
            }
            else {
                action = toAction({
                    id: 'workbench.files.action.ok', label: localize('ok', "OK"), run: async () => {
                        // No operation possible, but clicking OK will close the editor
                    }
                });
            }
            throw createErrorWithActions(new FileOperationError(localize('fileIsDirectoryError', "File is a directory"), 0 /* FileOperationResult.FILE_IS_DIRECTORY */), [action]);
        }
        // Offer to create a file from the error if we have a file not found and the name is valid
        if (error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */ && await this.pathService.hasValidBasename(input.preferredResource)) {
            const fileNotFoundError = createErrorWithActions(new FileOperationError(localize('fileNotFoundError', "File not found"), 1 /* FileOperationResult.FILE_NOT_FOUND */), [
                toAction({
                    id: 'workbench.files.action.createMissingFile', label: localize('createFile', "Create File"), run: async () => {
                        await this.textFileService.create([{ resource: input.preferredResource }]);
                        return this.editorService.openEditor({
                            resource: input.preferredResource,
                            options: {
                                pinned: true // new file gets pinned by default
                            }
                        });
                    }
                })
            ]);
            throw fileNotFoundError;
        }
        // Otherwise make sure the error bubbles up
        throw error;
    }
    openAsBinary(input, options) {
        const defaultBinaryEditor = this.configurationService.getValue('workbench.editor.defaultBinaryEditor');
        const group = this.group ?? this.editorGroupService.activeGroup;
        const editorOptions = {
            ...options,
            // Make sure to not steal away the currently active group
            // because we are triggering another openEditor() call
            // and do not control the initial intent that resulted
            // in us now opening as binary.
            activation: EditorActivation.PRESERVE
        };
        // Check configuration and determine whether we open the binary
        // file input in a different editor or going through the same
        // editor.
        // Going through the same editor is debt, and a better solution
        // would be to introduce a real editor for the binary case
        // and avoid enforcing binary or text on the file editor input.
        if (defaultBinaryEditor && defaultBinaryEditor !== '' && defaultBinaryEditor !== DEFAULT_EDITOR_ASSOCIATION.id) {
            this.doOpenAsBinaryInDifferentEditor(group, defaultBinaryEditor, input, editorOptions);
        }
        else {
            this.doOpenAsBinaryInSameEditor(group, defaultBinaryEditor, input, editorOptions);
        }
    }
    doOpenAsBinaryInDifferentEditor(group, editorId, editor, editorOptions) {
        this.editorService.replaceEditors([{
                editor,
                replacement: { resource: editor.resource, options: { ...editorOptions, override: editorId } }
            }], group);
    }
    doOpenAsBinaryInSameEditor(group, editorId, editor, editorOptions) {
        // Open binary as text
        if (editorId === DEFAULT_EDITOR_ASSOCIATION.id) {
            editor.setForceOpenAsText();
            editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE); // https://github.com/microsoft/vscode/issues/131076
            editorOptions = { ...editorOptions, forceReload: true }; // Same pane and same input, must force reload to clear cached state
        }
        // Open as binary
        else {
            editor.setForceOpenAsBinary();
        }
        group.openEditor(editor, editorOptions);
    }
    clearInput() {
        super.clearInput();
        // Clear Model
        this.editorControl?.setModel(null);
    }
    tracksEditorViewState(input) {
        return input instanceof FileEditorInput;
    }
    tracksDisposedEditorViewState() {
        return true; // track view state even for disposed editors
    }
};
TextFileEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IFileService),
    __param(2, IPaneCompositePartService),
    __param(3, IInstantiationService),
    __param(4, IWorkspaceContextService),
    __param(5, IStorageService),
    __param(6, ITextResourceConfigurationService),
    __param(7, IEditorService),
    __param(8, IThemeService),
    __param(9, IEditorGroupsService),
    __param(10, ITextFileService),
    __param(11, IExplorerService),
    __param(12, IUriIdentityService),
    __param(13, IPathService),
    __param(14, IConfigurationService)
], TextFileEditor);
export { TextFileEditor };
