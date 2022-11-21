import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITerminalSimpleLink, ITerminalLinkDetector } from 'vs/workbench/contrib/terminal/browser/links/links';
import { IBufferLine, Terminal } from 'xterm';
export declare class TerminalWordLinkDetector implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _configurationService;
    static id: string;
    readonly maxLinkLength = 100;
    constructor(xterm: Terminal, _configurationService: IConfigurationService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): ITerminalSimpleLink[];
    private _parseWords;
}
