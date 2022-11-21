import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { Disposable } from 'vs/base/common/lifecycle';
import { IKeyboardLayoutService } from 'vs/platform/keyboardLayout/common/keyboardLayout';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class KeyboardLayoutPickerContribution extends Disposable implements IWorkbenchContribution {
    private readonly keyboardLayoutService;
    private readonly statusbarService;
    private readonly pickerElement;
    constructor(keyboardLayoutService: IKeyboardLayoutService, statusbarService: IStatusbarService);
}
