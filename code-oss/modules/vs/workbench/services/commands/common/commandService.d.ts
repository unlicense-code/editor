import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ICommandService, ICommandEvent } from 'vs/platform/commands/common/commands';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
export declare class CommandService extends Disposable implements ICommandService {
    private readonly _instantiationService;
    private readonly _extensionService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _extensionHostIsReady;
    private _starActivation;
    private readonly _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    private readonly _onDidExecuteCommand;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(_instantiationService: IInstantiationService, _extensionService: IExtensionService, _logService: ILogService);
    private _activateStar;
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
    private _tryExecuteCommand;
}
