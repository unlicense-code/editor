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
import { Action } from 'vs/base/common/actions';
import { IWorkbenchIssueService } from 'vs/workbench/services/issue/common/issue';
let ReportExtensionIssueAction = class ReportExtensionIssueAction extends Action {
    extension;
    issueService;
    static _id = 'workbench.extensions.action.reportExtensionIssue';
    static _label = nls.localize('reportExtensionIssue', "Report Issue");
    // TODO: Consider passing in IExtensionStatus or IExtensionHostProfile for additional data
    constructor(extension, issueService) {
        super(ReportExtensionIssueAction._id, ReportExtensionIssueAction._label, 'extension-action report-issue');
        this.extension = extension;
        this.issueService = issueService;
        this.enabled = extension.isBuiltin || (!!extension.repository && !!extension.repository.url);
    }
    async run() {
        await this.issueService.openReporter({
            extensionId: this.extension.id,
        });
    }
};
ReportExtensionIssueAction = __decorate([
    __param(1, IWorkbenchIssueService)
], ReportExtensionIssueAction);
export { ReportExtensionIssueAction };
