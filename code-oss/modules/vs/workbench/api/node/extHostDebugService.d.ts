import { ISignService } from 'vs/platform/sign/common/sign';
import { ExtHostDebugServiceBase, ExtHostDebugSession } from 'vs/workbench/api/common/extHostDebugService';
import { IExtHostEditorTabs } from 'vs/workbench/api/common/extHostEditorTabs';
import { IExtHostExtensionService } from 'vs/workbench/api/common/extHostExtensionService';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtHostTerminalService } from 'vs/workbench/api/common/extHostTerminalService';
import { DebugAdapterExecutable } from 'vs/workbench/api/common/extHostTypes';
import { IExtHostVariableResolverProvider } from 'vs/workbench/api/common/extHostVariableResolverService';
import { IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { AbstractDebugAdapter } from 'vs/workbench/contrib/debug/common/abstractDebugAdapter';
import { IAdapterDescriptor } from 'vs/workbench/contrib/debug/common/debug';
import { ExtensionDescriptionRegistry } from 'vs/workbench/services/extensions/common/extensionDescriptionRegistry';
import { IExtHostConfiguration } from '../common/extHostConfiguration';
export declare class ExtHostDebugService extends ExtHostDebugServiceBase {
    private _terminalService;
    readonly _serviceBrand: undefined;
    private _integratedTerminalInstances;
    private _terminalDisposedListener;
    constructor(extHostRpcService: IExtHostRpcService, workspaceService: IExtHostWorkspace, extensionService: IExtHostExtensionService, configurationService: IExtHostConfiguration, _terminalService: IExtHostTerminalService, editorTabs: IExtHostEditorTabs, variableResolver: IExtHostVariableResolverProvider);
    protected createDebugAdapter(adapter: IAdapterDescriptor, session: ExtHostDebugSession): AbstractDebugAdapter | undefined;
    protected daExecutableFromPackage(session: ExtHostDebugSession, extensionRegistry: ExtensionDescriptionRegistry): DebugAdapterExecutable | undefined;
    protected createSignService(): ISignService | undefined;
    $runInTerminal(args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
}
