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
import 'vs/workbench/contrib/markers/browser/markersFileDecorations';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { localize } from 'vs/nls';
import { Marker, RelatedInformation, ResourceMarkers } from 'vs/workbench/contrib/markers/browser/markersModel';
import { MarkersView } from 'vs/workbench/contrib/markers/browser/markersView';
import { MenuId, registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Markers, MarkersContextKeys } from 'vs/workbench/contrib/markers/common/markers';
import Messages from 'vs/workbench/contrib/markers/browser/messages';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { Extensions as ViewContainerExtensions, IViewsService } from 'vs/workbench/common/views';
import { getVisbileViewContextKey, FocusedViewContext } from 'vs/workbench/common/contextkeys';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Codicon } from 'vs/base/common/codicons';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { ViewAction } from 'vs/workbench/browser/parts/views/viewPane';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { viewFilterSubmenu } from 'vs/workbench/browser/parts/views/viewFilter';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: Markers.MARKER_OPEN_ACTION_ID,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: ContextKeyExpr.and(MarkersContextKeys.MarkerFocusContextKey),
    primary: 3 /* KeyCode.Enter */,
    mac: {
        primary: 3 /* KeyCode.Enter */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */]
    },
    handler: (accessor, args) => {
        const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
        markersView.openFileAtElement(markersView.getFocusElement(), false, false, true);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: Markers.MARKER_OPEN_SIDE_ACTION_ID,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: ContextKeyExpr.and(MarkersContextKeys.MarkerFocusContextKey),
    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
    mac: {
        primary: 256 /* KeyMod.WinCtrl */ | 3 /* KeyCode.Enter */
    },
    handler: (accessor, args) => {
        const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
        markersView.openFileAtElement(markersView.getFocusElement(), false, true, true);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: Markers.MARKER_SHOW_PANEL_ID,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: undefined,
    primary: undefined,
    handler: async (accessor, args) => {
        await accessor.get(IViewsService).openView(Markers.MARKERS_VIEW_ID);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: Markers.MARKER_SHOW_QUICK_FIX,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: MarkersContextKeys.MarkerFocusContextKey,
    primary: 2048 /* KeyMod.CtrlCmd */ | 84 /* KeyCode.Period */,
    handler: (accessor, args) => {
        const markersView = accessor.get(IViewsService).getActiveViewWithId(Markers.MARKERS_VIEW_ID);
        const focusedElement = markersView.getFocusElement();
        if (focusedElement instanceof Marker) {
            markersView.showQuickFixes(focusedElement);
        }
    }
});
// configuration
Registry.as(Extensions.Configuration).registerConfiguration({
    'id': 'problems',
    'order': 101,
    'title': Messages.PROBLEMS_PANEL_CONFIGURATION_TITLE,
    'type': 'object',
    'properties': {
        'problems.autoReveal': {
            'description': Messages.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL,
            'type': 'boolean',
            'default': true
        },
        'problems.defaultViewMode': {
            'description': Messages.PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE,
            'type': 'string',
            'default': 'tree',
            'enum': ['table', 'tree'],
        },
        'problems.showCurrentInStatus': {
            'description': Messages.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS,
            'type': 'boolean',
            'default': false
        },
        'problems.sortOrder': {
            'description': Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER,
            'type': 'string',
            'default': 'severity',
            'enum': ['severity', 'position'],
            'enumDescriptions': [
                Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY,
                Messages.PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION,
            ],
        },
    }
});
const markersViewIcon = registerIcon('markers-view-icon', Codicon.warning, localize('markersViewIcon', 'View icon of the markers view.'));
// markers view container
const VIEW_CONTAINER = Registry.as(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
    id: Markers.MARKERS_CONTAINER_ID,
    title: Messages.MARKERS_PANEL_TITLE_PROBLEMS,
    icon: markersViewIcon,
    hideIfEmpty: true,
    order: 0,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [Markers.MARKERS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
    storageId: Markers.MARKERS_VIEW_STORAGE_ID,
}, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true });
Registry.as(ViewContainerExtensions.ViewsRegistry).registerViews([{
        id: Markers.MARKERS_VIEW_ID,
        containerIcon: markersViewIcon,
        name: Messages.MARKERS_PANEL_TITLE_PROBLEMS,
        canToggleVisibility: false,
        canMoveView: true,
        ctorDescriptor: new SyncDescriptor(MarkersView),
        openCommandActionDescriptor: {
            id: 'workbench.actions.view.problems',
            mnemonicTitle: localize({ key: 'miMarker', comment: ['&& denotes a mnemonic'] }, "&&Problems"),
            keybindings: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 43 /* KeyCode.KeyM */ },
            order: 0,
        }
    }], VIEW_CONTAINER);
