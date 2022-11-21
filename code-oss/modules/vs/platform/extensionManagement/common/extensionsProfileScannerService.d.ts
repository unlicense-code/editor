import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { URI } from 'vs/base/common/uri';
import { Metadata } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtension, IExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
export interface IScannedProfileExtension {
    readonly identifier: IExtensionIdentifier;
    readonly version: string;
    readonly location: URI;
    readonly metadata?: Metadata;
}
export interface ProfileExtensionsEvent {
    readonly extensions: readonly IScannedProfileExtension[];
    readonly profileLocation: URI;
}
export interface DidAddProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface DidRemoveProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export declare const IExtensionsProfileScannerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionsProfileScannerService>;
export interface IExtensionsProfileScannerService {
    readonly _serviceBrand: undefined;
    readonly onAddExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidAddExtensions: Event<DidAddProfileExtensionsEvent>;
    readonly onRemoveExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidRemoveExtensions: Event<DidRemoveProfileExtensionsEvent>;
    scanProfileExtensions(profileLocation: URI): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [IExtension, Metadata | undefined][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionFromProfile(extension: IExtension, profileLocation: URI): Promise<void>;
}
export declare class ExtensionsProfileScannerService extends Disposable implements IExtensionsProfileScannerService {
    private readonly fileService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onAddExtensions;
    readonly onAddExtensions: Event<ProfileExtensionsEvent>;
    private readonly _onDidAddExtensions;
    readonly onDidAddExtensions: Event<DidAddProfileExtensionsEvent>;
    private readonly _onRemoveExtensions;
    readonly onRemoveExtensions: Event<ProfileExtensionsEvent>;
    private readonly _onDidRemoveExtensions;
    readonly onDidRemoveExtensions: Event<DidRemoveProfileExtensionsEvent>;
    private readonly resourcesAccessQueueMap;
    constructor(fileService: IFileService, logService: ILogService);
    scanProfileExtensions(profileLocation: URI): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [IExtension, Metadata | undefined][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionFromProfile(extension: IExtension, profileLocation: URI): Promise<void>;
    private withProfileExtensions;
    private getResourceAccessQueue;
}
