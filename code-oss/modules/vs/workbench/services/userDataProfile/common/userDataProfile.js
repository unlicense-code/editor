/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isUndefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { MenuId } from 'vs/platform/actions/common/actions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { Codicon } from 'vs/base/common/codicons';
export const IUserDataProfileService = createDecorator('IUserDataProfileService');
export const IUserDataProfileManagementService = createDecorator('IUserDataProfileManagementService');
export function isUserDataProfileTemplate(thing) {
    const candidate = thing;
    return !!(candidate && typeof candidate === 'object'
        && (isUndefined(candidate.settings) || typeof candidate.settings === 'string')
        && (isUndefined(candidate.globalState) || typeof candidate.globalState === 'string')
        && (isUndefined(candidate.extensions) || typeof candidate.extensions === 'string'));
}
export const IUserDataProfileImportExportService = createDecorator('IUserDataProfileImportExportService');
export const defaultUserDataProfileIcon = registerIcon('defaultProfile-icon', Codicon.settings, localize('defaultProfileIcon', 'Icon for Default Profile.'));
export const ManageProfilesSubMenu = new MenuId('Profiles');
export const MANAGE_PROFILES_ACTION_ID = 'workbench.profiles.actions.manage';
export const PROFILES_TTILE = { value: localize('profiles', "Profiles"), original: 'Profiles' };
export const PROFILES_CATEGORY = { ...PROFILES_TTILE };
export const PROFILE_EXTENSION = 'code-profile';
export const PROFILE_FILTER = [{ name: localize('profile', "Profile"), extensions: [PROFILE_EXTENSION] }];
export const PROFILES_ENABLEMENT_CONTEXT = new RawContextKey('profiles.enabled', true);
export const CURRENT_PROFILE_CONTEXT = new RawContextKey('currentProfile', '');
export const IS_CURRENT_PROFILE_TRANSIENT_CONTEXT = new RawContextKey('isCurrentProfileTransient', false);
export const HAS_PROFILES_CONTEXT = new RawContextKey('hasProfiles', false);
export const IS_PROFILE_IMPORT_EXPORT_IN_PROGRESS_CONTEXT = new RawContextKey('isProfileImportExportInProgress', false);
