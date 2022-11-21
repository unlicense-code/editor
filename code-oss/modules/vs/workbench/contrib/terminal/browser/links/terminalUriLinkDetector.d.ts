import { URI } from 'vs/base/common/uri';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITerminalLinkDetector, ITerminalSimpleLink, ResolvedLink } from 'vs/workbench/contrib/terminal/browser/links/links';
import { IBufferLine, Terminal } from 'xterm';
export declare class TerminalUriLinkDetector implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _resolvePath;
    private readonly _uriIdentityService;
    private readonly _workspaceContextService;
    static id: string;
    readonly maxLinkLength = 2048;
    constructor(xterm: Terminal, _resolvePath: (link: string, uri?: URI) => Promise<ResolvedLink>, _uriIdentityService: IUriIdentityService, _workspaceContextService: IWorkspaceContextService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
    private _isDirectoryInsideWorkspace;
    private _excludeLineAndColSuffix;
}
