import { IProcessEnvironment } from 'vs/base/common/platform';
export declare const IShellEnvironmentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IShellEnvironmentService>;
export interface IShellEnvironmentService {
    readonly _serviceBrand: undefined;
    getShellEnv(): Promise<IProcessEnvironment>;
}
export declare class ShellEnvironmentService implements IShellEnvironmentService {
    readonly _serviceBrand: undefined;
    getShellEnv(): Promise<IProcessEnvironment>;
}
