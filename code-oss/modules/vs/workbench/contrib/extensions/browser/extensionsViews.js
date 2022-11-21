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
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { Event, Emitter } from 'vs/base/common/event';
import { isCancellationError, getErrorMessage } from 'vs/base/common/errors';
import { createErrorWithActions } from 'vs/base/common/errorMessage';
import { PagedModel, DelayedPagedModel } from 'vs/base/common/paging';
import { IExtensionManagementServerService, IWorkbenchExtensionManagementService, IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { areSameExtensions, getExtensionDependencies } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { append, $ } from 'vs/base/browser/dom';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Delegate, Renderer } from 'vs/workbench/contrib/extensions/browser/extensionsList';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { Query } from 'vs/workbench/contrib/extensions/common/extensionQuery';
import { IExtensionService, toExtension } from 'vs/workbench/services/extensions/common/extensions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { attachBadgeStyler } from 'vs/platform/theme/common/styler';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { ManageExtensionAction, getContextMenuActions, ExtensionAction } from 'vs/workbench/contrib/extensions/browser/extensionsActions';
import { WorkbenchPagedList } from 'vs/platform/list/browser/listService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { coalesce, distinct, flatten } from 'vs/base/common/arrays';
import { IExperimentService, ExperimentActionType } from 'vs/workbench/contrib/experiments/common/experimentService';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Action, Separator, ActionRunner } from 'vs/base/common/actions';
import { ExtensionIdentifier, isLanguagePackExtension } from 'vs/platform/extensions/common/extensions';
import { createCancelablePromise, ThrottledDelayer } from 'vs/base/common/async';
import { IProductService } from 'vs/platform/product/common/productService';
import { SeverityIcon } from 'vs/platform/severityIcon/common/severityIcon';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { isVirtualWorkspace } from 'vs/platform/workspace/common/virtualWorkspace';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ILogService } from 'vs/platform/log/common/log';
import { isOfflineError } from 'vs/base/parts/request/common/request';
// Extensions that are automatically classified as Programming Language extensions, but should be Feature extensions
const FORCE_FEATURE_EXTENSIONS = ['vscode.git', 'vscode.git-base', 'vscode.search-result'];
class ExtensionsViewState extends Disposable {
    _onFocus = this._register(new Emitter());
    onFocus = this._onFocus.event;
    _onBlur = this._register(new Emitter());
    onBlur = this._onBlur.event;
    currentlyFocusedItems = [];
    onFocusChange(extensions) {
        this.currentlyFocusedItems.forEach(extension => this._onBlur.fire(extension));
        this.currentlyFocusedItems = extensions;
        this.currentlyFocusedItems.forEach(extension => this._onFocus.fire(extension));
    }
}
var LocalSortBy;
(function (LocalSortBy) {
    LocalSortBy["UpdateDate"] = "UpdateDate";
})(LocalSortBy || (LocalSortBy = {}));
function isLocalSortBy(value) {
    switch (value) {
        case "UpdateDate" /* LocalSortBy.UpdateDate */: return true;
    }
}
let ExtensionsListView = class ExtensionsListView extends ViewPane {
    options;
    notificationService;
    extensionService;
    extensionsWorkbenchService;
    extensionRecommendationsService;
    contextService;
    experimentService;
    extensionManagementServerService;
    extensionManifestPropertiesService;
    extensionManagementService;
    workspaceService;
    productService;
    preferencesService;
    storageService;
    workspaceTrustManagementService;
    extensionEnablementService;
    layoutService;
    logService;
    static RECENT_UPDATE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
    bodyTemplate;
    badge;
    list = null;
    queryRequest = null;
    queryResult;
    contextMenuActionRunner = this._register(new ActionRunner());
    constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, configurationService, contextService, experimentService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, logService) {
        super({
            ...viewletViewOptions,
            showActionsAlways: true,
            maximumBodySize: options.flexibleHeight ? (storageService.getNumber(`${viewletViewOptions.id}.size`, 0 /* StorageScope.PROFILE */, 0) ? undefined : 0) : undefined
        }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.options = options;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionRecommendationsService = extensionRecommendationsService;
        this.contextService = contextService;
        this.experimentService = experimentService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.extensionManagementService = extensionManagementService;
        this.workspaceService = workspaceService;
        this.productService = productService;
        this.preferencesService = preferencesService;
        this.storageService = storageService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.extensionEnablementService = extensionEnablementService;
        this.layoutService = layoutService;
        this.logService = logService;
        if (this.options.onDidChangeTitle) {
            this._register(this.options.onDidChangeTitle(title => this.updateTitle(title)));
        }
        this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && this.notificationService.error(error)));
        this.registerActions();
    }
    registerActions() { }
    renderHeader(container) {
        container.classList.add('extension-view-header');
        super.renderHeader(container);
        if (!this.options.hideBadge) {
            this.badge = new CountBadge(append(container, $('.count-badge-wrapper')));
            this._register(attachBadgeStyler(this.badge, this.themeService));
        }
    }
    renderBody(container) {
        super.renderBody(container);
        const extensionsList = append(container, $('.extensions-list'));
        const messageContainer = append(container, $('.message-container'));
        const messageSeverityIcon = append(messageContainer, $(''));
        const messageBox = append(messageContainer, $('.message'));
        const delegate = new Delegate();
        const extensionsViewState = new ExtensionsViewState();
        const renderer = this.instantiationService.createInstance(Renderer, extensionsViewState, { hoverOptions: { position: () => { return this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? 1 /* HoverPosition.RIGHT */ : 0 /* HoverPosition.LEFT */; } } });
        this.list = this.instantiationService.createInstance(WorkbenchPagedList, 'Extensions', extensionsList, delegate, [renderer], {
            multipleSelectionSupport: false,
            setRowLineHeight: false,
            horizontalScrolling: false,
            accessibilityProvider: {
                getAriaLabel(extension) {
                    if (!extension) {
                        return '';
                    }
                    const publisher = localize('extension.arialabel.publihser', "Publisher {0}", extension.publisherDisplayName);
                    const deprecated = extension?.deprecationInfo ? localize('extension.arialabel.deprecated', "Deprecated") : '';
                    return `${extension.displayName}, ${deprecated ? `${deprecated}, ` : ''}${extension.version}, ${publisher}, ${extension.description}`;
                },
                getWidgetAriaLabel() {
                    return localize('extensions', "Extensions");
                }
            },
            overrideStyles: {
                listBackground: SIDE_BAR_BACKGROUND
            },
            openOnSingleClick: true
        });
        this._register(this.list.onContextMenu(e => this.onContextMenu(e), this));
        this._register(this.list.onDidChangeFocus(e => extensionsViewState.onFocusChange(coalesce(e.elements)), this));
        this._register(this.list);
        this._register(extensionsViewState);
        this._register(Event.debounce(Event.filter(this.list.onDidOpen, e => e.element !== null), (_, event) => event, 75, true)(options => {
            this.openExtension(options.element, { sideByside: options.sideBySide, ...options.editorOptions });
        }));
        this.bodyTemplate = {
            extensionsList,
            messageBox,
            messageContainer,
            messageSeverityIcon
        };
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        if (this.bodyTemplate) {
            this.bodyTemplate.extensionsList.style.height = height + 'px';
        }
        this.list?.layout(height, width);
    }
    async show(query, refresh) {
        if (this.queryRequest) {
            if (!refresh && this.queryRequest.query === query) {
                return this.queryRequest.request;
            }
            this.queryRequest.request.cancel();
            this.queryRequest = null;
        }
        if (this.queryResult) {
            this.queryResult.disposables.dispose();
            this.queryResult = undefined;
        }
        const parsedQuery = Query.parse(query);
        const options = {
            sortOrder: 0 /* SortOrder.Default */
        };
        switch (parsedQuery.sortBy) {
            case 'installs':
                options.sortBy = 4 /* GallerySortBy.InstallCount */;
                break;
            case 'rating':
                options.sortBy = 12 /* GallerySortBy.WeightedRating */;
                break;
            case 'name':
                options.sortBy = 2 /* GallerySortBy.Title */;
                break;
            case 'publishedDate':
                options.sortBy = 10 /* GallerySortBy.PublishedDate */;
                break;
            case 'updateDate':
                options.sortBy = "UpdateDate" /* LocalSortBy.UpdateDate */;
                break;
        }
        const request = createCancelablePromise(async (token) => {
            try {
                this.queryResult = await this.query(parsedQuery, options, token);
                const model = this.queryResult.model;
                this.setModel(model);
                if (this.queryResult.onDidChangeModel) {
                    this.queryResult.disposables.add(this.queryResult.onDidChangeModel(model => this.updateModel(model)));
                }
                return model;
            }
            catch (e) {
                const model = new PagedModel([]);
                if (!isCancellationError(e)) {
                    this.logService.error(e);
                    this.setModel(model, e);
                }
                return this.list ? this.list.model : model;
            }
        });
        request.finally(() => this.queryRequest = null);
        this.queryRequest = { query, request };
        return request;
    }
    count() {
        return this.list ? this.list.length : 0;
    }
    showEmptyModel() {
        const emptyModel = new PagedModel([]);
        this.setModel(emptyModel);
        return Promise.resolve(emptyModel);
    }
    async onContextMenu(e) {
        if (e.element) {
            const disposables = new DisposableStore();
            const manageExtensionAction = disposables.add(this.instantiationService.createInstance(ManageExtensionAction));
            const extension = e.element ? this.extensionsWorkbenchService.local.find(local => areSameExtensions(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element
                : e.element;
            manageExtensionAction.extension = extension;
            let groups = [];
            if (manageExtensionAction.enabled) {
                groups = await manageExtensionAction.getActionGroups();
            }
            else if (extension) {
                groups = await getContextMenuActions(extension, this.contextKeyService, this.instantiationService);
                groups.forEach(group => group.forEach(extensionAction => {
                    if (extensionAction instanceof ExtensionAction) {
                        extensionAction.extension = extension;
                    }
                }));
            }
            let actions = [];
            for (const menuActions of groups) {
                actions = [...actions, ...menuActions, new Separator()];
            }
            actions.pop();
            this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                actionRunner: this.contextMenuActionRunner,
                onHide: () => disposables.dispose()
            });
        }
    }
    async query(query, options, token) {
        const idRegex = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
        const ids = [];
        let idMatch;
        while ((idMatch = idRegex.exec(query.value)) !== null) {
            const name = idMatch[1];
            ids.push(name);
        }
        if (ids.length) {
            const model = await this.queryByIds(ids, options, token);
            return { model, disposables: new DisposableStore() };
        }
        if (ExtensionsListView.isLocalExtensionsQuery(query.value, query.sortBy)) {
            return this.queryLocal(query, options);
        }
        if (ExtensionsListView.isSearchPopularQuery(query.value)) {
            query.value = query.value.replace('@popular', '');
            options.sortBy = !options.sortBy ? 4 /* GallerySortBy.InstallCount */ : options.sortBy;
        }
        else if (ExtensionsListView.isSearchRecentlyPublishedQuery(query.value)) {
            query.value = query.value.replace('@recentlyPublished', '');
            options.sortBy = !options.sortBy ? 10 /* GallerySortBy.PublishedDate */ : options.sortBy;
        }
        const galleryQueryOptions = { ...options, sortBy: isLocalSortBy(options.sortBy) ? undefined : options.sortBy };
        const model = await this.queryGallery(query, galleryQueryOptions, token);
        return { model, disposables: new DisposableStore() };
    }
    async queryByIds(ids, options, token) {
        const idsSet = ids.reduce((result, id) => { result.add(id.toLowerCase()); return result; }, new Set());
        const result = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
            .filter(e => idsSet.has(e.identifier.id.toLowerCase()));
        const galleryIds = result.length ? ids.filter(id => result.every(r => !areSameExtensions(r.identifier, { id }))) : ids;
        if (galleryIds.length) {
            const galleryResult = await this.extensionsWorkbenchService.getExtensions(galleryIds.map(id => ({ id })), { source: 'queryById' }, token);
            result.push(...galleryResult);
        }
        return this.getPagedModel(result);
    }
    async queryLocal(query, options) {
        const local = await this.extensionsWorkbenchService.queryLocal(this.options.server);
        let { extensions, canIncludeInstalledExtensions } = await this.filterLocal(local, this.extensionService.extensions, query, options);
        const disposables = new DisposableStore();
        const onDidChangeModel = disposables.add(new Emitter());
        if (canIncludeInstalledExtensions) {
            let isDisposed = false;
            disposables.add(toDisposable(() => isDisposed = true));
            disposables.add(Event.debounce(Event.any(Event.filter(this.extensionsWorkbenchService.onChange, e => e?.state === 1 /* ExtensionState.Installed */), this.extensionService.onDidChangeExtensions), () => undefined)(async () => {
                const local = this.options.server ? this.extensionsWorkbenchService.installed.filter(e => e.server === this.options.server) : this.extensionsWorkbenchService.local;
                const { extensions: newExtensions } = await this.filterLocal(local, this.extensionService.extensions, query, options);
                if (!isDisposed) {
                    const mergedExtensions = this.mergeAddedExtensions(extensions, newExtensions);
                    if (mergedExtensions) {
                        extensions = mergedExtensions;
                        onDidChangeModel.fire(new PagedModel(extensions));
                    }
                }
            }));
        }
        return {
            model: new PagedModel(extensions),
            onDidChangeModel: onDidChangeModel.event,
            disposables
        };
    }
    async filterLocal(local, runningExtensions, query, options) {
        const value = query.value;
        let extensions = [];
        let canIncludeInstalledExtensions = true;
        if (/@builtin/i.test(value)) {
            extensions = this.filterBuiltinExtensions(local, query, options);
            canIncludeInstalledExtensions = false;
        }
        else if (/@installed/i.test(value)) {
            extensions = this.filterInstalledExtensions(local, runningExtensions, query, options);
        }
        else if (/@outdated/i.test(value)) {
            extensions = this.filterOutdatedExtensions(local, query, options);
        }
        else if (/@disabled/i.test(value)) {
            extensions = this.filterDisabledExtensions(local, runningExtensions, query, options);
        }
        else if (/@enabled/i.test(value)) {
            extensions = this.filterEnabledExtensions(local, runningExtensions, query, options);
        }
        else if (/@workspaceUnsupported/i.test(value)) {
            extensions = this.filterWorkspaceUnsupportedExtensions(local, query, options);
        }
        else if (/@deprecated/i.test(query.value)) {
            extensions = await this.filterDeprecatedExtensions(local, query, options);
        }
        else if (/@recentlyUpdated/i.test(query.value)) {
            extensions = this.filterRecentlyUpdatedExtensions(local, query, options);
        }
        return { extensions, canIncludeInstalledExtensions };
    }
    filterBuiltinExtensions(local, query, options) {
        let value = query.value;
        const showThemesOnly = /@builtin:themes/i.test(value);
        if (showThemesOnly) {
            value = value.replace(/@builtin:themes/g, '');
        }
        const showBasicsOnly = /@builtin:basics/i.test(value);
        if (showBasicsOnly) {
            value = value.replace(/@builtin:basics/g, '');
        }
        const showFeaturesOnly = /@builtin:features/i.test(value);
        if (showFeaturesOnly) {
            value = value.replace(/@builtin:features/g, '');
        }
        value = value.replace(/@builtin/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
        const result = local
            .filter(e => e.isBuiltin && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
        const isThemeExtension = (e) => {
            return (Array.isArray(e.local?.manifest?.contributes?.themes) && e.local.manifest.contributes.themes.length > 0)
                || (Array.isArray(e.local?.manifest?.contributes?.iconThemes) && e.local.manifest.contributes.iconThemes.length > 0);
        };
        if (showThemesOnly) {
            const themesExtensions = result.filter(isThemeExtension);
            return this.sortExtensions(themesExtensions, options);
        }
        const isLangaugeBasicExtension = (e) => {
            return FORCE_FEATURE_EXTENSIONS.indexOf(e.identifier.id) === -1
                && (Array.isArray(e.local?.manifest?.contributes?.grammars) && e.local.manifest.contributes.grammars.length > 0);
        };
        if (showBasicsOnly) {
            const basics = result.filter(isLangaugeBasicExtension);
            return this.sortExtensions(basics, options);
        }
        if (showFeaturesOnly) {
            const others = result.filter(e => {
                return e.local
                    && e.local.manifest
                    && !isThemeExtension(e)
                    && !isLangaugeBasicExtension(e);
            });
            return this.sortExtensions(others, options);
        }
        return this.sortExtensions(result, options);
    }
    parseCategories(value) {
        const categories = [];
        value = value.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
            const entry = (category || quotedCategory || '').toLowerCase();
            if (categories.indexOf(entry) === -1) {
                categories.push(entry);
            }
            return '';
        });
        return { value, categories };
    }
    filterInstalledExtensions(local, runningExtensions, query, options) {
        let { value, categories } = this.parseCategories(query.value);
        value = value.replace(/@installed/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
        const matchingText = (e) => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
            && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category)));
        let result;
        if (options.sortBy !== undefined) {
            result = local.filter(e => !e.isBuiltin && matchingText(e));
            result = this.sortExtensions(result, options);
        }
        else {
            result = local.filter(e => (!e.isBuiltin || e.outdated || e.reloadRequiredStatus !== undefined) && matchingText(e));
            const runningExtensionsById = runningExtensions.reduce((result, e) => { result.set(ExtensionIdentifier.toKey(e.identifier.value), e); return result; }, new Map());
            const defaultSort = (e1, e2) => {
                const running1 = runningExtensionsById.get(ExtensionIdentifier.toKey(e1.identifier.id));
                const isE1Running = !!running1 && this.extensionManagementServerService.getExtensionManagementServer(toExtension(running1)) === e1.server;
                const running2 = runningExtensionsById.get(ExtensionIdentifier.toKey(e2.identifier.id));
                const isE2Running = running2 && this.extensionManagementServerService.getExtensionManagementServer(toExtension(running2)) === e2.server;
                if ((isE1Running && isE2Running)) {
                    return e1.displayName.localeCompare(e2.displayName);
                }
                const isE1LanguagePackExtension = e1.local && isLanguagePackExtension(e1.local.manifest);
                const isE2LanguagePackExtension = e2.local && isLanguagePackExtension(e2.local.manifest);
                if (!isE1Running && !isE2Running) {
                    if (isE1LanguagePackExtension) {
                        return -1;
                    }
                    if (isE2LanguagePackExtension) {
                        return 1;
                    }
                    return e1.displayName.localeCompare(e2.displayName);
                }
                if ((isE1Running && isE2LanguagePackExtension) || (isE2Running && isE1LanguagePackExtension)) {
                    return e1.displayName.localeCompare(e2.displayName);
                }
                return isE1Running ? -1 : 1;
            };
            const outdated = [];
            const reloadRequired = [];
            const noActionRequired = [];
            result.forEach(e => {
                if (e.outdated && !this.extensionsWorkbenchService.isExtensionIgnoresUpdates(e)) {
                    outdated.push(e);
                }
                else if (e.reloadRequiredStatus) {
                    reloadRequired.push(e);
                }
                else {
                    noActionRequired.push(e);
                }
            });
            result = [...outdated.sort(defaultSort), ...reloadRequired.sort(defaultSort), ...noActionRequired.sort(defaultSort)];
        }
        return result;
    }
    filterOutdatedExtensions(local, query, options) {
        let { value, categories } = this.parseCategories(query.value);
        value = value.replace(/@outdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
        const result = local
            .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
            .filter(extension => extension.outdated
            && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1)
            && (!categories.length || categories.some(category => !!extension.local && extension.local.manifest.categories.some(c => c.toLowerCase() === category))));
        return this.sortExtensions(result, options);
    }
    filterDisabledExtensions(local, runningExtensions, query, options) {
        let { value, categories } = this.parseCategories(query.value);
        value = value.replace(/@disabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
        const result = local
            .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
            .filter(e => runningExtensions.every(r => !areSameExtensions({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
            && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
            && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
        return this.sortExtensions(result, options);
    }
    filterEnabledExtensions(local, runningExtensions, query, options) {
        let { value, categories } = this.parseCategories(query.value);
        value = value ? value.replace(/@enabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase() : '';
        local = local.filter(e => !e.isBuiltin);
        const result = local
            .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
            .filter(e => runningExtensions.some(r => areSameExtensions({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
            && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
            && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
        return this.sortExtensions(result, options);
    }
    filterWorkspaceUnsupportedExtensions(local, query, options) {
        // shows local extensions which are restricted or disabled in the current workspace because of the extension's capability
        const queryString = query.value; // @sortby is already filtered out
        const match = queryString.match(/^\s*@workspaceUnsupported(?::(untrusted|virtual)(Partial)?)?(?:\s+([^\s]*))?/i);
        if (!match) {
            return [];
        }
        const type = match[1]?.toLowerCase();
        const partial = !!match[2];
        const nameFilter = match[3]?.toLowerCase();
        if (nameFilter) {
            local = local.filter(extension => extension.name.toLowerCase().indexOf(nameFilter) > -1 || extension.displayName.toLowerCase().indexOf(nameFilter) > -1);
        }
        const hasVirtualSupportType = (extension, supportType) => {
            return extension.local && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.local.manifest) === supportType;
        };
        const hasRestrictedSupportType = (extension, supportType) => {
            if (!extension.local) {
                return false;
            }
            const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
            if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                return false;
            }
            if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === supportType) {
                return true;
            }
            if (supportType === false) {
                const dependencies = getExtensionDependencies(local.map(ext => ext.local), extension.local);
                return dependencies.some(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === supportType);
            }
            return false;
        };
        const inVirtualWorkspace = isVirtualWorkspace(this.workspaceService.getWorkspace());
        const inRestrictedWorkspace = !this.workspaceTrustManagementService.isWorkspaceTrusted();
        if (type === 'virtual') {
            // show limited and disabled extensions unless disabled because of a untrusted workspace
            local = local.filter(extension => inVirtualWorkspace && hasVirtualSupportType(extension, partial ? 'limited' : false) && !(inRestrictedWorkspace && hasRestrictedSupportType(extension, false)));
        }
        else if (type === 'untrusted') {
            // show limited and disabled extensions unless disabled because of a virtual workspace
            local = local.filter(extension => hasRestrictedSupportType(extension, partial ? 'limited' : false) && !(inVirtualWorkspace && hasVirtualSupportType(extension, false)));
        }
        else {
            // show extensions that are restricted or disabled in the current workspace
            local = local.filter(extension => inVirtualWorkspace && !hasVirtualSupportType(extension, true) || inRestrictedWorkspace && !hasRestrictedSupportType(extension, true));
        }
        return this.sortExtensions(local, options);
    }
    async filterDeprecatedExtensions(local, query, options) {
        const value = query.value.replace(/@deprecated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
        const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
        const deprecatedExtensionIds = Object.keys(extensionsControlManifest.deprecated);
        local = local.filter(e => deprecatedExtensionIds.includes(e.identifier.id) && (!value || e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
        return this.sortExtensions(local, options);
    }
    filterRecentlyUpdatedExtensions(local, query, options) {
        let { value, categories } = this.parseCategories(query.value);
        const currentTime = Date.now();
        local = local.filter(e => !e.isBuiltin && !e.outdated && e.local?.updated && e.local?.installedTimestamp !== undefined && currentTime - e.local.installedTimestamp < ExtensionsListView.RECENT_UPDATE_DURATION);
        value = value.replace(/@recentlyUpdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
        const result = local.filter(e => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) &&
            (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
        options.sortBy = options.sortBy ?? "UpdateDate" /* LocalSortBy.UpdateDate */;
        return this.sortExtensions(result, options);
    }
    mergeAddedExtensions(extensions, newExtensions) {
        const oldExtensions = [...extensions];
        const findPreviousExtensionIndex = (from) => {
            let index = -1;
            const previousExtensionInNew = newExtensions[from];
            if (previousExtensionInNew) {
                index = oldExtensions.findIndex(e => areSameExtensions(e.identifier, previousExtensionInNew.identifier));
                if (index === -1) {
                    return findPreviousExtensionIndex(from - 1);
                }
            }
            return index;
        };
        let hasChanged = false;
        for (let index = 0; index < newExtensions.length; index++) {
            const extension = newExtensions[index];
            if (extensions.every(r => !areSameExtensions(r.identifier, extension.identifier))) {
                hasChanged = true;
                extensions.splice(findPreviousExtensionIndex(index - 1) + 1, 0, extension);
            }
        }
        return hasChanged ? extensions : undefined;
    }
    async queryGallery(query, options, token) {
        const hasUserDefinedSortOrder = options.sortBy !== undefined;
        if (!hasUserDefinedSortOrder && !query.value.trim()) {
            options.sortBy = 4 /* GallerySortBy.InstallCount */;
        }
        if (this.isRecommendationsQuery(query)) {
            return this.queryRecommendations(query, options, token);
        }
        if (/\bcurated:([^\s]+)\b/.test(query.value)) {
            return this.getCuratedModel(query, options, token);
        }
        const text = query.value;
        if (/\bext:([^\s]+)\b/g.test(text)) {
            options.text = text;
            options.source = 'file-extension-tags';
            return this.extensionsWorkbenchService.queryGallery(options, token).then(pager => this.getPagedModel(pager));
        }
        let preferredResults = [];
        if (text) {
            options.text = text.substring(0, 350);
            options.source = 'searchText';
            if (!hasUserDefinedSortOrder) {
                const searchExperiments = await this.getSearchExperiments();
                for (const experiment of searchExperiments) {
                    if (experiment.action && text.toLowerCase() === experiment.action.properties['searchText'] && Array.isArray(experiment.action.properties['preferredResults'])) {
                        preferredResults = experiment.action.properties['preferredResults'];
                        options.source += `-experiment-${experiment.id}`;
                        break;
                    }
                }
            }
        }
        else {
            options.source = 'viewlet';
        }
        const pager = await this.extensionsWorkbenchService.queryGallery(options, token);
        let positionToUpdate = 0;
        for (const preferredResult of preferredResults) {
            for (let j = positionToUpdate; j < pager.firstPage.length; j++) {
                if (areSameExtensions(pager.firstPage[j].identifier, { id: preferredResult })) {
                    if (positionToUpdate !== j) {
                        const preferredExtension = pager.firstPage.splice(j, 1)[0];
                        pager.firstPage.splice(positionToUpdate, 0, preferredExtension);
                        positionToUpdate++;
                    }
                    break;
                }
            }
        }
        return this.getPagedModel(pager);
    }
    resetSearchExperiments() { ExtensionsListView.searchExperiments = undefined; }
    static searchExperiments;
    getSearchExperiments() {
        if (!ExtensionsListView.searchExperiments) {
            ExtensionsListView.searchExperiments = this.experimentService.getExperimentsByType(ExperimentActionType.ExtensionSearchResults)
                .then(null, e => {
                this.logService.error(e);
                return [];
            });
        }
        return ExtensionsListView.searchExperiments;
    }
    sortExtensions(extensions, options) {
        switch (options.sortBy) {
            case 4 /* GallerySortBy.InstallCount */:
                extensions = extensions.sort((e1, e2) => typeof e2.installCount === 'number' && typeof e1.installCount === 'number' ? e2.installCount - e1.installCount : NaN);
                break;
            case "UpdateDate" /* LocalSortBy.UpdateDate */:
                extensions = extensions.sort((e1, e2) => typeof e2.local?.installedTimestamp === 'number' && typeof e1.local?.installedTimestamp === 'number' ? e2.local.installedTimestamp - e1.local.installedTimestamp :
                    typeof e2.local?.installedTimestamp === 'number' ? 1 :
                        typeof e1.local?.installedTimestamp === 'number' ? -1 : NaN);
                break;
            case 6 /* GallerySortBy.AverageRating */:
            case 12 /* GallerySortBy.WeightedRating */:
                extensions = extensions.sort((e1, e2) => typeof e2.rating === 'number' && typeof e1.rating === 'number' ? e2.rating - e1.rating : NaN);
                break;
            default:
                extensions = extensions.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                break;
        }
        if (options.sortOrder === 2 /* SortOrder.Descending */) {
            extensions = extensions.reverse();
        }
        return extensions;
    }
    async getCuratedModel(query, options, token) {
        const value = query.value.replace(/curated:/g, '').trim();
        let ids = await this.experimentService.getCuratedExtensionsList(value);
        if (Array.isArray(ids) && ids.length) {
            ids = ids.map(id => id.toLowerCase());
            const extensions = await this.extensionsWorkbenchService.getExtensions(ids.map(id => ({ id })), { source: `curated:${value}` }, token);
            // Sorts the firstPage of the pager in the same order as given array of extension ids
            extensions.sort((a, b) => ids.indexOf(a.identifier.id.toLowerCase()) < ids.indexOf(b.identifier.id.toLowerCase()) ? -1 : 1);
            return this.getPagedModel(extensions);
        }
        return new PagedModel([]);
    }
    isRecommendationsQuery(query) {
        return ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value)
            || ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value)
            || ExtensionsListView.isLanguageRecommendedExtensionsQuery(query.value)
            || ExtensionsListView.isExeRecommendedExtensionsQuery(query.value)
            || /@recommended:all/i.test(query.value)
            || ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value)
            || ExtensionsListView.isRecommendedExtensionsQuery(query.value);
    }
    async queryRecommendations(query, options, token) {
        // Workspace recommendations
        if (ExtensionsListView.isWorkspaceRecommendedExtensionsQuery(query.value)) {
            return this.getWorkspaceRecommendationsModel(query, options, token);
        }
        // Keymap recommendations
        if (ExtensionsListView.isKeymapsRecommendedExtensionsQuery(query.value)) {
            return this.getKeymapRecommendationsModel(query, options, token);
        }
        // Language recommendations
        if (ExtensionsListView.isLanguageRecommendedExtensionsQuery(query.value)) {
            return this.getLanguageRecommendationsModel(query, options, token);
        }
        // Exe recommendations
        if (ExtensionsListView.isExeRecommendedExtensionsQuery(query.value)) {
            return this.getExeRecommendationsModel(query, options, token);
        }
        // All recommendations
        if (/@recommended:all/i.test(query.value)) {
            return this.getAllRecommendationsModel(options, token);
        }
        // Search recommendations
        if (ExtensionsListView.isSearchRecommendedExtensionsQuery(query.value) ||
            (ExtensionsListView.isRecommendedExtensionsQuery(query.value) && options.sortBy !== undefined)) {
            return this.searchRecommendations(query, options, token);
        }
        // Other recommendations
        if (ExtensionsListView.isRecommendedExtensionsQuery(query.value)) {
            return this.getOtherRecommendationsModel(query, options, token);
        }
        return new PagedModel([]);
    }
    async getInstallableRecommendations(recommendations, options, token) {
        const result = [];
        if (recommendations.length) {
            const extensions = await this.extensionsWorkbenchService.getExtensions(recommendations.map(id => ({ id })), { source: options.source }, token);
            for (const extension of extensions) {
                if (extension.gallery && (await this.extensionManagementService.canInstall(extension.gallery))) {
                    result.push(extension);
                }
            }
        }
        return result;
    }
    async getWorkspaceRecommendations() {
        const recommendations = await this.extensionRecommendationsService.getWorkspaceRecommendations();
        const { important } = await this.extensionRecommendationsService.getConfigBasedRecommendations();
        for (const configBasedRecommendation of important) {
            if (!recommendations.find(extensionId => extensionId === configBasedRecommendation)) {
                recommendations.push(configBasedRecommendation);
            }
        }
        return recommendations;
    }
    async getWorkspaceRecommendationsModel(query, options, token) {
        const recommendations = await this.getWorkspaceRecommendations();
        const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-workspace' }, token));
        const result = coalesce(recommendations.map(id => installableRecommendations.find(i => areSameExtensions(i.identifier, { id }))));
        return new PagedModel(result);
    }
    async getKeymapRecommendationsModel(query, options, token) {
        const value = query.value.replace(/@recommended:keymaps/g, '').trim().toLowerCase();
        const recommendations = this.extensionRecommendationsService.getKeymapRecommendations();
        const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-keymaps' }, token))
            .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
        return new PagedModel(installableRecommendations);
    }
    async getLanguageRecommendationsModel(query, options, token) {
        const value = query.value.replace(/@recommended:languages/g, '').trim().toLowerCase();
        const recommendations = this.extensionRecommendationsService.getLanguageRecommendations();
        const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-languages' }, token))
            .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
        return new PagedModel(installableRecommendations);
    }
    async getExeRecommendationsModel(query, options, token) {
        const exe = query.value.replace(/@exe:/g, '').trim().toLowerCase();
        const { important, others } = await this.extensionRecommendationsService.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
        const installableRecommendations = await this.getInstallableRecommendations([...important, ...others], { ...options, source: 'recommendations-exe' }, token);
        return new PagedModel(installableRecommendations);
    }
    async getOtherRecommendationsModel(query, options, token) {
        const otherRecommendations = await this.getOtherRecommendations();
        const installableRecommendations = await this.getInstallableRecommendations(otherRecommendations, { ...options, source: 'recommendations-other', sortBy: undefined }, token);
        const result = coalesce(otherRecommendations.map(id => installableRecommendations.find(i => areSameExtensions(i.identifier, { id }))));
        return new PagedModel(result);
    }
    async getOtherRecommendations() {
        const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
            .map(e => e.identifier.id.toLowerCase());
        const workspaceRecommendations = (await this.getWorkspaceRecommendations())
            .map(extensionId => extensionId.toLowerCase());
        return distinct(flatten(await Promise.all([
            // Order is important
            this.extensionRecommendationsService.getImportantRecommendations(),
            this.extensionRecommendationsService.getFileBasedRecommendations(),
            this.extensionRecommendationsService.getOtherRecommendations()
        ])).filter(extensionId => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
    }
    // Get All types of recommendations, trimmed to show a max of 8 at any given time
    async getAllRecommendationsModel(options, token) {
        const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).map(e => e.identifier.id.toLowerCase());
        const allRecommendations = distinct(flatten(await Promise.all([
            // Order is important
            this.getWorkspaceRecommendations(),
            this.extensionRecommendationsService.getImportantRecommendations(),
            this.extensionRecommendationsService.getFileBasedRecommendations(),
            this.extensionRecommendationsService.getOtherRecommendations()
        ])).filter(extensionId => !local.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
        const installableRecommendations = await this.getInstallableRecommendations(allRecommendations, { ...options, source: 'recommendations-all', sortBy: undefined }, token);
        const result = coalesce(allRecommendations.map(id => installableRecommendations.find(i => areSameExtensions(i.identifier, { id }))));
        return new PagedModel(result.slice(0, 8));
    }
    async searchRecommendations(query, options, token) {
        const value = query.value.replace(/@recommended/g, '').trim().toLowerCase();
        const recommendations = distinct([...await this.getWorkspaceRecommendations(), ...await this.getOtherRecommendations()]);
        const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations', sortBy: undefined }, token))
            .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
        const result = coalesce(recommendations.map(id => installableRecommendations.find(i => areSameExtensions(i.identifier, { id }))));
        return new PagedModel(this.sortExtensions(result, options));
    }
    setModel(model, error) {
        if (this.list) {
            this.list.model = new DelayedPagedModel(model);
            this.list.scrollTop = 0;
            this.updateBody(error);
        }
    }
    updateBody(error) {
        const count = this.count();
        if (this.bodyTemplate && this.badge) {
            this.bodyTemplate.extensionsList.classList.toggle('hidden', count === 0);
            this.bodyTemplate.messageContainer.classList.toggle('hidden', count > 0);
            this.badge.setCount(count);
            if (count === 0 && this.isBodyVisible()) {
                if (error) {
                    if (isOfflineError(error)) {
                        this.bodyTemplate.messageSeverityIcon.className = SeverityIcon.className(Severity.Warning);
                        this.bodyTemplate.messageBox.textContent = localize('offline error', "Unable to search the Marketplace when offline, please check your network connection.");
                    }
                    else {
                        this.bodyTemplate.messageSeverityIcon.className = SeverityIcon.className(Severity.Error);
                        this.bodyTemplate.messageBox.textContent = localize('error', "Error while fetching extensions. {0}", getErrorMessage(error));
                    }
                }
                else {
                    this.bodyTemplate.messageSeverityIcon.className = '';
                    this.bodyTemplate.messageBox.textContent = localize('no extensions found', "No extensions found.");
                }
                alert(this.bodyTemplate.messageBox.textContent);
            }
        }
        this.updateSize();
    }
    updateSize() {
        if (this.options.flexibleHeight) {
            this.maximumBodySize = this.list?.model.length ? Number.POSITIVE_INFINITY : 0;
            this.storageService.store(`${this.id}.size`, this.list?.model.length || 0, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    updateModel(model) {
        if (this.list) {
            this.list.model = new DelayedPagedModel(model);
            this.updateBody();
        }
    }
    openExtension(extension, options) {
        extension = this.extensionsWorkbenchService.local.filter(e => areSameExtensions(e.identifier, extension.identifier))[0] || extension;
        this.extensionsWorkbenchService.open(extension, options).then(undefined, err => this.onError(err));
    }
    onError(err) {
        if (isCancellationError(err)) {
            return;
        }
        const message = err && err.message || '';
        if (/ECONNREFUSED/.test(message)) {
            const error = createErrorWithActions(localize('suggestProxyError', "Marketplace returned 'ECONNREFUSED'. Please check the 'http.proxy' setting."), [
                new Action('open user settings', localize('open user settings', "Open User Settings"), undefined, true, () => this.preferencesService.openUserSettings())
            ]);
            this.notificationService.error(error);
            return;
        }
        this.notificationService.error(err);
    }
    getPagedModel(arg) {
        if (Array.isArray(arg)) {
            return new PagedModel(arg);
        }
        const pager = {
            total: arg.total,
            pageSize: arg.pageSize,
            firstPage: arg.firstPage,
            getPage: (pageIndex, cancellationToken) => arg.getPage(pageIndex, cancellationToken)
        };
        return new PagedModel(pager);
    }
    dispose() {
        super.dispose();
        if (this.queryRequest) {
            this.queryRequest.request.cancel();
            this.queryRequest = null;
        }
        if (this.queryResult) {
            this.queryResult.disposables.dispose();
            this.queryResult = undefined;
        }
        this.list = null;
    }
    static isLocalExtensionsQuery(query, sortBy) {
        return this.isInstalledExtensionsQuery(query)
            || this.isOutdatedExtensionsQuery(query)
            || this.isEnabledExtensionsQuery(query)
            || this.isDisabledExtensionsQuery(query)
            || this.isBuiltInExtensionsQuery(query)
            || this.isSearchBuiltInExtensionsQuery(query)
            || this.isBuiltInGroupExtensionsQuery(query)
            || this.isSearchDeprecatedExtensionsQuery(query)
            || this.isSearchWorkspaceUnsupportedExtensionsQuery(query)
            || this.isSearchRecentlyUpdatedQuery(query)
            || this.isSearchExtensionUpdatesQuery(query)
            || this.isSortInstalledExtensionsQuery(query, sortBy);
    }
    static isSearchBuiltInExtensionsQuery(query) {
        return /@builtin\s.+/i.test(query);
    }
    static isBuiltInExtensionsQuery(query) {
        return /^\s*@builtin$/i.test(query.trim());
    }
    static isBuiltInGroupExtensionsQuery(query) {
        return /^\s*@builtin:.+$/i.test(query.trim());
    }
    static isSearchWorkspaceUnsupportedExtensionsQuery(query) {
        return /^\s*@workspaceUnsupported(:(untrusted|virtual)(Partial)?)?(\s|$)/i.test(query);
    }
    static isInstalledExtensionsQuery(query) {
        return /@installed/i.test(query);
    }
    static isOutdatedExtensionsQuery(query) {
        return /@outdated/i.test(query);
    }
    static isEnabledExtensionsQuery(query) {
        return /@enabled/i.test(query);
    }
    static isDisabledExtensionsQuery(query) {
        return /@disabled/i.test(query);
    }
    static isSearchDeprecatedExtensionsQuery(query) {
        return /@deprecated\s?.*/i.test(query);
    }
    static isRecommendedExtensionsQuery(query) {
        return /^@recommended$/i.test(query.trim());
    }
    static isSearchRecommendedExtensionsQuery(query) {
        return /@recommended\s.+/i.test(query);
    }
    static isWorkspaceRecommendedExtensionsQuery(query) {
        return /@recommended:workspace/i.test(query);
    }
    static isExeRecommendedExtensionsQuery(query) {
        return /@exe:.+/i.test(query);
    }
    static isKeymapsRecommendedExtensionsQuery(query) {
        return /@recommended:keymaps/i.test(query);
    }
    static isLanguageRecommendedExtensionsQuery(query) {
        return /@recommended:languages/i.test(query);
    }
    static isSortInstalledExtensionsQuery(query, sortBy) {
        return (sortBy !== undefined && sortBy !== '' && query === '') || (!sortBy && /^@sort:\S*$/i.test(query));
    }
    static isSearchPopularQuery(query) {
        return /@popular/i.test(query);
    }
    static isSearchRecentlyPublishedQuery(query) {
        return /@recentlyPublished/i.test(query);
    }
    static isSearchRecentlyUpdatedQuery(query) {
        return /@recentlyUpdated/i.test(query);
    }
    static isSearchExtensionUpdatesQuery(query) {
        return /@updates/i.test(query);
    }
    static isSortUpdateDateQuery(query) {
        return /@sort:updateDate/i.test(query);
    }
    focus() {
        super.focus();
        if (!this.list) {
            return;
        }
        if (!(this.list.getFocus().length || this.list.getSelection().length)) {
            this.list.focusNext();
        }
        this.list.domFocus();
    }
};
ExtensionsListView = __decorate([
    __param(2, INotificationService),
    __param(3, IKeybindingService),
    __param(4, IContextMenuService),
    __param(5, IInstantiationService),
    __param(6, IThemeService),
    __param(7, IExtensionService),
    __param(8, IExtensionsWorkbenchService),
    __param(9, IExtensionRecommendationsService),
    __param(10, ITelemetryService),
    __param(11, IConfigurationService),
    __param(12, IWorkspaceContextService),
    __param(13, IExperimentService),
    __param(14, IExtensionManagementServerService),
    __param(15, IExtensionManifestPropertiesService),
    __param(16, IWorkbenchExtensionManagementService),
    __param(17, IWorkspaceContextService),
    __param(18, IProductService),
    __param(19, IContextKeyService),
    __param(20, IViewDescriptorService),
    __param(21, IOpenerService),
    __param(22, IPreferencesService),
    __param(23, IStorageService),
    __param(24, IWorkspaceTrustManagementService),
    __param(25, IWorkbenchExtensionEnablementService),
    __param(26, IWorkbenchLayoutService),
    __param(27, ILogService)
], ExtensionsListView);
export { ExtensionsListView };
export class DefaultPopularExtensionsView extends ExtensionsListView {
    async show() {
        const query = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? '@web' : '';
        return super.show(query);
    }
}
export class ServerInstalledExtensionsView extends ExtensionsListView {
    async show(query) {
        query = query ? query : '@installed';
        if (!ExtensionsListView.isLocalExtensionsQuery(query) || ExtensionsListView.isSortInstalledExtensionsQuery(query)) {
            query = query += ' @installed';
        }
        return super.show(query.trim());
    }
}
export class EnabledExtensionsView extends ExtensionsListView {
    async show(query) {
        query = query || '@enabled';
        return ExtensionsListView.isEnabledExtensionsQuery(query) ? super.show(query) :
            ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show('@enabled ' + query) : this.showEmptyModel();
    }
}
export class DisabledExtensionsView extends ExtensionsListView {
    async show(query) {
        query = query || '@disabled';
        return ExtensionsListView.isDisabledExtensionsQuery(query) ? super.show(query) :
            ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show('@disabled ' + query) : this.showEmptyModel();
    }
}
export class OutdatedExtensionsView extends ExtensionsListView {
    async show(query) {
        query = query ? query : '@outdated';
        if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
            query = query.replace('@updates', '@outdated');
        }
        const model = await super.show(query.trim());
        this.setExpanded(model.length > 0);
        return model;
    }
}
export class RecentlyUpdatedExtensionsView extends ExtensionsListView {
    async show(query) {
        query = query ? query : '@recentlyUpdated';
        if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
            query = query.replace('@updates', '@recentlyUpdated');
        }
        return super.show(query.trim());
    }
}
export class BuiltInFeatureExtensionsView extends ExtensionsListView {
    async show(query) {
        return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:features');
    }
}
export class BuiltInThemesExtensionsView extends ExtensionsListView {
    async show(query) {
        return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:themes');
    }
}
export class BuiltInProgrammingLanguageExtensionsView extends ExtensionsListView {
    async show(query) {
        return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:basics');
    }
}
function toSpecificWorkspaceUnsupportedQuery(query, qualifier) {
    if (!query) {
        return '@workspaceUnsupported:' + qualifier;
    }
    const match = query.match(new RegExp(`@workspaceUnsupported(:${qualifier})?(\\s|$)`, 'i'));
    if (match) {
        if (!match[1]) {
            return query.replace(/@workspaceUnsupported/gi, '@workspaceUnsupported:' + qualifier);
        }
        return query;
    }
    return undefined;
}
export class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    async show(query) {
        const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrusted');
        return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
    }
}
export class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    async show(query) {
        const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrustedPartial');
        return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
    }
}
export class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
    async show(query) {
        const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtual');
        return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
    }
}
export class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
    async show(query) {
        const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtualPartial');
        return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
    }
}
export class DeprecatedExtensionsView extends ExtensionsListView {
    async show(query) {
        return ExtensionsListView.isSearchDeprecatedExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
    }
}
export class SearchMarketplaceExtensionsView extends ExtensionsListView {
    reportSearchFinishedDelayer = this._register(new ThrottledDelayer(2000));
    searchWaitPromise = Promise.resolve();
    async show(query) {
        const queryPromise = super.show(query);
        this.reportSearchFinishedDelayer.trigger(() => this.reportSearchFinished());
        this.searchWaitPromise = queryPromise.then(null, null);
        return queryPromise;
    }
    async reportSearchFinished() {
        await this.searchWaitPromise;
        this.telemetryService.publicLog2('extensionsView:MarketplaceSearchFinished');
    }
}
export class DefaultRecommendedExtensionsView extends ExtensionsListView {
    recommendedExtensionsQuery = '@recommended:all';
    renderBody(container) {
        super.renderBody(container);
        this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
            this.show('');
        }));
    }
    async show(query) {
        if (query && query.trim() !== this.recommendedExtensionsQuery) {
            return this.showEmptyModel();
        }
        const model = await super.show(this.recommendedExtensionsQuery);
        if (!this.extensionsWorkbenchService.local.some(e => !e.isBuiltin)) {
            // This is part of popular extensions view. Collapse if no installed extensions.
            this.setExpanded(model.length > 0);
        }
        return model;
    }
}
export class RecommendedExtensionsView extends ExtensionsListView {
    recommendedExtensionsQuery = '@recommended';
    renderBody(container) {
        super.renderBody(container);
        this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
            this.show('');
        }));
    }
    async show(query) {
        return (query && query.trim() !== this.recommendedExtensionsQuery) ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery);
    }
}
export class WorkspaceRecommendedExtensionsView extends ExtensionsListView {
    recommendedExtensionsQuery = '@recommended:workspace';
    renderBody(container) {
        super.renderBody(container);
        this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.show(this.recommendedExtensionsQuery)));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.show(this.recommendedExtensionsQuery)));
    }
    async show(query) {
        const shouldShowEmptyView = query && query.trim() !== '@recommended' && query.trim() !== '@recommended:workspace';
        const model = await (shouldShowEmptyView ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery));
        this.setExpanded(model.length > 0);
        return model;
    }
    async getInstallableWorkspaceRecommendations() {
        const installed = (await this.extensionsWorkbenchService.queryLocal())
            .filter(l => l.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
        const recommendations = (await this.getWorkspaceRecommendations())
            .filter(extensionId => installed.every(local => !areSameExtensions({ id: extensionId }, local.identifier)));
        return this.getInstallableRecommendations(recommendations, { source: 'install-all-workspace-recommendations' }, CancellationToken.None);
    }
    async installWorkspaceRecommendations() {
        const installableRecommendations = await this.getInstallableWorkspaceRecommendations();
        if (installableRecommendations.length) {
            await this.extensionManagementService.installExtensions(installableRecommendations.map(i => i.gallery));
        }
        else {
            this.notificationService.notify({
                severity: Severity.Info,
                message: localize('no local extensions', "There are no extensions to install.")
            });
        }
    }
}
