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
import { language } from 'vs/base/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IProductService } from 'vs/platform/product/common/productService';
import { Severity, INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { URI } from 'vs/base/common/uri';
import { platform } from 'vs/base/common/process';
import { ThrottledDelayer } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
const WAIT_TIME_TO_SHOW_SURVEY = 1000 * 60 * 60; // 1 hour
const MIN_WAIT_TIME_TO_SHOW_SURVEY = 1000 * 60 * 2; // 2 minutes
const MAX_INSTALL_AGE = 1000 * 60 * 60 * 24; // 24 hours
const REMIND_LATER_DELAY = 1000 * 60 * 60 * 4; // 4 hours
const SKIP_SURVEY_KEY = 'ces/skipSurvey';
const REMIND_LATER_DATE_KEY = 'ces/remindLaterDate';
let CESContribution = class CESContribution extends Disposable {
    storageService;
    notificationService;
    telemetryService;
    openerService;
    productService;
    promptDelayer = this._register(new ThrottledDelayer(0));
    tasExperimentService;
    constructor(storageService, notificationService, telemetryService, openerService, productService, tasExperimentService) {
        super();
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.telemetryService = telemetryService;
        this.openerService = openerService;
        this.productService = productService;
        this.tasExperimentService = tasExperimentService;
        if (!productService.cesSurveyUrl) {
            return;
        }
        const skipSurvey = storageService.get(SKIP_SURVEY_KEY, -1 /* StorageScope.APPLICATION */, '');
        if (skipSurvey) {
            return;
        }
        this.schedulePrompt();
    }
    async promptUser() {
        const isCandidate = await this.tasExperimentService?.getTreatment('CESSurvey');
        if (!isCandidate) {
            this.skipSurvey();
            return;
        }
        const sendTelemetry = (userReaction) => {
            /* __GDPR__
            "cesSurvey:popup" : {
                "owner": "digitarald",
                "userReaction" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
            */
            this.telemetryService.publicLog('cesSurvey:popup', { userReaction });
        };
        const message = await this.tasExperimentService?.getTreatment('CESSurveyMessage') ?? nls.localize('cesSurveyQuestion', 'Got a moment to help the VS Code team? Please tell us about your experience with VS Code so far.');
        const button = await this.tasExperimentService?.getTreatment('CESSurveyButton') ?? nls.localize('giveFeedback', "Give Feedback");
        const notification = this.notificationService.prompt(Severity.Info, message, [{
                label: button,
                run: () => {
                    sendTelemetry('accept');
                    this.telemetryService.getTelemetryInfo().then(info => {
                        let surveyUrl = `${this.productService.cesSurveyUrl}?o=${encodeURIComponent(platform)}&v=${encodeURIComponent(this.productService.version)}&m=${encodeURIComponent(info.machineId)}`;
                        const usedParams = this.productService.surveys
                            ?.filter(surveyData => surveyData.surveyId && surveyData.languageId)
                            // Counts provided by contrib/surveys/browser/languageSurveys
                            .filter(surveyData => this.storageService.getNumber(`${surveyData.surveyId}.editedCount`, -1 /* StorageScope.APPLICATION */, 0) > 0)
                            .map(surveyData => `${encodeURIComponent(surveyData.languageId)}Lang=1`)
                            .join('&');
                        if (usedParams) {
                            surveyUrl += `&${usedParams}`;
                        }
                        this.openerService.open(URI.parse(surveyUrl));
                        this.skipSurvey();
                    });
                }
            }, {
                label: nls.localize('remindLater', "Remind Me later"),
                run: () => {
                    sendTelemetry('remindLater');
                    this.storageService.store(REMIND_LATER_DATE_KEY, new Date().toUTCString(), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
                    this.schedulePrompt();
                }
            }], {
            sticky: true,
            onCancel: () => {
                sendTelemetry('cancelled');
                this.skipSurvey();
            }
        });
        await Event.toPromise(notification.onDidClose);
    }
    async schedulePrompt() {
        let waitTimeToShowSurvey = 0;
        const remindLaterDate = this.storageService.get(REMIND_LATER_DATE_KEY, -1 /* StorageScope.APPLICATION */, '');
        if (remindLaterDate) {
            const timeToRemind = new Date(remindLaterDate).getTime() + REMIND_LATER_DELAY - Date.now();
            if (timeToRemind > 0) {
                waitTimeToShowSurvey = timeToRemind;
            }
        }
        else {
            const info = await this.telemetryService.getTelemetryInfo();
            const timeFromInstall = Date.now() - new Date(info.firstSessionDate).getTime();
            const isNewInstall = !isNaN(timeFromInstall) && timeFromInstall < MAX_INSTALL_AGE;
            // Installation is older than MAX_INSTALL_AGE
            if (!isNewInstall) {
                this.skipSurvey();
                return;
            }
            if (timeFromInstall < WAIT_TIME_TO_SHOW_SURVEY) {
                waitTimeToShowSurvey = WAIT_TIME_TO_SHOW_SURVEY - timeFromInstall;
            }
        }
        /* __GDPR__
        "cesSurvey:schedule" : {
            "owner": "digitarald"
        }
        */
        this.telemetryService.publicLog('cesSurvey:schedule');
        this.promptDelayer.trigger(async () => {
            await this.promptUser();
        }, Math.max(waitTimeToShowSurvey, MIN_WAIT_TIME_TO_SHOW_SURVEY));
    }
    skipSurvey() {
        this.storageService.store(SKIP_SURVEY_KEY, this.productService.version, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
    }
};
CESContribution = __decorate([
    __param(0, IStorageService),
    __param(1, INotificationService),
    __param(2, ITelemetryService),
    __param(3, IOpenerService),
    __param(4, IProductService),
    __param(5, IWorkbenchAssignmentService)
], CESContribution);
if (language === 'en') {
    const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(CESContribution, 3 /* LifecyclePhase.Restored */);
}
