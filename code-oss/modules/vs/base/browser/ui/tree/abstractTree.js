/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { $, append, clearNode, createStyleSheet, h, hasParentWithClass } from 'vs/base/browser/dom';
import { DomEmitter } from 'vs/base/browser/event';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { FindInput } from 'vs/base/browser/ui/findinput/findInput';
import { ElementsDragAndDropData } from 'vs/base/browser/ui/list/listView';
import { isButton, isInputElement, isMonacoEditor, List, MouseController } from 'vs/base/browser/ui/list/listWidget';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { getVisibleState, isFilterResult } from 'vs/base/browser/ui/tree/indexTreeModel';
import { TreeError, TreeMouseEventTarget } from 'vs/base/browser/ui/tree/tree';
import { Action } from 'vs/base/common/actions';
import { distinct, equals, firstOrDefault, range } from 'vs/base/common/arrays';
import { disposableTimeout, timeout } from 'vs/base/common/async';
import { Codicon } from 'vs/base/common/codicons';
import { SetMap } from 'vs/base/common/collections';
import { Emitter, Event, EventBufferer, Relay } from 'vs/base/common/event';
import { fuzzyScore, FuzzyScore } from 'vs/base/common/filters';
import { Disposable, DisposableStore, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { clamp } from 'vs/base/common/numbers';
import { isNumber } from 'vs/base/common/types';
import 'vs/css!./media/tree';
import { localize } from 'vs/nls';
class TreeElementsDragAndDropData extends ElementsDragAndDropData {
    data;
    set context(context) {
        this.data.context = context;
    }
    get context() {
        return this.data.context;
    }
    constructor(data) {
        super(data.elements.map(node => node.element));
        this.data = data;
    }
}
function asTreeDragAndDropData(data) {
    if (data instanceof ElementsDragAndDropData) {
        return new TreeElementsDragAndDropData(data);
    }
    return data;
}
class TreeNodeListDragAndDrop {
    modelProvider;
    dnd;
    autoExpandNode;
    autoExpandDisposable = Disposable.None;
    constructor(modelProvider, dnd) {
        this.modelProvider = modelProvider;
        this.dnd = dnd;
    }
    getDragURI(node) {
        return this.dnd.getDragURI(node.element);
    }
    getDragLabel(nodes, originalEvent) {
        if (this.dnd.getDragLabel) {
            return this.dnd.getDragLabel(nodes.map(node => node.element), originalEvent);
        }
        return undefined;
    }
    onDragStart(data, originalEvent) {
        this.dnd.onDragStart?.(asTreeDragAndDropData(data), originalEvent);
    }
    onDragOver(data, targetNode, targetIndex, originalEvent, raw = true) {
        const result = this.dnd.onDragOver(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
        const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
        if (didChangeAutoExpandNode) {
            this.autoExpandDisposable.dispose();
            this.autoExpandNode = targetNode;
        }
        if (typeof targetNode === 'undefined') {
            return result;
        }
        if (didChangeAutoExpandNode && typeof result !== 'boolean' && result.autoExpand) {
            this.autoExpandDisposable = disposableTimeout(() => {
                const model = this.modelProvider();
                const ref = model.getNodeLocation(targetNode);
                if (model.isCollapsed(ref)) {
                    model.setCollapsed(ref, false);
                }
                this.autoExpandNode = undefined;
            }, 500);
        }
        if (typeof result === 'boolean' || !result.accept || typeof result.bubble === 'undefined' || result.feedback) {
            if (!raw) {
                const accept = typeof result === 'boolean' ? result : result.accept;
                const effect = typeof result === 'boolean' ? undefined : result.effect;
                return { accept, effect, feedback: [targetIndex] };
            }
            return result;
        }
        if (result.bubble === 1 /* TreeDragOverBubble.Up */) {
            const model = this.modelProvider();
            const ref = model.getNodeLocation(targetNode);
            const parentRef = model.getParentNodeLocation(ref);
            const parentNode = model.getNode(parentRef);
            const parentIndex = parentRef && model.getListIndex(parentRef);
            return this.onDragOver(data, parentNode, parentIndex, originalEvent, false);
        }
        const model = this.modelProvider();
        const ref = model.getNodeLocation(targetNode);
        const start = model.getListIndex(ref);
        const length = model.getListRenderCount(ref);
        return { ...result, feedback: range(start, start + length) };
    }
    drop(data, targetNode, targetIndex, originalEvent) {
        this.autoExpandDisposable.dispose();
        this.autoExpandNode = undefined;
        this.dnd.drop(asTreeDragAndDropData(data), targetNode && targetNode.element, targetIndex, originalEvent);
    }
    onDragEnd(originalEvent) {
        this.dnd.onDragEnd?.(originalEvent);
    }
}
function asListOptions(modelProvider, options) {
    return options && {
        ...options,
        identityProvider: options.identityProvider && {
            getId(el) {
                return options.identityProvider.getId(el.element);
            }
        },
        dnd: options.dnd && new TreeNodeListDragAndDrop(modelProvider, options.dnd),
        multipleSelectionController: options.multipleSelectionController && {
            isSelectionSingleChangeEvent(e) {
                return options.multipleSelectionController.isSelectionSingleChangeEvent({ ...e, element: e.element });
            },
            isSelectionRangeChangeEvent(e) {
                return options.multipleSelectionController.isSelectionRangeChangeEvent({ ...e, element: e.element });
            }
        },
        accessibilityProvider: options.accessibilityProvider && {
            ...options.accessibilityProvider,
            getSetSize(node) {
                const model = modelProvider();
                const ref = model.getNodeLocation(node);
                const parentRef = model.getParentNodeLocation(ref);
                const parentNode = model.getNode(parentRef);
                return parentNode.visibleChildrenCount;
            },
            getPosInSet(node) {
                return node.visibleChildIndex + 1;
            },
            isChecked: options.accessibilityProvider && options.accessibilityProvider.isChecked ? (node) => {
                return options.accessibilityProvider.isChecked(node.element);
            } : undefined,
            getRole: options.accessibilityProvider && options.accessibilityProvider.getRole ? (node) => {
                return options.accessibilityProvider.getRole(node.element);
            } : () => 'treeitem',
            getAriaLabel(e) {
                return options.accessibilityProvider.getAriaLabel(e.element);
            },
            getWidgetAriaLabel() {
                return options.accessibilityProvider.getWidgetAriaLabel();
            },
            getWidgetRole: options.accessibilityProvider && options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => 'tree',
            getAriaLevel: options.accessibilityProvider && options.accessibilityProvider.getAriaLevel ? (node) => options.accessibilityProvider.getAriaLevel(node.element) : (node) => {
                return node.depth;
            },
            getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && (node => {
                return options.accessibilityProvider.getActiveDescendantId(node.element);
            })
        },
        keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
            ...options.keyboardNavigationLabelProvider,
            getKeyboardNavigationLabel(node) {
                return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(node.element);
            }
        }
    };
}
export class ComposedTreeDelegate {
    delegate;
    constructor(delegate) {
        this.delegate = delegate;
    }
    getHeight(element) {
        return this.delegate.getHeight(element.element);
    }
    getTemplateId(element) {
        return this.delegate.getTemplateId(element.element);
    }
    hasDynamicHeight(element) {
        return !!this.delegate.hasDynamicHeight && this.delegate.hasDynamicHeight(element.element);
    }
    setDynamicHeight(element, height) {
        this.delegate.setDynamicHeight?.(element.element, height);
    }
}
export class AbstractTreeViewState {
    focus;
    selection;
    expanded;
    scrollTop;
    static lift(state) {
        return state instanceof AbstractTreeViewState ? state : new AbstractTreeViewState(state);
    }
    static empty(scrollTop = 0) {
        return new AbstractTreeViewState({
            focus: [],
            selection: [],
            expanded: Object.create(null),
            scrollTop,
        });
    }
    constructor(state) {
        this.focus = new Set(state.focus);
        this.selection = new Set(state.selection);
        if (state.expanded instanceof Array) { // old format
            this.expanded = Object.create(null);
            for (const id of state.expanded) {
                this.expanded[id] = 1;
            }
        }
        else {
            this.expanded = state.expanded;
        }
        this.expanded = state.expanded;
        this.scrollTop = state.scrollTop;
    }
    toJSON() {
        return {
            focus: Array.from(this.focus),
            selection: Array.from(this.selection),
            expanded: this.expanded,
            scrollTop: this.scrollTop,
        };
    }
}
export var RenderIndentGuides;
(function (RenderIndentGuides) {
    RenderIndentGuides["None"] = "none";
    RenderIndentGuides["OnHover"] = "onHover";
    RenderIndentGuides["Always"] = "always";
})(RenderIndentGuides || (RenderIndentGuides = {}));
class EventCollection {
    _elements;
    disposables = new DisposableStore();
    onDidChange;
    get elements() {
        return this._elements;
    }
    constructor(onDidChange, _elements = []) {
        this._elements = _elements;
        this.onDidChange = Event.forEach(onDidChange, elements => this._elements = elements, this.disposables);
    }
    dispose() {
        this.disposables.dispose();
    }
}
class TreeRenderer {
    renderer;
    modelProvider;
    activeNodes;
    renderedIndentGuides;
    static DefaultIndent = 8;
    templateId;
    renderedElements = new Map();
    renderedNodes = new Map();
    indent = TreeRenderer.DefaultIndent;
    hideTwistiesOfChildlessElements = false;
    shouldRenderIndentGuides = false;
    activeIndentNodes = new Set();
    indentGuidesDisposable = Disposable.None;
    disposables = new DisposableStore();
    constructor(renderer, modelProvider, onDidChangeCollapseState, activeNodes, renderedIndentGuides, options = {}) {
        this.renderer = renderer;
        this.modelProvider = modelProvider;
        this.activeNodes = activeNodes;
        this.renderedIndentGuides = renderedIndentGuides;
        this.templateId = renderer.templateId;
        this.updateOptions(options);
        Event.map(onDidChangeCollapseState, e => e.node)(this.onDidChangeNodeTwistieState, this, this.disposables);
        renderer.onDidChangeTwistieState?.(this.onDidChangeTwistieState, this, this.disposables);
    }
    updateOptions(options = {}) {
        if (typeof options.indent !== 'undefined') {
            const indent = clamp(options.indent, 0, 40);
            if (indent !== this.indent) {
                this.indent = indent;
                for (const [node, templateData] of this.renderedNodes) {
                    this.renderTreeElement(node, templateData);
                }
            }
        }
        if (typeof options.renderIndentGuides !== 'undefined') {
            const shouldRenderIndentGuides = options.renderIndentGuides !== RenderIndentGuides.None;
            if (shouldRenderIndentGuides !== this.shouldRenderIndentGuides) {
                this.shouldRenderIndentGuides = shouldRenderIndentGuides;
                this.indentGuidesDisposable.dispose();
                if (shouldRenderIndentGuides) {
                    const disposables = new DisposableStore();
                    this.activeNodes.onDidChange(this._onDidChangeActiveNodes, this, disposables);
                    this.indentGuidesDisposable = disposables;
                    this._onDidChangeActiveNodes(this.activeNodes.elements);
                }
            }
        }
        if (typeof options.hideTwistiesOfChildlessElements !== 'undefined') {
            this.hideTwistiesOfChildlessElements = options.hideTwistiesOfChildlessElements;
        }
    }
    renderTemplate(container) {
        const el = append(container, $('.monaco-tl-row'));
        const indent = append(el, $('.monaco-tl-indent'));
        const twistie = append(el, $('.monaco-tl-twistie'));
        const contents = append(el, $('.monaco-tl-contents'));
        const templateData = this.renderer.renderTemplate(contents);
        return { container, indent, twistie, indentGuidesDisposable: Disposable.None, templateData };
    }
    renderElement(node, index, templateData, height) {
        this.renderedNodes.set(node, templateData);
        this.renderedElements.set(node.element, node);
        this.renderTreeElement(node, templateData);
        this.renderer.renderElement(node, index, templateData.templateData, height);
    }
    disposeElement(node, index, templateData, height) {
        templateData.indentGuidesDisposable.dispose();
        this.renderer.disposeElement?.(node, index, templateData.templateData, height);
        if (typeof height === 'number') {
            this.renderedNodes.delete(node);
            this.renderedElements.delete(node.element);
        }
    }
    disposeTemplate(templateData) {
        this.renderer.disposeTemplate(templateData.templateData);
    }
    onDidChangeTwistieState(element) {
        const node = this.renderedElements.get(element);
        if (!node) {
            return;
        }
        this.onDidChangeNodeTwistieState(node);
    }
    onDidChangeNodeTwistieState(node) {
        const templateData = this.renderedNodes.get(node);
        if (!templateData) {
            return;
        }
        this._onDidChangeActiveNodes(this.activeNodes.elements);
        this.renderTreeElement(node, templateData);
    }
    renderTreeElement(node, templateData) {
        const indent = TreeRenderer.DefaultIndent + (node.depth - 1) * this.indent;
        templateData.twistie.style.paddingLeft = `${indent}px`;
        templateData.indent.style.width = `${indent + this.indent - 16}px`;
        if (node.collapsible) {
            templateData.container.setAttribute('aria-expanded', String(!node.collapsed));
        }
        else {
            templateData.container.removeAttribute('aria-expanded');
        }
        templateData.twistie.classList.remove(...Codicon.treeItemExpanded.classNamesArray);
        let twistieRendered = false;
        if (this.renderer.renderTwistie) {
            twistieRendered = this.renderer.renderTwistie(node.element, templateData.twistie);
        }
        if (node.collapsible && (!this.hideTwistiesOfChildlessElements || node.visibleChildrenCount > 0)) {
            if (!twistieRendered) {
                templateData.twistie.classList.add(...Codicon.treeItemExpanded.classNamesArray);
            }
            templateData.twistie.classList.add('collapsible');
            templateData.twistie.classList.toggle('collapsed', node.collapsed);
        }
        else {
            templateData.twistie.classList.remove('collapsible', 'collapsed');
        }
        clearNode(templateData.indent);
        templateData.indentGuidesDisposable.dispose();
        if (!this.shouldRenderIndentGuides) {
            return;
        }
        const disposableStore = new DisposableStore();
        const model = this.modelProvider();
        while (true) {
            const ref = model.getNodeLocation(node);
            const parentRef = model.getParentNodeLocation(ref);
            if (!parentRef) {
                break;
            }
            const parent = model.getNode(parentRef);
            const guide = $('.indent-guide', { style: `width: ${this.indent}px` });
            if (this.activeIndentNodes.has(parent)) {
                guide.classList.add('active');
            }
            if (templateData.indent.childElementCount === 0) {
                templateData.indent.appendChild(guide);
            }
            else {
                templateData.indent.insertBefore(guide, templateData.indent.firstElementChild);
            }
            this.renderedIndentGuides.add(parent, guide);
            disposableStore.add(toDisposable(() => this.renderedIndentGuides.delete(parent, guide)));
            node = parent;
        }
        templateData.indentGuidesDisposable = disposableStore;
    }
    _onDidChangeActiveNodes(nodes) {
        if (!this.shouldRenderIndentGuides) {
            return;
        }
        const set = new Set();
        const model = this.modelProvider();
        nodes.forEach(node => {
            const ref = model.getNodeLocation(node);
            try {
                const parentRef = model.getParentNodeLocation(ref);
                if (node.collapsible && node.children.length > 0 && !node.collapsed) {
                    set.add(node);
                }
                else if (parentRef) {
                    set.add(model.getNode(parentRef));
                }
            }
            catch {
                // noop
            }
        });
        this.activeIndentNodes.forEach(node => {
            if (!set.has(node)) {
                this.renderedIndentGuides.forEach(node, line => line.classList.remove('active'));
            }
        });
        set.forEach(node => {
            if (!this.activeIndentNodes.has(node)) {
                this.renderedIndentGuides.forEach(node, line => line.classList.add('active'));
            }
        });
        this.activeIndentNodes = set;
    }
    dispose() {
        this.renderedNodes.clear();
        this.renderedElements.clear();
        this.indentGuidesDisposable.dispose();
        dispose(this.disposables);
    }
}
class FindFilter {
    tree;
    keyboardNavigationLabelProvider;
    _filter;
    _totalCount = 0;
    get totalCount() { return this._totalCount; }
    _matchCount = 0;
    get matchCount() { return this._matchCount; }
    _pattern = '';
    _lowercasePattern = '';
    disposables = new DisposableStore();
    set pattern(pattern) {
        this._pattern = pattern;
        this._lowercasePattern = pattern.toLowerCase();
    }
    constructor(tree, keyboardNavigationLabelProvider, _filter) {
        this.tree = tree;
        this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
        this._filter = _filter;
        tree.onWillRefilter(this.reset, this, this.disposables);
    }
    filter(element, parentVisibility) {
        let visibility = 1 /* TreeVisibility.Visible */;
        if (this._filter) {
            const result = this._filter.filter(element, parentVisibility);
            if (typeof result === 'boolean') {
                visibility = result ? 1 /* TreeVisibility.Visible */ : 0 /* TreeVisibility.Hidden */;
            }
            else if (isFilterResult(result)) {
                visibility = getVisibleState(result.visibility);
            }
            else {
                visibility = result;
            }
            if (visibility === 0 /* TreeVisibility.Hidden */) {
                return false;
            }
        }
        this._totalCount++;
        if (!this._pattern) {
            this._matchCount++;
            return { data: FuzzyScore.Default, visibility };
        }
        const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(element);
        const labels = Array.isArray(label) ? label : [label];
        for (const l of labels) {
            const labelStr = l && l.toString();
            if (typeof labelStr === 'undefined') {
                return { data: FuzzyScore.Default, visibility };
            }
            const score = fuzzyScore(this._pattern, this._lowercasePattern, 0, labelStr, labelStr.toLowerCase(), 0, { firstMatchCanBeWeak: true, boostFullMatch: true });
            if (score) {
                this._matchCount++;
                return labels.length === 1 ?
                    { data: score, visibility } :
                    { data: { label: labelStr, score: score }, visibility };
            }
        }
        if (this.tree.findMode === TreeFindMode.Filter) {
            return 2 /* TreeVisibility.Recurse */;
        }
        else {
            return { data: FuzzyScore.Default, visibility };
        }
    }
    reset() {
        this._totalCount = 0;
        this._matchCount = 0;
    }
    dispose() {
        dispose(this.disposables);
    }
}
export class ModeToggle extends Toggle {
    constructor(opts) {
        super({
            icon: Codicon.listFilter,
            title: localize('filter', "Filter"),
            isChecked: opts?.isChecked ?? false,
            inputActiveOptionBorder: opts?.inputActiveOptionBorder,
            inputActiveOptionForeground: opts?.inputActiveOptionForeground,
            inputActiveOptionBackground: opts?.inputActiveOptionBackground
        });
    }
}
export var TreeFindMode;
(function (TreeFindMode) {
    TreeFindMode[TreeFindMode["Highlight"] = 0] = "Highlight";
    TreeFindMode[TreeFindMode["Filter"] = 1] = "Filter";
})(TreeFindMode || (TreeFindMode = {}));
class FindWidget extends Disposable {
    tree;
    elements = h('.monaco-tree-type-filter', [
        h('.monaco-tree-type-filter-grab.codicon.codicon-debug-gripper@grab', { tabIndex: 0 }),
        h('.monaco-tree-type-filter-input@findInput'),
        h('.monaco-tree-type-filter-actionbar@actionbar'),
    ]);
    set mode(mode) {
        this.modeToggle.checked = mode === TreeFindMode.Filter;
        this.findInput.inputBox.setPlaceHolder(mode === TreeFindMode.Filter ? localize('type to filter', "Type to filter") : localize('type to search', "Type to search"));
    }
    get value() {
        return this.findInput.inputBox.value;
    }
    set value(value) {
        this.findInput.inputBox.value = value;
    }
    modeToggle;
    findInput;
    actionbar;
    width = 0;
    right = 0;
    top = 0;
    _onDidDisable = new Emitter();
    onDidDisable = this._onDidDisable.event;
    onDidChangeValue;
    onDidChangeMode;
    constructor(container, tree, contextViewProvider, mode, options) {
        super();
        this.tree = tree;
        container.appendChild(this.elements.root);
        this._register(toDisposable(() => container.removeChild(this.elements.root)));
        this.modeToggle = this._register(new ModeToggle({ ...options, isChecked: mode === TreeFindMode.Filter }));
        this.onDidChangeMode = Event.map(this.modeToggle.onChange, () => this.modeToggle.checked ? TreeFindMode.Filter : TreeFindMode.Highlight, this._store);
        this.findInput = this._register(new FindInput(this.elements.findInput, contextViewProvider, {
            label: localize('type to search', "Type to search"),
            additionalToggles: [this.modeToggle],
            showCommonFindToggles: false
        }));
        this.actionbar = this._register(new ActionBar(this.elements.actionbar));
        this.mode = mode;
        const emitter = this._register(new DomEmitter(this.findInput.inputBox.inputElement, 'keydown'));
        const onKeyDown = this._register(Event.chain(emitter.event))
            .map(e => new StandardKeyboardEvent(e))
            .event;
        this._register(onKeyDown((e) => {
            switch (e.keyCode) {
                case 18 /* KeyCode.DownArrow */:
                    e.preventDefault();
                    e.stopPropagation();
                    this.tree.domFocus();
                    return;
            }
        }));
        const closeAction = this._register(new Action('close', localize('close', "Close"), 'codicon codicon-close', true, () => this.dispose()));
        this.actionbar.push(closeAction, { icon: true, label: false });
        const onGrabMouseDown = this._register(new DomEmitter(this.elements.grab, 'mousedown'));
        this._register(onGrabMouseDown.event(e => {
            const disposables = new DisposableStore();
            const onWindowMouseMove = disposables.add(new DomEmitter(window, 'mousemove'));
            const onWindowMouseUp = disposables.add(new DomEmitter(window, 'mouseup'));
            const startRight = this.right;
            const startX = e.pageX;
            const startTop = this.top;
            const startY = e.pageY;
            this.elements.grab.classList.add('grabbing');
            const transition = this.elements.root.style.transition;
            this.elements.root.style.transition = 'unset';
            const update = (e) => {
                const deltaX = e.pageX - startX;
                this.right = startRight - deltaX;
                const deltaY = e.pageY - startY;
                this.top = startTop + deltaY;
                this.layout();
            };
            disposables.add(onWindowMouseMove.event(update));
            disposables.add(onWindowMouseUp.event(e => {
                update(e);
                this.elements.grab.classList.remove('grabbing');
                this.elements.root.style.transition = transition;
                disposables.dispose();
            }));
        }));
        const onGrabKeyDown = this._register(Event.chain(this._register(new DomEmitter(this.elements.grab, 'keydown')).event))
            .map(e => new StandardKeyboardEvent(e))
            .event;
        this._register(onGrabKeyDown((e) => {
            let right;
            let top;
            if (e.keyCode === 15 /* KeyCode.LeftArrow */) {
                right = Number.POSITIVE_INFINITY;
            }
            else if (e.keyCode === 17 /* KeyCode.RightArrow */) {
                right = 0;
            }
            else if (e.keyCode === 10 /* KeyCode.Space */) {
                right = this.right === 0 ? Number.POSITIVE_INFINITY : 0;
            }
            if (e.keyCode === 16 /* KeyCode.UpArrow */) {
                top = 0;
            }
            else if (e.keyCode === 18 /* KeyCode.DownArrow */) {
                top = Number.POSITIVE_INFINITY;
            }
            if (right !== undefined) {
                e.preventDefault();
                e.stopPropagation();
                this.right = right;
                this.layout();
            }
            if (top !== undefined) {
                e.preventDefault();
                e.stopPropagation();
                this.top = top;
                const transition = this.elements.root.style.transition;
                this.elements.root.style.transition = 'unset';
                this.layout();
                setTimeout(() => {
                    this.elements.root.style.transition = transition;
                }, 0);
            }
        }));
        this.onDidChangeValue = this.findInput.onDidChange;
        this.style(options ?? {});
    }
    style(styles) {
        this.findInput.style(styles);
        if (styles.listFilterWidgetBackground) {
            this.elements.root.style.backgroundColor = styles.listFilterWidgetBackground.toString();
        }
        if (styles.listFilterWidgetShadow) {
            this.elements.root.style.boxShadow = `0 0 8px 2px ${styles.listFilterWidgetShadow}`;
        }
    }
    focus() {
        this.findInput.focus();
    }
    select() {
        this.findInput.select();
    }
    layout(width = this.width) {
        this.width = width;
        this.right = clamp(this.right, 0, Math.max(0, width - 212));
        this.elements.root.style.right = `${this.right}px`;
        this.top = clamp(this.top, 0, 24);
        this.elements.root.style.top = `${this.top}px`;
    }
    showMessage(message) {
        this.findInput.showMessage(message);
    }
    clearMessage() {
        this.findInput.clearMessage();
    }
    async dispose() {
        this._onDidDisable.fire();
        this.elements.root.classList.add('disabled');
        await timeout(300);
        super.dispose();
    }
}
class FindController {
    tree;
    view;
    filter;
    contextViewProvider;
    _pattern = '';
    get pattern() { return this._pattern; }
    previousPattern = '';
    _mode;
    get mode() { return this._mode; }
    set mode(mode) {
        if (mode === this._mode) {
            return;
        }
        this._mode = mode;
        if (this.widget) {
            this.widget.mode = this._mode;
        }
        this.tree.refilter();
        this.render();
        this._onDidChangeMode.fire(mode);
    }
    widget;
    styles;
    width = 0;
    _onDidChangeMode = new Emitter();
    onDidChangeMode = this._onDidChangeMode.event;
    _onDidChangePattern = new Emitter();
    onDidChangePattern = this._onDidChangePattern.event;
    _onDidChangeOpenState = new Emitter();
    onDidChangeOpenState = this._onDidChangeOpenState.event;
    enabledDisposables = new DisposableStore();
    disposables = new DisposableStore();
    constructor(tree, model, view, filter, contextViewProvider) {
        this.tree = tree;
        this.view = view;
        this.filter = filter;
        this.contextViewProvider = contextViewProvider;
        this._mode = tree.options.defaultFindMode ?? TreeFindMode.Highlight;
        model.onDidSplice(this.onDidSpliceModel, this, this.disposables);
    }
    open() {
        if (this.widget) {
            this.widget.focus();
            this.widget.select();
            return;
        }
        this.mode = this.tree.options.defaultFindMode ?? TreeFindMode.Highlight;
        this.widget = new FindWidget(this.view.getHTMLElement(), this.tree, this.contextViewProvider, this.mode, this.styles);
        this.enabledDisposables.add(this.widget);
        this.widget.onDidChangeValue(this.onDidChangeValue, this, this.enabledDisposables);
        this.widget.onDidChangeMode(mode => this.mode = mode, undefined, this.enabledDisposables);
        this.widget.onDidDisable(this.close, this, this.enabledDisposables);
        this.widget.layout(this.width);
        this.widget.focus();
        this.widget.value = this.previousPattern;
        this.widget.select();
        this._onDidChangeOpenState.fire(true);
    }
    close() {
        if (!this.widget) {
            return;
        }
        this.widget = undefined;
        this.enabledDisposables.dispose();
        this.enabledDisposables = new DisposableStore();
        this.previousPattern = this.pattern;
        this.onDidChangeValue('');
        this.tree.domFocus();
        this._onDidChangeOpenState.fire(false);
    }
    onDidChangeValue(pattern) {
        this._pattern = pattern;
        this._onDidChangePattern.fire(pattern);
        this.filter.pattern = pattern;
        this.tree.refilter();
        if (pattern) {
            this.tree.focusNext(0, true, undefined, node => !FuzzyScore.isDefault(node.filterData));
        }
        const focus = this.tree.getFocus();
        if (focus.length > 0) {
            const element = focus[0];
            if (this.tree.getRelativeTop(element) === null) {
                this.tree.reveal(element, 0.5);
            }
        }
        this.render();
    }
    onDidSpliceModel() {
        if (!this.widget || this.pattern.length === 0) {
            return;
        }
        this.tree.refilter();
        this.render();
    }
    render() {
        const noMatches = this.filter.totalCount > 0 && this.filter.matchCount === 0;
        if (this.pattern && noMatches) {
            if (this.tree.options.showNotFoundMessage ?? true) {
                this.widget?.showMessage({ type: 2 /* MessageType.WARNING */, content: localize('not found', "No elements found.") });
            }
            else {
                this.widget?.showMessage({ type: 2 /* MessageType.WARNING */ });
            }
        }
        else {
            this.widget?.clearMessage();
        }
    }
    shouldAllowFocus(node) {
        if (!this.widget || !this.pattern || this._mode === TreeFindMode.Filter) {
            return true;
        }
        if (this.filter.totalCount > 0 && this.filter.matchCount <= 1) {
            return true;
        }
        return !FuzzyScore.isDefault(node.filterData);
    }
    style(styles) {
        this.styles = styles;
        this.widget?.style(styles);
    }
    layout(width) {
        this.width = width;
        this.widget?.layout(width);
    }
    dispose() {
        this._onDidChangePattern.dispose();
        this.enabledDisposables.dispose();
        this.disposables.dispose();
    }
}
function asTreeMouseEvent(event) {
    let target = TreeMouseEventTarget.Unknown;
    if (hasParentWithClass(event.browserEvent.target, 'monaco-tl-twistie', 'monaco-tl-row')) {
        target = TreeMouseEventTarget.Twistie;
    }
    else if (hasParentWithClass(event.browserEvent.target, 'monaco-tl-contents', 'monaco-tl-row')) {
        target = TreeMouseEventTarget.Element;
    }
    else if (hasParentWithClass(event.browserEvent.target, 'monaco-tree-type-filter', 'monaco-list')) {
        target = TreeMouseEventTarget.Filter;
    }
    return {
        browserEvent: event.browserEvent,
        element: event.element ? event.element.element : null,
        target
    };
}
function asTreeContextMenuEvent(event) {
    return {
        element: event.element ? event.element.element : null,
        browserEvent: event.browserEvent,
        anchor: event.anchor
    };
}
function dfs(node, fn) {
    fn(node);
    node.children.forEach(child => dfs(child, fn));
}
/**
 * The trait concept needs to exist at the tree level, because collapsed
 * tree nodes will not be known by the list.
 */
class Trait {
    getFirstViewElementWithTrait;
    identityProvider;
    nodes = [];
    elements;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    _nodeSet;
    get nodeSet() {
        if (!this._nodeSet) {
            this._nodeSet = this.createNodeSet();
        }
        return this._nodeSet;
    }
    constructor(getFirstViewElementWithTrait, identityProvider) {
        this.getFirstViewElementWithTrait = getFirstViewElementWithTrait;
        this.identityProvider = identityProvider;
    }
    set(nodes, browserEvent) {
        if (!browserEvent?.__forceEvent && equals(this.nodes, nodes)) {
            return;
        }
        this._set(nodes, false, browserEvent);
    }
    _set(nodes, silent, browserEvent) {
        this.nodes = [...nodes];
        this.elements = undefined;
        this._nodeSet = undefined;
        if (!silent) {
            const that = this;
            this._onDidChange.fire({ get elements() { return that.get(); }, browserEvent });
        }
    }
    get() {
        if (!this.elements) {
            this.elements = this.nodes.map(node => node.element);
        }
        return [...this.elements];
    }
    getNodes() {
        return this.nodes;
    }
    has(node) {
        return this.nodeSet.has(node);
    }
    onDidModelSplice({ insertedNodes, deletedNodes }) {
        if (!this.identityProvider) {
            const set = this.createNodeSet();
            const visit = (node) => set.delete(node);
            deletedNodes.forEach(node => dfs(node, visit));
            this.set([...set.values()]);
            return;
        }
        const deletedNodesIdSet = new Set();
        const deletedNodesVisitor = (node) => deletedNodesIdSet.add(this.identityProvider.getId(node.element).toString());
        deletedNodes.forEach(node => dfs(node, deletedNodesVisitor));
        const insertedNodesMap = new Map();
        const insertedNodesVisitor = (node) => insertedNodesMap.set(this.identityProvider.getId(node.element).toString(), node);
        insertedNodes.forEach(node => dfs(node, insertedNodesVisitor));
        const nodes = [];
        for (const node of this.nodes) {
            const id = this.identityProvider.getId(node.element).toString();
            const wasDeleted = deletedNodesIdSet.has(id);
            if (!wasDeleted) {
                nodes.push(node);
            }
            else {
                const insertedNode = insertedNodesMap.get(id);
                if (insertedNode) {
                    nodes.push(insertedNode);
                }
            }
        }
        if (this.nodes.length > 0 && nodes.length === 0) {
            const node = this.getFirstViewElementWithTrait();
            if (node) {
                nodes.push(node);
            }
        }
        this._set(nodes, true);
    }
    createNodeSet() {
        const set = new Set();
        for (const node of this.nodes) {
            set.add(node);
        }
        return set;
    }
}
class TreeNodeListMouseController extends MouseController {
    tree;
    constructor(list, tree) {
        super(list);
        this.tree = tree;
    }
    onViewPointer(e) {
        if (isButton(e.browserEvent.target) ||
            isInputElement(e.browserEvent.target) ||
            isMonacoEditor(e.browserEvent.target)) {
            return;
        }
        const node = e.element;
        if (!node) {
            return super.onViewPointer(e);
        }
        if (this.isSelectionRangeChangeEvent(e) || this.isSelectionSingleChangeEvent(e)) {
            return super.onViewPointer(e);
        }
        const target = e.browserEvent.target;
        const onTwistie = target.classList.contains('monaco-tl-twistie')
            || (target.classList.contains('monaco-icon-label') && target.classList.contains('folder-icon') && e.browserEvent.offsetX < 16);
        let expandOnlyOnTwistieClick = false;
        if (typeof this.tree.expandOnlyOnTwistieClick === 'function') {
            expandOnlyOnTwistieClick = this.tree.expandOnlyOnTwistieClick(node.element);
        }
        else {
            expandOnlyOnTwistieClick = !!this.tree.expandOnlyOnTwistieClick;
        }
        if (expandOnlyOnTwistieClick && !onTwistie && e.browserEvent.detail !== 2) {
            return super.onViewPointer(e);
        }
        if (!this.tree.expandOnDoubleClick && e.browserEvent.detail === 2) {
            return super.onViewPointer(e);
        }
        if (node.collapsible) {
            const model = this.tree.model; // internal
            const location = model.getNodeLocation(node);
            const recursive = e.browserEvent.altKey;
            this.tree.setFocus([location]);
            model.setCollapsed(location, undefined, recursive);
            if (expandOnlyOnTwistieClick && onTwistie) {
                return;
            }
        }
        super.onViewPointer(e);
    }
    onDoubleClick(e) {
        const onTwistie = e.browserEvent.target.classList.contains('monaco-tl-twistie');
        if (onTwistie || !this.tree.expandOnDoubleClick) {
            return;
        }
        super.onDoubleClick(e);
    }
}
/**
 * We use this List subclass to restore selection and focus as nodes
 * get rendered in the list, possibly due to a node expand() call.
 */
class TreeNodeList extends List {
    focusTrait;
    selectionTrait;
    anchorTrait;
    constructor(user, container, virtualDelegate, renderers, focusTrait, selectionTrait, anchorTrait, options) {
        super(user, container, virtualDelegate, renderers, options);
        this.focusTrait = focusTrait;
        this.selectionTrait = selectionTrait;
        this.anchorTrait = anchorTrait;
    }
    createMouseController(options) {
        return new TreeNodeListMouseController(this, options.tree);
    }
    splice(start, deleteCount, elements = []) {
        super.splice(start, deleteCount, elements);
        if (elements.length === 0) {
            return;
        }
        const additionalFocus = [];
        const additionalSelection = [];
        let anchor;
        elements.forEach((node, index) => {
            if (this.focusTrait.has(node)) {
                additionalFocus.push(start + index);
            }
            if (this.selectionTrait.has(node)) {
                additionalSelection.push(start + index);
            }
            if (this.anchorTrait.has(node)) {
                anchor = start + index;
            }
        });
        if (additionalFocus.length > 0) {
            super.setFocus(distinct([...super.getFocus(), ...additionalFocus]));
        }
        if (additionalSelection.length > 0) {
            super.setSelection(distinct([...super.getSelection(), ...additionalSelection]));
        }
        if (typeof anchor === 'number') {
            super.setAnchor(anchor);
        }
    }
    setFocus(indexes, browserEvent, fromAPI = false) {
        super.setFocus(indexes, browserEvent);
        if (!fromAPI) {
            this.focusTrait.set(indexes.map(i => this.element(i)), browserEvent);
        }
    }
    setSelection(indexes, browserEvent, fromAPI = false) {
        super.setSelection(indexes, browserEvent);
        if (!fromAPI) {
            this.selectionTrait.set(indexes.map(i => this.element(i)), browserEvent);
        }
    }
    setAnchor(index, fromAPI = false) {
        super.setAnchor(index);
        if (!fromAPI) {
            if (typeof index === 'undefined') {
                this.anchorTrait.set([]);
            }
            else {
                this.anchorTrait.set([this.element(index)]);
            }
        }
    }
}
export class AbstractTree {
    _user;
    _options;
    view;
    renderers;
    model; // used in MouseController
    focus;
    selection;
    anchor;
    eventBufferer = new EventBufferer();
    findController;
    onDidChangeFindOpenState = Event.None;
    focusNavigationFilter;
    styleElement;
    disposables = new DisposableStore();
    get onDidScroll() { return this.view.onDidScroll; }
    get onDidChangeFocus() { return this.eventBufferer.wrapEvent(this.focus.onDidChange); }
    get onDidChangeSelection() { return this.eventBufferer.wrapEvent(this.selection.onDidChange); }
    get onMouseClick() { return Event.map(this.view.onMouseClick, asTreeMouseEvent); }
    get onMouseDblClick() { return Event.filter(Event.map(this.view.onMouseDblClick, asTreeMouseEvent), e => e.target !== TreeMouseEventTarget.Filter); }
    get onContextMenu() { return Event.map(this.view.onContextMenu, asTreeContextMenuEvent); }
    get onTap() { return Event.map(this.view.onTap, asTreeMouseEvent); }
    get onPointer() { return Event.map(this.view.onPointer, asTreeMouseEvent); }
    get onKeyDown() { return this.view.onKeyDown; }
    get onKeyUp() { return this.view.onKeyUp; }
    get onKeyPress() { return this.view.onKeyPress; }
    get onDidFocus() { return this.view.onDidFocus; }
    get onDidBlur() { return this.view.onDidBlur; }
    get onDidChangeModel() { return Event.signal(this.model.onDidSplice); }
    get onDidChangeCollapseState() { return this.model.onDidChangeCollapseState; }
    get onDidChangeRenderNodeCount() { return this.model.onDidChangeRenderNodeCount; }
    _onWillRefilter = new Emitter();
    onWillRefilter = this._onWillRefilter.event;
    get findMode() { return this.findController?.mode ?? TreeFindMode.Highlight; }
    set findMode(findMode) { if (this.findController) {
        this.findController.mode = findMode;
    } }
    onDidChangeFindMode;
    get onDidChangeFindPattern() { return this.findController ? this.findController.onDidChangePattern : Event.None; }
    get expandOnDoubleClick() { return typeof this._options.expandOnDoubleClick === 'undefined' ? true : this._options.expandOnDoubleClick; }
    get expandOnlyOnTwistieClick() { return typeof this._options.expandOnlyOnTwistieClick === 'undefined' ? true : this._options.expandOnlyOnTwistieClick; }
    _onDidUpdateOptions = new Emitter();
    onDidUpdateOptions = this._onDidUpdateOptions.event;
    get onDidDispose() { return this.view.onDidDispose; }
    constructor(_user, container, delegate, renderers, _options = {}) {
        this._user = _user;
        this._options = _options;
        const treeDelegate = new ComposedTreeDelegate(delegate);
        const onDidChangeCollapseStateRelay = new Relay();
        const onDidChangeActiveNodes = new Relay();
        const activeNodes = this.disposables.add(new EventCollection(onDidChangeActiveNodes.event));
        const renderedIndentGuides = new SetMap();
        this.renderers = renderers.map(r => new TreeRenderer(r, () => this.model, onDidChangeCollapseStateRelay.event, activeNodes, renderedIndentGuides, _options));
        for (const r of this.renderers) {
            this.disposables.add(r);
        }
        let filter;
        if (_options.keyboardNavigationLabelProvider) {
            filter = new FindFilter(this, _options.keyboardNavigationLabelProvider, _options.filter);
            _options = { ..._options, filter: filter }; // TODO need typescript help here
            this.disposables.add(filter);
        }
        this.focus = new Trait(() => this.view.getFocusedElements()[0], _options.identityProvider);
        this.selection = new Trait(() => this.view.getSelectedElements()[0], _options.identityProvider);
        this.anchor = new Trait(() => this.view.getAnchorElement(), _options.identityProvider);
        this.view = new TreeNodeList(_user, container, treeDelegate, this.renderers, this.focus, this.selection, this.anchor, { ...asListOptions(() => this.model, _options), tree: this });
        this.model = this.createModel(_user, this.view, _options);
        onDidChangeCollapseStateRelay.input = this.model.onDidChangeCollapseState;
        const onDidModelSplice = Event.forEach(this.model.onDidSplice, e => {
            this.eventBufferer.bufferEvents(() => {
                this.focus.onDidModelSplice(e);
                this.selection.onDidModelSplice(e);
            });
        }, this.disposables);
        // Make sure the `forEach` always runs
        onDidModelSplice(() => null, null, this.disposables);
        // Active nodes can change when the model changes or when focus or selection change.
        // We debounce it with 0 delay since these events may fire in the same stack and we only
        // want to run this once. It also doesn't matter if it runs on the next tick since it's only
        // a nice to have UI feature.
        onDidChangeActiveNodes.input = Event.chain(Event.any(onDidModelSplice, this.focus.onDidChange, this.selection.onDidChange))
            .debounce(() => null, 0)
            .map(() => {
            const set = new Set();
            for (const node of this.focus.getNodes()) {
                set.add(node);
            }
            for (const node of this.selection.getNodes()) {
                set.add(node);
            }
            return [...set.values()];
        }).event;
        if (_options.keyboardSupport !== false) {
            const onKeyDown = Event.chain(this.view.onKeyDown)
                .filter(e => !isInputElement(e.target))
                .map(e => new StandardKeyboardEvent(e));
            onKeyDown.filter(e => e.keyCode === 15 /* KeyCode.LeftArrow */).on(this.onLeftArrow, this, this.disposables);
            onKeyDown.filter(e => e.keyCode === 17 /* KeyCode.RightArrow */).on(this.onRightArrow, this, this.disposables);
            onKeyDown.filter(e => e.keyCode === 10 /* KeyCode.Space */).on(this.onSpace, this, this.disposables);
        }
        if ((_options.findWidgetEnabled ?? true) && _options.keyboardNavigationLabelProvider && _options.contextViewProvider) {
            this.findController = new FindController(this, this.model, this.view, filter, _options.contextViewProvider);
            this.focusNavigationFilter = node => this.findController.shouldAllowFocus(node);
            this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
            this.disposables.add(this.findController);
            this.onDidChangeFindMode = this.findController.onDidChangeMode;
        }
        else {
            this.onDidChangeFindMode = Event.None;
        }
        this.styleElement = createStyleSheet(this.view.getHTMLElement());
        this.getHTMLElement().classList.toggle('always', this._options.renderIndentGuides === RenderIndentGuides.Always);
    }
    updateOptions(optionsUpdate = {}) {
        this._options = { ...this._options, ...optionsUpdate };
        for (const renderer of this.renderers) {
            renderer.updateOptions(optionsUpdate);
        }
        this.view.updateOptions(this._options);
        this._onDidUpdateOptions.fire(this._options);
        this.getHTMLElement().classList.toggle('always', this._options.renderIndentGuides === RenderIndentGuides.Always);
    }
    get options() {
        return this._options;
    }
    updateWidth(element) {
        const index = this.model.getListIndex(element);
        if (index === -1) {
            return;
        }
        this.view.updateWidth(index);
    }
    // Widget
    getHTMLElement() {
        return this.view.getHTMLElement();
    }
    get contentHeight() {
        return this.view.contentHeight;
    }
    get onDidChangeContentHeight() {
        return this.view.onDidChangeContentHeight;
    }
    get scrollTop() {
        return this.view.scrollTop;
    }
    set scrollTop(scrollTop) {
        this.view.scrollTop = scrollTop;
    }
    get scrollLeft() {
        return this.view.scrollLeft;
    }
    set scrollLeft(scrollLeft) {
        this.view.scrollLeft = scrollLeft;
    }
    get scrollHeight() {
        return this.view.scrollHeight;
    }
    get renderHeight() {
        return this.view.renderHeight;
    }
    get firstVisibleElement() {
        const index = this.view.firstVisibleIndex;
        if (index < 0 || index >= this.view.length) {
            return undefined;
        }
        const node = this.view.element(index);
        return node.element;
    }
    get lastVisibleElement() {
        const index = this.view.lastVisibleIndex;
        const node = this.view.element(index);
        return node.element;
    }
    get ariaLabel() {
        return this.view.ariaLabel;
    }
    set ariaLabel(value) {
        this.view.ariaLabel = value;
    }
    domFocus() {
        this.view.domFocus();
    }
    isDOMFocused() {
        return this.getHTMLElement() === document.activeElement;
    }
    layout(height, width) {
        this.view.layout(height, width);
        if (isNumber(width)) {
            this.findController?.layout(width);
        }
    }
    style(styles) {
        const suffix = `.${this.view.domId}`;
        const content = [];
        if (styles.treeIndentGuidesStroke) {
            content.push(`.monaco-list${suffix}:hover .monaco-tl-indent > .indent-guide, .monaco-list${suffix}.always .monaco-tl-indent > .indent-guide  { border-color: ${styles.treeIndentGuidesStroke.transparent(0.4)}; }`);
            content.push(`.monaco-list${suffix} .monaco-tl-indent > .indent-guide.active { border-color: ${styles.treeIndentGuidesStroke}; }`);
        }
        this.styleElement.textContent = content.join('\n');
        this.findController?.style(styles);
        this.view.style(styles);
    }
    // Tree navigation
    getParentElement(location) {
        const parentRef = this.model.getParentNodeLocation(location);
        const parentNode = this.model.getNode(parentRef);
        return parentNode.element;
    }
    getFirstElementChild(location) {
        return this.model.getFirstElementChild(location);
    }
    // Tree
    getNode(location) {
        return this.model.getNode(location);
    }
    collapse(location, recursive = false) {
        return this.model.setCollapsed(location, true, recursive);
    }
    expand(location, recursive = false) {
        return this.model.setCollapsed(location, false, recursive);
    }
    toggleCollapsed(location, recursive = false) {
        return this.model.setCollapsed(location, undefined, recursive);
    }
    expandAll() {
        this.model.setCollapsed(this.model.rootRef, false, true);
    }
    collapseAll() {
        this.model.setCollapsed(this.model.rootRef, true, true);
    }
    isCollapsible(location) {
        return this.model.isCollapsible(location);
    }
    setCollapsible(location, collapsible) {
        return this.model.setCollapsible(location, collapsible);
    }
    isCollapsed(location) {
        return this.model.isCollapsed(location);
    }
    triggerTypeNavigation() {
        this.view.triggerTypeNavigation();
    }
    openFind() {
        this.findController?.open();
    }
    closeFind() {
        this.findController?.close();
    }
    refilter() {
        this._onWillRefilter.fire(undefined);
        this.model.refilter();
    }
    setAnchor(element) {
        if (typeof element === 'undefined') {
            return this.view.setAnchor(undefined);
        }
        const node = this.model.getNode(element);
        this.anchor.set([node]);
        const index = this.model.getListIndex(element);
        if (index > -1) {
            this.view.setAnchor(index, true);
        }
    }
    getAnchor() {
        return firstOrDefault(this.anchor.get(), undefined);
    }
    setSelection(elements, browserEvent) {
        const nodes = elements.map(e => this.model.getNode(e));
        this.selection.set(nodes, browserEvent);
        const indexes = elements.map(e => this.model.getListIndex(e)).filter(i => i > -1);
        this.view.setSelection(indexes, browserEvent, true);
    }
    getSelection() {
        return this.selection.get();
    }
    setFocus(elements, browserEvent) {
        const nodes = elements.map(e => this.model.getNode(e));
        this.focus.set(nodes, browserEvent);
        const indexes = elements.map(e => this.model.getListIndex(e)).filter(i => i > -1);
        this.view.setFocus(indexes, browserEvent, true);
    }
    focusNext(n = 1, loop = false, browserEvent, filter = this.focusNavigationFilter) {
        this.view.focusNext(n, loop, browserEvent, filter);
    }
    focusPrevious(n = 1, loop = false, browserEvent, filter = this.focusNavigationFilter) {
        this.view.focusPrevious(n, loop, browserEvent, filter);
    }
    focusNextPage(browserEvent, filter = this.focusNavigationFilter) {
        return this.view.focusNextPage(browserEvent, filter);
    }
    focusPreviousPage(browserEvent, filter = this.focusNavigationFilter) {
        return this.view.focusPreviousPage(browserEvent, filter);
    }
    focusLast(browserEvent, filter = this.focusNavigationFilter) {
        this.view.focusLast(browserEvent, filter);
    }
    focusFirst(browserEvent, filter = this.focusNavigationFilter) {
        this.view.focusFirst(browserEvent, filter);
    }
    getFocus() {
        return this.focus.get();
    }
    reveal(location, relativeTop) {
        this.model.expandTo(location);
        const index = this.model.getListIndex(location);
        if (index === -1) {
            return;
        }
        this.view.reveal(index, relativeTop);
    }
    /**
     * Returns the relative position of an element rendered in the list.
     * Returns `null` if the element isn't *entirely* in the visible viewport.
     */
    getRelativeTop(location) {
        const index = this.model.getListIndex(location);
        if (index === -1) {
            return null;
        }
        return this.view.getRelativeTop(index);
    }
    getViewState(identityProvider = this.options.identityProvider) {
        if (!identityProvider) {
            throw new TreeError(this._user, 'Can\'t get tree view state without an identity provider');
        }
        const getId = (element) => identityProvider.getId(element).toString();
        const state = AbstractTreeViewState.empty(this.scrollTop);
        for (const focus of this.getFocus()) {
            state.focus.add(getId(focus));
        }
        for (const selection of this.getSelection()) {
            state.selection.add(getId(selection));
        }
        const root = this.model.getNode();
        const queue = [root];
        while (queue.length > 0) {
            const node = queue.shift();
            if (node !== root && node.collapsible) {
                state.expanded[getId(node.element)] = node.collapsed ? 0 : 1;
            }
            queue.push(...node.children);
        }
        return state;
    }
    // List
    onLeftArrow(e) {
        e.preventDefault();
        e.stopPropagation();
        const nodes = this.view.getFocusedElements();
        if (nodes.length === 0) {
            return;
        }
        const node = nodes[0];
        const location = this.model.getNodeLocation(node);
        const didChange = this.model.setCollapsed(location, true);
        if (!didChange) {
            const parentLocation = this.model.getParentNodeLocation(location);
            if (!parentLocation) {
                return;
            }
            const parentListIndex = this.model.getListIndex(parentLocation);
            this.view.reveal(parentListIndex);
            this.view.setFocus([parentListIndex]);
        }
    }
    onRightArrow(e) {
        e.preventDefault();
        e.stopPropagation();
        const nodes = this.view.getFocusedElements();
        if (nodes.length === 0) {
            return;
        }
        const node = nodes[0];
        const location = this.model.getNodeLocation(node);
        const didChange = this.model.setCollapsed(location, false);
        if (!didChange) {
            if (!node.children.some(child => child.visible)) {
                return;
            }
            const [focusedIndex] = this.view.getFocus();
            const firstChildIndex = focusedIndex + 1;
            this.view.reveal(firstChildIndex);
            this.view.setFocus([firstChildIndex]);
        }
    }
    onSpace(e) {
        e.preventDefault();
        e.stopPropagation();
        const nodes = this.view.getFocusedElements();
        if (nodes.length === 0) {
            return;
        }
        const node = nodes[0];
        const location = this.model.getNodeLocation(node);
        const recursive = e.browserEvent.altKey;
        this.model.setCollapsed(location, undefined, recursive);
    }
    navigate(start) {
        return new TreeNavigator(this.view, this.model, start);
    }
    dispose() {
        dispose(this.disposables);
        this.view.dispose();
    }
}
class TreeNavigator {
    view;
    model;
    index;
    constructor(view, model, start) {
        this.view = view;
        this.model = model;
        if (start) {
            this.index = this.model.getListIndex(start);
        }
        else {
            this.index = -1;
        }
    }
    current() {
        if (this.index < 0 || this.index >= this.view.length) {
            return null;
        }
        return this.view.element(this.index).element;
    }
    previous() {
        this.index--;
        return this.current();
    }
    next() {
        this.index++;
        return this.current();
    }
    first() {
        this.index = 0;
        return this.current();
    }
    last() {
        this.index = this.view.length - 1;
        return this.current();
    }
}
