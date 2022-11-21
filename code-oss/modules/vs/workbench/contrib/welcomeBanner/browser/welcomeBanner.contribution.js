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
import { IBannerService } from 'vs/workbench/services/banner/browser/bannerService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { URI } from 'vs/base/common/uri';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
let WelcomeBannerContribution = class WelcomeBannerContribution {
    static WELCOME_BANNER_DISMISSED_KEY = 'workbench.banner.welcome.dismissed';
    constructor(bannerService, storageService, environmentService) {
        const welcomeBanner = environmentService.options?.welcomeBanner;
        if (!welcomeBanner) {
            return; // welcome banner is not enabled
        }
        if (storageService.getBoolean(WelcomeBannerContribution.WELCOME_BANNER_DISMISSED_KEY, 0 /* StorageScope.PROFILE */, false)) {
            return; // welcome banner dismissed
        }
        let icon = undefined;
        if (typeof welcomeBanner.icon === 'string') {
            icon = ThemeIcon.fromId(welcomeBanner.icon);
        }
        else if (welcomeBanner.icon) {
            icon = URI.revive(welcomeBanner.icon);
        }
        bannerService.show({
            id: 'welcome.banner',
            message: welcomeBanner.message,
            icon,
            actions: welcomeBanner.actions,
            onClose: () => {
                storageService.store(WelcomeBannerContribution.WELCOME_BANNER_DISMISSED_KEY, true, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        });
    }
};
WelcomeBannerContribution = __decorate([
    __param(0, IBannerService),
    __param(1, IStorageService),
    __param(2, IBrowserWorkbenchEnvironmentService)
], WelcomeBannerContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WelcomeBannerContribution, 3 /* LifecyclePhase.Restored */);
