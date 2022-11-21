import { URI } from 'vs/base/common/uri';
import { CLIOutput, IExtensionGalleryService, IExtensionManagementService, InstallOptions } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IExtensionManifest } from 'vs/platform/extensions/common/extensions';
export declare class ExtensionManagementCLI {
    private readonly extensionManagementService;
    private readonly extensionGalleryService;
    constructor(extensionManagementService: IExtensionManagementService, extensionGalleryService: IExtensionGalleryService);
    protected get location(): string | undefined;
    listExtensions(showVersions: boolean, category?: string, profileLocation?: URI, output?: CLIOutput): Promise<void>;
    installExtensions(extensions: (string | URI)[], builtinExtensionIds: string[], installOptions: InstallOptions, force: boolean, output?: CLIOutput): Promise<void>;
    private installVSIX;
    private getGalleryExtensions;
    private installFromGallery;
    protected validateExtensionKind(_manifest: IExtensionManifest, output: CLIOutput): boolean;
    private validateVSIX;
    uninstallExtensions(extensions: (string | URI)[], force: boolean, profileLocation?: URI, output?: CLIOutput): Promise<void>;
    locateExtension(extensions: string[], output?: CLIOutput): Promise<void>;
    private notInstalled;
}
