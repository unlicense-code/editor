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
import { exec } from 'child_process';
import { app, BrowserWindow, clipboard, Menu, powerMonitor, screen, shell } from 'electron';
import { arch, cpus, freemem, loadavg, platform, release, totalmem, type } from 'os';
import { promisify } from 'util';
import { memoize } from 'vs/base/common/decorators';
import { Emitter, Event } from 'vs/base/common/event';
import { mnemonicButtonLabel } from 'vs/base/common/labels';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { dirname, join, resolve } from 'vs/base/common/path';
import { isLinux, isLinuxSnap, isMacintosh, isWindows } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { realpath } from 'vs/base/node/extpath';
import { virtualMachineHint } from 'vs/base/node/id';
import { Promises, SymlinkSupport } from 'vs/base/node/pfs';
import { findFreePort } from 'vs/base/node/ports';
import { localize } from 'vs/nls';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IThemeMainService } from 'vs/platform/theme/electron-main/themeMainService';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
import { isWorkspaceIdentifier, toWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { IWorkspacesManagementMainService } from 'vs/platform/workspaces/electron-main/workspacesManagementMainService';
import { VSBuffer } from 'vs/base/common/buffer';
import { hasWSLFeatureInstalled } from 'vs/platform/remote/node/wsl';
import { WindowProfiler } from 'vs/platform/profiling/electron-main/windowProfiling';
export const INativeHostMainService = createDecorator('nativeHostMainService');
let NativeHostMainService = class NativeHostMainService extends Disposable {
    sharedProcess;
    windowsMainService;
    dialogMainService;
    lifecycleMainService;
    environmentMainService;
    logService;
    productService;
    themeMainService;
    workspacesManagementMainService;
    constructor(sharedProcess, windowsMainService, dialogMainService, lifecycleMainService, environmentMainService, logService, productService, themeMainService, workspacesManagementMainService) {
        super();
        this.sharedProcess = sharedProcess;
        this.windowsMainService = windowsMainService;
        this.dialogMainService = dialogMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        this.productService = productService;
        this.themeMainService = themeMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
    }
    //#region Properties
    get windowId() { throw new Error('Not implemented in electron-main'); }
    //#endregion
    //#region Events
    onDidOpenWindow = Event.map(this.windowsMainService.onDidOpenWindow, window => window.id);
    onDidTriggerSystemContextMenu = Event.filter(Event.map(this.windowsMainService.onDidTriggerSystemContextMenu, ({ window, x, y }) => { return { windowId: window.id, x, y }; }), ({ windowId }) => !!this.windowsMainService.getWindowById(windowId));
    onDidMaximizeWindow = Event.filter(Event.fromNodeEventEmitter(app, 'browser-window-maximize', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
    onDidUnmaximizeWindow = Event.filter(Event.fromNodeEventEmitter(app, 'browser-window-unmaximize', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
    onDidBlurWindow = Event.filter(Event.fromNodeEventEmitter(app, 'browser-window-blur', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
    onDidFocusWindow = Event.any(Event.map(Event.filter(Event.map(this.windowsMainService.onDidChangeWindowsCount, () => this.windowsMainService.getLastActiveWindow()), window => !!window), window => window.id), Event.filter(Event.fromNodeEventEmitter(app, 'browser-window-focus', (event, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)));
    onDidResumeOS = Event.fromNodeEventEmitter(powerMonitor, 'resume');
    onDidChangeColorScheme = this.themeMainService.onDidChangeColorScheme;
    _onDidChangePassword = this._register(new Emitter());
    onDidChangePassword = this._onDidChangePassword.event;
    onDidChangeDisplay = Event.debounce(Event.any(Event.filter(Event.fromNodeEventEmitter(screen, 'display-metrics-changed', (event, display, changedMetrics) => changedMetrics), changedMetrics => {
        // Electron will emit 'display-metrics-changed' events even when actually
        // going fullscreen, because the dock hides. However, we do not want to
        // react on this event as there is no change in display bounds.
        return !(Array.isArray(changedMetrics) && changedMetrics.length === 1 && changedMetrics[0] === 'workArea');
    }), Event.fromNodeEventEmitter(screen, 'display-added'), Event.fromNodeEventEmitter(screen, 'display-removed')), () => { }, 100);
    //#endregion
    //#region Window
    async getWindows() {
        const windows = this.windowsMainService.getWindows();
        return windows.map(window => ({
            id: window.id,
            workspace: window.openedWorkspace ?? toWorkspaceIdentifier(window.backupPath, window.isExtensionDevelopmentHost),
            title: window.win?.getTitle() ?? '',
            filename: window.getRepresentedFilename(),
            dirty: window.isDocumentEdited()
        }));
    }
    async getWindowCount(windowId) {
        return this.windowsMainService.getWindowCount();
    }
    async getActiveWindowId(windowId) {
        const activeWindow = BrowserWindow.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
        if (activeWindow) {
            return activeWindow.id;
        }
        return undefined;
    }
    openWindow(windowId, arg1, arg2) {
        if (Array.isArray(arg1)) {
            return this.doOpenWindow(windowId, arg1, arg2);
        }
        return this.doOpenEmptyWindow(windowId, arg1);
    }
    async doOpenWindow(windowId, toOpen, options = Object.create(null)) {
        if (toOpen.length > 0) {
            await this.windowsMainService.open({
                context: 5 /* OpenContext.API */,
                contextWindowId: windowId,
                urisToOpen: toOpen,
                cli: this.environmentMainService.args,
                forceNewWindow: options.forceNewWindow,
                forceReuseWindow: options.forceReuseWindow,
                preferNewWindow: options.preferNewWindow,
                diffMode: options.diffMode,
                mergeMode: options.mergeMode,
                addMode: options.addMode,
                gotoLineMode: options.gotoLineMode,
                noRecentEntry: options.noRecentEntry,
                waitMarkerFileURI: options.waitMarkerFileURI,
                remoteAuthority: options.remoteAuthority || undefined
            });
        }
    }
    async doOpenEmptyWindow(windowId, options) {
        await this.windowsMainService.openEmptyWindow({
            context: 5 /* OpenContext.API */,
            contextWindowId: windowId
        }, options);
    }
    async toggleFullScreen(windowId) {
        const window = this.windowById(windowId);
        window?.toggleFullScreen();
    }
    async handleTitleDoubleClick(windowId) {
        const window = this.windowById(windowId);
        window?.handleTitleDoubleClick();
    }
    async isMaximized(windowId) {
        const window = this.windowById(windowId);
        if (window?.win) {
            return window.win.isMaximized();
        }
        return false;
    }
    async maximizeWindow(windowId) {
        const window = this.windowById(windowId);
        if (window?.win) {
            window.win.maximize();
        }
    }
    async unmaximizeWindow(windowId) {
        const window = this.windowById(windowId);
        if (window?.win) {
            window.win.unmaximize();
        }
    }
    async minimizeWindow(windowId) {
        const window = this.windowById(windowId);
        if (window?.win) {
            window.win.minimize();
        }
    }
    async updateWindowControls(windowId, options) {
        const window = this.windowById(windowId);
        if (window) {
            window.updateWindowControls(options);
        }
    }
    async focusWindow(windowId, options) {
        if (options && typeof options.windowId === 'number') {
            windowId = options.windowId;
        }
        const window = this.windowById(windowId);
        window?.focus({ force: options?.force ?? false });
    }
    async setMinimumSize(windowId, width, height) {
        const window = this.windowById(windowId);
        if (window?.win) {
            const [windowWidth, windowHeight] = window.win.getSize();
            const [minWindowWidth, minWindowHeight] = window.win.getMinimumSize();
            const [newMinWindowWidth, newMinWindowHeight] = [width ?? minWindowWidth, height ?? minWindowHeight];
            const [newWindowWidth, newWindowHeight] = [Math.max(windowWidth, newMinWindowWidth), Math.max(windowHeight, newMinWindowHeight)];
            if (minWindowWidth !== newMinWindowWidth || minWindowHeight !== newMinWindowHeight) {
                window.win.setMinimumSize(newMinWindowWidth, newMinWindowHeight);
            }
            if (windowWidth !== newWindowWidth || windowHeight !== newWindowHeight) {
                window.win.setSize(newWindowWidth, newWindowHeight);
            }
        }
    }
    async saveWindowSplash(windowId, splash) {
        this.themeMainService.saveWindowSplash(windowId, splash);
    }
    //#endregion
    //#region macOS Shell Command
    async installShellCommand(windowId) {
        const { source, target } = await this.getShellCommandLink();
        // Only install unless already existing
        try {
            const { symbolicLink } = await SymlinkSupport.stat(source);
            if (symbolicLink && !symbolicLink.dangling) {
                const linkTargetRealPath = await realpath(source);
                if (target === linkTargetRealPath) {
                    return;
                }
            }
            // Different source, delete it first
            await Promises.unlink(source);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error; // throw on any error but file not found
            }
        }
        try {
            await Promises.symlink(target, source);
        }
        catch (error) {
            if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
                throw error;
            }
            const { response } = await this.showMessageBox(windowId, {
                title: this.productService.nameLong,
                type: 'info',
                message: localize('warnEscalation', "{0} will now prompt with 'osascript' for Administrator privileges to install the shell command.", this.productService.nameShort),
                buttons: [
                    mnemonicButtonLabel(localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")),
                    mnemonicButtonLabel(localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel")),
                ],
                noLink: true,
                defaultId: 0,
                cancelId: 1
            });
            if (response === 0 /* OK */) {
                try {
                    const command = `osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'${target}\' \'${source}\'\\" with administrator privileges"`;
                    await promisify(exec)(command);
                }
                catch (error) {
                    throw new Error(localize('cantCreateBinFolder', "Unable to install the shell command '{0}'.", source));
                }
            }
        }
    }
    async uninstallShellCommand(windowId) {
        const { source } = await this.getShellCommandLink();
        try {
            await Promises.unlink(source);
        }
        catch (error) {
            switch (error.code) {
                case 'EACCES': {
                    const { response } = await this.showMessageBox(windowId, {
                        title: this.productService.nameLong,
                        type: 'info',
                        message: localize('warnEscalationUninstall', "{0} will now prompt with 'osascript' for Administrator privileges to uninstall the shell command.", this.productService.nameShort),
                        buttons: [
                            mnemonicButtonLabel(localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")),
                            mnemonicButtonLabel(localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel")),
                        ],
                        noLink: true,
                        defaultId: 0,
                        cancelId: 1
                    });
                    if (response === 0 /* OK */) {
                        try {
                            const command = `osascript -e "do shell script \\"rm \'${source}\'\\" with administrator privileges"`;
                            await promisify(exec)(command);
                        }
                        catch (error) {
                            throw new Error(localize('cantUninstall', "Unable to uninstall the shell command '{0}'.", source));
                        }
                    }
                    break;
                }
                case 'ENOENT':
                    break; // ignore file not found
                default:
                    throw error;
            }
        }
    }
    async getShellCommandLink() {
        const target = resolve(this.environmentMainService.appRoot, 'bin', 'code');
        const source = `/usr/local/bin/${this.productService.applicationName}`;
        // Ensure source exists
        const sourceExists = await Promises.exists(target);
        if (!sourceExists) {
            throw new Error(localize('sourceMissing', "Unable to find shell script in '{0}'", target));
        }
        return { source, target };
    }
    //#region Dialog
    async showMessageBox(windowId, options) {
        return this.dialogMainService.showMessageBox(options, this.toBrowserWindow(windowId));
    }
    async showSaveDialog(windowId, options) {
        return this.dialogMainService.showSaveDialog(options, this.toBrowserWindow(windowId));
    }
    async showOpenDialog(windowId, options) {
        return this.dialogMainService.showOpenDialog(options, this.toBrowserWindow(windowId));
    }
    toBrowserWindow(windowId) {
        const window = this.windowById(windowId);
        if (window?.win) {
            return window.win;
        }
        return undefined;
    }
    async pickFileFolderAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickFileFolder(options);
        if (paths) {
            await this.doOpenPicked(await Promise.all(paths.map(async (path) => (await SymlinkSupport.existsDirectory(path)) ? { folderUri: URI.file(path) } : { fileUri: URI.file(path) })), options, windowId);
        }
    }
    async pickFolderAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickFolder(options);
        if (paths) {
            await this.doOpenPicked(paths.map(path => ({ folderUri: URI.file(path) })), options, windowId);
        }
    }
    async pickFileAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickFile(options);
        if (paths) {
            await this.doOpenPicked(paths.map(path => ({ fileUri: URI.file(path) })), options, windowId);
        }
    }
    async pickWorkspaceAndOpen(windowId, options) {
        const paths = await this.dialogMainService.pickWorkspace(options);
        if (paths) {
            await this.doOpenPicked(paths.map(path => ({ workspaceUri: URI.file(path) })), options, windowId);
        }
    }
    async doOpenPicked(openable, options, windowId) {
        await this.windowsMainService.open({
            context: 3 /* OpenContext.DIALOG */,
            contextWindowId: windowId,
            cli: this.environmentMainService.args,
            urisToOpen: openable,
            forceNewWindow: options.forceNewWindow,
            /* remoteAuthority will be determined based on openable */
        });
    }
    //#endregion
    //#region OS
    async showItemInFolder(windowId, path) {
        shell.showItemInFolder(path);
    }
    async setRepresentedFilename(windowId, path) {
        const window = this.windowById(windowId);
        window?.setRepresentedFilename(path);
    }
    async setDocumentEdited(windowId, edited) {
        const window = this.windowById(windowId);
        window?.setDocumentEdited(edited);
    }
    async openExternal(windowId, url) {
        if (isLinuxSnap) {
            this.safeSnapOpenExternal(url);
        }
        else {
            shell.openExternal(url);
        }
        return true;
    }
    safeSnapOpenExternal(url) {
        // Remove some environment variables before opening to avoid issues...
        const gdkPixbufModuleFile = process.env['GDK_PIXBUF_MODULE_FILE'];
        const gdkPixbufModuleDir = process.env['GDK_PIXBUF_MODULEDIR'];
        delete process.env['GDK_PIXBUF_MODULE_FILE'];
        delete process.env['GDK_PIXBUF_MODULEDIR'];
        shell.openExternal(url);
        // ...but restore them after
        process.env['GDK_PIXBUF_MODULE_FILE'] = gdkPixbufModuleFile;
        process.env['GDK_PIXBUF_MODULEDIR'] = gdkPixbufModuleDir;
    }
    moveItemToTrash(windowId, fullPath) {
        return shell.trashItem(fullPath);
    }
    async isAdmin() {
        let isAdmin;
        if (isWindows) {
            isAdmin = (await import('native-is-elevated'))();
        }
        else {
            isAdmin = process.getuid() === 0;
        }
        return isAdmin;
    }
    async writeElevated(windowId, source, target, options) {
        const sudoPrompt = await import('@vscode/sudo-prompt');
        return new Promise((resolve, reject) => {
            const sudoCommand = [`"${this.cliPath}"`];
            if (options?.unlock) {
                sudoCommand.push('--file-chmod');
            }
            sudoCommand.push('--file-write', `"${source.fsPath}"`, `"${target.fsPath}"`);
            const promptOptions = {
                name: this.productService.nameLong.replace('-', ''),
                icns: (isMacintosh && this.environmentMainService.isBuilt) ? join(dirname(this.environmentMainService.appRoot), `${this.productService.nameShort}.icns`) : undefined
            };
            sudoPrompt.exec(sudoCommand.join(' '), promptOptions, (error, stdout, stderr) => {
                if (stdout) {
                    this.logService.trace(`[sudo-prompt] received stdout: ${stdout}`);
                }
                if (stderr) {
                    this.logService.trace(`[sudo-prompt] received stderr: ${stderr}`);
                }
                if (error) {
                    reject(error);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    }
    get cliPath() {
        // Windows
        if (isWindows) {
            if (this.environmentMainService.isBuilt) {
                return join(dirname(process.execPath), 'bin', `${this.productService.applicationName}.cmd`);
            }
            return join(this.environmentMainService.appRoot, 'scripts', 'code-cli.bat');
        }
        // Linux
        if (isLinux) {
            if (this.environmentMainService.isBuilt) {
                return join(dirname(process.execPath), 'bin', `${this.productService.applicationName}`);
            }
            return join(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
        }
        // macOS
        if (this.environmentMainService.isBuilt) {
            return join(this.environmentMainService.appRoot, 'bin', 'code');
        }
        return join(this.environmentMainService.appRoot, 'scripts', 'code-cli.sh');
    }
    async getOSStatistics() {
        return {
            totalmem: totalmem(),
            freemem: freemem(),
            loadavg: loadavg()
        };
    }
    async getOSProperties() {
        return {
            arch: arch(),
            platform: platform(),
            release: release(),
            type: type(),
            cpus: cpus()
        };
    }
    async getOSVirtualMachineHint() {
        return virtualMachineHint.value();
    }
    async getOSColorScheme() {
        return this.themeMainService.getColorScheme();
    }
    // WSL
    async hasWSLFeatureInstalled() {
        return isWindows && hasWSLFeatureInstalled();
    }
    //#endregion
    //#region Process
    async killProcess(windowId, pid, code) {
        process.kill(pid, code);
    }
    //#endregion
    //#region Clipboard
    async readClipboardText(windowId, type) {
        return clipboard.readText(type);
    }
    async writeClipboardText(windowId, text, type) {
        return clipboard.writeText(text, type);
    }
    async readClipboardFindText(windowId) {
        return clipboard.readFindText();
    }
    async writeClipboardFindText(windowId, text) {
        return clipboard.writeFindText(text);
    }
    async writeClipboardBuffer(windowId, format, buffer, type) {
        return clipboard.writeBuffer(format, Buffer.from(buffer.buffer), type);
    }
    async readClipboardBuffer(windowId, format) {
        return VSBuffer.wrap(clipboard.readBuffer(format));
    }
    async hasClipboard(windowId, format, type) {
        return clipboard.has(format, type);
    }
    //#endregion
    //#region macOS Touchbar
    async newWindowTab() {
        await this.windowsMainService.open({
            context: 5 /* OpenContext.API */,
            cli: this.environmentMainService.args,
            forceNewTabbedWindow: true,
            forceEmpty: true,
            remoteAuthority: this.environmentMainService.args.remote || undefined
        });
    }
    async showPreviousWindowTab() {
        Menu.sendActionToFirstResponder('selectPreviousTab:');
    }
    async showNextWindowTab() {
        Menu.sendActionToFirstResponder('selectNextTab:');
    }
    async moveWindowTabToNewWindow() {
        Menu.sendActionToFirstResponder('moveTabToNewWindow:');
    }
    async mergeAllWindowTabs() {
        Menu.sendActionToFirstResponder('mergeAllWindows:');
    }
    async toggleWindowTabsBar() {
        Menu.sendActionToFirstResponder('toggleTabBar:');
    }
    async updateTouchBar(windowId, items) {
        const window = this.windowById(windowId);
        window?.updateTouchBar(items);
    }
    //#endregion
    //#region Lifecycle
    async notifyReady(windowId) {
        const window = this.windowById(windowId);
        window?.setReady();
    }
    async relaunch(windowId, options) {
        return this.lifecycleMainService.relaunch(options);
    }
    async reload(windowId, options) {
        const window = this.windowById(windowId);
        if (window) {
            // Special case: support `transient` workspaces by preventing
            // the reload and rather go back to an empty window. Transient
            // workspaces should never restore, even when the user wants
            // to reload.
            // For: https://github.com/microsoft/vscode/issues/119695
            if (isWorkspaceIdentifier(window.openedWorkspace)) {
                const configPath = window.openedWorkspace.configPath;
                if (configPath.scheme === Schemas.file) {
                    const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(configPath);
                    if (workspace?.transient) {
                        return this.openWindow(window.id, { forceReuseWindow: true });
                    }
                }
            }
            // Proceed normally to reload the window
            return this.lifecycleMainService.reload(window, options?.disableExtensions !== undefined ? { _: [], 'disable-extensions': options.disableExtensions } : undefined);
        }
    }
    async closeWindow(windowId) {
        this.closeWindowById(windowId, windowId);
    }
    async closeWindowById(currentWindowId, targetWindowId) {
        const window = this.windowById(targetWindowId);
        if (window?.win) {
            return window.win.close();
        }
    }
    async quit(windowId) {
        // If the user selected to exit from an extension development host window, do not quit, but just
        // close the window unless this is the last window that is opened.
        const window = this.windowsMainService.getLastActiveWindow();
        if (window?.isExtensionDevelopmentHost && this.windowsMainService.getWindowCount() > 1 && window.win) {
            window.win.close();
        }
        // Otherwise: normal quit
        else {
            this.lifecycleMainService.quit();
        }
    }
    async exit(windowId, code) {
        await this.lifecycleMainService.kill(code);
    }
    //#endregion
    //#region Connectivity
    async resolveProxy(windowId, url) {
        const window = this.windowById(windowId);
        const session = window?.win?.webContents?.session;
        if (session) {
            return session.resolveProxy(url);
        }
        else {
            return undefined;
        }
    }
    findFreePort(windowId, startPort, giveUpAfter, timeout, stride = 1) {
        return findFreePort(startPort, giveUpAfter, timeout, stride);
    }
    //#endregion
    //#region Development
    async openDevTools(windowId, options) {
        const window = this.windowById(windowId);
        if (window?.win) {
            window.win.webContents.openDevTools(options);
        }
    }
    async toggleDevTools(windowId) {
        const window = this.windowById(windowId);
        if (window?.win) {
            const contents = window.win.webContents;
            contents.toggleDevTools();
        }
    }
    async sendInputEvent(windowId, event) {
        const window = this.windowById(windowId);
        if (window?.win && (event.type === 'mouseDown' || event.type === 'mouseUp')) {
            window.win.webContents.sendInputEvent(event);
        }
    }
    async toggleSharedProcessWindow() {
        return this.sharedProcess.toggle();
    }
    //#endregion
    // #region Performance
    async profileRenderer(windowId, session, duration) {
        const win = this.windowById(windowId);
        if (!win || !win.win) {
            throw new Error();
        }
        const profiler = new WindowProfiler(win.win, session, this.logService);
        const result = await profiler.inspect(duration);
        return result;
    }
    // #endregion
    //#region Registry (windows)
    async windowsGetStringRegKey(windowId, hive, path, name) {
        if (!isWindows) {
            return undefined;
        }
        const Registry = await import('@vscode/windows-registry');
        try {
            return Registry.GetStringRegKey(hive, path, name);
        }
        catch {
            return undefined;
        }
    }
    //#endregion
    windowById(windowId) {
        if (typeof windowId !== 'number') {
            return undefined;
        }
        return this.windowsMainService.getWindowById(windowId);
    }
};
__decorate([
    memoize
], NativeHostMainService.prototype, "cliPath", null);
NativeHostMainService = __decorate([
    __param(1, IWindowsMainService),
    __param(2, IDialogMainService),
    __param(3, ILifecycleMainService),
    __param(4, IEnvironmentMainService),
    __param(5, ILogService),
    __param(6, IProductService),
    __param(7, IThemeMainService),
    __param(8, IWorkspacesManagementMainService)
], NativeHostMainService);
export { NativeHostMainService };
