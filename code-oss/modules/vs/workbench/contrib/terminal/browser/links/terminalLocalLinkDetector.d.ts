import { OperatingSystem } from 'vs/base/common/platform';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITerminalLinkDetector, ITerminalSimpleLink, ResolvedLink } from 'vs/workbench/contrib/terminal/browser/links/links';
import { ITerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/capabilities';
import { IBufferLine, Terminal } from 'xterm';
/** A regex that matches paths in the form /foo, ~/foo, ./foo, ../foo, foo/bar */
export declare const unixLocalLinkClause: string;
export declare const winDrivePrefix = "(?:\\\\\\\\\\?\\\\)?[a-zA-Z]:";
/** A regex that matches paths in the form \\?\c:\foo c:\foo, ~\foo, .\foo, ..\foo, foo\bar */
export declare const winLocalLinkClause: string;
/** As xterm reads from DOM, space in that case is nonbreaking char ASCII code - 160,
replacing space with nonBreakningSpace or space ASCII code - 32. */
export declare const lineAndColumnClause: string;
export declare const winLineAndColumnMatchIndex = 12;
export declare const unixLineAndColumnMatchIndex = 11;
export declare const lineAndColumnClauseGroupCount = 6;
export declare class TerminalLocalLinkDetector implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _capabilities;
    private readonly _os;
    private readonly _resolvePath;
    private readonly _uriIdentityService;
    private readonly _workspaceContextService;
    static id: string;
    readonly maxLinkLength = 500;
    constructor(xterm: Terminal, _capabilities: ITerminalCapabilityStore, _os: OperatingSystem, _resolvePath: (link: string) => Promise<ResolvedLink>, _uriIdentityService: IUriIdentityService, _workspaceContextService: IWorkspaceContextService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): Promise<ITerminalSimpleLink[]>;
    private _isDirectoryInsideWorkspace;
    private _validateLinkCandidates;
}
export declare function getLocalLinkRegex(os: OperatingSystem): RegExp;
