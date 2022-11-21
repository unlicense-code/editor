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
import { URI } from 'vs/base/common/uri';
import { onUnexpectedError } from 'vs/base/common/errors';
import { equals } from 'vs/base/common/objects';
import { EventType, EventHelper, addDisposableListener, scheduleAtNextAnimationFrame, ModifierKeyEmitter } from 'vs/base/browser/dom';
import { Separator } from 'vs/base/common/actions';
import { IFileService } from 'vs/platform/files/common/files';
import { EditorResourceAccessor, SideBySideEditor, pathsToEditors, isResourceEditorInput } from 'vs/workbench/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { WindowMinimumSize, getTitleBarStyle } from 'vs/platform/window/common/window';
import { ITitleService } from 'vs/workbench/services/title/common/titleService';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { applyZoom } from 'vs/platform/window/electron-sandbox/window';
import { setFullscreen, getZoomLevel } from 'vs/base/browser/browser';
import { ICommandService, CommandsRegistry } from 'vs/platform/commands/common/commands';
import { ipcRenderer } from 'vs/base/parts/sandbox/electron-sandbox/globals';
import { IWorkspaceEditingService } from 'vs/workbench/services/workspaces/common/workspaceEditing';
import { IMenuService, MenuId, MenuItemAction, MenuRegistry } from 'vs/platform/actions/common/actions';
import { createAndFillInActionBarActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IIntegrityService } from 'vs/workbench/services/integrity/common/integrity';
import { isWindows, isMacintosh, isCI } from 'vs/base/common/platform';
import { IProductService } from 'vs/platform/product/common/productService';
import { INotificationService, NeverShowAgainScope, Severity } from 'vs/platform/notification/common/notification';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { coalesce } from 'vs/base/common/arrays';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { assertIsDefined } from 'vs/base/common/types';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { Schemas } from 'vs/base/common/network';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { posix } from 'vs/base/common/path';
import { ITunnelService, extractLocalHostUriMetaDataForPortMapping } from 'vs/platform/tunnel/common/tunnel';
import { IWorkbenchLayoutService, positionFromString } from 'vs/workbench/services/layout/browser/layoutService';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { Event } from 'vs/base/common/event';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ILogService } from 'vs/platform/log/common/log';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { whenEditorClosed } from 'vs/workbench/browser/editor';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { registerWindowDriver } from 'vs/platform/driver/electron-sandbox/driver';
import { ILabelService } from 'vs/platform/label/common/label';
import { dirname } from 'vs/base/common/resources';
import { IBannerService } from 'vs/workbench/services/banner/browser/bannerService';
import { Codicon } from 'vs/base/common/codicons';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
let NativeWindow = class NativeWindow extends Disposable {
    editorService;
    editorGroupService;
    configurationService;
    titleService;
    themeService;
    notificationService;
    commandService;
    keybindingService;
    telemetryService;
    workspaceEditingService;
    fileService;
    menuService;
    lifecycleService;
    integrityService;
    environmentService;
    accessibilityService;
    contextService;
    openerService;
    nativeHostService;
    tunnelService;
    layoutService;
    workingCopyService;
    filesConfigurationService;
    productService;
    remoteAuthorityResolverService;
    dialogService;
    storageService;
    logService;
    instantiationService;
    sharedProcessService;
    progressService;
    labelService;
    bannerService;
    uriIdentityService;
    touchBarMenu;
    touchBarDisposables = this._register(new DisposableStore());
    lastInstalledTouchedBar;
    customTitleContextMenuDisposable = this._register(new DisposableStore());
    previousConfiguredZoomLevel;
    addFoldersScheduler = this._register(new RunOnceScheduler(() => this.doAddFolders(), 100));
    pendingFoldersToAdd = [];
    closeEmptyWindowScheduler = this._register(new RunOnceScheduler(() => this.onDidAllEditorsClose(), 50));
    isDocumentedEdited = false;
    constructor(editorService, editorGroupService, configurationService, titleService, themeService, notificationService, commandService, keybindingService, telemetryService, workspaceEditingService, fileService, menuService, lifecycleService, integrityService, environmentService, accessibilityService, contextService, openerService, nativeHostService, tunnelService, layoutService, workingCopyService, filesConfigurationService, productService, remoteAuthorityResolverService, dialogService, storageService, logService, instantiationService, sharedProcessService, progressService, labelService, bannerService, uriIdentityService) {
        super();
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.configurationService = configurationService;
        this.titleService = titleService;
        this.themeService = themeService;
        this.notificationService = notificationService;
        this.commandService = commandService;
        this.keybindingService = keybindingService;
        this.telemetryService = telemetryService;
        this.workspaceEditingService = workspaceEditingService;
        this.fileService = fileService;
        this.menuService = menuService;
        this.lifecycleService = lifecycleService;
        this.integrityService = integrityService;
        this.environmentService = environmentService;
        this.accessibilityService = accessibilityService;
        this.contextService = contextService;
        this.openerService = openerService;
        this.nativeHostService = nativeHostService;
        this.tunnelService = tunnelService;
        this.layoutService = layoutService;
        this.workingCopyService = workingCopyService;
        this.filesConfigurationService = filesConfigurationService;
        this.productService = productService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this.dialogService = dialogService;
        this.storageService = storageService;
        this.logService = logService;
        this.instantiationService = instantiationService;
        this.sharedProcessService = sharedProcessService;
        this.progressService = progressService;
        this.labelService = labelService;
        this.bannerService = bannerService;
        this.uriIdentityService = uriIdentityService;
        this.registerListeners();
        this.create();
    }
    registerListeners() {
        // Layout
        this._register(addDisposableListener(window, EventType.RESIZE, e => this.onWindowResize(e, true)));
        // React to editor input changes
        this._register(this.editorService.onDidActiveEditorChange(() => this.updateTouchbarMenu()));
        // prevent opening a real URL inside the window
        for (const event of [EventType.DRAG_OVER, EventType.DROP]) {
            window.document.body.addEventListener(event, (e) => {
                EventHelper.stop(e);
            });
        }
        // Support runAction event
        ipcRenderer.on('vscode:runAction', async (event, request) => {
            const args = request.args || [];
            // If we run an action from the touchbar, we fill in the currently active resource
            // as payload because the touch bar items are context aware depending on the editor
            if (request.from === 'touchbar') {
                const activeEditor = this.editorService.activeEditor;
                if (activeEditor) {
                    const resource = EditorResourceAccessor.getOriginalUri(activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
                    if (resource) {
                        args.push(resource);
                    }
                }
            }
            else {
                args.push({ from: request.from });
            }
            try {
                await this.commandService.executeCommand(request.id, ...args);
                this.telemetryService.publicLog2('workbenchActionExecuted', { id: request.id, from: request.from });
            }
            catch (error) {
                this.notificationService.error(error);
            }
        });
        // Support runKeybinding event
        ipcRenderer.on('vscode:runKeybinding', (event, request) => {
            if (document.activeElement) {
                this.keybindingService.dispatchByUserSettingsLabel(request.userSettingsLabel, document.activeElement);
            }
        });
        // Error reporting from main
        ipcRenderer.on('vscode:reportError', (event, error) => {
            if (error) {
                onUnexpectedError(JSON.parse(error));
            }
        });
        // Support openFiles event for existing and new files
        ipcRenderer.on('vscode:openFiles', (event, request) => { this.onOpenFiles(request); });
        // Support addFolders event if we have a workspace opened
        ipcRenderer.on('vscode:addFolders', (event, request) => { this.onAddFoldersRequest(request); });
        // Message support
        ipcRenderer.on('vscode:showInfoMessage', (event, message) => { this.notificationService.info(message); });
        // Shell Environment Issue Notifications
        ipcRenderer.on('vscode:showResolveShellEnvError', (event, message) => {
            this.notificationService.prompt(Severity.Error, message, [{
                    label: localize('learnMore', "Learn More"),
                    run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2149667')
                }]);
        });
        ipcRenderer.on('vscode:showCredentialsError', (event, message) => {
            this.notificationService.prompt(Severity.Error, localize('keychainWriteError', "Writing login information to the keychain failed with error '{0}'.", message), [{
                    label: localize('troubleshooting', "Troubleshooting Guide"),
                    run: () => this.openerService.open('https://go.microsoft.com/fwlink/?linkid=2190713')
                }]);
        });
        // Fullscreen Events
        ipcRenderer.on('vscode:enterFullScreen', async () => { setFullscreen(true); });
        ipcRenderer.on('vscode:leaveFullScreen', async () => { setFullscreen(false); });
        // Proxy Login Dialog
        ipcRenderer.on('vscode:openProxyAuthenticationDialog', async (event, payload) => {
            const rememberCredentialsKey = 'window.rememberProxyCredentials';
            const rememberCredentials = this.storageService.getBoolean(rememberCredentialsKey, -1 /* StorageScope.APPLICATION */);
            const result = await this.dialogService.input(Severity.Warning, localize('proxyAuthRequired', "Proxy Authentication Required"), [
                localize({ key: 'loginButton', comment: ['&& denotes a mnemonic'] }, "&&Log In"),
                localize({ key: 'cancelButton', comment: ['&& denotes a mnemonic'] }, "&&Cancel")
            ], [
                { placeholder: localize('username', "Username"), value: payload.username },
                { placeholder: localize('password', "Password"), type: 'password', value: payload.password }
            ], {
                cancelId: 1,
                detail: localize('proxyDetail', "The proxy {0} requires a username and password.", `${payload.authInfo.host}:${payload.authInfo.port}`),
                checkbox: {
                    label: localize('rememberCredentials', "Remember my credentials"),
                    checked: rememberCredentials
                }
            });
            // Reply back to the channel without result to indicate
            // that the login dialog was cancelled
            if (result.choice !== 0 || !result.values) {
                ipcRenderer.send(payload.replyChannel);
            }
            // Other reply back with the picked credentials
            else {
                // Update state based on checkbox
                if (result.checkboxChecked) {
                    this.storageService.store(rememberCredentialsKey, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                }
                else {
                    this.storageService.remove(rememberCredentialsKey, -1 /* StorageScope.APPLICATION */);
                }
                // Reply back to main side with credentials
                const [username, password] = result.values;
                ipcRenderer.send(payload.replyChannel, { username, password, remember: !!result.checkboxChecked });
            }
        });
        // Accessibility support changed event
        ipcRenderer.on('vscode:accessibilitySupportChanged', (event, accessibilitySupportEnabled) => {
            this.accessibilityService.setAccessibilitySupport(accessibilitySupportEnabled ? 2 /* AccessibilitySupport.Enabled */ : 1 /* AccessibilitySupport.Disabled */);
        });
        // Zoom level changes
        this.updateWindowZoomLevel();
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('window.zoomLevel')) {
                this.updateWindowZoomLevel();
            }
            else if (e.affectsConfiguration('keyboard.touchbar.enabled') || e.affectsConfiguration('keyboard.touchbar.ignored')) {
                this.updateTouchbarMenu();
            }
        }));
        // Listen to visible editor changes
        this._register(this.editorService.onDidVisibleEditorsChange(() => this.onDidChangeVisibleEditors()));
        // Listen to editor closing (if we run with --wait)
        const filesToWait = this.environmentService.filesToWait;
        if (filesToWait) {
            this.trackClosedWaitFiles(filesToWait.waitMarkerFileUri, coalesce(filesToWait.paths.map(path => path.fileUri)));
        }
        // macOS OS integration
        if (isMacintosh) {
            this._register(this.editorService.onDidActiveEditorChange(() => {
                const file = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY, filterByScheme: Schemas.file });
                // Represented Filename
                this.nativeHostService.setRepresentedFilename(file?.fsPath ?? '');
                // Custom title menu
                this.provideCustomTitleContextMenu(file?.fsPath);
            }));
        }
        // Maximize/Restore on doubleclick (for macOS custom title)
        if (isMacintosh && getTitleBarStyle(this.configurationService) === 'custom') {
            const titlePart = assertIsDefined(this.layoutService.getContainer("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */));
            this._register(addDisposableListener(titlePart, EventType.DBLCLICK, e => {
                EventHelper.stop(e);
                this.nativeHostService.handleTitleDoubleClick();
            }));
        }
        // Document edited: indicate for dirty working copies
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => {
            const gotDirty = workingCopy.isDirty();
            if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                return; // do not indicate dirty of working copies that are auto saved after short delay
            }
            this.updateDocumentEdited(gotDirty ? true : undefined);
        }));
        this.updateDocumentEdited(undefined);
        // Detect minimize / maximize
        this._register(Event.any(Event.map(Event.filter(this.nativeHostService.onDidMaximizeWindow, id => id === this.nativeHostService.windowId), () => true), Event.map(Event.filter(this.nativeHostService.onDidUnmaximizeWindow, id => id === this.nativeHostService.windowId), () => false))(e => this.onDidChangeWindowMaximized(e)));
        this.onDidChangeWindowMaximized(this.environmentService.window.maximized ?? false);
        // Detect panel position to determine minimum width
        this._register(this.layoutService.onDidChangePanelPosition(pos => this.onDidChangePanelPosition(positionFromString(pos))));
        this.onDidChangePanelPosition(this.layoutService.getPanelPosition());
        // Lifecycle
        this._register(this.lifecycleService.onBeforeShutdown(e => this.onBeforeShutdown(e)));
        this._register(this.lifecycleService.onBeforeShutdownError(e => this.onBeforeShutdownError(e)));
        this._register(this.lifecycleService.onWillShutdown(e => this.onWillShutdown(e)));
    }
    onBeforeShutdown({ veto, reason }) {
        if (reason === 1 /* ShutdownReason.CLOSE */) {
            const confirmBeforeCloseSetting = this.configurationService.getValue('window.confirmBeforeClose');
            const confirmBeforeClose = confirmBeforeCloseSetting === 'always' || (confirmBeforeCloseSetting === 'keyboardOnly' && ModifierKeyEmitter.getInstance().isModifierPressed);
            if (confirmBeforeClose) {
                // When we need to confirm on close or quit, veto the shutdown
                // with a long running promise to figure out whether shutdown
                // can proceed or not.
                return veto((async () => {
                    let actualReason = reason;
                    if (reason === 1 /* ShutdownReason.CLOSE */ && !isMacintosh) {
                        const windowCount = await this.nativeHostService.getWindowCount();
                        if (windowCount === 1) {
                            actualReason = 2 /* ShutdownReason.QUIT */; // Windows/Linux: closing last window means to QUIT
                        }
                    }
                    let confirmed = true;
                    if (confirmBeforeClose) {
                        confirmed = await this.instantiationService.invokeFunction(accessor => NativeWindow.confirmOnShutdown(accessor, actualReason));
                    }
                    // Progress for long running shutdown
                    if (confirmed) {
                        this.progressOnBeforeShutdown(reason);
                    }
                    return !confirmed;
                })(), 'veto.confirmBeforeClose');
            }
        }
        // Progress for long running shutdown
        this.progressOnBeforeShutdown(reason);
    }
    progressOnBeforeShutdown(reason) {
        this.progressService.withProgress({
            location: 10 /* ProgressLocation.Window */,
            delay: 800,
            title: this.toShutdownLabel(reason, false),
        }, () => {
            return Event.toPromise(Event.any(this.lifecycleService.onWillShutdown, // dismiss this dialog when we shutdown
            this.lifecycleService.onShutdownVeto, // or when shutdown was vetoed
            this.dialogService.onWillShowDialog // or when a dialog asks for input
            ));
        });
    }
    static async confirmOnShutdown(accessor, reason) {
        const dialogService = accessor.get(IDialogService);
        const configurationService = accessor.get(IConfigurationService);
        const message = reason === 2 /* ShutdownReason.QUIT */ ?
            (isMacintosh ? localize('quitMessageMac', "Are you sure you want to quit?") : localize('quitMessage', "Are you sure you want to exit?")) :
            localize('closeWindowMessage', "Are you sure you want to close the window?");
        const primaryButton = reason === 2 /* ShutdownReason.QUIT */ ?
            (isMacintosh ? localize({ key: 'quitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Quit") : localize({ key: 'exitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Exit")) :
            localize({ key: 'closeWindowButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Close Window");
        const res = await dialogService.confirm({
            type: 'question',
            message,
            primaryButton,
            checkbox: {
                label: localize('doNotAskAgain', "Do not ask me again")
            }
        });
        // Update setting if checkbox checked
        if (res.checkboxChecked) {
            await configurationService.updateValue('window.confirmBeforeClose', 'never');
        }
        return res.confirmed;
    }
    onBeforeShutdownError({ error, reason }) {
        this.dialogService.show(Severity.Error, this.toShutdownLabel(reason, true), undefined, {
            detail: localize('shutdownErrorDetail', "Error: {0}", toErrorMessage(error))
        });
    }
    onWillShutdown({ reason, force, joiners }) {
        // Delay so that the dialog only appears after timeout
        const shutdownDialogScheduler = new RunOnceScheduler(() => {
            const pendingJoiners = joiners();
            this.progressService.withProgress({
                location: 20 /* ProgressLocation.Dialog */,
                buttons: [this.toForceShutdownLabel(reason)],
                cancellable: false,
                sticky: true,
                title: this.toShutdownLabel(reason, false),
                detail: pendingJoiners.length > 0 ? localize('willShutdownDetail', "The following operations are still running: \n{0}", pendingJoiners.map(joiner => `- ${joiner.label}`).join('\n')) : undefined
            }, () => {
                return Event.toPromise(this.lifecycleService.onDidShutdown); // dismiss this dialog when we actually shutdown
            }, () => {
                force();
            });
        }, 1200);
        shutdownDialogScheduler.schedule();
        // Dispose scheduler when we actually shutdown
        Event.once(this.lifecycleService.onDidShutdown)(() => shutdownDialogScheduler.dispose());
    }
    toShutdownLabel(reason, isError) {
        if (isError) {
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    return localize('shutdownErrorClose', "An unexpected error prevented the window to close");
                case 2 /* ShutdownReason.QUIT */:
                    return localize('shutdownErrorQuit', "An unexpected error prevented the application to quit");
                case 3 /* ShutdownReason.RELOAD */:
                    return localize('shutdownErrorReload', "An unexpected error prevented the window to reload");
                case 4 /* ShutdownReason.LOAD */:
                    return localize('shutdownErrorLoad', "An unexpected error prevented to change the workspace");
            }
        }
        switch (reason) {
            case 1 /* ShutdownReason.CLOSE */:
                return localize('shutdownTitleClose', "Closing the window is taking a bit longer...");
            case 2 /* ShutdownReason.QUIT */:
                return localize('shutdownTitleQuit', "Quitting the application is taking a bit longer...");
            case 3 /* ShutdownReason.RELOAD */:
                return localize('shutdownTitleReload', "Reloading the window is taking a bit longer...");
            case 4 /* ShutdownReason.LOAD */:
                return localize('shutdownTitleLoad', "Changing the workspace is taking a bit longer...");
        }
    }
    toForceShutdownLabel(reason) {
        switch (reason) {
            case 1 /* ShutdownReason.CLOSE */:
                return localize('shutdownForceClose', "Close Anyway");
            case 2 /* ShutdownReason.QUIT */:
                return localize('shutdownForceQuit', "Quit Anyway");
            case 3 /* ShutdownReason.RELOAD */:
                return localize('shutdownForceReload', "Reload Anyway");
            case 4 /* ShutdownReason.LOAD */:
                return localize('shutdownForceLoad', "Change Anyway");
        }
    }
    onWindowResize(e, retry) {
        if (e.target === window) {
            if (window.document && window.document.body && window.document.body.clientWidth === 0) {
                // TODO@electron this is an electron issue on macOS when simple fullscreen is enabled
                // where for some reason the window clientWidth is reported as 0 when switching
                // between simple fullscreen and normal screen. In that case we schedule the layout
                // call at the next animation frame once, in the hope that the dimensions are
                // proper then.
                if (retry) {
                    scheduleAtNextAnimationFrame(() => this.onWindowResize(e, false));
                }
                return;
            }
            this.layoutService.layout();
        }
    }
    updateDocumentEdited(documentEdited) {
        let setDocumentEdited;
        if (typeof documentEdited === 'boolean') {
            setDocumentEdited = documentEdited;
        }
        else {
            setDocumentEdited = this.workingCopyService.hasDirty;
        }
        if ((!this.isDocumentedEdited && setDocumentEdited) || (this.isDocumentedEdited && !setDocumentEdited)) {
            this.isDocumentedEdited = setDocumentEdited;
            this.nativeHostService.setDocumentEdited(setDocumentEdited);
        }
    }
    onDidChangeWindowMaximized(maximized) {
        this.layoutService.updateWindowMaximizedState(maximized);
    }
    getWindowMinimumWidth(panelPosition = this.layoutService.getPanelPosition()) {
        // if panel is on the side, then return the larger minwidth
        const panelOnSide = panelPosition === 0 /* Position.LEFT */ || panelPosition === 1 /* Position.RIGHT */;
        if (panelOnSide) {
            return WindowMinimumSize.WIDTH_WITH_VERTICAL_PANEL;
        }
        return WindowMinimumSize.WIDTH;
    }
    onDidChangePanelPosition(pos) {
        const minWidth = this.getWindowMinimumWidth(pos);
        this.nativeHostService.setMinimumSize(minWidth, undefined);
    }
    onDidChangeVisibleEditors() {
        // Close when empty: check if we should close the window based on the setting
        // Overruled by: window has a workspace opened or this window is for extension development
        // or setting is disabled. Also enabled when running with --wait from the command line.
        const visibleEditorPanes = this.editorService.visibleEditorPanes;
        if (visibleEditorPanes.length === 0 && this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ && !this.environmentService.isExtensionDevelopment) {
            const closeWhenEmpty = this.configurationService.getValue('window.closeWhenEmpty');
            if (closeWhenEmpty || this.environmentService.args.wait) {
                this.closeEmptyWindowScheduler.schedule();
            }
        }
    }
    onDidAllEditorsClose() {
        const visibleEditorPanes = this.editorService.visibleEditorPanes.length;
        if (visibleEditorPanes === 0) {
            this.nativeHostService.closeWindow();
        }
    }
    updateWindowZoomLevel() {
        const windowConfig = this.configurationService.getValue();
        let configuredZoomLevel = 0;
        if (windowConfig.window && typeof windowConfig.window.zoomLevel === 'number') {
            configuredZoomLevel = windowConfig.window.zoomLevel;
            // Leave early if the configured zoom level did not change (https://github.com/microsoft/vscode/issues/1536)
            if (this.previousConfiguredZoomLevel === configuredZoomLevel) {
                return;
            }
            this.previousConfiguredZoomLevel = configuredZoomLevel;
        }
        if (getZoomLevel() !== configuredZoomLevel) {
            applyZoom(configuredZoomLevel);
        }
    }
    provideCustomTitleContextMenu(filePath) {
        // Clear old menu
        this.customTitleContextMenuDisposable.clear();
        // Provide new menu if a file is opened and we are on a custom title
        if (!filePath || getTitleBarStyle(this.configurationService) !== 'custom') {
            return;
        }
        // Split up filepath into segments
        const segments = filePath.split(posix.sep);
        for (let i = segments.length; i > 0; i--) {
            const isFile = (i === segments.length);
            let pathOffset = i;
            if (!isFile) {
                pathOffset++; // for segments which are not the file name we want to open the folder
            }
            const path = URI.file(segments.slice(0, pathOffset).join(posix.sep));
            let label;
            if (!isFile) {
                label = this.labelService.getUriBasenameLabel(dirname(path));
            }
            else {
                label = this.labelService.getUriBasenameLabel(path);
            }
            const commandId = `workbench.action.revealPathInFinder${i}`;
            this.customTitleContextMenuDisposable.add(CommandsRegistry.registerCommand(commandId, () => this.nativeHostService.showItemInFolder(path.fsPath)));
            this.customTitleContextMenuDisposable.add(MenuRegistry.appendMenuItem(MenuId.TitleBarTitleContext, { command: { id: commandId, title: label || posix.sep }, order: -i }));
        }
    }
    create() {
        // Handle open calls
        this.setupOpenHandlers();
        // Notify some services about lifecycle phases
        this.lifecycleService.when(2 /* LifecyclePhase.Ready */).then(() => this.nativeHostService.notifyReady());
        this.lifecycleService.when(3 /* LifecyclePhase.Restored */).then(() => this.sharedProcessService.notifyRestored());
        // Check for situations that are worth warning the user about
        this.handleWarnings();
        // Touchbar menu (if enabled)
        this.updateTouchbarMenu();
        // Smoke Test Driver
        if (this.environmentService.enableSmokeTestDriver) {
            this.setupDriver();
        }
    }
    async handleWarnings() {
        // Check for cyclic dependencies
        if (typeof require.hasDependencyCycle === 'function' && require.hasDependencyCycle()) {
            if (isCI) {
                this.logService.error('Error: There is a dependency cycle in the AMD modules that needs to be resolved!');
                this.nativeHostService.exit(37); // running on a build machine, just exit without showing a dialog
            }
            else {
                this.dialogService.show(Severity.Error, localize('loaderCycle', "There is a dependency cycle in the AMD modules that needs to be resolved!"));
                this.nativeHostService.openDevTools();
            }
        }
        // After restored phase is fine for the following ones
        await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
        // Integrity / Root warning
        (async () => {
            const isAdmin = await this.nativeHostService.isAdmin();
            const { isPure } = await this.integrityService.isPure();
            // Update to title
            this.titleService.updateProperties({ isPure, isAdmin });
            // Show warning message (unix only)
            if (isAdmin && !isWindows) {
                this.notificationService.warn(localize('runningAsRoot', "It is not recommended to run {0} as root user.", this.productService.nameShort));
            }
        })();
        // Installation Dir Warning
        if (this.environmentService.isBuilt) {
            let installLocationUri;
            if (isMacintosh) {
                // appRoot = /Applications/Visual Studio Code - Insiders.app/Contents/Resources/app
                installLocationUri = dirname(dirname(dirname(URI.file(this.environmentService.appRoot))));
            }
            else {
                // appRoot = C:\Users\<name>\AppData\Local\Programs\Microsoft VS Code Insiders\resources\app
                // appRoot = /usr/share/code-insiders/resources/app
                installLocationUri = dirname(dirname(URI.file(this.environmentService.appRoot)));
            }
            for (const folder of this.contextService.getWorkspace().folders) {
                if (this.uriIdentityService.extUri.isEqualOrParent(folder.uri, installLocationUri)) {
                    this.bannerService.show({
                        id: 'appRootWarning.banner',
                        message: localize('appRootWarning.banner', "Files you store within the installation folder ('{0}') may be OVERWRITTEN or DELETED IRREVERSIBLY without warning at update time.", this.labelService.getUriLabel(installLocationUri)),
                        icon: Codicon.warning
                    });
                    break;
                }
            }
        }
        // Windows 7 warning
        if (isWindows) {
            const version = this.environmentService.os.release.split('.');
            // Refs https://docs.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-osversioninfoa
            if (parseInt(version[0]) === 6 && parseInt(version[1]) === 1) {
                const message = localize('windows 7 eol', "{0} on Windows 7 will no longer receive any further updates.", this.productService.nameLong);
                this.notificationService.prompt(Severity.Warning, message, [{
                        label: localize('learnMore', "Learn More"),
                        run: () => this.openerService.open(URI.parse('https://aka.ms/vscode-faq-win7'))
                    }], {
                    neverShowAgain: { id: 'windows7eol', isSecondary: true, scope: NeverShowAgainScope.APPLICATION }
                });
            }
        }
    }
    setupDriver() {
        const that = this;
        let pendingQuit = false;
        registerWindowDriver({
            async exitApplication() {
                if (pendingQuit) {
                    that.logService.info('[driver] not handling exitApplication() due to pending quit() call');
                    return;
                }
                that.logService.info('[driver] handling exitApplication()');
                pendingQuit = true;
                return that.nativeHostService.quit();
            }
        });
    }
    setupOpenHandlers() {
        // Block window.open() calls
        window.open = function () {
            throw new Error('Prevented call to window.open(). Use IOpenerService instead!');
        };
        // Handle external open() calls
        this.openerService.setDefaultExternalOpener({
            openExternal: async (href) => {
                const success = await this.nativeHostService.openExternal(href);
                if (!success) {
                    const fileCandidate = URI.parse(href);
                    if (fileCandidate.scheme === Schemas.file) {
                        // if opening failed, and this is a file, we can still try to reveal it
                        await this.nativeHostService.showItemInFolder(fileCandidate.fsPath);
                    }
                }
                return true;
            }
        });
        // Register external URI resolver
        this.openerService.registerExternalUriResolver({
            resolveExternalUri: async (uri, options) => {
                if (options?.allowTunneling) {
                    const portMappingRequest = extractLocalHostUriMetaDataForPortMapping(uri);
                    if (portMappingRequest) {
                        const remoteAuthority = this.environmentService.remoteAuthority;
                        const addressProvider = remoteAuthority ? {
                            getAddress: async () => {
                                return (await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority)).authority;
                            }
                        } : undefined;
                        let tunnel = await this.tunnelService.getExistingTunnel(portMappingRequest.address, portMappingRequest.port);
                        if (!tunnel) {
                            tunnel = await this.tunnelService.openTunnel(addressProvider, portMappingRequest.address, portMappingRequest.port);
                        }
                        if (tunnel) {
                            const addressAsUri = URI.parse(tunnel.localAddress);
                            const resolved = addressAsUri.scheme.startsWith(uri.scheme) ? addressAsUri : uri.with({ authority: tunnel.localAddress });
                            return {
                                resolved,
                                dispose: () => tunnel?.dispose(),
                            };
                        }
                    }
                }
                if (!options?.openExternal) {
                    const canHandleResource = await this.fileService.canHandleResource(uri);
                    if (canHandleResource) {
                        return {
                            resolved: URI.from({
                                scheme: this.productService.urlProtocol,
                                path: 'workspace',
                                query: uri.toString()
                            }),
                            dispose() { }
                        };
                    }
                }
                return undefined;
            }
        });
    }
    updateTouchbarMenu() {
        if (!isMacintosh) {
            return; // macOS only
        }
        // Dispose old
        this.touchBarDisposables.clear();
        this.touchBarMenu = undefined;
        // Create new (delayed)
        const scheduler = this.touchBarDisposables.add(new RunOnceScheduler(() => this.doUpdateTouchbarMenu(scheduler), 300));
        scheduler.schedule();
    }
    doUpdateTouchbarMenu(scheduler) {
        if (!this.touchBarMenu) {
            const scopedContextKeyService = this.editorService.activeEditorPane?.scopedContextKeyService || this.editorGroupService.activeGroup.scopedContextKeyService;
            this.touchBarMenu = this.menuService.createMenu(MenuId.TouchBarContext, scopedContextKeyService);
            this.touchBarDisposables.add(this.touchBarMenu);
            this.touchBarDisposables.add(this.touchBarMenu.onDidChange(() => scheduler.schedule()));
        }
        const actions = [];
        const disabled = this.configurationService.getValue('keyboard.touchbar.enabled') === false;
        const touchbarIgnored = this.configurationService.getValue('keyboard.touchbar.ignored');
        const ignoredItems = Array.isArray(touchbarIgnored) ? touchbarIgnored : [];
        // Fill actions into groups respecting order
        createAndFillInActionBarActions(this.touchBarMenu, undefined, actions);
        // Convert into command action multi array
        const items = [];
        let group = [];
        if (!disabled) {
            for (const action of actions) {
                // Command
                if (action instanceof MenuItemAction) {
                    if (ignoredItems.indexOf(action.item.id) >= 0) {
                        continue; // ignored
                    }
                    group.push(action.item);
                }
                // Separator
                else if (action instanceof Separator) {
                    if (group.length) {
                        items.push(group);
                    }
                    group = [];
                }
            }
            if (group.length) {
                items.push(group);
            }
        }
        // Only update if the actions have changed
        if (!equals(this.lastInstalledTouchedBar, items)) {
            this.lastInstalledTouchedBar = items;
            this.nativeHostService.updateTouchBar(items);
        }
    }
    onAddFoldersRequest(request) {
        // Buffer all pending requests
        this.pendingFoldersToAdd.push(...request.foldersToAdd.map(folder => URI.revive(folder)));
        // Delay the adding of folders a bit to buffer in case more requests are coming
        if (!this.addFoldersScheduler.isScheduled()) {
            this.addFoldersScheduler.schedule();
        }
    }
    doAddFolders() {
        const foldersToAdd = [];
        for (const folder of this.pendingFoldersToAdd) {
            foldersToAdd.push(({ uri: folder }));
        }
        this.pendingFoldersToAdd = [];
        this.workspaceEditingService.addFolders(foldersToAdd);
    }
    async onOpenFiles(request) {
        const diffMode = !!(request.filesToDiff && (request.filesToDiff.length === 2));
        const mergeMode = !!(request.filesToMerge && (request.filesToMerge.length === 4));
        const inputs = coalesce(await pathsToEditors(mergeMode ? request.filesToMerge : diffMode ? request.filesToDiff : request.filesToOpenOrCreate, this.fileService, this.logService));
        if (inputs.length) {
            const openedEditorPanes = await this.openResources(inputs, diffMode, mergeMode);
            if (request.filesToWait) {
                // In wait mode, listen to changes to the editors and wait until the files
                // are closed that the user wants to wait for. When this happens we delete
                // the wait marker file to signal to the outside that editing is done.
                // However, it is possible that opening of the editors failed, as such we
                // check for whether editor panes got opened and otherwise delete the marker
                // right away.
                if (openedEditorPanes.length) {
                    return this.trackClosedWaitFiles(URI.revive(request.filesToWait.waitMarkerFileUri), coalesce(request.filesToWait.paths.map(path => URI.revive(path.fileUri))));
                }
                else {
                    return this.fileService.del(URI.revive(request.filesToWait.waitMarkerFileUri));
                }
            }
        }
    }
    async trackClosedWaitFiles(waitMarkerFile, resourcesToWaitFor) {
        // Wait for the resources to be closed in the text editor...
        await this.instantiationService.invokeFunction(accessor => whenEditorClosed(accessor, resourcesToWaitFor));
        // ...before deleting the wait marker file
        await this.fileService.del(waitMarkerFile);
    }
    async openResources(resources, diffMode, mergeMode) {
        const editors = [];
        if (mergeMode && isResourceEditorInput(resources[0]) && isResourceEditorInput(resources[1]) && isResourceEditorInput(resources[2]) && isResourceEditorInput(resources[3])) {
            const mergeEditor = {
                input1: { resource: resources[0].resource },
                input2: { resource: resources[1].resource },
                base: { resource: resources[2].resource },
                result: { resource: resources[3].resource },
                options: { pinned: true }
            };
            editors.push(mergeEditor);
        }
        else if (diffMode && isResourceEditorInput(resources[0]) && isResourceEditorInput(resources[1])) {
            const diffEditor = {
                original: { resource: resources[0].resource },
                modified: { resource: resources[1].resource },
                options: { pinned: true }
            };
            editors.push(diffEditor);
        }
        else {
            editors.push(...resources);
        }
        return this.editorService.openEditors(editors, undefined, { validateTrust: true });
    }
};
NativeWindow = __decorate([
    __param(0, IEditorService),
    __param(1, IEditorGroupsService),
    __param(2, IConfigurationService),
    __param(3, ITitleService),
    __param(4, IWorkbenchThemeService),
    __param(5, INotificationService),
    __param(6, ICommandService),
    __param(7, IKeybindingService),
    __param(8, ITelemetryService),
    __param(9, IWorkspaceEditingService),
    __param(10, IFileService),
    __param(11, IMenuService),
    __param(12, ILifecycleService),
    __param(13, IIntegrityService),
    __param(14, INativeWorkbenchEnvironmentService),
    __param(15, IAccessibilityService),
    __param(16, IWorkspaceContextService),
    __param(17, IOpenerService),
    __param(18, INativeHostService),
    __param(19, ITunnelService),
    __param(20, IWorkbenchLayoutService),
    __param(21, IWorkingCopyService),
    __param(22, IFilesConfigurationService),
    __param(23, IProductService),
    __param(24, IRemoteAuthorityResolverService),
    __param(25, IDialogService),
    __param(26, IStorageService),
    __param(27, ILogService),
    __param(28, IInstantiationService),
    __param(29, ISharedProcessService),
    __param(30, IProgressService),
    __param(31, ILabelService),
    __param(32, IBannerService),
    __param(33, IUriIdentityService)
], NativeWindow);
export { NativeWindow };
