import { ICwdDetectionCapability, TerminalCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
export declare class CwdDetectionCapability implements ICwdDetectionCapability {
    readonly type = TerminalCapability.CwdDetection;
    private _cwd;
    private _cwds;
    /**
     * Gets the list of cwds seen in this session in order of last accessed.
     */
    get cwds(): string[];
    private readonly _onDidChangeCwd;
    readonly onDidChangeCwd: import("vs/base/common/event").Event<string>;
    getCwd(): string;
    updateCwd(cwd: string): void;
}
