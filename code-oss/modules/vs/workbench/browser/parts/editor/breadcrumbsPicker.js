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
import { compareFileNames } from 'vs/base/common/comparers';
import { onUnexpectedError } from 'vs/base/common/errors';
import { Emitter } from 'vs/base/common/event';
import { createMatches } from 'vs/base/common/filters';
import * as glob from 'vs/base/common/glob';
import { DisposableStore, MutableDisposable, Disposable } from 'vs/base/common/lifecycle';
import { posix, relative } from 'vs/base/common/path';
import { basename, dirname, isEqual } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import 'vs/css!./media/breadcrumbscontrol';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { FileKind, IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchDataTree, WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { breadcrumbsPickerBackground, widgetShadow } from 'vs/platform/theme/common/colorRegistry';
import { isWorkspace, isWorkspaceFolder, IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ResourceLabels, DEFAULT_LABELS_CONTAINER } from 'vs/workbench/browser/labels';
import { BreadcrumbsConfig } from 'vs/workbench/browser/parts/editor/breadcrumbs';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { localize } from 'vs/nls';
import { IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
let BreadcrumbsPicker = class BreadcrumbsPicker {
    resource;
    _instantiationService;
    _themeService;
    _configurationService;
    _disposables = new DisposableStore();
    _domNode;
    _arrow;
    _treeContainer;
    _tree;
    _fakeEvent = new UIEvent('fakeEvent');
    _layoutInfo;
    _onWillPickElement = new Emitter();
    onWillPickElement = this._onWillPickElement.event;
    _previewDispoables = new MutableDisposable();
    constructor(parent, resource, _instantiationService, _themeService, _configurationService) {
        this.resource = resource;
        this._instantiationService = _instantiationService;
        this._themeService = _themeService;
        this._configurationService = _configurationService;
        this._domNode = document.createElement('div');
        this._domNode.className = 'monaco-breadcrumbs-picker show-file-icons';
        parent.appendChild(this._domNode);
    }
    dispose() {
        this._disposables.dispose();
        this._previewDispoables.dispose();
        this._onWillPickElement.dispose();
        this._domNode.remove();
        setTimeout(() => this._tree.dispose(), 0); // tree cannot be disposed while being opened...
    }
    async show(input, maxHeight, width, arrowSize, arrowOffset) {
        const theme = this._themeService.getColorTheme();
        const color = theme.getColor(breadcrumbsPickerBackground);
        this._arrow = document.createElement('div');
        this._arrow.className = 'arrow';
        this._arrow.style.borderColor = `transparent transparent ${color ? color.toString() : ''}`;
        this._domNode.appendChild(this._arrow);
        this._treeContainer = document.createElement('div');
        this._treeContainer.style.background = color ? color.toString() : '';
        this._treeContainer.style.paddingTop = '2px';
        this._treeContainer.style.boxShadow = `0 0 8px 2px ${this._themeService.getColorTheme().getColor(widgetShadow)}`;
        this._domNode.appendChild(this._treeContainer);
        this._layoutInfo = { maxHeight, width, arrowSize, arrowOffset, inputHeight: 0 };
        this._tree = this._createTree(this._treeContainer, input);
        this._disposables.add(this._tree.onDidOpen(async (e) => {
            const { element, editorOptions, sideBySide } = e;
            const didReveal = await this._revealElement(element, { ...editorOptions, preserveFocus: false }, sideBySide);
            if (!didReveal) {
                return;
            }
        }));
        this._disposables.add(this._tree.onDidChangeFocus(e => {
            this._previewDispoables.value = this._previewElement(e.elements[0]);
        }));
        this._disposables.add(this._tree.onDidChangeContentHeight(() => {
            this._layout();
        }));
        this._domNode.focus();
        try {
            await this._setInput(input);
            this._layout();
        }
        catch (err) {
            onUnexpectedError(err);
        }
    }
    _layout() {
        const headerHeight = 2 * this._layoutInfo.arrowSize;
        const treeHeight = Math.min(this._layoutInfo.maxHeight - headerHeight, this._tree.contentHeight);
        const totalHeight = treeHeight + headerHeight;
        this._domNode.style.height = `${totalHeight}px`;
        this._domNode.style.width = `${this._layoutInfo.width}px`;
        this._arrow.style.top = `-${2 * this._layoutInfo.arrowSize}px`;
        this._arrow.style.borderWidth = `${this._layoutInfo.arrowSize}px`;
        this._arrow.style.marginLeft = `${this._layoutInfo.arrowOffset}px`;
        this._treeContainer.style.height = `${treeHeight}px`;
        this._treeContainer.style.width = `${this._layoutInfo.width}px`;
        this._tree.layout(treeHeight, this._layoutInfo.width);
    }
    restoreViewState() { }
};
BreadcrumbsPicker = __decorate([
    __param(2, IInstantiationService),
    __param(3, IThemeService),
    __param(4, IConfigurationService)
], BreadcrumbsPicker);
export { BreadcrumbsPicker };
//#region - Files
class FileVirtualDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(_element) {
        return 'FileStat';
    }
}
class FileIdentityProvider {
    getId(element) {
        if (URI.isUri(element)) {
            return element.toString();
        }
        else if (isWorkspace(element)) {
            return element.id;
        }
        else if (isWorkspaceFolder(element)) {
            return element.uri.toString();
        }
        else {
            return element.resource.toString();
        }
    }
}
let FileDataSource = class FileDataSource {
    _fileService;
    constructor(_fileService) {
        this._fileService = _fileService;
    }
    hasChildren(element) {
        return URI.isUri(element)
            || isWorkspace(element)
            || isWorkspaceFolder(element)
            || element.isDirectory;
    }
    async getChildren(element) {
        if (isWorkspace(element)) {
            return element.folders;
        }
        let uri;
        if (isWorkspaceFolder(element)) {
            uri = element.uri;
        }
        else if (URI.isUri(element)) {
            uri = element;
        }
        else {
            uri = element.resource;
        }
        const stat = await this._fileService.resolve(uri);
        return stat.children ?? [];
    }
};
FileDataSource = __decorate([
    __param(0, IFileService)
], FileDataSource);
let FileRenderer = class FileRenderer {
    _labels;
    _configService;
    templateId = 'FileStat';
    constructor(_labels, _configService) {
        this._labels = _labels;
        this._configService = _configService;
    }
    renderTemplate(container) {
        return this._labels.create(container, { supportHighlights: true });
    }
    renderElement(node, index, templateData) {
        const fileDecorations = this._configService.getValue('explorer.decorations');
        const { element } = node;
        let resource;
        let fileKind;
        if (isWorkspaceFolder(element)) {
            resource = element.uri;
            fileKind = FileKind.ROOT_FOLDER;
        }
        else {
            resource = element.resource;
            fileKind = element.isDirectory ? FileKind.FOLDER : FileKind.FILE;
        }
        templateData.setFile(resource, {
            fileKind,
            hidePath: true,
            fileDecorations: fileDecorations,
            matches: createMatches(node.filterData),
            extraClasses: ['picker-item']
        });
    }
    disposeTemplate(templateData) {
        templateData.dispose();
    }
};
FileRenderer = __decorate([
    __param(1, IConfigurationService)
], FileRenderer);
class FileNavigationLabelProvider {
    getKeyboardNavigationLabel(element) {
        return element.name;
    }
}
class FileAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize('breadcrumbs', "Breadcrumbs");
    }
    getAriaLabel(element) {
        return element.name;
    }
}
let FileFilter = class FileFilter {
    _workspaceService;
    _cachedExpressions = new Map();
    _disposables = new DisposableStore();
    constructor(_workspaceService, configService) {
        this._workspaceService = _workspaceService;
        const config = BreadcrumbsConfig.FileExcludes.bindTo(configService);
        const update = () => {
            _workspaceService.getWorkspace().folders.forEach(folder => {
                const excludesConfig = config.getValue({ resource: folder.uri });
                if (!excludesConfig) {
                    return;
                }
                // adjust patterns to be absolute in case they aren't
                // free floating (**/)
                const adjustedConfig = {};
                for (const pattern in excludesConfig) {
                    if (typeof excludesConfig[pattern] !== 'boolean') {
                        continue;
                    }
                    const patternAbs = pattern.indexOf('**/') !== 0
                        ? posix.join(folder.uri.path, pattern)
                        : pattern;
                    adjustedConfig[patternAbs] = excludesConfig[pattern];
                }
                this._cachedExpressions.set(folder.uri.toString(), glob.parse(adjustedConfig));
            });
        };
        update();
        this._disposables.add(config);
        this._disposables.add(config.onDidChange(update));
        this._disposables.add(_workspaceService.onDidChangeWorkspaceFolders(update));
    }
    dispose() {
        this._disposables.dispose();
    }
    filter(element, _parentVisibility) {
        if (isWorkspaceFolder(element)) {
            // not a file
            return true;
        }
        const folder = this._workspaceService.getWorkspaceFolder(element.resource);
        if (!folder || !this._cachedExpressions.has(folder.uri.toString())) {
            // no folder or no filer
            return true;
        }
        const expression = this._cachedExpressions.get(folder.uri.toString());
        return !expression(relative(folder.uri.path, element.resource.path), basename(element.resource));
    }
};
FileFilter = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IConfigurationService)
], FileFilter);
export class FileSorter {
    compare(a, b) {
        if (isWorkspaceFolder(a) && isWorkspaceFolder(b)) {
            return a.index - b.index;
        }
        if (a.isDirectory === b.isDirectory) {
            // same type -> compare on names
            return compareFileNames(a.name, b.name);
        }
        else if (a.isDirectory) {
            return -1;
        }
        else {
            return 1;
        }
    }
}
let BreadcrumbsFilePicker = class BreadcrumbsFilePicker extends BreadcrumbsPicker {
    _workspaceService;
    _editorService;
    constructor(parent, resource, instantiationService, themeService, configService, _workspaceService, _editorService) {
        super(parent, resource, instantiationService, themeService, configService);
        this._workspaceService = _workspaceService;
        this._editorService = _editorService;
    }
    _createTree(container) {
        // tree icon theme specials
        this._treeContainer.classList.add('file-icon-themable-tree');
        this._treeContainer.classList.add('show-file-icons');
        const onFileIconThemeChange = (fileIconTheme) => {
            this._treeContainer.classList.toggle('align-icons-and-twisties', fileIconTheme.hasFileIcons && !fileIconTheme.hasFolderIcons);
            this._treeContainer.classList.toggle('hide-arrows', fileIconTheme.hidesExplorerArrows === true);
        };
        this._disposables.add(this._themeService.onDidFileIconThemeChange(onFileIconThemeChange));
        onFileIconThemeChange(this._themeService.getFileIconTheme());
        const labels = this._instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER /* TODO@Jo visibility propagation */);
        this._disposables.add(labels);
        return this._instantiationService.createInstance(WorkbenchAsyncDataTree, 'BreadcrumbsFilePicker', container, new FileVirtualDelegate(), [this._instantiationService.createInstance(FileRenderer, labels)], this._instantiationService.createInstance(FileDataSource), {
            multipleSelectionSupport: false,
            sorter: new FileSorter(),
            filter: this._instantiationService.createInstance(FileFilter),
            identityProvider: new FileIdentityProvider(),
            keyboardNavigationLabelProvider: new FileNavigationLabelProvider(),
            accessibilityProvider: this._instantiationService.createInstance(FileAccessibilityProvider),
            showNotFoundMessage: false,
            overrideStyles: {
                listBackground: breadcrumbsPickerBackground
            },
        });
    }
    async _setInput(element) {
        const { uri, kind } = element;
        let input;
        if (kind === FileKind.ROOT_FOLDER) {
            input = this._workspaceService.getWorkspace();
        }
        else {
            input = dirname(uri);
        }
        const tree = this._tree;
        await tree.setInput(input);
        let focusElement;
        for (const { element } of tree.getNode().children) {
            if (isWorkspaceFolder(element) && isEqual(element.uri, uri)) {
                focusElement = element;
                break;
            }
            else if (isEqual(element.resource, uri)) {
                focusElement = element;
                break;
            }
        }
        if (focusElement) {
            tree.reveal(focusElement, 0.5);
            tree.setFocus([focusElement], this._fakeEvent);
        }
        tree.domFocus();
    }
    _previewElement(_element) {
        return Disposable.None;
    }
    async _revealElement(element, options, sideBySide) {
        if (!isWorkspaceFolder(element) && element.isFile) {
            this._onWillPickElement.fire();
            await this._editorService.openEditor({ resource: element.resource, options }, sideBySide ? SIDE_GROUP : undefined);
            return true;
        }
        return false;
    }
};
BreadcrumbsFilePicker = __decorate([
    __param(2, IInstantiationService),
    __param(3, IThemeService),
    __param(4, IConfigurationService),
    __param(5, IWorkspaceContextService),
    __param(6, IEditorService)
], BreadcrumbsFilePicker);
export { BreadcrumbsFilePicker };
//#endregion
//#region - Outline
let OutlineTreeSorter = class OutlineTreeSorter {
    comparator;
    _order;
    constructor(comparator, uri, configService) {
        this.comparator = comparator;
        this._order = configService.getValue(uri, 'breadcrumbs.symbolSortOrder');
    }
    compare(a, b) {
        if (this._order === 'name') {
            return this.comparator.compareByName(a, b);
        }
        else if (this._order === 'type') {
            return this.comparator.compareByType(a, b);
        }
        else {
            return this.comparator.compareByPosition(a, b);
        }
    }
};
OutlineTreeSorter = __decorate([
    __param(2, ITextResourceConfigurationService)
], OutlineTreeSorter);
export class BreadcrumbsOutlinePicker extends BreadcrumbsPicker {
    _createTree(container, input) {
        const { config } = input.outline;
        return this._instantiationService.createInstance(WorkbenchDataTree, 'BreadcrumbsOutlinePicker', container, config.delegate, config.renderers, config.treeDataSource, {
            ...config.options,
            sorter: this._instantiationService.createInstance(OutlineTreeSorter, config.comparator, undefined),
            collapseByDefault: true,
            expandOnlyOnTwistieClick: true,
            multipleSelectionSupport: false,
            showNotFoundMessage: false
        });
    }
    _setInput(input) {
        const viewState = input.outline.captureViewState();
        this.restoreViewState = () => { viewState.dispose(); };
        const tree = this._tree;
        tree.setInput(input.outline);
        if (input.element !== input.outline) {
            tree.reveal(input.element, 0.5);
            tree.setFocus([input.element], this._fakeEvent);
        }
        tree.domFocus();
        return Promise.resolve();
    }
    _previewElement(element) {
        const outline = this._tree.getInput();
        return outline.preview(element);
    }
    async _revealElement(element, options, sideBySide) {
        this._onWillPickElement.fire();
        const outline = this._tree.getInput();
        await outline.reveal(element, options, sideBySide);
        return true;
    }
}
//#endregion
