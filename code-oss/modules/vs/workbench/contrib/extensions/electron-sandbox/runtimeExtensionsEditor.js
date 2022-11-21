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
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService, createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILabelService } from 'vs/platform/label/common/label';
import { SlowExtensionAction } from 'vs/workbench/contrib/extensions/electron-sandbox/extensionsSlowActions';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ReportExtensionIssueAction } from 'vs/workbench/contrib/extensions/common/reportExtensionIssueAction';
import { AbstractRuntimeExtensionsEditor } from 'vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor';
import { VSBuffer } from 'vs/base/common/buffer';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { Utils } from 'vs/platform/profiling/common/profiling';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
export const IExtensionHostProfileService = createDecorator('extensionHostProfileService');
export const CONTEXT_PROFILE_SESSION_STATE = new RawContextKey('profileSessionState', 'none');
export const CONTEXT_EXTENSION_HOST_PROFILE_RECORDED = new RawContextKey('extensionHostProfileRecorded', false);
export var ProfileSessionState;
(function (ProfileSessionState) {
    ProfileSessionState[ProfileSessionState["None"] = 0] = "None";
    ProfileSessionState[ProfileSessionState["Starting"] = 1] = "Starting";
    ProfileSessionState[ProfileSessionState["Running"] = 2] = "Running";
    ProfileSessionState[ProfileSessionState["Stopping"] = 3] = "Stopping";
})(ProfileSessionState || (ProfileSessionState = {}));
let RuntimeExtensionsEditor = class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    _extensionHostProfileService;
    _profileInfo;
    _extensionsHostRecorded;
    _profileSessionState;
    constructor(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService, _extensionHostProfileService) {
        super(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService, clipboardService);
        this._extensionHostProfileService = _extensionHostProfileService;
        this._profileInfo = this._extensionHostProfileService.lastProfile;
        this._extensionsHostRecorded = CONTEXT_EXTENSION_HOST_PROFILE_RECORDED.bindTo(contextKeyService);
        this._profileSessionState = CONTEXT_PROFILE_SESSION_STATE.bindTo(contextKeyService);
        this._register(this._extensionHostProfileService.onDidChangeLastProfile(() => {
            this._profileInfo = this._extensionHostProfileService.lastProfile;
            this._extensionsHostRecorded.set(!!this._profileInfo);
            this._updateExtensions();
        }));
        this._register(this._extensionHostProfileService.onDidChangeState(() => {
            const state = this._extensionHostProfileService.state;
            this._profileSessionState.set(ProfileSessionState[state].toLowerCase());
        }));
    }
    _getProfileInfo() {
        return this._profileInfo;
    }
    _getUnresponsiveProfile(extensionId) {
        return this._extensionHostProfileService.getUnresponsiveProfile(extensionId);
    }
    _createSlowExtensionAction(element) {
        if (element.unresponsiveProfile) {
            return this._instantiationService.createInstance(SlowExtensionAction, element.description, element.unresponsiveProfile);
        }
        return null;
    }
    _createReportExtensionIssueAction(element) {
        if (element.marketplaceInfo) {
            return this._instantiationService.createInstance(ReportExtensionIssueAction, element.description);
        }
        return null;
    }
    _createSaveExtensionHostProfileAction() {
        return this._instantiationService.createInstance(SaveExtensionHostProfileAction, SaveExtensionHostProfileAction.ID, SaveExtensionHostProfileAction.LABEL);
    }
    _createProfileAction() {
        const state = this._extensionHostProfileService.state;
        const profileAction = (state === ProfileSessionState.Running
            ? this._instantiationService.createInstance(StopExtensionHostProfileAction, StopExtensionHostProfileAction.ID, StopExtensionHostProfileAction.LABEL)
            : this._instantiationService.createInstance(StartExtensionHostProfileAction, StartExtensionHostProfileAction.ID, StartExtensionHostProfileAction.LABEL));
        return profileAction;
    }
};
RuntimeExtensionsEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IThemeService),
    __param(2, IContextKeyService),
    __param(3, IExtensionsWorkbenchService),
    __param(4, IExtensionService),
    __param(5, INotificationService),
    __param(6, IContextMenuService),
    __param(7, IInstantiationService),
    __param(8, IStorageService),
    __param(9, ILabelService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IClipboardService),
    __param(12, IExtensionHostProfileService)
], RuntimeExtensionsEditor);
export { RuntimeExtensionsEditor };
let StartExtensionHostProfileAction = class StartExtensionHostProfileAction extends Action {
    _extensionHostProfileService;
    static ID = 'workbench.extensions.action.extensionHostProfile';
    static LABEL = nls.localize('extensionHostProfileStart', "Start Extension Host Profile");
    constructor(id = StartExtensionHostProfileAction.ID, label = StartExtensionHostProfileAction.LABEL, _extensionHostProfileService) {
        super(id, label);
        this._extensionHostProfileService = _extensionHostProfileService;
    }
    run() {
        this._extensionHostProfileService.startProfiling();
        return Promise.resolve();
    }
};
StartExtensionHostProfileAction = __decorate([
    __param(2, IExtensionHostProfileService)
], StartExtensionHostProfileAction);
export { StartExtensionHostProfileAction };
let StopExtensionHostProfileAction = class StopExtensionHostProfileAction extends Action {
    _extensionHostProfileService;
    static ID = 'workbench.extensions.action.stopExtensionHostProfile';
    static LABEL = nls.localize('stopExtensionHostProfileStart', "Stop Extension Host Profile");
    constructor(id = StartExtensionHostProfileAction.ID, label = StartExtensionHostProfileAction.LABEL, _extensionHostProfileService) {
        super(id, label);
        this._extensionHostProfileService = _extensionHostProfileService;
    }
    run() {
        this._extensionHostProfileService.stopProfiling();
        return Promise.resolve();
    }
};
StopExtensionHostProfileAction = __decorate([
    __param(2, IExtensionHostProfileService)
], StopExtensionHostProfileAction);
export { StopExtensionHostProfileAction };
let SaveExtensionHostProfileAction = class SaveExtensionHostProfileAction extends Action {
    _nativeHostService;
    _environmentService;
    _extensionHostProfileService;
    _fileService;
    static LABEL = nls.localize('saveExtensionHostProfile', "Save Extension Host Profile");
    static ID = 'workbench.extensions.action.saveExtensionHostProfile';
    constructor(id = SaveExtensionHostProfileAction.ID, label = SaveExtensionHostProfileAction.LABEL, _nativeHostService, _environmentService, _extensionHostProfileService, _fileService) {
        super(id, label, undefined, false);
        this._nativeHostService = _nativeHostService;
        this._environmentService = _environmentService;
        this._extensionHostProfileService = _extensionHostProfileService;
        this._fileService = _fileService;
        this._extensionHostProfileService.onDidChangeLastProfile(() => {
            this.enabled = (this._extensionHostProfileService.lastProfile !== null);
        });
    }
    run() {
        return Promise.resolve(this._asyncRun());
    }
    async _asyncRun() {
        const picked = await this._nativeHostService.showSaveDialog({
            title: nls.localize('saveprofile.dialogTitle', "Save Extension Host Profile"),
            buttonLabel: nls.localize('saveprofile.saveButton', "Save"),
            defaultPath: `CPU-${new Date().toISOString().replace(/[\-:]/g, '')}.cpuprofile`,
            filters: [{
                    name: 'CPU Profiles',
                    extensions: ['cpuprofile', 'txt']
                }]
        });
        if (!picked || !picked.filePath || picked.canceled) {
            return;
        }
        const profileInfo = this._extensionHostProfileService.lastProfile;
        let dataToWrite = profileInfo ? profileInfo.data : {};
        let savePath = picked.filePath;
        if (this._environmentService.isBuilt) {
            // when running from a not-development-build we remove
            // absolute filenames because we don't want to reveal anything
            // about users. We also append the `.txt` suffix to make it
            // easier to attach these files to GH issues
            dataToWrite = Utils.rewriteAbsolutePaths(dataToWrite, 'piiRemoved');
            savePath = savePath + '.txt';
        }
        return this._fileService.writeFile(URI.file(savePath), VSBuffer.fromString(JSON.stringify(profileInfo ? profileInfo.data : {}, null, '\t')));
    }
};
SaveExtensionHostProfileAction = __decorate([
    __param(2, INativeHostService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IExtensionHostProfileService),
    __param(5, IFileService)
], SaveExtensionHostProfileAction);
export { SaveExtensionHostProfileAction };
