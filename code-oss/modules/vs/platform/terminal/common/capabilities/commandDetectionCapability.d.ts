import { ILogService } from 'vs/platform/log/common/log';
import { ICommandDetectionCapability, TerminalCapability, ITerminalCommand, IHandleCommandOptions, ICommandInvalidationRequest, ISerializedCommandDetectionCapability, ITerminalOutputMatcher } from 'vs/platform/terminal/common/capabilities/capabilities';
import type { IBuffer, IMarker, Terminal } from 'xterm-headless';
export interface ICurrentPartialCommand {
    previousCommandMarker?: IMarker;
    promptStartMarker?: IMarker;
    commandStartMarker?: IMarker;
    commandStartX?: number;
    commandStartLineContent?: string;
    commandRightPromptStartX?: number;
    commandRightPromptEndX?: number;
    commandLines?: IMarker;
    commandExecutedMarker?: IMarker;
    commandExecutedX?: number;
    commandFinishedMarker?: IMarker;
    currentContinuationMarker?: IMarker;
    continuations?: {
        marker: IMarker;
        end: number;
    }[];
    command?: string;
    /**
     * Something invalidated the command before it finished, this will prevent the onCommandFinished
     * event from firing.
     */
    isInvalid?: boolean;
}
export declare class CommandDetectionCapability implements ICommandDetectionCapability {
    private readonly _terminal;
    private readonly _logService;
    readonly type = TerminalCapability.CommandDetection;
    protected _commands: ITerminalCommand[];
    private _exitCode;
    private _cwd;
    private _currentCommand;
    private _isWindowsPty;
    private _onCursorMoveListener?;
    private _commandMarkers;
    private _dimensions;
    private __isCommandStorageDisabled;
    private _handleCommandStartOptions?;
    get commands(): readonly ITerminalCommand[];
    get executingCommand(): string | undefined;
    get executingCommandObject(): ITerminalCommand | undefined;
    get cwd(): string | undefined;
    private get _isInputting();
    get hasInput(): boolean | undefined;
    private readonly _onCommandStarted;
    readonly onCommandStarted: import("vs/base/common/event").Event<ITerminalCommand>;
    private readonly _onBeforeCommandFinished;
    readonly onBeforeCommandFinished: import("vs/base/common/event").Event<ITerminalCommand>;
    private readonly _onCommandFinished;
    readonly onCommandFinished: import("vs/base/common/event").Event<ITerminalCommand>;
    private readonly _onCommandExecuted;
    readonly onCommandExecuted: import("vs/base/common/event").Event<void>;
    private readonly _onCommandInvalidated;
    readonly onCommandInvalidated: import("vs/base/common/event").Event<ITerminalCommand[]>;
    private readonly _onCurrentCommandInvalidated;
    readonly onCurrentCommandInvalidated: import("vs/base/common/event").Event<ICommandInvalidationRequest>;
    constructor(_terminal: Terminal, _logService: ILogService);
    private _handleResize;
    private _handleCursorMove;
    private _setupClearListeners;
    private _preHandleResizeWindows;
    private _clearCommandsInViewport;
    private _waitForCursorMove;
    setCwd(value: string): void;
    setIsWindowsPty(value: boolean): void;
    setIsCommandStorageDisabled(): void;
    getCwdForLine(line: number): string | undefined;
    handlePromptStart(options?: IHandleCommandOptions): void;
    handleContinuationStart(): void;
    handleContinuationEnd(): void;
    handleRightPromptStart(): void;
    handleRightPromptEnd(): void;
    handleCommandStart(options?: IHandleCommandOptions): void;
    private _handleCommandStartWindows;
    handleGenericCommand(options?: IHandleCommandOptions): void;
    handleCommandExecuted(options?: IHandleCommandOptions): void;
    private _handleCommandExecutedWindows;
    invalidateCurrentCommand(request: ICommandInvalidationRequest): void;
    handleCommandFinished(exitCode: number | undefined, options?: IHandleCommandOptions): void;
    private _preHandleCommandFinishedWindows;
    private _evaluateCommandMarkersWindows;
    setCommandLine(commandLine: string): void;
    serialize(): ISerializedCommandDetectionCapability;
    deserialize(serialized: ISerializedCommandDetectionCapability): void;
}
export declare function getOutputMatchForCommand(executedMarker: IMarker | undefined, endMarker: IMarker | undefined, buffer: IBuffer, cols: number, outputMatcher: ITerminalOutputMatcher): RegExpMatchArray | undefined;
