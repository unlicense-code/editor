import { IShellIntegration, ShellIntegrationStatus } from 'vs/platform/terminal/common/terminal';
import { Disposable } from 'vs/base/common/lifecycle';
import { TerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/terminalCapabilityStore';
import { IBufferMarkCapability, ICommandDetectionCapability, ICwdDetectionCapability, ISerializedCommandDetectionCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
import { ILogService } from 'vs/platform/log/common/log';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import type { ITerminalAddon, Terminal } from 'xterm-headless';
/**
 * The shell integration addon extends xterm by reading shell integration sequences and creating
 * capabilities and passing along relevant sequences to the capabilities. This is meant to
 * encapsulate all handling/parsing of sequences so the capabilities don't need to.
 */
export declare class ShellIntegrationAddon extends Disposable implements IShellIntegration, ITerminalAddon {
    private readonly _disableTelemetry;
    private readonly _telemetryService;
    private readonly _logService;
    private _terminal?;
    readonly capabilities: TerminalCapabilityStore;
    private _hasUpdatedTelemetry;
    private _activationTimeout;
    private _commonProtocolDisposables;
    private _status;
    get status(): ShellIntegrationStatus;
    private readonly _onDidChangeStatus;
    readonly onDidChangeStatus: import("vs/base/common/event").Event<ShellIntegrationStatus>;
    constructor(_disableTelemetry: boolean | undefined, _telemetryService: ITelemetryService | undefined, _logService: ILogService);
    private _disposeCommonProtocol;
    activate(xterm: Terminal): void;
    private _handleFinalTermSequence;
    private _doHandleFinalTermSequence;
    private _handleVSCodeSequence;
    private _ensureCapabilitiesOrAddFailureTelemetry;
    private _clearActivationTimeout;
    private _doHandleVSCodeSequence;
    private _updateCwd;
    private _doHandleITermSequence;
    private _doHandleSetWindowsFriendlyCwd;
    /**
     * Handles the sequence: `OSC 7 ; scheme://cwd ST`
     */
    private _doHandleSetCwd;
    serialize(): ISerializedCommandDetectionCapability;
    deserialize(serialized: ISerializedCommandDetectionCapability): void;
    protected _createOrGetCwdDetection(): ICwdDetectionCapability;
    protected _createOrGetCommandDetection(terminal: Terminal): ICommandDetectionCapability;
    protected _createOrGetBufferMarkDetection(terminal: Terminal): IBufferMarkCapability;
}
export declare function deserializeMessage(message: string): string;
export declare function parseKeyValueAssignment(message: string): {
    key: string;
    value: string | undefined;
};
export declare function parseMarkSequence(sequence: string[]): {
    id?: string;
    hidden?: boolean;
};
