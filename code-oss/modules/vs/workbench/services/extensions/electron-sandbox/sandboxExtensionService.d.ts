import { ExtensionRunningLocation, IExtensionHost } from 'vs/workbench/services/extensions/common/extensions';
import { ElectronExtensionService } from 'vs/workbench/services/extensions/electron-sandbox/electronExtensionService';
export declare class SandboxExtensionService extends ElectronExtensionService {
    protected _createExtensionHost(runningLocation: ExtensionRunningLocation, isInitialStart: boolean): IExtensionHost | null;
}
