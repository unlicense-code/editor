import { Event } from 'vs/base/common/event';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ResponsiveState } from 'vs/workbench/services/extensions/common/rpcProtocol';
import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { IExtensionHost, ExtensionHostKind, ActivationKind, ExtensionActivationReason, IInternalExtensionService, ExtensionRunningLocation } from 'vs/workbench/services/extensions/common/extensions';
import { URI } from 'vs/base/common/uri';
import { IResolveAuthorityResult } from 'vs/workbench/services/extensions/common/extensionHostProxy';
import { IExtensionDescriptionDelta } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
export interface IExtensionHostManager {
    readonly extensionHostId: string;
    readonly kind: ExtensionHostKind;
    readonly onDidExit: Event<[number, string | null]>;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    dispose(): void;
    ready(): Promise<void>;
    representsRunningLocation(runningLocation: ExtensionRunningLocation): boolean;
    deltaExtensions(extensionsDelta: IExtensionDescriptionDelta): Promise<void>;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    activate(extension: ExtensionIdentifier, reason: ExtensionActivationReason): Promise<boolean>;
    activateByEvent(activationEvent: string, activationKind: ActivationKind): Promise<void>;
    activationEventIsDone(activationEvent: string): boolean;
    getInspectPort(tryEnableInspector: boolean): Promise<number>;
    resolveAuthority(remoteAuthority: string, resolveAttempt: number): Promise<IResolveAuthorityResult>;
    /**
     * Returns `null` if no resolver for `remoteAuthority` is found.
     */
    getCanonicalURI(remoteAuthority: string, uri: URI): Promise<URI | null>;
    start(allExtensions: IExtensionDescription[], myExtensions: ExtensionIdentifier[]): Promise<void>;
    extensionTestsExecute(): Promise<number>;
    setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
export declare function createExtensionHostManager(instantiationService: IInstantiationService, extensionHostId: string, extensionHost: IExtensionHost, isInitialStart: boolean, initialActivationEvents: string[], internalExtensionService: IInternalExtensionService): IExtensionHostManager;
