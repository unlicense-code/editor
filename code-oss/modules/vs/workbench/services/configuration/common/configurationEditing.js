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
import * as json from 'vs/base/common/json';
import { setProperty } from 'vs/base/common/jsonEdit';
import { Queue } from 'vs/base/common/async';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { FOLDER_SETTINGS_PATH, WORKSPACE_STANDALONE_CONFIGURATIONS, TASKS_CONFIGURATION_KEY, LAUNCH_CONFIGURATION_KEY, USER_STANDALONE_CONFIGURATIONS, TASKS_DEFAULT, FOLDER_SCOPES } from 'vs/workbench/services/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { Extensions as ConfigurationExtensions, keyFromOverrideIdentifiers, OVERRIDE_PROPERTY_REGEX } from 'vs/platform/configuration/common/configurationRegistry';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { withUndefinedAsNull, withNullAsUndefined } from 'vs/base/common/types';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { Range } from 'vs/editor/common/core/range';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Selection } from 'vs/editor/common/core/selection';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export var ConfigurationEditingErrorCode;
(function (ConfigurationEditingErrorCode) {
    /**
     * Error when trying to write a configuration key that is not registered.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_UNKNOWN_KEY"] = 0] = "ERROR_UNKNOWN_KEY";
    /**
     * Error when trying to write an application setting into workspace settings.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION"] = 1] = "ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION";
    /**
     * Error when trying to write a machne setting into workspace settings.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE"] = 2] = "ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE";
    /**
     * Error when trying to write an invalid folder configuration key to folder settings.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_FOLDER_CONFIGURATION"] = 3] = "ERROR_INVALID_FOLDER_CONFIGURATION";
    /**
     * Error when trying to write to user target but not supported for provided key.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_USER_TARGET"] = 4] = "ERROR_INVALID_USER_TARGET";
    /**
     * Error when trying to write to user target but not supported for provided key.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_WORKSPACE_TARGET"] = 5] = "ERROR_INVALID_WORKSPACE_TARGET";
    /**
     * Error when trying to write a configuration key to folder target
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_FOLDER_TARGET"] = 6] = "ERROR_INVALID_FOLDER_TARGET";
    /**
     * Error when trying to write to language specific setting but not supported for preovided key
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION"] = 7] = "ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION";
    /**
     * Error when trying to write to the workspace configuration without having a workspace opened.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_NO_WORKSPACE_OPENED"] = 8] = "ERROR_NO_WORKSPACE_OPENED";
    /**
     * Error when trying to write and save to the configuration file while it is dirty in the editor.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_CONFIGURATION_FILE_DIRTY"] = 9] = "ERROR_CONFIGURATION_FILE_DIRTY";
    /**
     * Error when trying to write and save to the configuration file while it is not the latest in the disk.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_CONFIGURATION_FILE_MODIFIED_SINCE"] = 10] = "ERROR_CONFIGURATION_FILE_MODIFIED_SINCE";
    /**
     * Error when trying to write to a configuration file that contains JSON errors.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INVALID_CONFIGURATION"] = 11] = "ERROR_INVALID_CONFIGURATION";
    /**
     * Error when trying to write a policy configuration
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_POLICY_CONFIGURATION"] = 12] = "ERROR_POLICY_CONFIGURATION";
    /**
     * Internal Error.
     */
    ConfigurationEditingErrorCode[ConfigurationEditingErrorCode["ERROR_INTERNAL"] = 13] = "ERROR_INTERNAL";
})(ConfigurationEditingErrorCode || (ConfigurationEditingErrorCode = {}));
export class ConfigurationEditingError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
export var EditableConfigurationTarget;
(function (EditableConfigurationTarget) {
    EditableConfigurationTarget[EditableConfigurationTarget["USER_LOCAL"] = 1] = "USER_LOCAL";
    EditableConfigurationTarget[EditableConfigurationTarget["USER_REMOTE"] = 2] = "USER_REMOTE";
    EditableConfigurationTarget[EditableConfigurationTarget["WORKSPACE"] = 3] = "WORKSPACE";
    EditableConfigurationTarget[EditableConfigurationTarget["WORKSPACE_FOLDER"] = 4] = "WORKSPACE_FOLDER";
})(EditableConfigurationTarget || (EditableConfigurationTarget = {}));
let ConfigurationEditing = class ConfigurationEditing {
    remoteSettingsResource;
    configurationService;
    contextService;
    userDataProfileService;
    userDataProfilesService;
    fileService;
    textModelResolverService;
    textFileService;
    notificationService;
    preferencesService;
    editorService;
    uriIdentityService;
    _serviceBrand;
    queue;
    constructor(remoteSettingsResource, configurationService, contextService, userDataProfileService, userDataProfilesService, fileService, textModelResolverService, textFileService, notificationService, preferencesService, editorService, uriIdentityService) {
        this.remoteSettingsResource = remoteSettingsResource;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.fileService = fileService;
        this.textModelResolverService = textModelResolverService;
        this.textFileService = textFileService;
        this.notificationService = notificationService;
        this.preferencesService = preferencesService;
        this.editorService = editorService;
        this.uriIdentityService = uriIdentityService;
        this.queue = new Queue();
    }
    async writeConfiguration(target, value, options = {}) {
        const operation = this.getConfigurationEditOperation(target, value, options.scopes || {});
        // queue up writes to prevent race conditions
        return this.queue.queue(async () => {
            try {
                await this.doWriteConfiguration(operation, options);
            }
            catch (error) {
                if (options.donotNotifyError) {
                    throw error;
                }
                await this.onError(error, operation, options.scopes);
            }
        });
    }
    async doWriteConfiguration(operation, options) {
        await this.validate(operation.target, operation, !options.handleDirtyFile, options.scopes || {});
        const resource = operation.resource;
        const reference = await this.resolveModelReference(resource);
        try {
            const formattingOptions = this.getFormattingOptions(reference.object.textEditorModel);
            await this.updateConfiguration(operation, reference.object.textEditorModel, formattingOptions, options);
        }
        finally {
            reference.dispose();
        }
    }
    async updateConfiguration(operation, model, formattingOptions, options) {
        if (this.hasParseErrors(model.getValue(), operation)) {
            throw this.toConfigurationEditingError(11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */, operation.target, operation);
        }
        if (this.textFileService.isDirty(model.uri) && options.handleDirtyFile) {
            switch (options.handleDirtyFile) {
                case 'save':
                    await this.save(model, operation);
                    break;
                case 'revert':
                    await this.textFileService.revert(model.uri);
                    break;
            }
        }
        const edit = this.getEdits(operation, model.getValue(), formattingOptions)[0];
        if (edit && this.applyEditsToBuffer(edit, model)) {
            await this.save(model, operation);
        }
    }
    async save(model, operation) {
        try {
            await this.textFileService.save(model.uri, { ignoreErrorHandler: true });
        }
        catch (error) {
            if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                throw this.toConfigurationEditingError(10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */, operation.target, operation);
            }
            throw this.toConfigurationEditingError(13 /* ConfigurationEditingErrorCode.ERROR_INTERNAL */, operation.target, operation);
        }
    }
    applyEditsToBuffer(edit, model) {
        const startPosition = model.getPositionAt(edit.offset);
        const endPosition = model.getPositionAt(edit.offset + edit.length);
        const range = new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
        const currentText = model.getValueInRange(range);
        if (edit.content !== currentText) {
            const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
            model.pushEditOperations([new Selection(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column)], [editOperation], () => []);
            return true;
        }
        return false;
    }
    getEdits({ value, jsonPath }, modelContent, formattingOptions) {
        if (jsonPath.length) {
            return setProperty(modelContent, jsonPath, value, formattingOptions);
        }
        // Without jsonPath, the entire configuration file is being replaced, so we just use JSON.stringify
        const content = JSON.stringify(value, null, formattingOptions.insertSpaces && formattingOptions.tabSize ? ' '.repeat(formattingOptions.tabSize) : '\t');
        return [{
                content,
                length: modelContent.length,
                offset: 0
            }];
    }
    getFormattingOptions(model) {
        const { insertSpaces, tabSize } = model.getOptions();
        const eol = model.getEOL();
        return { insertSpaces, tabSize, eol };
    }
    async onError(error, operation, scopes) {
        switch (error.code) {
            case 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */:
                this.onInvalidConfigurationError(error, operation);
                break;
            case 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */:
                this.onConfigurationFileDirtyError(error, operation, scopes);
                break;
            case 10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
                return this.doWriteConfiguration(operation, { scopes, handleDirtyFile: 'revert' });
            default:
                this.notificationService.error(error.message);
        }
    }
    onInvalidConfigurationError(error, operation) {
        const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY ? nls.localize('openTasksConfiguration', "Open Tasks Configuration")
            : operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY ? nls.localize('openLaunchConfiguration', "Open Launch Configuration")
                : null;
        if (openStandAloneConfigurationActionLabel) {
            this.notificationService.prompt(Severity.Error, error.message, [{
                    label: openStandAloneConfigurationActionLabel,
                    run: () => this.openFile(operation.resource)
                }]);
        }
        else {
            this.notificationService.prompt(Severity.Error, error.message, [{
                    label: nls.localize('open', "Open Settings"),
                    run: () => this.openSettings(operation)
                }]);
        }
    }
    onConfigurationFileDirtyError(error, operation, scopes) {
        const openStandAloneConfigurationActionLabel = operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY ? nls.localize('openTasksConfiguration', "Open Tasks Configuration")
            : operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY ? nls.localize('openLaunchConfiguration', "Open Launch Configuration")
                : null;
        if (openStandAloneConfigurationActionLabel) {
            this.notificationService.prompt(Severity.Error, error.message, [{
                    label: nls.localize('saveAndRetry', "Save and Retry"),
                    run: () => {
                        const key = operation.key ? `${operation.workspaceStandAloneConfigurationKey}.${operation.key}` : operation.workspaceStandAloneConfigurationKey;
                        this.writeConfiguration(operation.target, { key, value: operation.value }, { handleDirtyFile: 'save', scopes });
                    }
                },
                {
                    label: openStandAloneConfigurationActionLabel,
                    run: () => this.openFile(operation.resource)
                }]);
        }
        else {
            this.notificationService.prompt(Severity.Error, error.message, [{
                    label: nls.localize('saveAndRetry', "Save and Retry"),
                    run: () => this.writeConfiguration(operation.target, { key: operation.key, value: operation.value }, { handleDirtyFile: 'save', scopes })
                },
                {
                    label: nls.localize('open', "Open Settings"),
                    run: () => this.openSettings(operation)
                }]);
        }
    }
    openSettings(operation) {
        const options = { jsonEditor: true };
        switch (operation.target) {
            case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                this.preferencesService.openUserSettings(options);
                break;
            case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                this.preferencesService.openRemoteSettings(options);
                break;
            case 3 /* EditableConfigurationTarget.WORKSPACE */:
                this.preferencesService.openWorkspaceSettings(options);
                break;
            case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                if (operation.resource) {
                    const workspaceFolder = this.contextService.getWorkspaceFolder(operation.resource);
                    if (workspaceFolder) {
                        this.preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true });
                    }
                }
                break;
        }
    }
    openFile(resource) {
        this.editorService.openEditor({ resource, options: { pinned: true } });
    }
    toConfigurationEditingError(code, target, operation) {
        const message = this.toErrorMessage(code, target, operation);
        return new ConfigurationEditingError(message, code);
    }
    toErrorMessage(error, target, operation) {
        switch (error) {
            // API constraints
            case 12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */: return nls.localize('errorPolicyConfiguration', "Unable to write {0} because it is configured in system policy.", operation.key);
            case 0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */: return nls.localize('errorUnknownKey', "Unable to write to {0} because {1} is not a registered configuration.", this.stringifyTarget(target), operation.key);
            case 1 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */: return nls.localize('errorInvalidWorkspaceConfigurationApplication', "Unable to write {0} to Workspace Settings. This setting can be written only into User settings.", operation.key);
            case 2 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */: return nls.localize('errorInvalidWorkspaceConfigurationMachine', "Unable to write {0} to Workspace Settings. This setting can be written only into User settings.", operation.key);
            case 3 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION */: return nls.localize('errorInvalidFolderConfiguration', "Unable to write to Folder Settings because {0} does not support the folder resource scope.", operation.key);
            case 4 /* ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET */: return nls.localize('errorInvalidUserTarget', "Unable to write to User Settings because {0} does not support for global scope.", operation.key);
            case 5 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_TARGET */: return nls.localize('errorInvalidWorkspaceTarget', "Unable to write to Workspace Settings because {0} does not support for workspace scope in a multi folder workspace.", operation.key);
            case 6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */: return nls.localize('errorInvalidFolderTarget', "Unable to write to Folder Settings because no resource is provided.");
            case 7 /* ConfigurationEditingErrorCode.ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */: return nls.localize('errorInvalidResourceLanguageConfiguration', "Unable to write to Language Settings because {0} is not a resource language setting.", operation.key);
            case 8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */: return nls.localize('errorNoWorkspaceOpened', "Unable to write to {0} because no workspace is opened. Please open a workspace first and try again.", this.stringifyTarget(target));
            // User issues
            case 11 /* ConfigurationEditingErrorCode.ERROR_INVALID_CONFIGURATION */: {
                if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
                    return nls.localize('errorInvalidTaskConfiguration', "Unable to write into the tasks configuration file. Please open it to correct errors/warnings in it and try again.");
                }
                if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
                    return nls.localize('errorInvalidLaunchConfiguration', "Unable to write into the launch configuration file. Please open it to correct errors/warnings in it and try again.");
                }
                switch (target) {
                    case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                        return nls.localize('errorInvalidConfiguration', "Unable to write into user settings. Please open the user settings to correct errors/warnings in it and try again.");
                    case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                        return nls.localize('errorInvalidRemoteConfiguration', "Unable to write into remote user settings. Please open the remote user settings to correct errors/warnings in it and try again.");
                    case 3 /* EditableConfigurationTarget.WORKSPACE */:
                        return nls.localize('errorInvalidConfigurationWorkspace', "Unable to write into workspace settings. Please open the workspace settings to correct errors/warnings in the file and try again.");
                    case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                        let workspaceFolderName = '<<unknown>>';
                        if (operation.resource) {
                            const folder = this.contextService.getWorkspaceFolder(operation.resource);
                            if (folder) {
                                workspaceFolderName = folder.name;
                            }
                        }
                        return nls.localize('errorInvalidConfigurationFolder', "Unable to write into folder settings. Please open the '{0}' folder settings to correct errors/warnings in it and try again.", workspaceFolderName);
                    }
                    default:
                        return '';
                }
            }
            case 9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */: {
                if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
                    return nls.localize('errorTasksConfigurationFileDirty', "Unable to write into tasks configuration file because the file has unsaved changes. Please save it first and then try again.");
                }
                if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
                    return nls.localize('errorLaunchConfigurationFileDirty', "Unable to write into launch configuration file because the file has unsaved changes. Please save it first and then try again.");
                }
                switch (target) {
                    case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                        return nls.localize('errorConfigurationFileDirty', "Unable to write into user settings because the file has unsaved changes. Please save the user settings file first and then try again.");
                    case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                        return nls.localize('errorRemoteConfigurationFileDirty', "Unable to write into remote user settings because the file has unsaved changes. Please save the remote user settings file first and then try again.");
                    case 3 /* EditableConfigurationTarget.WORKSPACE */:
                        return nls.localize('errorConfigurationFileDirtyWorkspace', "Unable to write into workspace settings because the file has unsaved changes. Please save the workspace settings file first and then try again.");
                    case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */: {
                        let workspaceFolderName = '<<unknown>>';
                        if (operation.resource) {
                            const folder = this.contextService.getWorkspaceFolder(operation.resource);
                            if (folder) {
                                workspaceFolderName = folder.name;
                            }
                        }
                        return nls.localize('errorConfigurationFileDirtyFolder', "Unable to write into folder settings because the file has unsaved changes. Please save the '{0}' folder settings file first and then try again.", workspaceFolderName);
                    }
                    default:
                        return '';
                }
            }
            case 10 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_MODIFIED_SINCE */:
                if (operation.workspaceStandAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
                    return nls.localize('errorTasksConfigurationFileModifiedSince', "Unable to write into tasks configuration file because the content of the file is newer.");
                }
                if (operation.workspaceStandAloneConfigurationKey === LAUNCH_CONFIGURATION_KEY) {
                    return nls.localize('errorLaunchConfigurationFileModifiedSince', "Unable to write into launch configuration file because the content of the file is newer.");
                }
                switch (target) {
                    case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                        return nls.localize('errorConfigurationFileModifiedSince', "Unable to write into user settings because the content of the file is newer.");
                    case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                        return nls.localize('errorRemoteConfigurationFileModifiedSince', "Unable to write into remote user settings because the content of the file is newer.");
                    case 3 /* EditableConfigurationTarget.WORKSPACE */:
                        return nls.localize('errorConfigurationFileModifiedSinceWorkspace', "Unable to write into workspace settings because the content of the file is newer.");
                    case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                        return nls.localize('errorConfigurationFileModifiedSinceFolder', "Unable to write into folder settings because the content of the file is newer.");
                }
            case 13 /* ConfigurationEditingErrorCode.ERROR_INTERNAL */: return nls.localize('errorUnknown', "Unable to write to {0} because of an internal error.", this.stringifyTarget(target));
        }
    }
    stringifyTarget(target) {
        switch (target) {
            case 1 /* EditableConfigurationTarget.USER_LOCAL */:
                return nls.localize('userTarget', "User Settings");
            case 2 /* EditableConfigurationTarget.USER_REMOTE */:
                return nls.localize('remoteUserTarget', "Remote User Settings");
            case 3 /* EditableConfigurationTarget.WORKSPACE */:
                return nls.localize('workspaceTarget', "Workspace Settings");
            case 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */:
                return nls.localize('folderTarget', "Folder Settings");
            default:
                return '';
        }
    }
    defaultResourceValue(resource) {
        const basename = this.uriIdentityService.extUri.basename(resource);
        const configurationValue = basename.substr(0, basename.length - this.uriIdentityService.extUri.extname(resource).length);
        switch (configurationValue) {
            case TASKS_CONFIGURATION_KEY: return TASKS_DEFAULT;
            default: return '{}';
        }
    }
    async resolveModelReference(resource) {
        const exists = await this.fileService.exists(resource);
        if (!exists) {
            await this.textFileService.write(resource, this.defaultResourceValue(resource), { encoding: 'utf8' });
        }
        return this.textModelResolverService.createModelReference(resource);
    }
    hasParseErrors(content, operation) {
        // If we write to a workspace standalone file and replace the entire contents (no key provided)
        // we can return here because any parse errors can safely be ignored since all contents are replaced
        if (operation.workspaceStandAloneConfigurationKey && !operation.key) {
            return false;
        }
        const parseErrors = [];
        json.parse(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
        return parseErrors.length > 0;
    }
    async validate(target, operation, checkDirty, overrides) {
        if (this.configurationService.inspect(operation.key).policyValue !== undefined) {
            throw this.toConfigurationEditingError(12 /* ConfigurationEditingErrorCode.ERROR_POLICY_CONFIGURATION */, target, operation);
        }
        const configurationProperties = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
        const configurationScope = configurationProperties[operation.key]?.scope;
        /**
         * Key to update must be a known setting from the registry unless
         * 	- the key is standalone configuration (eg: tasks, debug)
         * 	- the key is an override identifier
         * 	- the operation is to delete the key
         */
        if (!operation.workspaceStandAloneConfigurationKey) {
            const validKeys = this.configurationService.keys().default;
            if (validKeys.indexOf(operation.key) < 0 && !OVERRIDE_PROPERTY_REGEX.test(operation.key) && operation.value !== undefined) {
                throw this.toConfigurationEditingError(0 /* ConfigurationEditingErrorCode.ERROR_UNKNOWN_KEY */, target, operation);
            }
        }
        if (operation.workspaceStandAloneConfigurationKey) {
            // Global launches are not supported
            if ((operation.workspaceStandAloneConfigurationKey !== TASKS_CONFIGURATION_KEY) && (target === 1 /* EditableConfigurationTarget.USER_LOCAL */ || target === 2 /* EditableConfigurationTarget.USER_REMOTE */)) {
                throw this.toConfigurationEditingError(4 /* ConfigurationEditingErrorCode.ERROR_INVALID_USER_TARGET */, target, operation);
            }
        }
        // Target cannot be workspace or folder if no workspace opened
        if ((target === 3 /* EditableConfigurationTarget.WORKSPACE */ || target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) && this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            throw this.toConfigurationEditingError(8 /* ConfigurationEditingErrorCode.ERROR_NO_WORKSPACE_OPENED */, target, operation);
        }
        if (target === 3 /* EditableConfigurationTarget.WORKSPACE */) {
            if (!operation.workspaceStandAloneConfigurationKey && !OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
                if (configurationScope === 1 /* ConfigurationScope.APPLICATION */) {
                    throw this.toConfigurationEditingError(1 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION */, target, operation);
                }
                if (configurationScope === 2 /* ConfigurationScope.MACHINE */) {
                    throw this.toConfigurationEditingError(2 /* ConfigurationEditingErrorCode.ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE */, target, operation);
                }
            }
        }
        if (target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) {
            if (!operation.resource) {
                throw this.toConfigurationEditingError(6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */, target, operation);
            }
            if (!operation.workspaceStandAloneConfigurationKey && !OVERRIDE_PROPERTY_REGEX.test(operation.key)) {
                if (configurationScope !== undefined && !FOLDER_SCOPES.includes(configurationScope)) {
                    throw this.toConfigurationEditingError(3 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_CONFIGURATION */, target, operation);
                }
            }
        }
        if (overrides.overrideIdentifiers?.length) {
            if (configurationScope !== 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */) {
                throw this.toConfigurationEditingError(7 /* ConfigurationEditingErrorCode.ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION */, target, operation);
            }
        }
        if (!operation.resource) {
            throw this.toConfigurationEditingError(6 /* ConfigurationEditingErrorCode.ERROR_INVALID_FOLDER_TARGET */, target, operation);
        }
        if (checkDirty && this.textFileService.isDirty(operation.resource)) {
            throw this.toConfigurationEditingError(9 /* ConfigurationEditingErrorCode.ERROR_CONFIGURATION_FILE_DIRTY */, target, operation);
        }
    }
    getConfigurationEditOperation(target, config, overrides) {
        // Check for standalone workspace configurations
        if (config.key) {
            const standaloneConfigurationMap = target === 1 /* EditableConfigurationTarget.USER_LOCAL */ ? USER_STANDALONE_CONFIGURATIONS : WORKSPACE_STANDALONE_CONFIGURATIONS;
            const standaloneConfigurationKeys = Object.keys(standaloneConfigurationMap);
            for (const key of standaloneConfigurationKeys) {
                const resource = this.getConfigurationFileResource(target, key, standaloneConfigurationMap[key], overrides.resource, undefined);
                // Check for prefix
                if (config.key === key) {
                    const jsonPath = this.isWorkspaceConfigurationResource(resource) ? [key] : [];
                    return { key: jsonPath[jsonPath.length - 1], jsonPath, value: config.value, resource: withNullAsUndefined(resource), workspaceStandAloneConfigurationKey: key, target };
                }
                // Check for prefix.<setting>
                const keyPrefix = `${key}.`;
                if (config.key.indexOf(keyPrefix) === 0) {
                    const jsonPath = this.isWorkspaceConfigurationResource(resource) ? [key, config.key.substr(keyPrefix.length)] : [config.key.substr(keyPrefix.length)];
                    return { key: jsonPath[jsonPath.length - 1], jsonPath, value: config.value, resource: withNullAsUndefined(resource), workspaceStandAloneConfigurationKey: key, target };
                }
            }
        }
        const key = config.key;
        const configurationProperties = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
        const configurationScope = configurationProperties[key]?.scope;
        let jsonPath = overrides.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key];
        if (target === 1 /* EditableConfigurationTarget.USER_LOCAL */ || target === 2 /* EditableConfigurationTarget.USER_REMOTE */) {
            return { key, jsonPath, value: config.value, resource: withNullAsUndefined(this.getConfigurationFileResource(target, undefined, '', null, configurationScope)), target };
        }
        const resource = this.getConfigurationFileResource(target, undefined, FOLDER_SETTINGS_PATH, overrides.resource, configurationScope);
        if (this.isWorkspaceConfigurationResource(resource)) {
            jsonPath = ['settings', ...jsonPath];
        }
        return { key, jsonPath, value: config.value, resource: withNullAsUndefined(resource), target };
    }
    isWorkspaceConfigurationResource(resource) {
        const workspace = this.contextService.getWorkspace();
        return !!(workspace.configuration && resource && workspace.configuration.fsPath === resource.fsPath);
    }
    getConfigurationFileResource(target, standAloneConfigurationKey, relativePath, resource, scope) {
        if (target === 1 /* EditableConfigurationTarget.USER_LOCAL */) {
            if (standAloneConfigurationKey === TASKS_CONFIGURATION_KEY) {
                return this.userDataProfileService.currentProfile.tasksResource;
            }
            else {
                if (scope === 1 /* ConfigurationScope.APPLICATION */ && !this.userDataProfileService.currentProfile.isDefault) {
                    return this.userDataProfilesService.defaultProfile.settingsResource;
                }
                return this.userDataProfileService.currentProfile.settingsResource;
            }
        }
        if (target === 2 /* EditableConfigurationTarget.USER_REMOTE */) {
            return this.remoteSettingsResource;
        }
        const workbenchState = this.contextService.getWorkbenchState();
        if (workbenchState !== 1 /* WorkbenchState.EMPTY */) {
            const workspace = this.contextService.getWorkspace();
            if (target === 3 /* EditableConfigurationTarget.WORKSPACE */) {
                if (workbenchState === 3 /* WorkbenchState.WORKSPACE */) {
                    return withUndefinedAsNull(workspace.configuration);
                }
                if (workbenchState === 2 /* WorkbenchState.FOLDER */) {
                    return workspace.folders[0].toResource(relativePath);
                }
            }
            if (target === 4 /* EditableConfigurationTarget.WORKSPACE_FOLDER */) {
                if (resource) {
                    const folder = this.contextService.getWorkspaceFolder(resource);
                    if (folder) {
                        return folder.toResource(relativePath);
                    }
                }
            }
        }
        return null;
    }
};
ConfigurationEditing = __decorate([
    __param(1, IConfigurationService),
    __param(2, IWorkspaceContextService),
    __param(3, IUserDataProfileService),
    __param(4, IUserDataProfilesService),
    __param(5, IFileService),
    __param(6, ITextModelService),
    __param(7, ITextFileService),
    __param(8, INotificationService),
    __param(9, IPreferencesService),
    __param(10, IEditorService),
    __param(11, IUriIdentityService)
], ConfigurationEditing);
export { ConfigurationEditing };
