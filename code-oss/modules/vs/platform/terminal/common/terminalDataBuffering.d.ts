import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IProcessDataEvent } from 'vs/platform/terminal/common/terminal';
export declare class TerminalDataBufferer implements IDisposable {
    private readonly _callback;
    private readonly _terminalBufferMap;
    constructor(_callback: (id: number, data: string) => void);
    dispose(): void;
    startBuffering(id: number, event: Event<string | IProcessDataEvent>, throttleBy?: number): IDisposable;
    stopBuffering(id: number): void;
    flushBuffer(id: number): void;
}
