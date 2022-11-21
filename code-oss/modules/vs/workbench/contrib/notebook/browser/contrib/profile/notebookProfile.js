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
import { Disposable } from 'vs/base/common/lifecycle';
import { Registry } from 'vs/platform/registry/common/platform';
import { localize } from 'vs/nls';
import { Action2, registerAction2 } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { NotebookSetting } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
export var NotebookProfileType;
(function (NotebookProfileType) {
    NotebookProfileType["default"] = "default";
    NotebookProfileType["jupyter"] = "jupyter";
    NotebookProfileType["colab"] = "colab";
})(NotebookProfileType || (NotebookProfileType = {}));
const profiles = {
    [NotebookProfileType.default]: {
        [NotebookSetting.focusIndicator]: 'gutter',
        [NotebookSetting.insertToolbarLocation]: 'both',
        [NotebookSetting.globalToolbar]: true,
        [NotebookSetting.cellToolbarLocation]: { default: 'right' },
        [NotebookSetting.compactView]: true,
        [NotebookSetting.showCellStatusBar]: 'visible',
        [NotebookSetting.consolidatedRunButton]: true,
        [NotebookSetting.undoRedoPerCell]: false
    },
    [NotebookProfileType.jupyter]: {
        [NotebookSetting.focusIndicator]: 'gutter',
        [NotebookSetting.insertToolbarLocation]: 'notebookToolbar',
        [NotebookSetting.globalToolbar]: true,
        [NotebookSetting.cellToolbarLocation]: { default: 'left' },
        [NotebookSetting.compactView]: true,
        [NotebookSetting.showCellStatusBar]: 'visible',
        [NotebookSetting.consolidatedRunButton]: false,
        [NotebookSetting.undoRedoPerCell]: true
    },
    [NotebookProfileType.colab]: {
        [NotebookSetting.focusIndicator]: 'border',
        [NotebookSetting.insertToolbarLocation]: 'betweenCells',
        [NotebookSetting.globalToolbar]: false,
        [NotebookSetting.cellToolbarLocation]: { default: 'right' },
        [NotebookSetting.compactView]: false,
        [NotebookSetting.showCellStatusBar]: 'hidden',
        [NotebookSetting.consolidatedRunButton]: true,
        [NotebookSetting.undoRedoPerCell]: false
    }
};
async function applyProfile(configService, profile) {
    const promises = [];
    for (const settingKey in profile) {
        promises.push(configService.updateValue(settingKey, profile[settingKey]));
    }
    await Promise.all(promises);
}
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.setProfile',
            title: localize('setProfileTitle', "Set Profile")
        });
    }
    async run(accessor, args) {
        if (!isSetProfileArgs(args)) {
            return;
        }
        const configService = accessor.get(IConfigurationService);
        return applyProfile(configService, profiles[args.profile]);
    }
});
function isSetProfileArgs(args) {
    const setProfileArgs = args;
    return setProfileArgs.profile === NotebookProfileType.colab ||
        setProfileArgs.profile === NotebookProfileType.default ||
        setProfileArgs.profile === NotebookProfileType.jupyter;
}
let NotebookProfileContribution = class NotebookProfileContribution extends Disposable {
    experimentService;
    constructor(configService, experimentService) {
        super();
        this.experimentService = experimentService;
        if (this.experimentService) {
            this.experimentService.getTreatment('notebookprofile').then(treatment => {
                if (treatment === undefined) {
                    return;
                }
                else {
                    // check if settings are already modified
                    const focusIndicator = configService.getValue(NotebookSetting.focusIndicator);
                    const insertToolbarPosition = configService.getValue(NotebookSetting.insertToolbarLocation);
                    const globalToolbar = configService.getValue(NotebookSetting.globalToolbar);
                    // const cellToolbarLocation = configService.getValue(NotebookSetting.cellToolbarLocation);
                    const compactView = configService.getValue(NotebookSetting.compactView);
                    const showCellStatusBar = configService.getValue(NotebookSetting.showCellStatusBar);
                    const consolidatedRunButton = configService.getValue(NotebookSetting.consolidatedRunButton);
                    if (focusIndicator === 'border'
                        && insertToolbarPosition === 'both'
                        && globalToolbar === false
                        // && cellToolbarLocation === undefined
                        && compactView === true
                        && showCellStatusBar === 'visible'
                        && consolidatedRunButton === true) {
                        applyProfile(configService, profiles[treatment] ?? profiles[NotebookProfileType.default]);
                    }
                }
            });
        }
    }
};
NotebookProfileContribution = __decorate([
    __param(0, IConfigurationService),
    __param(1, IWorkbenchAssignmentService)
], NotebookProfileContribution);
export { NotebookProfileContribution };
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(NotebookProfileContribution, 2 /* LifecyclePhase.Ready */);
