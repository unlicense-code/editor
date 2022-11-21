import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { NativeEnvironmentService } from 'vs/platform/environment/node/environmentService';
export declare const IEnvironmentMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEnvironmentMainService>;
/**
 * A subclass of the `INativeEnvironmentService` to be used only in electron-main
 * environments.
 */
export interface IEnvironmentMainService extends INativeEnvironmentService {
    cachedLanguagesPath: string;
    backupHome: string;
    codeCachePath: string | undefined;
    useCodeCache: boolean;
    mainIPCHandle: string;
    mainLockfile: string;
    disableUpdates: boolean;
}
export declare class EnvironmentMainService extends NativeEnvironmentService implements IEnvironmentMainService {
    get cachedLanguagesPath(): string;
    get backupHome(): string;
    get mainIPCHandle(): string;
    get mainLockfile(): string;
    get disableUpdates(): boolean;
    get disableKeytar(): boolean;
    get crossOriginIsolated(): boolean;
    get codeCachePath(): string | undefined;
    get useCodeCache(): boolean;
}
