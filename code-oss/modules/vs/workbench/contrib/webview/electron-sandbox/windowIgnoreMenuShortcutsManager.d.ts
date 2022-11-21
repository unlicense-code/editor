import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
export declare class WindowIgnoreMenuShortcutsManager {
    private readonly _nativeHostService;
    private readonly _isUsingNativeTitleBars;
    private readonly _webviewMainService;
    constructor(configurationService: IConfigurationService, mainProcessService: IMainProcessService, _nativeHostService: INativeHostService);
    didFocus(): void;
    didBlur(): void;
    private get _shouldToggleMenuShortcutsEnablement();
    protected setIgnoreMenuShortcuts(value: boolean): void;
}
