import { ITerminalChildProcess } from 'vs/platform/terminal/common/terminal';
import { TerminalCapability, INaiveCwdDetectionCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
export declare class NaiveCwdDetectionCapability implements INaiveCwdDetectionCapability {
    private readonly _process;
    constructor(_process: ITerminalChildProcess);
    readonly type = TerminalCapability.NaiveCwdDetection;
    private _cwd;
    private readonly _onDidChangeCwd;
    readonly onDidChangeCwd: import("vs/base/common/event").Event<string>;
    getCwd(): Promise<string>;
}
