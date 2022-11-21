import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { ILogService } from 'vs/platform/log/common/log';
import { IIPCObjectUrl, IProtocolMainService } from 'vs/platform/protocol/electron-main/protocol';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class ProtocolMainService extends Disposable implements IProtocolMainService {
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly validRoots;
    private readonly validExtensions;
    constructor(environmentService: INativeEnvironmentService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    private handleProtocols;
    addValidFileRoot(root: string): IDisposable;
    private handleFileRequest;
    private handleResourceRequest;
    private requestToNormalizedFilePath;
    createIPCObjectUrl<T>(): IIPCObjectUrl<T>;
}
