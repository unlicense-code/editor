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
import { IIssueService } from 'vs/platform/issue/electron-sandbox/issue';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { textLinkForeground, inputBackground, inputBorder, inputForeground, buttonBackground, buttonHoverBackground, buttonForeground, inputValidationErrorBorder, foreground, inputActiveOptionBorder, scrollbarSliderActiveBackground, scrollbarSliderBackground, scrollbarSliderHoverBackground, editorBackground, editorForeground, listHoverBackground, listHoverForeground, textLinkActiveForeground, inputValidationErrorBackground, inputValidationErrorForeground, listActiveSelectionBackground, listActiveSelectionForeground, listFocusOutline, listFocusBackground, listFocusForeground, activeContrastBorder, scrollbarShadow } from 'vs/platform/theme/common/colorRegistry';
import { SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { getZoomLevel } from 'vs/base/browser/browser';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { platform } from 'vs/base/common/process';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { registerMainProcessRemoteService } from 'vs/platform/ipc/electron-sandbox/services';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IIntegrityService } from 'vs/workbench/services/integrity/common/integrity';
import { process } from 'vs/base/parts/sandbox/electron-sandbox/globals';
let WorkbenchIssueService = class WorkbenchIssueService {
    issueService;
    themeService;
    extensionManagementService;
    extensionEnablementService;
    environmentService;
    workspaceTrustManagementService;
    productService;
    experimentService;
    authenticationService;
    integrityService;
    constructor(issueService, themeService, extensionManagementService, extensionEnablementService, environmentService, workspaceTrustManagementService, productService, experimentService, authenticationService, integrityService) {
        this.issueService = issueService;
        this.themeService = themeService;
        this.extensionManagementService = extensionManagementService;
        this.extensionEnablementService = extensionEnablementService;
        this.environmentService = environmentService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.productService = productService;
        this.experimentService = experimentService;
        this.authenticationService = authenticationService;
        this.integrityService = integrityService;
    }
    async openReporter(dataOverrides = {}) {
        const extensionData = [];
        try {
            const extensions = await this.extensionManagementService.getInstalled();
            const enabledExtensions = extensions.filter(extension => this.extensionEnablementService.isEnabled(extension) || (dataOverrides.extensionId && extension.identifier.id === dataOverrides.extensionId));
            extensionData.push(...enabledExtensions.map((extension) => {
                const { manifest } = extension;
                const manifestKeys = manifest.contributes ? Object.keys(manifest.contributes) : [];
                const isTheme = !manifest.activationEvents && manifestKeys.length === 1 && manifestKeys[0] === 'themes';
                const isBuiltin = extension.type === 0 /* ExtensionType.System */;
                return {
                    name: manifest.name,
                    publisher: manifest.publisher,
                    version: manifest.version,
                    repositoryUrl: manifest.repository && manifest.repository.url,
                    bugsUrl: manifest.bugs && manifest.bugs.url,
                    displayName: manifest.displayName,
                    id: extension.identifier.id,
                    isTheme,
                    isBuiltin,
                };
            }));
        }
        catch (e) {
            extensionData.push({
                name: 'Workbench Issue Service',
                publisher: 'Unknown',
                version: '0.0.0',
                repositoryUrl: undefined,
                bugsUrl: undefined,
                displayName: `Extensions not loaded: ${e}`,
                id: 'workbench.issue',
                isTheme: false,
                isBuiltin: true
            });
        }
        const experiments = await this.experimentService.getCurrentExperiments();
        let githubAccessToken = '';
        try {
            const githubSessions = await this.authenticationService.getSessions('github');
            const potentialSessions = githubSessions.filter(session => session.scopes.includes('repo'));
            githubAccessToken = potentialSessions[0]?.accessToken;
        }
        catch (e) {
            // Ignore
        }
        // air on the side of caution and have false be the default
        let isUnsupported = false;
        try {
            isUnsupported = !(await this.integrityService.isPure()).isPure;
        }
        catch (e) {
            // Ignore
        }
        const theme = this.themeService.getColorTheme();
        const issueReporterData = Object.assign({
            styles: getIssueReporterStyles(theme),
            zoomLevel: getZoomLevel(),
            enabledExtensions: extensionData,
            experiments: experiments?.join('\n'),
            restrictedMode: !this.workspaceTrustManagementService.isWorkspaceTrusted(),
            isUnsupported,
            githubAccessToken,
            isSandboxed: process.sandboxed
        }, dataOverrides);
        return this.issueService.openReporter(issueReporterData);
    }
    openProcessExplorer() {
        const theme = this.themeService.getColorTheme();
        const data = {
            pid: this.environmentService.mainPid,
            zoomLevel: getZoomLevel(),
            styles: {
                backgroundColor: getColor(theme, editorBackground),
                color: getColor(theme, editorForeground),
                listHoverBackground: getColor(theme, listHoverBackground),
                listHoverForeground: getColor(theme, listHoverForeground),
                listFocusBackground: getColor(theme, listFocusBackground),
                listFocusForeground: getColor(theme, listFocusForeground),
                listFocusOutline: getColor(theme, listFocusOutline),
                listActiveSelectionBackground: getColor(theme, listActiveSelectionBackground),
                listActiveSelectionForeground: getColor(theme, listActiveSelectionForeground),
                listHoverOutline: getColor(theme, activeContrastBorder),
                scrollbarShadowColor: getColor(theme, scrollbarShadow),
                scrollbarSliderActiveBackgroundColor: getColor(theme, scrollbarSliderActiveBackground),
                scrollbarSliderBackgroundColor: getColor(theme, scrollbarSliderBackground),
                scrollbarSliderHoverBackgroundColor: getColor(theme, scrollbarSliderHoverBackground),
            },
            platform: platform,
            applicationName: this.productService.applicationName
        };
        return this.issueService.openProcessExplorer(data);
    }
};
WorkbenchIssueService = __decorate([
    __param(0, IIssueService),
    __param(1, IThemeService),
    __param(2, IExtensionManagementService),
    __param(3, IWorkbenchExtensionEnablementService),
    __param(4, INativeWorkbenchEnvironmentService),
    __param(5, IWorkspaceTrustManagementService),
    __param(6, IProductService),
    __param(7, IWorkbenchAssignmentService),
    __param(8, IAuthenticationService),
    __param(9, IIntegrityService)
], WorkbenchIssueService);
export { WorkbenchIssueService };
export function getIssueReporterStyles(theme) {
    return {
        backgroundColor: getColor(theme, SIDE_BAR_BACKGROUND),
        color: getColor(theme, foreground),
        textLinkColor: getColor(theme, textLinkForeground),
        textLinkActiveForeground: getColor(theme, textLinkActiveForeground),
        inputBackground: getColor(theme, inputBackground),
        inputForeground: getColor(theme, inputForeground),
        inputBorder: getColor(theme, inputBorder),
        inputActiveBorder: getColor(theme, inputActiveOptionBorder),
        inputErrorBorder: getColor(theme, inputValidationErrorBorder),
        inputErrorBackground: getColor(theme, inputValidationErrorBackground),
        inputErrorForeground: getColor(theme, inputValidationErrorForeground),
        buttonBackground: getColor(theme, buttonBackground),
        buttonForeground: getColor(theme, buttonForeground),
        buttonHoverBackground: getColor(theme, buttonHoverBackground),
        sliderActiveColor: getColor(theme, scrollbarSliderActiveBackground),
        sliderBackgroundColor: getColor(theme, scrollbarSliderBackground),
        sliderHoverColor: getColor(theme, scrollbarSliderHoverBackground),
    };
}
function getColor(theme, key) {
    const color = theme.getColor(key);
    return color ? color.toString() : undefined;
}
registerMainProcessRemoteService(IIssueService, 'issue');
