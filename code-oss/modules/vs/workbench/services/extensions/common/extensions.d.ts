import { Event } from 'vs/base/common/event';
import Severity from 'vs/base/common/severity';
import { IExtensionPoint } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ExtensionIdentifier, IExtension, IExtensionDescription, IExtensionContributions } from 'vs/platform/extensions/common/extensions';
import { IMessagePassingProtocol } from 'vs/base/parts/ipc/common/ipc';
import { ApiProposalName } from 'vs/workbench/services/extensions/common/extensionsApiProposals';
import { IV8Profile } from 'vs/platform/profiling/common/profiling';
import { IExtensionDescriptionDelta } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
export declare const nullExtensionDescription: Readonly<Readonly<import("vs/platform/extensions/common/extensions").IRelaxedExtensionDescription>>;
export declare type WebWorkerExtHostConfigValue = boolean | 'auto';
export declare const webWorkerExtHostConfig = "extensions.webWorker";
export declare const IExtensionService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionService>;
export interface IMessage {
    type: Severity;
    message: string;
    extensionId: ExtensionIdentifier;
    extensionPointId: string;
}
export declare class LocalProcessRunningLocation {
    readonly affinity: number;
    readonly kind = ExtensionHostKind.LocalProcess;
    constructor(affinity: number);
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare class LocalWebWorkerRunningLocation {
    readonly affinity: number;
    readonly kind = ExtensionHostKind.LocalWebWorker;
    constructor(affinity: number);
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare class RemoteRunningLocation {
    readonly kind = ExtensionHostKind.Remote;
    readonly affinity = 0;
    equals(other: ExtensionRunningLocation): boolean;
    asString(): string;
}
export declare type ExtensionRunningLocation = LocalProcessRunningLocation | LocalWebWorkerRunningLocation | RemoteRunningLocation;
export interface IExtensionsStatus {
    messages: IMessage[];
    activationTimes: ActivationTimes | undefined;
    runtimeErrors: Error[];
    runningLocation: ExtensionRunningLocation | null;
}
export declare class MissingExtensionDependency {
    readonly dependency: string;
    constructor(dependency: string);
}
/**
 * e.g.
 * ```
 * {
 *    startTime: 1511954813493000,
 *    endTime: 1511954835590000,
 *    deltas: [ 100, 1500, 123456, 1500, 100000 ],
 *    ids: [ 'idle', 'self', 'extension1', 'self', 'idle' ]
 * }
 * ```
 */
export interface IExtensionHostProfile {
    /**
     * Profiling start timestamp in microseconds.
     */
    startTime: number;
    /**
     * Profiling end timestamp in microseconds.
     */
    endTime: number;
    /**
     * Duration of segment in microseconds.
     */
    deltas: number[];
    /**
     * Segment identifier: extension id or one of the four known strings.
     */
    ids: ProfileSegmentId[];
    /**
     * Get the information as a .cpuprofile.
     */
    data: IV8Profile;
    /**
     * Get the aggregated time per segmentId
     */
    getAggregatedTimes(): Map<ProfileSegmentId, number>;
}
export declare const enum ExtensionHostKind {
    LocalProcess = 1,
    LocalWebWorker = 2,
    Remote = 3
}
export declare function extensionHostKindToString(kind: ExtensionHostKind | null): string;
export interface IExtensionHost {
    readonly runningLocation: ExtensionRunningLocation;
    readonly remoteAuthority: string | null;
    readonly lazyStart: boolean;
    /**
     * A collection of extensions which includes information about which
     * extension will execute or is executing on this extension host.
     * **NOTE**: this will reflect extensions correctly only after `start()` resolves.
     */
    readonly extensions: ExtensionHostExtensions;
    readonly onExit: Event<[number, string | null]>;
    start(): Promise<IMessagePassingProtocol>;
    getInspectPort(): number | undefined;
    enableInspectPort(): Promise<boolean>;
    dispose(): void;
}
export declare class ExtensionHostExtensions {
    private _allExtensions;
    private _myExtensions;
    constructor();
    toDelta(): IExtensionDescriptionDelta;
    set(allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): IExtensionDescriptionDelta;
    delta(extensionsDelta: IExtensionDescriptionDelta): void;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
}
export declare class ExtensionIdentifierSet implements Set<ExtensionIdentifier> {
    readonly [Symbol.toStringTag]: string;
    private readonly _map;
    private readonly _toKey;
    constructor(values?: Iterable<ExtensionIdentifier>);
    get size(): number;
    add(value: ExtensionIdentifier): this;
    clear(): void;
    delete(value: ExtensionIdentifier): boolean;
    has(value: ExtensionIdentifier): boolean;
    forEach(callbackfn: (value: ExtensionIdentifier, value2: ExtensionIdentifier, set: Set<ExtensionIdentifier>) => void, thisArg?: any): void;
    entries(): IterableIterator<[ExtensionIdentifier, ExtensionIdentifier]>;
    keys(): IterableIterator<ExtensionIdentifier>;
    values(): IterableIterator<ExtensionIdentifier>;
    [Symbol.iterator](): IterableIterator<ExtensionIdentifier>;
}
export declare function extensionIdentifiersArrayToSet(extensionIds: ExtensionIdentifier[]): Set<string>;
export declare function isProposedApiEnabled(extension: IExtensionDescription, proposal: ApiProposalName): boolean;
export declare function checkProposedApiEnabled(extension: IExtensionDescription, proposal: ApiProposalName): void;
/**
 * Extension id or one of the four known program states.
 */
export declare type ProfileSegmentId = string | 'idle' | 'program' | 'gc' | 'self';
export interface ExtensionActivationReason {
    readonly startup: boolean;
    readonly extensionId: ExtensionIdentifier;
    readonly activationEvent: string;
}
export declare class ActivationTimes {
    readonly codeLoadingTime: number;
    readonly activateCallTime: number;
    readonly activateResolvedTime: number;
    readonly activationReason: ExtensionActivationReason;
    constructor(codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason);
}
export declare class ExtensionPointContribution<T> {
    readonly description: IExtensionDescription;
    readonly value: T;
    constructor(description: IExtensionDescription, value: T);
}
export declare const ExtensionHostLogFileName = "exthost";
export declare const localExtHostLog = "extHostLog";
export declare const remoteExtHostLog = "remoteExtHostLog";
export declare const webWorkerExtHostLog = "webWorkerExtHostLog";
export interface IWillActivateEvent {
    readonly event: string;
    readonly activation: Promise<void>;
}
export interface IResponsiveStateChangeEvent {
    extensionHostId: string;
    extensionHostKind: ExtensionHostKind;
    isResponsive: boolean;
}
export declare const enum ActivationKind {
    Normal = 0,
    Immediate = 1
}
export interface IExtensionService {
    readonly _serviceBrand: undefined;
    /**
     * An event emitted when extensions are registered after their extension points got handled.
     *
     * This event will also fire on startup to signal the installed extensions.
     *
     * @returns the extensions that got registered
     */
    onDidRegisterExtensions: Event<void>;
    /**
     * @event
     * Fired when extensions status changes.
     * The event contains the ids of the extensions that have changed.
     */
    onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    /**
     * Fired when the available extensions change (i.e. when extensions are added or removed).
     */
    onDidChangeExtensions: Event<{
        readonly added: readonly IExtensionDescription[];
        readonly removed: readonly IExtensionDescription[];
    }>;
    /**
     * All registered extensions.
     * - List will be empty initially during workbench startup and will be filled with extensions as they are registered
     * - Listen to `onDidChangeExtensions` event for any changes to the extensions list. It will change as extensions get registered or de-reigstered.
     * - Listen to `onDidRegisterExtensions` event or wait for `whenInstalledExtensionsRegistered` promise to get the initial list of registered extensions.
     */
    readonly extensions: readonly IExtensionDescription[];
    /**
     * An event that is fired when activation happens.
     */
    onWillActivateByEvent: Event<IWillActivateEvent>;
    /**
     * An event that is fired when an extension host changes its
     * responsive-state.
     */
    onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    /**
     * Send an activation event and activate interested extensions.
     *
     * This will wait for the normal startup of the extension host(s).
     *
     * In extraordinary circumstances, if the activation event needs to activate
     * one or more extensions before the normal startup is finished, then you can use
     * `ActivationKind.Immediate`. Please do not use this flag unless really necessary
     * and you understand all consequences.
     */
    activateByEvent(activationEvent: string, activationKind?: ActivationKind): Promise<void>;
    /**
     * Determine if `activateByEvent(activationEvent)` has resolved already.
     *
     * i.e. the activation event is finished and all interested extensions are already active.
     */
    activationEventIsDone(activationEvent: string): boolean;
    /**
     * An promise that resolves when the installed extensions are registered after
     * their extension points got handled.
     */
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    /**
     * Return a specific extension
     * @param id An extension id
     */
    getExtension(id: string): Promise<IExtensionDescription | undefined>;
    /**
     * Returns `true` if the given extension can be added. Otherwise `false`.
     * @param extension An extension
     */
    canAddExtension(extension: IExtensionDescription): boolean;
    /**
     * Returns `true` if the given extension can be removed. Otherwise `false`.
     * @param extension An extension
     */
    canRemoveExtension(extension: IExtensionDescription): boolean;
    /**
     * Read all contributions to an extension point.
     */
    readExtensionPointContributions<T extends IExtensionContributions[keyof IExtensionContributions]>(extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    /**
     * Get information about extensions status.
     */
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    /**
     * Return the inspect port or `0` for a certain extension host.
     * `0` means inspection is not possible.
     */
    getInspectPort(extensionHostId: string, tryEnableInspector: boolean): Promise<number>;
    /**
     * Return the inspect ports (if inspection is possible) for extension hosts of kind `extensionHostKind`.
     */
    getInspectPorts(extensionHostKind: ExtensionHostKind, tryEnableInspector: boolean): Promise<number[]>;
    /**
     * Stops the extension hosts.
     */
    stopExtensionHosts(): void;
    /**
     * Restarts the extension host.
     */
    restartExtensionHost(): Promise<void>;
    /**
     * Starts the extension hosts.
     */
    startExtensionHosts(): Promise<void>;
    /**
     * Modify the environment of the remote extension host
     * @param env New properties for the remote extension host
     */
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export interface IInternalExtensionService {
    _activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    _onWillActivateExtension(extensionId: ExtensionIdentifier): void;
    _onDidActivateExtension(extensionId: ExtensionIdentifier, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number, activationReason: ExtensionActivationReason): void;
    _onDidActivateExtensionError(extensionId: ExtensionIdentifier, error: Error): void;
    _onExtensionRuntimeError(extensionId: ExtensionIdentifier, err: Error): void;
}
export interface ProfileSession {
    stop(): Promise<IExtensionHostProfile>;
}
export declare function toExtension(extensionDescription: IExtensionDescription): IExtension;
export declare function toExtensionDescription(extension: IExtension, isUnderDevelopment?: boolean): IExtensionDescription;
export declare class NullExtensionService implements IExtensionService {
    readonly _serviceBrand: undefined;
    onDidRegisterExtensions: Event<void>;
    onDidChangeExtensionsStatus: Event<ExtensionIdentifier[]>;
    onDidChangeExtensions: Event<any>;
    onWillActivateByEvent: Event<IWillActivateEvent>;
    onDidChangeResponsiveChange: Event<IResponsiveStateChangeEvent>;
    readonly extensions: never[];
    activateByEvent(_activationEvent: string): Promise<void>;
    activationEventIsDone(_activationEvent: string): boolean;
    whenInstalledExtensionsRegistered(): Promise<boolean>;
    getExtension(): Promise<undefined>;
    readExtensionPointContributions<T>(_extPoint: IExtensionPoint<T>): Promise<ExtensionPointContribution<T>[]>;
    getExtensionsStatus(): {
        [id: string]: IExtensionsStatus;
    };
    getInspectPort(_extensionHostId: string, _tryEnableInspector: boolean): Promise<number>;
    getInspectPorts(_extensionHostKind: ExtensionHostKind, _tryEnableInspector: boolean): Promise<number[]>;
    stopExtensionHosts(): void;
    restartExtensionHost(): Promise<void>;
    startExtensionHosts(): Promise<void>;
    setRemoteEnvironment(_env: {
        [key: string]: string | null;
    }): Promise<void>;
    canAddExtension(): boolean;
    canRemoveExtension(): boolean;
}
