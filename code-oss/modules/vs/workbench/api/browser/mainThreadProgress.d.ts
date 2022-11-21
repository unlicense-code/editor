import { IProgressService, IProgressStep, IProgressOptions } from 'vs/platform/progress/common/progress';
import { MainThreadProgressShape } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ICommandService } from 'vs/platform/commands/common/commands';
export declare class MainThreadProgress implements MainThreadProgressShape {
    private readonly _commandService;
    private readonly _progressService;
    private _progress;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, progressService: IProgressService, _commandService: ICommandService);
    dispose(): void;
    $startProgress(handle: number, options: IProgressOptions, extensionId?: string): Promise<void>;
    $progressReport(handle: number, message: IProgressStep): void;
    $progressEnd(handle: number): void;
    private _createTask;
}