// workbench
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
// actions
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.table.${Markers.MARKERS_VIEW_ID}.viewAsTree`,
            title: localize('viewAsTree', "View as Tree"),
            menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("table" /* MarkersViewMode.Table */)),
                group: 'navigation',
                order: 3
            },
            icon: Codicon.listTree,
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.setViewMode("tree" /* MarkersViewMode.Tree */);
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.table.${Markers.MARKERS_VIEW_ID}.viewAsTable`,
            title: localize('viewAsTable', "View as Table"),
            menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* MarkersViewMode.Tree */)),
                group: 'navigation',
                order: 3
            },
            icon: Codicon.listFlat,
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.setViewMode("table" /* MarkersViewMode.Table */);
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleErrors`,
            title: localize('toggle errors', "Toggle Errors"),
            category: localize('problems', "Problems"),
            toggled: {
                condition: MarkersContextKeys.ShowErrorsFilterContextKey,
                title: localize('errors', "Show Errors")
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID),
                order: 1
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showErrors = !view.filters.showErrors;
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleWarnings`,
            title: localize('toggle warnings', "Toggle Warnings"),
            category: localize('problems', "Problems"),
            toggled: {
                condition: MarkersContextKeys.ShowWarningsFilterContextKey,
                title: localize('warnings', "Show Warnings")
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID),
                order: 2
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showWarnings = !view.filters.showWarnings;
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleInfos`,
            title: localize('toggle infos', "Toggle Infos"),
            category: localize('problems', "Problems"),
            toggled: {
                condition: MarkersContextKeys.ShowInfoFilterContextKey,
                title: localize('Infos', "Show Infos")
            },
            menu: {
                id: viewFilterSubmenu,
                group: '1_filter',
                when: ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID),
                order: 3
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.showInfos = !view.filters.showInfos;
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleActiveFile`,
            title: localize('toggle active file', "Toggle Active File"),
            category: localize('problems', "Problems"),
            toggled: {
                condition: MarkersContextKeys.ShowActiveFileFilterContextKey,
                title: localize('Active File', "Show Active File Only")
            },
            menu: {
                id: viewFilterSubmenu,
                group: '2_filter',
                when: ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID),
                order: 1
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.activeFile = !view.filters.activeFile;
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.${Markers.MARKERS_VIEW_ID}.toggleExcludedFiles`,
            title: localize('toggle Excluded Files', "Toggle Excluded Files"),
            category: localize('problems', "Problems"),
            toggled: {
                condition: MarkersContextKeys.ShowExcludedFilesFilterContextKey,
                title: localize('Excluded Files', "Hide Excluded Files")
            },
            menu: {
                id: viewFilterSubmenu,
                group: '2_filter',
                when: ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID),
                order: 2
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        view.filters.excludedFiles = !view.filters.excludedFiles;
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.problems.focus',
            title: { value: Messages.MARKERS_PANEL_SHOW_LABEL, original: 'Focus Problems (Errors, Warnings, Infos)' },
            category: Categories.View,
            f1: true,
        });
    }
    async run(accessor) {
        accessor.get(IViewsService).openView(Markers.MARKERS_VIEW_ID, true);
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        const when = ContextKeyExpr.and(FocusedViewContext.isEqualTo(Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersTreeVisibilityContextKey, MarkersContextKeys.RelatedInformationFocusContextKey.toNegated());
        super({
            id: Markers.MARKER_COPY_ACTION_ID,
            title: { value: localize('copyMarker', "Copy"), original: 'Copy' },
            menu: {
                id: MenuId.ProblemsPanelContext,
                when,
                group: 'navigation'
            },
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                when
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        const clipboardService = serviceAccessor.get(IClipboardService);
        const selection = markersView.getFocusedSelectedElements() || markersView.getAllResourceMarkers();
        const markers = [];
        const addMarker = (marker) => {
            if (!markers.includes(marker)) {
                markers.push(marker);
            }
        };
        for (const selected of selection) {
            if (selected instanceof ResourceMarkers) {
                selected.markers.forEach(addMarker);
            }
            else if (selected instanceof Marker) {
                addMarker(selected);
            }
        }
        if (markers.length) {
            await clipboardService.writeText(`[${markers}]`);
        }
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.MARKER_COPY_MESSAGE_ACTION_ID,
            title: { value: localize('copyMessage', "Copy Message"), original: 'Copy Message' },
            menu: {
                id: MenuId.ProblemsPanelContext,
                when: MarkersContextKeys.MarkerFocusContextKey,
                group: 'navigation'
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        const clipboardService = serviceAccessor.get(IClipboardService);
        const element = markersView.getFocusElement();
        if (element instanceof Marker) {
            await clipboardService.writeText(element.marker.message);
        }
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.RELATED_INFORMATION_COPY_MESSAGE_ACTION_ID,
            title: { value: localize('copyMessage', "Copy Message"), original: 'Copy Message' },
            menu: {
                id: MenuId.ProblemsPanelContext,
                when: MarkersContextKeys.RelatedInformationFocusContextKey,
                group: 'navigation'
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        const clipboardService = serviceAccessor.get(IClipboardService);
        const element = markersView.getFocusElement();
        if (element instanceof RelatedInformation) {
            await clipboardService.writeText(element.raw.message);
        }
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.FOCUS_PROBLEMS_FROM_FILTER,
            title: localize('focusProblemsList', "Focus problems view"),
            keybinding: {
                when: MarkersContextKeys.MarkerViewFilterFocusContextKey,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        markersView.focus();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.MARKERS_VIEW_FOCUS_FILTER,
            title: localize('focusProblemsFilter', "Focus problems filter"),
            keybinding: {
                when: FocusedViewContext.isEqualTo(Markers.MARKERS_VIEW_ID),
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        markersView.focusFilter();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.MARKERS_VIEW_SHOW_MULTILINE_MESSAGE,
            title: { value: localize('show multiline', "Show message in multiple lines"), original: 'Problems: Show message in multiple lines' },
            category: localize('problems', "Problems"),
            menu: {
                id: MenuId.CommandPalette,
                when: ContextKeyExpr.has(getVisbileViewContextKey(Markers.MARKERS_VIEW_ID))
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        markersView.setMultiline(true);
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.MARKERS_VIEW_SHOW_SINGLELINE_MESSAGE,
            title: { value: localize('show singleline', "Show message in single line"), original: 'Problems: Show message in single line' },
            category: localize('problems', "Problems"),
            menu: {
                id: MenuId.CommandPalette,
                when: ContextKeyExpr.has(getVisbileViewContextKey(Markers.MARKERS_VIEW_ID))
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        markersView.setMultiline(false);
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: Markers.MARKERS_VIEW_CLEAR_FILTER_TEXT,
            title: localize('clearFiltersText', "Clear filters text"),
            category: localize('problems', "Problems"),
            keybinding: {
                when: MarkersContextKeys.MarkerViewFilterFocusContextKey,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 9 /* KeyCode.Escape */
            },
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, markersView) {
        markersView.clearFilterText();
    }
});
registerAction2(class extends ViewAction {
    constructor() {
        super({
            id: `workbench.actions.treeView.${Markers.MARKERS_VIEW_ID}.collapseAll`,
            title: localize('collapseAll', "Collapse All"),
            menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', Markers.MARKERS_VIEW_ID), MarkersContextKeys.MarkersViewModeContextKey.isEqualTo("tree" /* MarkersViewMode.Tree */)),
                group: 'navigation',
                order: 2,
            },
            icon: Codicon.collapseAll,
            viewId: Markers.MARKERS_VIEW_ID
        });
    }
    async runInView(serviceAccessor, view) {
        return view.collapseAll();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: Markers.TOGGLE_MARKERS_VIEW_ACTION_ID,
            title: Messages.MARKERS_PANEL_TOGGLE_LABEL,
        });
    }
    async run(accessor) {
        const viewsService = accessor.get(IViewsService);
        if (viewsService.isViewVisible(Markers.MARKERS_VIEW_ID)) {
            viewsService.closeView(Markers.MARKERS_VIEW_ID);
        }
        else {
            viewsService.openView(Markers.MARKERS_VIEW_ID, true);
        }
    }
});
let MarkersStatusBarContributions = class MarkersStatusBarContributions extends Disposable {
    markerService;
    statusbarService;
    markersStatusItem;
    constructor(markerService, statusbarService) {
        super();
        this.markerService = markerService;
        this.statusbarService = statusbarService;
        this.markersStatusItem = this._register(this.statusbarService.addEntry(this.getMarkersItem(), 'status.problems', 0 /* StatusbarAlignment.LEFT */, 50 /* Medium Priority */));
        this.markerService.onMarkerChanged(() => this.markersStatusItem.update(this.getMarkersItem()));
    }
    getMarkersItem() {
        const markersStatistics = this.markerService.getStatistics();
        const tooltip = this.getMarkersTooltip(markersStatistics);
        return {
            name: localize('status.problems', "Problems"),
            text: this.getMarkersText(markersStatistics),
            ariaLabel: tooltip,
            tooltip,
            command: 'workbench.actions.view.toggleProblems'
        };
    }
    getMarkersTooltip(stats) {
        const errorTitle = (n) => localize('totalErrors', "Errors: {0}", n);
        const warningTitle = (n) => localize('totalWarnings', "Warnings: {0}", n);
        const infoTitle = (n) => localize('totalInfos', "Infos: {0}", n);
        const titles = [];
        if (stats.errors > 0) {
            titles.push(errorTitle(stats.errors));
        }
        if (stats.warnings > 0) {
            titles.push(warningTitle(stats.warnings));
        }
        if (stats.infos > 0) {
            titles.push(infoTitle(stats.infos));
        }
        if (titles.length === 0) {
            return localize('noProblems', "No Problems");
        }
        return titles.join(', ');
    }
    getMarkersText(stats) {
        const problemsText = [];
        // Errors
        problemsText.push('$(error) ' + this.packNumber(stats.errors));
        // Warnings
        problemsText.push('$(warning) ' + this.packNumber(stats.warnings));
        // Info (only if any)
        if (stats.infos > 0) {
            problemsText.push('$(info) ' + this.packNumber(stats.infos));
        }
        return problemsText.join(' ');
    }
    packNumber(n) {
        const manyProblems = localize('manyProblems', "10K+");
        return n > 9999 ? manyProblems : n > 999 ? n.toString().charAt(0) + 'K' : n.toString();
    }
};
MarkersStatusBarContributions = __decorate([
    __param(0, IMarkerService),
    __param(1, IStatusbarService)
], MarkersStatusBarContributions);
workbenchRegistry.registerWorkbenchContribution(MarkersStatusBarContributions, 3 /* LifecyclePhase.Restored */);
let ActivityUpdater = class ActivityUpdater extends Disposable {
    activityService;
    markerService;
    activity = this._register(new MutableDisposable());
    constructor(activityService, markerService) {
        super();
        this.activityService = activityService;
        this.markerService = markerService;
        this._register(this.markerService.onMarkerChanged(() => this.updateBadge()));
        this.updateBadge();
    }
    updateBadge() {
        const { errors, warnings, infos } = this.markerService.getStatistics();
        const total = errors + warnings + infos;
        const message = localize('totalProblems', 'Total {0} Problems', total);
        this.activity.value = this.activityService.showViewActivity(Markers.MARKERS_VIEW_ID, { badge: new NumberBadge(total, () => message) });
    }
};
ActivityUpdater = __decorate([
    __param(0, IActivityService),
    __param(1, IMarkerService)
], ActivityUpdater);
workbenchRegistry.registerWorkbenchContribution(ActivityUpdater, 3 /* LifecyclePhase.Restored */);
