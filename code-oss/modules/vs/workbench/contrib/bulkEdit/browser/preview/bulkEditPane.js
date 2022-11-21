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
import 'vs/css!./bulkEdit';
import { WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { BulkEditDelegate, TextEditElementRenderer, FileElementRenderer, BulkEditDataSource, BulkEditIdentityProvider, FileElement, TextEditElement, BulkEditAccessibilityProvider, CategoryElementRenderer, BulkEditNaviLabelProvider, CategoryElement, BulkEditSorter } from 'vs/workbench/contrib/bulkEdit/browser/preview/bulkEditTree';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { localize } from 'vs/nls';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { BulkEditPreviewProvider, BulkFileOperations } from 'vs/workbench/contrib/bulkEdit/browser/preview/bulkEditPreview';
import { ILabelService } from 'vs/platform/label/common/label';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ResourceLabels } from 'vs/workbench/browser/labels';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import Severity from 'vs/base/common/severity';
import { basename, dirname } from 'vs/base/common/resources';
import { MenuId } from 'vs/platform/actions/common/actions';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ButtonBar } from 'vs/base/browser/ui/button/button';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
var State;
(function (State) {
    State["Data"] = "data";
    State["Message"] = "message";
})(State || (State = {}));
let BulkEditPane = class BulkEditPane extends ViewPane {
    _instaService;
    _editorService;
    _labelService;
    _textModelService;
    _dialogService;
    _contextMenuService;
    _storageService;
    static ID = 'refactorPreview';
    static ctxHasCategories = new RawContextKey('refactorPreview.hasCategories', false);
    static ctxGroupByFile = new RawContextKey('refactorPreview.groupByFile', true);
    static ctxHasCheckedChanges = new RawContextKey('refactorPreview.hasCheckedChanges', true);
    static _memGroupByFile = `${BulkEditPane.ID}.groupByFile`;
    _tree;
    _treeDataSource;
    _treeViewStates = new Map();
    _message;
    _ctxHasCategories;
    _ctxGroupByFile;
    _ctxHasCheckedChanges;
    _disposables = new DisposableStore();
    _sessionDisposables = new DisposableStore();
    _currentResolve;
    _currentInput;
    _currentProvider;
    constructor(options, _instaService, _editorService, _labelService, _textModelService, _dialogService, _contextMenuService, _storageService, contextKeyService, viewDescriptorService, keybindingService, contextMenuService, configurationService, openerService, themeService, telemetryService) {
        super({ ...options, titleMenuId: MenuId.BulkEditTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, _instaService, openerService, themeService, telemetryService);
        this._instaService = _instaService;
        this._editorService = _editorService;
        this._labelService = _labelService;
        this._textModelService = _textModelService;
        this._dialogService = _dialogService;
        this._contextMenuService = _contextMenuService;
        this._storageService = _storageService;
        this.element.classList.add('bulk-edit-panel', 'show-file-icons');
        this._ctxHasCategories = BulkEditPane.ctxHasCategories.bindTo(contextKeyService);
        this._ctxGroupByFile = BulkEditPane.ctxGroupByFile.bindTo(contextKeyService);
        this._ctxHasCheckedChanges = BulkEditPane.ctxHasCheckedChanges.bindTo(contextKeyService);
    }
    dispose() {
        this._tree.dispose();
        this._disposables.dispose();
    }
    renderBody(parent) {
        super.renderBody(parent);
        const resourceLabels = this._instaService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
        this._disposables.add(resourceLabels);
        const contentContainer = document.createElement('div');
        contentContainer.className = 'content';
        parent.appendChild(contentContainer);
        // tree
        const treeContainer = document.createElement('div');
        contentContainer.appendChild(treeContainer);
        this._treeDataSource = this._instaService.createInstance(BulkEditDataSource);
        this._treeDataSource.groupByFile = this._storageService.getBoolean(BulkEditPane._memGroupByFile, 0 /* StorageScope.PROFILE */, true);
        this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
        this._tree = this._instaService.createInstance(WorkbenchAsyncDataTree, this.id, treeContainer, new BulkEditDelegate(), [this._instaService.createInstance(TextEditElementRenderer), this._instaService.createInstance(FileElementRenderer, resourceLabels), this._instaService.createInstance(CategoryElementRenderer)], this._treeDataSource, {
            accessibilityProvider: this._instaService.createInstance(BulkEditAccessibilityProvider),
            identityProvider: new BulkEditIdentityProvider(),
            expandOnlyOnTwistieClick: true,
            multipleSelectionSupport: false,
            keyboardNavigationLabelProvider: new BulkEditNaviLabelProvider(),
            sorter: new BulkEditSorter(),
            selectionNavigation: true
        });
        this._disposables.add(this._tree.onContextMenu(this._onContextMenu, this));
        this._disposables.add(this._tree.onDidOpen(e => this._openElementAsEditor(e)));
        // buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons';
        contentContainer.appendChild(buttonsContainer);
        const buttonBar = new ButtonBar(buttonsContainer);
        this._disposables.add(buttonBar);
        const btnConfirm = buttonBar.addButton({ supportIcons: true, ...defaultButtonStyles });
        btnConfirm.label = localize('ok', 'Apply');
        btnConfirm.onDidClick(() => this.accept(), this, this._disposables);
        const btnCancel = buttonBar.addButton(defaultButtonStyles /*{  secondary: true } */);
        btnCancel.label = localize('cancel', 'Discard');
        btnCancel.onDidClick(() => this.discard(), this, this._disposables);
        // message
        this._message = document.createElement('span');
        this._message.className = 'message';
        this._message.innerText = localize('empty.msg', "Invoke a code action, like rename, to see a preview of its changes here.");
        parent.appendChild(this._message);
        //
        this._setState("message" /* State.Message */);
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        const treeHeight = height - 50;
        this._tree.getHTMLElement().parentElement.style.height = `${treeHeight}px`;
        this._tree.layout(treeHeight, width);
    }
    _setState(state) {
        this.element.dataset['state'] = state;
    }
    async setInput(edit, token) {
        this._setState("data" /* State.Data */);
        this._sessionDisposables.clear();
        this._treeViewStates.clear();
        if (this._currentResolve) {
            this._currentResolve(undefined);
            this._currentResolve = undefined;
        }
        const input = await this._instaService.invokeFunction(BulkFileOperations.create, edit);
        this._currentProvider = this._instaService.createInstance(BulkEditPreviewProvider, input);
        this._sessionDisposables.add(this._currentProvider);
        this._sessionDisposables.add(input);
        //
        const hasCategories = input.categories.length > 1;
        this._ctxHasCategories.set(hasCategories);
        this._treeDataSource.groupByFile = !hasCategories || this._treeDataSource.groupByFile;
        this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
        this._currentInput = input;
        return new Promise(resolve => {
            token.onCancellationRequested(() => resolve(undefined));
            this._currentResolve = resolve;
            this._setTreeInput(input);
            // refresh when check state changes
            this._sessionDisposables.add(input.checked.onDidChange(() => {
                this._tree.updateChildren();
                this._ctxHasCheckedChanges.set(input.checked.checkedCount > 0);
            }));
        });
    }
    hasInput() {
        return Boolean(this._currentInput);
    }
    async _setTreeInput(input) {
        const viewState = this._treeViewStates.get(this._treeDataSource.groupByFile);
        await this._tree.setInput(input, viewState);
        this._tree.domFocus();
        if (viewState) {
            return;
        }
        // async expandAll (max=10) is the default when no view state is given
        const expand = [...this._tree.getNode(input).children].slice(0, 10);
        while (expand.length > 0) {
            const { element } = expand.shift();
            if (element instanceof FileElement) {
                await this._tree.expand(element, true);
            }
            if (element instanceof CategoryElement) {
                await this._tree.expand(element, true);
                expand.push(...this._tree.getNode(element).children);
            }
        }
    }
    accept() {
        const conflicts = this._currentInput?.conflicts.list();
        if (!conflicts || conflicts.length === 0) {
            this._done(true);
            return;
        }
        let message;
        if (conflicts.length === 1) {
            message = localize('conflict.1', "Cannot apply refactoring because '{0}' has changed in the meantime.", this._labelService.getUriLabel(conflicts[0], { relative: true }));
        }
        else {
            message = localize('conflict.N', "Cannot apply refactoring because {0} other files have changed in the meantime.", conflicts.length);
        }
        this._dialogService.show(Severity.Warning, message).finally(() => this._done(false));
    }
    discard() {
        this._done(false);
    }
    _done(accept) {
        this._currentResolve?.(accept ? this._currentInput?.getWorkspaceEdit() : undefined);
        this._currentInput = undefined;
        this._setState("message" /* State.Message */);
        this._sessionDisposables.clear();
    }
    toggleChecked() {
        const [first] = this._tree.getFocus();
        if ((first instanceof FileElement || first instanceof TextEditElement) && !first.isDisabled()) {
            first.setChecked(!first.isChecked());
        }
    }
    groupByFile() {
        if (!this._treeDataSource.groupByFile) {
            this.toggleGrouping();
        }
    }
    groupByType() {
        if (this._treeDataSource.groupByFile) {
            this.toggleGrouping();
        }
    }
    toggleGrouping() {
        const input = this._tree.getInput();
        if (input) {
            // (1) capture view state
            const oldViewState = this._tree.getViewState();
            this._treeViewStates.set(this._treeDataSource.groupByFile, oldViewState);
            // (2) toggle and update
            this._treeDataSource.groupByFile = !this._treeDataSource.groupByFile;
            this._setTreeInput(input);
            // (3) remember preference
            this._storageService.store(BulkEditPane._memGroupByFile, this._treeDataSource.groupByFile, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
            this._ctxGroupByFile.set(this._treeDataSource.groupByFile);
        }
    }
    async _openElementAsEditor(e) {
        const options = { ...e.editorOptions };
        let fileElement;
        if (e.element instanceof TextEditElement) {
            fileElement = e.element.parent;
            options.selection = e.element.edit.textEdit.textEdit.range;
        }
        else if (e.element instanceof FileElement) {
            fileElement = e.element;
            options.selection = e.element.edit.textEdits[0]?.textEdit.textEdit.range;
        }
        else {
            // invalid event
            return;
        }
        const previewUri = this._currentProvider.asPreviewUri(fileElement.edit.uri);
        if (fileElement.edit.type & 4 /* BulkFileOperationType.Delete */) {
            // delete -> show single editor
            this._editorService.openEditor({
                label: localize('edt.title.del', "{0} (delete, refactor preview)", basename(fileElement.edit.uri)),
                resource: previewUri,
                options
            });
        }
        else {
            // rename, create, edits -> show diff editr
            let leftResource;
            try {
                (await this._textModelService.createModelReference(fileElement.edit.uri)).dispose();
                leftResource = fileElement.edit.uri;
            }
            catch {
                leftResource = BulkEditPreviewProvider.emptyPreview;
            }
            let typeLabel;
            if (fileElement.edit.type & 8 /* BulkFileOperationType.Rename */) {
                typeLabel = localize('rename', "rename");
            }
            else if (fileElement.edit.type & 2 /* BulkFileOperationType.Create */) {
                typeLabel = localize('create', "create");
            }
            let label;
            if (typeLabel) {
                label = localize('edt.title.2', "{0} ({1}, refactor preview)", basename(fileElement.edit.uri), typeLabel);
            }
            else {
                label = localize('edt.title.1', "{0} (refactor preview)", basename(fileElement.edit.uri));
            }
            this._editorService.openEditor({
                original: { resource: leftResource },
                modified: { resource: previewUri },
                label,
                description: this._labelService.getUriLabel(dirname(leftResource), { relative: true }),
                options
            }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
        }
    }
    _onContextMenu(e) {
        this._contextMenuService.showContextMenu({
            menuId: MenuId.BulkEditContext,
            contextKeyService: this.contextKeyService,
            getAnchor: () => e.anchor
        });
    }
};
BulkEditPane = __decorate([
    __param(1, IInstantiationService),
    __param(2, IEditorService),
    __param(3, ILabelService),
    __param(4, ITextModelService),
    __param(5, IDialogService),
    __param(6, IContextMenuService),
    __param(7, IStorageService),
    __param(8, IContextKeyService),
    __param(9, IViewDescriptorService),
    __param(10, IKeybindingService),
    __param(11, IContextMenuService),
    __param(12, IConfigurationService),
    __param(13, IOpenerService),
    __param(14, IThemeService),
    __param(15, ITelemetryService)
], BulkEditPane);
export { BulkEditPane };
