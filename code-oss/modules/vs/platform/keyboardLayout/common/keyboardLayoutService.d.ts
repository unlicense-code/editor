import { Event } from 'vs/base/common/event';
import { IKeyboardLayoutInfo, IKeyboardMapping } from 'vs/platform/keyboardLayout/common/keyboardLayout';
export interface IKeyboardLayoutData {
    keyboardLayoutInfo: IKeyboardLayoutInfo;
    keyboardMapping: IKeyboardMapping;
}
export interface INativeKeyboardLayoutService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeKeyboardLayout: Event<IKeyboardLayoutData>;
    getKeyboardLayoutData(): Promise<IKeyboardLayoutData>;
}
