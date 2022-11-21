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
import { BrowserWindow, contentTracing, screen } from 'electron';
import { validatedIpcMain } from 'vs/base/parts/ipc/electron-main/ipcMain';
import { arch, release, type } from 'os';
import { mnemonicButtonLabel } from 'vs/base/common/labels';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { FileAccess } from 'vs/base/common/network';
import { isMacintosh } from 'vs/base/common/platform';
import { listProcesses } from 'vs/base/node/ps';
import { localize } from 'vs/nls';
import { IDiagnosticsService, isRemoteDiagnosticError } from 'vs/platform/diagnostics/common/diagnostics';
import { IDiagnosticsMainService } from 'vs/platform/diagnostics/electron-main/diagnosticsMainService';
import { IDialogMainService } from 'vs/platform/dialogs/electron-main/dialogMainService';
import { IEnvironmentMainService } from 'vs/platform/environment/electron-main/environmentMainService';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostMainService } from 'vs/platform/native/electron-main/nativeHostMainService';
import product from 'vs/platform/product/common/product';
import { IProductService } from 'vs/platform/product/common/productService';
import { IProtocolMainService } from 'vs/platform/protocol/electron-main/protocol';
import { zoomLevelToZoomFactor } from 'vs/platform/window/common/window';
import { randomPath } from 'vs/base/common/extpath';
import { withNullAsUndefined } from 'vs/base/common/types';
export const IIssueMainService = createDecorator('issueMainService');
let IssueMainService = class IssueMainService {
    userEnv;
    environmentMainService;
    logService;
    diagnosticsService;
    diagnosticsMainService;
    dialogMainService;
    nativeHostMainService;
    protocolMainService;
    productService;
    static DEFAULT_BACKGROUND_COLOR = '#1E1E1E';
    issueReporterWindow = null;
    issueReporterParentWindow = null;
    processExplorerWindow = null;
    processExplorerParentWindow = null;
    constructor(userEnv, environmentMainService, logService, diagnosticsService, diagnosticsMainService, dialogMainService, nativeHostMainService, protocolMainService, productService) {
        this.userEnv = userEnv;
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        this.diagnosticsService = diagnosticsService;
        this.diagnosticsMainService = diagnosticsMainService;
        this.dialogMainService = dialogMainService;
        this.nativeHostMainService = nativeHostMainService;
        this.protocolMainService = protocolMainService;
        this.productService = productService;
        this.registerListeners();
    }
    registerListeners() {
        validatedIpcMain.on('vscode:issueSystemInfoRequest', async (event) => {
            const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
            const msg = await this.diagnosticsService.getSystemInfo(info, remoteData);
            this.safeSend(event, 'vscode:issueSystemInfoResponse', msg);
        });
        validatedIpcMain.on('vscode:listProcesses', async (event) => {
            const processes = [];
            try {
                processes.push({ name: localize('local', "Local"), rootProcess: await listProcesses(process.pid) });
                const remoteDiagnostics = await this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true });
                remoteDiagnostics.forEach(data => {
                    if (isRemoteDiagnosticError(data)) {
                        processes.push({
                            name: data.hostName,
                            rootProcess: data
                        });
                    }
                    else {
                        if (data.processes) {
                            processes.push({
                                name: data.hostName,
                                rootProcess: data.processes
                            });
                        }
                    }
                });
            }
            catch (e) {
                this.logService.error(`Listing processes failed: ${e}`);
            }
            this.safeSend(event, 'vscode:listProcessesResponse', processes);
        });
        validatedIpcMain.on('vscode:issueReporterClipboard', async (event) => {
            const messageOptions = {
                title: this.productService.nameLong,
                message: localize('issueReporterWriteToClipboard', "There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),
                type: 'warning',
                buttons: [
                    mnemonicButtonLabel(localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")),
                    mnemonicButtonLabel(localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel")),
                ],
                defaultId: 0,
                cancelId: 1,
                noLink: true
            };
            if (this.issueReporterWindow) {
                const result = await this.dialogMainService.showMessageBox(messageOptions, this.issueReporterWindow);
                this.safeSend(event, 'vscode:issueReporterClipboardResponse', result.response === 0);
            }
        });
        validatedIpcMain.on('vscode:issuePerformanceInfoRequest', async (event) => {
            const performanceInfo = await this.getPerformanceInfo();
            this.safeSend(event, 'vscode:issuePerformanceInfoResponse', performanceInfo);
        });
        validatedIpcMain.on('vscode:issueReporterConfirmClose', async () => {
            const messageOptions = {
                title: this.productService.nameLong,
                message: localize('confirmCloseIssueReporter', "Your input will not be saved. Are you sure you want to close this window?"),
                type: 'warning',
                buttons: [
                    mnemonicButtonLabel(localize({ key: 'yes', comment: ['&& denotes a mnemonic'] }, "&&Yes")),
                    mnemonicButtonLabel(localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel")),
                ],
                defaultId: 0,
                cancelId: 1,
                noLink: true
            };
            if (this.issueReporterWindow) {
                const result = await this.dialogMainService.showMessageBox(messageOptions, this.issueReporterWindow);
                if (result.response === 0) {
                    if (this.issueReporterWindow) {
                        this.issueReporterWindow.destroy();
                        this.issueReporterWindow = null;
                    }
                }
            }
        });
        validatedIpcMain.on('vscode:workbenchCommand', (_, commandInfo) => {
            const { id, from, args } = commandInfo;
            let parentWindow;
            switch (from) {
                case 'issueReporter':
                    parentWindow = this.issueReporterParentWindow;
                    break;
                case 'processExplorer':
                    parentWindow = this.processExplorerParentWindow;
                    break;
                default:
                    throw new Error(`Unexpected command source: ${from}`);
            }
            parentWindow?.webContents.send('vscode:runAction', { id, from, args });
        });
        validatedIpcMain.on('vscode:openExternal', (_, arg) => {
            this.nativeHostMainService.openExternal(undefined, arg);
        });
        validatedIpcMain.on('vscode:closeIssueReporter', event => {
            this.issueReporterWindow?.close();
        });
        validatedIpcMain.on('vscode:closeProcessExplorer', event => {
            this.processExplorerWindow?.close();
        });
        validatedIpcMain.on('vscode:windowsInfoRequest', async (event) => {
            const mainProcessInfo = await this.diagnosticsMainService.getMainDiagnostics();
            this.safeSend(event, 'vscode:windowsInfoResponse', mainProcessInfo.windows);
        });
    }
    safeSend(event, channel, ...args) {
        if (!event.sender.isDestroyed()) {
            event.sender.send(channel, ...args);
        }
    }
    async openReporter(data) {
        if (!this.issueReporterWindow) {
            this.issueReporterParentWindow = BrowserWindow.getFocusedWindow();
            if (this.issueReporterParentWindow) {
                const issueReporterDisposables = new DisposableStore();
                const issueReporterWindowConfigUrl = issueReporterDisposables.add(this.protocolMainService.createIPCObjectUrl());
                const position = this.getWindowPosition(this.issueReporterParentWindow, 700, 800);
                this.issueReporterWindow = this.createBrowserWindow(position, issueReporterWindowConfigUrl, {
                    backgroundColor: data.styles.backgroundColor,
                    title: localize('issueReporter', "Issue Reporter"),
                    zoomLevel: data.zoomLevel,
                    alwaysOnTop: false
                }, 'issue-reporter');
                // Store into config object URL
                issueReporterWindowConfigUrl.update({
                    appRoot: this.environmentMainService.appRoot,
                    windowId: this.issueReporterWindow.id,
                    userEnv: this.userEnv,
                    data,
                    disableExtensions: !!this.environmentMainService.disableExtensions,
                    os: {
                        type: type(),
                        arch: arch(),
                        release: release(),
                    },
                    product
                });
                this.issueReporterWindow.loadURL(FileAccess.asBrowserUri(`vs/code/electron-sandbox/issue/issueReporter${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                this.issueReporterWindow.on('close', () => {
                    this.issueReporterWindow = null;
                    issueReporterDisposables.dispose();
                });
                this.issueReporterParentWindow.on('closed', () => {
                    if (this.issueReporterWindow) {
                        this.issueReporterWindow.close();
                        this.issueReporterWindow = null;
                        issueReporterDisposables.dispose();
                    }
                });
            }
        }
        if (this.issueReporterWindow) {
            this.focusWindow(this.issueReporterWindow);
        }
    }
    async openProcessExplorer(data) {
        if (!this.processExplorerWindow) {
            this.processExplorerParentWindow = BrowserWindow.getFocusedWindow();
            if (this.processExplorerParentWindow) {
                const processExplorerDisposables = new DisposableStore();
                const processExplorerWindowConfigUrl = processExplorerDisposables.add(this.protocolMainService.createIPCObjectUrl());
                const position = this.getWindowPosition(this.processExplorerParentWindow, 800, 500);
                this.processExplorerWindow = this.createBrowserWindow(position, processExplorerWindowConfigUrl, {
                    backgroundColor: data.styles.backgroundColor,
                    title: localize('processExplorer', "Process Explorer"),
                    zoomLevel: data.zoomLevel,
                    alwaysOnTop: true
                }, 'process-explorer');
                // Store into config object URL
                processExplorerWindowConfigUrl.update({
                    appRoot: this.environmentMainService.appRoot,
                    windowId: this.processExplorerWindow.id,
                    userEnv: this.userEnv,
                    data,
                    product
                });
                this.processExplorerWindow.loadURL(FileAccess.asBrowserUri(`vs/code/electron-sandbox/processExplorer/processExplorer${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                this.processExplorerWindow.on('close', () => {
                    this.processExplorerWindow = null;
                    processExplorerDisposables.dispose();
                });
                this.processExplorerParentWindow.on('close', () => {
                    if (this.processExplorerWindow) {
                        this.processExplorerWindow.close();
                        this.processExplorerWindow = null;
                        processExplorerDisposables.dispose();
                    }
                });
            }
        }
        if (this.processExplorerWindow) {
            this.focusWindow(this.processExplorerWindow);
        }
    }
    focusWindow(window) {
        if (window.isMinimized()) {
            window.restore();
        }
        window.focus();
    }
    createBrowserWindow(position, ipcObjectUrl, options, windowKind) {
        const window = new BrowserWindow({
            fullscreen: false,
            skipTaskbar: false,
            resizable: true,
            width: position.width,
            height: position.height,
            minWidth: 300,
            minHeight: 200,
            x: position.x,
            y: position.y,
            title: options.title,
            backgroundColor: options.backgroundColor || IssueMainService.DEFAULT_BACKGROUND_COLOR,
            webPreferences: {
                preload: FileAccess.asFileUri('vs/base/parts/sandbox/electron-browser/preload.js').fsPath,
                additionalArguments: [`--vscode-window-config=${ipcObjectUrl.resource.toString()}`, `--vscode-window-kind=${windowKind}`],
                v8CacheOptions: this.environmentMainService.useCodeCache ? 'bypassHeatCheck' : 'none',
                enableWebSQL: false,
                spellcheck: false,
                zoomFactor: zoomLevelToZoomFactor(options.zoomLevel),
                sandbox: true,
                contextIsolation: true
            },
            alwaysOnTop: options.alwaysOnTop,
            experimentalDarkMode: true
        });
        window.setMenuBarVisibility(false);
        return window;
    }
    async getSystemStatus() {
        const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: false, includeWorkspaceMetadata: false })]);
        return this.diagnosticsService.getDiagnostics(info, remoteData);
    }
    getWindowPosition(parentWindow, defaultWidth, defaultHeight) {
        // We want the new window to open on the same display that the parent is in
        let displayToUse;
        const displays = screen.getAllDisplays();
        // Single Display
        if (displays.length === 1) {
            displayToUse = displays[0];
        }
        // Multi Display
        else {
            // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
            if (isMacintosh) {
                const cursorPoint = screen.getCursorScreenPoint();
                displayToUse = screen.getDisplayNearestPoint(cursorPoint);
            }
            // if we have a last active window, use that display for the new window
            if (!displayToUse && parentWindow) {
                displayToUse = screen.getDisplayMatching(parentWindow.getBounds());
            }
            // fallback to primary display or first display
            if (!displayToUse) {
                displayToUse = screen.getPrimaryDisplay() || displays[0];
            }
        }
        const state = {
            width: defaultWidth,
            height: defaultHeight
        };
        const displayBounds = displayToUse.bounds;
        state.x = displayBounds.x + (displayBounds.width / 2) - (state.width / 2);
        state.y = displayBounds.y + (displayBounds.height / 2) - (state.height / 2);
        if (displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
            if (state.x < displayBounds.x) {
                state.x = displayBounds.x; // prevent window from falling out of the screen to the left
            }
            if (state.y < displayBounds.y) {
                state.y = displayBounds.y; // prevent window from falling out of the screen to the top
            }
            if (state.x > (displayBounds.x + displayBounds.width)) {
                state.x = displayBounds.x; // prevent window from falling out of the screen to the right
            }
            if (state.y > (displayBounds.y + displayBounds.height)) {
                state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
            }
            if (state.width > displayBounds.width) {
                state.width = displayBounds.width; // prevent window from exceeding display bounds width
            }
            if (state.height > displayBounds.height) {
                state.height = displayBounds.height; // prevent window from exceeding display bounds height
            }
        }
        return state;
    }
    async getPerformanceInfo() {
        try {
            const [info, remoteData] = await Promise.all([this.diagnosticsMainService.getMainDiagnostics(), this.diagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true })]);
            return await this.diagnosticsService.getPerformanceInfo(info, remoteData);
        }
        catch (error) {
            this.logService.warn('issueService#getPerformanceInfo ', error.message);
            throw error;
        }
    }
    async stopTracing() {
        if (!this.environmentMainService.args.trace) {
            return; // requires tracing to be on
        }
        const path = await contentTracing.stopRecording(`${randomPath(this.environmentMainService.userHome.fsPath, this.productService.applicationName)}.trace.txt`);
        // Inform user to report an issue
        await this.dialogMainService.showMessageBox({
            title: this.productService.nameLong,
            type: 'info',
            message: localize('trace.message', "Successfully created the trace file"),
            detail: localize('trace.detail', "Please create an issue and manually attach the following file:\n{0}", path),
            buttons: [mnemonicButtonLabel(localize({ key: 'trace.ok', comment: ['&& denotes a mnemonic'] }, "&&OK"))],
            defaultId: 0,
            noLink: true
        }, withNullAsUndefined(BrowserWindow.getFocusedWindow()));
        // Show item in explorer
        this.nativeHostMainService.showItemInFolder(undefined, path);
    }
};
IssueMainService = __decorate([
    __param(1, IEnvironmentMainService),
    __param(2, ILogService),
    __param(3, IDiagnosticsService),
    __param(4, IDiagnosticsMainService),
    __param(5, IDialogMainService),
    __param(6, INativeHostMainService),
    __param(7, IProtocolMainService),
    __param(8, IProductService)
], IssueMainService);
export { IssueMainService };
