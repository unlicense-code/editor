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
import * as glob from 'vs/base/common/glob';
import { INotebookService, SimpleNotebookProviderInfo } from 'vs/workbench/contrib/notebook/common/notebookService';
import { isEqual, joinPath } from 'vs/base/common/resources';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INotebookEditorModelResolverService } from 'vs/workbench/contrib/notebook/common/notebookEditorModelResolverService';
import { ILabelService } from 'vs/platform/label/common/label';
import { Schemas } from 'vs/base/common/network';
import { IFileService } from 'vs/platform/files/common/files';
import { AbstractResourceEditorInput } from 'vs/workbench/common/editor/resourceEditorInput';
import { onUnexpectedError } from 'vs/base/common/errors';
import { VSBuffer } from 'vs/base/common/buffer';
let NotebookEditorInput = class NotebookEditorInput extends AbstractResourceEditorInput {
    viewType;
    options;
    _notebookService;
    _notebookModelResolverService;
    _fileDialogService;
    _instantiationService;
    static create(instantiationService, resource, viewType, options = {}) {
        return instantiationService.createInstance(NotebookEditorInput, resource, viewType, options);
    }
    static ID = 'workbench.input.notebook';
    _editorModelReference = null;
    _sideLoadedListener;
    _defaultDirtyState = false;
    constructor(resource, viewType, options, _notebookService, _notebookModelResolverService, _fileDialogService, _instantiationService, labelService, fileService) {
        super(resource, undefined, labelService, fileService);
        this.viewType = viewType;
        this.options = options;
        this._notebookService = _notebookService;
        this._notebookModelResolverService = _notebookModelResolverService;
        this._fileDialogService = _fileDialogService;
        this._instantiationService = _instantiationService;
        this._defaultDirtyState = !!options.startDirty;
        // Automatically resolve this input when the "wanted" model comes to life via
        // some other way. This happens only once per input and resolve disposes
        // this listener
        this._sideLoadedListener = _notebookService.onDidAddNotebookDocument(e => {
            if (e.viewType === this.viewType && e.uri.toString() === this.resource.toString()) {
                this.resolve().catch(onUnexpectedError);
            }
        });
    }
    dispose() {
        this._sideLoadedListener.dispose();
        this._editorModelReference?.dispose();
        this._editorModelReference = null;
        super.dispose();
    }
    get typeId() {
        return NotebookEditorInput.ID;
    }
    get editorId() {
        return this.viewType;
    }
    get capabilities() {
        let capabilities = 0 /* EditorInputCapabilities.None */;
        if (this.resource.scheme === Schemas.untitled) {
            capabilities |= 4 /* EditorInputCapabilities.Untitled */;
        }
        if (this._editorModelReference) {
            if (this._editorModelReference.object.isReadonly()) {
                capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            }
        }
        else {
            if (this.fileService.hasCapability(this.resource, 2048 /* FileSystemProviderCapabilities.Readonly */)) {
                capabilities |= 2 /* EditorInputCapabilities.Readonly */;
            }
        }
        if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
            capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
        }
        return capabilities;
    }
    getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
        if (!this.hasCapability(4 /* EditorInputCapabilities.Untitled */) || this._editorModelReference?.object.hasAssociatedFilePath()) {
            return super.getDescription(verbosity);
        }
        return undefined; // no description for untitled notebooks without associated file path
    }
    isDirty() {
        if (!this._editorModelReference) {
            return this._defaultDirtyState;
        }
        return this._editorModelReference.object.isDirty();
    }
    async save(group, options) {
        if (this._editorModelReference) {
            if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return this.saveAs(group, options);
            }
            else {
                await this._editorModelReference.object.save(options);
            }
            return this;
        }
        return undefined;
    }
    async saveAs(group, options) {
        if (!this._editorModelReference) {
            return undefined;
        }
        const provider = this._notebookService.getContributedNotebookType(this.viewType);
        if (!provider) {
            return undefined;
        }
        const pathCandidate = this.hasCapability(4 /* EditorInputCapabilities.Untitled */) ? await this._suggestName(provider, this.labelService.getUriBasenameLabel(this.resource)) : this._editorModelReference.object.resource;
        let target;
        if (this._editorModelReference.object.hasAssociatedFilePath()) {
            target = pathCandidate;
        }
        else {
            target = await this._fileDialogService.pickFileToSave(pathCandidate, options?.availableFileSystems);
            if (!target) {
                return undefined; // save cancelled
            }
        }
        if (!provider.matches(target)) {
            const patterns = provider.selectors.map(pattern => {
                if (typeof pattern === 'string') {
                    return pattern;
                }
                if (glob.isRelativePattern(pattern)) {
                    return `${pattern} (base ${pattern.base})`;
                }
                if (pattern.exclude) {
                    return `${pattern.include} (exclude: ${pattern.exclude})`;
                }
                else {
                    return `${pattern.include}`;
                }
            }).join(', ');
            throw new Error(`File name ${target} is not supported by ${provider.providerDisplayName}.\n\nPlease make sure the file name matches following patterns:\n${patterns}`);
        }
        return await this._editorModelReference.object.saveAs(target);
    }
    async _suggestName(provider, suggestedFilename) {
        // guess file extensions
        const firstSelector = provider.selectors[0];
        let selectorStr = firstSelector && typeof firstSelector === 'string' ? firstSelector : undefined;
        if (!selectorStr && firstSelector) {
            const include = firstSelector.include;
            if (typeof include === 'string') {
                selectorStr = include;
            }
        }
        if (selectorStr) {
            const matches = /^\*\.([A-Za-z_-]*)$/.exec(selectorStr);
            if (matches && matches.length > 1) {
                const fileExt = matches[1];
                if (!suggestedFilename.endsWith(fileExt)) {
                    return joinPath(await this._fileDialogService.defaultFilePath(), suggestedFilename + '.' + fileExt);
                }
            }
        }
        return joinPath(await this._fileDialogService.defaultFilePath(), suggestedFilename);
    }
    // called when users rename a notebook document
    async rename(group, target) {
        if (this._editorModelReference) {
            const contributedNotebookProviders = this._notebookService.getContributedNotebookTypes(target);
            if (contributedNotebookProviders.find(provider => provider.id === this._editorModelReference.object.viewType)) {
                return this._move(group, target);
            }
        }
        return undefined;
    }
    _move(_group, newResource) {
        const editorInput = NotebookEditorInput.create(this._instantiationService, newResource, this.viewType);
        return { editor: editorInput };
    }
    async revert(_group, options) {
        if (this._editorModelReference && this._editorModelReference.object.isDirty()) {
            await this._editorModelReference.object.revert(options);
        }
    }
    async resolve(perf) {
        if (!await this._notebookService.canResolve(this.viewType)) {
            return null;
        }
        perf?.mark('extensionActivated');
        // we are now loading the notebook and don't need to listen to
        // "other" loading anymore
        this._sideLoadedListener.dispose();
        if (!this._editorModelReference) {
            const ref = await this._notebookModelResolverService.resolve(this.resource, this.viewType);
            if (this._editorModelReference) {
                // Re-entrant, double resolve happened. Dispose the addition references and proceed
                // with the truth.
                ref.dispose();
                return this._editorModelReference.object;
            }
            this._editorModelReference = ref;
            if (this.isDisposed()) {
                this._editorModelReference.dispose();
                this._editorModelReference = null;
                return null;
            }
            this._register(this._editorModelReference.object.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this._register(this._editorModelReference.object.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
            if (this._editorModelReference.object.isDirty()) {
                this._onDidChangeDirty.fire();
            }
        }
        else {
            this._editorModelReference.object.load();
        }
        if (this.options._backupId) {
            const info = await this._notebookService.withNotebookDataProvider(this._editorModelReference.object.notebook.viewType);
            if (!(info instanceof SimpleNotebookProviderInfo)) {
                throw new Error('CANNOT open file notebook with this provider');
            }
            const data = await info.serializer.dataToNotebook(VSBuffer.fromString(JSON.stringify({ __webview_backup: this.options._backupId })));
            this._editorModelReference.object.notebook.applyEdits([
                {
                    editType: 1 /* CellEditType.Replace */,
                    index: 0,
                    count: this._editorModelReference.object.notebook.length,
                    cells: data.cells
                }
            ], true, undefined, () => undefined, undefined, false);
            if (this.options._workingCopy) {
                this.options._backupId = undefined;
                this.options._workingCopy = undefined;
                this.options.startDirty = undefined;
            }
        }
        return this._editorModelReference.object;
    }
    toUntyped() {
        return {
            resource: this.preferredResource,
            options: {
                override: this.viewType
            }
        };
    }
    matches(otherInput) {
        if (super.matches(otherInput)) {
            return true;
        }
        if (otherInput instanceof NotebookEditorInput) {
            return this.viewType === otherInput.viewType && isEqual(this.resource, otherInput.resource);
        }
        return false;
    }
};
NotebookEditorInput = __decorate([
    __param(3, INotebookService),
    __param(4, INotebookEditorModelResolverService),
    __param(5, IFileDialogService),
    __param(6, IInstantiationService),
    __param(7, ILabelService),
    __param(8, IFileService)
], NotebookEditorInput);
export { NotebookEditorInput };
export function isCompositeNotebookEditorInput(thing) {
    return !!thing
        && typeof thing === 'object'
        && Array.isArray(thing.editorInputs)
        && (thing.editorInputs.every(input => input instanceof NotebookEditorInput));
}
