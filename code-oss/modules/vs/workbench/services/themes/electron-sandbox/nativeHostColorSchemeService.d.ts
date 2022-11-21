import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostColorSchemeService } from 'vs/workbench/services/themes/common/hostColorSchemeService';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class NativeHostColorSchemeService extends Disposable implements IHostColorSchemeService {
    private readonly nativeHostService;
    private storageService;
    static readonly STORAGE_KEY = "HostColorSchemeData";
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeColorScheme;
    readonly onDidChangeColorScheme: import("vs/base/common/event").Event<void>;
    dark: boolean;
    highContrast: boolean;
    constructor(nativeHostService: INativeHostService, environmentService: INativeWorkbenchEnvironmentService, storageService: IStorageService);
    private getStoredValue;
    private update;
}
