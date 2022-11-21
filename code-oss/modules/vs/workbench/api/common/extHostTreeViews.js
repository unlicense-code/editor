/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import * as types from './extHostTypes';
import { basename } from 'vs/base/common/resources';
import { URI } from 'vs/base/common/uri';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { asPromise } from 'vs/base/common/async';
import { TreeItemCollapsibleState, TreeItemCheckboxState, ThemeIcon, MarkdownString as MarkdownStringType, TreeItem, ViewBadge as ExtHostViewBadge } from 'vs/workbench/api/common/extHostTypes';
import { isUndefinedOrNull, isString } from 'vs/base/common/types';
import { equals, coalesce } from 'vs/base/common/arrays';
import { MarkdownString, ViewBadge, DataTransfer } from 'vs/workbench/api/common/extHostTypeConverters';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { TreeviewsService } from 'vs/workbench/services/views/common/treeViewsService';
import { checkProposedApiEnabled } from 'vs/workbench/services/extensions/common/extensions';
function toTreeItemLabel(label, extension) {
    if (isString(label)) {
        return { label };
    }
    if (label
        && typeof label === 'object'
        && typeof label.label === 'string') {
        let highlights = undefined;
        if (Array.isArray(label.highlights)) {
            highlights = label.highlights.filter((highlight => highlight.length === 2 && typeof highlight[0] === 'number' && typeof highlight[1] === 'number'));
            highlights = highlights.length ? highlights : undefined;
        }
        return { label: label.label, highlights };
    }
    return undefined;
}
export class ExtHostTreeViews {
    _proxy;
    commands;
    logService;
    treeViews = new Map();
    treeDragAndDropService = new TreeviewsService();
    constructor(_proxy, commands, logService) {
        this._proxy = _proxy;
        this.commands = commands;
        this.logService = logService;
        function isTreeViewConvertableItem(arg) {
            return arg && arg.$treeViewId && (arg.$treeItemHandle || arg.$selectedTreeItems || arg.$focusedTreeItem);
        }
        commands.registerArgumentProcessor({
            processArgument: arg => {
                if (isTreeViewConvertableItem(arg)) {
                    return this.convertArgument(arg);
                }
                else if (Array.isArray(arg) && (arg.length > 0)) {
                    return arg.map(item => {
                        if (isTreeViewConvertableItem(item)) {
                            return this.convertArgument(item);
                        }
                        return item;
                    });
                }
                return arg;
            }
        });
    }
    registerTreeDataProvider(id, treeDataProvider, extension) {
        const treeView = this.createTreeView(id, { treeDataProvider }, extension);
        return { dispose: () => treeView.dispose() };
    }
    createTreeView(viewId, options, extension) {
        if (!options || !options.treeDataProvider) {
            throw new Error('Options with treeDataProvider is mandatory');
        }
        const dropMimeTypes = options.dragAndDropController?.dropMimeTypes ?? [];
        const dragMimeTypes = options.dragAndDropController?.dragMimeTypes ?? [];
        const hasHandleDrag = !!options.dragAndDropController?.handleDrag;
        const hasHandleDrop = !!options.dragAndDropController?.handleDrop;
        const treeView = this.createExtHostTreeView(viewId, options, extension);
        const registerPromise = this._proxy.$registerTreeViewDataProvider(viewId, { showCollapseAll: !!options.showCollapseAll, canSelectMany: !!options.canSelectMany, dropMimeTypes, dragMimeTypes, hasHandleDrag, hasHandleDrop });
        return {
            get onDidCollapseElement() { return treeView.onDidCollapseElement; },
            get onDidExpandElement() { return treeView.onDidExpandElement; },
            get selection() { return treeView.selectedElements; },
            get onDidChangeSelection() { return treeView.onDidChangeSelection; },
            get visible() { return treeView.visible; },
            get onDidChangeVisibility() { return treeView.onDidChangeVisibility; },
            get onDidChangeCheckboxState() {
                checkProposedApiEnabled(extension, 'treeItemCheckbox');
                return treeView.onDidChangeCheckboxState;
            },
            get message() { return treeView.message; },
            set message(message) {
                treeView.message = message;
            },
            get title() { return treeView.title; },
            set title(title) {
                treeView.title = title;
            },
            get description() {
                return treeView.description;
            },
            set description(description) {
                treeView.description = description;
            },
            get badge() {
                return treeView.badge;
            },
            set badge(badge) {
                if ((badge !== undefined) && ExtHostViewBadge.isViewBadge(badge)) {
                    treeView.badge = {
                        value: Math.floor(Math.abs(badge.value)),
                        tooltip: badge.tooltip
                    };
                }
                else if (badge === undefined) {
                    treeView.badge = undefined;
                }
            },
            reveal: (element, options) => {
                return treeView.reveal(element, options);
            },
            dispose: async () => {
                // Wait for the registration promise to finish before doing the dispose.
                await registerPromise;
                this.treeViews.delete(viewId);
                treeView.dispose();
            }
        };
    }
    $getChildren(treeViewId, treeItemHandle) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            return Promise.reject(new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId)));
        }
        return treeView.getChildren(treeItemHandle);
    }
    async $handleDrop(destinationViewId, requestId, treeDataTransferDTO, targetItemHandle, token, operationUuid, sourceViewId, sourceTreeItemHandles) {
        const treeView = this.treeViews.get(destinationViewId);
        if (!treeView) {
            return Promise.reject(new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', destinationViewId)));
        }
        const treeDataTransfer = DataTransfer.toDataTransfer(treeDataTransferDTO, async (dataItemIndex) => {
            return (await this._proxy.$resolveDropFileData(destinationViewId, requestId, dataItemIndex)).buffer;
        });
        if ((sourceViewId === destinationViewId) && sourceTreeItemHandles) {
            await this.addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid);
        }
        return treeView.onDrop(treeDataTransfer, targetItemHandle, token);
    }
    async addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid) {
        const existingTransferOperation = this.treeDragAndDropService.removeDragOperationTransfer(operationUuid);
        if (existingTransferOperation) {
            (await existingTransferOperation)?.forEach((value, key) => {
                if (value) {
                    treeDataTransfer.set(key, value);
                }
            });
        }
        else if (operationUuid && treeView.handleDrag) {
            const willDropPromise = treeView.handleDrag(sourceTreeItemHandles, treeDataTransfer, token);
            this.treeDragAndDropService.addDragOperationTransfer(operationUuid, willDropPromise);
            await willDropPromise;
        }
        return treeDataTransfer;
    }
    async $handleDrag(sourceViewId, sourceTreeItemHandles, operationUuid, token) {
        const treeView = this.treeViews.get(sourceViewId);
        if (!treeView) {
            return Promise.reject(new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', sourceViewId)));
        }
        const treeDataTransfer = await this.addAdditionalTransferItems(new types.DataTransfer(), treeView, sourceTreeItemHandles, token, operationUuid);
        if (!treeDataTransfer) {
            return;
        }
        return DataTransfer.toDataTransferDTO(treeDataTransfer);
    }
    async $hasResolve(treeViewId) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        return treeView.hasResolve;
    }
    $resolve(treeViewId, treeItemHandle, token) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        return treeView.resolveTreeItem(treeItemHandle, token);
    }
    $setExpanded(treeViewId, treeItemHandle, expanded) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        treeView.setExpanded(treeItemHandle, expanded);
    }
    $setSelection(treeViewId, treeItemHandles) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        treeView.setSelection(treeItemHandles);
    }
    $setFocus(treeViewId, treeItemHandles) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        treeView.setFocus(treeItemHandles);
    }
    $setVisible(treeViewId, isVisible) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        treeView.setVisible(isVisible);
    }
    $changeCheckboxState(treeViewId, checkboxUpdate) {
        const treeView = this.treeViews.get(treeViewId);
        if (!treeView) {
            throw new Error(localize('treeView.notRegistered', 'No tree view with id \'{0}\' registered.', treeViewId));
        }
        treeView.setCheckboxState(checkboxUpdate);
    }
    createExtHostTreeView(id, options, extension) {
        const treeView = new ExtHostTreeView(id, options, this._proxy, this.commands.converter, this.logService, extension);
        this.treeViews.set(id, treeView);
        return treeView;
    }
    convertArgument(arg) {
        const treeView = this.treeViews.get(arg.$treeViewId);
        if (treeView && '$treeItemHandle' in arg) {
            return treeView.getExtensionElement(arg.$treeItemHandle);
        }
        if (treeView && '$focusedTreeItem' in arg && arg.$focusedTreeItem) {
            return treeView.focusedElement;
        }
        return null;
    }
}
class ExtHostTreeView extends Disposable {
    viewId;
    proxy;
    commands;
    logService;
    extension;
    static LABEL_HANDLE_PREFIX = '0';
    static ID_HANDLE_PREFIX = '1';
    dataProvider;
    dndController;
    roots = undefined;
    elements = new Map();
    nodes = new Map();
    _visible = false;
    get visible() { return this._visible; }
    _selectedHandles = [];
    get selectedElements() { return this._selectedHandles.map(handle => this.getExtensionElement(handle)).filter(element => !isUndefinedOrNull(element)); }
    _focusedHandle = undefined;
    get focusedElement() { return (this._focusedHandle ? this.getExtensionElement(this._focusedHandle) : undefined); }
    _onDidExpandElement = this._register(new Emitter());
    onDidExpandElement = this._onDidExpandElement.event;
    _onDidCollapseElement = this._register(new Emitter());
    onDidCollapseElement = this._onDidCollapseElement.event;
    _onDidChangeSelection = this._register(new Emitter());
    onDidChangeSelection = this._onDidChangeSelection.event;
    _onDidChangeVisibility = this._register(new Emitter());
    onDidChangeVisibility = this._onDidChangeVisibility.event;
    _onDidChangeCheckboxState = this._register(new Emitter());
    onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
    _onDidChangeData = this._register(new Emitter());
    refreshPromise = Promise.resolve();
    refreshQueue = Promise.resolve();
    constructor(viewId, options, proxy, commands, logService, extension) {
        super();
        this.viewId = viewId;
        this.proxy = proxy;
        this.commands = commands;
        this.logService = logService;
        this.extension = extension;
        if (extension.contributes && extension.contributes.views) {
            for (const location in extension.contributes.views) {
                for (const view of extension.contributes.views[location]) {
                    if (view.id === viewId) {
                        this._title = view.name;
                    }
                }
            }
        }
        this.dataProvider = options.treeDataProvider;
        this.dndController = options.dragAndDropController;
        if (this.dataProvider.onDidChangeTreeData) {
            this._register(this.dataProvider.onDidChangeTreeData(elementOrElements => this._onDidChangeData.fire({ message: false, element: elementOrElements })));
        }
        let refreshingPromise;
        let promiseCallback;
        this._register(Event.debounce(this._onDidChangeData.event, (result, current) => {
            if (!result) {
                result = { message: false, elements: [] };
            }
            if (current.element !== false) {
                if (!refreshingPromise) {
                    // New refresh has started
                    refreshingPromise = new Promise(c => promiseCallback = c);
                    this.refreshPromise = this.refreshPromise.then(() => refreshingPromise);
                }
                if (Array.isArray(current.element)) {
                    result.elements.push(...current.element);
                }
                else {
                    result.elements.push(current.element);
                }
            }
            if (current.message) {
                result.message = true;
            }
            return result;
        }, 200, true)(({ message, elements }) => {
            if (elements.length) {
                this.refreshQueue = this.refreshQueue.then(() => {
                    const _promiseCallback = promiseCallback;
                    refreshingPromise = null;
                    return this.refresh(elements).then(() => _promiseCallback());
                });
            }
            if (message) {
                this.proxy.$setMessage(this.viewId, this._message);
            }
        }));
    }
    async getChildren(parentHandle) {
        const parentElement = parentHandle ? this.getExtensionElement(parentHandle) : undefined;
        if (parentHandle && !parentElement) {
            this.logService.error(`No tree item with id \'${parentHandle}\' found.`);
            return Promise.resolve([]);
        }
        let childrenNodes = this.getChildrenNodes(parentHandle); // Get it from cache
        if (!childrenNodes) {
            childrenNodes = await this.fetchChildrenNodes(parentElement);
        }
        return childrenNodes ? childrenNodes.map(n => n.item) : undefined;
    }
    getExtensionElement(treeItemHandle) {
        return this.elements.get(treeItemHandle);
    }
    reveal(element, options) {
        options = options ? options : { select: true, focus: false };
        const select = isUndefinedOrNull(options.select) ? true : options.select;
        const focus = isUndefinedOrNull(options.focus) ? false : options.focus;
        const expand = isUndefinedOrNull(options.expand) ? false : options.expand;
        if (typeof this.dataProvider.getParent !== 'function') {
            return Promise.reject(new Error(`Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`));
        }
        if (element) {
            return this.refreshPromise
                .then(() => this.resolveUnknownParentChain(element))
                .then(parentChain => this.resolveTreeNode(element, parentChain[parentChain.length - 1])
                .then(treeNode => this.proxy.$reveal(this.viewId, { item: treeNode.item, parentChain: parentChain.map(p => p.item) }, { select, focus, expand })), error => this.logService.error(error));
        }
        else {
            return this.proxy.$reveal(this.viewId, undefined, { select, focus, expand });
        }
    }
    _message = '';
    get message() {
        return this._message;
    }
    set message(message) {
        this._message = message;
        this._onDidChangeData.fire({ message: true, element: false });
    }
    _title = '';
    get title() {
        return this._title;
    }
    set title(title) {
        this._title = title;
        this.proxy.$setTitle(this.viewId, title, this._description);
    }
    _description;
    get description() {
        return this._description;
    }
    set description(description) {
        this._description = description;
        this.proxy.$setTitle(this.viewId, this._title, description);
    }
    _badge;
    get badge() {
        return this._badge;
    }
    set badge(badge) {
        if (this._badge?.value === badge?.value &&
            this._badge?.tooltip === badge?.tooltip) {
            return;
        }
        this._badge = ViewBadge.from(badge);
        this.proxy.$setBadge(this.viewId, badge);
    }
    setExpanded(treeItemHandle, expanded) {
        const element = this.getExtensionElement(treeItemHandle);
        if (element) {
            if (expanded) {
                this._onDidExpandElement.fire(Object.freeze({ element }));
            }
            else {
                this._onDidCollapseElement.fire(Object.freeze({ element }));
            }
        }
    }
    setSelection(treeItemHandles) {
        if (!equals(this._selectedHandles, treeItemHandles)) {
            this._selectedHandles = treeItemHandles;
            this._onDidChangeSelection.fire(Object.freeze({ selection: this.selectedElements }));
        }
    }
    setFocus(treeItemHandle) {
        this._focusedHandle = treeItemHandle;
    }
    setVisible(visible) {
        if (visible !== this._visible) {
            this._visible = visible;
            this._onDidChangeVisibility.fire(Object.freeze({ visible: this._visible }));
        }
    }
    async setCheckboxState(checkboxUpdates) {
        const items = (await Promise.all(checkboxUpdates.map(async (checkboxUpdate) => {
            const extensionItem = this.getExtensionElement(checkboxUpdate.treeItemHandle);
            if (extensionItem) {
                return {
                    extensionItem: extensionItem,
                    treeItem: await this.dataProvider.getTreeItem(extensionItem),
                    newState: checkboxUpdate.newState ? TreeItemCheckboxState.Checked : TreeItemCheckboxState.Unchecked
                };
            }
            return Promise.resolve(undefined);
        }))).filter((item) => item !== undefined);
        items.forEach(item => {
            item.treeItem.checkboxState = item.newState ? TreeItemCheckboxState.Checked : TreeItemCheckboxState.Unchecked;
        });
        this._onDidChangeCheckboxState.fire({ items: items.map(item => [item.extensionItem, item.newState]) });
    }
    async handleDrag(sourceTreeItemHandles, treeDataTransfer, token) {
        const extensionTreeItems = [];
        for (const sourceHandle of sourceTreeItemHandles) {
            const extensionItem = this.getExtensionElement(sourceHandle);
            if (extensionItem) {
                extensionTreeItems.push(extensionItem);
            }
        }
        if (!this.dndController?.handleDrag || (extensionTreeItems.length === 0)) {
            return;
        }
        await this.dndController.handleDrag(extensionTreeItems, treeDataTransfer, token);
        return treeDataTransfer;
    }
    get hasHandleDrag() {
        return !!this.dndController?.handleDrag;
    }
    async onDrop(treeDataTransfer, targetHandleOrNode, token) {
        const target = targetHandleOrNode ? this.getExtensionElement(targetHandleOrNode) : undefined;
        if ((!target && targetHandleOrNode) || !this.dndController?.handleDrop) {
            return;
        }
        return asPromise(() => this.dndController?.handleDrop
            ? this.dndController.handleDrop(target, treeDataTransfer, token)
            : undefined);
    }
    get hasResolve() {
        return !!this.dataProvider.resolveTreeItem;
    }
    async resolveTreeItem(treeItemHandle, token) {
        if (!this.dataProvider.resolveTreeItem) {
            return;
        }
        const element = this.elements.get(treeItemHandle);
        if (element) {
            const node = this.nodes.get(element);
            if (node) {
                const resolve = await this.dataProvider.resolveTreeItem(node.extensionItem, element, token) ?? node.extensionItem;
                this.validateTreeItem(resolve);
                // Resolvable elements. Currently only tooltip and command.
                node.item.tooltip = this.getTooltip(resolve.tooltip);
                node.item.command = this.getCommand(node.disposableStore, resolve.command);
                return node.item;
            }
        }
        return;
    }
    resolveUnknownParentChain(element) {
        return this.resolveParent(element)
            .then((parent) => {
            if (!parent) {
                return Promise.resolve([]);
            }
            return this.resolveUnknownParentChain(parent)
                .then(result => this.resolveTreeNode(parent, result[result.length - 1])
                .then(parentNode => {
                result.push(parentNode);
                return result;
            }));
        });
    }
    resolveParent(element) {
        const node = this.nodes.get(element);
        if (node) {
            return Promise.resolve(node.parent ? this.elements.get(node.parent.item.handle) : undefined);
        }
        return asPromise(() => this.dataProvider.getParent(element));
    }
    resolveTreeNode(element, parent) {
        const node = this.nodes.get(element);
        if (node) {
            return Promise.resolve(node);
        }
        return asPromise(() => this.dataProvider.getTreeItem(element))
            .then(extTreeItem => this.createHandle(element, extTreeItem, parent, true))
            .then(handle => this.getChildren(parent ? parent.item.handle : undefined)
            .then(() => {
            const cachedElement = this.getExtensionElement(handle);
            if (cachedElement) {
                const node = this.nodes.get(cachedElement);
                if (node) {
                    return Promise.resolve(node);
                }
            }
            throw new Error(`Cannot resolve tree item for element ${handle}`);
        }));
    }
    getChildrenNodes(parentNodeOrHandle) {
        if (parentNodeOrHandle) {
            let parentNode;
            if (typeof parentNodeOrHandle === 'string') {
                const parentElement = this.getExtensionElement(parentNodeOrHandle);
                parentNode = parentElement ? this.nodes.get(parentElement) : undefined;
            }
            else {
                parentNode = parentNodeOrHandle;
            }
            return parentNode ? parentNode.children || undefined : undefined;
        }
        return this.roots;
    }
    async fetchChildrenNodes(parentElement) {
        // clear children cache
        this.clearChildren(parentElement);
        const cts = new CancellationTokenSource(this._refreshCancellationSource.token);
        try {
            const parentNode = parentElement ? this.nodes.get(parentElement) : undefined;
            const elements = await this.dataProvider.getChildren(parentElement);
            if (cts.token.isCancellationRequested) {
                return undefined;
            }
            const items = await Promise.all(coalesce(elements || []).map(async (element) => {
                const item = await this.dataProvider.getTreeItem(element);
                return item && !cts.token.isCancellationRequested ? this.createAndRegisterTreeNode(element, item, parentNode) : null;
            }));
            if (cts.token.isCancellationRequested) {
                return undefined;
            }
            return coalesce(items);
        }
        finally {
            cts.dispose();
        }
    }
    _refreshCancellationSource = new CancellationTokenSource();
    refresh(elements) {
        const hasRoot = elements.some(element => !element);
        if (hasRoot) {
            // Cancel any pending children fetches
            this._refreshCancellationSource.dispose(true);
            this._refreshCancellationSource = new CancellationTokenSource();
            this.clearAll(); // clear cache
            return this.proxy.$refresh(this.viewId);
        }
        else {
            const handlesToRefresh = this.getHandlesToRefresh(elements);
            if (handlesToRefresh.length) {
                return this.refreshHandles(handlesToRefresh);
            }
        }
        return Promise.resolve(undefined);
    }
    getHandlesToRefresh(elements) {
        const elementsToUpdate = new Set();
        const elementNodes = elements.map(element => this.nodes.get(element));
        for (const elementNode of elementNodes) {
            if (elementNode && !elementsToUpdate.has(elementNode.item.handle)) {
                // check if an ancestor of extElement is already in the elements list
                let currentNode = elementNode;
                while (currentNode && currentNode.parent && elementNodes.findIndex(node => currentNode && currentNode.parent && node && node.item.handle === currentNode.parent.item.handle) === -1) {
                    const parentElement = this.elements.get(currentNode.parent.item.handle);
                    currentNode = parentElement ? this.nodes.get(parentElement) : undefined;
                }
                if (currentNode && !currentNode.parent) {
                    elementsToUpdate.add(elementNode.item.handle);
                }
            }
        }
        const handlesToUpdate = [];
        // Take only top level elements
        elementsToUpdate.forEach((handle) => {
            const element = this.elements.get(handle);
            if (element) {
                const node = this.nodes.get(element);
                if (node && (!node.parent || !elementsToUpdate.has(node.parent.item.handle))) {
                    handlesToUpdate.push(handle);
                }
            }
        });
        return handlesToUpdate;
    }
    refreshHandles(itemHandles) {
        const itemsToRefresh = {};
        return Promise.all(itemHandles.map(treeItemHandle => this.refreshNode(treeItemHandle)
            .then(node => {
            if (node) {
                itemsToRefresh[treeItemHandle] = node.item;
            }
        })))
            .then(() => Object.keys(itemsToRefresh).length ? this.proxy.$refresh(this.viewId, itemsToRefresh) : undefined);
    }
    refreshNode(treeItemHandle) {
        const extElement = this.getExtensionElement(treeItemHandle);
        if (extElement) {
            const existing = this.nodes.get(extElement);
            if (existing) {
                this.clearChildren(extElement); // clear children cache
                return asPromise(() => this.dataProvider.getTreeItem(extElement))
                    .then(extTreeItem => {
                    if (extTreeItem) {
                        const newNode = this.createTreeNode(extElement, extTreeItem, existing.parent);
                        this.updateNodeCache(extElement, newNode, existing, existing.parent);
                        existing.dispose();
                        return newNode;
                    }
                    return null;
                });
            }
        }
        return Promise.resolve(null);
    }
    createAndRegisterTreeNode(element, extTreeItem, parentNode) {
        const node = this.createTreeNode(element, extTreeItem, parentNode);
        if (extTreeItem.id && this.elements.has(node.item.handle)) {
            throw new Error(localize('treeView.duplicateElement', 'Element with id {0} is already registered', extTreeItem.id));
        }
        this.addNodeToCache(element, node);
        this.addNodeToParentCache(node, parentNode);
        return node;
    }
    getTooltip(tooltip) {
        if (MarkdownStringType.isMarkdownString(tooltip)) {
            return MarkdownString.from(tooltip);
        }
        return tooltip;
    }
    getCommand(disposable, command) {
        return command ? { ...this.commands.toInternal(command, disposable), originalId: command.command } : undefined;
    }
    getCheckbox(extensionTreeItem) {
        if (!extensionTreeItem.checkboxState) {
            return undefined;
        }
        let checkboxState;
        let tooltip = undefined;
        if (typeof extensionTreeItem.checkboxState === 'number') {
            checkboxState = extensionTreeItem.checkboxState;
        }
        else {
            checkboxState = extensionTreeItem.checkboxState.state;
            tooltip = extensionTreeItem.checkboxState.tooltip;
        }
        return { isChecked: checkboxState === TreeItemCheckboxState.Checked, tooltip };
    }
    validateTreeItem(extensionTreeItem) {
        if (!TreeItem.isTreeItem(extensionTreeItem, this.extension)) {
            throw new Error(`Extension ${this.extension.identifier.value} has provided an invalid tree item.`);
        }
    }
    createTreeNode(element, extensionTreeItem, parent) {
        this.validateTreeItem(extensionTreeItem);
        const disposableStore = new DisposableStore();
        const handle = this.createHandle(element, extensionTreeItem, parent);
        const icon = this.getLightIconPath(extensionTreeItem);
        const item = {
            handle,
            parentHandle: parent ? parent.item.handle : undefined,
            label: toTreeItemLabel(extensionTreeItem.label, this.extension),
            description: extensionTreeItem.description,
            resourceUri: extensionTreeItem.resourceUri,
            tooltip: this.getTooltip(extensionTreeItem.tooltip),
            command: this.getCommand(disposableStore, extensionTreeItem.command),
            contextValue: extensionTreeItem.contextValue,
            icon,
            iconDark: this.getDarkIconPath(extensionTreeItem) || icon,
            themeIcon: this.getThemeIcon(extensionTreeItem),
            collapsibleState: isUndefinedOrNull(extensionTreeItem.collapsibleState) ? TreeItemCollapsibleState.None : extensionTreeItem.collapsibleState,
            accessibilityInformation: extensionTreeItem.accessibilityInformation,
            checkbox: this.getCheckbox(extensionTreeItem),
        };
        return {
            item,
            extensionItem: extensionTreeItem,
            parent,
            children: undefined,
            disposableStore,
            dispose() { disposableStore.dispose(); }
        };
    }
    getThemeIcon(extensionTreeItem) {
        return extensionTreeItem.iconPath instanceof ThemeIcon ? extensionTreeItem.iconPath : undefined;
    }
    createHandle(element, { id, label, resourceUri }, parent, returnFirst) {
        if (id) {
            return `${ExtHostTreeView.ID_HANDLE_PREFIX}/${id}`;
        }
        const treeItemLabel = toTreeItemLabel(label, this.extension);
        const prefix = parent ? parent.item.handle : ExtHostTreeView.LABEL_HANDLE_PREFIX;
        let elementId = treeItemLabel ? treeItemLabel.label : resourceUri ? basename(resourceUri) : '';
        elementId = elementId.indexOf('/') !== -1 ? elementId.replace('/', '//') : elementId;
        const existingHandle = this.nodes.has(element) ? this.nodes.get(element).item.handle : undefined;
        const childrenNodes = (this.getChildrenNodes(parent) || []);
        let handle;
        let counter = 0;
        do {
            handle = `${prefix}/${counter}:${elementId}`;
            if (returnFirst || !this.elements.has(handle) || existingHandle === handle) {
                // Return first if asked for or
                // Return if handle does not exist or
                // Return if handle is being reused
                break;
            }
            counter++;
        } while (counter <= childrenNodes.length);
        return handle;
    }
    getLightIconPath(extensionTreeItem) {
        if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof ThemeIcon)) {
            if (typeof extensionTreeItem.iconPath === 'string'
                || URI.isUri(extensionTreeItem.iconPath)) {
                return this.getIconPath(extensionTreeItem.iconPath);
            }
            return this.getIconPath(extensionTreeItem.iconPath.light);
        }
        return undefined;
    }
    getDarkIconPath(extensionTreeItem) {
        if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof ThemeIcon) && extensionTreeItem.iconPath.dark) {
            return this.getIconPath(extensionTreeItem.iconPath.dark);
        }
        return undefined;
    }
    getIconPath(iconPath) {
        if (URI.isUri(iconPath)) {
            return iconPath;
        }
        return URI.file(iconPath);
    }
    addNodeToCache(element, node) {
        this.elements.set(node.item.handle, element);
        this.nodes.set(element, node);
    }
    updateNodeCache(element, newNode, existing, parentNode) {
        // Remove from the cache
        this.elements.delete(newNode.item.handle);
        this.nodes.delete(element);
        if (newNode.item.handle !== existing.item.handle) {
            this.elements.delete(existing.item.handle);
        }
        // Add the new node to the cache
        this.addNodeToCache(element, newNode);
        // Replace the node in parent's children nodes
        const childrenNodes = (this.getChildrenNodes(parentNode) || []);
        const childNode = childrenNodes.filter(c => c.item.handle === existing.item.handle)[0];
        if (childNode) {
            childrenNodes.splice(childrenNodes.indexOf(childNode), 1, newNode);
        }
    }
    addNodeToParentCache(node, parentNode) {
        if (parentNode) {
            if (!parentNode.children) {
                parentNode.children = [];
            }
            parentNode.children.push(node);
        }
        else {
            if (!this.roots) {
                this.roots = [];
            }
            this.roots.push(node);
        }
    }
    clearChildren(parentElement) {
        if (parentElement) {
            const node = this.nodes.get(parentElement);
            if (node) {
                if (node.children) {
                    for (const child of node.children) {
                        const childElement = this.elements.get(child.item.handle);
                        if (childElement) {
                            this.clear(childElement);
                        }
                    }
                }
                node.children = undefined;
            }
        }
        else {
            this.clearAll();
        }
    }
    clear(element) {
        const node = this.nodes.get(element);
        if (node) {
            if (node.children) {
                for (const child of node.children) {
                    const childElement = this.elements.get(child.item.handle);
                    if (childElement) {
                        this.clear(childElement);
                    }
                }
            }
            this.nodes.delete(element);
            this.elements.delete(node.item.handle);
            node.dispose();
        }
    }
    clearAll() {
        this.roots = undefined;
        this.elements.clear();
        this.nodes.forEach(node => node.dispose());
        this.nodes.clear();
    }
    dispose() {
        this._refreshCancellationSource.dispose();
        this.clearAll();
        this.proxy.$disposeTree(this.viewId);
    }
}
