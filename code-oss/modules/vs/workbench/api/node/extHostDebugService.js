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
import { createCancelablePromise, firstParallel } from 'vs/base/common/async';
import * as platform from 'vs/base/common/platform';
import * as nls from 'vs/nls';
import { LinuxExternalTerminalService, MacExternalTerminalService, WindowsExternalTerminalService } from 'vs/platform/externalTerminal/node/externalTerminalService';
import { SignService } from 'vs/platform/sign/node/signService';
import { ExtHostDebugServiceBase } from 'vs/workbench/api/common/extHostDebugService';
import { IExtHostEditorTabs } from 'vs/workbench/api/common/extHostEditorTabs';
import { IExtHostExtensionService } from 'vs/workbench/api/common/extHostExtensionService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtHostTerminalService } from 'vs/workbench/api/common/extHostTerminalService';
import { DebugAdapterExecutable, ThemeIcon } from 'vs/workbench/api/common/extHostTypes';
import { IExtHostVariableResolverProvider } from 'vs/workbench/api/common/extHostVariableResolverService';
import { IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { ExecutableDebugAdapter, NamedPipeDebugAdapter, SocketDebugAdapter } from 'vs/workbench/contrib/debug/node/debugAdapter';
import { hasChildProcesses, prepareCommand } from 'vs/workbench/contrib/debug/node/terminals';
import { IExtHostConfiguration } from '../common/extHostConfiguration';
let ExtHostDebugService = class ExtHostDebugService extends ExtHostDebugServiceBase {
    _terminalService;
    _serviceBrand = undefined;
    _integratedTerminalInstances = new DebugTerminalCollection();
    _terminalDisposedListener;
    constructor(extHostRpcService, workspaceService, extensionService, configurationService, _terminalService, editorTabs, variableResolver) {
        super(extHostRpcService, workspaceService, extensionService, configurationService, editorTabs, variableResolver);
        this._terminalService = _terminalService;
    }
    createDebugAdapter(adapter, session) {
        switch (adapter.type) {
            case 'server':
                return new SocketDebugAdapter(adapter);
            case 'pipeServer':
                return new NamedPipeDebugAdapter(adapter);
            case 'executable':
                return new ExecutableDebugAdapter(adapter, session.type);
        }
        return super.createDebugAdapter(adapter, session);
    }
    daExecutableFromPackage(session, extensionRegistry) {
        const dae = ExecutableDebugAdapter.platformAdapterExecutable(extensionRegistry.getAllExtensionDescriptions(), session.type);
        if (dae) {
            return new DebugAdapterExecutable(dae.command, dae.args, dae.options);
        }
        return undefined;
    }
    createSignService() {
        return new SignService();
    }
    async $runInTerminal(args, sessionId) {
        if (args.kind === 'integrated') {
            if (!this._terminalDisposedListener) {
                // React on terminal disposed and check if that is the debug terminal #12956
                this._terminalDisposedListener = this._terminalService.onDidCloseTerminal(terminal => {
                    this._integratedTerminalInstances.onTerminalClosed(terminal);
                });
            }
            const configProvider = await this._configurationService.getConfigProvider();
            const shell = this._terminalService.getDefaultShell(true);
            const shellArgs = this._terminalService.getDefaultShellArgs(true);
            const terminalName = args.title || nls.localize('debug.terminal.title', "Debug Process");
            const shellConfig = JSON.stringify({ shell, shellArgs });
            let terminal = await this._integratedTerminalInstances.checkout(shellConfig, terminalName);
            let cwdForPrepareCommand;
            let giveShellTimeToInitialize = false;
            if (!terminal) {
                const options = {
                    shellPath: shell,
                    shellArgs: shellArgs,
                    cwd: args.cwd,
                    name: terminalName,
                    iconPath: new ThemeIcon('debug'),
                };
                giveShellTimeToInitialize = true;
                terminal = this._terminalService.createTerminalFromOptions(options, {
                    isFeatureTerminal: true,
                    useShellEnvironment: true
                });
                this._integratedTerminalInstances.insert(terminal, shellConfig);
            }
            else {
                cwdForPrepareCommand = args.cwd;
            }
            terminal.show(true);
            const shellProcessId = await terminal.processId;
            if (giveShellTimeToInitialize) {
                // give a new terminal some time to initialize the shell
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            else {
                if (configProvider.getConfiguration('debug.terminal').get('clearBeforeReusing')) {
                    // clear terminal before reusing it
                    if (shell.indexOf('powershell') >= 0 || shell.indexOf('pwsh') >= 0 || shell.indexOf('cmd.exe') >= 0) {
                        terminal.sendText('cls');
                    }
                    else if (shell.indexOf('bash') >= 0) {
                        terminal.sendText('clear');
                    }
                    else if (platform.isWindows) {
                        terminal.sendText('cls');
                    }
                    else {
                        terminal.sendText('clear');
                    }
                }
            }
            const command = prepareCommand(shell, args.args, !!args.argsCanBeInterpretedByShell, cwdForPrepareCommand, args.env);
            terminal.sendText(command);
            // Mark terminal as unused when its session ends, see #112055
            const sessionListener = this.onDidTerminateDebugSession(s => {
                if (s.id === sessionId) {
                    this._integratedTerminalInstances.free(terminal);
                    sessionListener.dispose();
                }
            });
            return shellProcessId;
        }
        else if (args.kind === 'external') {
            return runInExternalTerminal(args, await this._configurationService.getConfigProvider());
        }
        return super.$runInTerminal(args, sessionId);
    }
};
ExtHostDebugService = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostWorkspace),
    __param(2, IExtHostExtensionService),
    __param(3, IExtHostConfiguration),
    __param(4, IExtHostTerminalService),
    __param(5, IExtHostEditorTabs),
    __param(6, IExtHostVariableResolverProvider)
], ExtHostDebugService);
export { ExtHostDebugService };
let externalTerminalService = undefined;
function runInExternalTerminal(args, configProvider) {
    if (!externalTerminalService) {
        if (platform.isWindows) {
            externalTerminalService = new WindowsExternalTerminalService();
        }
        else if (platform.isMacintosh) {
            externalTerminalService = new MacExternalTerminalService();
        }
        else if (platform.isLinux) {
            externalTerminalService = new LinuxExternalTerminalService();
        }
        else {
            throw new Error('external terminals not supported on this platform');
        }
    }
    const config = configProvider.getConfiguration('terminal');
    return externalTerminalService.runInTerminal(args.title, args.cwd, args.args, args.env || {}, config.external || {});
}
class DebugTerminalCollection {
    /**
     * Delay before a new terminal is a candidate for reuse. See #71850
     */
    static minUseDelay = 1000;
    _terminalInstances = new Map();
    async checkout(config, name) {
        const entries = [...this._terminalInstances.entries()];
        const promises = entries.map(([terminal, termInfo]) => createCancelablePromise(async (ct) => {
            // Only allow terminals that match the title.  See #123189
            if (terminal.name !== name) {
                return null;
            }
            if (termInfo.lastUsedAt !== -1 && await hasChildProcesses(await terminal.processId)) {
                return null;
            }
            // important: date check and map operations must be synchronous
            const now = Date.now();
            if (termInfo.lastUsedAt + DebugTerminalCollection.minUseDelay > now || ct.isCancellationRequested) {
                return null;
            }
            if (termInfo.config !== config) {
                return null;
            }
            termInfo.lastUsedAt = now;
            return terminal;
        }));
        return await firstParallel(promises, (t) => !!t);
    }
    insert(terminal, termConfig) {
        this._terminalInstances.set(terminal, { lastUsedAt: Date.now(), config: termConfig });
    }
    free(terminal) {
        const info = this._terminalInstances.get(terminal);
        if (info) {
            info.lastUsedAt = -1;
        }
    }
    onTerminalClosed(terminal) {
        this._terminalInstances.delete(terminal);
    }
}
