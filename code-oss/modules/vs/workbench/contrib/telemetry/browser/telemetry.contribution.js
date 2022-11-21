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
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { language } from 'vs/base/common/platform';
import { Disposable } from 'vs/base/common/lifecycle';
import ErrorTelemetry from 'vs/platform/telemetry/browser/errorTelemetry';
import { configurationTelemetry, TrustedTelemetryValue } from 'vs/platform/telemetry/common/telemetryUtils';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { extname, basename, isEqual, isEqualOrParent } from 'vs/base/common/resources';
import { Schemas } from 'vs/base/common/network';
import { getMimeTypes } from 'vs/editor/common/services/languagesAssociations';
import { hash } from 'vs/base/common/hash';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
let TelemetryContribution = class TelemetryContribution extends Disposable {
    telemetryService;
    contextService;
    userDataProfileService;
    static ALLOWLIST_JSON = ['package.json', 'package-lock.json', 'tsconfig.json', 'jsconfig.json', 'bower.json', '.eslintrc.json', 'tslint.json', 'composer.json'];
    static ALLOWLIST_WORKSPACE_JSON = ['settings.json', 'extensions.json', 'tasks.json', 'launch.json'];
    constructor(telemetryService, contextService, lifecycleService, editorService, keybindingsService, themeService, environmentService, userDataProfileService, configurationService, paneCompositeService, textFileService) {
        super();
        this.telemetryService = telemetryService;
        this.contextService = contextService;
        this.userDataProfileService = userDataProfileService;
        const { filesToOpenOrCreate, filesToDiff, filesToMerge } = environmentService;
        const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        telemetryService.publicLog2('workspaceLoad', {
            windowSize: { innerHeight: window.innerHeight, innerWidth: window.innerWidth, outerHeight: window.outerHeight, outerWidth: window.outerWidth },
            emptyWorkbench: contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */,
            'workbench.filesToOpenOrCreate': filesToOpenOrCreate && filesToOpenOrCreate.length || 0,
            'workbench.filesToDiff': filesToDiff && filesToDiff.length || 0,
            'workbench.filesToMerge': filesToMerge && filesToMerge.length || 0,
            customKeybindingsCount: keybindingsService.customKeybindingsCount(),
            theme: themeService.getColorTheme().id,
            language,
            pinnedViewlets: paneCompositeService.getPinnedPaneCompositeIds(0 /* ViewContainerLocation.Sidebar */),
            restoredViewlet: activeViewlet ? activeViewlet.getId() : undefined,
            restoredEditors: editorService.visibleEditors.length,
            startupKind: lifecycleService.startupKind
        });
        // Error Telemetry
        this._register(new ErrorTelemetry(telemetryService));
        // Configuration Telemetry
        this._register(configurationTelemetry(telemetryService, configurationService));
        //  Files Telemetry
        this._register(textFileService.files.onDidResolve(e => this.onTextFileModelResolved(e)));
        this._register(textFileService.files.onDidSave(e => this.onTextFileModelSaved(e)));
        // Lifecycle
        this._register(lifecycleService.onDidShutdown(() => this.dispose()));
    }
    onTextFileModelResolved(e) {
        const settingsType = this.getTypeIfSettings(e.model.resource);
        if (settingsType) {
            this.telemetryService.publicLog2('settingsRead', { settingsType }); // Do not log read to user settings.json and .vscode folder as a fileGet event as it ruins our JSON usage data
        }
        else {
            this.telemetryService.publicLog2('fileGet', this.getTelemetryData(e.model.resource, e.reason));
        }
    }
    onTextFileModelSaved(e) {
        const settingsType = this.getTypeIfSettings(e.model.resource);
        if (settingsType) {
            this.telemetryService.publicLog2('settingsWritten', { settingsType }); // Do not log write to user settings.json and .vscode folder as a filePUT event as it ruins our JSON usage data
        }
        else {
            this.telemetryService.publicLog2('filePUT', this.getTelemetryData(e.model.resource, e.reason));
        }
    }
    getTypeIfSettings(resource) {
        if (extname(resource) !== '.json') {
            return '';
        }
        // Check for global settings file
        if (isEqual(resource, this.userDataProfileService.currentProfile.settingsResource)) {
            return 'global-settings';
        }
        // Check for keybindings file
        if (isEqual(resource, this.userDataProfileService.currentProfile.keybindingsResource)) {
            return 'keybindings';
        }
        // Check for snippets
        if (isEqualOrParent(resource, this.userDataProfileService.currentProfile.snippetsHome)) {
            return 'snippets';
        }
        // Check for workspace settings file
        const folders = this.contextService.getWorkspace().folders;
        for (const folder of folders) {
            if (isEqualOrParent(resource, folder.toResource('.vscode'))) {
                const filename = basename(resource);
                if (TelemetryContribution.ALLOWLIST_WORKSPACE_JSON.indexOf(filename) > -1) {
                    return `.vscode/${filename}`;
                }
            }
        }
        return '';
    }
    getTelemetryData(resource, reason) {
        let ext = extname(resource);
        // Remove query parameters from the resource extension
        const queryStringLocation = ext.indexOf('?');
        ext = queryStringLocation !== -1 ? ext.substr(0, queryStringLocation) : ext;
        const fileName = basename(resource);
        const path = resource.scheme === Schemas.file ? resource.fsPath : resource.path;
        const telemetryData = {
            mimeType: new TrustedTelemetryValue(getMimeTypes(resource).join(', ')),
            ext,
            path: hash(path),
            reason,
            allowlistedjson: undefined
        };
        if (ext === '.json' && TelemetryContribution.ALLOWLIST_JSON.indexOf(fileName) > -1) {
            telemetryData['allowlistedjson'] = fileName;
        }
        return telemetryData;
    }
};
TelemetryContribution = __decorate([
    __param(0, ITelemetryService),
    __param(1, IWorkspaceContextService),
    __param(2, ILifecycleService),
    __param(3, IEditorService),
    __param(4, IKeybindingService),
    __param(5, IWorkbenchThemeService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, IUserDataProfileService),
    __param(8, IConfigurationService),
    __param(9, IPaneCompositePartService),
    __param(10, ITextFileService)
], TelemetryContribution);
export { TelemetryContribution };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(TelemetryContribution, 3 /* LifecyclePhase.Restored */);
