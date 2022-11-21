/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { decodeBase64, VSBuffer } from 'vs/base/common/buffer';
import { Codicon } from 'vs/base/common/codicons';
import { localize } from 'vs/nls';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
export const EDIT_SESSION_SYNC_CATEGORY = {
    original: 'Cloud Changes',
    value: localize('cloud changes', 'Cloud Changes')
};
export const IEditSessionsStorageService = createDecorator('IEditSessionsStorageService');
export const IEditSessionsLogService = createDecorator('IEditSessionsLogService');
export var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Addition"] = 1] = "Addition";
    ChangeType[ChangeType["Deletion"] = 2] = "Deletion";
})(ChangeType || (ChangeType = {}));
export var FileType;
(function (FileType) {
    FileType[FileType["File"] = 1] = "File";
})(FileType || (FileType = {}));
export const EditSessionSchemaVersion = 2;
export const EDIT_SESSIONS_SIGNED_IN_KEY = 'editSessionsSignedIn';
export const EDIT_SESSIONS_SIGNED_IN = new RawContextKey(EDIT_SESSIONS_SIGNED_IN_KEY, false);
export const EDIT_SESSIONS_CONTAINER_ID = 'workbench.view.editSessions';
export const EDIT_SESSIONS_DATA_VIEW_ID = 'workbench.views.editSessions.data';
export const EDIT_SESSIONS_TITLE = localize('cloud changes', 'Cloud Changes');
export const EDIT_SESSIONS_VIEW_ICON = registerIcon('edit-sessions-view-icon', Codicon.cloudDownload, localize('editSessionViewIcon', 'View icon of the cloud changes view.'));
export const EDIT_SESSIONS_SHOW_VIEW = new RawContextKey('editSessionsShowView', false);
export const EDIT_SESSIONS_SCHEME = 'vscode-edit-sessions';
export function decodeEditSessionFileContent(version, content) {
    switch (version) {
        case 1:
            return VSBuffer.fromString(content);
        case 2:
            return decodeBase64(content);
        default:
            throw new Error('Upgrade to a newer version to decode this content.');
    }
}
