import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { INativeServerExtensionManagementService } from 'vs/platform/extensionManagement/node/extensionManagementService';
import { IExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export interface DidChangeProfileExtensionsEvent {
    readonly added?: {
        readonly extensions: readonly IExtensionIdentifier[];
        readonly profileLocation: URI;
    };
    readonly removed?: {
        readonly extensions: readonly IExtensionIdentifier[];
        readonly profileLocation: URI;
    };
}
export declare class ExtensionsWatcher extends Disposable {
    private readonly extensionManagementService;
    private readonly userDataProfilesService;
    private readonly extensionsProfileScannerService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly logService;
    private readonly _onDidChangeExtensionsByAnotherSource;
    readonly onDidChangeExtensionsByAnotherSource: import("vs/base/common/event").Event<DidChangeProfileExtensionsEvent>;
    private readonly allExtensions;
    private readonly extensionsProfileWatchDisposables;
    constructor(extensionManagementService: INativeServerExtensionManagementService, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, uriIdentityService: IUriIdentityService, fileService: IFileService, logService: ILogService);
    private initialize;
    private registerListeners;
    private onDidChangeProfiles;
    private onAddExtensions;
    private onDidAddExtensions;
    private onRemoveExtensions;
    private onDidRemoveExtensions;
    private onDidFilesChange;
    private onDidExtensionsProfileChange;
    private populateExtensionsFromProfile;
    private removeExtensionsFromProfile;
    private uninstallExtensionsNotInProfiles;
    private addExtensionWithKey;
    private removeExtensionWithKey;
    private getKey;
    private fromKey;
}
