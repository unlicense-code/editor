import type * as vscode from 'vscode';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ExtensionDescriptionRegistry } from 'vs/workbench/services/extensions/common/extensionDescriptionRegistry';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { ExtensionActivationReason, MissingExtensionDependency } from 'vs/workbench/services/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
/**
 * Represents the source code (module) of an extension.
 */
export interface IExtensionModule {
    activate?(ctx: vscode.ExtensionContext): Promise<IExtensionAPI>;
    deactivate?(): void;
}
/**
 * Represents the API of an extension (return value of `activate`).
 */
export interface IExtensionAPI {
}
export declare type ExtensionActivationTimesFragment = {
    startup?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        isMeasurement: true;
        comment: 'Activation occurred during startup';
    };
    codeLoadingTime?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        isMeasurement: true;
        comment: 'Time it took to load the extension\'s code';
    };
    activateCallTime?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        isMeasurement: true;
        comment: 'Time it took to call activate';
    };
    activateResolvedTime?: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        isMeasurement: true;
        comment: 'Time it took for async-activation to finish';
    };
};
export declare class ExtensionActivationTimes {
    static readonly NONE: ExtensionActivationTimes;
    readonly startup: boolean;
    readonly codeLoadingTime: number;
    readonly activateCallTime: number;
    readonly activateResolvedTime: number;
    constructor(startup: boolean, codeLoadingTime: number, activateCallTime: number, activateResolvedTime: number);
}
export declare class ExtensionActivationTimesBuilder {
    private readonly _startup;
    private _codeLoadingStart;
    private _codeLoadingStop;
    private _activateCallStart;
    private _activateCallStop;
    private _activateResolveStart;
    private _activateResolveStop;
    constructor(startup: boolean);
    private _delta;
    build(): ExtensionActivationTimes;
    codeLoadingStart(): void;
    codeLoadingStop(): void;
    activateCallStart(): void;
    activateCallStop(): void;
    activateResolveStart(): void;
    activateResolveStop(): void;
}
export declare class ActivatedExtension {
    readonly activationFailed: boolean;
    readonly activationFailedError: Error | null;
    readonly activationTimes: ExtensionActivationTimes;
    readonly module: IExtensionModule;
    readonly exports: IExtensionAPI | undefined;
    readonly subscriptions: IDisposable[];
    constructor(activationFailed: boolean, activationFailedError: Error | null, activationTimes: ExtensionActivationTimes, module: IExtensionModule, exports: IExtensionAPI | undefined, subscriptions: IDisposable[]);
}
export declare class EmptyExtension extends ActivatedExtension {
    constructor(activationTimes: ExtensionActivationTimes);
}
export declare class HostExtension extends ActivatedExtension {
    constructor();
}
export interface IExtensionsActivatorHost {
    onExtensionActivationError(extensionId: ExtensionIdentifier, error: Error | null, missingExtensionDependency: MissingExtensionDependency | null): void;
    actualActivateExtension(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<ActivatedExtension>;
}
export declare class ExtensionsActivator implements IDisposable {
    private readonly _logService;
    private readonly _registry;
    private readonly _resolvedExtensionsSet;
    private readonly _externalExtensionsMap;
    private readonly _host;
    private readonly _operations;
    /**
     * A map of already activated events to speed things up if the same activation event is triggered multiple times.
     */
    private readonly _alreadyActivatedEvents;
    constructor(registry: ExtensionDescriptionRegistry, resolvedExtensions: ExtensionIdentifier[], externalExtensions: ExtensionIdentifier[], host: IExtensionsActivatorHost, _logService: ILogService);
    dispose(): void;
    isActivated(extensionId: ExtensionIdentifier): boolean;
    getActivatedExtension(extensionId: ExtensionIdentifier): ActivatedExtension;
    activateByEvent(activationEvent: string, startup: boolean): Promise<void>;
    activateById(extensionId: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<void>;
    private _activateExtensions;
    /**
     * Handle semantics related to dependencies for `currentExtension`.
     * We don't need to worry about dependency loops because they are handled by the registry.
     */
    private _handleActivationRequest;
    private _createAndSaveOperation;
}
