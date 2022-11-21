import { Disposable } from 'vs/base/common/lifecycle';
import { INativeEnvironmentService } from 'vs/platform/environment/common/environment';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
export declare class ExtensionsManifestCache extends Disposable {
    private readonly environmentService;
    private extensionsManifestCache;
    constructor(environmentService: INativeEnvironmentService, extensionsManagementService: IExtensionManagementService);
    private onDidInstallExtensions;
    private onDidUnInstallExtension;
    invalidate(): void;
}
