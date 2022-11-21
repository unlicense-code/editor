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
import { VSBuffer } from 'vs/base/common/buffer';
import { Schemas } from 'vs/base/common/network';
import { basename } from 'vs/base/common/path';
import { dirname, isEqual } from 'vs/base/common/resources';
import { assertIsDefined } from 'vs/base/common/types';
import { generateUuid } from 'vs/base/common/uuid';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { ICustomEditorService } from 'vs/workbench/contrib/customEditor/common/customEditor';
import { IWebviewService } from 'vs/workbench/contrib/webview/browser/webview';
import { IWebviewWorkbenchService, LazilyResolvedWebviewEditorInput } from 'vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
let CustomEditorInput = class CustomEditorInput extends LazilyResolvedWebviewEditorInput {
    instantiationService;
    labelService;
    customEditorService;
    fileDialogService;
    undoRedoService;
    fileService;
    static create(instantiationService, resource, viewType, group, options) {
        return instantiationService.invokeFunction(accessor => {
            // If it's an untitled file we must populate the untitledDocumentData
            const untitledString = accessor.get(IUntitledTextEditorService).getValue(resource);
            const untitledDocumentData = untitledString ? VSBuffer.fromString(untitledString) : undefined;
            const id = generateUuid();
            const webview = accessor.get(IWebviewService).createWebviewOverlay({
                id,
                providedViewType: viewType,
                options: { customClasses: options?.customClasses },
                contentOptions: {},
                extension: undefined,
            });
            const input = instantiationService.createInstance(CustomEditorInput, { resource, viewType, id }, webview, { untitledDocumentData: untitledDocumentData, oldResource: options?.oldResource });
            if (typeof group !== 'undefined') {
                input.updateGroup(group);
            }
            return input;
        });
    }
    static typeId = 'workbench.editors.webviewEditor';
    _editorResource;
    oldResource;
    _defaultDirtyState;
    _backupId;
    _untitledDocumentData;
    get resource() { return this._editorResource; }
    _modelRef;
    constructor(init, webview, options, webviewWorkbenchService, instantiationService, labelService, customEditorService, fileDialogService, undoRedoService, fileService) {
        super({ id: init.id, providedId: init.viewType, viewType: init.viewType, name: '' }, webview, webviewWorkbenchService);
        this.instantiationService = instantiationService;
        this.labelService = labelService;
        this.customEditorService = customEditorService;
        this.fileDialogService = fileDialogService;
        this.undoRedoService = undoRedoService;
        this.fileService = fileService;
        this._editorResource = init.resource;
        this.oldResource = options.oldResource;
        this._defaultDirtyState = options.startsDirty;
        this._backupId = options.backupId;
        this._untitledDocumentData = options.untitledDocumentData;
        this.registerListeners();
    }
    registerListeners() {
        // Clear our labels on certain label related events
        this._register(this.labelService.onDidChangeFormatters(e => this.onLabelEvent(e.scheme)));
        this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onLabelEvent(e.scheme)));
        this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onLabelEvent(e.scheme)));
    }
    onLabelEvent(scheme) {
        if (scheme === this.resource.scheme) {
            this.updateLabel();
        }
    }
    updateLabel() {
        // Clear any cached labels from before
        this._shortDescription = undefined;
        this._mediumDescription = undefined;
        this._longDescription = undefined;
        this._shortTitle = undefined;
        this._mediumTitle = undefined;
        this._longTitle = undefined;
        // Trigger recompute of label
        this._onDidChangeLabel.fire();
    }
    get typeId() {
        return CustomEditorInput.typeId;
    }
    get editorId() {
        return this.viewType;
    }
    get capabilities() {
        let capabilities = 0 /* EditorInputCapabilities.None */;
        capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
        if (!this.customEditorService.getCustomEditorCapabilities(this.viewType)?.supportsMultipleEditorsPerDocument) {
            capabilities |= 8 /* EditorInputCapabilities.Singleton */;
        }
        if (this._modelRef) {
            if (this._modelRef.object.isReadonly()) {
                capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            }
        }
        else {
            if (this.fileService.hasCapability(this.resource, 2048 /* FileSystemProviderCapabilities.Readonly */)) {
                capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            }
        }
        if (this.resource.scheme === Schemas.untitled) {
            capabilities |= 4 /* EditorInputCapabilities.Untitled */;
        }
        return capabilities;
    }
    getName() {
        return basename(this.labelService.getUriLabel(this.resource));
    }
    getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
        switch (verbosity) {
            case 0 /* Verbosity.SHORT */:
                return this.shortDescription;
            case 2 /* Verbosity.LONG */:
                return this.longDescription;
            case 1 /* Verbosity.MEDIUM */:
            default:
                return this.mediumDescription;
        }
    }
    _shortDescription = undefined;
    get shortDescription() {
        if (typeof this._shortDescription !== 'string') {
            this._shortDescription = this.labelService.getUriBasenameLabel(dirname(this.resource));
        }
        return this._shortDescription;
    }
    _mediumDescription = undefined;
    get mediumDescription() {
        if (typeof this._mediumDescription !== 'string') {
            this._mediumDescription = this.labelService.getUriLabel(dirname(this.resource), { relative: true });
        }
        return this._mediumDescription;
    }
    _longDescription = undefined;
    get longDescription() {
        if (typeof this._longDescription !== 'string') {
            this._longDescription = this.labelService.getUriLabel(dirname(this.resource));
        }
        return this._longDescription;
    }
    _shortTitle = undefined;
    get shortTitle() {
        if (typeof this._shortTitle !== 'string') {
            this._shortTitle = this.getName();
        }
        return this._shortTitle;
    }
    _mediumTitle = undefined;
    get mediumTitle() {
        if (typeof this._mediumTitle !== 'string') {
            this._mediumTitle = this.labelService.getUriLabel(this.resource, { relative: true });
        }
        return this._mediumTitle;
    }
    _longTitle = undefined;
    get longTitle() {
        if (typeof this._longTitle !== 'string') {
            this._longTitle = this.labelService.getUriLabel(this.resource);
        }
        return this._longTitle;
    }
    getTitle(verbosity) {
        switch (verbosity) {
            case 0 /* Verbosity.SHORT */:
                return this.shortTitle;
            case 2 /* Verbosity.LONG */:
                return this.longTitle;
            default:
            case 1 /* Verbosity.MEDIUM */:
                return this.mediumTitle;
        }
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        return this === other || (other instanceof CustomEditorInput
            && this.viewType === other.viewType
            && isEqual(this.resource, other.resource));
    }
    copy() {
        return CustomEditorInput.create(this.instantiationService, this.resource, this.viewType, this.group, this.webview.options);
    }
    isDirty() {
        if (!this._modelRef) {
            return !!this._defaultDirtyState;
        }
        return this._modelRef.object.isDirty();
    }
    async save(groupId, options) {
        if (!this._modelRef) {
            return undefined;
        }
        const target = await this._modelRef.object.saveCustomEditor(options);
        if (!target) {
            return undefined; // save cancelled
        }
        // Different URIs == untyped input returned to allow resolver to possibly resolve to a different editor type
        if (!isEqual(target, this.resource)) {
            return { resource: target };
        }
        return this;
    }
    async saveAs(groupId, options) {
        if (!this._modelRef) {
            return undefined;
        }
        const dialogPath = this._editorResource;
        const target = await this.fileDialogService.pickFileToSave(dialogPath, options?.availableFileSystems);
        if (!target) {
            return undefined; // save cancelled
        }
        if (!await this._modelRef.object.saveCustomEditorAs(this._editorResource, target, options)) {
            return undefined;
        }
        return (await this.rename(groupId, target))?.editor;
    }
    async revert(group, options) {
        if (this._modelRef) {
            return this._modelRef.object.revert(options);
        }
        this._defaultDirtyState = false;
        this._onDidChangeDirty.fire();
    }
    async resolve() {
        await super.resolve();
        if (this.isDisposed()) {
            return null;
        }
        if (!this._modelRef) {
            const oldCapabilities = this.capabilities;
            this._modelRef = this._register(assertIsDefined(await this.customEditorService.models.tryRetain(this.resource, this.viewType)));
            this._register(this._modelRef.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this._register(this._modelRef.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
            // If we're loading untitled file data we should ensure it's dirty
            if (this._untitledDocumentData) {
                this._defaultDirtyState = true;
            }
            if (this.isDirty()) {
                this._onDidChangeDirty.fire();
            }
            if (this.capabilities !== oldCapabilities) {
                this._onDidChangeCapabilities.fire();
            }
        }
        return null;
    }
    async rename(group, newResource) {
        // We return an untyped editor input which can then be resolved in the editor service
        return { editor: { resource: newResource } };
    }
    undo() {
        assertIsDefined(this._modelRef);
        return this.undoRedoService.undo(this.resource);
    }
    redo() {
        assertIsDefined(this._modelRef);
        return this.undoRedoService.redo(this.resource);
    }
    _moveHandler;
    onMove(handler) {
        // TODO: Move this to the service
        this._moveHandler = handler;
    }
    transfer(other) {
        if (!super.transfer(other)) {
            return;
        }
        other._moveHandler = this._moveHandler;
        this._moveHandler = undefined;
        return other;
    }
    get backupId() {
        if (this._modelRef) {
            return this._modelRef.object.backupId;
        }
        return this._backupId;
    }
    get untitledDocumentData() {
        return this._untitledDocumentData;
    }
    toUntyped() {
        return {
            resource: this.resource,
            options: {
                override: this.viewType
            }
        };
    }
};
CustomEditorInput = __decorate([
    __param(3, IWebviewWorkbenchService),
    __param(4, IInstantiationService),
    __param(5, ILabelService),
    __param(6, ICustomEditorService),
    __param(7, IFileDialogService),
    __param(8, IUndoRedoService),
    __param(9, IFileService)
], CustomEditorInput);
export { CustomEditorInput };
