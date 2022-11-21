import type * as vscode from 'vscode';
import { Event, Emitter } from 'vs/base/common/event';
import { ExtHostTerminalServiceShape, MainThreadTerminalServiceShape, ITerminalDimensionsDto, ITerminalLinkDto, ExtHostTerminalIdentifier } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { TerminalExitReason } from './extHostTypes';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ISerializableEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariable';
import { ICreateContributedTerminalProfileOptions, IProcessReadyEvent, IShellLaunchConfigDto, ITerminalChildProcess, ITerminalLaunchError, ITerminalProfile, TerminalIcon, TerminalLocation, IProcessProperty, ProcessPropertyType, IProcessPropertyMap } from 'vs/platform/terminal/common/terminal';
import { ThemeColor } from 'vs/platform/theme/common/themeService';
export interface IExtHostTerminalService extends ExtHostTerminalServiceShape, IDisposable {
    readonly _serviceBrand: undefined;
    activeTerminal: vscode.Terminal | undefined;
    terminals: vscode.Terminal[];
    onDidCloseTerminal: Event<vscode.Terminal>;
    onDidOpenTerminal: Event<vscode.Terminal>;
    onDidChangeActiveTerminal: Event<vscode.Terminal | undefined>;
    onDidChangeTerminalDimensions: Event<vscode.TerminalDimensionsChangeEvent>;
    onDidChangeTerminalState: Event<vscode.Terminal>;
    onDidWriteTerminalData: Event<vscode.TerminalDataWriteEvent>;
    onDidChangeShell: Event<string>;
    createTerminal(name?: string, shellPath?: string, shellArgs?: readonly string[] | string): vscode.Terminal;
    createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
    createExtensionTerminal(options: vscode.ExtensionTerminalOptions): vscode.Terminal;
    attachPtyToTerminal(id: number, pty: vscode.Pseudoterminal): void;
    getDefaultShell(useAutomationShell: boolean): string;
    getDefaultShellArgs(useAutomationShell: boolean): string[] | string;
    registerLinkProvider(provider: vscode.TerminalLinkProvider): vscode.Disposable;
    registerProfileProvider(extension: IExtensionDescription, id: string, provider: vscode.TerminalProfileProvider): vscode.Disposable;
    getEnvironmentVariableCollection(extension: IExtensionDescription, persistent?: boolean): vscode.EnvironmentVariableCollection;
}
export interface ITerminalInternalOptions {
    isFeatureTerminal?: boolean;
    useShellEnvironment?: boolean;
    resolvedExtHostIdentifier?: ExtHostTerminalIdentifier;
    /**
     * This location is different from the API location because it can include splitActiveTerminal,
     * a property we resolve internally
     */
    location?: TerminalLocation | {
        viewColumn: number;
        preserveState?: boolean;
    } | {
        splitActiveTerminal: boolean;
    };
}
export declare const IExtHostTerminalService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostTerminalService>;
export declare class ExtHostTerminal {
    private _proxy;
    _id: ExtHostTerminalIdentifier;
    private readonly _creationOptions;
    private _name?;
    private _disposed;
    private _pidPromise;
    private _cols;
    private _pidPromiseComplete;
    private _rows;
    private _exitStatus;
    private _state;
    isOpen: boolean;
    readonly value: vscode.Terminal;
    constructor(_proxy: MainThreadTerminalServiceShape, _id: ExtHostTerminalIdentifier, _creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions, _name?: string | undefined);
    create(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): Promise<void>;
    createExtensionTerminal(location?: TerminalLocation | vscode.TerminalEditorLocationOptions | vscode.TerminalSplitLocationOptions, parentTerminal?: ExtHostTerminalIdentifier, iconPath?: TerminalIcon, color?: ThemeColor): Promise<number>;
    private _serializeParentTerminal;
    private _checkDisposed;
    set name(name: string);
    setExitStatus(code: number | undefined, reason: TerminalExitReason): void;
    setDimensions(cols: number, rows: number): boolean;
    setInteractedWith(): boolean;
    _setProcessId(processId: number | undefined): void;
}
export declare class ExtHostPseudoterminal implements ITerminalChildProcess {
    private readonly _pty;
    readonly id = 0;
    readonly shouldPersist = false;
    private readonly _onProcessData;
    readonly onProcessData: Event<string>;
    private readonly _onProcessReady;
    get onProcessReady(): Event<IProcessReadyEvent>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: Event<IProcessProperty<any>>;
    private readonly _onProcessExit;
    readonly onProcessExit: Event<number | undefined>;
    constructor(_pty: vscode.Pseudoterminal);
    refreshProperty<T extends ProcessPropertyType>(property: ProcessPropertyType): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(property: ProcessPropertyType, value: IProcessPropertyMap[T]): Promise<void>;
    start(): Promise<undefined>;
    shutdown(): void;
    input(data: string): void;
    resize(cols: number, rows: number): void;
    processBinary(data: string): Promise<void>;
    acknowledgeDataEvent(charCount: number): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    getLatency(): Promise<number>;
    startSendingEvents(initialDimensions: ITerminalDimensionsDto | undefined): void;
}
export declare abstract class BaseExtHostTerminalService extends Disposable implements IExtHostTerminalService, ExtHostTerminalServiceShape {
    readonly _serviceBrand: undefined;
    protected _proxy: MainThreadTerminalServiceShape;
    protected _activeTerminal: ExtHostTerminal | undefined;
    protected _terminals: ExtHostTerminal[];
    protected _terminalProcesses: Map<number, ITerminalChildProcess>;
    protected _terminalProcessDisposables: {
        [id: number]: IDisposable;
    };
    protected _extensionTerminalAwaitingStart: {
        [id: number]: {
            initialDimensions: ITerminalDimensionsDto | undefined;
        } | undefined;
    };
    protected _getTerminalPromises: {
        [id: number]: Promise<ExtHostTerminal | undefined>;
    };
    protected _environmentVariableCollections: Map<string, EnvironmentVariableCollection>;
    private _defaultProfile;
    private _defaultAutomationProfile;
    private readonly _bufferer;
    private readonly _linkProviders;
    private readonly _profileProviders;
    private readonly _terminalLinkCache;
    private readonly _terminalLinkCancellationSource;
    get activeTerminal(): vscode.Terminal | undefined;
    get terminals(): vscode.Terminal[];
    protected readonly _onDidCloseTerminal: Emitter<vscode.Terminal>;
    readonly onDidCloseTerminal: Event<vscode.Terminal>;
    protected readonly _onDidOpenTerminal: Emitter<vscode.Terminal>;
    readonly onDidOpenTerminal: Event<vscode.Terminal>;
    protected readonly _onDidChangeActiveTerminal: Emitter<vscode.Terminal | undefined>;
    readonly onDidChangeActiveTerminal: Event<vscode.Terminal | undefined>;
    protected readonly _onDidChangeTerminalDimensions: Emitter<vscode.TerminalDimensionsChangeEvent>;
    readonly onDidChangeTerminalDimensions: Event<vscode.TerminalDimensionsChangeEvent>;
    protected readonly _onDidChangeTerminalState: Emitter<vscode.Terminal>;
    readonly onDidChangeTerminalState: Event<vscode.Terminal>;
    protected readonly _onDidWriteTerminalData: Emitter<vscode.TerminalDataWriteEvent>;
    get onDidWriteTerminalData(): Event<vscode.TerminalDataWriteEvent>;
    protected readonly _onDidChangeShell: Emitter<string>;
    readonly onDidChangeShell: Event<string>;
    constructor(supportsProcesses: boolean, extHostRpc: IExtHostRpcService);
    abstract createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal;
    abstract createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
    getDefaultShell(useAutomationShell: boolean): string;
    getDefaultShellArgs(useAutomationShell: boolean): string[] | string;
    createExtensionTerminal(options: vscode.ExtensionTerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
    protected _serializeParentTerminal(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): ITerminalInternalOptions;
    attachPtyToTerminal(id: number, pty: vscode.Pseudoterminal): void;
    $acceptActiveTerminalChanged(id: number | null): Promise<void>;
    $acceptTerminalProcessData(id: number, data: string): Promise<void>;
    $acceptTerminalDimensions(id: number, cols: number, rows: number): Promise<void>;
    $acceptTerminalMaximumDimensions(id: number, cols: number, rows: number): Promise<void>;
    $acceptTerminalTitleChange(id: number, name: string): Promise<void>;
    $acceptTerminalClosed(id: number, exitCode: number | undefined, exitReason: TerminalExitReason): Promise<void>;
    $acceptTerminalOpened(id: number, extHostTerminalId: string | undefined, name: string, shellLaunchConfigDto: IShellLaunchConfigDto): void;
    $acceptTerminalProcessId(id: number, processId: number): Promise<void>;
    $startExtensionTerminal(id: number, initialDimensions: ITerminalDimensionsDto | undefined): Promise<ITerminalLaunchError | undefined>;
    protected _setupExtHostProcessListeners(id: number, p: ITerminalChildProcess): IDisposable;
    $acceptProcessAckDataEvent(id: number, charCount: number): void;
    $acceptProcessInput(id: number, data: string): void;
    $acceptTerminalInteraction(id: number): void;
    $acceptProcessResize(id: number, cols: number, rows: number): void;
    $acceptProcessShutdown(id: number, immediate: boolean): void;
    $acceptProcessRequestInitialCwd(id: number): void;
    $acceptProcessRequestCwd(id: number): void;
    $acceptProcessRequestLatency(id: number): Promise<number>;
    registerLinkProvider(provider: vscode.TerminalLinkProvider): vscode.Disposable;
    registerProfileProvider(extension: IExtensionDescription, id: string, provider: vscode.TerminalProfileProvider): vscode.Disposable;
    $createContributedProfileTerminal(id: string, options: ICreateContributedTerminalProfileOptions): Promise<void>;
    $provideLinks(terminalId: number, line: string): Promise<ITerminalLinkDto[]>;
    $activateLink(terminalId: number, linkId: number): void;
    private _onProcessExit;
    private _getTerminalById;
    private _getTerminalObjectById;
    private _getTerminalObjectIndexById;
    getEnvironmentVariableCollection(extension: IExtensionDescription): vscode.EnvironmentVariableCollection;
    private _syncEnvironmentVariableCollection;
    $initEnvironmentVariableCollections(collections: [string, ISerializableEnvironmentVariableCollection][]): void;
    $acceptDefaultProfile(profile: ITerminalProfile, automationProfile: ITerminalProfile): void;
    private _setEnvironmentVariableCollection;
}
export declare class EnvironmentVariableCollection implements vscode.EnvironmentVariableCollection {
    readonly map: Map<string, vscode.EnvironmentVariableMutator>;
    private _persistent;
    get persistent(): boolean;
    set persistent(value: boolean);
    protected readonly _onDidChangeCollection: Emitter<void>;
    get onDidChangeCollection(): Event<void>;
    constructor(serialized?: ISerializableEnvironmentVariableCollection);
    get size(): number;
    replace(variable: string, value: string): void;
    append(variable: string, value: string): void;
    prepend(variable: string, value: string): void;
    private _setIfDiffers;
    get(variable: string): vscode.EnvironmentVariableMutator | undefined;
    forEach(callback: (variable: string, mutator: vscode.EnvironmentVariableMutator, collection: vscode.EnvironmentVariableCollection) => any, thisArg?: any): void;
    [Symbol.iterator](): IterableIterator<[variable: string, mutator: vscode.EnvironmentVariableMutator]>;
    delete(variable: string): void;
    clear(): void;
}
export declare class WorkerExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostRpc: IExtHostRpcService);
    createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal;
    createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
}
