import { SerializedError } from 'vs/base/common/errors';
import { Event } from 'vs/base/common/event';
export declare const IExtensionHostStarter: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionHostStarter>;
export declare const ipcExtensionHostStarterChannelName = "extensionHostStarter";
export interface IExtensionHostProcessOptions {
    responseWindowId: number;
    responseChannel: string;
    responseNonce: string;
    env: {
        [key: string]: string | undefined;
    };
    detached: boolean;
    execArgv: string[] | undefined;
    silent: boolean;
}
export interface IExtensionHostStarter {
    readonly _serviceBrand: undefined;
    onDynamicStdout(id: string): Event<string>;
    onDynamicStderr(id: string): Event<string>;
    onDynamicMessage(id: string): Event<any>;
    onDynamicError(id: string): Event<{
        error: SerializedError;
    }>;
    onDynamicExit(id: string): Event<{
        code: number;
        signal: string;
    }>;
    canUseUtilityProcess(): Promise<boolean>;
    createExtensionHost(useUtilityProcess: boolean): Promise<{
        id: string;
    }>;
    start(id: string, opts: IExtensionHostProcessOptions): Promise<void>;
    enableInspectPort(id: string): Promise<boolean>;
    kill(id: string): Promise<void>;
}
