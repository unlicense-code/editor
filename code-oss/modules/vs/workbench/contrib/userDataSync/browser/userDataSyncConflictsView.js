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
import 'vs/css!./media/userDataSyncViews';
import { TreeItemCollapsibleState, IViewDescriptorService } from 'vs/workbench/common/views';
import { localize } from 'vs/nls';
import { TreeViewPane } from 'vs/workbench/browser/parts/views/treeView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUserDataSyncService, IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { registerAction2, Action2, MenuId } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { URI } from 'vs/base/common/uri';
import { Event } from 'vs/base/common/event';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { getSyncAreaLabel, IUserDataSyncWorkbenchService, SYNC_CONFLICTS_VIEW_ID } from 'vs/workbench/services/userDataSync/common/userDataSync';
import { basename, isEqual } from 'vs/base/common/resources';
import * as DOM from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { Codicon } from 'vs/base/common/codicons';
import { IUserDataProfilesService, reviveProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { FloatingClickWidget } from 'vs/workbench/browser/codeeditor';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { DEFAULT_EDITOR_ASSOCIATION } from 'vs/workbench/common/editor';
let UserDataSyncConflictsViewPane = class UserDataSyncConflictsViewPane extends TreeViewPane {
    editorService;
    userDataSyncService;
    userDataSyncWorkbenchService;
    userDataSyncEnablementService;
    userDataProfilesService;
    constructor(options, editorService, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService, userDataSyncService, userDataSyncWorkbenchService, userDataSyncEnablementService, userDataProfilesService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService);
        this.editorService = editorService;
        this.userDataSyncService = userDataSyncService;
        this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.userDataProfilesService = userDataProfilesService;
        this._register(this.userDataSyncService.onDidChangeConflicts(() => this.treeView.refresh()));
        this.registerActions();
    }
    renderTreeView(container) {
        super.renderTreeView(DOM.append(container, DOM.$('')));
        const that = this;
        this.treeView.message = localize('explanation', "Please go through each entry and merge to resolve conflicts.");
        this.treeView.dataProvider = { getChildren() { return that.getTreeItems(); } };
    }
    async getTreeItems() {
        const roots = [];
        const conflictResources = this.userDataSyncService.conflicts
            .map(conflict => conflict.conflicts.map(resourcePreview => ({ ...resourcePreview, syncResource: conflict.syncResource, profile: conflict.profile })))
            .flat()
            .sort((a, b) => a.profile.id === b.profile.id ? 0 : a.profile.isDefault ? -1 : b.profile.isDefault ? 1 : a.profile.name.localeCompare(b.profile.name));
        const conflictResourcesByProfile = [];
        for (const previewResource of conflictResources) {
            let result = conflictResourcesByProfile[conflictResourcesByProfile.length - 1]?.[0].id === previewResource.profile.id ? conflictResourcesByProfile[conflictResourcesByProfile.length - 1][1] : undefined;
            if (!result) {
                conflictResourcesByProfile.push([previewResource.profile, result = []]);
            }
            result.push(previewResource);
        }
        for (const [profile, resources] of conflictResourcesByProfile) {
            const children = [];
            for (const resource of resources) {
                const handle = JSON.stringify(resource);
                const treeItem = {
                    handle,
                    resourceUri: resource.remoteResource,
                    label: { label: basename(resource.remoteResource), strikethrough: resource.mergeState === "accepted" /* MergeState.Accepted */ && (resource.localChange === 3 /* Change.Deleted */ || resource.remoteChange === 3 /* Change.Deleted */) },
                    description: getSyncAreaLabel(resource.syncResource),
                    collapsibleState: TreeItemCollapsibleState.None,
                    command: { id: `workbench.actions.sync.openConflicts`, title: '', arguments: [{ $treeViewId: '', $treeItemHandle: handle }] },
                    contextValue: `sync-conflict-resource`
                };
                children.push(treeItem);
            }
            roots.push({
                handle: profile.id,
                label: { label: profile.name },
                collapsibleState: TreeItemCollapsibleState.Expanded,
                children
            });
        }
        return conflictResourcesByProfile.length === 1 && conflictResourcesByProfile[0][0].isDefault ? roots[0].children ?? [] : roots;
    }
    parseHandle(handle) {
        const parsed = JSON.parse(handle);
        return {
            syncResource: parsed.syncResource,
            profile: reviveProfile(parsed.profile, this.userDataProfilesService.profilesHome.scheme),
            localResource: URI.revive(parsed.localResource),
            remoteResource: URI.revive(parsed.remoteResource),
            baseResource: URI.revive(parsed.baseResource),
            previewResource: URI.revive(parsed.previewResource),
            acceptedResource: URI.revive(parsed.acceptedResource),
            localChange: parsed.localChange,
            remoteChange: parsed.remoteChange,
            mergeState: parsed.mergeState,
        };
    }
    registerActions() {
        const that = this;
        this._register(registerAction2(class OpenConflictsAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.actions.sync.openConflicts`,
                    title: localize({ key: 'workbench.actions.sync.openConflicts', comment: ['This is an action title to show the conflicts between local and remote version of resources'] }, "Show Conflicts"),
                });
            }
            async run(accessor, handle) {
                const conflict = that.parseHandle(handle.$treeItemHandle);
                return that.open(conflict);
            }
        }));
        this._register(registerAction2(class AcceptRemoteAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.actions.sync.acceptRemote`,
                    title: localize('workbench.actions.sync.acceptRemote', "Accept Remote"),
                    icon: Codicon.cloudDownload,
                    menu: {
                        id: MenuId.ViewItemContext,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', SYNC_CONFLICTS_VIEW_ID), ContextKeyExpr.equals('viewItem', 'sync-conflict-resource')),
                        group: 'inline',
                        order: 1,
                    },
                });
            }
            async run(accessor, handle) {
                const conflict = that.parseHandle(handle.$treeItemHandle);
                await that.userDataSyncWorkbenchService.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.remoteResource, undefined, that.userDataSyncEnablementService.isEnabled());
            }
        }));
        this._register(registerAction2(class AcceptLocalAction extends Action2 {
            constructor() {
                super({
                    id: `workbench.actions.sync.acceptLocal`,
                    title: localize('workbench.actions.sync.acceptLocal', "Accept Local"),
                    icon: Codicon.cloudUpload,
                    menu: {
                        id: MenuId.ViewItemContext,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', SYNC_CONFLICTS_VIEW_ID), ContextKeyExpr.equals('viewItem', 'sync-conflict-resource')),
                        group: 'inline',
                        order: 2,
                    },
                });
            }
            async run(accessor, handle) {
                const conflict = that.parseHandle(handle.$treeItemHandle);
                await that.userDataSyncWorkbenchService.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.localResource, undefined, that.userDataSyncEnablementService.isEnabled());
            }
        }));
    }
    async open(conflictToOpen) {
        if (!this.userDataSyncService.conflicts.some(({ conflicts }) => conflicts.some(({ localResource }) => isEqual(localResource, conflictToOpen.localResource)))) {
            return;
        }
        // Open Merge Editor if Sync is enabled
        if (this.userDataSyncEnablementService.isEnabled()) {
            const remoteResourceName = localize({ key: 'remoteResourceName', comment: ['remote as in file in cloud'] }, "{0} (Remote)", basename(conflictToOpen.remoteResource));
            const localResourceName = localize('localResourceName', "{0} (Local)", basename(conflictToOpen.remoteResource));
            await this.editorService.openEditor({
                input1: { resource: conflictToOpen.remoteResource, label: localize('Theirs', 'Theirs'), description: remoteResourceName },
                input2: { resource: conflictToOpen.localResource, label: localize('Yours', 'Yours'), description: localResourceName },
                base: { resource: conflictToOpen.baseResource },
                result: { resource: conflictToOpen.previewResource }
            });
            return;
        }
        // Open Diff Editor if Sync is disabled
        else {
            const leftResource = conflictToOpen.remoteResource;
            const rightResource = conflictToOpen.localResource;
            const leftResourceName = localize({ key: 'leftResourceName', comment: ['remote as in file in cloud'] }, "{0} (Remote)", basename(leftResource));
            const rightResourceName = localize({ key: 'rightResourceName', comment: ['local as in file in disk'] }, "{0} (Local)", basename(rightResource));
            await this.editorService.openEditor({
                original: { resource: leftResource },
                modified: { resource: rightResource },
                label: localize('sideBySideLabels', "{0} ↔ {1}", leftResourceName, rightResourceName),
                description: localize('sideBySideDescription', "Settings Sync"),
                options: {
                    preserveFocus: true,
                    revealIfVisible: true,
                    pinned: true,
                    override: DEFAULT_EDITOR_ASSOCIATION.id
                },
            });
        }
    }
};
UserDataSyncConflictsViewPane = __decorate([
    __param(1, IEditorService),
    __param(2, IKeybindingService),
    __param(3, IContextMenuService),
    __param(4, IConfigurationService),
    __param(5, IContextKeyService),
    __param(6, IViewDescriptorService),
    __param(7, IInstantiationService),
    __param(8, IOpenerService),
    __param(9, IThemeService),
    __param(10, ITelemetryService),
    __param(11, INotificationService),
    __param(12, IUserDataSyncService),
    __param(13, IUserDataSyncWorkbenchService),
    __param(14, IUserDataSyncEnablementService),
    __param(15, IUserDataProfilesService)
], UserDataSyncConflictsViewPane);
export { UserDataSyncConflictsViewPane };
let AcceptChangesContribution = class AcceptChangesContribution extends Disposable {
    editor;
    instantiationService;
    userDataSyncService;
    configurationService;
    userDataSyncWorkbenchService;
    static get(editor) {
        return editor.getContribution(AcceptChangesContribution.ID);
    }
    static ID = 'editor.contrib.acceptChangesButton2';
    acceptChangesButton;
    constructor(editor, instantiationService, userDataSyncService, configurationService, userDataSyncWorkbenchService) {
        super();
        this.editor = editor;
        this.instantiationService = instantiationService;
        this.userDataSyncService = userDataSyncService;
        this.configurationService = configurationService;
        this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
        this.update();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.editor.onDidChangeModel(() => this.update()));
        this._register(this.userDataSyncService.onDidChangeConflicts(() => this.update()));
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('diffEditor.renderSideBySide'))(() => this.update()));
    }
    update() {
        if (!this.shouldShowButton(this.editor)) {
            this.disposeAcceptChangesWidgetRenderer();
            return;
        }
        this.createAcceptChangesWidgetRenderer();
    }
    shouldShowButton(editor) {
        const model = editor.getModel();
        if (!model) {
            return false; // we need a model
        }
        const userDataSyncResource = this.getUserDataSyncResource(model.uri);
        if (!userDataSyncResource) {
            return false;
        }
        if (!this.configurationService.getValue('diffEditor.renderSideBySide')) {
            return isEqual(userDataSyncResource.localResource, model.uri);
        }
        return true;
    }
    createAcceptChangesWidgetRenderer() {
        if (!this.acceptChangesButton) {
            const resource = this.editor.getModel().uri;
            const userDataSyncResource = this.getUserDataSyncResource(resource);
            const isRemoteResource = isEqual(userDataSyncResource.remoteResource, resource);
            const label = isRemoteResource ? localize('accept remote', "Accept Remote")
                : localize('accept local', "Accept Local");
            this.acceptChangesButton = this.instantiationService.createInstance(FloatingClickWidget, this.editor, label, null);
            this._register(this.acceptChangesButton.onClick(async () => {
                const model = this.editor.getModel();
                if (model) {
                    await this.userDataSyncWorkbenchService.accept({ syncResource: userDataSyncResource.syncResource, profile: userDataSyncResource.profile }, model.uri, model.getValue(), false);
                }
            }));
            this.acceptChangesButton.render();
        }
    }
    getUserDataSyncResource(resource) {
        for (const userDataSyncResource of this.userDataSyncService.conflicts) {
            for (const conflict of userDataSyncResource.conflicts) {
                if (isEqual(conflict.remoteResource, resource) || isEqual(conflict.localResource, resource)) {
                    return { syncResource: userDataSyncResource.syncResource, profile: userDataSyncResource.profile, ...conflict };
                }
            }
        }
        return undefined;
    }
    disposeAcceptChangesWidgetRenderer() {
        dispose(this.acceptChangesButton);
        this.acceptChangesButton = undefined;
    }
    dispose() {
        this.disposeAcceptChangesWidgetRenderer();
        super.dispose();
    }
};
AcceptChangesContribution = __decorate([
    __param(1, IInstantiationService),
    __param(2, IUserDataSyncService),
    __param(3, IConfigurationService),
    __param(4, IUserDataSyncWorkbenchService)
], AcceptChangesContribution);
registerEditorContribution(AcceptChangesContribution.ID, AcceptChangesContribution);
