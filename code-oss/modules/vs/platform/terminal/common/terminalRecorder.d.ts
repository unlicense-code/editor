import { IPtyHostProcessReplayEvent } from 'vs/platform/terminal/common/capabilities/capabilities';
import { ReplayEntry } from 'vs/platform/terminal/common/terminalProcess';
export interface IRemoteTerminalProcessReplayEvent {
    events: ReplayEntry[];
}
export declare class TerminalRecorder {
    private _entries;
    private _totalDataLength;
    constructor(cols: number, rows: number);
    handleResize(cols: number, rows: number): void;
    handleData(data: string): void;
    generateReplayEventSync(): IPtyHostProcessReplayEvent;
    generateReplayEvent(): Promise<IPtyHostProcessReplayEvent>;
}
