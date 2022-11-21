import { MainThreadTerminalServiceShape, TerminalLaunchConfig, ExtHostTerminalIdentifier } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IProcessProperty } from 'vs/platform/terminal/common/terminal';
import { ITerminalEditorService, ITerminalGroupService, ITerminalInstanceService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IEnvironmentVariableService, ISerializableEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { ITerminalProfileResolverService, ITerminalProfileService } from 'vs/workbench/contrib/terminal/common/terminal';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare class MainThreadTerminalService implements MainThreadTerminalServiceShape {
    private readonly _extHostContext;
    private readonly _terminalService;
    readonly terminalInstanceService: ITerminalInstanceService;
    private readonly _instantiationService;
    private readonly _environmentVariableService;
    private readonly _logService;
    private readonly _terminalProfileResolverService;
    private readonly _terminalGroupService;
    private readonly _terminalEditorService;
    private readonly _terminalProfileService;
    private _proxy;
    /**
     * Stores a map from a temporary terminal id (a UUID generated on the extension host side)
     * to a numeric terminal id (an id generated on the renderer side)
     * This comes in play only when dealing with terminals created on the extension host side
     */
    private _extHostTerminals;
    private readonly _toDispose;
    private readonly _terminalProcessProxies;
    private readonly _profileProviders;
    private _dataEventTracker;
    /**
     * A single shared terminal link provider for the exthost. When an ext registers a link
     * provider, this is registered with the terminal on the renderer side and all links are
     * provided through this, even from multiple ext link providers. Xterm should remove lower
     * priority intersecting links itself.
     */
    private _linkProvider;
    private _os;
    constructor(_extHostContext: IExtHostContext, _terminalService: ITerminalService, terminalInstanceService: ITerminalInstanceService, _instantiationService: IInstantiationService, _environmentVariableService: IEnvironmentVariableService, _logService: ILogService, _terminalProfileResolverService: ITerminalProfileResolverService, remoteAgentService: IRemoteAgentService, _terminalGroupService: ITerminalGroupService, _terminalEditorService: ITerminalEditorService, _terminalProfileService: ITerminalProfileService);
    dispose(): void;
    private _updateDefaultProfile;
    private _getTerminalInstance;
    $createTerminal(extHostTerminalId: string, launchConfig: TerminalLaunchConfig): Promise<void>;
    private _deserializeParentTerminal;
    $show(id: ExtHostTerminalIdentifier, preserveFocus: boolean): Promise<void>;
    $hide(id: ExtHostTerminalIdentifier): Promise<void>;
    $dispose(id: ExtHostTerminalIdentifier): Promise<void>;
    $sendText(id: ExtHostTerminalIdentifier, text: string, addNewLine: boolean): Promise<void>;
    $sendProcessExit(terminalId: number, exitCode: number | undefined): void;
    $startSendingDataEvents(): void;
    $stopSendingDataEvents(): void;
    $startLinkProvider(): void;
    $stopLinkProvider(): void;
    $registerProcessSupport(isSupported: boolean): void;
    $registerProfileProvider(id: string, extensionIdentifier: string): void;
    $unregisterProfileProvider(id: string): void;
    private _onActiveTerminalChanged;
    private _onTerminalData;
    private _onTitleChanged;
    private _onTerminalDisposed;
    private _onTerminalOpened;
    private _onTerminalProcessIdReady;
    private _onInstanceDimensionsChanged;
    private _onInstanceMaximumDimensionsChanged;
    private _onRequestStartExtensionTerminal;
    $sendProcessData(terminalId: number, data: string): void;
    $sendProcessReady(terminalId: number, pid: number, cwd: string): void;
    $sendProcessProperty(terminalId: number, property: IProcessProperty<any>): void;
    private _onRequestLatency;
    private _getTerminalProcess;
    $setEnvironmentVariableCollection(extensionIdentifier: string, persistent: boolean, collection: ISerializableEnvironmentVariableCollection | undefined): void;
}
