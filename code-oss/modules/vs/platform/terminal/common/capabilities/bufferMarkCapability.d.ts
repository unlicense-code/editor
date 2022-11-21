import { IBufferMarkCapability, TerminalCapability, IMarkProperties } from 'vs/platform/terminal/common/capabilities/capabilities';
import type { IMarker, Terminal } from 'xterm-headless';
/**
 * Manages "marks" in the buffer which are lines that are tracked when lines are added to or removed
 * from the buffer.
 */
export declare class BufferMarkCapability implements IBufferMarkCapability {
    private readonly _terminal;
    readonly type = TerminalCapability.BufferMarkDetection;
    private _idToMarkerMap;
    private _anonymousMarkers;
    private readonly _onMarkAdded;
    readonly onMarkAdded: import("vs/base/common/event").Event<IMarkProperties>;
    constructor(_terminal: Terminal);
    markers(): IterableIterator<IMarker>;
    addMark(properties?: IMarkProperties): void;
    getMark(id: string): IMarker | undefined;
}
