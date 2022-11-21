import { Disposable } from 'vs/base/common/lifecycle';
import { ILocalExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ILogService } from 'vs/platform/log/common/log';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare class ExtensionsLifecycle extends Disposable {
    private userDataProfilesService;
    private readonly logService;
    private processesLimiter;
    constructor(userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    postUninstall(extension: ILocalExtension): Promise<void>;
    private parseScript;
    private runLifecycleHook;
    private start;
    private getExtensionStoragePath;
}
