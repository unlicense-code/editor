import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { KeymapInfo } from 'vs/workbench/services/keybinding/common/keymapInfo';
import { DispatchConfig } from 'vs/platform/keyboardLayout/common/dispatchConfig';
import { IKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IFileService } from 'vs/platform/files/common/files';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IKeyboardLayoutInfo, IKeyboardLayoutService, IKeyboardMapping } from 'vs/platform/keyboardLayout/common/keyboardLayout';
export declare class BrowserKeyboardMapperFactoryBase {
    protected _initialized: boolean;
    protected _keyboardMapper: IKeyboardMapper | null;
    private readonly _onDidChangeKeyboardMapper;
    readonly onDidChangeKeyboardMapper: Event<void>;
    protected _keymapInfos: KeymapInfo[];
    protected _mru: KeymapInfo[];
    private _activeKeymapInfo;
    get activeKeymap(): KeymapInfo | null;
    get keymapInfos(): KeymapInfo[];
    get activeKeyboardLayout(): IKeyboardLayoutInfo | null;
    get activeKeyMapping(): IKeyboardMapping | null;
    get keyboardLayouts(): IKeyboardLayoutInfo[];
    protected constructor();
    registerKeyboardLayout(layout: KeymapInfo): void;
    removeKeyboardLayout(layout: KeymapInfo): void;
    getMatchedKeymapInfo(keyMapping: IKeyboardMapping | null): {
        result: KeymapInfo;
        score: number;
    } | null;
    getUSStandardLayout(): KeymapInfo | null;
    isKeyMappingActive(keymap: IKeyboardMapping | null): boolean | null;
    setUSKeyboardLayout(): void;
    setActiveKeyMapping(keymap: IKeyboardMapping | null): void;
    setActiveKeymapInfo(keymapInfo: KeymapInfo): void;
    setLayoutFromBrowserAPI(): void;
    private _updateKeyboardLayoutAsync;
    getKeyboardMapper(dispatchConfig: DispatchConfig): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
    setKeyboardLayout(layoutName: string): void;
    private _setKeyboardData;
    private static _createKeyboardMapper;
    private _validateCurrentKeyboardMapping;
    private _getBrowserKeyMapping;
}
export declare class BrowserKeyboardMapperFactory extends BrowserKeyboardMapperFactoryBase {
    constructor(notificationService: INotificationService, storageService: IStorageService, commandService: ICommandService);
}
export declare class BrowserKeyboardLayoutService extends Disposable implements IKeyboardLayoutService {
    private configurationService;
    _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: Event<void>;
    private _userKeyboardLayout;
    private readonly _factory;
    private _keyboardLayoutMode;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, notificationService: INotificationService, storageService: IStorageService, commandService: ICommandService, configurationService: IConfigurationService);
    setUserKeyboardLayoutIfMatched(): void;
    getKeyboardMapper(dispatchConfig: DispatchConfig): IKeyboardMapper;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getRawKeyboardMapping(): IKeyboardMapping | null;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
