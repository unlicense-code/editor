import { IPartialCommandDetectionCapability, TerminalCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
import { IMarker, Terminal } from 'xterm-headless';
/**
 * This capability guesses where commands are based on where the cursor was when enter was pressed.
 * It's very hit or miss but it's often correct and better than nothing.
 */
export declare class PartialCommandDetectionCapability implements IPartialCommandDetectionCapability {
    private readonly _terminal;
    readonly type = TerminalCapability.PartialCommandDetection;
    private readonly _commands;
    get commands(): readonly IMarker[];
    private readonly _onCommandFinished;
    readonly onCommandFinished: import("vs/base/common/event").Event<IMarker>;
    constructor(_terminal: Terminal);
    private _onData;
    private _onEnter;
    private _clearCommandsInViewport;
}
