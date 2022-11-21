import { IQuickInputService, IQuickPickItem } from 'vs/platform/quickinput/common/quickInput';
import { IDetectedLinks } from 'vs/workbench/contrib/terminal/browser/links/terminalLinkManager';
import { ILink } from 'xterm';
export declare class TerminalLinkQuickpick {
    private readonly _quickInputService;
    private readonly _onDidRequestMoreLinks;
    readonly onDidRequestMoreLinks: import("vs/base/common/event").Event<void>;
    constructor(_quickInputService: IQuickInputService);
    show(links: IDetectedLinks): Promise<void>;
    private _generatePicks;
}
export interface ITerminalLinkQuickPickItem extends IQuickPickItem {
    link: ILink;
}
