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
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { RawContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { AutoSaveConfiguration, HotExitConfiguration } from 'vs/platform/files/common/files';
import { equals } from 'vs/base/common/objects';
import { isWeb } from 'vs/base/common/platform';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export const AutoSaveAfterShortDelayContext = new RawContextKey('autoSaveAfterShortDelayContext', false, true);
export var AutoSaveMode;
(function (AutoSaveMode) {
    AutoSaveMode[AutoSaveMode["OFF"] = 0] = "OFF";
    AutoSaveMode[AutoSaveMode["AFTER_SHORT_DELAY"] = 1] = "AFTER_SHORT_DELAY";
    AutoSaveMode[AutoSaveMode["AFTER_LONG_DELAY"] = 2] = "AFTER_LONG_DELAY";
    AutoSaveMode[AutoSaveMode["ON_FOCUS_CHANGE"] = 3] = "ON_FOCUS_CHANGE";
    AutoSaveMode[AutoSaveMode["ON_WINDOW_CHANGE"] = 4] = "ON_WINDOW_CHANGE";
})(AutoSaveMode || (AutoSaveMode = {}));
export const IFilesConfigurationService = createDecorator('filesConfigurationService');
let FilesConfigurationService = class FilesConfigurationService extends Disposable {
    configurationService;
    contextService;
    static DEFAULT_AUTO_SAVE_MODE = isWeb ? AutoSaveConfiguration.AFTER_DELAY : AutoSaveConfiguration.OFF;
    _onAutoSaveConfigurationChange = this._register(new Emitter());
    onAutoSaveConfigurationChange = this._onAutoSaveConfigurationChange.event;
    _onFilesAssociationChange = this._register(new Emitter());
    onFilesAssociationChange = this._onFilesAssociationChange.event;
    configuredAutoSaveDelay;
    configuredAutoSaveOnFocusChange;
    configuredAutoSaveOnWindowChange;
    autoSaveAfterShortDelayContext;
    currentFilesAssociationConfig;
    currentHotExitConfig;
    constructor(contextKeyService, configurationService, contextService) {
        super();
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.autoSaveAfterShortDelayContext = AutoSaveAfterShortDelayContext.bindTo(contextKeyService);
        const configuration = configurationService.getValue();
        this.currentFilesAssociationConfig = configuration?.files?.associations;
        this.currentHotExitConfig = configuration?.files?.hotExit || HotExitConfiguration.ON_EXIT;
        this.onFilesConfigurationChange(configuration);
        this.registerListeners();
    }
    registerListeners() {
        // Files configuration changes
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('files')) {
                this.onFilesConfigurationChange(this.configurationService.getValue());
            }
        }));
    }
    onFilesConfigurationChange(configuration) {
        // Auto Save
        const autoSaveMode = configuration?.files?.autoSave || FilesConfigurationService.DEFAULT_AUTO_SAVE_MODE;
        switch (autoSaveMode) {
            case AutoSaveConfiguration.AFTER_DELAY:
                this.configuredAutoSaveDelay = configuration?.files?.autoSaveDelay;
                this.configuredAutoSaveOnFocusChange = false;
                this.configuredAutoSaveOnWindowChange = false;
                break;
            case AutoSaveConfiguration.ON_FOCUS_CHANGE:
                this.configuredAutoSaveDelay = undefined;
                this.configuredAutoSaveOnFocusChange = true;
                this.configuredAutoSaveOnWindowChange = false;
                break;
            case AutoSaveConfiguration.ON_WINDOW_CHANGE:
                this.configuredAutoSaveDelay = undefined;
                this.configuredAutoSaveOnFocusChange = false;
                this.configuredAutoSaveOnWindowChange = true;
                break;
            default:
                this.configuredAutoSaveDelay = undefined;
                this.configuredAutoSaveOnFocusChange = false;
                this.configuredAutoSaveOnWindowChange = false;
                break;
        }
        this.autoSaveAfterShortDelayContext.set(this.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */);
        // Emit as event
        this._onAutoSaveConfigurationChange.fire(this.getAutoSaveConfiguration());
        // Check for change in files associations
        const filesAssociation = configuration?.files?.associations;
        if (!equals(this.currentFilesAssociationConfig, filesAssociation)) {
            this.currentFilesAssociationConfig = filesAssociation;
            this._onFilesAssociationChange.fire();
        }
        // Hot exit
        const hotExitMode = configuration?.files?.hotExit;
        if (hotExitMode === HotExitConfiguration.OFF || hotExitMode === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
            this.currentHotExitConfig = hotExitMode;
        }
        else {
            this.currentHotExitConfig = HotExitConfiguration.ON_EXIT;
        }
    }
    getAutoSaveMode() {
        if (this.configuredAutoSaveOnFocusChange) {
            return 3 /* AutoSaveMode.ON_FOCUS_CHANGE */;
        }
        if (this.configuredAutoSaveOnWindowChange) {
            return 4 /* AutoSaveMode.ON_WINDOW_CHANGE */;
        }
        if (typeof this.configuredAutoSaveDelay === 'number' && this.configuredAutoSaveDelay >= 0) {
            return this.configuredAutoSaveDelay <= 1000 ? 1 /* AutoSaveMode.AFTER_SHORT_DELAY */ : 2 /* AutoSaveMode.AFTER_LONG_DELAY */;
        }
        return 0 /* AutoSaveMode.OFF */;
    }
    getAutoSaveConfiguration() {
        return {
            autoSaveDelay: typeof this.configuredAutoSaveDelay === 'number' && this.configuredAutoSaveDelay >= 0 ? this.configuredAutoSaveDelay : undefined,
            autoSaveFocusChange: !!this.configuredAutoSaveOnFocusChange,
            autoSaveApplicationChange: !!this.configuredAutoSaveOnWindowChange
        };
    }
    async toggleAutoSave() {
        const currentSetting = this.configurationService.getValue('files.autoSave');
        let newAutoSaveValue;
        if ([AutoSaveConfiguration.AFTER_DELAY, AutoSaveConfiguration.ON_FOCUS_CHANGE, AutoSaveConfiguration.ON_WINDOW_CHANGE].some(setting => setting === currentSetting)) {
            newAutoSaveValue = AutoSaveConfiguration.OFF;
        }
        else {
            newAutoSaveValue = AutoSaveConfiguration.AFTER_DELAY;
        }
        return this.configurationService.updateValue('files.autoSave', newAutoSaveValue);
    }
    get isHotExitEnabled() {
        if (this.contextService.getWorkspace().transient) {
            // Transient workspace: hot exit is disabled because
            // transient workspaces are not restored upon restart
            return false;
        }
        return this.currentHotExitConfig !== HotExitConfiguration.OFF;
    }
    get hotExitConfiguration() {
        return this.currentHotExitConfig;
    }
    preventSaveConflicts(resource, language) {
        return this.configurationService.getValue('files.saveConflictResolution', { resource, overrideIdentifier: language }) !== 'overwriteFileOnDisk';
    }
};
FilesConfigurationService = __decorate([
    __param(0, IContextKeyService),
    __param(1, IConfigurationService),
    __param(2, IWorkspaceContextService)
], FilesConfigurationService);
export { FilesConfigurationService };
registerSingleton(IFilesConfigurationService, FilesConfigurationService, 0 /* InstantiationType.Eager */);
