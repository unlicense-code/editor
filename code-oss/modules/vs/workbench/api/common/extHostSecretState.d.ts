import { ExtHostSecretStateShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
export declare class ExtHostSecretState implements ExtHostSecretStateShape {
    private _proxy;
    private _onDidChangePassword;
    readonly onDidChangePassword: import("vs/base/common/event").Event<{
        extensionId: string;
        key: string;
    }>;
    constructor(mainContext: IExtHostRpcService);
    $onDidChangePassword(e: {
        extensionId: string;
        key: string;
    }): Promise<void>;
    get(extensionId: string, key: string): Promise<string | undefined>;
    store(extensionId: string, key: string, value: string): Promise<void>;
    delete(extensionId: string, key: string): Promise<void>;
}
export interface IExtHostSecretState extends ExtHostSecretState {
}
export declare const IExtHostSecretState: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostSecretState>;
