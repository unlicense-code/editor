import { IProcessEnvironment } from 'vs/base/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { NativeParsedArgs } from 'vs/platform/environment/common/argv';
import { ILogService } from 'vs/platform/log/common/log';
import { IURLService } from 'vs/platform/url/common/url';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
export declare const ID = "launchMainService";
export declare const ILaunchMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ILaunchMainService>;
export interface IStartArguments {
    readonly args: NativeParsedArgs;
    readonly userEnv: IProcessEnvironment;
}
export interface ILaunchMainService {
    readonly _serviceBrand: undefined;
    start(args: NativeParsedArgs, userEnv: IProcessEnvironment): Promise<void>;
    getMainProcessId(): Promise<number>;
}
export declare class LaunchMainService implements ILaunchMainService {
    private readonly logService;
    private readonly windowsMainService;
    private readonly urlService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, urlService: IURLService, configurationService: IConfigurationService);
    start(args: NativeParsedArgs, userEnv: IProcessEnvironment): Promise<void>;
    private parseOpenUrl;
    private startOpenWindow;
    getMainProcessId(): Promise<number>;
}
