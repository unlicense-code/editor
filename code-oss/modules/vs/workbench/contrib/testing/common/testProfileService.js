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
import { Emitter } from 'vs/base/common/event';
import { isDefined } from 'vs/base/common/types';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { StoredValue } from 'vs/workbench/contrib/testing/common/storedValue';
import { testRunProfileBitsetList } from 'vs/workbench/contrib/testing/common/testTypes';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { TestingContextKeys } from 'vs/workbench/contrib/testing/common/testingContextKeys';
export const ITestProfileService = createDecorator('testProfileService');
/**
 * Gets whether the given profile can be used to run the test.
 */
export const canUseProfileWithTest = (profile, test) => profile.controllerId === test.controllerId && (TestId.isRoot(test.item.extId) || !profile.tag || test.item.tags.includes(profile.tag));
const sorter = (a, b) => {
    if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1;
    }
    return a.label.localeCompare(b.label);
};
/**
 * Given a capabilities bitset, returns a map of context keys representing
 * them.
 */
export const capabilityContextKeys = (capabilities) => [
    [TestingContextKeys.hasRunnableTests.key, (capabilities & 2 /* TestRunProfileBitset.Run */) !== 0],
    [TestingContextKeys.hasDebuggableTests.key, (capabilities & 4 /* TestRunProfileBitset.Debug */) !== 0],
    [TestingContextKeys.hasCoverableTests.key, (capabilities & 8 /* TestRunProfileBitset.Coverage */) !== 0],
];
let TestProfileService = class TestProfileService {
    preferredDefaults;
    capabilitiesContexts;
    changeEmitter = new Emitter();
    controllerProfiles = new Map();
    /** @inheritdoc */
    onDidChange = this.changeEmitter.event;
    constructor(contextKeyService, storageService) {
        this.preferredDefaults = new StoredValue({
            key: 'testingPreferredProfiles',
            scope: 1 /* StorageScope.WORKSPACE */,
            target: 0 /* StorageTarget.USER */,
        }, storageService);
        this.capabilitiesContexts = {
            [2 /* TestRunProfileBitset.Run */]: TestingContextKeys.hasRunnableTests.bindTo(contextKeyService),
            [4 /* TestRunProfileBitset.Debug */]: TestingContextKeys.hasDebuggableTests.bindTo(contextKeyService),
            [8 /* TestRunProfileBitset.Coverage */]: TestingContextKeys.hasCoverableTests.bindTo(contextKeyService),
            [16 /* TestRunProfileBitset.HasNonDefaultProfile */]: TestingContextKeys.hasNonDefaultProfile.bindTo(contextKeyService),
            [32 /* TestRunProfileBitset.HasConfigurable */]: TestingContextKeys.hasConfigurableProfile.bindTo(contextKeyService),
        };
        this.refreshContextKeys();
    }
    /** @inheritdoc */
    addProfile(controller, profile) {
        let record = this.controllerProfiles.get(profile.controllerId);
        if (record) {
            record.profiles.push(profile);
            record.profiles.sort(sorter);
        }
        else {
            record = {
                profiles: [profile],
                controller,
            };
            this.controllerProfiles.set(profile.controllerId, record);
        }
        this.refreshContextKeys();
        this.changeEmitter.fire();
    }
    /** @inheritdoc */
    updateProfile(controllerId, profileId, update) {
        const ctrl = this.controllerProfiles.get(controllerId);
        if (!ctrl) {
            return;
        }
        const profile = ctrl.profiles.find(c => c.controllerId === controllerId && c.profileId === profileId);
        if (!profile) {
            return;
        }
        Object.assign(profile, update);
        ctrl.profiles.sort(sorter);
        this.changeEmitter.fire();
    }
    /** @inheritdoc */
    configure(controllerId, profileId) {
        this.controllerProfiles.get(controllerId)?.controller.configureRunProfile(profileId);
    }
    /** @inheritdoc */
    removeProfile(controllerId, profileId) {
        const ctrl = this.controllerProfiles.get(controllerId);
        if (!ctrl) {
            return;
        }
        if (!profileId) {
            this.controllerProfiles.delete(controllerId);
            this.changeEmitter.fire();
            return;
        }
        const index = ctrl.profiles.findIndex(c => c.profileId === profileId);
        if (index === -1) {
            return;
        }
        ctrl.profiles.splice(index, 1);
        this.refreshContextKeys();
        this.changeEmitter.fire();
    }
    /** @inheritdoc */
    capabilitiesForTest(test) {
        const ctrl = this.controllerProfiles.get(test.controllerId);
        if (!ctrl) {
            return 0;
        }
        let capabilities = 0;
        for (const profile of ctrl.profiles) {
            if (!profile.tag || test.item.tags.includes(profile.tag)) {
                capabilities |= capabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
            }
        }
        return capabilities;
    }
    /** @inheritdoc */
    all() {
        return this.controllerProfiles.values();
    }
    /** @inheritdoc */
    getControllerProfiles(profileId) {
        return this.controllerProfiles.get(profileId)?.profiles ?? [];
    }
    /** @inheritdoc */
    getGroupDefaultProfiles(group) {
        const preferred = this.preferredDefaults.get();
        if (!preferred) {
            return this.getBaseDefaults(group);
        }
        const profiles = preferred[group]
            ?.map(p => this.controllerProfiles.get(p.controllerId)?.profiles.find(c => c.profileId === p.profileId && c.group === group))
            .filter(isDefined);
        return profiles?.length ? profiles : this.getBaseDefaults(group);
    }
    /** @inheritdoc */
    setGroupDefaultProfiles(group, profiles) {
        this.preferredDefaults.store({
            ...this.preferredDefaults.get(),
            [group]: profiles.map(c => ({ profileId: c.profileId, controllerId: c.controllerId })),
        });
        this.changeEmitter.fire();
    }
    getBaseDefaults(group) {
        const defaults = [];
        for (const { profiles } of this.controllerProfiles.values()) {
            const profile = profiles.find(c => c.group === group);
            if (profile) {
                defaults.push(profile);
            }
        }
        return defaults;
    }
    refreshContextKeys() {
        let allCapabilities = 0;
        for (const { profiles } of this.controllerProfiles.values()) {
            for (const profile of profiles) {
                allCapabilities |= allCapabilities & profile.group ? 16 /* TestRunProfileBitset.HasNonDefaultProfile */ : profile.group;
            }
        }
        for (const group of testRunProfileBitsetList) {
            this.capabilitiesContexts[group].set((allCapabilities & group) !== 0);
        }
    }
};
TestProfileService = __decorate([
    __param(0, IContextKeyService),
    __param(1, IStorageService)
], TestProfileService);
export { TestProfileService };
