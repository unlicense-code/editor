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
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { InputFocusedContext, IsMacContext, IsLinuxContext, IsWindowsContext, IsWebContext, IsMacNativeContext, IsDevelopmentContext, IsIOSContext, ProductQualityContext, IsMobileContext } from 'vs/platform/contextkey/common/contextkeys';
import { SplitEditorsVertically, InEditorZenModeContext, ActiveEditorCanRevertContext, ActiveEditorGroupLockedContext, ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext, AuxiliaryBarVisibleContext, SideBarVisibleContext, PanelAlignmentContext, PanelMaximizedContext, PanelVisibleContext, ActiveEditorContext, EditorsVisibleContext, TextCompareEditorVisibleContext, TextCompareEditorActiveContext, ActiveEditorGroupEmptyContext, MultipleEditorGroupsContext, EditorTabsVisibleContext, IsCenteredLayoutContext, ActiveEditorGroupIndexContext, ActiveEditorGroupLastContext, ActiveEditorReadonlyContext, EditorAreaVisibleContext, ActiveEditorAvailableEditorIdsContext, DirtyWorkingCopiesContext, EmptyWorkspaceSupportContext, EnterMultiRootWorkspaceSupportContext, HasWebFileSystemAccess, IsFullscreenContext, OpenFolderWorkspaceSupportContext, RemoteNameContext, VirtualWorkspaceContext, WorkbenchStateContext, WorkspaceFolderCountContext, PanelPositionContext, TemporaryWorkspaceContext } from 'vs/workbench/common/contextkeys';
import { TEXT_DIFF_EDITOR_ID, SIDE_BY_SIDE_EDITOR_ID, DEFAULT_EDITOR_ASSOCIATION } from 'vs/workbench/common/editor';
import { trackFocus, addDisposableListener, EventType } from 'vs/base/browser/dom';
import { preferredSideBySideGroupDirection, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkspaceContextService, isTemporaryWorkspace } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchLayoutService, positionToString } from 'vs/workbench/services/layout/browser/layoutService';
import { getRemoteName } from 'vs/platform/remote/common/remoteHosts';
import { getVirtualWorkspaceScheme } from 'vs/platform/workspace/common/virtualWorkspace';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { isNative } from 'vs/base/common/platform';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { Schemas } from 'vs/base/common/network';
import { WebFileSystemAccess } from 'vs/platform/files/browser/webFileSystemAccess';
import { IProductService } from 'vs/platform/product/common/productService';
let WorkbenchContextKeysHandler = class WorkbenchContextKeysHandler extends Disposable {
    contextKeyService;
    contextService;
    configurationService;
    environmentService;
    productService;
    editorService;
    editorResolverService;
    editorGroupService;
    layoutService;
    paneCompositeService;
    workingCopyService;
    inputFocusedContext;
    dirtyWorkingCopiesContext;
    activeEditorContext;
    activeEditorIsReadonly;
    activeEditorCanRevert;
    activeEditorCanSplitInGroup;
    activeEditorAvailableEditorIds;
    activeEditorGroupEmpty;
    activeEditorGroupIndex;
    activeEditorGroupLast;
    activeEditorGroupLocked;
    multipleEditorGroupsContext;
    editorsVisibleContext;
    textCompareEditorVisibleContext;
    textCompareEditorActiveContext;
    sideBySideEditorActiveContext;
    splitEditorsVerticallyContext;
    workbenchStateContext;
    workspaceFolderCountContext;
    openFolderWorkspaceSupportContext;
    enterMultiRootWorkspaceSupportContext;
    emptyWorkspaceSupportContext;
    virtualWorkspaceContext;
    temporaryWorkspaceContext;
    inZenModeContext;
    isFullscreenContext;
    isCenteredLayoutContext;
    sideBarVisibleContext;
    editorAreaVisibleContext;
    panelPositionContext;
    panelVisibleContext;
    panelAlignmentContext;
    panelMaximizedContext;
    auxiliaryBarVisibleContext;
    editorTabsVisibleContext;
    constructor(contextKeyService, contextService, configurationService, environmentService, productService, editorService, editorResolverService, editorGroupService, layoutService, paneCompositeService, workingCopyService) {
        super();
        this.contextKeyService = contextKeyService;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.environmentService = environmentService;
        this.productService = productService;
        this.editorService = editorService;
        this.editorResolverService = editorResolverService;
        this.editorGroupService = editorGroupService;
        this.layoutService = layoutService;
        this.paneCompositeService = paneCompositeService;
        this.workingCopyService = workingCopyService;
        // Platform
        IsMacContext.bindTo(this.contextKeyService);
        IsLinuxContext.bindTo(this.contextKeyService);
        IsWindowsContext.bindTo(this.contextKeyService);
        IsWebContext.bindTo(this.contextKeyService);
        IsMacNativeContext.bindTo(this.contextKeyService);
        IsIOSContext.bindTo(this.contextKeyService);
        IsMobileContext.bindTo(this.contextKeyService);
        RemoteNameContext.bindTo(this.contextKeyService).set(getRemoteName(this.environmentService.remoteAuthority) || '');
        this.virtualWorkspaceContext = VirtualWorkspaceContext.bindTo(this.contextKeyService);
        this.temporaryWorkspaceContext = TemporaryWorkspaceContext.bindTo(this.contextKeyService);
        this.updateWorkspaceContextKeys();
        // Capabilities
        HasWebFileSystemAccess.bindTo(this.contextKeyService).set(WebFileSystemAccess.supported(window));
        // Development
        IsDevelopmentContext.bindTo(this.contextKeyService).set(!this.environmentService.isBuilt || this.environmentService.isExtensionDevelopment);
        // Product Quality
        ProductQualityContext.bindTo(this.contextKeyService).set(this.productService.quality || '');
        // Editors
        this.activeEditorContext = ActiveEditorContext.bindTo(this.contextKeyService);
        this.activeEditorIsReadonly = ActiveEditorReadonlyContext.bindTo(this.contextKeyService);
        this.activeEditorCanRevert = ActiveEditorCanRevertContext.bindTo(this.contextKeyService);
        this.activeEditorCanSplitInGroup = ActiveEditorCanSplitInGroupContext.bindTo(this.contextKeyService);
        this.activeEditorAvailableEditorIds = ActiveEditorAvailableEditorIdsContext.bindTo(this.contextKeyService);
        this.editorsVisibleContext = EditorsVisibleContext.bindTo(this.contextKeyService);
        this.textCompareEditorVisibleContext = TextCompareEditorVisibleContext.bindTo(this.contextKeyService);
        this.textCompareEditorActiveContext = TextCompareEditorActiveContext.bindTo(this.contextKeyService);
        this.sideBySideEditorActiveContext = SideBySideEditorActiveContext.bindTo(this.contextKeyService);
        this.activeEditorGroupEmpty = ActiveEditorGroupEmptyContext.bindTo(this.contextKeyService);
        this.activeEditorGroupIndex = ActiveEditorGroupIndexContext.bindTo(this.contextKeyService);
        this.activeEditorGroupLast = ActiveEditorGroupLastContext.bindTo(this.contextKeyService);
        this.activeEditorGroupLocked = ActiveEditorGroupLockedContext.bindTo(this.contextKeyService);
        this.multipleEditorGroupsContext = MultipleEditorGroupsContext.bindTo(this.contextKeyService);
        // Working Copies
        this.dirtyWorkingCopiesContext = DirtyWorkingCopiesContext.bindTo(this.contextKeyService);
        this.dirtyWorkingCopiesContext.set(this.workingCopyService.hasDirty);
        // Inputs
        this.inputFocusedContext = InputFocusedContext.bindTo(this.contextKeyService);
        // Workbench State
        this.workbenchStateContext = WorkbenchStateContext.bindTo(this.contextKeyService);
        this.updateWorkbenchStateContextKey();
        // Workspace Folder Count
        this.workspaceFolderCountContext = WorkspaceFolderCountContext.bindTo(this.contextKeyService);
        this.updateWorkspaceFolderCountContextKey();
        // Opening folder support: support for opening a folder workspace
        // (e.g. "Open Folder...") is limited in web when not connected
        // to a remote.
        this.openFolderWorkspaceSupportContext = OpenFolderWorkspaceSupportContext.bindTo(this.contextKeyService);
        this.openFolderWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === 'string');
        // Empty workspace support: empty workspaces require built-in file system
        // providers to be available that allow to enter a workspace or open loose
        // files. This condition is met:
        // - desktop: always
        // -     web: only when connected to a remote
        this.emptyWorkspaceSupportContext = EmptyWorkspaceSupportContext.bindTo(this.contextKeyService);
        this.emptyWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === 'string');
        // Entering a multi root workspace support: support for entering a multi-root
        // workspace (e.g. "Open Workspace from File...", "Duplicate Workspace", "Save Workspace")
        // is driven by the ability to resolve a workspace configuration file (*.code-workspace)
        // with a built-in file system provider.
        // This condition is met:
        // - desktop: always
        // -     web: only when connected to a remote
        this.enterMultiRootWorkspaceSupportContext = EnterMultiRootWorkspaceSupportContext.bindTo(this.contextKeyService);
        this.enterMultiRootWorkspaceSupportContext.set(isNative || typeof this.environmentService.remoteAuthority === 'string');
        // Editor Layout
        this.splitEditorsVerticallyContext = SplitEditorsVertically.bindTo(this.contextKeyService);
        this.updateSplitEditorsVerticallyContext();
        // Fullscreen
        this.isFullscreenContext = IsFullscreenContext.bindTo(this.contextKeyService);
        // Zen Mode
        this.inZenModeContext = InEditorZenModeContext.bindTo(this.contextKeyService);
        // Centered Layout
        this.isCenteredLayoutContext = IsCenteredLayoutContext.bindTo(this.contextKeyService);
        // Editor Area
        this.editorAreaVisibleContext = EditorAreaVisibleContext.bindTo(this.contextKeyService);
        this.editorTabsVisibleContext = EditorTabsVisibleContext.bindTo(this.contextKeyService);
        // Sidebar
        this.sideBarVisibleContext = SideBarVisibleContext.bindTo(this.contextKeyService);
        // Panel
        this.panelPositionContext = PanelPositionContext.bindTo(this.contextKeyService);
        this.panelPositionContext.set(positionToString(this.layoutService.getPanelPosition()));
        this.panelVisibleContext = PanelVisibleContext.bindTo(this.contextKeyService);
        this.panelVisibleContext.set(this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */));
        this.panelMaximizedContext = PanelMaximizedContext.bindTo(this.contextKeyService);
        this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
        this.panelAlignmentContext = PanelAlignmentContext.bindTo(this.contextKeyService);
        this.panelAlignmentContext.set(this.layoutService.getPanelAlignment());
        // Auxiliary Bar
        this.auxiliaryBarVisibleContext = AuxiliaryBarVisibleContext.bindTo(this.contextKeyService);
        this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */));
        this.registerListeners();
    }
    registerListeners() {
        this.editorGroupService.whenReady.then(() => {
            this.updateEditorAreaContextKeys();
            this.updateEditorContextKeys();
        });
        this._register(this.editorService.onDidActiveEditorChange(() => this.updateEditorContextKeys()));
        this._register(this.editorService.onDidVisibleEditorsChange(() => this.updateEditorContextKeys()));
        this._register(this.editorGroupService.onDidAddGroup(() => this.updateEditorContextKeys()));
        this._register(this.editorGroupService.onDidRemoveGroup(() => this.updateEditorContextKeys()));
        this._register(this.editorGroupService.onDidChangeGroupIndex(() => this.updateEditorContextKeys()));
        this._register(this.editorGroupService.onDidChangeActiveGroup(() => this.updateEditorGroupContextKeys()));
        this._register(this.editorGroupService.onDidChangeGroupLocked(() => this.updateEditorGroupContextKeys()));
        this._register(this.editorGroupService.onDidChangeEditorPartOptions(() => this.updateEditorAreaContextKeys()));
        this._register(addDisposableListener(window, EventType.FOCUS_IN, () => this.updateInputContextKeys(), true));
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateWorkbenchStateContextKey()));
        this._register(this.contextService.onDidChangeWorkspaceFolders(() => {
            this.updateWorkspaceFolderCountContextKey();
            this.updateWorkspaceContextKeys();
        }));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('workbench.editor.openSideBySideDirection')) {
                this.updateSplitEditorsVerticallyContext();
            }
        }));
        this._register(this.layoutService.onDidChangeZenMode(enabled => this.inZenModeContext.set(enabled)));
        this._register(this.layoutService.onDidChangeFullscreen(fullscreen => this.isFullscreenContext.set(fullscreen)));
        this._register(this.layoutService.onDidChangeCenteredLayout(centered => this.isCenteredLayoutContext.set(centered)));
        this._register(this.layoutService.onDidChangePanelPosition(position => this.panelPositionContext.set(position)));
        this._register(this.layoutService.onDidChangePanelAlignment(alignment => this.panelAlignmentContext.set(alignment)));
        this._register(this.paneCompositeService.onDidPaneCompositeClose(() => this.updateSideBarContextKeys()));
        this._register(this.paneCompositeService.onDidPaneCompositeOpen(() => this.updateSideBarContextKeys()));
        this._register(this.layoutService.onDidChangePartVisibility(() => {
            this.editorAreaVisibleContext.set(this.layoutService.isVisible("workbench.parts.editor" /* Parts.EDITOR_PART */));
            this.panelVisibleContext.set(this.layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */));
            this.panelMaximizedContext.set(this.layoutService.isPanelMaximized());
            this.auxiliaryBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */));
        }));
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.dirtyWorkingCopiesContext.set(workingCopy.isDirty() || this.workingCopyService.hasDirty)));
    }
    updateEditorAreaContextKeys() {
        this.editorTabsVisibleContext.set(!!this.editorGroupService.partOptions.showTabs);
    }
    updateEditorContextKeys() {
        const activeEditorPane = this.editorService.activeEditorPane;
        const visibleEditorPanes = this.editorService.visibleEditorPanes;
        this.textCompareEditorActiveContext.set(activeEditorPane?.getId() === TEXT_DIFF_EDITOR_ID);
        this.textCompareEditorVisibleContext.set(visibleEditorPanes.some(editorPane => editorPane.getId() === TEXT_DIFF_EDITOR_ID));
        this.sideBySideEditorActiveContext.set(activeEditorPane?.getId() === SIDE_BY_SIDE_EDITOR_ID);
        if (visibleEditorPanes.length > 0) {
            this.editorsVisibleContext.set(true);
        }
        else {
            this.editorsVisibleContext.reset();
        }
        if (!this.editorService.activeEditor) {
            this.activeEditorGroupEmpty.set(true);
        }
        else {
            this.activeEditorGroupEmpty.reset();
        }
        this.updateEditorGroupContextKeys();
        if (activeEditorPane) {
            this.activeEditorContext.set(activeEditorPane.getId());
            this.activeEditorIsReadonly.set(activeEditorPane.input.hasCapability(2 /* EditorInputCapabilities.Readonly */));
            this.activeEditorCanRevert.set(!activeEditorPane.input.hasCapability(4 /* EditorInputCapabilities.Untitled */));
            this.activeEditorCanSplitInGroup.set(activeEditorPane.input.hasCapability(32 /* EditorInputCapabilities.CanSplitInGroup */));
            const activeEditorResource = activeEditorPane.input.resource;
            const editors = activeEditorResource ? this.editorResolverService.getEditors(activeEditorResource).map(editor => editor.id) : [];
            // Non text editor untitled files cannot be easily serialized between extensions
            // so instead we disable this context key to prevent common commands that act on the active editor
            if (activeEditorResource?.scheme === Schemas.untitled && activeEditorPane.input.editorId !== DEFAULT_EDITOR_ASSOCIATION.id) {
                this.activeEditorAvailableEditorIds.set('');
            }
            else {
                this.activeEditorAvailableEditorIds.set(editors.join(','));
            }
        }
        else {
            this.activeEditorContext.reset();
            this.activeEditorIsReadonly.reset();
            this.activeEditorCanRevert.reset();
            this.activeEditorCanSplitInGroup.reset();
            this.activeEditorAvailableEditorIds.reset();
        }
    }
    updateEditorGroupContextKeys() {
        const groupCount = this.editorGroupService.count;
        if (groupCount > 1) {
            this.multipleEditorGroupsContext.set(true);
        }
        else {
            this.multipleEditorGroupsContext.reset();
        }
        const activeGroup = this.editorGroupService.activeGroup;
        this.activeEditorGroupIndex.set(activeGroup.index + 1); // not zero-indexed
        this.activeEditorGroupLast.set(activeGroup.index === groupCount - 1);
        this.activeEditorGroupLocked.set(activeGroup.isLocked);
    }
    updateInputContextKeys() {
        function activeElementIsInput() {
            return !!document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
        }
        const isInputFocused = activeElementIsInput();
        this.inputFocusedContext.set(isInputFocused);
        if (isInputFocused) {
            const tracker = trackFocus(document.activeElement);
            Event.once(tracker.onDidBlur)(() => {
                this.inputFocusedContext.set(activeElementIsInput());
                tracker.dispose();
            });
        }
    }
    updateWorkbenchStateContextKey() {
        this.workbenchStateContext.set(this.getWorkbenchStateString());
    }
    updateWorkspaceFolderCountContextKey() {
        this.workspaceFolderCountContext.set(this.contextService.getWorkspace().folders.length);
    }
    updateSplitEditorsVerticallyContext() {
        const direction = preferredSideBySideGroupDirection(this.configurationService);
        this.splitEditorsVerticallyContext.set(direction === 1 /* GroupDirection.DOWN */);
    }
    getWorkbenchStateString() {
        switch (this.contextService.getWorkbenchState()) {
            case 1 /* WorkbenchState.EMPTY */: return 'empty';
            case 2 /* WorkbenchState.FOLDER */: return 'folder';
            case 3 /* WorkbenchState.WORKSPACE */: return 'workspace';
        }
    }
    updateSideBarContextKeys() {
        this.sideBarVisibleContext.set(this.layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */));
    }
    updateWorkspaceContextKeys() {
        this.virtualWorkspaceContext.set(getVirtualWorkspaceScheme(this.contextService.getWorkspace()) || '');
        this.temporaryWorkspaceContext.set(isTemporaryWorkspace(this.contextService.getWorkspace()));
    }
};
WorkbenchContextKeysHandler = __decorate([
    __param(0, IContextKeyService),
    __param(1, IWorkspaceContextService),
    __param(2, IConfigurationService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IProductService),
    __param(5, IEditorService),
    __param(6, IEditorResolverService),
    __param(7, IEditorGroupsService),
    __param(8, IWorkbenchLayoutService),
    __param(9, IPaneCompositePartService),
    __param(10, IWorkingCopyService)
], WorkbenchContextKeysHandler);
export { WorkbenchContextKeysHandler };
