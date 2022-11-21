import { Disposable } from 'vs/base/common/lifecycle';
import { ILocalPtyService } from 'vs/platform/terminal/electron-sandbox/terminal';
import { IProcessDataEvent, ITerminalChildProcess, ITerminalLaunchError, IProcessProperty, IProcessPropertyMap, ProcessPropertyType, IProcessReadyEvent } from 'vs/platform/terminal/common/terminal';
import { IPtyHostProcessReplayEvent, ISerializedCommandDetectionCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
/**
 * Responsible for establishing and maintaining a connection with an existing terminal process
 * created on the local pty host.
 */
export declare class LocalPty extends Disposable implements ITerminalChildProcess {
    readonly id: number;
    readonly shouldPersist: boolean;
    private readonly _localPtyService;
    private _inReplay;
    private _properties;
    private readonly _onProcessData;
    readonly onProcessData: import("vs/base/common/event").Event<string | IProcessDataEvent>;
    private readonly _onProcessReplay;
    readonly onProcessReplay: import("vs/base/common/event").Event<IPtyHostProcessReplayEvent>;
    private readonly _onProcessReady;
    readonly onProcessReady: import("vs/base/common/event").Event<IProcessReadyEvent>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: import("vs/base/common/event").Event<IProcessProperty<any>>;
    private readonly _onProcessExit;
    readonly onProcessExit: import("vs/base/common/event").Event<number | undefined>;
    private readonly _onRestoreCommands;
    readonly onRestoreCommands: import("vs/base/common/event").Event<ISerializedCommandDetectionCapability>;
    constructor(id: number, shouldPersist: boolean, _localPtyService: ILocalPtyService);
    start(): Promise<ITerminalLaunchError | undefined>;
    detach(forcePersist?: boolean): Promise<void>;
    shutdown(immediate: boolean): void;
    processBinary(data: string): Promise<void>;
    input(data: string): void;
    resize(cols: number, rows: number): void;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    refreshProperty<T extends ProcessPropertyType>(type: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(type: T, value: IProcessPropertyMap[T]): Promise<void>;
    getLatency(): Promise<number>;
    acknowledgeDataEvent(charCount: number): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    handleData(e: string | IProcessDataEvent): void;
    handleExit(e: number | undefined): void;
    handleReady(e: IProcessReadyEvent): void;
    handleDidChangeProperty({ type, value }: IProcessProperty<any>): void;
    handleReplay(e: IPtyHostProcessReplayEvent): Promise<void>;
    handleOrphanQuestion(): void;
}
