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
import 'vs/css!./notebookOutline';
import { Codicon } from 'vs/base/common/codicons';
import { Emitter, Event } from 'vs/base/common/event';
import { combinedDisposable, Disposable, DisposableStore, MutableDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { CellRevealType } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookEditor';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IOutlineService } from 'vs/workbench/services/outline/browser/outline';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { createMatches } from 'vs/base/common/filters';
import { IconLabel } from 'vs/base/browser/ui/iconLabel/iconLabel';
import { IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { getIconClassesForLanguageId } from 'vs/editor/common/services/getIconClasses';
import { localize } from 'vs/nls';
import { IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { listErrorForeground, listWarningForeground } from 'vs/platform/theme/common/colorRegistry';
import { isEqual } from 'vs/base/common/resources';
import { IdleValue } from 'vs/base/common/async';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { marked } from 'vs/base/common/marked/marked';
import { renderMarkdownAsPlaintext } from 'vs/base/browser/markdownRenderer';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { executingStateIcon } from 'vs/workbench/contrib/notebook/browser/notebookIcons';
export class OutlineEntry {
    index;
    level;
    cell;
    label;
    isExecuting;
    isPaused;
    _children = [];
    _parent;
    _markerInfo;
    get icon() {
        return this.isExecuting && this.isPaused ? executingStateIcon :
            this.isExecuting ? ThemeIcon.modify(executingStateIcon, 'spin') :
                this.cell.cellKind === CellKind.Markup ? Codicon.markdown : Codicon.code;
    }
    constructor(index, level, cell, label, isExecuting, isPaused) {
        this.index = index;
        this.level = level;
        this.cell = cell;
        this.label = label;
        this.isExecuting = isExecuting;
        this.isPaused = isPaused;
    }
    addChild(entry) {
        this._children.push(entry);
        entry._parent = this;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._children;
    }
    get markerInfo() {
        return this._markerInfo;
    }
    updateMarkers(markerService) {
        if (this.cell.cellKind === CellKind.Code) {
            // a code cell can have marker
            const marker = markerService.read({ resource: this.cell.uri, severities: MarkerSeverity.Error | MarkerSeverity.Warning });
            if (marker.length === 0) {
                this._markerInfo = undefined;
            }
            else {
                const topSev = marker.find(a => a.severity === MarkerSeverity.Error)?.severity ?? MarkerSeverity.Warning;
                this._markerInfo = { topSev, count: marker.length };
            }
        }
        else {
            // a markdown cell can inherit markers from its children
            let topChild;
            for (const child of this.children) {
                child.updateMarkers(markerService);
                if (child.markerInfo) {
                    topChild = !topChild ? child.markerInfo.topSev : Math.max(child.markerInfo.topSev, topChild);
                }
            }
            this._markerInfo = topChild && { topSev: topChild, count: 0 };
        }
    }
    clearMarkers() {
        this._markerInfo = undefined;
        for (const child of this.children) {
            child.clearMarkers();
        }
    }
    find(cell, parents) {
        if (cell.id === this.cell.id) {
            return this;
        }
        parents.push(this);
        for (const child of this.children) {
            const result = child.find(cell, parents);
            if (result) {
                return result;
            }
        }
        parents.pop();
        return undefined;
    }
    asFlatList(bucket) {
        bucket.push(this);
        for (const child of this.children) {
            child.asFlatList(bucket);
        }
    }
}
class NotebookOutlineTemplate {
    container;
    iconClass;
    iconLabel;
    decoration;
    static templateId = 'NotebookOutlineRenderer';
    constructor(container, iconClass, iconLabel, decoration) {
        this.container = container;
        this.iconClass = iconClass;
        this.iconLabel = iconLabel;
        this.decoration = decoration;
    }
}
let NotebookOutlineRenderer = class NotebookOutlineRenderer {
    _themeService;
    _configurationService;
    templateId = NotebookOutlineTemplate.templateId;
    constructor(_themeService, _configurationService) {
        this._themeService = _themeService;
        this._configurationService = _configurationService;
    }
    renderTemplate(container) {
        container.classList.add('notebook-outline-element', 'show-file-icons');
        const iconClass = document.createElement('div');
        container.append(iconClass);
        const iconLabel = new IconLabel(container, { supportHighlights: true });
        const decoration = document.createElement('div');
        decoration.className = 'element-decoration';
        container.append(decoration);
        return new NotebookOutlineTemplate(container, iconClass, iconLabel, decoration);
    }
    renderElement(node, _index, template, _height) {
        const extraClasses = [];
        const options = {
            matches: createMatches(node.filterData),
            labelEscapeNewLines: true,
            extraClasses,
        };
        if (node.element.cell.cellKind === CellKind.Code && this._themeService.getFileIconTheme().hasFileIcons && !node.element.isExecuting) {
            template.iconClass.className = '';
            extraClasses.push(...getIconClassesForLanguageId(node.element.cell.language ?? ''));
        }
        else {
            template.iconClass.className = 'element-icon ' + ThemeIcon.asClassNameArray(node.element.icon).join(' ');
        }
        template.iconLabel.setLabel(node.element.label, undefined, options);
        const { markerInfo } = node.element;
        template.container.style.removeProperty('--outline-element-color');
        template.decoration.innerText = '';
        if (markerInfo) {
            const useBadges = this._configurationService.getValue("outline.problems.badges" /* OutlineConfigKeys.problemsBadges */);
            if (!useBadges) {
                template.decoration.classList.remove('bubble');
                template.decoration.innerText = '';
            }
            else if (markerInfo.count === 0) {
                template.decoration.classList.add('bubble');
                template.decoration.innerText = '\uea71';
            }
            else {
                template.decoration.classList.remove('bubble');
                template.decoration.innerText = markerInfo.count > 9 ? '9+' : String(markerInfo.count);
            }
            const color = this._themeService.getColorTheme().getColor(markerInfo.topSev === MarkerSeverity.Error ? listErrorForeground : listWarningForeground);
            const useColors = this._configurationService.getValue("outline.problems.colors" /* OutlineConfigKeys.problemsColors */);
            if (!useColors) {
                template.container.style.removeProperty('--outline-element-color');
                template.decoration.style.setProperty('--outline-element-color', color?.toString() ?? 'inherit');
            }
            else {
                template.container.style.setProperty('--outline-element-color', color?.toString() ?? 'inherit');
            }
        }
    }
    disposeTemplate(templateData) {
        templateData.iconLabel.dispose();
    }
};
NotebookOutlineRenderer = __decorate([
    __param(0, IThemeService),
    __param(1, IConfigurationService)
], NotebookOutlineRenderer);
class NotebookOutlineAccessibility {
    getAriaLabel(element) {
        return element.label;
    }
    getWidgetAriaLabel() {
        return '';
    }
}
class NotebookNavigationLabelProvider {
    getKeyboardNavigationLabel(element) {
        return element.label;
    }
}
class NotebookOutlineVirtualDelegate {
    getHeight(_element) {
        return 22;
    }
    getTemplateId(_element) {
        return NotebookOutlineTemplate.templateId;
    }
}
let NotebookQuickPickProvider = class NotebookQuickPickProvider {
    _getEntries;
    _themeService;
    constructor(_getEntries, _themeService) {
        this._getEntries = _getEntries;
        this._themeService = _themeService;
    }
    getQuickPickElements() {
        const bucket = [];
        for (const entry of this._getEntries()) {
            entry.asFlatList(bucket);
        }
        const result = [];
        const { hasFileIcons } = this._themeService.getFileIconTheme();
        for (const element of bucket) {
            // todo@jrieken it is fishy that codicons cannot be used with iconClasses
            // but file icons can...
            result.push({
                element,
                label: hasFileIcons ? element.label : `$(${element.icon.id}) ${element.label}`,
                ariaLabel: element.label,
                iconClasses: hasFileIcons ? getIconClassesForLanguageId(element.cell.language ?? '') : undefined,
            });
        }
        return result;
    }
};
NotebookQuickPickProvider = __decorate([
    __param(1, IThemeService)
], NotebookQuickPickProvider);
class NotebookComparator {
    _collator = new IdleValue(() => new Intl.Collator(undefined, { numeric: true }));
    compareByPosition(a, b) {
        return a.index - b.index;
    }
    compareByType(a, b) {
        return a.cell.cellKind - b.cell.cellKind || this._collator.value.compare(a.label, b.label);
    }
    compareByName(a, b) {
        return this._collator.value.compare(a.label, b.label);
    }
}
let NotebookCellOutline = class NotebookCellOutline {
    _editor;
    _target;
    _editorService;
    _markerService;
    _configurationService;
    _notebookExecutionStateService;
    _dispoables = new DisposableStore();
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    _uri;
    _entries = [];
    _activeEntry;
    _entriesDisposables = new DisposableStore();
    config;
    outlineKind = 'notebookCells';
    get activeElement() {
        return this._activeEntry;
    }
    constructor(_editor, _target, instantiationService, themeService, _editorService, _markerService, _configurationService, _notebookExecutionStateService) {
        this._editor = _editor;
        this._target = _target;
        this._editorService = _editorService;
        this._markerService = _markerService;
        this._configurationService = _configurationService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        const selectionListener = new MutableDisposable();
        this._dispoables.add(selectionListener);
        const installSelectionListener = () => {
            const notebookEditor = _editor.getControl();
            if (!notebookEditor?.hasModel()) {
                selectionListener.clear();
            }
            else {
                selectionListener.value = combinedDisposable(Event.debounce(notebookEditor.onDidChangeSelection, (last, _current) => last, 200)(this._recomputeActive, this), Event.debounce(notebookEditor.onDidChangeViewCells, (last, _current) => last ?? _current, 200)(this._recomputeState, this));
            }
        };
        this._dispoables.add(_editor.onDidChangeModel(() => {
            this._recomputeState();
            installSelectionListener();
        }));
        this._dispoables.add(_configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('notebook.outline.showCodeCells')) {
                this._recomputeState();
            }
        }));
        this._dispoables.add(themeService.onDidFileIconThemeChange(() => {
            this._onDidChange.fire({});
        }));
        this._dispoables.add(_notebookExecutionStateService.onDidChangeCellExecution(e => {
            if (!!this._editor.textModel && e.affectsNotebook(this._editor.textModel?.uri)) {
                this._recomputeState();
            }
        }));
        this._recomputeState();
        installSelectionListener();
        const options = {
            collapseByDefault: _target === 2 /* OutlineTarget.Breadcrumbs */ || (_target === 1 /* OutlineTarget.OutlinePane */ && _configurationService.getValue("outline.collapseItems" /* OutlineConfigKeys.collapseItems */) === "alwaysCollapse" /* OutlineConfigCollapseItemsValues.Collapsed */),
            expandOnlyOnTwistieClick: true,
            multipleSelectionSupport: false,
            accessibilityProvider: new NotebookOutlineAccessibility(),
            identityProvider: { getId: element => element.cell.id },
            keyboardNavigationLabelProvider: new NotebookNavigationLabelProvider()
        };
        const treeDataSource = { getChildren: parent => parent instanceof NotebookCellOutline ? this._entries : parent.children };
        const delegate = new NotebookOutlineVirtualDelegate();
        const renderers = [instantiationService.createInstance(NotebookOutlineRenderer)];
        const comparator = new NotebookComparator();
        this.config = {
            breadcrumbsDataSource: {
                getBreadcrumbElements: () => {
                    const result = [];
                    let candidate = this._activeEntry;
                    while (candidate) {
                        result.unshift(candidate);
                        candidate = candidate.parent;
                    }
                    return result;
                }
            },
            quickPickDataSource: instantiationService.createInstance(NotebookQuickPickProvider, () => this._entries),
            treeDataSource,
            delegate,
            renderers,
            comparator,
            options
        };
    }
    dispose() {
        this._onDidChange.dispose();
        this._dispoables.dispose();
        this._entriesDisposables.dispose();
    }
    _recomputeState() {
        this._entriesDisposables.clear();
        this._activeEntry = undefined;
        this._entries.length = 0;
        this._uri = undefined;
        const notebookEditorControl = this._editor.getControl();
        if (!notebookEditorControl) {
            return;
        }
        if (!notebookEditorControl.hasModel()) {
            return;
        }
        this._uri = notebookEditorControl.textModel.uri;
        const notebookEditorWidget = notebookEditorControl;
        if (notebookEditorWidget.getLength() === 0) {
            return;
        }
        let includeCodeCells = true;
        if (this._target === 1 /* OutlineTarget.OutlinePane */) {
            includeCodeCells = this._configurationService.getValue('notebook.outline.showCodeCells');
        }
        else if (this._target === 2 /* OutlineTarget.Breadcrumbs */) {
            includeCodeCells = this._configurationService.getValue('notebook.breadcrumbs.showCodeCells');
        }
        const focusedCellIndex = notebookEditorWidget.getFocus().start;
        const focused = notebookEditorWidget.cellAt(focusedCellIndex)?.handle;
        const entries = [];
        for (let i = 0; i < notebookEditorWidget.getLength(); i++) {
            const cell = notebookEditorWidget.cellAt(i);
            const isMarkdown = cell.cellKind === CellKind.Markup;
            if (!isMarkdown && !includeCodeCells) {
                continue;
            }
            // cap the amount of characters that we look at and use the following logic
            // - for MD prefer headings (each header is an entry)
            // - otherwise use the first none-empty line of the cell (MD or code)
            let content = this._getCellFirstNonEmptyLine(cell);
            let hasHeader = false;
            if (isMarkdown) {
                const fullContent = cell.getText().substring(0, 10000);
                for (const token of marked.lexer(fullContent, { gfm: true })) {
                    if (token.type === 'heading') {
                        hasHeader = true;
                        entries.push(new OutlineEntry(entries.length, token.depth, cell, renderMarkdownAsPlaintext({ value: token.text }).trim(), false, false));
                    }
                }
                if (!hasHeader) {
                    // no markdown syntax headers, try to find html tags
                    const match = fullContent.match(/<h([1-6]).*>(.*)<\/h\1>/i);
                    if (match) {
                        hasHeader = true;
                        const level = parseInt(match[1]);
                        const text = match[2].trim();
                        entries.push(new OutlineEntry(entries.length, level, cell, text, false, false));
                    }
                }
                if (!hasHeader) {
                    content = renderMarkdownAsPlaintext({ value: content });
                }
            }
            if (!hasHeader) {
                let preview = content.trim();
                if (preview.length === 0) {
                    // empty or just whitespace
                    preview = localize('empty', "empty cell");
                }
                const exeState = !isMarkdown && this._notebookExecutionStateService.getCellExecution(cell.uri);
                entries.push(new OutlineEntry(entries.length, 7, cell, preview, !!exeState, exeState ? exeState.isPaused : false));
            }
            if (cell.handle === focused) {
                this._activeEntry = entries[entries.length - 1];
            }
            // send an event whenever any of the cells change
            this._entriesDisposables.add(cell.model.onDidChangeContent(() => {
                this._recomputeState();
                this._onDidChange.fire({});
            }));
        }
        // build a tree from the list of entries
        if (entries.length > 0) {
            const result = [entries[0]];
            const parentStack = [entries[0]];
            for (let i = 1; i < entries.length; i++) {
                const entry = entries[i];
                while (true) {
                    const len = parentStack.length;
                    if (len === 0) {
                        // root node
                        result.push(entry);
                        parentStack.push(entry);
                        break;
                    }
                    else {
                        const parentCandidate = parentStack[len - 1];
                        if (parentCandidate.level < entry.level) {
                            parentCandidate.addChild(entry);
                            parentStack.push(entry);
                            break;
                        }
                        else {
                            parentStack.pop();
                        }
                    }
                }
            }
            this._entries = result;
        }
        // feature: show markers with each cell
        const markerServiceListener = new MutableDisposable();
        this._entriesDisposables.add(markerServiceListener);
        const updateMarkerUpdater = () => {
            const doUpdateMarker = (clear) => {
                for (const entry of this._entries) {
                    if (clear) {
                        entry.clearMarkers();
                    }
                    else {
                        entry.updateMarkers(this._markerService);
                    }
                }
            };
            if (this._configurationService.getValue("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                markerServiceListener.value = this._markerService.onMarkerChanged(e => {
                    if (e.some(uri => notebookEditorWidget.getCellsInRange().some(cell => isEqual(cell.uri, uri)))) {
                        doUpdateMarker(false);
                        this._onDidChange.fire({});
                    }
                });
                doUpdateMarker(false);
            }
            else {
                markerServiceListener.clear();
                doUpdateMarker(true);
            }
        };
        updateMarkerUpdater();
        this._entriesDisposables.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("outline.problems.enabled" /* OutlineConfigKeys.problemsEnabled */)) {
                updateMarkerUpdater();
                this._onDidChange.fire({});
            }
        }));
        this._onDidChange.fire({});
    }
    _recomputeActive() {
        let newActive;
        const notebookEditorWidget = this._editor.getControl();
        if (notebookEditorWidget) {
            if (notebookEditorWidget.hasModel() && notebookEditorWidget.getLength() > 0) {
                const cell = notebookEditorWidget.cellAt(notebookEditorWidget.getFocus().start);
                if (cell) {
                    for (const entry of this._entries) {
                        newActive = entry.find(cell, []);
                        if (newActive) {
                            break;
                        }
                    }
                }
            }
        }
        if (newActive !== this._activeEntry) {
            this._activeEntry = newActive;
            this._onDidChange.fire({ affectOnlyActiveElement: true });
        }
    }
    _getCellFirstNonEmptyLine(cell) {
        const textBuffer = cell.textBuffer;
        for (let i = 0; i < textBuffer.getLineCount(); i++) {
            const firstNonWhitespace = textBuffer.getLineFirstNonWhitespaceColumn(i + 1);
            const lineLength = textBuffer.getLineLength(i + 1);
            if (firstNonWhitespace < lineLength) {
                return textBuffer.getLineContent(i + 1);
            }
        }
        return cell.getText().substring(0, 10000);
    }
    get isEmpty() {
        return this._entries.length === 0;
    }
    get uri() {
        return this._uri;
    }
    async reveal(entry, options, sideBySide) {
        await this._editorService.openEditor({
            resource: entry.cell.uri,
            options: {
                ...options,
                override: this._editor.input?.editorId,
                cellRevealType: CellRevealType.NearTopIfOutsideViewport
            },
        }, sideBySide ? SIDE_GROUP : undefined);
    }
    preview(entry) {
        const widget = this._editor.getControl();
        if (!widget) {
            return Disposable.None;
        }
        widget.revealInCenterIfOutsideViewport(entry.cell);
        const ids = widget.deltaCellDecorations([], [{
                handle: entry.cell.handle,
                options: { className: 'nb-symbolHighlight', outputClassName: 'nb-symbolHighlight' }
            }]);
        return toDisposable(() => { widget.deltaCellDecorations(ids, []); });
    }
    captureViewState() {
        const widget = this._editor.getControl();
        const viewState = widget?.getEditorViewState();
        return toDisposable(() => {
            if (viewState) {
                widget?.restoreListViewState(viewState);
            }
        });
    }
};
NotebookCellOutline = __decorate([
    __param(2, IInstantiationService),
    __param(3, IThemeService),
    __param(4, IEditorService),
    __param(5, IMarkerService),
    __param(6, IConfigurationService),
    __param(7, INotebookExecutionStateService)
], NotebookCellOutline);
export { NotebookCellOutline };
let NotebookOutlineCreator = class NotebookOutlineCreator {
    _instantiationService;
    dispose;
    constructor(outlineService, _instantiationService) {
        this._instantiationService = _instantiationService;
        const reg = outlineService.registerOutlineCreator(this);
        this.dispose = () => reg.dispose();
    }
    matches(candidate) {
        return candidate.getId() === NotebookEditor.ID;
    }
    async createOutline(editor, target) {
        return this._instantiationService.createInstance(NotebookCellOutline, editor, target);
    }
};
NotebookOutlineCreator = __decorate([
    __param(0, IOutlineService),
    __param(1, IInstantiationService)
], NotebookOutlineCreator);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookOutlineCreator, 4 /* LifecyclePhase.Eventually */);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    id: 'notebook',
    order: 100,
    type: 'object',
    'properties': {
        'notebook.outline.showCodeCells': {
            type: 'boolean',
            default: false,
            markdownDescription: localize('outline.showCodeCells', "When enabled notebook outline shows code cells.")
        },
        'notebook.breadcrumbs.showCodeCells': {
            type: 'boolean',
            default: true,
            markdownDescription: localize('breadcrumbs.showCodeCells', "When enabled notebook breadcrumbs contain code cells.")
        },
    }
});
