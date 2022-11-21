import { IExtensionIdentifier, IGalleryExtension, ILocalExtension } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionIdentifier, IExtension, TargetPlatform } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
export declare function areSameExtensions(a: IExtensionIdentifier, b: IExtensionIdentifier): boolean;
export declare class ExtensionKey {
    readonly version: string;
    readonly targetPlatform: TargetPlatform;
    static create(extension: IExtension | IGalleryExtension): ExtensionKey;
    static parse(key: string): ExtensionKey | null;
    readonly id: string;
    constructor(identifier: IExtensionIdentifier, version: string, targetPlatform?: TargetPlatform);
    toString(): string;
    equals(o: any): boolean;
}
export declare function getIdAndVersion(id: string): [string, string | undefined];
export declare function getExtensionId(publisher: string, name: string): string;
export declare function adoptToGalleryExtensionId(id: string): string;
export declare function getGalleryExtensionId(publisher: string, name: string): string;
export declare function groupByExtension<T>(extensions: T[], getExtensionIdentifier: (t: T) => IExtensionIdentifier): T[][];
export declare function getLocalExtensionTelemetryData(extension: ILocalExtension): any;
export declare function getGalleryExtensionTelemetryData(extension: IGalleryExtension): any;
export declare const BetterMergeId: ExtensionIdentifier;
export declare function getExtensionDependencies(installedExtensions: ReadonlyArray<IExtension>, extension: IExtension): IExtension[];
export declare function isAlpineLinux(fileService: IFileService, logService: ILogService): Promise<boolean>;
export declare function computeTargetPlatform(fileService: IFileService, logService: ILogService): Promise<TargetPlatform>;
