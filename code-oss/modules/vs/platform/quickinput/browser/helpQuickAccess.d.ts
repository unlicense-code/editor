import { IDisposable } from 'vs/base/common/lifecycle';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IQuickAccessProvider } from 'vs/platform/quickinput/common/quickAccess';
import { IQuickInputService, IQuickPick, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
interface IHelpQuickAccessPickItem extends IQuickPickItem {
    prefix: string;
}
export declare class HelpQuickAccessProvider implements IQuickAccessProvider {
    private readonly quickInputService;
    private readonly keybindingService;
    static PREFIX: string;
    private readonly registry;
    constructor(quickInputService: IQuickInputService, keybindingService: IKeybindingService);
    provide(picker: IQuickPick<IHelpQuickAccessPickItem>): IDisposable;
    getQuickAccessProviders(): IHelpQuickAccessPickItem[];
    private createPicks;
}
export {};
