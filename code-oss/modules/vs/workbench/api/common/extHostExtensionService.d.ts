import { Disposable } from 'vs/base/common/lifecycle';
import { TernarySearchTree } from 'vs/base/common/ternarySearchTree';
import { URI, UriComponents } from 'vs/base/common/uri';
import { ILogService } from 'vs/platform/log/common/log';
import { ExtHostExtensionServiceShape, MainThreadExtensionServiceShape, MainThreadTelemetryShape, MainThreadWorkspaceShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtensionDescriptionDelta, IExtensionHostInitData } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtHostConfiguration, IExtHostConfiguration } from 'vs/workbench/api/common/extHostConfiguration';
import { ExtensionActivationTimesBuilder, IExtensionAPI } from 'vs/workbench/api/common/extHostExtensionActivator';
import { ExtHostWorkspace, IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { ActivationKind, ExtensionActivationReason } from 'vs/workbench/services/extensions/common/extensions';
import { ExtensionDescriptionRegistry } from 'vs/workbench/services/extensions/common/extensionDescriptionRegistry';
import type * as vscode from 'vscode';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { VSBuffer } from 'vs/base/common/buffer';
import { ExtensionKind, ExtensionRuntime } from 'vs/workbench/api/common/extHostTypes';
import { IRemoteConnectionData } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IExtensionStoragePaths } from 'vs/workbench/api/common/extHostStoragePaths';
import { IExtHostRpcService } from 'vs/workbench/api/common/extHostRpcService';
import { IExtHostTunnelService } from 'vs/workbench/api/common/extHostTunnelService';
import { IExtHostTerminalService } from 'vs/workbench/api/common/extHostTerminalService';
import { Event } from 'vs/base/common/event';
import { IResolveAuthorityResult } from 'vs/workbench/services/extensions/common/extensionHostProxy';
import { IExtHostLocalizationService } from 'vs/workbench/api/common/extHostLocalizationService';
export declare const IHostUtils: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IHostUtils>;
export interface IHostUtils {
    readonly _serviceBrand: undefined;
    readonly pid: number | undefined;
    exit(code: number): void;
    exists(path: string): Promise<boolean>;
    realpath(path: string): Promise<string>;
}
export declare abstract class AbstractExtHostExtensionService extends Disposable implements ExtHostExtensionServiceShape {
    readonly _serviceBrand: undefined;
    abstract readonly extensionRuntime: ExtensionRuntime;
    private readonly _onDidChangeRemoteConnectionData;
    readonly onDidChangeRemoteConnectionData: Event<void>;
    protected readonly _hostUtils: IHostUtils;
    protected readonly _initData: IExtensionHostInitData;
    protected readonly _extHostContext: IExtHostRpcService;
    protected readonly _instaService: IInstantiationService;
    protected readonly _extHostWorkspace: ExtHostWorkspace;
    protected readonly _extHostConfiguration: ExtHostConfiguration;
    protected readonly _logService: ILogService;
    protected readonly _extHostTunnelService: IExtHostTunnelService;
    protected readonly _extHostTerminalService: IExtHostTerminalService;
    protected readonly _extHostLocalizationService: IExtHostLocalizationService;
    protected readonly _mainThreadWorkspaceProxy: MainThreadWorkspaceShape;
    protected readonly _mainThreadTelemetryProxy: MainThreadTelemetryShape;
    protected readonly _mainThreadExtensionsProxy: MainThreadExtensionServiceShape;
    private readonly _almostReadyToRunExtensions;
    private readonly _readyToStartExtensionHost;
    private readonly _readyToRunExtensions;
    private readonly _eagerExtensionsActivated;
    protected readonly _myRegistry: ExtensionDescriptionRegistry;
    protected readonly _globalRegistry: ExtensionDescriptionRegistry;
    private readonly _storage;
    private readonly _secretState;
    private readonly _storagePath;
    private readonly _activator;
    private _extensionPathIndex;
    private readonly _resolvers;
    private _started;
    private _isTerminating;
    private _remoteConnectionData;
    constructor(instaService: IInstantiationService, hostUtils: IHostUtils, extHostContext: IExtHostRpcService, extHostWorkspace: IExtHostWorkspace, extHostConfiguration: IExtHostConfiguration, logService: ILogService, initData: IExtHostInitDataService, storagePath: IExtensionStoragePaths, extHostTunnelService: IExtHostTunnelService, extHostTerminalService: IExtHostTerminalService, extHostLocalizationService: IExtHostLocalizationService);
    getRemoteConnectionData(): IRemoteConnectionData | null;
    initialize(): Promise<void>;
    private _deactivateAll;
    terminate(reason: string, code?: number): void;
    isActivated(extensionId: ExtensionIdentifier): boolean;
    getExtension(extensionId: string): Promise<IExtensionDescription | undefined>;
    private _activateByEvent;
    private _activateById;
    activateByIdWithErrors(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    getExtensionRegistry(): Promise<ExtensionDescriptionRegistry>;
    getExtensionExports(extensionId: ExtensionIdentifier): IExtensionAPI | null | undefined;
    /**
     * Applies realpath to file-uris and returns all others uris unmodified
     */
    private _realPathExtensionUri;
    getExtensionPathIndex(): Promise<ExtensionPaths>;
    /**
     * create trie to enable fast 'filename -> extension id' look up
     */
    private _createExtensionPathIndex;
    private _deactivate;
    private _activateExtension;
    private _logExtensionActivationTimes;
    private _doActivateExtension;
    private _loadExtensionContext;
    private static _callActivate;
    private static _callActivateOptional;
    private _activateOneStartupFinished;
    private _activateAllStartupFinished;
    private _handleEagerExtensions;
    private _handleWorkspaceContainsEagerExtensions;
    private _handleWorkspaceContainsEagerExtension;
    $extensionTestsExecute(): Promise<number>;
    private _doHandleExtensionTests;
    private _startExtensionHost;
    registerRemoteAuthorityResolver(authorityPrefix: string, resolver: vscode.RemoteAuthorityResolver): vscode.Disposable;
    private _activateAndGetResolver;
    $resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    $getCanonicalURI(remoteAuthority: string, uriComponents: UriComponents): Promise<UriComponents | null>;
    private static _applyExtensionsDelta;
    $startExtensionHost(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    $activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    $activate(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    $deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    $test_latency(n: number): Promise<number>;
    $test_up(b: VSBuffer): Promise<number>;
    $test_down(size: number): Promise<VSBuffer>;
    $updateRemoteConnectionData(connectionData: IRemoteConnectionData): Promise<void>;
    protected abstract _beforeAlmostReadyToRunExtensions(): Promise<void>;
    protected abstract _getEntryPoint(extensionDescription: IExtensionDescription): string | undefined;
    protected abstract _loadCommonJSModule<T extends object | undefined>(extensionId: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    abstract $setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export declare const IExtHostExtensionService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostExtensionService>;
export interface IExtHostExtensionService extends AbstractExtHostExtensionService {
    readonly _serviceBrand: undefined;
    initialize(): Promise<void>;
    terminate(reason: string): void;
    getExtension(extensionId: string): Promise<IExtensionDescription | undefined>;
    isActivated(extensionId: ExtensionIdentifier): boolean;
    activateByIdWithErrors(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    getExtensionExports(extensionId: ExtensionIdentifier): IExtensionAPI | null | undefined;
    getExtensionRegistry(): Promise<ExtensionDescriptionRegistry>;
    getExtensionPathIndex(): Promise<ExtensionPaths>;
    registerRemoteAuthorityResolver(authorityPrefix: string, resolver: vscode.RemoteAuthorityResolver): vscode.Disposable;
    onDidChangeRemoteConnectionData: Event<void>;
    getRemoteConnectionData(): IRemoteConnectionData | null;
}
export declare class Extension<T extends object | null | undefined> implements vscode.Extension<T> {
    #private;
    readonly id: string;
    readonly extensionUri: URI;
    readonly extensionPath: string;
    readonly packageJSON: IExtensionDescription;
    readonly extensionKind: vscode.ExtensionKind;
    readonly isFromDifferentExtensionHost: boolean;
    constructor(extensionService: IExtHostExtensionService, originExtensionId: ExtensionIdentifier, description: IExtensionDescription, kind: ExtensionKind, isFromDifferentExtensionHost: boolean);
    get isActive(): boolean;
    get exports(): T;
    activate(): Promise<T>;
}
export declare class ExtensionPaths {
    private _searchTree;
    constructor(_searchTree: TernarySearchTree<URI, IExtensionDescription>);
    setSearchTree(searchTree: TernarySearchTree<URI, IExtensionDescription>): void;
    findSubstr(key: URI): IExtensionDescription | undefined;
    forEach(callback: (value: IExtensionDescription, index: URI) => any): void;
}
