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
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IExperimentService, ExperimentActionType } from 'vs/workbench/contrib/experiments/common/experimentService';
import { VIEWLET_ID as EXTENSIONS_VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { Disposable } from 'vs/base/common/lifecycle';
import { language } from 'vs/base/common/platform';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { URI } from 'vs/base/common/uri';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let ExperimentalPrompts = class ExperimentalPrompts extends Disposable {
    experimentService;
    paneCompositeService;
    notificationService;
    openerService;
    commandService;
    constructor(experimentService, paneCompositeService, notificationService, openerService, commandService) {
        super();
        this.experimentService = experimentService;
        this.paneCompositeService = paneCompositeService;
        this.notificationService = notificationService;
        this.openerService = openerService;
        this.commandService = commandService;
        this._register(this.experimentService.onExperimentEnabled(e => {
            if (e.action && e.action.type === ExperimentActionType.Prompt && e.state === 2 /* ExperimentState.Run */) {
                this.showExperimentalPrompts(e);
            }
        }, this));
    }
    showExperimentalPrompts(experiment) {
        if (!experiment || !experiment.enabled || !experiment.action || experiment.state !== 2 /* ExperimentState.Run */) {
            return;
        }
        const actionProperties = experiment.action.properties;
        const promptText = ExperimentalPrompts.getLocalizedText(actionProperties.promptText, language || '');
        if (!actionProperties || !promptText) {
            return;
        }
        if (!actionProperties.commands) {
            actionProperties.commands = [];
        }
        const choices = actionProperties.commands.map((command) => {
            const commandText = ExperimentalPrompts.getLocalizedText(command.text, language || '');
            return {
                label: commandText,
                run: () => {
                    if (command.externalLink) {
                        this.openerService.open(URI.parse(command.externalLink));
                    }
                    else if (command.curatedExtensionsKey && Array.isArray(command.curatedExtensionsList)) {
                        this.paneCompositeService.openPaneComposite(EXTENSIONS_VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                            .then(viewlet => viewlet?.getViewPaneContainer())
                            .then(viewlet => {
                            viewlet?.search('curated:' + command.curatedExtensionsKey);
                        });
                    }
                    else if (command.codeCommand) {
                        this.commandService.executeCommand(command.codeCommand.id, ...command.codeCommand.arguments);
                    }
                    this.experimentService.markAsCompleted(experiment.id);
                }
            };
        });
        this.notificationService.prompt(Severity.Info, promptText, choices, {
            onCancel: () => {
                this.experimentService.markAsCompleted(experiment.id);
            }
        });
    }
    static getLocalizedText(text, displayLanguage) {
        if (typeof text === 'string') {
            return text;
        }
        const msgInEnglish = text['en'] || text['en-us'];
        displayLanguage = displayLanguage.toLowerCase();
        if (!text[displayLanguage] && displayLanguage.indexOf('-') === 2) {
            displayLanguage = displayLanguage.substr(0, 2);
        }
        return text[displayLanguage] || msgInEnglish;
    }
};
ExperimentalPrompts = __decorate([
    __param(0, IExperimentService),
    __param(1, IPaneCompositePartService),
    __param(2, INotificationService),
    __param(3, IOpenerService),
    __param(4, ICommandService)
], ExperimentalPrompts);
export { ExperimentalPrompts };
