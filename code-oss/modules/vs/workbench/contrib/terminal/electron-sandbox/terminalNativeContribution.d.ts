import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { Disposable } from 'vs/base/common/lifecycle';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class TerminalNativeContribution extends Disposable implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _terminalService;
    readonly instantiationService: IInstantiationService;
    readonly remoteAgentService: IRemoteAgentService;
    readonly nativeHostService: INativeHostService;
    _serviceBrand: undefined;
    constructor(_fileService: IFileService, _terminalService: ITerminalService, instantiationService: IInstantiationService, remoteAgentService: IRemoteAgentService, nativeHostService: INativeHostService);
    private _onOsResume;
    private _onOpenFileRequest;
    private _whenFileDeleted;
}
