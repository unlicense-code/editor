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
import * as DOM from 'vs/base/browser/dom';
import { renderMarkdownAsPlaintext } from 'vs/base/browser/markdownRenderer';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { CollapseAllAction } from 'vs/base/browser/ui/tree/treeDefaults';
import { ActionRunner } from 'vs/base/common/actions';
import { timeout } from 'vs/base/common/async';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { Codicon } from 'vs/base/common/codicons';
import { isCancellationError } from 'vs/base/common/errors';
import { Emitter, Event } from 'vs/base/common/event';
import { createMatches } from 'vs/base/common/filters';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { Mimes } from 'vs/base/common/mime';
import { Schemas } from 'vs/base/common/network';
import { basename, dirname } from 'vs/base/common/resources';
import { isFalsyOrWhitespace } from 'vs/base/common/strings';
import { isString } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { generateUuid } from 'vs/base/common/uuid';
import 'vs/css!./media/views';
import { VSDataTransfer } from 'vs/base/common/dataTransfer';
import { localize } from 'vs/nls';
import { createActionViewItem, createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from 'vs/platform/actions/common/actions';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { FileKind } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILabelService } from 'vs/platform/label/common/label';
import { WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { Registry } from 'vs/platform/registry/common/platform';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { focusBorder, listFilterMatchHighlight, listFilterMatchHighlightBorder, textCodeBlockBackground, textLinkForeground } from 'vs/platform/theme/common/colorRegistry';
import { ColorScheme } from 'vs/platform/theme/common/theme';
import { FileThemeIcon, FolderThemeIcon, IThemeService, registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { DraggedTreeItemsIdentifier, fillEditorsDragData, LocalSelectionTransfer } from 'vs/workbench/browser/dnd';
import { ResourceLabels } from 'vs/workbench/browser/labels';
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { Extensions, IViewDescriptorService, ResolvableTreeItem, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { ITreeViewsService } from 'vs/workbench/services/views/browser/treeViewsService';
import { CodeDataTransfers } from 'vs/platform/dnd/browser/dnd';
import { addExternalEditorsDropData, toVSDataTransfer } from 'vs/editor/browser/dnd';
import { CheckboxStateHandler, TreeItemCheckbox } from 'vs/workbench/browser/parts/views/checkbox';
import { setTimeout0 } from 'vs/base/common/platform';
let TreeViewPane = class TreeViewPane extends ViewPane {
    treeView;
    _container;
    _actionRunner;
    constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
        super({ ...options, titleMenuId: MenuId.ViewTitle, donotForwardArgs: false }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        const { treeView } = Registry.as(Extensions.ViewsRegistry).getView(options.id);
        this.treeView = treeView;
        this._register(this.treeView.onDidChangeActions(() => this.updateActions(), this));
        this._register(this.treeView.onDidChangeTitle((newTitle) => this.updateTitle(newTitle)));
        this._register(this.treeView.onDidChangeDescription((newDescription) => this.updateTitleDescription(newDescription)));
        this._register(toDisposable(() => {
            if (this._container && this.treeView.container && (this._container === this.treeView.container)) {
                this.treeView.setVisibility(false);
            }
        }));
        this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
        this._register(this.treeView.onDidChangeWelcomeState(() => this._onDidChangeViewWelcomeState.fire()));
        if (options.title !== this.treeView.title) {
            this.updateTitle(this.treeView.title);
        }
        if (options.titleDescription !== this.treeView.description) {
            this.updateTitleDescription(this.treeView.description);
        }
        this._actionRunner = new MultipleSelectionActionRunner(notificationService, () => this.treeView.getSelection());
        this.updateTreeVisibility();
    }
    focus() {
        super.focus();
        this.treeView.focus();
    }
    renderBody(container) {
        this._container = container;
        super.renderBody(container);
        this.renderTreeView(container);
    }
    shouldShowWelcome() {
        return ((this.treeView.dataProvider === undefined) || !!this.treeView.dataProvider.isTreeEmpty) && (this.treeView.message === undefined);
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.layoutTreeView(height, width);
    }
    getOptimalWidth() {
        return this.treeView.getOptimalWidth();
    }
    renderTreeView(container) {
        this.treeView.show(container);
    }
    layoutTreeView(height, width) {
        this.treeView.layout(height, width);
    }
    updateTreeVisibility() {
        this.treeView.setVisibility(this.isBodyVisible());
    }
    getActionRunner() {
        return this._actionRunner;
    }
    getActionsContext() {
        return { $treeViewId: this.id, $focusedTreeItem: true, $selectedTreeItems: true };
    }
};
TreeViewPane = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IContextKeyService),
    __param(5, IViewDescriptorService),
    __param(6, IInstantiationService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITelemetryService),
    __param(10, INotificationService)
], TreeViewPane);
export { TreeViewPane };
class Root {
    label = { label: 'root' };
    handle = '0';
    parentHandle = undefined;
    collapsibleState = TreeItemCollapsibleState.Expanded;
    children = undefined;
}
function isTreeCommandEnabled(treeCommand, contextKeyService) {
    const command = CommandsRegistry.getCommand(treeCommand.originalId ? treeCommand.originalId : treeCommand.id);
    if (command) {
        const commandAction = MenuRegistry.getCommand(command.id);
        const precondition = commandAction && commandAction.precondition;
        if (precondition) {
            return contextKeyService.contextMatchesRules(precondition);
        }
    }
    return true;
}
const noDataProviderMessage = localize('no-dataprovider', "There is no data provider registered that can provide view data.");
export const RawCustomTreeViewContextKey = new RawContextKey('customTreeView', false);
class Tree extends WorkbenchAsyncDataTree {
}
let AbstractTreeView = class AbstractTreeView extends Disposable {
    id;
    _title;
    themeService;
    instantiationService;
    commandService;
    configurationService;
    progressService;
    contextMenuService;
    keybindingService;
    notificationService;
    viewDescriptorService;
    hoverService;
    contextKeyService;
    activityService;
    logService;
    isVisible = false;
    _hasIconForParentNode = false;
    _hasIconForLeafNode = false;
    collapseAllContextKey;
    collapseAllContext;
    collapseAllToggleContextKey;
    collapseAllToggleContext;
    refreshContextKey;
    refreshContext;
    focused = false;
    domNode;
    treeContainer;
    _messageValue;
    _canSelectMany = false;
    messageElement;
    tree;
    treeLabels;
    treeViewDnd;
    _container;
    root;
    elementsToRefresh = [];
    _onDidExpandItem = this._register(new Emitter());
    onDidExpandItem = this._onDidExpandItem.event;
    _onDidCollapseItem = this._register(new Emitter());
    onDidCollapseItem = this._onDidCollapseItem.event;
    _onDidChangeSelection = this._register(new Emitter());
    onDidChangeSelection = this._onDidChangeSelection.event;
    _onDidChangeFocus = this._register(new Emitter());
    onDidChangeFocus = this._onDidChangeFocus.event;
    _onDidChangeVisibility = this._register(new Emitter());
    onDidChangeVisibility = this._onDidChangeVisibility.event;
    _onDidChangeActions = this._register(new Emitter());
    onDidChangeActions = this._onDidChangeActions.event;
    _onDidChangeWelcomeState = this._register(new Emitter());
    onDidChangeWelcomeState = this._onDidChangeWelcomeState.event;
    _onDidChangeTitle = this._register(new Emitter());
    onDidChangeTitle = this._onDidChangeTitle.event;
    _onDidChangeDescription = this._register(new Emitter());
    onDidChangeDescription = this._onDidChangeDescription.event;
    _onDidChangeCheckboxState = this._register(new Emitter());
    onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
    _onDidCompleteRefresh = this._register(new Emitter());
    constructor(id, _title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService) {
        super();
        this.id = id;
        this._title = _title;
        this.themeService = themeService;
        this.instantiationService = instantiationService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.progressService = progressService;
        this.contextMenuService = contextMenuService;
        this.keybindingService = keybindingService;
        this.notificationService = notificationService;
        this.viewDescriptorService = viewDescriptorService;
        this.hoverService = hoverService;
        this.contextKeyService = contextKeyService;
        this.activityService = activityService;
        this.logService = logService;
        this.root = new Root();
        // Try not to add anything that could be costly to this constructor. It gets called once per tree view
        // during startup, and anything added here can affect performance.
    }
    _isInitialized = false;
    initialize() {
        if (this._isInitialized) {
            return;
        }
        this._isInitialized = true;
        // Remember when adding to this method that it isn't called until the the view is visible, meaning that
        // properties could be set and events could be fired before we're initialized and that this needs to be handled.
        this.contextKeyService.bufferChangeEvents(() => {
            this.initializeShowCollapseAllAction();
            this.initializeCollapseAllToggle();
            this.initializeShowRefreshAction();
        });
        this.treeViewDnd = this.instantiationService.createInstance(CustomTreeViewDragAndDrop, this.id);
        if (this._dragAndDropController) {
            this.treeViewDnd.controller = this._dragAndDropController;
        }
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('explorer.decorations')) {
                this.doRefresh([this.root]); /** soft refresh **/
            }
        }));
        this._register(this.viewDescriptorService.onDidChangeLocation(({ views, from, to }) => {
            if (views.some(v => v.id === this.id)) {
                this.tree?.updateOptions({ overrideStyles: { listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? PANEL_BACKGROUND : SIDE_BAR_BACKGROUND } });
            }
        }));
        this.registerActions();
        this.create();
    }
    get viewContainer() {
        return this.viewDescriptorService.getViewContainerByViewId(this.id);
    }
    get viewLocation() {
        return this.viewDescriptorService.getViewLocationById(this.id);
    }
    _dragAndDropController;
    get dragAndDropController() {
        return this._dragAndDropController;
    }
    set dragAndDropController(dnd) {
        this._dragAndDropController = dnd;
        if (this.treeViewDnd) {
            this.treeViewDnd.controller = dnd;
        }
    }
    _dataProvider;
    get dataProvider() {
        return this._dataProvider;
    }
    set dataProvider(dataProvider) {
        if (dataProvider) {
            const self = this;
            this._dataProvider = new class {
                _isEmpty = true;
                _onDidChangeEmpty = new Emitter();
                onDidChangeEmpty = this._onDidChangeEmpty.event;
                get isTreeEmpty() {
                    return this._isEmpty;
                }
                async getChildren(node) {
                    let children;
                    if (node && node.children) {
                        children = node.children;
                    }
                    else {
                        node = node ?? self.root;
                        node.children = await (node instanceof Root ? dataProvider.getChildren() : dataProvider.getChildren(node));
                        children = node.children ?? [];
                    }
                    if (node instanceof Root) {
                        const oldEmpty = this._isEmpty;
                        this._isEmpty = children.length === 0;
                        if (oldEmpty !== this._isEmpty) {
                            this._onDidChangeEmpty.fire();
                        }
                    }
                    return children;
                }
            };
            if (this._dataProvider.onDidChangeEmpty) {
                this._register(this._dataProvider.onDidChangeEmpty(() => {
                    this.updateCollapseAllToggle();
                    this._onDidChangeWelcomeState.fire();
                }));
            }
            this.updateMessage();
            this.refresh();
        }
        else {
            this._dataProvider = undefined;
            this.updateMessage();
        }
        this._onDidChangeWelcomeState.fire();
    }
    _message;
    get message() {
        return this._message;
    }
    set message(message) {
        this._message = message;
        this.updateMessage();
        this._onDidChangeWelcomeState.fire();
    }
    get title() {
        return this._title;
    }
    set title(name) {
        this._title = name;
        this._onDidChangeTitle.fire(this._title);
    }
    _description;
    get description() {
        return this._description;
    }
    set description(description) {
        this._description = description;
        this._onDidChangeDescription.fire(this._description);
    }
    _badge;
    _badgeActivity;
    get badge() {
        return this._badge;
    }
    set badge(badge) {
        if (this._badge?.value === badge?.value &&
            this._badge?.tooltip === badge?.tooltip) {
            return;
        }
        if (this._badgeActivity) {
            this._badgeActivity.dispose();
            this._badgeActivity = undefined;
        }
        this._badge = badge;
        if (badge) {
            const activity = {
                badge: new NumberBadge(badge.value, () => badge.tooltip),
                priority: 50
            };
            this._badgeActivity = this.activityService.showViewActivity(this.id, activity);
        }
    }
    get canSelectMany() {
        return this._canSelectMany;
    }
    set canSelectMany(canSelectMany) {
        const oldCanSelectMany = this._canSelectMany;
        this._canSelectMany = canSelectMany;
        if (this._canSelectMany !== oldCanSelectMany) {
            this.tree?.updateOptions({ multipleSelectionSupport: this.canSelectMany });
        }
    }
    get hasIconForParentNode() {
        return this._hasIconForParentNode;
    }
    get hasIconForLeafNode() {
        return this._hasIconForLeafNode;
    }
    get visible() {
        return this.isVisible;
    }
    initializeShowCollapseAllAction(startingValue = false) {
        if (!this.collapseAllContext) {
            this.collapseAllContextKey = new RawContextKey(`treeView.${this.id}.enableCollapseAll`, startingValue, localize('treeView.enableCollapseAll', "Whether the the tree view with id {0} enables collapse all.", this.id));
            this.collapseAllContext = this.collapseAllContextKey.bindTo(this.contextKeyService);
        }
        return true;
    }
    get showCollapseAllAction() {
        this.initializeShowCollapseAllAction();
        return !!this.collapseAllContext?.get();
    }
    set showCollapseAllAction(showCollapseAllAction) {
        this.initializeShowCollapseAllAction(showCollapseAllAction);
        this.collapseAllContext?.set(showCollapseAllAction);
    }
    initializeShowRefreshAction(startingValue = false) {
        if (!this.refreshContext) {
            this.refreshContextKey = new RawContextKey(`treeView.${this.id}.enableRefresh`, startingValue, localize('treeView.enableRefresh', "Whether the tree view with id {0} enables refresh.", this.id));
            this.refreshContext = this.refreshContextKey.bindTo(this.contextKeyService);
        }
    }
    get showRefreshAction() {
        this.initializeShowRefreshAction();
        return !!this.refreshContext?.get();
    }
    set showRefreshAction(showRefreshAction) {
        this.initializeShowRefreshAction(showRefreshAction);
        this.refreshContext?.set(showRefreshAction);
    }
    registerActions() {
        const that = this;
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: `workbench.actions.treeView.${that.id}.refresh`,
                    title: localize('refresh', "Refresh"),
                    menu: {
                        id: MenuId.ViewTitle,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', that.id), that.refreshContextKey),
                        group: 'navigation',
                        order: Number.MAX_SAFE_INTEGER - 1,
                    },
                    icon: Codicon.refresh
                });
            }
            async run() {
                return that.refresh();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: `workbench.actions.treeView.${that.id}.collapseAll`,
                    title: localize('collapseAll', "Collapse All"),
                    menu: {
                        id: MenuId.ViewTitle,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', that.id), that.collapseAllContextKey),
                        group: 'navigation',
                        order: Number.MAX_SAFE_INTEGER,
                    },
                    precondition: that.collapseAllToggleContextKey,
                    icon: Codicon.collapseAll
                });
            }
            async run() {
                if (that.tree) {
                    return new CollapseAllAction(that.tree, true).run();
                }
            }
        }));
    }
    setVisibility(isVisible) {
        // Throughout setVisibility we need to check if the tree view's data provider still exists.
        // This can happen because the `getChildren` call to the extension can return
        // after the tree has been disposed.
        this.initialize();
        isVisible = !!isVisible;
        if (this.isVisible === isVisible) {
            return;
        }
        this.isVisible = isVisible;
        if (this.tree) {
            if (this.isVisible) {
                DOM.show(this.tree.getHTMLElement());
            }
            else {
                DOM.hide(this.tree.getHTMLElement()); // make sure the tree goes out of the tabindex world by hiding it
            }
            if (this.isVisible && this.elementsToRefresh.length && this.dataProvider) {
                this.doRefresh(this.elementsToRefresh);
                this.elementsToRefresh = [];
            }
        }
        setTimeout0(() => {
            if (this.dataProvider) {
                this._onDidChangeVisibility.fire(this.isVisible);
            }
        });
        if (this.visible) {
            this.activate();
        }
    }
    focus(reveal = true, revealItem) {
        if (this.tree && this.root.children && this.root.children.length > 0) {
            // Make sure the current selected element is revealed
            const element = revealItem ?? this.tree.getSelection()[0];
            if (element && reveal) {
                this.tree.reveal(element, 0.5);
            }
            // Pass Focus to Viewer
            this.tree.domFocus();
        }
        else if (this.tree) {
            this.tree.domFocus();
        }
        else {
            this.domNode.focus();
        }
    }
    show(container) {
        this._container = container;
        DOM.append(container, this.domNode);
    }
    create() {
        this.domNode = DOM.$('.tree-explorer-viewlet-tree-view');
        this.messageElement = DOM.append(this.domNode, DOM.$('.message'));
        this.updateMessage();
        this.treeContainer = DOM.append(this.domNode, DOM.$('.customview-tree'));
        this.treeContainer.classList.add('file-icon-themable-tree', 'show-file-icons');
        const focusTracker = this._register(DOM.trackFocus(this.domNode));
        this._register(focusTracker.onDidFocus(() => this.focused = true));
        this._register(focusTracker.onDidBlur(() => this.focused = false));
    }
    createTree() {
        const actionViewItemProvider = createActionViewItem.bind(undefined, this.instantiationService);
        const treeMenus = this._register(this.instantiationService.createInstance(TreeMenus, this.id));
        this.treeLabels = this._register(this.instantiationService.createInstance(ResourceLabels, this));
        const dataSource = this.instantiationService.createInstance(TreeDataSource, this, (task) => this.progressService.withProgress({ location: this.id }, () => task));
        const aligner = new Aligner(this.themeService);
        const checkboxStateHandler = this._register(new CheckboxStateHandler());
        this._register(checkboxStateHandler.onDidChangeCheckboxState(items => {
            items.forEach(item => this.tree?.rerender(item));
            this._onDidChangeCheckboxState.fire(items);
        }));
        const renderer = this.instantiationService.createInstance(TreeRenderer, this.id, treeMenus, this.treeLabels, actionViewItemProvider, aligner, checkboxStateHandler);
        const widgetAriaLabel = this._title;
        this.tree = this._register(this.instantiationService.createInstance(Tree, this.id, this.treeContainer, new TreeViewDelegate(), [renderer], dataSource, {
            identityProvider: new TreeViewIdentityProvider(),
            accessibilityProvider: {
                getAriaLabel(element) {
                    if (element.accessibilityInformation) {
                        return element.accessibilityInformation.label;
                    }
                    if (isString(element.tooltip)) {
                        return element.tooltip;
                    }
                    else {
                        if (element.resourceUri && !element.label) {
                            // The custom tree has no good information on what should be used for the aria label.
                            // Allow the tree widget's default aria label to be used.
                            return null;
                        }
                        let buildAriaLabel = '';
                        if (element.label) {
                            buildAriaLabel += element.label.label + ' ';
                        }
                        if (element.description) {
                            buildAriaLabel += element.description;
                        }
                        return buildAriaLabel;
                    }
                },
                getRole(element) {
                    return element.accessibilityInformation?.role ?? 'treeitem';
                },
                getWidgetAriaLabel() {
                    return widgetAriaLabel;
                }
            },
            keyboardNavigationLabelProvider: {
                getKeyboardNavigationLabel: (item) => {
                    return item.label ? item.label.label : (item.resourceUri ? basename(URI.revive(item.resourceUri)) : undefined);
                }
            },
            expandOnlyOnTwistieClick: (e) => {
                return !!e.command || !!e.checkbox || this.configurationService.getValue('workbench.tree.expandMode') === 'doubleClick';
            },
            collapseByDefault: (e) => {
                return e.collapsibleState !== TreeItemCollapsibleState.Expanded;
            },
            multipleSelectionSupport: this.canSelectMany,
            dnd: this.treeViewDnd,
            overrideStyles: {
                listBackground: this.viewLocation === 1 /* ViewContainerLocation.Panel */ ? PANEL_BACKGROUND : SIDE_BAR_BACKGROUND
            }
        }));
        treeMenus.setContextKeyService(this.tree.contextKeyService);
        aligner.tree = this.tree;
        const actionRunner = new MultipleSelectionActionRunner(this.notificationService, () => this.tree.getSelection());
        renderer.actionRunner = actionRunner;
        this.tree.contextKeyService.createKey(this.id, true);
        const customTreeKey = RawCustomTreeViewContextKey.bindTo(this.tree.contextKeyService);
        customTreeKey.set(true);
        this._register(this.tree.onContextMenu(e => this.onContextMenu(treeMenus, e, actionRunner)));
        this._register(this.tree.onDidChangeSelection(e => this._onDidChangeSelection.fire(e.elements)));
        this._register(this.tree.onDidChangeFocus(e => {
            if (e.elements.length) {
                this._onDidChangeFocus.fire(e.elements[0]);
            }
        }));
        this._register(this.tree.onDidChangeCollapseState(e => {
            if (!e.node.element) {
                return;
            }
            const element = Array.isArray(e.node.element.element) ? e.node.element.element[0] : e.node.element.element;
            if (e.node.collapsed) {
                this._onDidCollapseItem.fire(element);
            }
            else {
                this._onDidExpandItem.fire(element);
            }
        }));
        this.tree.setInput(this.root).then(() => this.updateContentAreas());
        this._register(this.tree.onDidOpen(async (e) => {
            if (!e.browserEvent) {
                return;
            }
            if (e.browserEvent.target && e.browserEvent.target.classList.contains(TreeItemCheckbox.checkboxClass)) {
                return;
            }
            const selection = this.tree.getSelection();
            const command = await this.resolveCommand(selection.length === 1 ? selection[0] : undefined);
            if (command && isTreeCommandEnabled(command, this.contextKeyService)) {
                let args = command.arguments || [];
                if (command.id === API_OPEN_EDITOR_COMMAND_ID || command.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
                    // Some commands owned by us should receive the
                    // `IOpenEvent` as context to open properly
                    args = [...args, e];
                }
                this.commandService.executeCommand(command.id, ...args);
            }
        }));
        this._register(treeMenus.onDidChange((changed) => this.tree?.rerender(changed)));
    }
    async resolveCommand(element) {
        let command = element?.command;
        if (element && !command) {
            if ((element instanceof ResolvableTreeItem) && element.hasResolve) {
                await element.resolve(new CancellationTokenSource().token);
                command = element.command;
            }
        }
        return command;
    }
    onContextMenu(treeMenus, treeEvent, actionRunner) {
        this.hoverService.hideHover();
        const node = treeEvent.element;
        if (node === null) {
            return;
        }
        const event = treeEvent.browserEvent;
        event.preventDefault();
        event.stopPropagation();
        this.tree.setFocus([node]);
        const actions = treeMenus.getResourceContextActions(node);
        if (!actions.length) {
            return;
        }
        this.contextMenuService.showContextMenu({
            getAnchor: () => treeEvent.anchor,
            getActions: () => actions,
            getActionViewItem: (action) => {
                const keybinding = this.keybindingService.lookupKeybinding(action.id);
                if (keybinding) {
                    return new ActionViewItem(action, action, { label: true, keybinding: keybinding.getLabel() });
                }
                return undefined;
            },
            onHide: (wasCancelled) => {
                if (wasCancelled) {
                    this.tree.domFocus();
                }
            },
            getActionsContext: () => ({ $treeViewId: this.id, $treeItemHandle: node.handle }),
            actionRunner
        });
    }
    updateMessage() {
        if (this._message) {
            this.showMessage(this._message);
        }
        else if (!this.dataProvider) {
            this.showMessage(noDataProviderMessage);
        }
        else {
            this.hideMessage();
        }
        this.updateContentAreas();
    }
    showMessage(message) {
        this._messageValue = message;
        if (!this.messageElement) {
            return;
        }
        this.messageElement.classList.remove('hide');
        this.resetMessageElement();
        if (!isFalsyOrWhitespace(this._message)) {
            this.messageElement.textContent = this._messageValue;
        }
        this.layout(this._height, this._width);
    }
    hideMessage() {
        this.resetMessageElement();
        this.messageElement?.classList.add('hide');
        this.layout(this._height, this._width);
    }
    resetMessageElement() {
        if (this.messageElement) {
            DOM.clearNode(this.messageElement);
        }
    }
    _height = 0;
    _width = 0;
    layout(height, width) {
        if (height && width && this.messageElement && this.treeContainer) {
            this._height = height;
            this._width = width;
            const treeHeight = height - DOM.getTotalHeight(this.messageElement);
            this.treeContainer.style.height = treeHeight + 'px';
            this.tree?.layout(treeHeight, width);
        }
    }
    getOptimalWidth() {
        if (this.tree) {
            const parentNode = this.tree.getHTMLElement();
            const childNodes = [].slice.call(parentNode.querySelectorAll('.outline-item-label > a'));
            return DOM.getLargestChildWidth(parentNode, childNodes);
        }
        return 0;
    }
    async refresh(elements) {
        if (this.dataProvider && this.tree) {
            if (this.refreshing) {
                await Event.toPromise(this._onDidCompleteRefresh.event);
            }
            if (!elements) {
                elements = [this.root];
                // remove all waiting elements to refresh if root is asked to refresh
                this.elementsToRefresh = [];
            }
            for (const element of elements) {
                element.children = undefined; // reset children
            }
            if (this.isVisible) {
                return this.doRefresh(elements);
            }
            else {
                if (this.elementsToRefresh.length) {
                    const seen = new Set();
                    this.elementsToRefresh.forEach(element => seen.add(element.handle));
                    for (const element of elements) {
                        if (!seen.has(element.handle)) {
                            this.elementsToRefresh.push(element);
                        }
                    }
                }
                else {
                    this.elementsToRefresh.push(...elements);
                }
            }
        }
        return undefined;
    }
    async expand(itemOrItems) {
        const tree = this.tree;
        if (!tree) {
            return;
        }
        try {
            itemOrItems = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
            await Promise.all(itemOrItems.map(element => {
                return tree.expand(element, false);
            }));
        }
        catch (e) {
            // The extension could have changed the tree during the reveal.
            // Because of that, we ignore errors.
        }
    }
    setSelection(items) {
        this.tree?.setSelection(items);
    }
    getSelection() {
        return this.tree?.getSelection() ?? [];
    }
    setFocus(item) {
        if (this.tree) {
            this.focus(true, item);
            this.tree.setFocus([item]);
        }
    }
    async reveal(item) {
        if (this.tree) {
            return this.tree.reveal(item);
        }
    }
    refreshing = false;
    async doRefresh(elements) {
        const tree = this.tree;
        if (tree && this.visible) {
            this.refreshing = true;
            try {
                await Promise.all(elements.map(element => tree.updateChildren(element, true, true)));
            }
            catch (e) {
                // When multiple calls are made to refresh the tree in quick succession,
                // we can get a "Tree element not found" error. This is expected.
                // Ideally this is fixable, so log instead of ignoring so the error is preserved.
                this.logService.error(e);
            }
            this.refreshing = false;
            this._onDidCompleteRefresh.fire();
            this.updateContentAreas();
            if (this.focused) {
                this.focus(false);
            }
            this.updateCollapseAllToggle();
        }
    }
    initializeCollapseAllToggle() {
        if (!this.collapseAllToggleContext) {
            this.collapseAllToggleContextKey = new RawContextKey(`treeView.${this.id}.toggleCollapseAll`, false, localize('treeView.toggleCollapseAll', "Whether collapse all is toggled for the tree view with id {0}.", this.id));
            this.collapseAllToggleContext = this.collapseAllToggleContextKey.bindTo(this.contextKeyService);
        }
    }
    updateCollapseAllToggle() {
        if (this.showCollapseAllAction) {
            this.initializeCollapseAllToggle();
            this.collapseAllToggleContext?.set(!!this.root.children && (this.root.children.length > 0) &&
                this.root.children.some(value => value.collapsibleState !== TreeItemCollapsibleState.None));
        }
    }
    updateContentAreas() {
        const isTreeEmpty = !this.root.children || this.root.children.length === 0;
        // Hide tree container only when there is a message and tree is empty and not refreshing
        if (this._messageValue && isTreeEmpty && !this.refreshing && this.treeContainer) {
            // If there's a dnd controller then hiding the tree prevents it from being dragged into.
            if (!this.dragAndDropController) {
                this.treeContainer.classList.add('hide');
            }
            this.domNode.setAttribute('tabindex', '0');
        }
        else if (this.treeContainer) {
            this.treeContainer.classList.remove('hide');
            this.domNode.removeAttribute('tabindex');
        }
    }
    get container() {
        return this._container;
    }
};
AbstractTreeView = __decorate([
    __param(2, IThemeService),
    __param(3, IInstantiationService),
    __param(4, ICommandService),
    __param(5, IConfigurationService),
    __param(6, IProgressService),
    __param(7, IContextMenuService),
    __param(8, IKeybindingService),
    __param(9, INotificationService),
    __param(10, IViewDescriptorService),
    __param(11, IHoverService),
    __param(12, IContextKeyService),
    __param(13, IActivityService),
    __param(14, ILogService)
], AbstractTreeView);
class TreeViewIdentityProvider {
    getId(element) {
        return element.handle;
    }
}
class TreeViewDelegate {
    getHeight(element) {
        return TreeRenderer.ITEM_HEIGHT;
    }
    getTemplateId(element) {
        return TreeRenderer.TREE_TEMPLATE_ID;
    }
}
class TreeDataSource {
    treeView;
    withProgress;
    constructor(treeView, withProgress) {
        this.treeView = treeView;
        this.withProgress = withProgress;
    }
    hasChildren(element) {
        return !!this.treeView.dataProvider && (element.collapsibleState !== TreeItemCollapsibleState.None);
    }
    async getChildren(element) {
        let result = [];
        if (this.treeView.dataProvider) {
            try {
                result = (await this.withProgress(this.treeView.dataProvider.getChildren(element))) ?? [];
            }
            catch (e) {
                if (!e.message.startsWith('Bad progress location:')) {
                    throw e;
                }
            }
        }
        return result;
    }
}
// todo@jrieken,sandy make this proper and contributable from extensions
registerThemingParticipant((theme, collector) => {
    const matchBackgroundColor = theme.getColor(listFilterMatchHighlight);
    if (matchBackgroundColor) {
        collector.addRule(`.file-icon-themable-tree .monaco-list-row .content .monaco-highlighted-label .highlight { color: unset !important; background-color: ${matchBackgroundColor}; }`);
        collector.addRule(`.monaco-tl-contents .monaco-highlighted-label .highlight { color: unset !important; background-color: ${matchBackgroundColor}; }`);
    }
    const matchBorderColor = theme.getColor(listFilterMatchHighlightBorder);
    if (matchBorderColor) {
        collector.addRule(`.file-icon-themable-tree .monaco-list-row .content .monaco-highlighted-label .highlight { color: unset !important; border: 1px dotted ${matchBorderColor}; box-sizing: border-box; }`);
        collector.addRule(`.monaco-tl-contents .monaco-highlighted-label .highlight { color: unset !important; border: 1px dotted ${matchBorderColor}; box-sizing: border-box; }`);
    }
    const link = theme.getColor(textLinkForeground);
    if (link) {
        collector.addRule(`.tree-explorer-viewlet-tree-view > .message a { color: ${link}; }`);
    }
    const focusBorderColor = theme.getColor(focusBorder);
    if (focusBorderColor) {
        collector.addRule(`.tree-explorer-viewlet-tree-view > .message a:focus { outline: 1px solid ${focusBorderColor}; outline-offset: -1px; }`);
    }
    const codeBackground = theme.getColor(textCodeBlockBackground);
    if (codeBackground) {
        collector.addRule(`.tree-explorer-viewlet-tree-view > .message code { background-color: ${codeBackground}; }`);
    }
});
let TreeRenderer = class TreeRenderer extends Disposable {
    treeViewId;
    menus;
    labels;
    actionViewItemProvider;
    aligner;
    checkboxStateHandler;
    themeService;
    configurationService;
    labelService;
    hoverService;
    treeViewsService;
    contextKeyService;
    static ITEM_HEIGHT = 22;
    static TREE_TEMPLATE_ID = 'treeExplorer';
    _actionRunner;
    _hoverDelegate;
    _hasCheckbox = false;
    _renderedElements = new Map();
    constructor(treeViewId, menus, labels, actionViewItemProvider, aligner, checkboxStateHandler, themeService, configurationService, labelService, hoverService, treeViewsService, contextKeyService) {
        super();
        this.treeViewId = treeViewId;
        this.menus = menus;
        this.labels = labels;
        this.actionViewItemProvider = actionViewItemProvider;
        this.aligner = aligner;
        this.checkboxStateHandler = checkboxStateHandler;
        this.themeService = themeService;
        this.configurationService = configurationService;
        this.labelService = labelService;
        this.hoverService = hoverService;
        this.treeViewsService = treeViewsService;
        this.contextKeyService = contextKeyService;
        this._hoverDelegate = {
            showHover: (options) => this.hoverService.showHover(options),
            delay: this.configurationService.getValue('workbench.hover.delay')
        };
        this._register(this.themeService.onDidFileIconThemeChange(() => this.rerender()));
        this._register(this.themeService.onDidColorThemeChange(() => this.rerender()));
    }
    get templateId() {
        return TreeRenderer.TREE_TEMPLATE_ID;
    }
    set actionRunner(actionRunner) {
        this._actionRunner = actionRunner;
    }
    renderTemplate(container) {
        container.classList.add('custom-view-tree-node-item');
        const checkboxContainer = DOM.append(container, DOM.$(''));
        const resourceLabel = this.labels.create(container, { supportHighlights: true, hoverDelegate: this._hoverDelegate });
        const icon = DOM.prepend(resourceLabel.element, DOM.$('.custom-view-tree-node-item-icon'));
        const actionsContainer = DOM.append(resourceLabel.element, DOM.$('.actions'));
        const actionBar = new ActionBar(actionsContainer, {
            actionViewItemProvider: this.actionViewItemProvider
        });
        return { resourceLabel, icon, checkboxContainer, actionBar, container, elementDisposable: new DisposableStore() };
    }
    getHover(label, resource, node) {
        if (!(node instanceof ResolvableTreeItem) || !node.hasResolve) {
            if (resource && !node.tooltip) {
                return undefined;
            }
            else if (node.tooltip === undefined) {
                return label;
            }
            else if (!isString(node.tooltip)) {
                return { markdown: node.tooltip, markdownNotSupportedFallback: resource ? undefined : renderMarkdownAsPlaintext(node.tooltip) }; // Passing undefined as the fallback for a resource falls back to the old native hover
            }
            else if (node.tooltip !== '') {
                return node.tooltip;
            }
            else {
                return undefined;
            }
        }
        return {
            markdown: typeof node.tooltip === 'string' ? node.tooltip :
                (token) => {
                    return new Promise((resolve) => {
                        node.resolve(token).then(() => resolve(node.tooltip));
                    });
                },
            markdownNotSupportedFallback: resource ? undefined : (label ?? '') // Passing undefined as the fallback for a resource falls back to the old native hover
        };
    }
    renderElement(element, index, templateData) {
        const node = element.element;
        const resource = node.resourceUri ? URI.revive(node.resourceUri) : null;
        const treeItemLabel = node.label ? node.label : (resource ? { label: basename(resource) } : undefined);
        const description = isString(node.description) ? node.description : resource && node.description === true ? this.labelService.getUriLabel(dirname(resource), { relative: true }) : undefined;
        const label = treeItemLabel ? treeItemLabel.label : undefined;
        const matches = (treeItemLabel && treeItemLabel.highlights && label) ? treeItemLabel.highlights.map(([start, end]) => {
            if (start < 0) {
                start = label.length + start;
            }
            if (end < 0) {
                end = label.length + end;
            }
            if ((start >= label.length) || (end > label.length)) {
                return ({ start: 0, end: 0 });
            }
            if (start > end) {
                const swap = start;
                start = end;
                end = swap;
            }
            return ({ start, end });
        }) : undefined;
        const icon = this.themeService.getColorTheme().type === ColorScheme.LIGHT ? node.icon : node.iconDark;
        const iconUrl = icon ? URI.revive(icon) : undefined;
        const title = this.getHover(label, resource, node);
        // reset
        templateData.actionBar.clear();
        templateData.icon.style.color = '';
        let commandEnabled = true;
        if (node.command) {
            commandEnabled = isTreeCommandEnabled(node.command, this.contextKeyService);
        }
        this.renderCheckbox(node, templateData);
        if (resource) {
            const fileDecorations = this.configurationService.getValue('explorer.decorations');
            const labelResource = resource ? resource : URI.parse('missing:_icon_resource');
            templateData.resourceLabel.setResource({ name: label, description, resource: labelResource }, {
                fileKind: this.getFileKind(node),
                title,
                hideIcon: this.shouldHideResourceLabelIcon(iconUrl, node.themeIcon),
                fileDecorations,
                extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                matches: matches ? matches : createMatches(element.filterData),
                strikethrough: treeItemLabel?.strikethrough,
                disabledCommand: !commandEnabled,
                labelEscapeNewLines: true
            });
        }
        else {
            templateData.resourceLabel.setResource({ name: label, description }, {
                title,
                hideIcon: true,
                extraClasses: ['custom-view-tree-node-item-resourceLabel'],
                matches: matches ? matches : createMatches(element.filterData),
                strikethrough: treeItemLabel?.strikethrough,
                disabledCommand: !commandEnabled,
                labelEscapeNewLines: true
            });
        }
        if (iconUrl) {
            templateData.icon.className = 'custom-view-tree-node-item-icon';
            templateData.icon.style.backgroundImage = DOM.asCSSUrl(iconUrl);
        }
        else {
            let iconClass;
            if (this.shouldShowThemeIcon(!!resource, node.themeIcon)) {
                iconClass = ThemeIcon.asClassName(node.themeIcon);
                if (node.themeIcon.color) {
                    templateData.icon.style.color = this.themeService.getColorTheme().getColor(node.themeIcon.color.id)?.toString() ?? '';
                }
            }
            templateData.icon.className = iconClass ? `custom-view-tree-node-item-icon ${iconClass}` : '';
            templateData.icon.style.backgroundImage = '';
        }
        if (!commandEnabled) {
            templateData.icon.className = templateData.icon.className + ' disabled';
            if (templateData.container.parentElement) {
                templateData.container.parentElement.className = templateData.container.parentElement.className + ' disabled';
            }
        }
        templateData.actionBar.context = { $treeViewId: this.treeViewId, $treeItemHandle: node.handle };
        const menuActions = this.menus.getResourceActions(node);
        if (menuActions.menu) {
            templateData.elementDisposable.add(menuActions.menu);
        }
        templateData.actionBar.push(menuActions.actions, { icon: true, label: false });
        if (this._actionRunner) {
            templateData.actionBar.actionRunner = this._actionRunner;
        }
        this.setAlignment(templateData.container, node);
        this.treeViewsService.addRenderedTreeItemElement(node, templateData.container);
        // remember rendered element
        this._renderedElements.set(element, templateData);
    }
    rerender() {
        // As we add items to the map during this call we can't directly use the map in the for loop
        // but have to create a copy of the keys first
        const keys = new Set(this._renderedElements.keys());
        for (const key of keys) {
            const value = this._renderedElements.get(key);
            if (value) {
                this.disposeElement(key, 0, value);
                this.renderElement(key, 0, value);
            }
        }
    }
    renderCheckbox(node, templateData) {
        if (node.checkbox) {
            // The first time we find a checkbox we want to rerender the visible tree to adapt the alignment
            if (!this._hasCheckbox) {
                this._hasCheckbox = true;
                this.rerender();
            }
            if (!templateData.checkbox) {
                const checkbox = new TreeItemCheckbox(templateData.checkboxContainer, this.checkboxStateHandler, this.themeService);
                templateData.checkbox = checkbox;
            }
            templateData.checkbox.render(node);
        }
        else if (templateData.checkbox) {
            templateData.checkbox.dispose();
            templateData.checkbox = undefined;
        }
    }
    setAlignment(container, treeItem) {
        container.parentElement.classList.toggle('align-icon-with-twisty', !this._hasCheckbox && this.aligner.alignIconWithTwisty(treeItem));
    }
    shouldHideResourceLabelIcon(iconUrl, icon) {
        // We always hide the resource label in favor of the iconUrl when it's provided.
        // When `ThemeIcon` is provided, we hide the resource label icon in favor of it only if it's a not a file icon.
        return (!!iconUrl || (!!icon && !this.isFileKindThemeIcon(icon)));
    }
    shouldShowThemeIcon(hasResource, icon) {
        if (!icon) {
            return false;
        }
        // If there's a resource and the icon is a file icon, then the icon (or lack thereof) will already be coming from the
        // icon theme and should use whatever the icon theme has provided.
        return !(hasResource && this.isFileKindThemeIcon(icon));
    }
    isFolderThemeIcon(icon) {
        return icon?.id === FolderThemeIcon.id;
    }
    isFileKindThemeIcon(icon) {
        if (icon) {
            return icon.id === FileThemeIcon.id || this.isFolderThemeIcon(icon);
        }
        else {
            return false;
        }
    }
    getFileKind(node) {
        if (node.themeIcon) {
            switch (node.themeIcon.id) {
                case FileThemeIcon.id:
                    return FileKind.FILE;
                case FolderThemeIcon.id:
                    return FileKind.FOLDER;
            }
        }
        return node.collapsibleState === TreeItemCollapsibleState.Collapsed || node.collapsibleState === TreeItemCollapsibleState.Expanded ? FileKind.FOLDER : FileKind.FILE;
    }
    disposeElement(resource, index, templateData) {
        templateData.elementDisposable.clear();
        this._renderedElements.delete(resource);
        this.treeViewsService.removeRenderedTreeItemElement(resource.element);
        templateData.checkbox?.dispose();
        templateData.checkbox = undefined;
    }
    disposeTemplate(templateData) {
        templateData.resourceLabel.dispose();
        templateData.actionBar.dispose();
        templateData.elementDisposable.dispose();
    }
};
TreeRenderer = __decorate([
    __param(6, IThemeService),
    __param(7, IConfigurationService),
    __param(8, ILabelService),
    __param(9, IHoverService),
    __param(10, ITreeViewsService),
    __param(11, IContextKeyService)
], TreeRenderer);
class Aligner extends Disposable {
    themeService;
    _tree;
    constructor(themeService) {
        super();
        this.themeService = themeService;
    }
    set tree(tree) {
        this._tree = tree;
    }
    alignIconWithTwisty(treeItem) {
        if (treeItem.collapsibleState !== TreeItemCollapsibleState.None) {
            return false;
        }
        if (!this.hasIcon(treeItem)) {
            return false;
        }
        if (this._tree) {
            const parent = this._tree.getParentElement(treeItem) || this._tree.getInput();
            if (this.hasIcon(parent)) {
                return !!parent.children && parent.children.some(c => c.collapsibleState !== TreeItemCollapsibleState.None && !this.hasIcon(c));
            }
            return !!parent.children && parent.children.every(c => c.collapsibleState === TreeItemCollapsibleState.None || !this.hasIcon(c));
        }
        else {
            return false;
        }
    }
    hasIcon(node) {
        const icon = this.themeService.getColorTheme().type === ColorScheme.LIGHT ? node.icon : node.iconDark;
        if (icon) {
            return true;
        }
        if (node.resourceUri || node.themeIcon) {
            const fileIconTheme = this.themeService.getFileIconTheme();
            const isFolder = node.themeIcon ? node.themeIcon.id === FolderThemeIcon.id : node.collapsibleState !== TreeItemCollapsibleState.None;
            if (isFolder) {
                return fileIconTheme.hasFileIcons && fileIconTheme.hasFolderIcons;
            }
            return fileIconTheme.hasFileIcons;
        }
        return false;
    }
}
class MultipleSelectionActionRunner extends ActionRunner {
    getSelectedResources;
    constructor(notificationService, getSelectedResources) {
        super();
        this.getSelectedResources = getSelectedResources;
        this._register(this.onDidRun(e => {
            if (e.error && !isCancellationError(e.error)) {
                notificationService.error(localize('command-error', 'Error running command {1}: {0}. This is likely caused by the extension that contributes {1}.', e.error.message, e.action.id));
            }
        }));
    }
    async runAction(action, context) {
        const selection = this.getSelectedResources();
        let selectionHandleArgs = undefined;
        let actionInSelected = false;
        if (selection.length > 1) {
            selectionHandleArgs = selection.map(selected => {
                if ((selected.handle === context.$treeItemHandle) || context.$selectedTreeItems) {
                    actionInSelected = true;
                }
                return { $treeViewId: context.$treeViewId, $treeItemHandle: selected.handle };
            });
        }
        if (!actionInSelected) {
            selectionHandleArgs = undefined;
        }
        await action.run(...[context, selectionHandleArgs]);
    }
}
let TreeMenus = class TreeMenus extends Disposable {
    id;
    menuService;
    contextKeyService;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    constructor(id, menuService) {
        super();
        this.id = id;
        this.menuService = menuService;
    }
    /**
     * Caller is now responsible for disposing of the menu!
     */
    getResourceActions(element) {
        const actions = this.getActions(MenuId.ViewItemContext, element, true);
        return { menu: actions.menu, actions: actions.primary };
    }
    getResourceContextActions(element) {
        return this.getActions(MenuId.ViewItemContext, element).secondary;
    }
    setContextKeyService(service) {
        this.contextKeyService = service;
    }
    getActions(menuId, element, listen = false) {
        if (!this.contextKeyService) {
            return { primary: [], secondary: [] };
        }
        const contextKeyService = this.contextKeyService.createOverlay([
            ['view', this.id],
            ['viewItem', element.contextValue]
        ]);
        const menu = this.menuService.createMenu(menuId, contextKeyService);
        const primary = [];
        const secondary = [];
        const result = { primary, secondary, menu };
        createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, result, 'inline');
        if (listen) {
            this._register(menu.onDidChange(() => this._onDidChange.fire(element)));
        }
        else {
            menu.dispose();
        }
        return result;
    }
    dispose() {
        this.contextKeyService = undefined;
        super.dispose();
    }
};
TreeMenus = __decorate([
    __param(1, IMenuService)
], TreeMenus);
let CustomTreeView = class CustomTreeView extends AbstractTreeView {
    extensionId;
    extensionService;
    telemetryService;
    activated = false;
    constructor(id, title, extensionId, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, contextKeyService, hoverService, extensionService, activityService, telemetryService, logService) {
        super(id, title, themeService, instantiationService, commandService, configurationService, progressService, contextMenuService, keybindingService, notificationService, viewDescriptorService, hoverService, contextKeyService, activityService, logService);
        this.extensionId = extensionId;
        this.extensionService = extensionService;
        this.telemetryService = telemetryService;
    }
    activate() {
        if (!this.activated) {
            this.telemetryService.publicLog2('Extension:ViewActivate', {
                extensionId: this.extensionId,
                id: this.id,
            });
            this.createTree();
            this.progressService.withProgress({ location: this.id }, () => this.extensionService.activateByEvent(`onView:${this.id}`))
                .then(() => timeout(2000))
                .then(() => {
                this.updateMessage();
            });
            this.activated = true;
        }
    }
};
CustomTreeView = __decorate([
    __param(3, IThemeService),
    __param(4, IInstantiationService),
    __param(5, ICommandService),
    __param(6, IConfigurationService),
    __param(7, IProgressService),
    __param(8, IContextMenuService),
    __param(9, IKeybindingService),
    __param(10, INotificationService),
    __param(11, IViewDescriptorService),
    __param(12, IContextKeyService),
    __param(13, IHoverService),
    __param(14, IExtensionService),
    __param(15, IActivityService),
    __param(16, ITelemetryService),
    __param(17, ILogService)
], CustomTreeView);
export { CustomTreeView };
export class TreeView extends AbstractTreeView {
    activated = false;
    activate() {
        if (!this.activated) {
            this.createTree();
            this.activated = true;
        }
    }
}
let CustomTreeViewDragAndDrop = class CustomTreeViewDragAndDrop {
    treeId;
    labelService;
    instantiationService;
    treeViewsDragAndDropService;
    logService;
    treeMimeType;
    treeItemsTransfer = LocalSelectionTransfer.getInstance();
    dragCancellationToken;
    constructor(treeId, labelService, instantiationService, treeViewsDragAndDropService, logService) {
        this.treeId = treeId;
        this.labelService = labelService;
        this.instantiationService = instantiationService;
        this.treeViewsDragAndDropService = treeViewsDragAndDropService;
        this.logService = logService;
        this.treeMimeType = `application/vnd.code.tree.${treeId.toLowerCase()}`;
    }
    dndController;
    set controller(controller) {
        this.dndController = controller;
    }
    handleDragAndLog(dndController, itemHandles, uuid, dragCancellationToken) {
        return dndController.handleDrag(itemHandles, uuid, dragCancellationToken).then(additionalDataTransfer => {
            if (additionalDataTransfer) {
                const unlistedTypes = [];
                for (const item of additionalDataTransfer.entries()) {
                    if ((item[0] !== this.treeMimeType) && (dndController.dragMimeTypes.findIndex(value => value === item[0]) < 0)) {
                        unlistedTypes.push(item[0]);
                    }
                }
                if (unlistedTypes.length) {
                    this.logService.warn(`Drag and drop controller for tree ${this.treeId} adds the following data transfer types but does not declare them in dragMimeTypes: ${unlistedTypes.join(', ')}`);
                }
            }
            return additionalDataTransfer;
        });
    }
    addExtensionProvidedTransferTypes(originalEvent, itemHandles) {
        if (!originalEvent.dataTransfer || !this.dndController) {
            return;
        }
        const uuid = generateUuid();
        this.dragCancellationToken = new CancellationTokenSource();
        this.treeViewsDragAndDropService.addDragOperationTransfer(uuid, this.handleDragAndLog(this.dndController, itemHandles, uuid, this.dragCancellationToken.token));
        this.treeItemsTransfer.setData([new DraggedTreeItemsIdentifier(uuid)], DraggedTreeItemsIdentifier.prototype);
        if (this.dndController.dragMimeTypes.find((element) => element === Mimes.uriList)) {
            // Add the type that the editor knows
            originalEvent.dataTransfer?.setData(DataTransfers.RESOURCES, '');
        }
        this.dndController.dragMimeTypes.forEach(supportedType => {
            originalEvent.dataTransfer?.setData(supportedType, '');
        });
    }
    addResourceInfoToTransfer(originalEvent, resources) {
        if (resources.length && originalEvent.dataTransfer) {
            // Apply some datatransfer types to allow for dragging the element outside of the application
            this.instantiationService.invokeFunction(accessor => fillEditorsDragData(accessor, resources, originalEvent));
            // The only custom data transfer we set from the explorer is a file transfer
            // to be able to DND between multiple code file explorers across windows
            const fileResources = resources.filter(s => s.scheme === Schemas.file).map(r => r.fsPath);
            if (fileResources.length) {
                originalEvent.dataTransfer.setData(CodeDataTransfers.FILES, JSON.stringify(fileResources));
            }
        }
    }
    onDragStart(data, originalEvent) {
        if (originalEvent.dataTransfer) {
            const treeItemsData = data.getData();
            const resources = [];
            const sourceInfo = {
                id: this.treeId,
                itemHandles: []
            };
            treeItemsData.forEach(item => {
                sourceInfo.itemHandles.push(item.handle);
                if (item.resourceUri) {
                    resources.push(URI.revive(item.resourceUri));
                }
            });
            this.addResourceInfoToTransfer(originalEvent, resources);
            this.addExtensionProvidedTransferTypes(originalEvent, sourceInfo.itemHandles);
            originalEvent.dataTransfer.setData(this.treeMimeType, JSON.stringify(sourceInfo));
        }
    }
    debugLog(types) {
        if (types.size) {
            this.logService.debug(`TreeView dragged mime types: ${Array.from(types).join(', ')}`);
        }
        else {
            this.logService.debug(`TreeView dragged with no supported mime types.`);
        }
    }
    onDragOver(data, targetElement, targetIndex, originalEvent) {
        const dataTransfer = toVSDataTransfer(originalEvent.dataTransfer);
        addExternalEditorsDropData(dataTransfer, originalEvent);
        const types = new Set(Array.from(dataTransfer.entries()).map(x => x[0]));
        if (originalEvent.dataTransfer) {
            // Also add uri-list if we have any files. At this stage we can't actually access the file itself though.
            for (const item of originalEvent.dataTransfer.items) {
                if (item.kind === 'file' || item.type === DataTransfers.RESOURCES.toLowerCase()) {
                    types.add(Mimes.uriList);
                    break;
                }
            }
        }
        this.debugLog(types);
        const dndController = this.dndController;
        if (!dndController || !originalEvent.dataTransfer || (dndController.dropMimeTypes.length === 0)) {
            return false;
        }
        const dragContainersSupportedType = Array.from(types).some((value, index) => {
            if (value === this.treeMimeType) {
                return true;
            }
            else {
                return dndController.dropMimeTypes.indexOf(value) >= 0;
            }
        });
        if (dragContainersSupportedType) {
            return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, autoExpand: true };
        }
        return false;
    }
    getDragURI(element) {
        if (!this.dndController) {
            return null;
        }
        return element.resourceUri ? URI.revive(element.resourceUri).toString() : element.handle;
    }
    getDragLabel(elements) {
        if (!this.dndController) {
            return undefined;
        }
        if (elements.length > 1) {
            return String(elements.length);
        }
        const element = elements[0];
        return element.label ? element.label.label : (element.resourceUri ? this.labelService.getUriLabel(URI.revive(element.resourceUri)) : undefined);
    }
    async drop(data, targetNode, targetIndex, originalEvent) {
        const dndController = this.dndController;
        if (!originalEvent.dataTransfer || !dndController) {
            return;
        }
        let treeSourceInfo;
        let willDropUuid;
        if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
            willDropUuid = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype)[0].identifier;
        }
        const originalDataTransfer = toVSDataTransfer(originalEvent.dataTransfer);
        addExternalEditorsDropData(originalDataTransfer, originalEvent, true);
        const outDataTransfer = new VSDataTransfer();
        for (const [type, item] of originalDataTransfer.entries()) {
            if (type === this.treeMimeType || dndController.dropMimeTypes.includes(type) || (item.asFile() && dndController.dropMimeTypes.includes(DataTransfers.FILES.toLowerCase()))) {
                outDataTransfer.append(type, item);
                if (type === this.treeMimeType) {
                    try {
                        treeSourceInfo = JSON.parse(await item.asString());
                    }
                    catch {
                        // noop
                    }
                }
            }
        }
        const additionalDataTransfer = await this.treeViewsDragAndDropService.removeDragOperationTransfer(willDropUuid);
        if (additionalDataTransfer) {
            for (const [type, item] of additionalDataTransfer.entries()) {
                outDataTransfer.append(type, item);
            }
        }
        return dndController.handleDrop(outDataTransfer, targetNode, CancellationToken.None, willDropUuid, treeSourceInfo?.id, treeSourceInfo?.itemHandles);
    }
    onDragEnd(originalEvent) {
        // Check if the drag was cancelled.
        if (originalEvent.dataTransfer?.dropEffect === 'none') {
            this.dragCancellationToken?.cancel();
        }
    }
};
CustomTreeViewDragAndDrop = __decorate([
    __param(1, ILabelService),
    __param(2, IInstantiationService),
    __param(3, ITreeViewsService),
    __param(4, ILogService)
], CustomTreeViewDragAndDrop);
export { CustomTreeViewDragAndDrop };
