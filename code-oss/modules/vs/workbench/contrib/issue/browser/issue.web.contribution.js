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
import * as nls from 'vs/nls';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IProductService } from 'vs/platform/product/common/productService';
import { Registry } from 'vs/platform/registry/common/platform';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { WebIssueService } from 'vs/workbench/contrib/issue/browser/issueService';
import { OpenIssueReporterActionId, OpenIssueReporterApiCommandId } from 'vs/workbench/contrib/issue/common/commands';
import { IWorkbenchIssueService } from 'vs/workbench/services/issue/common/issue';
let RegisterIssueContribution = class RegisterIssueContribution {
    productService;
    constructor(productService) {
        this.productService = productService;
        if (productService.reportIssueUrl) {
            const OpenIssueReporterActionLabel = nls.localize({ key: 'reportIssueInEnglish', comment: ['Translate this to "Report Issue in English" in all languages please!'] }, "Report Issue");
            CommandsRegistry.registerCommand(OpenIssueReporterActionId, function (accessor, args) {
                let extensionId;
                if (args) {
                    if (Array.isArray(args)) {
                        [extensionId] = args;
                    }
                    else {
                        extensionId = args.extensionId;
                    }
                }
                return accessor.get(IWorkbenchIssueService).openReporter({ extensionId });
            });
            CommandsRegistry.registerCommand({
                id: OpenIssueReporterApiCommandId,
                handler: function (accessor, args) {
                    let extensionId;
                    if (args) {
                        if (Array.isArray(args)) {
                            [extensionId] = args;
                        }
                        else {
                            extensionId = args.extensionId;
                        }
                    }
                    if (!!extensionId && typeof extensionId !== 'string') {
                        throw new Error(`Invalid argument when running '${OpenIssueReporterApiCommandId}: 'extensionId' must be of type string `);
                    }
                    return accessor.get(IWorkbenchIssueService).openReporter({ extensionId });
                },
                description: {
                    description: 'Open the issue reporter and optionally prefill part of the form.',
                    args: [
                        {
                            name: 'options',
                            description: 'Data to use to prefill the issue reporter with.',
                            isOptional: true,
                            schema: {
                                oneOf: [
                                    {
                                        type: 'string',
                                        description: 'The extension id to preselect.'
                                    },
                                    {
                                        type: 'object',
                                        properties: {
                                            extensionId: {
                                                type: 'string'
                                            },
                                        }
                                    }
                                ]
                            }
                        },
                    ]
                }
            });
            const command = {
                id: OpenIssueReporterActionId,
                title: { value: OpenIssueReporterActionLabel, original: 'Report Issue' },
                category: Categories.Help
            };
            MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command });
            MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
                group: '3_feedback',
                command,
                order: 3
            });
        }
    }
};
RegisterIssueContribution = __decorate([
    __param(0, IProductService)
], RegisterIssueContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(RegisterIssueContribution, 1 /* LifecyclePhase.Starting */);
CommandsRegistry.registerCommand('_issues.getSystemStatus', (accessor) => {
    return nls.localize('statusUnsupported', "The --status argument is not yet supported in browsers.");
});
registerSingleton(IWorkbenchIssueService, WebIssueService, 1 /* InstantiationType.Delayed */);
