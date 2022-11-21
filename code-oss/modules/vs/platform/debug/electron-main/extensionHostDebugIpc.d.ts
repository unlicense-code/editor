import { ExtensionHostDebugBroadcastChannel } from 'vs/platform/debug/common/extensionHostDebugIpc';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
export declare class ElectronExtensionHostDebugBroadcastChannel<TContext> extends ExtensionHostDebugBroadcastChannel<TContext> {
    private windowsMainService;
    constructor(windowsMainService: IWindowsMainService);
    call(ctx: TContext, command: string, arg?: any): Promise<any>;
    private openExtensionDevelopmentHostWindow;
}
