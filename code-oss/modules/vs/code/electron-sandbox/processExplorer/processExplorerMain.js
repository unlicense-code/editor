/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./media/processExplorer';
import 'vs/base/browser/ui/codicons/codiconStyles'; // make sure codicon css is loaded
import { localize } from 'vs/nls';
import { $, append, createStyleSheet } from 'vs/base/browser/dom';
import { DataTree } from 'vs/base/browser/ui/tree/dataTree';
import { RunOnceScheduler } from 'vs/base/common/async';
import { popup } from 'vs/base/parts/contextmenu/electron-sandbox/contextmenu';
import { ipcRenderer } from 'vs/base/parts/sandbox/electron-sandbox/globals';
import { isRemoteDiagnosticError } from 'vs/platform/diagnostics/common/diagnostics';
import { ByteSize } from 'vs/platform/files/common/files';
import { ElectronIPCMainProcessService } from 'vs/platform/ipc/electron-sandbox/mainProcessService';
import { NativeHostService } from 'vs/platform/native/electron-sandbox/nativeHostService';
import { getIconsStyleSheet } from 'vs/platform/theme/browser/iconsStyleSheet';
import { applyZoom, zoomIn, zoomOut } from 'vs/platform/window/electron-sandbox/window';
const DEBUG_FLAGS_PATTERN = /\s--(inspect|debug)(-brk|port)?=(\d+)?/;
const DEBUG_PORT_PATTERN = /\s--(inspect|debug)-port=(\d+)/;
class ProcessListDelegate {
    getHeight(element) {
        return 22;
    }
    getTemplateId(element) {
        if (isProcessItem(element)) {
            return 'process';
        }
        if (isMachineProcessInformation(element)) {
            return 'machine';
        }
        if (isRemoteDiagnosticError(element)) {
            return 'error';
        }
        if (isProcessInformation(element)) {
            return 'header';
        }
        return '';
    }
}
class ProcessTreeDataSource {
    hasChildren(element) {
        if (isRemoteDiagnosticError(element)) {
            return false;
        }
        if (isProcessItem(element)) {
            return !!element.children?.length;
        }
        else {
            return true;
        }
    }
    getChildren(element) {
        if (isProcessItem(element)) {
            return element.children ? element.children : [];
        }
        if (isRemoteDiagnosticError(element)) {
            return [];
        }
        if (isProcessInformation(element)) {
            // If there are multiple process roots, return these, otherwise go directly to the root process
            if (element.processRoots.length > 1) {
                return element.processRoots;
            }
            else {
                return [element.processRoots[0].rootProcess];
            }
        }
        if (isMachineProcessInformation(element)) {
            return [element.rootProcess];
        }
        return [element.processes];
    }
}
class ProcessHeaderTreeRenderer {
    templateId = 'header';
    renderTemplate(container) {
        const data = Object.create(null);
        const row = append(container, $('.row'));
        data.name = append(row, $('.nameLabel'));
        data.CPU = append(row, $('.cpu'));
        data.memory = append(row, $('.memory'));
        data.PID = append(row, $('.pid'));
        return data;
    }
    renderElement(node, index, templateData, height) {
        templateData.name.textContent = localize('name', "Process Name");
        templateData.CPU.textContent = localize('cpu', "CPU (%)");
        templateData.PID.textContent = localize('pid', "PID");
        templateData.memory.textContent = localize('memory', "Memory (MB)");
    }
    disposeTemplate(templateData) {
        // Nothing to do
    }
}
class MachineRenderer {
    templateId = 'machine';
    renderTemplate(container) {
        const data = Object.create(null);
        const row = append(container, $('.row'));
        data.name = append(row, $('.nameLabel'));
        return data;
    }
    renderElement(node, index, templateData, height) {
        templateData.name.textContent = node.element.name;
    }
    disposeTemplate(templateData) {
        // Nothing to do
    }
}
class ErrorRenderer {
    templateId = 'error';
    renderTemplate(container) {
        const data = Object.create(null);
        const row = append(container, $('.row'));
        data.name = append(row, $('.nameLabel'));
        return data;
    }
    renderElement(node, index, templateData, height) {
        templateData.name.textContent = node.element.errorMessage;
    }
    disposeTemplate(templateData) {
        // Nothing to do
    }
}
class ProcessRenderer {
    platform;
    totalMem;
    mapPidToWindowTitle;
    constructor(platform, totalMem, mapPidToWindowTitle) {
        this.platform = platform;
        this.totalMem = totalMem;
        this.mapPidToWindowTitle = mapPidToWindowTitle;
    }
    templateId = 'process';
    renderTemplate(container) {
        const data = Object.create(null);
        const row = append(container, $('.row'));
        data.name = append(row, $('.nameLabel'));
        data.CPU = append(row, $('.cpu'));
        data.memory = append(row, $('.memory'));
        data.PID = append(row, $('.pid'));
        return data;
    }
    renderElement(node, index, templateData, height) {
        const { element } = node;
        let name = element.name;
        if (name === 'window') {
            const windowTitle = this.mapPidToWindowTitle.get(element.pid);
            name = windowTitle !== undefined ? `${name} (${this.mapPidToWindowTitle.get(element.pid)})` : name;
        }
        const pid = element.pid.toFixed(0);
        templateData.name.textContent = name;
        templateData.name.title = element.cmd;
        templateData.CPU.textContent = element.load.toFixed(0);
        templateData.PID.textContent = pid;
        templateData.PID.parentElement.id = `pid-${pid}`;
        const memory = this.platform === 'win32' ? element.mem : (this.totalMem * (element.mem / 100));
        templateData.memory.textContent = (memory / ByteSize.MB).toFixed(0);
    }
    disposeTemplate(templateData) {
        // Nothing to do
    }
}
function isMachineProcessInformation(item) {
    return !!item.name && !!item.rootProcess;
}
function isProcessInformation(item) {
    return !!item.processRoots;
}
function isProcessItem(item) {
    return !!item.pid;
}
class ProcessExplorer {
    data;
    lastRequestTime;
    mapPidToWindowTitle = new Map();
    nativeHostService;
    tree;
    constructor(windowId, data) {
        this.data = data;
        const mainProcessService = new ElectronIPCMainProcessService(windowId);
        this.nativeHostService = new NativeHostService(windowId, mainProcessService);
        this.applyStyles(data.styles);
        this.setEventHandlers(data);
        // Map window process pids to titles, annotate process names with this when rendering to distinguish between them
        ipcRenderer.on('vscode:windowsInfoResponse', (event, windows) => {
            this.mapPidToWindowTitle = new Map();
            windows.forEach(window => this.mapPidToWindowTitle.set(window.pid, window.title));
        });
        ipcRenderer.on('vscode:listProcessesResponse', async (event, processRoots) => {
            processRoots.forEach((info, index) => {
                if (isProcessItem(info.rootProcess)) {
                    info.rootProcess.name = index === 0 ? `${this.data.applicationName} main` : 'remote agent';
                }
            });
            if (!this.tree) {
                await this.createProcessTree(processRoots);
            }
            else {
                this.tree.setInput({ processes: { processRoots } });
                this.tree.layout(window.innerHeight, window.innerWidth);
            }
            this.requestProcessList(0);
        });
        this.lastRequestTime = Date.now();
        ipcRenderer.send('vscode:windowsInfoRequest');
        ipcRenderer.send('vscode:listProcesses');
    }
    setEventHandlers(data) {
        document.onkeydown = (e) => {
            const cmdOrCtrlKey = data.platform === 'darwin' ? e.metaKey : e.ctrlKey;
            // Cmd/Ctrl + w closes issue window
            if (cmdOrCtrlKey && e.keyCode === 87) {
                e.stopPropagation();
                e.preventDefault();
                ipcRenderer.send('vscode:closeProcessExplorer');
            }
            // Cmd/Ctrl + zooms in
            if (cmdOrCtrlKey && e.keyCode === 187) {
                zoomIn();
            }
            // Cmd/Ctrl - zooms out
            if (cmdOrCtrlKey && e.keyCode === 189) {
                zoomOut();
            }
        };
    }
    async createProcessTree(processRoots) {
        const container = document.getElementById('process-list');
        if (!container) {
            return;
        }
        const { totalmem } = await this.nativeHostService.getOSStatistics();
        const renderers = [
            new ProcessRenderer(this.data.platform, totalmem, this.mapPidToWindowTitle),
            new ProcessHeaderTreeRenderer(),
            new MachineRenderer(),
            new ErrorRenderer()
        ];
        this.tree = new DataTree('processExplorer', container, new ProcessListDelegate(), renderers, new ProcessTreeDataSource(), {
            identityProvider: {
                getId: (element) => {
                    if (isProcessItem(element)) {
                        return element.pid.toString();
                    }
                    if (isRemoteDiagnosticError(element)) {
                        return element.hostName;
                    }
                    if (isProcessInformation(element)) {
                        return 'processes';
                    }
                    if (isMachineProcessInformation(element)) {
                        return element.name;
                    }
                    return 'header';
                }
            },
        });
        this.tree.setInput({ processes: { processRoots } });
        this.tree.layout(window.innerHeight, window.innerWidth);
        this.tree.onContextMenu(e => {
            if (isProcessItem(e.element)) {
                this.showContextMenu(e.element, true);
            }
        });
        container.style.height = `${window.innerHeight}px`;
        window.addEventListener('resize', () => {
            container.style.height = `${window.innerHeight}px`;
            this.tree?.layout(window.innerHeight, window.innerWidth);
        });
    }
    isDebuggable(cmd) {
        const matches = DEBUG_FLAGS_PATTERN.exec(cmd);
        return (matches && matches.length >= 2) || cmd.indexOf('node ') >= 0 || cmd.indexOf('node.exe') >= 0;
    }
    attachTo(item) {
        const config = {
            type: 'node',
            request: 'attach',
            name: `process ${item.pid}`
        };
        let matches = DEBUG_FLAGS_PATTERN.exec(item.cmd);
        if (matches && matches.length >= 2) {
            // attach via port
            if (matches.length === 4 && matches[3]) {
                config.port = parseInt(matches[3]);
            }
            config.protocol = matches[1] === 'debug' ? 'legacy' : 'inspector';
        }
        else {
            // no port -> try to attach via pid (send SIGUSR1)
            config.processId = String(item.pid);
        }
        // a debug-port=n or inspect-port=n overrides the port
        matches = DEBUG_PORT_PATTERN.exec(item.cmd);
        if (matches && matches.length === 3) {
            // override port
            config.port = parseInt(matches[2]);
        }
        ipcRenderer.send('vscode:workbenchCommand', { id: 'debug.startFromConfig', from: 'processExplorer', args: [config] });
    }
    applyStyles(styles) {
        const styleElement = createStyleSheet();
        const content = [];
        if (styles.listFocusBackground) {
            content.push(`.monaco-list:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
            content.push(`.monaco-list:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
        }
        if (styles.listFocusForeground) {
            content.push(`.monaco-list:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
        }
        if (styles.listActiveSelectionBackground) {
            content.push(`.monaco-list:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
            content.push(`.monaco-list:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
        }
        if (styles.listActiveSelectionForeground) {
            content.push(`.monaco-list:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
        }
        if (styles.listHoverBackground) {
            content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
        }
        if (styles.listHoverForeground) {
            content.push(`.monaco-list-row:hover:not(.selected):not(.focused) { color: ${styles.listHoverForeground}; }`);
        }
        if (styles.listFocusOutline) {
            content.push(`.monaco-list:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`);
        }
        if (styles.listHoverOutline) {
            content.push(`.monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
        }
        // Scrollbars
        if (styles.scrollbarShadowColor) {
            content.push(`
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${styles.scrollbarShadowColor} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${styles.scrollbarShadowColor} 6px 6px 6px -6px inset;
				}
			`);
        }
        if (styles.scrollbarSliderBackgroundColor) {
            content.push(`
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${styles.scrollbarSliderBackgroundColor};
				}
			`);
        }
        if (styles.scrollbarSliderHoverBackgroundColor) {
            content.push(`
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${styles.scrollbarSliderHoverBackgroundColor};
				}
			`);
        }
        if (styles.scrollbarSliderActiveBackgroundColor) {
            content.push(`
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${styles.scrollbarSliderActiveBackgroundColor};
				}
			`);
        }
        styleElement.textContent = content.join('\n');
        if (styles.color) {
            document.body.style.color = styles.color;
        }
    }
    showContextMenu(item, isLocal) {
        const items = [];
        const pid = Number(item.pid);
        if (isLocal) {
            items.push({
                label: localize('killProcess', "Kill Process"),
                click: () => {
                    this.nativeHostService.killProcess(pid, 'SIGTERM');
                }
            });
            items.push({
                label: localize('forceKillProcess', "Force Kill Process"),
                click: () => {
                    this.nativeHostService.killProcess(pid, 'SIGKILL');
                }
            });
            items.push({
                type: 'separator'
            });
        }
        items.push({
            label: localize('copy', "Copy"),
            click: () => {
                // Collect the selected pids
                const selectionPids = this.tree?.getSelection()?.map(e => {
                    if (!e || !('pid' in e)) {
                        return undefined;
                    }
                    return e.pid;
                }).filter(e => !!e);
                // If the selection does not contain the right clicked item, copy the right clicked
                // item only.
                if (!selectionPids?.includes(pid)) {
                    selectionPids.length = 0;
                    selectionPids.push(pid);
                }
                const rows = selectionPids?.map(e => document.getElementById(`pid-${e}`)).filter(e => !!e);
                if (rows) {
                    const text = rows.map(e => e.innerText).filter(e => !!e);
                    this.nativeHostService.writeClipboardText(text.join('\n'));
                }
            }
        });
        items.push({
            label: localize('copyAll', "Copy All"),
            click: () => {
                const processList = document.getElementById('process-list');
                if (processList) {
                    this.nativeHostService.writeClipboardText(processList.innerText);
                }
            }
        });
        if (item && isLocal && this.isDebuggable(item.cmd)) {
            items.push({
                type: 'separator'
            });
            items.push({
                label: localize('debug', "Debug"),
                click: () => {
                    this.attachTo(item);
                }
            });
        }
        popup(items);
    }
    requestProcessList(totalWaitTime) {
        setTimeout(() => {
            const nextRequestTime = Date.now();
            const waited = totalWaitTime + nextRequestTime - this.lastRequestTime;
            this.lastRequestTime = nextRequestTime;
            // Wait at least a second between requests.
            if (waited > 1000) {
                ipcRenderer.send('vscode:windowsInfoRequest');
                ipcRenderer.send('vscode:listProcesses');
            }
            else {
                this.requestProcessList(waited);
            }
        }, 200);
    }
}
function createCodiconStyleSheet() {
    const codiconStyleSheet = createStyleSheet();
    codiconStyleSheet.id = 'codiconStyles';
    const iconsStyleSheet = getIconsStyleSheet(undefined);
    function updateAll() {
        codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
    }
    const delayer = new RunOnceScheduler(updateAll, 0);
    iconsStyleSheet.onDidChange(() => delayer.schedule());
    delayer.schedule();
}
export function startup(configuration) {
    const platformClass = configuration.data.platform === 'win32' ? 'windows' : configuration.data.platform === 'linux' ? 'linux' : 'mac';
    document.body.classList.add(platformClass); // used by our fonts
    createCodiconStyleSheet();
    applyZoom(configuration.data.zoomLevel);
    new ProcessExplorer(configuration.windowId, configuration.data);
}
