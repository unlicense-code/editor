/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { getLogLevel, ILogService, LogService } from 'vs/platform/log/common/log';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ConfigurationService } from 'vs/platform/configuration/common/configurationService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IRequestService } from 'vs/platform/request/common/request';
import { RequestService } from 'vs/platform/request/node/requestService';
import { NullTelemetryService } from 'vs/platform/telemetry/common/telemetryUtils';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionGalleryServiceWithNoStorageService } from 'vs/platform/extensionManagement/common/extensionGalleryService';
import { ExtensionManagementService, INativeServerExtensionManagementService } from 'vs/platform/extensionManagement/node/extensionManagementService';
import { ExtensionSignatureVerificationService, IExtensionSignatureVerificationService } from 'vs/platform/extensionManagement/node/extensionSignatureVerificationService';
import { InstantiationService } from 'vs/platform/instantiation/common/instantiationService';
import product from 'vs/platform/product/common/product';
import { Disposable } from 'vs/base/common/lifecycle';
import { FileService } from 'vs/platform/files/common/fileService';
import { DiskFileSystemProvider } from 'vs/platform/files/node/diskFileSystemProvider';
import { Schemas } from 'vs/base/common/network';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
import { SpdLogLogger } from 'vs/platform/log/node/spdlogLog';
import { RemoteExtensionLogFileName } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IServerEnvironmentService, ServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { ExtensionManagementCLI } from 'vs/platform/extensionManagement/common/extensionManagementCLI';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { NativeLanguagePackService } from 'vs/platform/languagePacks/node/languagePacks';
import { getErrorMessage } from 'vs/base/common/errors';
import { URI } from 'vs/base/common/uri';
import { isAbsolute, join } from 'vs/base/common/path';
import { cwd } from 'vs/base/common/process';
import { DownloadService } from 'vs/platform/download/common/downloadService';
import { IDownloadService } from 'vs/platform/download/common/download';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { UriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentityService';
import { buildHelpMessage, buildVersionMessage } from 'vs/platform/environment/node/argv';
import { isWindows } from 'vs/base/common/platform';
import { IExtensionsScannerService } from 'vs/platform/extensionManagement/common/extensionsScannerService';
import { ExtensionsScannerService } from 'vs/server/node/extensionsScannerService';
import { IUserDataProfilesService, UserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { ExtensionsProfileScannerService, IExtensionsProfileScannerService } from 'vs/platform/extensionManagement/common/extensionsProfileScannerService';
import { NullPolicyService } from 'vs/platform/policy/common/policy';
class CliMain extends Disposable {
    args;
    remoteDataFolder;
    constructor(args, remoteDataFolder) {
        super();
        this.args = args;
        this.remoteDataFolder = remoteDataFolder;
        this.registerListeners();
    }
    registerListeners() {
        // Dispose on exit
        process.once('exit', () => this.dispose());
    }
    async run() {
        const instantiationService = await this.initServices();
        await instantiationService.invokeFunction(async (accessor) => {
            const logService = accessor.get(ILogService);
            try {
                await this.doRun(instantiationService.createInstance(ExtensionManagementCLI));
            }
            catch (error) {
                logService.error(error);
                console.error(getErrorMessage(error));
                throw error;
            }
        });
    }
    async initServices() {
        const services = new ServiceCollection();
        const productService = { _serviceBrand: undefined, ...product };
        services.set(IProductService, productService);
        const environmentService = new ServerEnvironmentService(this.args, productService);
        services.set(IServerEnvironmentService, environmentService);
        const logService = new LogService(new SpdLogLogger(RemoteExtensionLogFileName, join(environmentService.logsPath, `${RemoteExtensionLogFileName}.log`), true, false, getLogLevel(environmentService)));
        services.set(ILogService, logService);
        logService.trace(`Remote configuration data at ${this.remoteDataFolder}`);
        logService.trace('process arguments:', this.args);
        // Files
        const fileService = this._register(new FileService(logService));
        services.set(IFileService, fileService);
        fileService.registerProvider(Schemas.file, this._register(new DiskFileSystemProvider(logService)));
        const uriIdentityService = new UriIdentityService(fileService);
        services.set(IUriIdentityService, uriIdentityService);
        // User Data Profiles
        const userDataProfilesService = this._register(new UserDataProfilesService(environmentService, fileService, uriIdentityService, logService));
        services.set(IUserDataProfilesService, userDataProfilesService);
        // Configuration
        const configurationService = this._register(new ConfigurationService(userDataProfilesService.defaultProfile.settingsResource, fileService, new NullPolicyService(), logService));
        await configurationService.initialize();
        services.set(IConfigurationService, configurationService);
        services.set(IRequestService, new SyncDescriptor(RequestService));
        services.set(IDownloadService, new SyncDescriptor(DownloadService));
        services.set(ITelemetryService, NullTelemetryService);
        services.set(IExtensionGalleryService, new SyncDescriptor(ExtensionGalleryServiceWithNoStorageService));
        services.set(IExtensionsProfileScannerService, new SyncDescriptor(ExtensionsProfileScannerService));
        services.set(IExtensionsScannerService, new SyncDescriptor(ExtensionsScannerService));
        services.set(IExtensionSignatureVerificationService, new SyncDescriptor(ExtensionSignatureVerificationService));
        services.set(INativeServerExtensionManagementService, new SyncDescriptor(ExtensionManagementService));
        services.set(ILanguagePackService, new SyncDescriptor(NativeLanguagePackService));
        return new InstantiationService(services);
    }
    async doRun(extensionManagementCLI) {
        // List Extensions
        if (this.args['list-extensions']) {
            return extensionManagementCLI.listExtensions(!!this.args['show-versions'], this.args['category']);
        }
        // Install Extension
        else if (this.args['install-extension'] || this.args['install-builtin-extension']) {
            const installOptions = { isMachineScoped: !!this.args['do-not-sync'], installPreReleaseVersion: !!this.args['pre-release'] };
            return extensionManagementCLI.installExtensions(this.asExtensionIdOrVSIX(this.args['install-extension'] || []), this.args['install-builtin-extension'] || [], installOptions, !!this.args['force']);
        }
        // Uninstall Extension
        else if (this.args['uninstall-extension']) {
            return extensionManagementCLI.uninstallExtensions(this.asExtensionIdOrVSIX(this.args['uninstall-extension']), !!this.args['force']);
        }
        // Locate Extension
        else if (this.args['locate-extension']) {
            return extensionManagementCLI.locateExtension(this.args['locate-extension']);
        }
    }
    asExtensionIdOrVSIX(inputs) {
        return inputs.map(input => /\.vsix$/i.test(input) ? URI.file(isAbsolute(input) ? input : join(cwd(), input)) : input);
    }
}
function eventuallyExit(code) {
    setTimeout(() => process.exit(code), 0);
}
export async function run(args, REMOTE_DATA_FOLDER, optionDescriptions) {
    if (args.help) {
        const executable = product.serverApplicationName + (isWindows ? '.cmd' : '');
        console.log(buildHelpMessage(product.nameLong, executable, product.version, optionDescriptions, { noInputFiles: true, noPipe: true }));
        return;
    }
    // Version Info
    if (args.version) {
        console.log(buildVersionMessage(product.version, product.commit));
        return;
    }
    const cliMain = new CliMain(args, REMOTE_DATA_FOLDER);
    try {
        await cliMain.run();
        eventuallyExit(0);
    }
    catch (err) {
        eventuallyExit(1);
    }
    finally {
        cliMain.dispose();
    }
}
