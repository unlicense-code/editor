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
import { app, BrowserWindow } from 'electron';
import { Promises } from 'vs/base/node/pfs';
import { hostname, release } from 'os';
import { coalesce, distinct, firstOrDefault } from 'vs/base/common/arrays';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter, Event } from 'vs/base/common/event';
import { isWindowsDriveLetter, parseLineAndColumnAware, sanitizeFilePath, toSlashes } from 'vs/base/common/extpath';
import { once } from 'vs/base/common/functional';
import { getPathLabel, mnemonicButtonLabel } from 'vs/base/common/labels';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { basename, join, normalize, posix } from 'vs/base/common/path';
import { getMarks, mark } from 'vs/base/common/performance';
import { isMacintosh, isWindows, OS } from 'vs/base/common/platform';
import { cwd } from 'vs/base/common/process';
import { extUriBiasedIgnorePathCase, isEqualAuthority, normalizePath, originalFSPath, removeTrailingPathSeparator } from 'vs/base/common/resources';
import { assertIsDefined, withNullAsUndefined } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IBackupMainService } from 'vs/platform/backup/electron-main/backup';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { FileType, IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import product from 'vs/platform/product/common/product';
import { IProductService } from 'vs/platform/product/common/productService';
import { IProtocolMainService } from 'vs/platform/protocol/electron-main/protocol';
import { getRemoteAuthority } from 'vs/platform/remote/common/remoteHosts';
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { isFileToOpen, isFolderToOpen, isWorkspaceToOpen } from 'vs/platform/window/common/window';
import { CodeWindow } from 'vs/platform/windows/electron-main/windowImpl';
import { findWindowOnExtensionDevelopmentPath, findWindowOnFile, findWindowOnWorkspaceOrFolder } from 'vs/platform/windows/electron-main/windowsFinder';
import { WindowsStateHandler } from 'vs/platform/windows/electron-main/windowsStateHandler';
import { hasWorkspaceFileExtension, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { createEmptyWorkspaceIdentifier, getSingleFolderWorkspaceIdentifier, getWorkspaceIdentifier } from 'vs/platform/workspaces/node/workspaces';
import { IWorkspacesHistoryMainService } from 'vs/platform/workspaces/electron-main/workspacesHistoryMainService';
import { IWorkspacesManagementMainService } from 'vs/platform/workspaces/electron-main/workspacesManagementMainService';
import { IThemeMainService } from 'vs/platform/theme/electron-main/themeMainService';
import { IPolicyService } from 'vs/platform/policy/common/policy';
import { IUserDataProfilesMainService } from 'vs/platform/userDataProfile/electron-main/userDataProfile';
function isWorkspacePathToOpen(path) {
    return isWorkspaceIdentifier(path?.workspace);
}
function isSingleFolderWorkspacePathToOpen(path) {
    return isSingleFolderWorkspaceIdentifier(path?.workspace);
}
//#endregion
let WindowsMainService = class WindowsMainService extends Disposable {
    machineId;
    initialUserEnv;
    logService;
    stateMainService;
    policyService;
    environmentMainService;
    userDataProfilesMainService;
    lifecycleMainService;
    backupMainService;
    configurationService;
    workspacesHistoryMainService;
    workspacesManagementMainService;
    instantiationService;
    dialogMainService;
    fileService;
    productService;
    protocolMainService;
    themeMainService;
    static WINDOWS = [];
    _onDidOpenWindow = this._register(new Emitter());
    onDidOpenWindow = this._onDidOpenWindow.event;
    _onDidSignalReadyWindow = this._register(new Emitter());
    onDidSignalReadyWindow = this._onDidSignalReadyWindow.event;
    _onDidDestroyWindow = this._register(new Emitter());
    onDidDestroyWindow = this._onDidDestroyWindow.event;
    _onDidChangeWindowsCount = this._register(new Emitter());
    onDidChangeWindowsCount = this._onDidChangeWindowsCount.event;
    _onDidTriggerSystemContextMenu = this._register(new Emitter());
    onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
    windowsStateHandler = this._register(new WindowsStateHandler(this, this.stateMainService, this.lifecycleMainService, this.logService, this.configurationService));
    constructor(machineId, initialUserEnv, logService, stateMainService, policyService, environmentMainService, userDataProfilesMainService, lifecycleMainService, backupMainService, configurationService, workspacesHistoryMainService, workspacesManagementMainService, instantiationService, dialogMainService, fileService, productService, protocolMainService, themeMainService) {
        super();
        this.machineId = machineId;
        this.initialUserEnv = initialUserEnv;
        this.logService = logService;
        this.stateMainService = stateMainService;
        this.policyService = policyService;
        this.environmentMainService = environmentMainService;
        this.userDataProfilesMainService = userDataProfilesMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.backupMainService = backupMainService;
        this.configurationService = configurationService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.instantiationService = instantiationService;
        this.dialogMainService = dialogMainService;
        this.fileService = fileService;
        this.productService = productService;
        this.protocolMainService = protocolMainService;
        this.themeMainService = themeMainService;
        this.registerListeners();
    }
    registerListeners() {
        // Signal a window is ready after having entered a workspace
        this._register(this.workspacesManagementMainService.onDidEnterWorkspace(event => this._onDidSignalReadyWindow.fire(event.window)));
        // Update valid roots in protocol service for extension dev windows
        this._register(this.onDidSignalReadyWindow(window => {
            if (window.config?.extensionDevelopmentPath || window.config?.extensionTestsPath) {
                const disposables = new DisposableStore();
                disposables.add(Event.any(window.onDidClose, window.onDidDestroy)(() => disposables.dispose()));
                // Allow access to extension development path
                if (window.config.extensionDevelopmentPath) {
                    for (const extensionDevelopmentPath of window.config.extensionDevelopmentPath) {
                        disposables.add(this.protocolMainService.addValidFileRoot(extensionDevelopmentPath));
                    }
                }
                // Allow access to extension tests path
                if (window.config.extensionTestsPath) {
                    disposables.add(this.protocolMainService.addValidFileRoot(window.config.extensionTestsPath));
                }
            }
        }));
    }
    openEmptyWindow(openConfig, options) {
        const cli = this.environmentMainService.args;
        const remoteAuthority = options?.remoteAuthority || undefined;
        const forceEmpty = true;
        const forceReuseWindow = options?.forceReuseWindow;
        const forceNewWindow = !forceReuseWindow;
        return this.open({ ...openConfig, cli, forceEmpty, forceNewWindow, forceReuseWindow, remoteAuthority });
    }
    openExistingWindow(window, openConfig) {
        // Bring window to front
        window.focus();
        // Handle --wait
        this.handleWaitMarkerFile(openConfig, [window]);
    }
    async open(openConfig) {
        this.logService.trace('windowsManager#open');
        if (openConfig.addMode && (openConfig.initialStartup || !this.getLastActiveWindow())) {
            openConfig.addMode = false; // Make sure addMode is only enabled if we have an active window
        }
        const foldersToAdd = [];
        const foldersToOpen = [];
        const workspacesToOpen = [];
        const untitledWorkspacesToRestore = [];
        const emptyWindowsWithBackupsToRestore = [];
        let filesToOpen;
        let emptyToOpen = 0;
        // Identify things to open from open config
        const pathsToOpen = await this.getPathsToOpen(openConfig);
        this.logService.trace('windowsManager#open pathsToOpen', pathsToOpen);
        for (const path of pathsToOpen) {
            if (isSingleFolderWorkspacePathToOpen(path)) {
                if (openConfig.addMode) {
                    // When run with --add, take the folders that are to be opened as
                    // folders that should be added to the currently active window.
                    foldersToAdd.push(path);
                }
                else {
                    foldersToOpen.push(path);
                }
            }
            else if (isWorkspacePathToOpen(path)) {
                workspacesToOpen.push(path);
            }
            else if (path.fileUri) {
                if (!filesToOpen) {
                    filesToOpen = { filesToOpenOrCreate: [], filesToDiff: [], filesToMerge: [], remoteAuthority: path.remoteAuthority };
                }
                filesToOpen.filesToOpenOrCreate.push(path);
            }
            else if (path.backupPath) {
                emptyWindowsWithBackupsToRestore.push({ backupFolder: basename(path.backupPath), remoteAuthority: path.remoteAuthority });
            }
            else {
                emptyToOpen++;
            }
        }
        // When run with --diff, take the first 2 files to open as files to diff
        if (openConfig.diffMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length >= 2) {
            filesToOpen.filesToDiff = filesToOpen.filesToOpenOrCreate.slice(0, 2);
            filesToOpen.filesToOpenOrCreate = [];
        }
        // When run with --merge, take the first 4 files to open as files to merge
        if (openConfig.mergeMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length === 4) {
            filesToOpen.filesToMerge = filesToOpen.filesToOpenOrCreate.slice(0, 4);
            filesToOpen.filesToOpenOrCreate = [];
            filesToOpen.filesToDiff = [];
        }
        // When run with --wait, make sure we keep the paths to wait for
        if (filesToOpen && openConfig.waitMarkerFileURI) {
            filesToOpen.filesToWait = { paths: coalesce([...filesToOpen.filesToDiff, filesToOpen.filesToMerge[3] /* [3] is the resulting merge file */, ...filesToOpen.filesToOpenOrCreate]), waitMarkerFileUri: openConfig.waitMarkerFileURI };
        }
        // These are windows to restore because of hot-exit or from previous session (only performed once on startup!)
        if (openConfig.initialStartup) {
            // Untitled workspaces are always restored
            untitledWorkspacesToRestore.push(...this.workspacesManagementMainService.getUntitledWorkspaces());
            workspacesToOpen.push(...untitledWorkspacesToRestore);
            // Empty windows with backups are always restored
            emptyWindowsWithBackupsToRestore.push(...this.backupMainService.getEmptyWindowBackups());
        }
        else {
            emptyWindowsWithBackupsToRestore.length = 0;
        }
        // Open based on config
        const { windows: usedWindows, filesOpenedInWindow } = await this.doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyWindowsWithBackupsToRestore, emptyToOpen, filesToOpen, foldersToAdd);
        this.logService.trace(`windowsManager#open used window count ${usedWindows.length} (workspacesToOpen: ${workspacesToOpen.length}, foldersToOpen: ${foldersToOpen.length}, emptyToRestore: ${emptyWindowsWithBackupsToRestore.length}, emptyToOpen: ${emptyToOpen})`);
        // Make sure to pass focus to the most relevant of the windows if we open multiple
        if (usedWindows.length > 1) {
            // 1.) focus window we opened files in always with highest priority
            if (filesOpenedInWindow) {
                filesOpenedInWindow.focus();
            }
            // Otherwise, find a good window based on open params
            else {
                const focusLastActive = this.windowsStateHandler.state.lastActiveWindow && !openConfig.forceEmpty && !openConfig.cli._.length && !openConfig.cli['file-uri'] && !openConfig.cli['folder-uri'] && !(openConfig.urisToOpen && openConfig.urisToOpen.length);
                let focusLastOpened = true;
                let focusLastWindow = true;
                // 2.) focus last active window if we are not instructed to open any paths
                if (focusLastActive) {
                    const lastActiveWindow = usedWindows.filter(window => this.windowsStateHandler.state.lastActiveWindow && window.backupPath === this.windowsStateHandler.state.lastActiveWindow.backupPath);
                    if (lastActiveWindow.length) {
                        lastActiveWindow[0].focus();
                        focusLastOpened = false;
                        focusLastWindow = false;
                    }
                }
                // 3.) if instructed to open paths, focus last window which is not restored
                if (focusLastOpened) {
                    for (let i = usedWindows.length - 1; i >= 0; i--) {
                        const usedWindow = usedWindows[i];
                        if ((usedWindow.openedWorkspace && untitledWorkspacesToRestore.some(workspace => usedWindow.openedWorkspace && workspace.workspace.id === usedWindow.openedWorkspace.id)) || // skip over restored workspace
                            (usedWindow.backupPath && emptyWindowsWithBackupsToRestore.some(empty => usedWindow.backupPath && empty.backupFolder === basename(usedWindow.backupPath))) // skip over restored empty window
                        ) {
                            continue;
                        }
                        usedWindow.focus();
                        focusLastWindow = false;
                        break;
                    }
                }
                // 4.) finally, always ensure to have at least last used window focused
                if (focusLastWindow) {
                    usedWindows[usedWindows.length - 1].focus();
                }
            }
        }
        // Remember in recent document list (unless this opens for extension development)
        // Also do not add paths when files are opened for diffing or merging, only if opened individually
        const isDiff = filesToOpen && filesToOpen.filesToDiff.length > 0;
        const isMerge = filesToOpen && filesToOpen.filesToMerge.length > 0;
        if (!usedWindows.some(window => window.isExtensionDevelopmentHost) && !isDiff && !isMerge && !openConfig.noRecentEntry) {
            const recents = [];
            for (const pathToOpen of pathsToOpen) {
                if (isWorkspacePathToOpen(pathToOpen) && !pathToOpen.transient /* never add transient workspaces to history */) {
                    recents.push({ label: pathToOpen.label, workspace: pathToOpen.workspace, remoteAuthority: pathToOpen.remoteAuthority });
                }
                else if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                    recents.push({ label: pathToOpen.label, folderUri: pathToOpen.workspace.uri, remoteAuthority: pathToOpen.remoteAuthority });
                }
                else if (pathToOpen.fileUri) {
                    recents.push({ label: pathToOpen.label, fileUri: pathToOpen.fileUri, remoteAuthority: pathToOpen.remoteAuthority });
                }
            }
            this.workspacesHistoryMainService.addRecentlyOpened(recents);
        }
        // Handle --wait
        this.handleWaitMarkerFile(openConfig, usedWindows);
        return usedWindows;
    }
    handleWaitMarkerFile(openConfig, usedWindows) {
        // If we got started with --wait from the CLI, we need to signal to the outside when the window
        // used for the edit operation is closed or loaded to a different folder so that the waiting
        // process can continue. We do this by deleting the waitMarkerFilePath.
        const waitMarkerFileURI = openConfig.waitMarkerFileURI;
        if (openConfig.context === 0 /* OpenContext.CLI */ && waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
            (async () => {
                await usedWindows[0].whenClosedOrLoaded;
                try {
                    await this.fileService.del(waitMarkerFileURI);
                }
                catch (error) {
                    // ignore - could have been deleted from the window already
                }
            })();
        }
    }
    async doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyToRestore, emptyToOpen, filesToOpen, foldersToAdd) {
        // Keep track of used windows and remember
        // if files have been opened in one of them
        const usedWindows = [];
        let filesOpenedInWindow = undefined;
        function addUsedWindow(window, openedFiles) {
            usedWindows.push(window);
            if (openedFiles) {
                filesOpenedInWindow = window;
                filesToOpen = undefined; // reset `filesToOpen` since files have been opened
            }
        }
        // Settings can decide if files/folders open in new window or not
        let { openFolderInNewWindow, openFilesInNewWindow } = this.shouldOpenNewWindow(openConfig);
        // Handle folders to add by looking for the last active workspace (not on initial startup)
        if (!openConfig.initialStartup && foldersToAdd.length > 0) {
            const authority = foldersToAdd[0].remoteAuthority;
            const lastActiveWindow = this.getLastActiveWindowForAuthority(authority);
            if (lastActiveWindow) {
                addUsedWindow(this.doAddFoldersToExistingWindow(lastActiveWindow, foldersToAdd.map(folderToAdd => folderToAdd.workspace.uri)));
            }
        }
        // Handle files to open/diff/merge or to create when we dont open a folder and we do not restore any
        // folder/untitled from hot-exit by trying to open them in the window that fits best
        const potentialNewWindowsCount = foldersToOpen.length + workspacesToOpen.length + emptyToRestore.length;
        if (filesToOpen && potentialNewWindowsCount === 0) {
            // Find suitable window or folder path to open files in
            const fileToCheck = filesToOpen.filesToOpenOrCreate[0] || filesToOpen.filesToDiff[0] || filesToOpen.filesToMerge[3] /* [3] is the resulting merge file */;
            // only look at the windows with correct authority
            const windows = this.getWindows().filter(window => filesToOpen && isEqualAuthority(window.remoteAuthority, filesToOpen.remoteAuthority));
            // figure out a good window to open the files in if any
            // with a fallback to the last active window.
            //
            // in case `openFilesInNewWindow` is enforced, we skip
            // this step.
            let windowToUseForFiles = undefined;
            if (fileToCheck?.fileUri && !openFilesInNewWindow) {
                if (openConfig.context === 4 /* OpenContext.DESKTOP */ || openConfig.context === 0 /* OpenContext.CLI */ || openConfig.context === 1 /* OpenContext.DOCK */) {
                    windowToUseForFiles = await findWindowOnFile(windows, fileToCheck.fileUri, async (workspace) => workspace.configPath.scheme === Schemas.file ? this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath) : undefined);
                }
                if (!windowToUseForFiles) {
                    windowToUseForFiles = this.doGetLastActiveWindow(windows);
                }
            }
            // We found a window to open the files in
            if (windowToUseForFiles) {
                // Window is workspace
                if (isWorkspaceIdentifier(windowToUseForFiles.openedWorkspace)) {
                    workspacesToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                }
                // Window is single folder
                else if (isSingleFolderWorkspaceIdentifier(windowToUseForFiles.openedWorkspace)) {
                    foldersToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                }
                // Window is empty
                else {
                    addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowToUseForFiles, filesToOpen), true);
                }
            }
            // Finally, if no window or folder is found, just open the files in an empty window
            else {
                addUsedWindow(await this.openInBrowserWindow({
                    userEnv: openConfig.userEnv,
                    cli: openConfig.cli,
                    initialStartup: openConfig.initialStartup,
                    filesToOpen,
                    forceNewWindow: true,
                    remoteAuthority: filesToOpen.remoteAuthority,
                    forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
                    forceProfile: openConfig.forceProfile,
                    forceTempProfile: openConfig.forceTempProfile
                }), true);
            }
        }
        // Handle workspaces to open (instructed and to restore)
        const allWorkspacesToOpen = distinct(workspacesToOpen, workspace => workspace.workspace.id); // prevent duplicates
        if (allWorkspacesToOpen.length > 0) {
            // Check for existing instances
            const windowsOnWorkspace = coalesce(allWorkspacesToOpen.map(workspaceToOpen => findWindowOnWorkspaceOrFolder(this.getWindows(), workspaceToOpen.workspace.configPath)));
            if (windowsOnWorkspace.length > 0) {
                const windowOnWorkspace = windowsOnWorkspace[0];
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, windowOnWorkspace.remoteAuthority) ? filesToOpen : undefined;
                // Do open files
                addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnWorkspace, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true; // any other folders to open must open in new window then
            }
            // Open remaining ones
            for (const workspaceToOpen of allWorkspacesToOpen) {
                if (windowsOnWorkspace.some(window => window.openedWorkspace && window.openedWorkspace.id === workspaceToOpen.workspace.id)) {
                    continue; // ignore folders that are already open
                }
                const remoteAuthority = workspaceToOpen.remoteAuthority;
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                // Do open folder
                addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, workspaceToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true; // any other folders to open must open in new window then
            }
        }
        // Handle folders to open (instructed and to restore)
        const allFoldersToOpen = distinct(foldersToOpen, folder => extUriBiasedIgnorePathCase.getComparisonKey(folder.workspace.uri)); // prevent duplicates
        if (allFoldersToOpen.length > 0) {
            // Check for existing instances
            const windowsOnFolderPath = coalesce(allFoldersToOpen.map(folderToOpen => findWindowOnWorkspaceOrFolder(this.getWindows(), folderToOpen.workspace.uri)));
            if (windowsOnFolderPath.length > 0) {
                const windowOnFolderPath = windowsOnFolderPath[0];
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, windowOnFolderPath.remoteAuthority) ? filesToOpen : undefined;
                // Do open files
                addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnFolderPath, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true; // any other folders to open must open in new window then
            }
            // Open remaining ones
            for (const folderToOpen of allFoldersToOpen) {
                if (windowsOnFolderPath.some(window => isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderToOpen.workspace.uri))) {
                    continue; // ignore folders that are already open
                }
                const remoteAuthority = folderToOpen.remoteAuthority;
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                // Do open folder
                addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, folderToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true; // any other folders to open must open in new window then
            }
        }
        // Handle empty to restore
        const allEmptyToRestore = distinct(emptyToRestore, info => info.backupFolder); // prevent duplicates
        if (allEmptyToRestore.length > 0) {
            for (const emptyWindowBackupInfo of allEmptyToRestore) {
                const remoteAuthority = emptyWindowBackupInfo.remoteAuthority;
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                addUsedWindow(await this.doOpenEmpty(openConfig, true, remoteAuthority, filesToOpenInWindow, emptyWindowBackupInfo), !!filesToOpenInWindow);
                openFolderInNewWindow = true; // any other folders to open must open in new window then
            }
        }
        // Handle empty to open (only if no other window opened)
        if (usedWindows.length === 0 || filesToOpen) {
            if (filesToOpen && !emptyToOpen) {
                emptyToOpen++;
            }
            const remoteAuthority = filesToOpen ? filesToOpen.remoteAuthority : openConfig.remoteAuthority;
            for (let i = 0; i < emptyToOpen; i++) {
                addUsedWindow(await this.doOpenEmpty(openConfig, openFolderInNewWindow, remoteAuthority, filesToOpen), !!filesToOpen);
                // any other window to open must open in new window then
                openFolderInNewWindow = true;
            }
        }
        return { windows: distinct(usedWindows), filesOpenedInWindow };
    }
    doOpenFilesInExistingWindow(configuration, window, filesToOpen) {
        this.logService.trace('windowsManager#doOpenFilesInExistingWindow', { filesToOpen });
        window.focus(); // make sure window has focus
        const params = {
            filesToOpenOrCreate: filesToOpen?.filesToOpenOrCreate,
            filesToDiff: filesToOpen?.filesToDiff,
            filesToMerge: filesToOpen?.filesToMerge,
            filesToWait: filesToOpen?.filesToWait,
            termProgram: configuration?.userEnv?.['TERM_PROGRAM']
        };
        window.sendWhenReady('vscode:openFiles', CancellationToken.None, params);
        return window;
    }
    doAddFoldersToExistingWindow(window, foldersToAdd) {
        this.logService.trace('windowsManager#doAddFoldersToExistingWindow', { foldersToAdd });
        window.focus(); // make sure window has focus
        const request = { foldersToAdd };
        window.sendWhenReady('vscode:addFolders', CancellationToken.None, request);
        return window;
    }
    doOpenEmpty(openConfig, forceNewWindow, remoteAuthority, filesToOpen, emptyWindowBackupInfo) {
        this.logService.trace('windowsManager#doOpenEmpty', { restore: !!emptyWindowBackupInfo, remoteAuthority, filesToOpen, forceNewWindow });
        let windowToUse;
        if (!forceNewWindow && typeof openConfig.contextWindowId === 'number') {
            windowToUse = this.getWindowById(openConfig.contextWindowId); // fix for https://github.com/microsoft/vscode/issues/97172
        }
        return this.openInBrowserWindow({
            userEnv: openConfig.userEnv,
            cli: openConfig.cli,
            initialStartup: openConfig.initialStartup,
            remoteAuthority,
            forceNewWindow,
            forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
            filesToOpen,
            windowToUse,
            emptyWindowBackupInfo,
            forceProfile: openConfig.forceProfile,
            forceTempProfile: openConfig.forceTempProfile
        });
    }
    doOpenFolderOrWorkspace(openConfig, folderOrWorkspace, forceNewWindow, filesToOpen, windowToUse) {
        this.logService.trace('windowsManager#doOpenFolderOrWorkspace', { folderOrWorkspace, filesToOpen });
        if (!forceNewWindow && !windowToUse && typeof openConfig.contextWindowId === 'number') {
            windowToUse = this.getWindowById(openConfig.contextWindowId); // fix for https://github.com/microsoft/vscode/issues/49587
        }
        return this.openInBrowserWindow({
            workspace: folderOrWorkspace.workspace,
            userEnv: openConfig.userEnv,
            cli: openConfig.cli,
            initialStartup: openConfig.initialStartup,
            remoteAuthority: folderOrWorkspace.remoteAuthority,
            forceNewWindow,
            forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
            filesToOpen,
            windowToUse,
            forceProfile: openConfig.forceProfile,
            forceTempProfile: openConfig.forceTempProfile
        });
    }
    async getPathsToOpen(openConfig) {
        let pathsToOpen;
        let isCommandLineOrAPICall = false;
        let restoredWindows = false;
        // Extract paths: from API
        if (openConfig.urisToOpen && openConfig.urisToOpen.length > 0) {
            pathsToOpen = await this.doExtractPathsFromAPI(openConfig);
            isCommandLineOrAPICall = true;
        }
        // Check for force empty
        else if (openConfig.forceEmpty) {
            pathsToOpen = [Object.create(null)];
        }
        // Extract paths: from CLI
        else if (openConfig.cli._.length || openConfig.cli['folder-uri'] || openConfig.cli['file-uri']) {
            pathsToOpen = await this.doExtractPathsFromCLI(openConfig.cli);
            if (pathsToOpen.length === 0) {
                pathsToOpen.push(Object.create(null)); // add an empty window if we did not have windows to open from command line
            }
            isCommandLineOrAPICall = true;
        }
        // Extract paths: from previous session
        else {
            pathsToOpen = await this.doGetPathsFromLastSession();
            if (pathsToOpen.length === 0) {
                pathsToOpen.push(Object.create(null)); // add an empty window if we did not have windows to restore
            }
            restoredWindows = true;
        }
        // Convert multiple folders into workspace (if opened via API or CLI)
        // This will ensure to open these folders in one window instead of multiple
        // If we are in `addMode`, we should not do this because in that case all
        // folders should be added to the existing window.
        if (!openConfig.addMode && isCommandLineOrAPICall) {
            const foldersToOpen = pathsToOpen.filter(path => isSingleFolderWorkspacePathToOpen(path));
            if (foldersToOpen.length > 1) {
                const remoteAuthority = foldersToOpen[0].remoteAuthority;
                if (foldersToOpen.every(folderToOpen => isEqualAuthority(folderToOpen.remoteAuthority, remoteAuthority))) { // only if all folder have the same authority
                    const workspace = await this.workspacesManagementMainService.createUntitledWorkspace(foldersToOpen.map(folder => ({ uri: folder.workspace.uri })));
                    // Add workspace and remove folders thereby
                    pathsToOpen.push({ workspace, remoteAuthority });
                    pathsToOpen = pathsToOpen.filter(path => !isSingleFolderWorkspacePathToOpen(path));
                }
            }
        }
        // Check for `window.startup` setting to include all windows
        // from the previous session if this is the initial startup and we have
        // not restored windows already otherwise.
        // Use `unshift` to ensure any new window to open comes last
        // for proper focus treatment.
        if (openConfig.initialStartup && !restoredWindows && this.configurationService.getValue('window')?.restoreWindows === 'preserve') {
            const lastSessionPaths = await this.doGetPathsFromLastSession();
            pathsToOpen.unshift(...lastSessionPaths.filter(path => isWorkspacePathToOpen(path) || isSingleFolderWorkspacePathToOpen(path) || path.backupPath));
        }
        return pathsToOpen;
    }
    async doExtractPathsFromAPI(openConfig) {
        const pathResolveOptions = {
            gotoLineMode: openConfig.gotoLineMode,
            remoteAuthority: openConfig.remoteAuthority
        };
        const pathsToOpen = await Promise.all(coalesce(openConfig.urisToOpen || []).map(async (pathToOpen) => {
            const path = await this.resolveOpenable(pathToOpen, pathResolveOptions);
            // Path exists
            if (path) {
                path.label = pathToOpen.label;
                return path;
            }
            // Path does not exist: show a warning box
            const uri = this.resourceFromOpenable(pathToOpen);
            const options = {
                title: this.productService.nameLong,
                type: 'info',
                buttons: [mnemonicButtonLabel(localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"))],
                defaultId: 0,
                message: uri.scheme === Schemas.file ? localize('pathNotExistTitle', "Path does not exist") : localize('uriInvalidTitle', "URI can not be opened"),
                detail: uri.scheme === Schemas.file ?
                    localize('pathNotExistDetail', "The path '{0}' does not exist on this computer.", getPathLabel(uri, { os: OS, tildify: this.environmentMainService })) :
                    localize('uriInvalidDetail', "The URI '{0}' is not valid and can not be opened.", uri.toString(true)),
                noLink: true
            };
            this.dialogMainService.showMessageBox(options, withNullAsUndefined(BrowserWindow.getFocusedWindow()));
            return undefined;
        }));
        return coalesce(pathsToOpen);
    }
    async doExtractPathsFromCLI(cli) {
        const pathsToOpen = [];
        const pathResolveOptions = {
            ignoreFileNotFound: true,
            gotoLineMode: cli.goto,
            remoteAuthority: cli.remote || undefined,
            forceOpenWorkspaceAsFile: 
            // special case diff / merge mode to force open
            // workspace as file
            // https://github.com/microsoft/vscode/issues/149731
            cli.diff && cli._.length === 2 ||
                cli.merge && cli._.length === 4
        };
        // folder uris
        const folderUris = cli['folder-uri'];
        if (folderUris) {
            const resolvedFolderUris = await Promise.all(folderUris.map(rawFolderUri => {
                const folderUri = this.cliArgToUri(rawFolderUri);
                if (!folderUri) {
                    return undefined;
                }
                return this.resolveOpenable({ folderUri }, pathResolveOptions);
            }));
            pathsToOpen.push(...coalesce(resolvedFolderUris));
        }
        // file uris
        const fileUris = cli['file-uri'];
        if (fileUris) {
            const resolvedFileUris = await Promise.all(fileUris.map(rawFileUri => {
                const fileUri = this.cliArgToUri(rawFileUri);
                if (!fileUri) {
                    return undefined;
                }
                return this.resolveOpenable(hasWorkspaceFileExtension(rawFileUri) ? { workspaceUri: fileUri } : { fileUri }, pathResolveOptions);
            }));
            pathsToOpen.push(...coalesce(resolvedFileUris));
        }
        // folder or file paths
        const resolvedCliPaths = await Promise.all(cli._.map(cliPath => {
            return pathResolveOptions.remoteAuthority ? this.doResolveRemotePath(cliPath, pathResolveOptions) : this.doResolveFilePath(cliPath, pathResolveOptions);
        }));
        pathsToOpen.push(...coalesce(resolvedCliPaths));
        return pathsToOpen;
    }
    cliArgToUri(arg) {
        try {
            const uri = URI.parse(arg);
            if (!uri.scheme) {
                this.logService.error(`Invalid URI input string, scheme missing: ${arg}`);
                return undefined;
            }
            return uri;
        }
        catch (e) {
            this.logService.error(`Invalid URI input string: ${arg}, ${e.message}`);
        }
        return undefined;
    }
    async doGetPathsFromLastSession() {
        const restoreWindowsSetting = this.getRestoreWindowsSetting();
        switch (restoreWindowsSetting) {
            // none: no window to restore
            case 'none':
                return [];
            // one: restore last opened workspace/folder or empty window
            // all: restore all windows
            // folders: restore last opened folders only
            case 'one':
            case 'all':
            case 'preserve':
            case 'folders': {
                // Collect previously opened windows
                const lastSessionWindows = [];
                if (restoreWindowsSetting !== 'one') {
                    lastSessionWindows.push(...this.windowsStateHandler.state.openedWindows);
                }
                if (this.windowsStateHandler.state.lastActiveWindow) {
                    lastSessionWindows.push(this.windowsStateHandler.state.lastActiveWindow);
                }
                const pathsToOpen = await Promise.all(lastSessionWindows.map(async (lastSessionWindow) => {
                    // Workspaces
                    if (lastSessionWindow.workspace) {
                        const pathToOpen = await this.resolveOpenable({ workspaceUri: lastSessionWindow.workspace.configPath }, { remoteAuthority: lastSessionWindow.remoteAuthority, rejectTransientWorkspaces: true /* https://github.com/microsoft/vscode/issues/119695 */ });
                        if (isWorkspacePathToOpen(pathToOpen)) {
                            return pathToOpen;
                        }
                    }
                    // Folders
                    else if (lastSessionWindow.folderUri) {
                        const pathToOpen = await this.resolveOpenable({ folderUri: lastSessionWindow.folderUri }, { remoteAuthority: lastSessionWindow.remoteAuthority });
                        if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                            return pathToOpen;
                        }
                    }
                    // Empty window, potentially editors open to be restored
                    else if (restoreWindowsSetting !== 'folders' && lastSessionWindow.backupPath) {
                        return { backupPath: lastSessionWindow.backupPath, remoteAuthority: lastSessionWindow.remoteAuthority };
                    }
                    return undefined;
                }));
                return coalesce(pathsToOpen);
            }
        }
    }
    getRestoreWindowsSetting() {
        let restoreWindows;
        if (this.lifecycleMainService.wasRestarted) {
            restoreWindows = 'all'; // always reopen all windows when an update was applied
        }
        else {
            const windowConfig = this.configurationService.getValue('window');
            restoreWindows = windowConfig?.restoreWindows || 'all'; // by default restore all windows
            if (!['preserve', 'all', 'folders', 'one', 'none'].includes(restoreWindows)) {
                restoreWindows = 'all'; // by default restore all windows
            }
        }
        return restoreWindows;
    }
    async resolveOpenable(openable, options = Object.create(null)) {
        // handle file:// openables with some extra validation
        const uri = this.resourceFromOpenable(openable);
        if (uri.scheme === Schemas.file) {
            if (isFileToOpen(openable)) {
                options = { ...options, forceOpenWorkspaceAsFile: true };
            }
            return this.doResolveFilePath(uri.fsPath, options);
        }
        // handle non file:// openables
        return this.doResolveRemoteOpenable(openable, options);
    }
    doResolveRemoteOpenable(openable, options) {
        let uri = this.resourceFromOpenable(openable);
        // use remote authority from vscode
        const remoteAuthority = getRemoteAuthority(uri) || options.remoteAuthority;
        // normalize URI
        uri = removeTrailingPathSeparator(normalizePath(uri));
        // File
        if (isFileToOpen(openable)) {
            if (options.gotoLineMode) {
                const { path, line, column } = parseLineAndColumnAware(uri.path);
                return {
                    fileUri: uri.with({ path }),
                    options: {
                        selection: line ? { startLineNumber: line, startColumn: column || 1 } : undefined
                    },
                    remoteAuthority
                };
            }
            return { fileUri: uri, remoteAuthority };
        }
        // Workspace
        else if (isWorkspaceToOpen(openable)) {
            return { workspace: getWorkspaceIdentifier(uri), remoteAuthority };
        }
        // Folder
        return { workspace: getSingleFolderWorkspaceIdentifier(uri), remoteAuthority };
    }
    resourceFromOpenable(openable) {
        if (isWorkspaceToOpen(openable)) {
            return openable.workspaceUri;
        }
        if (isFolderToOpen(openable)) {
            return openable.folderUri;
        }
        return openable.fileUri;
    }
    async doResolveFilePath(path, options) {
        // Extract line/col information from path
        let lineNumber;
        let columnNumber;
        if (options.gotoLineMode) {
            ({ path, line: lineNumber, column: columnNumber } = parseLineAndColumnAware(path));
        }
        // Ensure the path is normalized and absolute
        path = sanitizeFilePath(normalize(path), cwd());
        try {
            const pathStat = await Promises.stat(path);
            // File
            if (pathStat.isFile()) {
                // Workspace (unless disabled via flag)
                if (!options.forceOpenWorkspaceAsFile) {
                    const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(URI.file(path));
                    if (workspace) {
                        // If the workspace is transient and we are to ignore
                        // transient workspaces, reject it.
                        if (workspace.transient && options.rejectTransientWorkspaces) {
                            return undefined;
                        }
                        return {
                            workspace: { id: workspace.id, configPath: workspace.configPath },
                            type: FileType.File,
                            exists: true,
                            remoteAuthority: workspace.remoteAuthority,
                            transient: workspace.transient
                        };
                    }
                }
                return {
                    fileUri: URI.file(path),
                    type: FileType.File,
                    exists: true,
                    options: {
                        selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                    }
                };
            }
            // Folder
            else if (pathStat.isDirectory()) {
                return {
                    workspace: getSingleFolderWorkspaceIdentifier(URI.file(path), pathStat),
                    type: FileType.Directory,
                    exists: true
                };
            }
            // Special device: in POSIX environments, we may get /dev/null passed
            // in (for example git uses it to signal one side of a diff does not
            // exist). In that special case, treat it like a file to support this
            // scenario ()
            else if (!isWindows && path === '/dev/null') {
                return {
                    fileUri: URI.file(path),
                    type: FileType.File,
                    exists: true
                };
            }
        }
        catch (error) {
            const fileUri = URI.file(path);
            // since file does not seem to exist anymore, remove from recent
            this.workspacesHistoryMainService.removeRecentlyOpened([fileUri]);
            // assume this is a file that does not yet exist
            if (options.ignoreFileNotFound) {
                return {
                    fileUri,
                    type: FileType.File,
                    exists: false
                };
            }
        }
        return undefined;
    }
    doResolveRemotePath(path, options) {
        const first = path.charCodeAt(0);
        const remoteAuthority = options.remoteAuthority;
        // Extract line/col information from path
        let lineNumber;
        let columnNumber;
        if (options.gotoLineMode) {
            ({ path, line: lineNumber, column: columnNumber } = parseLineAndColumnAware(path));
        }
        // make absolute
        if (first !== 47 /* CharCode.Slash */) {
            if (isWindowsDriveLetter(first) && path.charCodeAt(path.charCodeAt(1)) === 58 /* CharCode.Colon */) {
                path = toSlashes(path);
            }
            path = `/${path}`;
        }
        const uri = URI.from({ scheme: Schemas.vscodeRemote, authority: remoteAuthority, path: path });
        // guess the file type:
        // - if it ends with a slash it's a folder
        // - if in goto line mode or if it has a file extension, it's a file or a workspace
        // - by defaults it's a folder
        if (path.charCodeAt(path.length - 1) !== 47 /* CharCode.Slash */) {
            // file name ends with .code-workspace
            if (hasWorkspaceFileExtension(path)) {
                if (options.forceOpenWorkspaceAsFile) {
                    return {
                        fileUri: uri,
                        options: {
                            selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                        },
                        remoteAuthority: options.remoteAuthority
                    };
                }
                return { workspace: getWorkspaceIdentifier(uri), remoteAuthority };
            }
            // file name starts with a dot or has an file extension
            else if (options.gotoLineMode || posix.basename(path).indexOf('.') !== -1) {
                return {
                    fileUri: uri,
                    options: {
                        selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                    },
                    remoteAuthority
                };
            }
        }
        return { workspace: getSingleFolderWorkspaceIdentifier(uri), remoteAuthority };
    }
    shouldOpenNewWindow(openConfig) {
        // let the user settings override how folders are open in a new window or same window unless we are forced
        const windowConfig = this.configurationService.getValue('window');
        const openFolderInNewWindowConfig = windowConfig?.openFoldersInNewWindow || 'default' /* default */;
        const openFilesInNewWindowConfig = windowConfig?.openFilesInNewWindow || 'off' /* default */;
        let openFolderInNewWindow = (openConfig.preferNewWindow || openConfig.forceNewWindow) && !openConfig.forceReuseWindow;
        if (!openConfig.forceNewWindow && !openConfig.forceReuseWindow && (openFolderInNewWindowConfig === 'on' || openFolderInNewWindowConfig === 'off')) {
            openFolderInNewWindow = (openFolderInNewWindowConfig === 'on');
        }
        // let the user settings override how files are open in a new window or same window unless we are forced (not for extension development though)
        let openFilesInNewWindow = false;
        if (openConfig.forceNewWindow || openConfig.forceReuseWindow) {
            openFilesInNewWindow = !!openConfig.forceNewWindow && !openConfig.forceReuseWindow;
        }
        else {
            // macOS: by default we open files in a new window if this is triggered via DOCK context
            if (isMacintosh) {
                if (openConfig.context === 1 /* OpenContext.DOCK */) {
                    openFilesInNewWindow = true;
                }
            }
            // Linux/Windows: by default we open files in the new window unless triggered via DIALOG / MENU context
            // or from the integrated terminal where we assume the user prefers to open in the current window
            else {
                if (openConfig.context !== 3 /* OpenContext.DIALOG */ && openConfig.context !== 2 /* OpenContext.MENU */ && !(openConfig.userEnv && openConfig.userEnv['TERM_PROGRAM'] === 'vscode')) {
                    openFilesInNewWindow = true;
                }
            }
            // finally check for overrides of default
            if (!openConfig.cli.extensionDevelopmentPath && (openFilesInNewWindowConfig === 'on' || openFilesInNewWindowConfig === 'off')) {
                openFilesInNewWindow = (openFilesInNewWindowConfig === 'on');
            }
        }
        return { openFolderInNewWindow: !!openFolderInNewWindow, openFilesInNewWindow };
    }
    async openExtensionDevelopmentHostWindow(extensionDevelopmentPaths, openConfig) {
        // Reload an existing extension development host window on the same path
        // We currently do not allow more than one extension development window
        // on the same extension path.
        const existingWindow = findWindowOnExtensionDevelopmentPath(this.getWindows(), extensionDevelopmentPaths);
        if (existingWindow) {
            this.lifecycleMainService.reload(existingWindow, openConfig.cli);
            existingWindow.focus(); // make sure it gets focus and is restored
            return [existingWindow];
        }
        let folderUris = openConfig.cli['folder-uri'] || [];
        let fileUris = openConfig.cli['file-uri'] || [];
        let cliArgs = openConfig.cli._;
        // Fill in previously opened workspace unless an explicit path is provided and we are not unit testing
        if (!cliArgs.length && !folderUris.length && !fileUris.length && !openConfig.cli.extensionTestsPath) {
            const extensionDevelopmentWindowState = this.windowsStateHandler.state.lastPluginDevelopmentHostWindow;
            const workspaceToOpen = extensionDevelopmentWindowState?.workspace ?? extensionDevelopmentWindowState?.folderUri;
            if (workspaceToOpen) {
                if (URI.isUri(workspaceToOpen)) {
                    if (workspaceToOpen.scheme === Schemas.file) {
                        cliArgs = [workspaceToOpen.fsPath];
                    }
                    else {
                        folderUris = [workspaceToOpen.toString()];
                    }
                }
                else {
                    if (workspaceToOpen.configPath.scheme === Schemas.file) {
                        cliArgs = [originalFSPath(workspaceToOpen.configPath)];
                    }
                    else {
                        fileUris = [workspaceToOpen.configPath.toString()];
                    }
                }
            }
        }
        let remoteAuthority = openConfig.remoteAuthority;
        for (const extensionDevelopmentPath of extensionDevelopmentPaths) {
            if (extensionDevelopmentPath.match(/^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/)) {
                const url = URI.parse(extensionDevelopmentPath);
                const extensionDevelopmentPathRemoteAuthority = getRemoteAuthority(url);
                if (extensionDevelopmentPathRemoteAuthority) {
                    if (remoteAuthority) {
                        if (!isEqualAuthority(extensionDevelopmentPathRemoteAuthority, remoteAuthority)) {
                            this.logService.error('more than one extension development path authority');
                        }
                    }
                    else {
                        remoteAuthority = extensionDevelopmentPathRemoteAuthority;
                    }
                }
            }
        }
        // Make sure that we do not try to open:
        // - a workspace or folder that is already opened
        // - a workspace or file that has a different authority as the extension development.
        cliArgs = cliArgs.filter(path => {
            const uri = URI.file(path);
            if (!!findWindowOnWorkspaceOrFolder(this.getWindows(), uri)) {
                return false;
            }
            return isEqualAuthority(getRemoteAuthority(uri), remoteAuthority);
        });
        folderUris = folderUris.filter(folderUriStr => {
            const folderUri = this.cliArgToUri(folderUriStr);
            if (folderUri && !!findWindowOnWorkspaceOrFolder(this.getWindows(), folderUri)) {
                return false;
            }
            return folderUri ? isEqualAuthority(getRemoteAuthority(folderUri), remoteAuthority) : false;
        });
        fileUris = fileUris.filter(fileUriStr => {
            const fileUri = this.cliArgToUri(fileUriStr);
            if (fileUri && !!findWindowOnWorkspaceOrFolder(this.getWindows(), fileUri)) {
                return false;
            }
            return fileUri ? isEqualAuthority(getRemoteAuthority(fileUri), remoteAuthority) : false;
        });
        openConfig.cli._ = cliArgs;
        openConfig.cli['folder-uri'] = folderUris;
        openConfig.cli['file-uri'] = fileUris;
        // Open it
        const openArgs = {
            context: openConfig.context,
            cli: openConfig.cli,
            forceNewWindow: true,
            forceEmpty: !cliArgs.length && !folderUris.length && !fileUris.length,
            userEnv: openConfig.userEnv,
            noRecentEntry: true,
            waitMarkerFileURI: openConfig.waitMarkerFileURI,
            remoteAuthority,
            forceProfile: openConfig.forceProfile,
            forceTempProfile: openConfig.forceTempProfile
        };
        return this.open(openArgs);
    }
    async openInBrowserWindow(options) {
        const windowConfig = this.configurationService.getValue('window');
        // Build up the window configuration from provided options, config and environment
        const configuration = {
            // Inherit CLI arguments from environment and/or
            // the specific properties from this launch if provided
            ...this.environmentMainService.args,
            ...options.cli,
            machineId: this.machineId,
            windowId: -1,
            mainPid: process.pid,
            appRoot: this.environmentMainService.appRoot,
            execPath: process.execPath,
            codeCachePath: this.environmentMainService.codeCachePath,
            // If we know the backup folder upfront (for empty windows to restore), we can set it
            // directly here which helps for restoring UI state associated with that window.
            // For all other cases we first call into registerEmptyWindowBackup() to set it before
            // loading the window.
            backupPath: options.emptyWindowBackupInfo ? join(this.environmentMainService.backupHome, options.emptyWindowBackupInfo.backupFolder) : undefined,
            profiles: {
                all: this.userDataProfilesMainService.profiles,
                profile: await this.resolveProfileForBrowserWindow(options)
            },
            homeDir: this.environmentMainService.userHome.fsPath,
            tmpDir: this.environmentMainService.tmpDir.fsPath,
            userDataDir: this.environmentMainService.userDataPath,
            remoteAuthority: options.remoteAuthority,
            workspace: options.workspace,
            userEnv: { ...this.initialUserEnv, ...options.userEnv },
            filesToOpenOrCreate: options.filesToOpen?.filesToOpenOrCreate,
            filesToDiff: options.filesToOpen?.filesToDiff,
            filesToMerge: options.filesToOpen?.filesToMerge,
            filesToWait: options.filesToOpen?.filesToWait,
            logLevel: this.logService.getLevel(),
            logsPath: this.environmentMainService.logsPath,
            product,
            isInitialStartup: options.initialStartup,
            perfMarks: getMarks(),
            os: { release: release(), hostname: hostname() },
            zoomLevel: typeof windowConfig?.zoomLevel === 'number' ? windowConfig.zoomLevel : undefined,
            autoDetectHighContrast: windowConfig?.autoDetectHighContrast ?? true,
            autoDetectColorScheme: windowConfig?.autoDetectColorScheme ?? false,
            accessibilitySupport: app.accessibilitySupportEnabled,
            colorScheme: this.themeMainService.getColorScheme(),
            policiesData: this.policyService.serialize(),
            continueOn: this.environmentMainService.continueOn,
        };
        let window;
        if (!options.forceNewWindow && !options.forceNewTabbedWindow) {
            window = options.windowToUse || this.getLastActiveWindow();
            if (window) {
                window.focus();
            }
        }
        // New window
        if (!window) {
            const state = this.windowsStateHandler.getNewWindowState(configuration);
            // Create the window
            mark('code/willCreateCodeWindow');
            const createdWindow = window = this.instantiationService.createInstance(CodeWindow, {
                state,
                extensionDevelopmentPath: configuration.extensionDevelopmentPath,
                isExtensionTestHost: !!configuration.extensionTestsPath
            });
            mark('code/didCreateCodeWindow');
            // Add as window tab if configured (macOS only)
            if (options.forceNewTabbedWindow) {
                const activeWindow = this.getLastActiveWindow();
                activeWindow?.addTabbedWindow(createdWindow);
            }
            // Add to our list of windows
            WindowsMainService.WINDOWS.push(createdWindow);
            // Indicate new window via event
            this._onDidOpenWindow.fire(createdWindow);
            // Indicate number change via event
            this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() - 1, newCount: this.getWindowCount() });
            // Window Events
            once(createdWindow.onDidSignalReady)(() => this._onDidSignalReadyWindow.fire(createdWindow));
            once(createdWindow.onDidClose)(() => this.onWindowClosed(createdWindow));
            once(createdWindow.onDidDestroy)(() => this._onDidDestroyWindow.fire(createdWindow));
            createdWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: createdWindow, x, y }));
            const webContents = assertIsDefined(createdWindow.win?.webContents);
            webContents.removeAllListeners('devtools-reload-page'); // remove built in listener so we can handle this on our own
            webContents.on('devtools-reload-page', () => this.lifecycleMainService.reload(createdWindow));
            // Lifecycle
            this.lifecycleMainService.registerWindow(createdWindow);
        }
        // Existing window
        else {
            // Some configuration things get inherited if the window is being reused and we are
            // in extension development host mode. These options are all development related.
            const currentWindowConfig = window.config;
            if (!configuration.extensionDevelopmentPath && currentWindowConfig?.extensionDevelopmentPath) {
                configuration.extensionDevelopmentPath = currentWindowConfig.extensionDevelopmentPath;
                configuration.extensionDevelopmentKind = currentWindowConfig.extensionDevelopmentKind;
                configuration['enable-proposed-api'] = currentWindowConfig['enable-proposed-api'];
                configuration.verbose = currentWindowConfig.verbose;
                configuration['inspect-extensions'] = currentWindowConfig['inspect-extensions'];
                configuration['inspect-brk-extensions'] = currentWindowConfig['inspect-brk-extensions'];
                configuration.debugId = currentWindowConfig.debugId;
                configuration.extensionEnvironment = currentWindowConfig.extensionEnvironment;
                configuration['extensions-dir'] = currentWindowConfig['extensions-dir'];
                configuration['disable-extensions'] = currentWindowConfig['disable-extensions'];
            }
        }
        // Update window identifier and session now
        // that we have the window object in hand.
        configuration.windowId = window.id;
        // If the window was already loaded, make sure to unload it
        // first and only load the new configuration if that was
        // not vetoed
        if (window.isReady) {
            this.lifecycleMainService.unload(window, 4 /* UnloadReason.LOAD */).then(veto => {
                if (!veto) {
                    this.doOpenInBrowserWindow(window, configuration, options);
                }
            });
        }
        else {
            this.doOpenInBrowserWindow(window, configuration, options);
        }
        return window;
    }
    doOpenInBrowserWindow(window, configuration, options) {
        // Register window for backups unless the window
        // is for extension development, where we do not
        // keep any backups.
        if (!configuration.extensionDevelopmentPath) {
            if (isWorkspaceIdentifier(configuration.workspace)) {
                configuration.backupPath = this.backupMainService.registerWorkspaceBackup({
                    workspace: configuration.workspace,
                    remoteAuthority: configuration.remoteAuthority
                });
            }
            else if (isSingleFolderWorkspaceIdentifier(configuration.workspace)) {
                configuration.backupPath = this.backupMainService.registerFolderBackup({
                    folderUri: configuration.workspace.uri,
                    remoteAuthority: configuration.remoteAuthority
                });
            }
            else {
                // Empty windows are special in that they provide no workspace on
                // their configuration. To properly register them with the backup
                // service, we either use the provided associated `backupFolder`
                // in case we restore a previously opened empty window or we have
                // to generate a new empty window workspace identifier to be used
                // as `backupFolder`.
                configuration.backupPath = this.backupMainService.registerEmptyWindowBackup({
                    backupFolder: options.emptyWindowBackupInfo?.backupFolder ?? createEmptyWorkspaceIdentifier().id,
                    remoteAuthority: configuration.remoteAuthority
                });
            }
        }
        // Load it
        window.load(configuration);
    }
    async resolveProfileForBrowserWindow(options) {
        let profile;
        if (this.userDataProfilesMainService.isEnabled()) {
            if (options.forceProfile) {
                profile = this.userDataProfilesMainService.profiles.find(p => p.name === options.forceProfile) ?? await this.userDataProfilesMainService.createNamedProfile(options.forceProfile);
            }
            else if (options.forceTempProfile) {
                profile = await this.userDataProfilesMainService.createTransientProfile();
            }
        }
        if (profile) {
            this.userDataProfilesMainService.setProfileForWorkspaceSync(options.workspace ?? 'empty-window', profile);
        }
        else {
            profile = this.userDataProfilesMainService.getOrSetProfileForWorkspace(options.workspace ?? 'empty-window', (options.windowToUse ?? this.getLastActiveWindow())?.profile ?? this.userDataProfilesMainService.defaultProfile);
        }
        return profile;
    }
    onWindowClosed(window) {
        // Remove from our list so that Electron can clean it up
        const index = WindowsMainService.WINDOWS.indexOf(window);
        WindowsMainService.WINDOWS.splice(index, 1);
        // Emit
        this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() + 1, newCount: this.getWindowCount() });
    }
    getFocusedWindow() {
        const window = BrowserWindow.getFocusedWindow();
        if (window) {
            return this.getWindowById(window.id);
        }
        return undefined;
    }
    getLastActiveWindow() {
        return this.doGetLastActiveWindow(this.getWindows());
    }
    getLastActiveWindowForAuthority(remoteAuthority) {
        return this.doGetLastActiveWindow(this.getWindows().filter(window => isEqualAuthority(window.remoteAuthority, remoteAuthority)));
    }
    doGetLastActiveWindow(windows) {
        const lastFocusedDate = Math.max.apply(Math, windows.map(window => window.lastFocusTime));
        return windows.find(window => window.lastFocusTime === lastFocusedDate);
    }
    sendToFocused(channel, ...args) {
        const focusedWindow = this.getFocusedWindow() || this.getLastActiveWindow();
        focusedWindow?.sendWhenReady(channel, CancellationToken.None, ...args);
    }
    sendToAll(channel, payload, windowIdsToIgnore) {
        for (const window of this.getWindows()) {
            if (windowIdsToIgnore && windowIdsToIgnore.indexOf(window.id) >= 0) {
                continue; // do not send if we are instructed to ignore it
            }
            window.sendWhenReady(channel, CancellationToken.None, payload);
        }
    }
    getWindows() {
        return WindowsMainService.WINDOWS;
    }
    getWindowCount() {
        return WindowsMainService.WINDOWS.length;
    }
    getWindowById(windowId) {
        const windows = this.getWindows().filter(window => window.id === windowId);
        return firstOrDefault(windows);
    }
    getWindowByWebContents(webContents) {
        const browserWindow = BrowserWindow.fromWebContents(webContents);
        if (!browserWindow) {
            return undefined;
        }
        return this.getWindowById(browserWindow.id);
    }
};
WindowsMainService = __decorate([
    __param(2, ILogService),
    __param(3, IStateMainService),
    __param(4, IPolicyService),
    __param(5, IEnvironmentMainService),
    __param(6, IUserDataProfilesMainService),
    __param(7, ILifecycleMainService),
    __param(8, IBackupMainService),
    __param(9, IConfigurationService),
    __param(10, IWorkspacesHistoryMainService),
    __param(11, IWorkspacesManagementMainService),
    __param(12, IInstantiationService),
    __param(13, IDialogMainService),
    __param(14, IFileService),
    __param(15, IProductService),
    __param(16, IProtocolMainService),
    __param(17, IThemeMainService)
], WindowsMainService);
export { WindowsMainService };
