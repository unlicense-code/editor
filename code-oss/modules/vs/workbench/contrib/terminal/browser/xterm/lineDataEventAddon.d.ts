import { Disposable } from 'vs/base/common/lifecycle';
import { OperatingSystem } from 'vs/base/common/platform';
import type { Terminal as XTermTerminal, ITerminalAddon } from 'xterm';
/**
 * Provides extensions to the xterm object in a modular, testable way.
 */
export declare class LineDataEventAddon extends Disposable implements ITerminalAddon {
    private _xterm?;
    private _isOsSet;
    private readonly _onLineData;
    readonly onLineData: import("vs/base/common/event").Event<string>;
    activate(xterm: XTermTerminal): void;
    setOperatingSystem(os: OperatingSystem): void;
    private _sendLineData;
}
