/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { groupBy } from 'vs/base/common/arrays';
import { isDefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { testingUpdateProfiles } from 'vs/workbench/contrib/testing/browser/icons';
import { testConfigurationGroupNames } from 'vs/workbench/contrib/testing/common/constants';
import { canUseProfileWithTest, ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
function buildPicker(accessor, { onlyGroup, showConfigureButtons = true, onlyForTest, onlyConfigurable, placeholder = localize('testConfigurationUi.pick', 'Pick a test profile to use'), }) {
    const profileService = accessor.get(ITestProfileService);
    const items = [];
    const pushItems = (allProfiles, description) => {
        for (const profiles of groupBy(allProfiles, (a, b) => a.group - b.group)) {
            let addedHeader = false;
            if (onlyGroup) {
                if (profiles[0].group !== onlyGroup) {
                    continue;
                }
                addedHeader = true; // showing one group, no need for label
            }
            for (const profile of profiles) {
                if (onlyConfigurable && !profile.hasConfigurationHandler) {
                    continue;
                }
                if (!addedHeader) {
                    items.push({ type: 'separator', label: testConfigurationGroupNames[profiles[0].group] });
                    addedHeader = true;
                }
                items.push(({
                    type: 'item',
                    profile,
                    label: profile.label,
                    description,
                    alwaysShow: true,
                    buttons: profile.hasConfigurationHandler && showConfigureButtons
                        ? [{
                                iconClass: ThemeIcon.asClassName(testingUpdateProfiles),
                                tooltip: localize('updateTestConfiguration', 'Update Test Configuration')
                            }] : []
                }));
            }
        }
    };
    if (onlyForTest !== undefined) {
        pushItems(profileService.getControllerProfiles(onlyForTest.controllerId).filter(p => canUseProfileWithTest(p, onlyForTest)));
    }
    else {
        for (const { profiles, controller } of profileService.all()) {
            pushItems(profiles, controller.label.value);
        }
    }
    const quickpick = accessor.get(IQuickInputService).createQuickPick();
    quickpick.items = items;
    quickpick.placeholder = placeholder;
    return quickpick;
}
const triggerButtonHandler = (service, resolve) => (evt) => {
    const profile = evt.item.profile;
    if (profile) {
        service.configure(profile.controllerId, profile.profileId);
        resolve(undefined);
    }
};
CommandsRegistry.registerCommand({
    id: 'vscode.pickMultipleTestProfiles',
    handler: async (accessor, options) => {
        const profileService = accessor.get(ITestProfileService);
        const quickpick = buildPicker(accessor, options);
        if (!quickpick) {
            return;
        }
        quickpick.canSelectMany = true;
        if (options.selected) {
            quickpick.selectedItems = quickpick.items
                .filter((i) => i.type === 'item')
                .filter(i => options.selected.some(s => s.controllerId === i.profile.controllerId && s.profileId === i.profile.profileId));
        }
        const pick = await new Promise(resolve => {
            quickpick.onDidAccept(() => {
                const selected = quickpick.selectedItems;
                resolve(selected.map(s => s.profile).filter(isDefined));
            });
            quickpick.onDidHide(() => resolve(undefined));
            quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve));
            quickpick.show();
        });
        quickpick.dispose();
        return pick;
    }
});
CommandsRegistry.registerCommand({
    id: 'vscode.pickTestProfile',
    handler: async (accessor, options) => {
        const profileService = accessor.get(ITestProfileService);
        const quickpick = buildPicker(accessor, options);
        if (!quickpick) {
            return;
        }
        const pick = await new Promise(resolve => {
            quickpick.onDidAccept(() => resolve(quickpick.selectedItems[0]?.profile));
            quickpick.onDidHide(() => resolve(undefined));
            quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve));
            quickpick.show();
        });
        quickpick.dispose();
        return pick;
    }
});
