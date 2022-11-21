import { Disposable } from 'vs/base/common/lifecycle';
import { IKeyboardLayoutInfo, IKeyboardLayoutService, IKeyboardMapping } from 'vs/platform/keyboardLayout/common/keyboardLayout';
import { IKeyboardMapper } from 'vs/platform/keyboardLayout/common/keyboardMapper';
import { DispatchConfig } from 'vs/platform/keyboardLayout/common/dispatchConfig';
import { IKeyboardEvent } from 'vs/platform/keybinding/common/keybinding';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
export declare class KeyboardLayoutService extends Disposable implements IKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: import("vs/base/common/event").Event<void>;
    private readonly _keyboardLayoutService;
    private _initPromise;
    private _keyboardMapping;
    private _keyboardLayoutInfo;
    private _keyboardMapper;
    constructor(mainProcessService: IMainProcessService);
    initialize(): Promise<void>;
    private _doInitialize;
    getRawKeyboardMapping(): IKeyboardMapping | null;
    getCurrentKeyboardLayout(): IKeyboardLayoutInfo | null;
    getAllKeyboardLayouts(): IKeyboardLayoutInfo[];
    getKeyboardMapper(dispatchConfig: DispatchConfig): IKeyboardMapper;
    validateCurrentKeyboardMapping(keyboardEvent: IKeyboardEvent): void;
}
