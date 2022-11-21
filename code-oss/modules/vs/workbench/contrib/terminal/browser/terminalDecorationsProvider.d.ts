import { URI } from 'vs/base/common/uri';
import { ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IDecorationData, IDecorationsProvider } from 'vs/workbench/services/decorations/common/decorations';
import { Event } from 'vs/base/common/event';
export declare class TerminalDecorationsProvider implements IDecorationsProvider {
    private readonly _terminalService;
    readonly label: string;
    private readonly _onDidChange;
    constructor(_terminalService: ITerminalService);
    get onDidChange(): Event<URI[]>;
    provideDecorations(resource: URI): IDecorationData | undefined;
    dispose(): void;
}
