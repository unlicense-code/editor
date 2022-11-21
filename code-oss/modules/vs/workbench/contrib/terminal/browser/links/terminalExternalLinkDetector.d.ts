import { ITerminalLinkDetector, ITerminalSimpleLink, OmitFirstArg } from 'vs/workbench/contrib/terminal/browser/links/links';
import { ITerminalExternalLinkProvider } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IBufferLine, Terminal } from 'xterm';
export declare class TerminalExternalLinkDetector implements ITerminalLinkDetector {
    readonly id: string;
    readonly xterm: Terminal;
    private readonly _provideLinks;
    readonly maxLinkLength = 2000;
    constructor(id: string, xterm: Terminal, _provideLinks: OmitFirstArg<ITerminalExternalLinkProvider['provideLinks']>);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
}
