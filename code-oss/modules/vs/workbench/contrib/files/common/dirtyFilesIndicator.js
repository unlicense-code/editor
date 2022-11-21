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
import { VIEWLET_ID } from 'vs/workbench/contrib/files/common/files';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
let DirtyFilesIndicator = class DirtyFilesIndicator extends Disposable {
    lifecycleService;
    activityService;
    workingCopyService;
    filesConfigurationService;
    badgeHandle = this._register(new MutableDisposable());
    lastKnownDirtyCount = 0;
    constructor(lifecycleService, activityService, workingCopyService, filesConfigurationService) {
        super();
        this.lifecycleService = lifecycleService;
        this.activityService = activityService;
        this.workingCopyService = workingCopyService;
        this.filesConfigurationService = filesConfigurationService;
        this.updateActivityBadge();
        this.registerListeners();
    }
    registerListeners() {
        // Working copy dirty indicator
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onWorkingCopyDidChangeDirty(workingCopy)));
        // Lifecycle
        this.lifecycleService.onDidShutdown(() => this.dispose());
    }
    onWorkingCopyDidChangeDirty(workingCopy) {
        const gotDirty = workingCopy.isDirty();
        if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
            return; // do not indicate dirty of working copies that are auto saved after short delay
        }
        if (gotDirty || this.lastKnownDirtyCount > 0) {
            this.updateActivityBadge();
        }
    }
    updateActivityBadge() {
        const dirtyCount = this.lastKnownDirtyCount = this.workingCopyService.dirtyCount;
        // Indicate dirty count in badge if any
        if (dirtyCount > 0) {
            this.badgeHandle.value = this.activityService.showViewContainerActivity(VIEWLET_ID, {
                badge: new NumberBadge(dirtyCount, num => num === 1 ? nls.localize('dirtyFile', "1 unsaved file") : nls.localize('dirtyFiles', "{0} unsaved files", dirtyCount)),
                clazz: 'explorer-viewlet-label'
            });
        }
        else {
            this.badgeHandle.clear();
        }
    }
};
DirtyFilesIndicator = __decorate([
    __param(0, ILifecycleService),
    __param(1, IActivityService),
    __param(2, IWorkingCopyService),
    __param(3, IFilesConfigurationService)
], DirtyFilesIndicator);
export { DirtyFilesIndicator };
