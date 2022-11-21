import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { SandboxLocalProcessExtensionHost } from 'vs/workbench/services/extensions/electron-sandbox/localProcessExtensionHost';
export declare class NativeLocalProcessExtensionHost extends SandboxLocalProcessExtensionHost {
    protected _start(): Promise<IMessagePassingProtocol>;
}
