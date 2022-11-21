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
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { codeActionsExtensionPointDescriptor } from 'vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint';
import { documentationExtensionPointDescriptor } from 'vs/workbench/contrib/codeActions/common/documentationExtensionPoint';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { CodeActionsContribution, editorConfiguration } from './codeActionsContribution';
import { CodeActionDocumentationContribution } from './documentationContribution';
const codeActionsExtensionPoint = ExtensionsRegistry.registerExtensionPoint(codeActionsExtensionPointDescriptor);
const documentationExtensionPoint = ExtensionsRegistry.registerExtensionPoint(documentationExtensionPointDescriptor);
Registry.as(Extensions.Configuration)
    .registerConfiguration(editorConfiguration);
let WorkbenchConfigurationContribution = class WorkbenchConfigurationContribution {
    constructor(instantiationService) {
        instantiationService.createInstance(CodeActionsContribution, codeActionsExtensionPoint);
        instantiationService.createInstance(CodeActionDocumentationContribution, documentationExtensionPoint);
    }
};
WorkbenchConfigurationContribution = __decorate([
    __param(0, IInstantiationService)
], WorkbenchConfigurationContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WorkbenchConfigurationContribution, 4 /* LifecyclePhase.Eventually */);
