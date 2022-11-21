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
import 'vs/css!./media/paneviewlet';
import * as nls from 'vs/nls';
import { Event, Emitter } from 'vs/base/common/event';
import { foreground } from 'vs/platform/theme/common/colorRegistry';
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { after, append, $, trackFocus, EventType, addDisposableListener, createCSSRule, asCSSUrl, Dimension, reset } from 'vs/base/browser/dom';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Action } from 'vs/base/common/actions';
import { prepareActions } from 'vs/base/browser/ui/actionbar/actionbar';
import { Registry } from 'vs/platform/registry/common/platform';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { Pane } from 'vs/base/browser/ui/splitview/paneview';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions as ViewContainerExtensions, IViewDescriptorService, defaultViewIcon, IViewsService, ViewContainerLocationToString } from 'vs/workbench/common/views';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { assertIsDefined } from 'vs/base/common/types';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MenuId, Action2, SubmenuItemAction } from 'vs/platform/actions/common/actions';
import { createActionViewItem } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { parseLinkedText } from 'vs/base/common/linkedText';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { Button } from 'vs/base/browser/ui/button/button';
import { Link } from 'vs/platform/opener/browser/link';
import { ProgressBar } from 'vs/base/browser/ui/progressbar/progressbar';
import { AbstractProgressScope, ScopedProgressIndicator } from 'vs/workbench/services/progress/browser/progressIndicator';
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { URI } from 'vs/base/common/uri';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { Codicon } from 'vs/base/common/codicons';
import { CompositeMenuActions } from 'vs/workbench/browser/actions';
import { WorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { FilterWidget } from 'vs/workbench/browser/parts/views/viewFilter';
import { BaseActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { defaultButtonStyles, getProgressBarStyles } from 'vs/platform/theme/browser/defaultStyles';
export const VIEWPANE_FILTER_ACTION = new Action('viewpane.action.filter');
const viewPaneContainerExpandedIcon = registerIcon('view-pane-container-expanded', Codicon.chevronDown, nls.localize('viewPaneContainerExpandedIcon', 'Icon for an expanded view pane container.'));
const viewPaneContainerCollapsedIcon = registerIcon('view-pane-container-collapsed', Codicon.chevronRight, nls.localize('viewPaneContainerCollapsedIcon', 'Icon for a collapsed view pane container.'));
const viewsRegistry = Registry.as(ViewContainerExtensions.ViewsRegistry);
let ViewWelcomeController = class ViewWelcomeController {
    id;
    contextKeyService;
    _onDidChange = new Emitter();
    onDidChange = this._onDidChange.event;
    defaultItem;
    items = [];
    get contents() {
        const visibleItems = this.items.filter(v => v.visible);
        if (visibleItems.length === 0 && this.defaultItem) {
            return [this.defaultItem.descriptor];
        }
        return visibleItems.map(v => v.descriptor);
    }
    disposables = new DisposableStore();
    constructor(id, contextKeyService) {
        this.id = id;
        this.contextKeyService = contextKeyService;
        contextKeyService.onDidChangeContext(this.onDidChangeContext, this, this.disposables);
        Event.filter(viewsRegistry.onDidChangeViewWelcomeContent, id => id === this.id)(this.onDidChangeViewWelcomeContent, this, this.disposables);
        this.onDidChangeViewWelcomeContent();
    }
    onDidChangeViewWelcomeContent() {
        const descriptors = viewsRegistry.getViewWelcomeContent(this.id);
        this.items = [];
        for (const descriptor of descriptors) {
            if (descriptor.when === 'default') {
                this.defaultItem = { descriptor, visible: true };
            }
            else {
                const visible = descriptor.when ? this.contextKeyService.contextMatchesRules(descriptor.when) : true;
                this.items.push({ descriptor, visible });
            }
        }
        this._onDidChange.fire();
    }
    onDidChangeContext() {
        let didChange = false;
        for (const item of this.items) {
            if (!item.descriptor.when || item.descriptor.when === 'default') {
                continue;
            }
            const visible = this.contextKeyService.contextMatchesRules(item.descriptor.when);
            if (item.visible === visible) {
                continue;
            }
            item.visible = visible;
            didChange = true;
        }
        if (didChange) {
            this._onDidChange.fire();
        }
    }
    dispose() {
        this.disposables.dispose();
    }
};
ViewWelcomeController = __decorate([
    __param(1, IContextKeyService)
], ViewWelcomeController);
let ViewPane = class ViewPane extends Pane {
    keybindingService;
    contextMenuService;
    configurationService;
    contextKeyService;
    viewDescriptorService;
    instantiationService;
    openerService;
    themeService;
    telemetryService;
    static AlwaysShowActionsConfig = 'workbench.view.alwaysShowHeaderActions';
    _onDidFocus = this._register(new Emitter());
    onDidFocus = this._onDidFocus.event;
    _onDidBlur = this._register(new Emitter());
    onDidBlur = this._onDidBlur.event;
    _onDidChangeBodyVisibility = this._register(new Emitter());
    onDidChangeBodyVisibility = this._onDidChangeBodyVisibility.event;
    _onDidChangeTitleArea = this._register(new Emitter());
    onDidChangeTitleArea = this._onDidChangeTitleArea.event;
    _onDidChangeViewWelcomeState = this._register(new Emitter());
    onDidChangeViewWelcomeState = this._onDidChangeViewWelcomeState.event;
    _isVisible = false;
    id;
    _title;
    get title() {
        return this._title;
    }
    _titleDescription;
    get titleDescription() {
        return this._titleDescription;
    }
    menuActions;
    progressBar;
    progressIndicator;
    toolbar;
    showActionsAlways = false;
    headerContainer;
    titleContainer;
    titleDescriptionContainer;
    iconContainer;
    twistiesContainer;
    bodyContainer;
    viewWelcomeContainer;
    viewWelcomeDisposable = Disposable.None;
    viewWelcomeController;
    scopedContextKeyService;
    constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
        super({ ...options, ...{ orientation: viewDescriptorService.getViewLocationById(options.id) === 1 /* ViewContainerLocation.Panel */ ? 1 /* Orientation.HORIZONTAL */ : 0 /* Orientation.VERTICAL */ } });
        this.keybindingService = keybindingService;
        this.contextMenuService = contextMenuService;
        this.configurationService = configurationService;
        this.contextKeyService = contextKeyService;
        this.viewDescriptorService = viewDescriptorService;
        this.instantiationService = instantiationService;
        this.openerService = openerService;
        this.themeService = themeService;
        this.telemetryService = telemetryService;
        this.id = options.id;
        this._title = options.title;
        this._titleDescription = options.titleDescription;
        this.showActionsAlways = !!options.showActionsAlways;
        this.scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
        this.scopedContextKeyService.createKey('view', this.id);
        const viewLocationKey = this.scopedContextKeyService.createKey('viewLocation', ViewContainerLocationToString(viewDescriptorService.getViewLocationById(this.id)));
        this._register(Event.filter(viewDescriptorService.onDidChangeLocation, e => e.views.some(view => view.id === this.id))(() => viewLocationKey.set(ViewContainerLocationToString(viewDescriptorService.getViewLocationById(this.id)))));
        this.menuActions = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])).createInstance(CompositeMenuActions, options.titleMenuId ?? MenuId.ViewTitle, MenuId.ViewTitleContext, { shouldForwardArgs: !options.donotForwardArgs }));
        this._register(this.menuActions.onDidChange(() => this.updateActions()));
        this.viewWelcomeController = new ViewWelcomeController(this.id, contextKeyService);
    }
    get headerVisible() {
        return super.headerVisible;
    }
    set headerVisible(visible) {
        super.headerVisible = visible;
        this.element.classList.toggle('merged-header', !visible);
    }
    setVisible(visible) {
        if (this._isVisible !== visible) {
            this._isVisible = visible;
            if (this.isExpanded()) {
                this._onDidChangeBodyVisibility.fire(visible);
            }
        }
    }
    isVisible() {
        return this._isVisible;
    }
    isBodyVisible() {
        return this._isVisible && this.isExpanded();
    }
    setExpanded(expanded) {
        const changed = super.setExpanded(expanded);
        if (changed) {
            this._onDidChangeBodyVisibility.fire(expanded);
        }
        if (this.twistiesContainer) {
            this.twistiesContainer.classList.remove(...ThemeIcon.asClassNameArray(this.getTwistyIcon(!expanded)));
            this.twistiesContainer.classList.add(...ThemeIcon.asClassNameArray(this.getTwistyIcon(expanded)));
        }
        return changed;
    }
    render() {
        super.render();
        const focusTracker = trackFocus(this.element);
        this._register(focusTracker);
        this._register(focusTracker.onDidFocus(() => this._onDidFocus.fire()));
        this._register(focusTracker.onDidBlur(() => this._onDidBlur.fire()));
    }
    renderHeader(container) {
        this.headerContainer = container;
        this.twistiesContainer = append(container, $(ThemeIcon.asCSSSelector(this.getTwistyIcon(this.isExpanded()))));
        this.renderHeaderTitle(container, this.title);
        const actions = append(container, $('.actions'));
        actions.classList.toggle('show', this.showActionsAlways);
        this.toolbar = this.instantiationService.createInstance(WorkbenchToolBar, actions, {
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            actionViewItemProvider: action => this.getActionViewItem(action),
            ariaLabel: nls.localize('viewToolbarAriaLabel', "{0} actions", this.title),
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            renderDropdownAsChildElement: true,
            actionRunner: this.getActionRunner(),
            resetMenu: this.menuActions.menuId
        });
        this._register(this.toolbar);
        this.setActions();
        this._register(addDisposableListener(actions, EventType.CLICK, e => e.preventDefault()));
        this._register(this.viewDescriptorService.getViewContainerModel(this.viewDescriptorService.getViewContainerByViewId(this.id)).onDidChangeContainerInfo(({ title }) => {
            this.updateTitle(this.title);
        }));
        const onDidRelevantConfigurationChange = Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration(ViewPane.AlwaysShowActionsConfig));
        this._register(onDidRelevantConfigurationChange(this.updateActionsVisibility, this));
        this.updateActionsVisibility();
    }
    getTwistyIcon(expanded) {
        return expanded ? viewPaneContainerExpandedIcon : viewPaneContainerCollapsedIcon;
    }
    style(styles) {
        super.style(styles);
        const icon = this.getIcon();
        if (this.iconContainer) {
            const fgColor = styles.headerForeground || this.themeService.getColorTheme().getColor(foreground);
            if (URI.isUri(icon)) {
                // Apply background color to activity bar item provided with iconUrls
                this.iconContainer.style.backgroundColor = fgColor ? fgColor.toString() : '';
                this.iconContainer.style.color = '';
            }
            else {
                // Apply foreground color to activity bar items provided with codicons
                this.iconContainer.style.color = fgColor ? fgColor.toString() : '';
                this.iconContainer.style.backgroundColor = '';
            }
        }
    }
    getIcon() {
        return this.viewDescriptorService.getViewDescriptorById(this.id)?.containerIcon || defaultViewIcon;
    }
    renderHeaderTitle(container, title) {
        this.iconContainer = append(container, $('.icon', undefined));
        const icon = this.getIcon();
        let cssClass = undefined;
        if (URI.isUri(icon)) {
            cssClass = `view-${this.id.replace(/[\.\:]/g, '-')}`;
            const iconClass = `.pane-header .icon.${cssClass}`;
            createCSSRule(iconClass, `
				mask: ${asCSSUrl(icon)} no-repeat 50% 50%;
				mask-size: 24px;
				-webkit-mask: ${asCSSUrl(icon)} no-repeat 50% 50%;
				-webkit-mask-size: 16px;
			`);
        }
        else if (ThemeIcon.isThemeIcon(icon)) {
            cssClass = ThemeIcon.asClassName(icon);
        }
        if (cssClass) {
            this.iconContainer.classList.add(...cssClass.split(' '));
        }
        const calculatedTitle = this.calculateTitle(title);
        this.titleContainer = append(container, $('h3.title', { title: calculatedTitle }, calculatedTitle));
        if (this._titleDescription) {
            this.setTitleDescription(this._titleDescription);
        }
        this.iconContainer.title = calculatedTitle;
        this.iconContainer.setAttribute('aria-label', calculatedTitle);
    }
    updateTitle(title) {
        const calculatedTitle = this.calculateTitle(title);
        if (this.titleContainer) {
            this.titleContainer.textContent = calculatedTitle;
            this.titleContainer.setAttribute('title', calculatedTitle);
        }
        if (this.iconContainer) {
            this.iconContainer.title = calculatedTitle;
            this.iconContainer.setAttribute('aria-label', calculatedTitle);
        }
        this._title = title;
        this._onDidChangeTitleArea.fire();
    }
    setTitleDescription(description) {
        if (this.titleDescriptionContainer) {
            this.titleDescriptionContainer.textContent = description ?? '';
            this.titleDescriptionContainer.setAttribute('title', description ?? '');
        }
        else if (description && this.titleContainer) {
            this.titleDescriptionContainer = after(this.titleContainer, $('span.description', { title: description }, description));
        }
    }
    updateTitleDescription(description) {
        this.setTitleDescription(description);
        this._titleDescription = description;
        this._onDidChangeTitleArea.fire();
    }
    calculateTitle(title) {
        const viewContainer = this.viewDescriptorService.getViewContainerByViewId(this.id);
        const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
        const viewDescriptor = this.viewDescriptorService.getViewDescriptorById(this.id);
        const isDefault = this.viewDescriptorService.getDefaultContainerById(this.id) === viewContainer;
        if (!isDefault && viewDescriptor?.containerTitle && model.title !== viewDescriptor.containerTitle) {
            return `${viewDescriptor.containerTitle}: ${title}`;
        }
        return title;
    }
    scrollableElement;
    renderBody(container) {
        this.bodyContainer = container;
        const viewWelcomeContainer = append(container, $('.welcome-view'));
        this.viewWelcomeContainer = $('.welcome-view-content', { tabIndex: 0 });
        this.scrollableElement = this._register(new DomScrollableElement(this.viewWelcomeContainer, {
            alwaysConsumeMouseWheel: true,
            horizontal: 2 /* ScrollbarVisibility.Hidden */,
            vertical: 3 /* ScrollbarVisibility.Visible */,
        }));
        append(viewWelcomeContainer, this.scrollableElement.getDomNode());
        const onViewWelcomeChange = Event.any(this.viewWelcomeController.onDidChange, this.onDidChangeViewWelcomeState);
        this._register(onViewWelcomeChange(this.updateViewWelcome, this));
        this.updateViewWelcome();
    }
    layoutBody(height, width) {
        this.viewWelcomeContainer.style.height = `${height}px`;
        this.viewWelcomeContainer.style.width = `${width}px`;
        this.viewWelcomeContainer.classList.toggle('wide', width > 640);
        this.scrollableElement.scanDomNode();
    }
    onDidScrollRoot() {
        // noop
    }
    getProgressIndicator() {
        if (this.progressBar === undefined) {
            // Progress bar
            this.progressBar = this._register(new ProgressBar(this.element, getProgressBarStyles()));
            this.progressBar.hide();
        }
        if (this.progressIndicator === undefined) {
            const that = this;
            this.progressIndicator = new ScopedProgressIndicator(assertIsDefined(this.progressBar), new class extends AbstractProgressScope {
                constructor() {
                    super(that.id, that.isBodyVisible());
                    this._register(that.onDidChangeBodyVisibility(isVisible => isVisible ? this.onScopeOpened(that.id) : this.onScopeClosed(that.id)));
                }
            }());
        }
        return this.progressIndicator;
    }
    getProgressLocation() {
        return this.viewDescriptorService.getViewContainerByViewId(this.id).id;
    }
    getBackgroundColor() {
        switch (this.viewDescriptorService.getViewLocationById(this.id)) {
            case 1 /* ViewContainerLocation.Panel */:
                return PANEL_BACKGROUND;
            case 0 /* ViewContainerLocation.Sidebar */:
            case 2 /* ViewContainerLocation.AuxiliaryBar */:
                return SIDE_BAR_BACKGROUND;
        }
        return SIDE_BAR_BACKGROUND;
    }
    focus() {
        if (this.shouldShowWelcome()) {
            this.viewWelcomeContainer.focus();
        }
        else if (this.element) {
            this.element.focus();
            this._onDidFocus.fire();
        }
    }
    setActions() {
        if (this.toolbar) {
            const primaryActions = [...this.menuActions.getPrimaryActions()];
            if (this.shouldShowFilterInHeader()) {
                primaryActions.unshift(VIEWPANE_FILTER_ACTION);
            }
            this.toolbar.setActions(prepareActions(primaryActions), prepareActions(this.menuActions.getSecondaryActions()));
            this.toolbar.context = this.getActionsContext();
        }
    }
    updateActionsVisibility() {
        if (!this.headerContainer) {
            return;
        }
        const shouldAlwaysShowActions = this.configurationService.getValue('workbench.view.alwaysShowHeaderActions');
        this.headerContainer.classList.toggle('actions-always-visible', shouldAlwaysShowActions);
    }
    updateActions() {
        this.setActions();
        this._onDidChangeTitleArea.fire();
    }
    getActionViewItem(action, options) {
        if (action.id === VIEWPANE_FILTER_ACTION.id) {
            const that = this;
            return new class extends BaseActionViewItem {
                constructor() { super(null, action); }
                setFocusable() { }
                get trapsArrowNavigation() { return true; }
                render(container) {
                    container.classList.add('viewpane-filter-container');
                    append(container, that.getFilterWidget().element);
                }
            };
        }
        return createActionViewItem(this.instantiationService, action, { ...options, ...{ menuAsChild: action instanceof SubmenuItemAction } });
    }
    getActionsContext() {
        return undefined;
    }
    getActionRunner() {
        return undefined;
    }
    getOptimalWidth() {
        return 0;
    }
    saveState() {
        // Subclasses to implement for saving state
    }
    updateViewWelcome() {
        this.viewWelcomeDisposable.dispose();
        if (!this.shouldShowWelcome()) {
            this.bodyContainer.classList.remove('welcome');
            this.viewWelcomeContainer.innerText = '';
            this.scrollableElement.scanDomNode();
            return;
        }
        const contents = this.viewWelcomeController.contents;
        if (contents.length === 0) {
            this.bodyContainer.classList.remove('welcome');
            this.viewWelcomeContainer.innerText = '';
            this.scrollableElement.scanDomNode();
            return;
        }
        const disposables = new DisposableStore();
        this.bodyContainer.classList.add('welcome');
        this.viewWelcomeContainer.innerText = '';
        for (const { content, precondition } of contents) {
            const lines = content.split('\n');
            for (let line of lines) {
                line = line.trim();
                if (!line) {
                    continue;
                }
                const linkedText = parseLinkedText(line);
                if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== 'string') {
                    const node = linkedText.nodes[0];
                    const buttonContainer = append(this.viewWelcomeContainer, $('.button-container'));
                    const button = new Button(buttonContainer, { title: node.title, supportIcons: true, ...defaultButtonStyles });
                    button.label = node.label;
                    button.onDidClick(_ => {
                        this.telemetryService.publicLog2('views.welcomeAction', { viewId: this.id, uri: node.href });
                        this.openerService.open(node.href, { allowCommands: true });
                    }, null, disposables);
                    disposables.add(button);
                    if (precondition) {
                        const updateEnablement = () => button.enabled = this.contextKeyService.contextMatchesRules(precondition);
                        updateEnablement();
                        const keys = new Set();
                        precondition.keys().forEach(key => keys.add(key));
                        const onDidChangeContext = Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(keys));
                        onDidChangeContext(updateEnablement, null, disposables);
                    }
                }
                else {
                    const p = append(this.viewWelcomeContainer, $('p'));
                    for (const node of linkedText.nodes) {
                        if (typeof node === 'string') {
                            append(p, document.createTextNode(node));
                        }
                        else {
                            const link = disposables.add(this.instantiationService.createInstance(Link, p, node, {}));
                            if (precondition && node.href.startsWith('command:')) {
                                const updateEnablement = () => link.enabled = this.contextKeyService.contextMatchesRules(precondition);
                                updateEnablement();
                                const keys = new Set();
                                precondition.keys().forEach(key => keys.add(key));
                                const onDidChangeContext = Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(keys));
                                onDidChangeContext(updateEnablement, null, disposables);
                            }
                        }
                    }
                }
            }
        }
        this.scrollableElement.scanDomNode();
        this.viewWelcomeDisposable = disposables;
    }
    shouldShowWelcome() {
        return false;
    }
    getFilterWidget() {
        return undefined;
    }
    shouldShowFilterInHeader() {
        return false;
    }
};
ViewPane = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IContextKeyService),
    __param(5, IViewDescriptorService),
    __param(6, IInstantiationService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITelemetryService)
], ViewPane);
export { ViewPane };
let FilterViewPane = class FilterViewPane extends ViewPane {
    filterWidget;
    dimension;
    filterContainer;
    constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.filterWidget = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])).createInstance(FilterWidget, options.filterOptions));
    }
    getFilterWidget() {
        return this.filterWidget;
    }
    renderBody(container) {
        super.renderBody(container);
        this.filterContainer = append(container, $('.viewpane-filter-container'));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.dimension = new Dimension(width, height);
        const wasFilterShownInHeader = !this.filterContainer?.hasChildNodes();
        const shouldShowFilterInHeader = this.shouldShowFilterInHeader();
        if (wasFilterShownInHeader !== shouldShowFilterInHeader) {
            if (shouldShowFilterInHeader) {
                reset(this.filterContainer);
            }
            this.updateActions();
            if (!shouldShowFilterInHeader) {
                append(this.filterContainer, this.filterWidget.element);
                height = height - 44;
            }
        }
        this.filterWidget.layout(width);
        this.layoutBodyContent(height, width);
    }
    shouldShowFilterInHeader() {
        return !(this.dimension && this.dimension.width < 600 && this.dimension.height > 100);
    }
};
FilterViewPane = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IContextKeyService),
    __param(5, IViewDescriptorService),
    __param(6, IInstantiationService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITelemetryService)
], FilterViewPane);
export { FilterViewPane };
export class ViewAction extends Action2 {
    desc;
    constructor(desc) {
        super(desc);
        this.desc = desc;
    }
    run(accessor, ...args) {
        const view = accessor.get(IViewsService).getActiveViewWithId(this.desc.viewId);
        if (view) {
            return this.runInView(accessor, view, ...args);
        }
    }
}
