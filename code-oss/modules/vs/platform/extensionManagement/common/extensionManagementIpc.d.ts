import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IURITransformer } from 'vs/base/common/uriIpc';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IExtensionIdentifier, IExtensionTipsService, IGalleryExtension, IGalleryMetadata, ILocalExtension, IExtensionsControlManifest, InstallOptions, InstallVSIXOptions, UninstallOptions, Metadata, IExtensionManagementService, DidUninstallExtensionEvent, InstallExtensionEvent, InstallExtensionResult, UninstallExtensionEvent, InstallOperation } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionType, IExtensionManifest, TargetPlatform } from 'vs/platform/extensions/common/extensions';
export declare class ExtensionManagementChannel implements IServerChannel {
    private service;
    private getUriTransformer;
    onInstallExtension: Event<InstallExtensionEvent>;
    onDidInstallExtensions: Event<readonly InstallExtensionResult[]>;
    onUninstallExtension: Event<UninstallExtensionEvent>;
    onDidUninstallExtension: Event<DidUninstallExtensionEvent>;
    constructor(service: IExtensionManagementService, getUriTransformer: (requestContext: any) => IURITransformer | null);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class ExtensionManagementChannelClient extends Disposable implements IExtensionManagementService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private readonly _onInstallExtension;
    get onInstallExtension(): Event<InstallExtensionEvent>;
    private readonly _onDidInstallExtensions;
    get onDidInstallExtensions(): Event<readonly InstallExtensionResult[]>;
    private readonly _onUninstallExtension;
    get onUninstallExtension(): Event<UninstallExtensionEvent>;
    private readonly _onDidUninstallExtension;
    get onDidUninstallExtension(): Event<DidUninstallExtensionEvent>;
    constructor(channel: IChannel);
    private isUriComponents;
    protected _targetPlatformPromise: Promise<TargetPlatform> | undefined;
    getTargetPlatform(): Promise<TargetPlatform>;
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    zip(extension: ILocalExtension): Promise<URI>;
    unzip(zipLocation: URI): Promise<IExtensionIdentifier>;
    install(vsix: URI, options?: InstallVSIXOptions): Promise<ILocalExtension>;
    getManifest(vsix: URI): Promise<IExtensionManifest>;
    installFromGallery(extension: IGalleryExtension, installOptions?: InstallOptions): Promise<ILocalExtension>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    reinstallFromGallery(extension: ILocalExtension): Promise<void>;
    getInstalled(type?: ExtensionType | null, extensionsProfileResource?: URI): Promise<ILocalExtension[]>;
    getMetadata(local: ILocalExtension): Promise<Metadata | undefined>;
    updateMetadata(local: ILocalExtension, metadata: IGalleryMetadata): Promise<ILocalExtension>;
    updateExtensionScope(local: ILocalExtension, isMachineScoped: boolean): Promise<ILocalExtension>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    download(extension: IGalleryExtension, operation: InstallOperation): Promise<URI>;
    registerParticipant(): void;
}
export declare class ExtensionTipsChannel implements IServerChannel {
    private service;
    constructor(service: IExtensionTipsService);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
