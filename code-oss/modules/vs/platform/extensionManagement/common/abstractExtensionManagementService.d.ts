import { CancellationToken } from 'vs/base/common/cancellation';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IExtensionGalleryService, IExtensionIdentifier, IExtensionManagementParticipant, IGalleryExtension, IGalleryMetadata, ILocalExtension, InstallOperation, IExtensionsControlManifest, InstallOptions, InstallVSIXOptions, UninstallOptions, Metadata, InstallExtensionEvent, DidUninstallExtensionEvent, InstallExtensionResult, UninstallExtensionEvent, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionType, IExtensionManifest, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare type InstallExtensionTaskOptions = InstallOptions & InstallVSIXOptions & {
    readonly profileLocation: URI;
};
export interface IInstallExtensionTask {
    readonly identifier: IExtensionIdentifier;
    readonly source: IGalleryExtension | URI;
    readonly operation: InstallOperation;
    readonly wasVerified?: boolean;
    run(): Promise<{
        local: ILocalExtension;
        metadata: Metadata;
    }>;
    waitUntilTaskIsFinished(): Promise<{
        local: ILocalExtension;
        metadata: Metadata;
    }>;
    cancel(): void;
}
export declare type UninstallExtensionTaskOptions = UninstallOptions & {
    readonly profileLocation: URI;
};
export interface IUninstallExtensionTask {
    readonly extension: ILocalExtension;
    run(): Promise<void>;
    waitUntilTaskIsFinished(): Promise<void>;
    cancel(): void;
}
export declare abstract class AbstractExtensionManagementService extends Disposable implements IExtensionManagementService {
    protected readonly galleryService: IExtensionGalleryService;
    protected readonly telemetryService: ITelemetryService;
    protected readonly logService: ILogService;
    protected readonly productService: IProductService;
    protected readonly userDataProfilesService: IUserDataProfilesService;
    readonly _serviceBrand: undefined;
    private extensionsControlManifest;
    private lastReportTimestamp;
    private readonly installingExtensions;
    private readonly uninstallingExtensions;
    private readonly _onInstallExtension;
    get onInstallExtension(): Event<InstallExtensionEvent>;
    protected readonly _onDidInstallExtensions: Emitter<InstallExtensionResult[]>;
    get onDidInstallExtensions(): Event<InstallExtensionResult[]>;
    protected readonly _onUninstallExtension: Emitter<UninstallExtensionEvent>;
    get onUninstallExtension(): Event<UninstallExtensionEvent>;
    protected _onDidUninstallExtension: Emitter<DidUninstallExtensionEvent>;
    get onDidUninstallExtension(): Event<DidUninstallExtensionEvent>;
    private readonly participants;
    constructor(galleryService: IExtensionGalleryService, telemetryService: ITelemetryService, logService: ILogService, productService: IProductService, userDataProfilesService: IUserDataProfilesService);
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions): Promise<ILocalExtension>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    registerParticipant(participant: IExtensionManagementParticipant): void;
    protected installExtension(manifest: IExtensionManifest, extension: URI | IGalleryExtension, options: InstallOptions & InstallVSIXOptions): Promise<ILocalExtension>;
    private canWaitForTask;
    private joinAllSettled;
    private getAllDepsAndPackExtensions;
    private checkAndGetCompatibleVersion;
    protected getCompatibleVersion(extension: IGalleryExtension, sameVersion: boolean, includePreRelease: boolean): Promise<IGalleryExtension | null>;
    private uninstallExtension;
    private checkForDependents;
    private getDependentsErrorMessage;
    private getAllPackExtensionsToUninstall;
    private getDependents;
    private updateControlCache;
    abstract getTargetPlatform(): Promise<TargetPlatform>;
    abstract zip(extension: ILocalExtension): Promise<URI>;
    abstract unzip(zipLocation: URI): Promise<IExtensionIdentifier>;
    abstract getManifest(vsix: URI): Promise<IExtensionManifest>;
    abstract install(vsix: URI, options?: InstallVSIXOptions): Promise<ILocalExtension>;
    abstract getInstalled(type?: ExtensionType, profileLocation?: URI): Promise<ILocalExtension[]>;
    abstract download(extension: IGalleryExtension, operation: InstallOperation): Promise<URI>;
    abstract reinstallFromGallery(extension: ILocalExtension): Promise<void>;
    abstract getMetadata(extension: ILocalExtension): Promise<Metadata | undefined>;
    abstract updateMetadata(local: ILocalExtension, metadata: IGalleryMetadata): Promise<ILocalExtension>;
    abstract updateExtensionScope(local: ILocalExtension, isMachineScoped: boolean): Promise<ILocalExtension>;
    protected abstract getCurrentExtensionsManifestLocation(): URI;
    protected abstract createInstallExtensionTask(manifest: IExtensionManifest, extension: URI | IGalleryExtension, options: InstallExtensionTaskOptions): IInstallExtensionTask;
    protected abstract createUninstallExtensionTask(extension: ILocalExtension, options: UninstallExtensionTaskOptions): IUninstallExtensionTask;
}
export declare function joinErrors(errorOrErrors: (Error | string) | (Array<Error | string>)): Error;
export declare function reportTelemetry(telemetryService: ITelemetryService, eventName: string, { extensionData, wasVerified, duration, error, durationSinceUpdate }: {
    extensionData: any;
    wasVerified?: boolean;
    duration?: number;
    durationSinceUpdate?: number;
    error?: Error;
}): void;
export declare abstract class AbstractExtensionTask<T> {
    private readonly barrier;
    private cancellablePromise;
    waitUntilTaskIsFinished(): Promise<T>;
    run(): Promise<T>;
    cancel(): void;
    protected abstract doRun(token: CancellationToken): Promise<T>;
}
