import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IConfigurationService, IConfigurationUpdateOverrides } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
export declare const enum ConfigurationEditingErrorCode {
    /**
     * Error when trying to write a configuration key that is not registered.
     */
    ERROR_UNKNOWN_KEY = 0,
    /**
     * Error when trying to write an application setting into workspace settings.
     */
    ERROR_INVALID_WORKSPACE_CONFIGURATION_APPLICATION = 1,
    /**
     * Error when trying to write a machne setting into workspace settings.
     */
    ERROR_INVALID_WORKSPACE_CONFIGURATION_MACHINE = 2,
    /**
     * Error when trying to write an invalid folder configuration key to folder settings.
     */
    ERROR_INVALID_FOLDER_CONFIGURATION = 3,
    /**
     * Error when trying to write to user target but not supported for provided key.
     */
    ERROR_INVALID_USER_TARGET = 4,
    /**
     * Error when trying to write to user target but not supported for provided key.
     */
    ERROR_INVALID_WORKSPACE_TARGET = 5,
    /**
     * Error when trying to write a configuration key to folder target
     */
    ERROR_INVALID_FOLDER_TARGET = 6,
    /**
     * Error when trying to write to language specific setting but not supported for preovided key
     */
    ERROR_INVALID_RESOURCE_LANGUAGE_CONFIGURATION = 7,
    /**
     * Error when trying to write to the workspace configuration without having a workspace opened.
     */
    ERROR_NO_WORKSPACE_OPENED = 8,
    /**
     * Error when trying to write and save to the configuration file while it is dirty in the editor.
     */
    ERROR_CONFIGURATION_FILE_DIRTY = 9,
    /**
     * Error when trying to write and save to the configuration file while it is not the latest in the disk.
     */
    ERROR_CONFIGURATION_FILE_MODIFIED_SINCE = 10,
    /**
     * Error when trying to write to a configuration file that contains JSON errors.
     */
    ERROR_INVALID_CONFIGURATION = 11,
    /**
     * Error when trying to write a policy configuration
     */
    ERROR_POLICY_CONFIGURATION = 12,
    /**
     * Internal Error.
     */
    ERROR_INTERNAL = 13
}
export declare class ConfigurationEditingError extends Error {
    code: ConfigurationEditingErrorCode;
    constructor(message: string, code: ConfigurationEditingErrorCode);
}
export interface IConfigurationValue {
    key: string;
    value: any;
}
export interface IConfigurationEditingOptions {
    /**
     * If `true`, do not notifies the error to user by showing the message box. Default is `false`.
     */
    donotNotifyError?: boolean;
    /**
     * Scope of configuration to be written into.
     */
    scopes?: IConfigurationUpdateOverrides;
}
export declare const enum EditableConfigurationTarget {
    USER_LOCAL = 1,
    USER_REMOTE = 2,
    WORKSPACE = 3,
    WORKSPACE_FOLDER = 4
}
export declare class ConfigurationEditing {
    private readonly remoteSettingsResource;
    private readonly configurationService;
    private readonly contextService;
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly textModelResolverService;
    private readonly textFileService;
    private readonly notificationService;
    private readonly preferencesService;
    private readonly editorService;
    private readonly uriIdentityService;
    _serviceBrand: undefined;
    private queue;
    constructor(remoteSettingsResource: URI | null, configurationService: IConfigurationService, contextService: IWorkspaceContextService, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, fileService: IFileService, textModelResolverService: ITextModelService, textFileService: ITextFileService, notificationService: INotificationService, preferencesService: IPreferencesService, editorService: IEditorService, uriIdentityService: IUriIdentityService);
    writeConfiguration(target: EditableConfigurationTarget, value: IConfigurationValue, options?: IConfigurationEditingOptions): Promise<void>;
    private doWriteConfiguration;
    private updateConfiguration;
    private save;
    private applyEditsToBuffer;
    private getEdits;
    private getFormattingOptions;
    private onError;
    private onInvalidConfigurationError;
    private onConfigurationFileDirtyError;
    private openSettings;
    private openFile;
    private toConfigurationEditingError;
    private toErrorMessage;
    private stringifyTarget;
    private defaultResourceValue;
    private resolveModelReference;
    private hasParseErrors;
    private validate;
    private getConfigurationEditOperation;
    private isWorkspaceConfigurationResource;
    private getConfigurationFileResource;
}
