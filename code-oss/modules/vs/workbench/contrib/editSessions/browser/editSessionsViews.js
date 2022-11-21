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
import { localize } from 'vs/nls';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Registry } from 'vs/platform/registry/common/platform';
import { TreeView, TreeViewPane } from 'vs/workbench/browser/parts/views/treeView';
import { Extensions, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { EDIT_SESSIONS_DATA_VIEW_ID, EDIT_SESSIONS_SCHEME, EDIT_SESSIONS_SHOW_VIEW, EDIT_SESSIONS_TITLE, IEditSessionsStorageService } from 'vs/workbench/contrib/editSessions/common/editSessions';
import { URI } from 'vs/base/common/uri';
import { fromNow } from 'vs/base/common/date';
import { Codicon } from 'vs/base/common/codicons';
import { API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { registerAction2, Action2, MenuId } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
const EDIT_SESSIONS_COUNT_KEY = 'editSessionsCount';
const EDIT_SESSIONS_COUNT_CONTEXT_KEY = new RawContextKey(EDIT_SESSIONS_COUNT_KEY, 0);
let EditSessionsDataViews = class EditSessionsDataViews extends Disposable {
    instantiationService;
    constructor(container, instantiationService) {
        super();
        this.instantiationService = instantiationService;
        this.registerViews(container);
    }
    registerViews(container) {
        const viewId = EDIT_SESSIONS_DATA_VIEW_ID;
        const name = EDIT_SESSIONS_TITLE;
        const treeView = this.instantiationService.createInstance(TreeView, viewId, name);
        treeView.showCollapseAllAction = true;
        treeView.showRefreshAction = true;
        treeView.dataProvider = this.instantiationService.createInstance(EditSessionDataViewDataProvider);
        const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
        viewsRegistry.registerViews([{
                id: viewId,
                name,
                ctorDescriptor: new SyncDescriptor(TreeViewPane),
                canToggleVisibility: true,
                canMoveView: false,
                treeView,
                collapsed: false,
                when: ContextKeyExpr.and(EDIT_SESSIONS_SHOW_VIEW),
                order: 100,
                hideByDefault: true,
            }], container);
        viewsRegistry.registerViewWelcomeContent(viewId, {
            content: localize('noEditSessions', 'You have no stored edit sessions to display.\n{0}', localize({ key: 'storeEditSessionCommand', comment: ['Please do not translate the word "command", it is part of our internal syntax which must not change'] }, '[{0}](command:workbench.editSessions.actions.store)', localize('storeEditSessionTitle', 'Store Edit Session'))),
            when: ContextKeyExpr.equals(EDIT_SESSIONS_COUNT_KEY, 0),
            order: 1
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.resume',
                    title: localize('workbench.editSessions.actions.resume', "Resume Edit Session"),
                    icon: Codicon.desktopDownload,
                    menu: {
                        id: MenuId.ViewItemContext,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', viewId), ContextKeyExpr.regex('viewItem', /edit-session/i)),
                        group: 'inline'
                    }
                });
            }
            async run(accessor, handle) {
                const editSessionId = URI.parse(handle.$treeItemHandle).path.substring(1);
                const commandService = accessor.get(ICommandService);
                await commandService.executeCommand('workbench.editSessions.actions.resumeLatest', editSessionId);
                await treeView.refresh();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.store',
                    title: localize('workbench.editSessions.actions.store', "Store Edit Session"),
                    icon: Codicon.cloudUpload,
                });
            }
            async run(accessor, handle) {
                const commandService = accessor.get(ICommandService);
                await commandService.executeCommand('workbench.editSessions.actions.storeCurrent');
                await treeView.refresh();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.delete',
                    title: localize('workbench.editSessions.actions.delete', "Delete Edit Session"),
                    icon: Codicon.trash,
                    menu: {
                        id: MenuId.ViewItemContext,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', viewId), ContextKeyExpr.regex('viewItem', /edit-session/i)),
                        group: 'inline'
                    }
                });
            }
            async run(accessor, handle) {
                const editSessionId = URI.parse(handle.$treeItemHandle).path.substring(1);
                const dialogService = accessor.get(IDialogService);
                const editSessionStorageService = accessor.get(IEditSessionsStorageService);
                const result = await dialogService.confirm({
                    message: localize('confirm delete', 'Are you sure you want to permanently delete the edit session with ref {0}? You cannot undo this action.', editSessionId),
                    type: 'warning',
                    title: EDIT_SESSIONS_TITLE
                });
                if (result.confirmed) {
                    await editSessionStorageService.delete(editSessionId);
                    await treeView.refresh();
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.deleteAll',
                    title: localize('workbench.editSessions.actions.deleteAll', "Delete All Working Changes from Cloud"),
                    icon: Codicon.trash,
                    menu: {
                        id: MenuId.ViewTitle,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', viewId), ContextKeyExpr.greater(EDIT_SESSIONS_COUNT_KEY, 0)),
                    }
                });
            }
            async run(accessor) {
                const dialogService = accessor.get(IDialogService);
                const editSessionStorageService = accessor.get(IEditSessionsStorageService);
                const result = await dialogService.confirm({
                    message: localize('confirm delete all', 'Are you sure you want to permanently delete all stored changes from the cloud? You cannot undo this action.'),
                    type: 'warning',
                    title: EDIT_SESSIONS_TITLE
                });
                if (result.confirmed) {
                    await editSessionStorageService.delete(null);
                    await treeView.refresh();
                }
            }
        });
    }
};
EditSessionsDataViews = __decorate([
    __param(1, IInstantiationService)
], EditSessionsDataViews);
export { EditSessionsDataViews };
let EditSessionDataViewDataProvider = class EditSessionDataViewDataProvider {
    editSessionsStorageService;
    contextKeyService;
    editSessionsCount;
    constructor(editSessionsStorageService, contextKeyService) {
        this.editSessionsStorageService = editSessionsStorageService;
        this.contextKeyService = contextKeyService;
        this.editSessionsCount = EDIT_SESSIONS_COUNT_CONTEXT_KEY.bindTo(this.contextKeyService);
    }
    async getChildren(element) {
        if (!element) {
            return this.getAllEditSessions();
        }
        const [ref, folderName, filePath] = URI.parse(element.handle).path.substring(1).split('/');
        if (ref && !folderName) {
            return this.getEditSession(ref);
        }
        else if (ref && folderName && !filePath) {
            return this.getEditSessionFolderContents(ref, folderName);
        }
        return [];
    }
    async getAllEditSessions() {
        const allEditSessions = await this.editSessionsStorageService.list();
        this.editSessionsCount.set(allEditSessions.length);
        const editSessions = [];
        for (const session of allEditSessions) {
            const resource = URI.from({ scheme: EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${session.ref}` });
            const sessionData = await this.editSessionsStorageService.read(session.ref);
            const label = sessionData?.editSession.folders.map((folder) => folder.name).join(', ') ?? session.ref;
            const machineId = sessionData?.editSession.machine;
            const machineName = machineId ? await this.editSessionsStorageService.getMachineById(machineId) : undefined;
            const description = machineName === undefined ? fromNow(session.created, true) : `${fromNow(session.created, true)}\u00a0\u00a0\u2022\u00a0\u00a0${machineName}`;
            editSessions.push({
                handle: resource.toString(),
                collapsibleState: TreeItemCollapsibleState.Collapsed,
                label: { label },
                description: description,
                themeIcon: Codicon.repo,
                contextValue: `edit-session`
            });
        }
        return editSessions;
    }
    async getEditSession(ref) {
        const data = await this.editSessionsStorageService.read(ref);
        if (!data) {
            return [];
        }
        if (data.editSession.folders.length === 1) {
            const folder = data.editSession.folders[0];
            return this.getEditSessionFolderContents(ref, folder.name);
        }
        return data.editSession.folders.map((folder) => {
            const resource = URI.from({ scheme: EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${data.ref}/${folder.name}` });
            return {
                handle: resource.toString(),
                collapsibleState: TreeItemCollapsibleState.Collapsed,
                label: { label: folder.name },
                themeIcon: Codicon.folder
            };
        });
    }
    async getEditSessionFolderContents(ref, folderName) {
        const data = await this.editSessionsStorageService.read(ref);
        if (!data) {
            return [];
        }
        return (data.editSession.folders.find((folder) => folder.name === folderName)?.workingChanges ?? []).map((change) => {
            const resource = URI.from({ scheme: EDIT_SESSIONS_SCHEME, authority: 'remote-session-content', path: `/${data.ref}/${folderName}/${change.relativeFilePath}` });
            return {
                handle: resource.toString(),
                resourceUri: resource,
                collapsibleState: TreeItemCollapsibleState.None,
                label: { label: change.relativeFilePath },
                themeIcon: Codicon.file,
                command: {
                    id: API_OPEN_EDITOR_COMMAND_ID,
                    title: localize('open file', 'Open File'),
                    arguments: [resource, undefined, undefined]
                }
            };
        });
    }
};
EditSessionDataViewDataProvider = __decorate([
    __param(0, IEditSessionsStorageService),
    __param(1, IContextKeyService)
], EditSessionDataViewDataProvider);
