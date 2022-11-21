/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { distinct } from 'vs/base/common/arrays';
import { isObject, isString } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { allSettings, Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { EXTENSION_IDENTIFIER_PATTERN } from 'vs/platform/extensionManagement/common/extensionManagement';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Extensions as JSONExtensions } from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
export const CONFIGURATION_SYNC_STORE_KEY = 'configurationSync.store';
export function getDisallowedIgnoredSettings() {
    const allSettings = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    return Object.keys(allSettings).filter(setting => !!allSettings[setting].disallowSyncIgnore);
}
export function getDefaultIgnoredSettings() {
    const allSettings = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    const ignoreSyncSettings = Object.keys(allSettings).filter(setting => !!allSettings[setting].ignoreSync);
    const machineSettings = Object.keys(allSettings).filter(setting => allSettings[setting].scope === 2 /* ConfigurationScope.MACHINE */ || allSettings[setting].scope === 6 /* ConfigurationScope.MACHINE_OVERRIDABLE */);
    const disallowedSettings = getDisallowedIgnoredSettings();
    return distinct([CONFIGURATION_SYNC_STORE_KEY, ...ignoreSyncSettings, ...machineSettings, ...disallowedSettings]);
}
export const USER_DATA_SYNC_CONFIGURATION_SCOPE = 'settingsSync';
export const CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM = 'settingsSync.keybindingsPerPlatform';
export function registerConfiguration() {
    const ignoredSettingsSchemaId = 'vscode://schemas/ignoredSettings';
    const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'settingsSync',
        order: 30,
        title: localize('settings sync', "Settings Sync"),
        type: 'object',
        properties: {
            [CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM]: {
                type: 'boolean',
                description: localize('settingsSync.keybindingsPerPlatform', "Synchronize keybindings for each platform."),
                default: true,
                scope: 1 /* ConfigurationScope.APPLICATION */,
                tags: ['sync', 'usesOnlineServices']
            },
            'settingsSync.ignoredExtensions': {
                'type': 'array',
                markdownDescription: localize('settingsSync.ignoredExtensions', "List of extensions to be ignored while synchronizing. The identifier of an extension is always `${publisher}.${name}`. For example: `vscode.csharp`."),
                items: [{
                        type: 'string',
                        pattern: EXTENSION_IDENTIFIER_PATTERN,
                        errorMessage: localize('app.extension.identifier.errorMessage', "Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")
                    }],
                'default': [],
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                uniqueItems: true,
                disallowSyncIgnore: true,
                tags: ['sync', 'usesOnlineServices']
            },
            'settingsSync.ignoredSettings': {
                'type': 'array',
                description: localize('settingsSync.ignoredSettings', "Configure settings to be ignored while synchronizing."),
                'default': [],
                'scope': 1 /* ConfigurationScope.APPLICATION */,
                $ref: ignoredSettingsSchemaId,
                additionalProperties: true,
                uniqueItems: true,
                disallowSyncIgnore: true,
                tags: ['sync', 'usesOnlineServices']
            }
        }
    });
    const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
    const registerIgnoredSettingsSchema = () => {
        const disallowedIgnoredSettings = getDisallowedIgnoredSettings();
        const defaultIgnoredSettings = getDefaultIgnoredSettings().filter(s => s !== CONFIGURATION_SYNC_STORE_KEY);
        const settings = Object.keys(allSettings.properties).filter(setting => defaultIgnoredSettings.indexOf(setting) === -1);
        const ignoredSettings = defaultIgnoredSettings.filter(setting => disallowedIgnoredSettings.indexOf(setting) === -1);
        const ignoredSettingsSchema = {
            items: {
                type: 'string',
                enum: [...settings, ...ignoredSettings.map(setting => `-${setting}`)]
            },
        };
        jsonRegistry.registerSchema(ignoredSettingsSchemaId, ignoredSettingsSchema);
    };
    return configurationRegistry.onDidUpdateConfiguration(() => registerIgnoredSettingsSchema());
}
export function isAuthenticationProvider(thing) {
    return thing
        && isObject(thing)
        && isString(thing.id)
        && Array.isArray(thing.scopes);
}
export var SyncResource;
(function (SyncResource) {
    SyncResource["Settings"] = "settings";
    SyncResource["Keybindings"] = "keybindings";
    SyncResource["Snippets"] = "snippets";
    SyncResource["Tasks"] = "tasks";
    SyncResource["Extensions"] = "extensions";
    SyncResource["GlobalState"] = "globalState";
    SyncResource["Profiles"] = "profiles";
})(SyncResource || (SyncResource = {}));
export const ALL_SYNC_RESOURCES = ["settings" /* SyncResource.Settings */, "keybindings" /* SyncResource.Keybindings */, "snippets" /* SyncResource.Snippets */, "tasks" /* SyncResource.Tasks */, "extensions" /* SyncResource.Extensions */, "globalState" /* SyncResource.GlobalState */, "profiles" /* SyncResource.Profiles */];
export function getPathSegments(collection, ...paths) {
    return collection ? [collection, ...paths] : paths;
}
export function getLastSyncResourceUri(collection, syncResource, environmentService, extUri) {
    return extUri.joinPath(environmentService.userDataSyncHome, ...getPathSegments(collection, syncResource, `lastSync${syncResource}.json`));
}
export const IUserDataSyncStoreManagementService = createDecorator('IUserDataSyncStoreManagementService');
export const IUserDataSyncStoreService = createDecorator('IUserDataSyncStoreService');
export const IUserDataSyncBackupStoreService = createDecorator('IUserDataSyncBackupStoreService');
//#endregion
// #region User Data Sync Headers
export const HEADER_OPERATION_ID = 'x-operation-id';
export const HEADER_EXECUTION_ID = 'X-Execution-Id';
export function createSyncHeaders(executionId) {
    const headers = {};
    headers[HEADER_EXECUTION_ID] = executionId;
    return headers;
}
//#endregion
// #region User Data Sync Error
export var UserDataSyncErrorCode;
(function (UserDataSyncErrorCode) {
    // Client Errors (>= 400 )
    UserDataSyncErrorCode["Unauthorized"] = "Unauthorized";
    UserDataSyncErrorCode["NotFound"] = "NotFound";
    UserDataSyncErrorCode["Conflict"] = "Conflict";
    UserDataSyncErrorCode["Gone"] = "Gone";
    UserDataSyncErrorCode["PreconditionFailed"] = "PreconditionFailed";
    UserDataSyncErrorCode["TooLarge"] = "TooLarge";
    UserDataSyncErrorCode["UpgradeRequired"] = "UpgradeRequired";
    UserDataSyncErrorCode["PreconditionRequired"] = "PreconditionRequired";
    UserDataSyncErrorCode["TooManyRequests"] = "RemoteTooManyRequests";
    UserDataSyncErrorCode["TooManyRequestsAndRetryAfter"] = "TooManyRequestsAndRetryAfter";
    // Local Errors
    UserDataSyncErrorCode["RequestFailed"] = "RequestFailed";
    UserDataSyncErrorCode["RequestCanceled"] = "RequestCanceled";
    UserDataSyncErrorCode["RequestTimeout"] = "RequestTimeout";
    UserDataSyncErrorCode["RequestProtocolNotSupported"] = "RequestProtocolNotSupported";
    UserDataSyncErrorCode["RequestPathNotEscaped"] = "RequestPathNotEscaped";
    UserDataSyncErrorCode["RequestHeadersNotObject"] = "RequestHeadersNotObject";
    UserDataSyncErrorCode["NoCollection"] = "NoCollection";
    UserDataSyncErrorCode["NoRef"] = "NoRef";
    UserDataSyncErrorCode["EmptyResponse"] = "EmptyResponse";
    UserDataSyncErrorCode["TurnedOff"] = "TurnedOff";
    UserDataSyncErrorCode["SessionExpired"] = "SessionExpired";
    UserDataSyncErrorCode["ServiceChanged"] = "ServiceChanged";
    UserDataSyncErrorCode["DefaultServiceChanged"] = "DefaultServiceChanged";
    UserDataSyncErrorCode["LocalTooManyRequests"] = "LocalTooManyRequests";
    UserDataSyncErrorCode["LocalPreconditionFailed"] = "LocalPreconditionFailed";
    UserDataSyncErrorCode["LocalInvalidContent"] = "LocalInvalidContent";
    UserDataSyncErrorCode["LocalError"] = "LocalError";
    UserDataSyncErrorCode["IncompatibleLocalContent"] = "IncompatibleLocalContent";
    UserDataSyncErrorCode["IncompatibleRemoteContent"] = "IncompatibleRemoteContent";
    UserDataSyncErrorCode["Unknown"] = "Unknown";
})(UserDataSyncErrorCode || (UserDataSyncErrorCode = {}));
export class UserDataSyncError extends Error {
    code;
    resource;
    operationId;
    constructor(message, code, resource, operationId) {
        super(message);
        this.code = code;
        this.resource = resource;
        this.operationId = operationId;
        this.name = `${this.code} (UserDataSyncError) syncResource:${this.resource || 'unknown'} operationId:${this.operationId || 'unknown'}`;
    }
}
export class UserDataSyncStoreError extends UserDataSyncError {
    url;
    serverCode;
    constructor(message, url, code, serverCode, operationId) {
        super(message, code, undefined, operationId);
        this.url = url;
        this.serverCode = serverCode;
    }
}
export class UserDataAutoSyncError extends UserDataSyncError {
    constructor(message, code) {
        super(message, code);
    }
}
(function (UserDataSyncError) {
    function toUserDataSyncError(error) {
        if (error instanceof UserDataSyncError) {
            return error;
        }
        const match = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
        if (match && match[1]) {
            const syncResource = match[2] === 'unknown' ? undefined : match[2];
            const operationId = match[3] === 'unknown' ? undefined : match[3];
            return new UserDataSyncError(error.message, match[1], syncResource, operationId);
        }
        return new UserDataSyncError(error.message, "Unknown" /* UserDataSyncErrorCode.Unknown */);
    }
    UserDataSyncError.toUserDataSyncError = toUserDataSyncError;
})(UserDataSyncError || (UserDataSyncError = {}));
export var SyncStatus;
(function (SyncStatus) {
    SyncStatus["Uninitialized"] = "uninitialized";
    SyncStatus["Idle"] = "idle";
    SyncStatus["Syncing"] = "syncing";
    SyncStatus["HasConflicts"] = "hasConflicts";
})(SyncStatus || (SyncStatus = {}));
export var Change;
(function (Change) {
    Change[Change["None"] = 0] = "None";
    Change[Change["Added"] = 1] = "Added";
    Change[Change["Modified"] = 2] = "Modified";
    Change[Change["Deleted"] = 3] = "Deleted";
})(Change || (Change = {}));
export var MergeState;
(function (MergeState) {
    MergeState["Preview"] = "preview";
    MergeState["Conflict"] = "conflict";
    MergeState["Accepted"] = "accepted";
})(MergeState || (MergeState = {}));
//#endregion
// #region keys synced only in web
export const SYNC_SERVICE_URL_TYPE = 'sync.store.url.type';
export function getEnablementKey(resource) { return `sync.enable.${resource}`; }
// #endregion
// #region User Data Sync Services
export const IUserDataSyncEnablementService = createDecorator('IUserDataSyncEnablementService');
export const IUserDataSyncService = createDecorator('IUserDataSyncService');
export const IUserDataSyncResourceProviderService = createDecorator('IUserDataSyncResourceProviderService');
export const IUserDataAutoSyncService = createDecorator('IUserDataAutoSyncService');
export const IUserDataSyncUtilService = createDecorator('IUserDataSyncUtilService');
export const IUserDataSyncLogService = createDecorator('IUserDataSyncLogService');
//#endregion
export const USER_DATA_SYNC_SCHEME = 'vscode-userdata-sync';
export const PREVIEW_DIR_NAME = 'preview';
