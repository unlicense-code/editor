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
import 'vs/css!./media/titlecontrol';
import { localize } from 'vs/nls';
import { applyDragImage, DataTransfers } from 'vs/base/browser/dnd';
import { addDisposableListener, EventType } from 'vs/base/browser/dom';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { prepareActions } from 'vs/base/browser/ui/actionbar/actionbar';
import { ActionRunner } from 'vs/base/common/actions';
import { dispose, DisposableStore } from 'vs/base/common/lifecycle';
import { createActionViewItem, createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IMenuService, MenuId } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { listActiveSelectionBackground, listActiveSelectionForeground } from 'vs/platform/theme/common/colorRegistry';
import { IThemeService, registerThemingParticipant, Themable } from 'vs/platform/theme/common/themeService';
import { DraggedEditorGroupIdentifier, fillEditorsDragData, LocalSelectionTransfer } from 'vs/workbench/browser/dnd';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { BreadcrumbsConfig } from 'vs/workbench/browser/parts/editor/breadcrumbs';
import { BreadcrumbsControl } from 'vs/workbench/browser/parts/editor/breadcrumbsControl';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { ResourceContextKey, ActiveEditorPinnedContext, ActiveEditorStickyContext, ActiveEditorGroupLockedContext, ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext, ActiveEditorLastInGroupContext, ActiveEditorFirstInGroupContext } from 'vs/workbench/common/contextkeys';
import { IFileService } from 'vs/platform/files/common/files';
import { withNullAsUndefined, withUndefinedAsNull, assertIsDefined } from 'vs/base/common/types';
import { isFirefox } from 'vs/base/browser/browser';
import { isCancellationError } from 'vs/base/common/errors';
import { SideBySideEditorInput } from 'vs/workbench/common/editor/sideBySideEditorInput';
import { WorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
export class EditorCommandsContextActionRunner extends ActionRunner {
    context;
    constructor(context) {
        super();
        this.context = context;
    }
    run(action, context) {
        // Even though we have a fixed context for editor commands,
        // allow to preserve the context that is given to us in case
        // it applies.
        let mergedContext = this.context;
        if (context?.preserveFocus) {
            mergedContext = {
                ...this.context,
                preserveFocus: true
            };
        }
        return super.run(action, mergedContext);
    }
}
let TitleControl = class TitleControl extends Themable {
    accessor;
    group;
    contextMenuService;
    instantiationService;
    contextKeyService;
    keybindingService;
    notificationService;
    menuService;
    quickInputService;
    configurationService;
    fileService;
    editorTransfer = LocalSelectionTransfer.getInstance();
    groupTransfer = LocalSelectionTransfer.getInstance();
    treeItemsTransfer = LocalSelectionTransfer.getInstance();
    breadcrumbsControl = undefined;
    editorActionsToolbar;
    resourceContext;
    editorPinnedContext;
    editorIsFirstContext;
    editorIsLastContext;
    editorStickyContext;
    editorCanSplitInGroupContext;
    sideBySideEditorContext;
    groupLockedContext;
    editorToolBarMenuDisposables = this._register(new DisposableStore());
    renderDropdownAsChildElement;
    constructor(parent, accessor, group, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, menuService, quickInputService, themeService, configurationService, fileService) {
        super(themeService);
        this.accessor = accessor;
        this.group = group;
        this.contextMenuService = contextMenuService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.keybindingService = keybindingService;
        this.notificationService = notificationService;
        this.menuService = menuService;
        this.quickInputService = quickInputService;
        this.configurationService = configurationService;
        this.fileService = fileService;
        this.resourceContext = this._register(instantiationService.createInstance(ResourceContextKey));
        this.editorPinnedContext = ActiveEditorPinnedContext.bindTo(contextKeyService);
        this.editorIsFirstContext = ActiveEditorFirstInGroupContext.bindTo(contextKeyService);
        this.editorIsLastContext = ActiveEditorLastInGroupContext.bindTo(contextKeyService);
        this.editorStickyContext = ActiveEditorStickyContext.bindTo(contextKeyService);
        this.editorCanSplitInGroupContext = ActiveEditorCanSplitInGroupContext.bindTo(contextKeyService);
        this.sideBySideEditorContext = SideBySideEditorActiveContext.bindTo(contextKeyService);
        this.groupLockedContext = ActiveEditorGroupLockedContext.bindTo(contextKeyService);
        this.renderDropdownAsChildElement = false;
        this.create(parent);
    }
    createBreadcrumbsControl(container, options) {
        const config = this._register(BreadcrumbsConfig.IsEnabled.bindTo(this.configurationService));
        this._register(config.onDidChange(() => {
            const value = config.getValue();
            if (!value && this.breadcrumbsControl) {
                this.breadcrumbsControl.dispose();
                this.breadcrumbsControl = undefined;
                this.handleBreadcrumbsEnablementChange();
            }
            else if (value && !this.breadcrumbsControl) {
                this.breadcrumbsControl = this.instantiationService.createInstance(BreadcrumbsControl, container, options, this.group);
                this.breadcrumbsControl.update();
                this.handleBreadcrumbsEnablementChange();
            }
        }));
        if (config.getValue()) {
            this.breadcrumbsControl = this.instantiationService.createInstance(BreadcrumbsControl, container, options, this.group);
        }
        this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(() => {
            if (this.breadcrumbsControl?.update()) {
                this.handleBreadcrumbsEnablementChange();
            }
        }));
    }
    createEditorActionsToolBar(container) {
        const context = { groupId: this.group.id };
        // Toolbar Widget
        this.editorActionsToolbar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, container, {
            actionViewItemProvider: action => this.actionViewItemProvider(action),
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            ariaLabel: localize('ariaLabelEditorActions', "Editor actions"),
            getKeyBinding: action => this.getKeybinding(action),
            actionRunner: this._register(new EditorCommandsContextActionRunner(context)),
            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
            renderDropdownAsChildElement: this.renderDropdownAsChildElement,
            telemetrySource: 'editorPart',
            resetMenu: MenuId.EditorTitle
        }));
        // Context
        this.editorActionsToolbar.context = context;
        // Action Run Handling
        this._register(this.editorActionsToolbar.actionRunner.onDidRun(e => {
            // Notify for Error
            if (e.error && !isCancellationError(e.error)) {
                this.notificationService.error(e.error);
            }
        }));
    }
    actionViewItemProvider(action) {
        const activeEditorPane = this.group.activeEditorPane;
        // Check Active Editor
        if (activeEditorPane instanceof EditorPane) {
            const result = activeEditorPane.getActionViewItem(action);
            if (result) {
                return result;
            }
        }
        // Check extensions
        return createActionViewItem(this.instantiationService, action, { menuAsChild: this.renderDropdownAsChildElement });
    }
    updateEditorActionsToolbar() {
        const { primary, secondary } = this.prepareEditorActions(this.getEditorActions());
        const editorActionsToolbar = assertIsDefined(this.editorActionsToolbar);
        editorActionsToolbar.setActions(prepareActions(primary), prepareActions(secondary));
    }
    getEditorActions() {
        const primary = [];
        const secondary = [];
        // Dispose previous listeners
        this.editorToolBarMenuDisposables.clear();
        // Update contexts
        this.contextKeyService.bufferChangeEvents(() => {
            const activeEditor = this.group.activeEditor;
            this.resourceContext.set(withUndefinedAsNull(EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY })));
            this.editorPinnedContext.set(activeEditor ? this.group.isPinned(activeEditor) : false);
            this.editorIsFirstContext.set(activeEditor ? this.group.isFirst(activeEditor) : false);
            this.editorIsLastContext.set(activeEditor ? this.group.isLast(activeEditor) : false);
            this.editorStickyContext.set(activeEditor ? this.group.isSticky(activeEditor) : false);
            this.editorCanSplitInGroupContext.set(activeEditor ? activeEditor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */) : false);
            this.sideBySideEditorContext.set(activeEditor?.typeId === SideBySideEditorInput.ID);
            this.groupLockedContext.set(this.group.isLocked);
        });
        // Editor actions require the editor control to be there, so we retrieve it via service
        const activeEditorPane = this.group.activeEditorPane;
        if (activeEditorPane instanceof EditorPane) {
            const scopedContextKeyService = this.getEditorPaneAwareContextKeyService();
            const titleBarMenu = this.menuService.createMenu(MenuId.EditorTitle, scopedContextKeyService, { emitEventsForSubmenuChanges: true, eventDebounceDelay: 0 });
            this.editorToolBarMenuDisposables.add(titleBarMenu);
            this.editorToolBarMenuDisposables.add(titleBarMenu.onDidChange(() => {
                this.updateEditorActionsToolbar(); // Update editor toolbar whenever contributed actions change
            }));
            const shouldInlineGroup = (action, group) => group === 'navigation' && action.actions.length <= 1;
            createAndFillInActionBarActions(titleBarMenu, { arg: this.resourceContext.get(), shouldForwardArgs: true }, { primary, secondary }, 'navigation', 9, shouldInlineGroup);
        }
        return { primary, secondary };
    }
    getEditorPaneAwareContextKeyService() {
        return this.group.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
    }
    clearEditorActionsToolbar() {
        this.editorActionsToolbar?.setActions([], []);
    }
    enableGroupDragging(element) {
        // Drag start
        this._register(addDisposableListener(element, EventType.DRAG_START, e => {
            if (e.target !== element) {
                return; // only if originating from tabs container
            }
            // Set editor group as transfer
            this.groupTransfer.setData([new DraggedEditorGroupIdentifier(this.group.id)], DraggedEditorGroupIdentifier.prototype);
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'copyMove';
            }
            // Drag all tabs of the group if tabs are enabled
            let hasDataTransfer = false;
            if (this.accessor.partOptions.showTabs) {
                hasDataTransfer = this.doFillResourceDataTransfers(this.group.getEditors(1 /* EditorsOrder.SEQUENTIAL */), e);
            }
            // Otherwise only drag the active editor
            else {
                if (this.group.activeEditor) {
                    hasDataTransfer = this.doFillResourceDataTransfers([this.group.activeEditor], e);
                }
            }
            // Firefox: requires to set a text data transfer to get going
            if (!hasDataTransfer && isFirefox) {
                e.dataTransfer?.setData(DataTransfers.TEXT, String(this.group.label));
            }
            // Drag Image
            if (this.group.activeEditor) {
                let label = this.group.activeEditor.getName();
                if (this.accessor.partOptions.showTabs && this.group.count > 1) {
                    label = localize('draggedEditorGroup', "{0} (+{1})", label, this.group.count - 1);
                }
                applyDragImage(e, label, 'monaco-editor-group-drag-image');
            }
        }));
        // Drag end
        this._register(addDisposableListener(element, EventType.DRAG_END, () => {
            this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
        }));
    }
    doFillResourceDataTransfers(editors, e) {
        if (editors.length) {
            this.instantiationService.invokeFunction(fillEditorsDragData, editors.map(editor => ({ editor, groupId: this.group.id })), e);
            return true;
        }
        return false;
    }
    onContextMenu(editor, e, node) {
        // Update contexts based on editor picked and remember previous to restore
        const currentResourceContext = this.resourceContext.get();
        this.resourceContext.set(withUndefinedAsNull(EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY })));
        const currentPinnedContext = !!this.editorPinnedContext.get();
        this.editorPinnedContext.set(this.group.isPinned(editor));
        const currentEditorIsFirstContext = !!this.editorIsFirstContext.get();
        this.editorIsFirstContext.set(this.group.isFirst(editor));
        const currentEditorIsLastContext = !!this.editorIsLastContext.get();
        this.editorIsLastContext.set(this.group.isLast(editor));
        const currentStickyContext = !!this.editorStickyContext.get();
        this.editorStickyContext.set(this.group.isSticky(editor));
        const currentGroupLockedContext = !!this.groupLockedContext.get();
        this.groupLockedContext.set(this.group.isLocked);
        const currentEditorCanSplitContext = !!this.editorCanSplitInGroupContext.get();
        this.editorCanSplitInGroupContext.set(editor.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
        const currentSideBySideEditorContext = !!this.sideBySideEditorContext.get();
        this.sideBySideEditorContext.set(editor.typeId === SideBySideEditorInput.ID);
        // Find target anchor
        let anchor = node;
        if (e instanceof MouseEvent) {
            const event = new StandardMouseEvent(e);
            anchor = { x: event.posx, y: event.posy };
        }
        // Show it
        this.contextMenuService.showContextMenu({
            getAnchor: () => anchor,
            menuId: MenuId.EditorTitleContext,
            menuActionOptions: { shouldForwardArgs: true, arg: this.resourceContext.get() },
            contextKeyService: this.contextKeyService,
            getActionsContext: () => ({ groupId: this.group.id, editorIndex: this.group.getIndexOfEditor(editor) }),
            getKeyBinding: action => this.getKeybinding(action),
            onHide: () => {
                // restore previous contexts
                this.resourceContext.set(currentResourceContext || null);
                this.editorPinnedContext.set(currentPinnedContext);
                this.editorIsFirstContext.set(currentEditorIsFirstContext);
                this.editorIsLastContext.set(currentEditorIsLastContext);
                this.editorStickyContext.set(currentStickyContext);
                this.groupLockedContext.set(currentGroupLockedContext);
                this.editorCanSplitInGroupContext.set(currentEditorCanSplitContext);
                this.sideBySideEditorContext.set(currentSideBySideEditorContext);
                // restore focus to active group
                this.accessor.activeGroup.focus();
            }
        });
    }
    getKeybinding(action) {
        return this.keybindingService.lookupKeybinding(action.id, this.getEditorPaneAwareContextKeyService());
    }
    getKeybindingLabel(action) {
        const keybinding = this.getKeybinding(action);
        return keybinding ? withNullAsUndefined(keybinding.getLabel()) : undefined;
    }
    dispose() {
        dispose(this.breadcrumbsControl);
        this.breadcrumbsControl = undefined;
        super.dispose();
    }
};
TitleControl = __decorate([
    __param(3, IContextMenuService),
    __param(4, IInstantiationService),
    __param(5, IContextKeyService),
    __param(6, IKeybindingService),
    __param(7, INotificationService),
    __param(8, IMenuService),
    __param(9, IQuickInputService),
    __param(10, IThemeService),
    __param(11, IConfigurationService),
    __param(12, IFileService)
], TitleControl);
export { TitleControl };
registerThemingParticipant((theme, collector) => {
    // Drag Feedback
    const dragImageBackground = theme.getColor(listActiveSelectionBackground);
    const dragImageForeground = theme.getColor(listActiveSelectionForeground);
    collector.addRule(`
		.monaco-editor-group-drag-image {
			background: ${dragImageBackground};
			color: ${dragImageForeground};
		}
	`);
});
