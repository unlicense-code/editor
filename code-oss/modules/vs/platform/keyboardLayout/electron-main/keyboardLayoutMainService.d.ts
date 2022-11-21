import { Disposable } from 'vs/base/common/lifecycle';
import { IKeyboardLayoutData, INativeKeyboardLayoutService } from 'vs/platform/keyboardLayout/common/keyboardLayoutService';
import { ILifecycleMainService } from 'vs/platform/lifecycle/electron-main/lifecycleMainService';
export declare const IKeyboardLayoutMainService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IKeyboardLayoutMainService>;
export interface IKeyboardLayoutMainService extends INativeKeyboardLayoutService {
}
export declare class KeyboardLayoutMainService extends Disposable implements INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeKeyboardLayout;
    readonly onDidChangeKeyboardLayout: import("vs/base/common/event").Event<IKeyboardLayoutData>;
    private _initPromise;
    private _keyboardLayoutData;
    constructor(lifecycleMainService: ILifecycleMainService);
    private _initialize;
    private _doInitialize;
    getKeyboardLayoutData(): Promise<IKeyboardLayoutData>;
}
