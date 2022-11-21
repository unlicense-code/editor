/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Schemas } from 'vs/base/common/network';
import { isWeb } from 'vs/base/common/platform';
import { isString } from 'vs/base/common/types';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionManagementCLI } from 'vs/platform/extensionManagement/common/extensionManagementCLI';
import { getExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ILabelService } from 'vs/platform/label/common/label';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
// this class contains the commands that the CLI server is reying on
CommandsRegistry.registerCommand('_remoteCLI.openExternal', function (accessor, uri) {
    const openerService = accessor.get(IOpenerService);
    return openerService.open(isString(uri) ? uri : URI.revive(uri), { openExternal: true, allowTunneling: true });
});
CommandsRegistry.registerCommand('_remoteCLI.windowOpen', function (accessor, toOpen, options) {
    const commandService = accessor.get(ICommandService);
    if (!toOpen.length) {
        return commandService.executeCommand('_files.newWindow', options);
    }
    return commandService.executeCommand('_files.windowOpen', toOpen, options);
});
CommandsRegistry.registerCommand('_remoteCLI.getSystemStatus', function (accessor) {
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand('_issues.getSystemStatus');
});
CommandsRegistry.registerCommand('_remoteCLI.manageExtensions', async function (accessor, args) {
    const instantiationService = accessor.get(IInstantiationService);
    const extensionManagementServerService = accessor.get(IExtensionManagementServerService);
    const remoteExtensionManagementService = extensionManagementServerService.remoteExtensionManagementServer?.extensionManagementService;
    if (!remoteExtensionManagementService) {
        return;
    }
    const cliService = instantiationService.createChild(new ServiceCollection([IExtensionManagementService, remoteExtensionManagementService])).createInstance(RemoteExtensionManagementCLI);
    const lines = [];
    const output = { log: lines.push.bind(lines), error: lines.push.bind(lines) };
    if (args.list) {
        await cliService.listExtensions(!!args.list.showVersions, args.list.category, undefined, output);
    }
    else {
        const revive = (inputs) => inputs.map(input => isString(input) ? input : URI.revive(input));
        if (Array.isArray(args.install) && args.install.length) {
            try {
                await cliService.installExtensions(revive(args.install), [], { isMachineScoped: true }, !!args.force, output);
            }
            catch (e) {
                lines.push(e.message);
            }
        }
        if (Array.isArray(args.uninstall) && args.uninstall.length) {
            try {
                await cliService.uninstallExtensions(revive(args.uninstall), !!args.force, undefined, output);
            }
            catch (e) {
                lines.push(e.message);
            }
        }
    }
    return lines.join('\n');
});
let RemoteExtensionManagementCLI = class RemoteExtensionManagementCLI extends ExtensionManagementCLI {
    _extensionManifestPropertiesService;
    _location;
    constructor(extensionManagementService, productService, configurationService, extensionGalleryService, labelService, envService, _extensionManifestPropertiesService) {
        super(extensionManagementService, extensionGalleryService);
        this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
        const remoteAuthority = envService.remoteAuthority;
        this._location = remoteAuthority ? labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) : undefined;
    }
    get location() {
        return this._location;
    }
    validateExtensionKind(manifest, output) {
        if (!this._extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)
            // Web extensions installed on remote can be run in web worker extension host
            && !(isWeb && this._extensionManifestPropertiesService.canExecuteOnWeb(manifest))) {
            output.log(localize('cannot be installed', "Cannot install the '{0}' extension because it is declared to not run in this setup.", getExtensionId(manifest.publisher, manifest.name)));
            return false;
        }
        return true;
    }
};
RemoteExtensionManagementCLI = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, IProductService),
    __param(2, IConfigurationService),
    __param(3, IExtensionGalleryService),
    __param(4, ILabelService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IExtensionManifestPropertiesService)
], RemoteExtensionManagementCLI);
