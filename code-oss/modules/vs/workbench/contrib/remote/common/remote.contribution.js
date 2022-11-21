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
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { ILabelService } from 'vs/platform/label/common/label';
import { isWeb, OS } from 'vs/base/common/platform';
import { Schemas } from 'vs/base/common/network';
import { IRemoteAgentService, RemoteExtensionLogFileName } from 'vs/workbench/services/remote/common/remoteAgentService';
import { ILoggerService, ILogService } from 'vs/platform/log/common/log';
import { LogLevelChannel, LogLevelChannelClient } from 'vs/platform/log/common/logIpc';
import { Extensions as OutputExt, } from 'vs/workbench/services/output/common/output';
import { localize } from 'vs/nls';
import { joinPath } from 'vs/base/common/resources';
import { Disposable } from 'vs/base/common/lifecycle';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IFileService } from 'vs/platform/files/common/files';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { firstOrDefault } from 'vs/base/common/arrays';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { PersistentConnection } from 'vs/platform/remote/common/remoteAgentConnection';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { getRemoteName } from 'vs/platform/remote/common/remoteHosts';
import { IDownloadService } from 'vs/platform/download/common/download';
import { DownloadServiceChannel } from 'vs/platform/download/common/downloadIpc';
import { timeout } from 'vs/base/common/async';
import { remotePtyHostLog, remoteServerLog } from 'vs/workbench/contrib/logs/common/logConstants';
let LabelContribution = class LabelContribution {
    labelService;
    remoteAgentService;
    constructor(labelService, remoteAgentService) {
        this.labelService = labelService;
        this.remoteAgentService = remoteAgentService;
        this.registerFormatters();
    }
    registerFormatters() {
        this.remoteAgentService.getEnvironment().then(remoteEnvironment => {
            const os = remoteEnvironment?.os || OS;
            const formatting = {
                label: '${path}',
                separator: os === 1 /* OperatingSystem.Windows */ ? '\\' : '/',
                tildify: os !== 1 /* OperatingSystem.Windows */,
                normalizeDriveLetter: os === 1 /* OperatingSystem.Windows */,
                workspaceSuffix: isWeb ? undefined : Schemas.vscodeRemote
            };
            this.labelService.registerFormatter({
                scheme: Schemas.vscodeRemote,
                formatting
            });
            if (remoteEnvironment) {
                this.labelService.registerFormatter({
                    scheme: Schemas.vscodeUserData,
                    formatting
                });
            }
        });
    }
};
LabelContribution = __decorate([
    __param(0, ILabelService),
    __param(1, IRemoteAgentService)
], LabelContribution);
export { LabelContribution };
let RemoteChannelsContribution = class RemoteChannelsContribution extends Disposable {
    constructor(logService, remoteAgentService, downloadService, loggerService) {
        super();
        const updateRemoteLogLevel = () => {
            const connection = remoteAgentService.getConnection();
            if (!connection) {
                return;
            }
            connection.withChannel('logger', (channel) => LogLevelChannelClient.setLevel(channel, logService.getLevel()));
        };
        updateRemoteLogLevel();
        this._register(logService.onDidChangeLogLevel(updateRemoteLogLevel));
        const connection = remoteAgentService.getConnection();
        if (connection) {
            connection.registerChannel('download', new DownloadServiceChannel(downloadService));
            connection.registerChannel('logger', new LogLevelChannel(logService, loggerService));
        }
    }
};
RemoteChannelsContribution = __decorate([
    __param(0, ILogService),
    __param(1, IRemoteAgentService),
    __param(2, IDownloadService),
    __param(3, ILoggerService)
], RemoteChannelsContribution);
let RemoteLogOutputChannels = class RemoteLogOutputChannels {
    constructor(remoteAgentService) {
        remoteAgentService.getEnvironment().then(remoteEnv => {
            if (remoteEnv) {
                const outputChannelRegistry = Registry.as(OutputExt.OutputChannels);
                outputChannelRegistry.registerChannel({ id: remoteServerLog, label: localize('remoteExtensionLog', "Remote Server"), file: joinPath(remoteEnv.logsPath, `${RemoteExtensionLogFileName}.log`), log: true });
                outputChannelRegistry.registerChannel({ id: remotePtyHostLog, label: localize('remotePtyHostLog', "Remote Pty Host"), file: joinPath(remoteEnv.logsPath, `${"ptyhost" /* TerminalLogConstants.FileName */}.log`), log: true });
            }
        });
    }
};
RemoteLogOutputChannels = __decorate([
    __param(0, IRemoteAgentService)
], RemoteLogOutputChannels);
let RemoteInvalidWorkspaceDetector = class RemoteInvalidWorkspaceDetector extends Disposable {
    fileService;
    dialogService;
    environmentService;
    contextService;
    fileDialogService;
    constructor(fileService, dialogService, environmentService, contextService, fileDialogService, remoteAgentService) {
        super();
        this.fileService = fileService;
        this.dialogService = dialogService;
        this.environmentService = environmentService;
        this.contextService = contextService;
        this.fileDialogService = fileDialogService;
        // When connected to a remote workspace, we currently cannot
        // validate that the workspace exists before actually opening
        // it. As such, we need to check on that after startup and guide
        // the user to a valid workspace.
        // (see https://github.com/microsoft/vscode/issues/133872)
        if (this.environmentService.remoteAuthority) {
            remoteAgentService.getEnvironment().then(remoteEnv => {
                if (remoteEnv) {
                    // we use the presence of `remoteEnv` to figure out
                    // if we got a healthy remote connection
                    // (see https://github.com/microsoft/vscode/issues/135331)
                    this.validateRemoteWorkspace();
                }
            });
        }
    }
    async validateRemoteWorkspace() {
        const workspace = this.contextService.getWorkspace();
        const workspaceUriToStat = workspace.configuration ?? firstOrDefault(workspace.folders)?.uri;
        if (!workspaceUriToStat) {
            return; // only when in workspace
        }
        const exists = await this.fileService.exists(workspaceUriToStat);
        if (exists) {
            return; // all good!
        }
        const res = await this.dialogService.confirm({
            type: 'warning',
            message: localize('invalidWorkspaceMessage', "Workspace does not exist"),
            detail: localize('invalidWorkspaceDetail', "The workspace does not exist. Please select another workspace to open."),
            primaryButton: localize('invalidWorkspacePrimary', "&&Open Workspace..."),
            secondaryButton: localize('invalidWorkspaceCancel', "&&Cancel")
        });
        if (res.confirmed) {
            // Pick Workspace
            if (workspace.configuration) {
                return this.fileDialogService.pickWorkspaceAndOpen({});
            }
            // Pick Folder
            return this.fileDialogService.pickFolderAndOpen({});
        }
    }
};
RemoteInvalidWorkspaceDetector = __decorate([
    __param(0, IFileService),
    __param(1, IDialogService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IWorkspaceContextService),
    __param(4, IFileDialogService),
    __param(5, IRemoteAgentService)
], RemoteInvalidWorkspaceDetector);
const EXT_HOST_LATENCY_SAMPLES = 5;
const EXT_HOST_LATENCY_DELAY = 2000;
let InitialRemoteConnectionHealthContribution = class InitialRemoteConnectionHealthContribution {
    _remoteAgentService;
    _environmentService;
    _telemetryService;
    constructor(_remoteAgentService, _environmentService, _telemetryService) {
        this._remoteAgentService = _remoteAgentService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        if (this._environmentService.remoteAuthority) {
            this._checkInitialRemoteConnectionHealth();
        }
    }
    async _checkInitialRemoteConnectionHealth() {
        try {
            await this._remoteAgentService.getRawEnvironment();
            this._telemetryService.publicLog2('remoteConnectionSuccess', {
                web: isWeb,
                connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                remoteName: getRemoteName(this._environmentService.remoteAuthority)
            });
            await this._measureExtHostLatency();
        }
        catch (err) {
            this._telemetryService.publicLog2('remoteConnectionFailure', {
                web: isWeb,
                connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
                remoteName: getRemoteName(this._environmentService.remoteAuthority),
                message: err ? err.message : ''
            });
        }
    }
    async _measureExtHostLatency() {
        // Get the minimum latency, since latency spikes could be caused by a busy extension host.
        let bestLatency = Infinity;
        for (let i = 0; i < EXT_HOST_LATENCY_SAMPLES; i++) {
            const rtt = await this._remoteAgentService.getRoundTripTime();
            if (rtt === undefined) {
                return;
            }
            bestLatency = Math.min(bestLatency, rtt / 2);
            await timeout(EXT_HOST_LATENCY_DELAY);
        }
        this._telemetryService.publicLog2('remoteConnectionLatency', {
            web: isWeb,
            remoteName: getRemoteName(this._environmentService.remoteAuthority),
            latencyMs: bestLatency
        });
    }
};
InitialRemoteConnectionHealthContribution = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, ITelemetryService)
], InitialRemoteConnectionHealthContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(LabelContribution, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteChannelsContribution, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteInvalidWorkspaceDetector, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteLogOutputChannels, 3 /* LifecyclePhase.Restored */);
workbenchContributionsRegistry.registerWorkbenchContribution(InitialRemoteConnectionHealthContribution, 2 /* LifecyclePhase.Ready */);
const enableDiagnostics = true;
if (enableDiagnostics) {
    class TriggerReconnectAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.triggerReconnect',
                title: { value: localize('triggerReconnect', "Connection: Trigger Reconnect"), original: 'Connection: Trigger Reconnect' },
                category: Categories.Developer,
                f1: true,
            });
        }
        async run(accessor) {
            PersistentConnection.debugTriggerReconnection();
        }
    }
    class PauseSocketWriting extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.pauseSocketWriting',
                title: { value: localize('pauseSocketWriting', "Connection: Pause socket writing"), original: 'Connection: Pause socket writing' },
                category: Categories.Developer,
                f1: true,
            });
        }
        async run(accessor) {
            PersistentConnection.debugPauseSocketWriting();
        }
    }
    registerAction2(TriggerReconnectAction);
    registerAction2(PauseSocketWriting);
}
const extensionKindSchema = {
    type: 'string',
    enum: [
        'ui',
        'workspace'
    ],
    enumDescriptions: [
        localize('ui', "UI extension kind. In a remote window, such extensions are enabled only when available on the local machine."),
        localize('workspace', "Workspace extension kind. In a remote window, such extensions are enabled only when available on the remote.")
    ],
};
Registry.as(ConfigurationExtensions.Configuration)
    .registerConfiguration({
    id: 'remote',
    title: localize('remote', "Remote"),
    type: 'object',
    properties: {
        'remote.extensionKind': {
            type: 'object',
            markdownDescription: localize('remote.extensionKind', "Override the kind of an extension. `ui` extensions are installed and run on the local machine while `workspace` extensions are run on the remote. By overriding an extension's default kind using this setting, you specify if that extension should be installed and enabled locally or remotely."),
            patternProperties: {
                '([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$': {
                    oneOf: [{ type: 'array', items: extensionKindSchema }, extensionKindSchema],
                    default: ['ui'],
                },
            },
            default: {
                'pub.name': ['ui']
            }
        },
        'remote.restoreForwardedPorts': {
            type: 'boolean',
            markdownDescription: localize('remote.restoreForwardedPorts', "Restores the ports you forwarded in a workspace."),
            default: true
        },
        'remote.autoForwardPorts': {
            type: 'boolean',
            markdownDescription: localize('remote.autoForwardPorts', "When enabled, new running processes are detected and ports that they listen on are automatically forwarded. Disabling this setting will not prevent all ports from being forwarded. Even when disabled, extensions will still be able to cause ports to be forwarded, and opening some URLs will still cause ports to forwarded."),
            default: true
        },
        'remote.autoForwardPortsSource': {
            type: 'string',
            markdownDescription: localize('remote.autoForwardPortsSource', "Sets the source from which ports are automatically forwarded when {0} is true. On Windows and Mac remotes, the `process` option has no effect and `output` will be used. Requires a reload to take effect.", '`#remote.autoForwardPorts#`'),
            enum: ['process', 'output'],
            enumDescriptions: [
                localize('remote.autoForwardPortsSource.process', "Ports will be automatically forwarded when discovered by watching for processes that are started and include a port."),
                localize('remote.autoForwardPortsSource.output', "Ports will be automatically forwarded when discovered by reading terminal and debug output. Not all processes that use ports will print to the integrated terminal or debug console, so some ports will be missed. Ports forwarded based on output will not be \"un-forwarded\" until reload or until the port is closed by the user in the Ports view.")
            ],
            default: 'process'
        },
        // Consider making changes to extensions\configuration-editing\schemas\devContainer.schema.src.json
        // and extensions\configuration-editing\schemas\attachContainer.schema.json
        // to keep in sync with devcontainer.json schema.
        'remote.portsAttributes': {
            type: 'object',
            patternProperties: {
                '(^\\d+(-\\d+)?$)|(.+)': {
                    type: 'object',
                    description: localize('remote.portsAttributes.port', "A port, range of ports (ex. \"40000-55000\"), host and port (ex. \"db:1234\"), or regular expression (ex. \".+\\\\/server.js\").  For a port number or range, the attributes will apply to that port number or range of port numbers. Attributes which use a regular expression will apply to ports whose associated process command line matches the expression."),
                    properties: {
                        'onAutoForward': {
                            type: 'string',
                            enum: ['notify', 'openBrowser', 'openBrowserOnce', 'openPreview', 'silent', 'ignore'],
                            enumDescriptions: [
                                localize('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                                localize('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                                localize('remote.portsAttributes.openBrowserOnce', "Opens the browser when the port is automatically forwarded, but only the first time the port is forward during a session. Depending on your settings, this could open an embedded browser."),
                                localize('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                                localize('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                                localize('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                            ],
                            description: localize('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                            default: 'notify'
                        },
                        'elevateIfNeeded': {
                            type: 'boolean',
                            description: localize('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                            default: false
                        },
                        'label': {
                            type: 'string',
                            description: localize('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                            default: localize('remote.portsAttributes.labelDefault', "Application")
                        },
                        'requireLocalPort': {
                            type: 'boolean',
                            markdownDescription: localize('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                            default: false
                        },
                        'protocol': {
                            type: 'string',
                            enum: ['http', 'https'],
                            description: localize('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                        }
                    },
                    default: {
                        'label': localize('remote.portsAttributes.labelDefault', "Application"),
                        'onAutoForward': 'notify'
                    }
                }
            },
            markdownDescription: localize('remote.portsAttributes', "Set properties that are applied when a specific port number is forwarded. For example:\n\n```\n\"3000\": {\n  \"label\": \"Application\"\n},\n\"40000-55000\": {\n  \"onAutoForward\": \"ignore\"\n},\n\".+\\\\/server.js\": {\n \"onAutoForward\": \"openPreview\"\n}\n```"),
            defaultSnippets: [{ body: { '${1:3000}': { label: '${2:Application}', onAutoForward: 'openPreview' } } }],
            errorMessage: localize('remote.portsAttributes.patternError', "Must be a port number, range of port numbers, or regular expression."),
            additionalProperties: false,
            default: {
                '443': {
                    'protocol': 'https'
                },
                '8443': {
                    'protocol': 'https'
                }
            }
        },
        'remote.otherPortsAttributes': {
            type: 'object',
            properties: {
                'onAutoForward': {
                    type: 'string',
                    enum: ['notify', 'openBrowser', 'openPreview', 'silent', 'ignore'],
                    enumDescriptions: [
                        localize('remote.portsAttributes.notify', "Shows a notification when a port is automatically forwarded."),
                        localize('remote.portsAttributes.openBrowser', "Opens the browser when the port is automatically forwarded. Depending on your settings, this could open an embedded browser."),
                        localize('remote.portsAttributes.openPreview', "Opens a preview in the same window when the port is automatically forwarded."),
                        localize('remote.portsAttributes.silent', "Shows no notification and takes no action when this port is automatically forwarded."),
                        localize('remote.portsAttributes.ignore', "This port will not be automatically forwarded.")
                    ],
                    description: localize('remote.portsAttributes.onForward', "Defines the action that occurs when the port is discovered for automatic forwarding"),
                    default: 'notify'
                },
                'elevateIfNeeded': {
                    type: 'boolean',
                    description: localize('remote.portsAttributes.elevateIfNeeded', "Automatically prompt for elevation (if needed) when this port is forwarded. Elevate is required if the local port is a privileged port."),
                    default: false
                },
                'label': {
                    type: 'string',
                    description: localize('remote.portsAttributes.label', "Label that will be shown in the UI for this port."),
                    default: localize('remote.portsAttributes.labelDefault', "Application")
                },
                'requireLocalPort': {
                    type: 'boolean',
                    markdownDescription: localize('remote.portsAttributes.requireLocalPort', "When true, a modal dialog will show if the chosen local port isn't used for forwarding."),
                    default: false
                },
                'protocol': {
                    type: 'string',
                    enum: ['http', 'https'],
                    description: localize('remote.portsAttributes.protocol', "The protocol to use when forwarding this port.")
                }
            },
            defaultSnippets: [{ body: { onAutoForward: 'ignore' } }],
            markdownDescription: localize('remote.portsAttributes.defaults', "Set default properties that are applied to all ports that don't get properties from the setting {0}. For example:\n\n```\n{\n  \"onAutoForward\": \"ignore\"\n}\n```", '`#remote.portsAttributes#`'),
            additionalProperties: false
        },
        'remote.localPortHost': {
            type: 'string',
            enum: ['localhost', 'allInterfaces'],
            default: 'localhost',
            description: localize('remote.localPortHost', "Specifies the local host name that will be used for port forwarding.")
        }
    }
});
