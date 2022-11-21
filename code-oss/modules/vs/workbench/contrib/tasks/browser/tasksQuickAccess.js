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
import { localize } from 'vs/nls';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { PickerQuickAccessProvider, TriggerAction } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { matchesFuzzy } from 'vs/base/common/filters';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ITaskService } from 'vs/workbench/contrib/tasks/common/taskService';
import { CustomTask, ContributedTask, ConfiguringTask } from 'vs/workbench/contrib/tasks/common/tasks';
import { TaskQuickPick } from 'vs/workbench/contrib/tasks/browser/taskQuickPick';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { isString } from 'vs/base/common/types';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
let TasksQuickAccessProvider = class TasksQuickAccessProvider extends PickerQuickAccessProvider {
    _taskService;
    _configurationService;
    _quickInputService;
    _notificationService;
    _dialogService;
    _themeService;
    _storageService;
    static PREFIX = 'task ';
    constructor(extensionService, _taskService, _configurationService, _quickInputService, _notificationService, _dialogService, _themeService, _storageService) {
        super(TasksQuickAccessProvider.PREFIX, {
            noResultsPick: {
                label: localize('noTaskResults', "No matching tasks")
            }
        });
        this._taskService = _taskService;
        this._configurationService = _configurationService;
        this._quickInputService = _quickInputService;
        this._notificationService = _notificationService;
        this._dialogService = _dialogService;
        this._themeService = _themeService;
        this._storageService = _storageService;
    }
    async _getPicks(filter, disposables, token) {
        if (token.isCancellationRequested) {
            return [];
        }
        const taskQuickPick = new TaskQuickPick(this._taskService, this._configurationService, this._quickInputService, this._notificationService, this._themeService, this._dialogService, this._storageService);
        const topLevelPicks = await taskQuickPick.getTopLevelEntries();
        const taskPicks = [];
        for (const entry of topLevelPicks.entries) {
            const highlights = matchesFuzzy(filter, entry.label);
            if (!highlights) {
                continue;
            }
            if (entry.type === 'separator') {
                taskPicks.push(entry);
            }
            const task = entry.task;
            const quickAccessEntry = entry;
            quickAccessEntry.highlights = { label: highlights };
            quickAccessEntry.trigger = (index) => {
                if ((index === 1) && (quickAccessEntry.buttons?.length === 2)) {
                    const key = (task && !isString(task)) ? task.getRecentlyUsedKey() : undefined;
                    if (key) {
                        this._taskService.removeRecentlyUsedTask(key);
                    }
                    return TriggerAction.REFRESH_PICKER;
                }
                else {
                    if (ContributedTask.is(task)) {
                        this._taskService.customize(task, undefined, true);
                    }
                    else if (CustomTask.is(task)) {
                        this._taskService.openConfig(task);
                    }
                    return TriggerAction.CLOSE_PICKER;
                }
            };
            quickAccessEntry.accept = async () => {
                if (isString(task)) {
                    // switch to quick pick and show second level
                    const showResult = await taskQuickPick.show(localize('TaskService.pickRunTask', 'Select the task to run'), undefined, task);
                    if (showResult) {
                        this._taskService.run(showResult, { attachProblemMatcher: true });
                    }
                }
                else {
                    this._taskService.run(await this._toTask(task), { attachProblemMatcher: true });
                }
            };
            taskPicks.push(quickAccessEntry);
        }
        return taskPicks;
    }
    async _toTask(task) {
        if (!ConfiguringTask.is(task)) {
            return task;
        }
        return this._taskService.tryResolveTask(task);
    }
};
TasksQuickAccessProvider = __decorate([
    __param(0, IExtensionService),
    __param(1, ITaskService),
    __param(2, IConfigurationService),
    __param(3, IQuickInputService),
    __param(4, INotificationService),
    __param(5, IDialogService),
    __param(6, IThemeService),
    __param(7, IStorageService)
], TasksQuickAccessProvider);
export { TasksQuickAccessProvider };
