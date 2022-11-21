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
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { DefaultConfigurationExportHelper } from 'vs/workbench/contrib/configExporter/electron-sandbox/configurationExportHelper';
let ExtensionPoints = class ExtensionPoints {
    constructor(instantiationService, environmentService) {
        // Config Exporter
        if (environmentService.args['export-default-configuration']) {
            instantiationService.createInstance(DefaultConfigurationExportHelper);
        }
    }
};
ExtensionPoints = __decorate([
    __param(0, IInstantiationService),
    __param(1, INativeWorkbenchEnvironmentService)
], ExtensionPoints);
export { ExtensionPoints };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(ExtensionPoints, 3 /* LifecyclePhase.Restored */);
