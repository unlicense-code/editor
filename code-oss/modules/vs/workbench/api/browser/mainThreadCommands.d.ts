import { ICommandService } from 'vs/platform/commands/common/commands';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { SerializableObjectWithBuffers } from 'vs/workbench/services/extensions/common/proxyIdentifier';
import { MainThreadCommandsShape } from '../common/extHost.protocol';
export declare class MainThreadCommands implements MainThreadCommandsShape {
    private readonly _commandService;
    private readonly _extensionService;
    private readonly _commandRegistrations;
    private readonly _generateCommandsDocumentationRegistration;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _commandService: ICommandService, _extensionService: IExtensionService);
    dispose(): void;
    private _generateCommandsDocumentation;
    $registerCommand(id: string): void;
    $unregisterCommand(id: string): void;
    $fireCommandActivationEvent(id: string): void;
    $executeCommand<T>(id: string, args: any[] | SerializableObjectWithBuffers<any[]>, retry: boolean): Promise<T | undefined>;
    $getCommands(): Promise<string[]>;
}
