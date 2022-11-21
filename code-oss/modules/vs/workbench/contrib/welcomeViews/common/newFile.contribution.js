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
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { assertIsDefined } from 'vs/base/common/types';
import { localize } from 'vs/nls';
import { Action2, IMenuService, MenuId, registerAction2, MenuRegistry, MenuItemAction } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
const builtInSource = localize('Built-In', "Built-In");
const category = { value: localize('Create', "Create"), original: 'Create' };
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'welcome.showNewFileEntries',
            title: { value: localize('welcome.newFile', "New File..."), original: 'New File...' },
            category,
            f1: true,
            keybinding: {
                primary: 512 /* KeyMod.Alt */ + 2048 /* KeyMod.CtrlCmd */ + 256 /* KeyMod.WinCtrl */ + 44 /* KeyCode.KeyN */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            },
            menu: {
                id: MenuId.MenubarFileMenu,
                group: '1_new',
                order: 2
            }
        });
    }
    async run(accessor) {
        return assertIsDefined(NewFileTemplatesManager.Instance).run();
    }
});
let NewFileTemplatesManager = class NewFileTemplatesManager extends Disposable {
    quickInputService;
    contextKeyService;
    commandService;
    keybindingService;
    static Instance;
    menu;
    constructor(quickInputService, contextKeyService, commandService, keybindingService, menuService) {
        super();
        this.quickInputService = quickInputService;
        this.contextKeyService = contextKeyService;
        this.commandService = commandService;
        this.keybindingService = keybindingService;
        NewFileTemplatesManager.Instance = this;
        this._register({ dispose() { if (NewFileTemplatesManager.Instance === this) {
                NewFileTemplatesManager.Instance = undefined;
            } } });
        this.menu = menuService.createMenu(MenuId.NewFile, contextKeyService);
    }
    allEntries() {
        const items = [];
        for (const [groupName, group] of this.menu.getActions({ renderShortTitle: true })) {
            for (const action of group) {
                if (action instanceof MenuItemAction) {
                    items.push({ commandID: action.item.id, from: action.item.source ?? builtInSource, title: action.label, group: groupName });
                }
            }
        }
        return items;
    }
    async run() {
        const entries = this.allEntries();
        if (entries.length === 0) {
            throw Error('Unexpected empty new items list');
        }
        else if (entries.length === 1) {
            this.commandService.executeCommand(entries[0].commandID);
            return true;
        }
        else {
            return this.selectNewEntry(entries);
        }
    }
    async selectNewEntry(entries) {
        let resolveResult;
        const resultPromise = new Promise(resolve => {
            resolveResult = resolve;
        });
        const disposables = new DisposableStore();
        const qp = this.quickInputService.createQuickPick();
        qp.title = localize('newFileTitle', "New File...");
        qp.placeholder = localize('newFilePlaceholder', "Select File Type or Enter File Name...");
        qp.sortByLabel = false;
        qp.matchOnDetail = true;
        qp.matchOnDescription = true;
        const sortCategories = (a, b) => {
            const categoryPriority = { 'file': 1, 'notebook': 2 };
            if (categoryPriority[a.group] && categoryPriority[b.group]) {
                if (categoryPriority[a.group] !== categoryPriority[b.group]) {
                    return categoryPriority[b.group] - categoryPriority[a.group];
                }
            }
            else if (categoryPriority[a.group]) {
                return 1;
            }
            else if (categoryPriority[b.group]) {
                return -1;
            }
            if (a.from === builtInSource) {
                return 1;
            }
            if (b.from === builtInSource) {
                return -1;
            }
            return a.from.localeCompare(b.from);
        };
        const displayCategory = {
            'file': localize('file', "File"),
            'notebook': localize('notebook', "Notebook"),
        };
        const refreshQp = (entries) => {
            const items = [];
            let lastSeparator;
            entries
                .sort((a, b) => -sortCategories(a, b))
                .forEach((entry) => {
                const command = entry.commandID;
                const keybinding = this.keybindingService.lookupKeybinding(command || '', this.contextKeyService);
                if (lastSeparator !== entry.group) {
                    items.push({
                        type: 'separator',
                        label: displayCategory[entry.group] ?? entry.group
                    });
                    lastSeparator = entry.group;
                }
                items.push({
                    ...entry,
                    label: entry.title,
                    type: 'item',
                    keybinding,
                    buttons: command ? [
                        {
                            iconClass: 'codicon codicon-gear',
                            tooltip: localize('change keybinding', "Configure Keybinding")
                        }
                    ] : [],
                    detail: '',
                    description: entry.from,
                });
            });
            qp.items = items;
        };
        refreshQp(entries);
        disposables.add(this.menu.onDidChange(() => refreshQp(this.allEntries())));
        disposables.add(qp.onDidChangeValue((val) => {
            if (val === '') {
                refreshQp(entries);
                return;
            }
            const currentTextEntry = {
                commandID: 'workbench.action.files.newFile',
                commandArgs: { languageId: undefined, viewType: undefined, fileName: val },
                title: localize('miNewFileWithName', "Create New File ({0})", val),
                group: 'file',
                from: builtInSource,
            };
            refreshQp([currentTextEntry, ...entries]);
        }));
        disposables.add(qp.onDidAccept(async (e) => {
            const selected = qp.selectedItems[0];
            resolveResult(!!selected);
            qp.hide();
            if (selected) {
                await this.commandService.executeCommand(selected.commandID, selected.commandArgs);
            }
        }));
        disposables.add(qp.onDidHide(() => {
            qp.dispose();
            disposables.dispose();
            resolveResult(false);
        }));
        disposables.add(qp.onDidTriggerItemButton(e => {
            qp.hide();
            this.commandService.executeCommand('workbench.action.openGlobalKeybindings', e.item.commandID);
            resolveResult(false);
        }));
        qp.show();
        return resultPromise;
    }
};
NewFileTemplatesManager = __decorate([
    __param(0, IQuickInputService),
    __param(1, IContextKeyService),
    __param(2, ICommandService),
    __param(3, IKeybindingService),
    __param(4, IMenuService)
], NewFileTemplatesManager);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(NewFileTemplatesManager, 3 /* LifecyclePhase.Restored */);
MenuRegistry.appendMenuItem(MenuId.NewFile, {
    group: 'file',
    command: {
        id: 'workbench.action.files.newUntitledFile',
        title: localize('miNewFile2', "Text File")
    },
    order: 1
});
