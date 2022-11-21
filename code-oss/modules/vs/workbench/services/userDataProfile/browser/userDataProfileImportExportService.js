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
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import * as DOM from 'vs/base/browser/dom';
import { IUserDataProfileImportExportService, PROFILE_FILTER, PROFILE_EXTENSION, IS_PROFILE_IMPORT_EXPORT_IN_PROGRESS_CONTEXT, PROFILES_TTILE, defaultUserDataProfileIcon, IUserDataProfileService, PROFILES_CATEGORY, isUserDataProfileTemplate, IUserDataProfileManagementService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IFileService } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { Extensions, IViewDescriptorService, IViewsService, TreeItemCollapsibleState } from 'vs/workbench/common/views';
import { IUserDataProfilesService, toUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Registry } from 'vs/platform/registry/common/platform';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { ILogService } from 'vs/platform/log/common/log';
import { TreeView, TreeViewPane } from 'vs/workbench/browser/parts/views/treeView';
import { SettingsResource, SettingsResourceTreeItem } from 'vs/workbench/services/userDataProfile/browser/settingsResource';
import { KeybindingsResource, KeybindingsResourceTreeItem } from 'vs/workbench/services/userDataProfile/browser/keybindingsResource';
import { SnippetsResource, SnippetsResourceTreeItem } from 'vs/workbench/services/userDataProfile/browser/snippetsResource';
import { TasksResource, TasksResourceTreeItem } from 'vs/workbench/services/userDataProfile/browser/tasksResource';
import { ExtensionsResource, ExtensionsResourceExportTreeItem, ExtensionsResourceImportTreeItem } from 'vs/workbench/services/userDataProfile/browser/extensionsResource';
import { GlobalStateResource, GlobalStateResourceExportTreeItem, GlobalStateResourceImportTreeItem } from 'vs/workbench/services/userDataProfile/browser/globalStateResource';
import { InMemoryFileSystemProvider } from 'vs/platform/files/common/inMemoryFilesystemProvider';
import { Button } from 'vs/base/browser/ui/button/button';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
import { generateUuid } from 'vs/base/common/uuid';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { onUnexpectedError } from 'vs/base/common/errors';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { VSBuffer } from 'vs/base/common/buffer';
import { joinPath } from 'vs/base/common/resources';
let UserDataProfileImportExportService = class UserDataProfileImportExportService extends Disposable {
    instantiationService;
    userDataProfileService;
    viewsService;
    editorService;
    fileService;
    userDataProfileManagementService;
    userDataProfilesService;
    extensionService;
    quickInputService;
    notificationService;
    progressService;
    dialogService;
    logService;
    _serviceBrand;
    profileContentHandlers = new Map();
    isProfileImportExportInProgressContextKey;
    viewContainer;
    fileUserDataProfileContentHandler;
    constructor(instantiationService, userDataProfileService, viewsService, editorService, contextKeyService, fileService, userDataProfileManagementService, userDataProfilesService, extensionService, quickInputService, notificationService, progressService, dialogService, logService) {
        super();
        this.instantiationService = instantiationService;
        this.userDataProfileService = userDataProfileService;
        this.viewsService = viewsService;
        this.editorService = editorService;
        this.fileService = fileService;
        this.userDataProfileManagementService = userDataProfileManagementService;
        this.userDataProfilesService = userDataProfilesService;
        this.extensionService = extensionService;
        this.quickInputService = quickInputService;
        this.notificationService = notificationService;
        this.progressService = progressService;
        this.dialogService = dialogService;
        this.logService = logService;
        this.registerProfileContentHandler(this.fileUserDataProfileContentHandler = instantiationService.createInstance(FileUserDataProfileContentHandler));
        this.isProfileImportExportInProgressContextKey = IS_PROFILE_IMPORT_EXPORT_IN_PROGRESS_CONTEXT.bindTo(contextKeyService);
        this.viewContainer = Registry.as(Extensions.ViewContainersRegistry).registerViewContainer({
            id: 'userDataProfiles',
            title: PROFILES_TTILE,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, ['userDataProfiles', { mergeViewWithContainerWhenSingleView: true }]),
            icon: defaultUserDataProfileIcon,
            hideIfEmpty: true,
        }, 0 /* ViewContainerLocation.Sidebar */);
    }
    registerProfileContentHandler(profileContentHandler) {
        if (this.profileContentHandlers.has(profileContentHandler.id)) {
            throw new Error(`Profile content handler with id '${profileContentHandler.id}' already registered.`);
        }
        this.profileContentHandlers.set(profileContentHandler.id, profileContentHandler);
    }
    async exportProfile() {
        if (this.isProfileImportExportInProgressContextKey.get()) {
            this.logService.warn('Profile import/export already in progress.');
            return;
        }
        this.isProfileImportExportInProgressContextKey.set(true);
        const disposables = new DisposableStore();
        try {
            disposables.add(toDisposable(() => this.isProfileImportExportInProgressContextKey.set(false)));
            const userDataProfilesData = disposables.add(this.instantiationService.createInstance(UserDataProfileExportData, this.userDataProfileService.currentProfile));
            const exportProfile = await this.showProfilePreviewView(`workbench.views.profiles.export.preview`, localize('export profile preview', "Export"), userDataProfilesData);
            if (exportProfile) {
                const profileContent = await userDataProfilesData.getContent();
                const resource = await this.saveProfileContent(profileContent);
                if (resource) {
                    this.notificationService.info(localize('export success', "{0}: Exported successfully.", PROFILES_CATEGORY.value));
                }
            }
        }
        finally {
            disposables.dispose();
        }
    }
    async importProfile(uri) {
        if (this.isProfileImportExportInProgressContextKey.get()) {
            this.logService.warn('Profile import/export already in progress.');
            return;
        }
        this.isProfileImportExportInProgressContextKey.set(true);
        const disposables = new DisposableStore();
        disposables.add(toDisposable(() => this.isProfileImportExportInProgressContextKey.set(false)));
        try {
            const profileContent = await this.resolveProfileContent(uri);
            if (profileContent === null) {
                return;
            }
            const profileTemplate = JSON.parse(profileContent);
            if (!isUserDataProfileTemplate(profileTemplate)) {
                this.notificationService.error('Invalid profile content.');
                return;
            }
            const userDataProfilesData = disposables.add(this.instantiationService.createInstance(UserDataProfileImportData, profileTemplate));
            const importProfile = await this.showProfilePreviewView(`workbench.views.profiles.import.preview`, localize('import profile preview', "Import"), userDataProfilesData);
            if (!importProfile) {
                return;
            }
            const profile = await this.getProfileToImport(profileTemplate);
            if (!profile) {
                return;
            }
            await this.progressService.withProgress({
                location: 15 /* ProgressLocation.Notification */,
                title: localize('profiles.importing', "{0}: Importing...", PROFILES_CATEGORY.value),
            }, async (progress) => {
                if (profileTemplate.settings) {
                    await this.instantiationService.createInstance(SettingsResource).apply(profileTemplate.settings, profile);
                }
                if (profileTemplate.keybindings) {
                    await this.instantiationService.createInstance(KeybindingsResource).apply(profileTemplate.keybindings, profile);
                }
                if (profileTemplate.tasks) {
                    await this.instantiationService.createInstance(TasksResource).apply(profileTemplate.tasks, profile);
                }
                if (profileTemplate.snippets) {
                    await this.instantiationService.createInstance(SnippetsResource).apply(profileTemplate.snippets, profile);
                }
                if (profileTemplate.globalState) {
                    await this.instantiationService.createInstance(GlobalStateResource).apply(profileTemplate.globalState, profile);
                }
                if (profileTemplate.extensions) {
                    await this.instantiationService.createInstance(ExtensionsResource).apply(profileTemplate.extensions, profile);
                }
                await this.userDataProfileManagementService.switchProfile(profile);
            });
            this.notificationService.info(localize('imported profile', "{0}: Imported successfully.", PROFILES_CATEGORY.value));
        }
        finally {
            disposables.dispose();
        }
    }
    async saveProfileContent(content) {
        const profileContentHandler = await this.pickProfileContentHandler();
        if (!profileContentHandler) {
            return null;
        }
        const resource = await profileContentHandler.saveProfile(content);
        return resource;
    }
    async resolveProfileContent(resource) {
        if (await this.fileService.canHandleResource(resource)) {
            return this.fileUserDataProfileContentHandler.readProfile(resource);
        }
        await this.extensionService.activateByEvent(`onProfile:import:${resource.authority}`);
        const profileContentHandler = this.profileContentHandlers.get(resource.authority);
        return profileContentHandler?.readProfile(resource) ?? null;
    }
    async pickProfileContentHandler() {
        if (this.profileContentHandlers.size === 1) {
            return this.profileContentHandlers.values().next().value;
        }
        await this.extensionService.activateByEvent('onProfile:export');
        return undefined;
    }
    async getProfileToImport(profileTemplate) {
        const profile = this.userDataProfilesService.profiles.find(p => p.name === profileTemplate.name);
        if (profile) {
            const confirmation = await this.dialogService.confirm({
                type: 'info',
                message: localize('profile already exists', "Profile with name '{0}' already exists. Do you want to overwrite it?", profileTemplate.name),
                primaryButton: localize('overwrite', "Overwrite"),
                secondaryButton: localize('create new', "Create New Profile"),
            });
            if (confirmation.confirmed) {
                return profile;
            }
            const name = await this.quickInputService.input({
                placeHolder: localize('name', "Profile name"),
                title: localize('create new', "Create New Profile"),
                validateInput: async (value) => {
                    if (this.userDataProfilesService.profiles.some(p => p.name === value)) {
                        return localize('profileExists', "Profile with name {0} already exists.", value);
                    }
                    return undefined;
                }
            });
            if (!name) {
                return undefined;
            }
            return this.userDataProfilesService.createNamedProfile(name);
        }
        else {
            return this.userDataProfilesService.createNamedProfile(profileTemplate.name, { shortName: profileTemplate.shortName });
        }
    }
    async showProfilePreviewView(id, name, userDataProfilesData) {
        const disposables = new DisposableStore();
        const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
        const treeView = disposables.add(this.instantiationService.createInstance(TreeView, id, name));
        treeView.showRefreshAction = true;
        let onConfirm, onCancel;
        const exportPreviewConfirmPomise = new Promise((c, e) => { onConfirm = c; onCancel = e; });
        const descriptor = {
            id,
            name,
            ctorDescriptor: new SyncDescriptor(UserDataProfileExportViewPane, [userDataProfilesData, name, onConfirm, onCancel]),
            canToggleVisibility: false,
            canMoveView: false,
            treeView,
            collapsed: false,
        };
        try {
            viewsRegistry.registerViews([descriptor], this.viewContainer);
            await this.viewsService.openView(id, true);
            await exportPreviewConfirmPomise;
            return true;
        }
        catch {
            return false;
        }
        finally {
            viewsRegistry.deregisterViews([descriptor], this.viewContainer);
            disposables.dispose();
            this.closeAllImportExportPreviewEditors().then(null, onUnexpectedError);
        }
    }
    async closeAllImportExportPreviewEditors() {
        const editorsToColse = this.editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(({ editor }) => editor.resource?.scheme === USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME);
        if (editorsToColse.length) {
            await this.editorService.closeEditors(editorsToColse);
        }
    }
    async setProfile(profile) {
        await this.progressService.withProgress({
            location: 15 /* ProgressLocation.Notification */,
            title: localize('profiles.applying', "{0}: Applying...", PROFILES_CATEGORY.value),
        }, async (progress) => {
            if (profile.settings) {
                await this.instantiationService.createInstance(SettingsResource).apply(profile.settings, this.userDataProfileService.currentProfile);
            }
            if (profile.globalState) {
                await this.instantiationService.createInstance(GlobalStateResource).apply(profile.globalState, this.userDataProfileService.currentProfile);
            }
            if (profile.extensions) {
                await this.instantiationService.createInstance(ExtensionsResource).apply(profile.extensions, this.userDataProfileService.currentProfile);
            }
        });
        this.notificationService.info(localize('applied profile', "{0}: Applied successfully.", PROFILES_CATEGORY.value));
    }
};
UserDataProfileImportExportService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IUserDataProfileService),
    __param(2, IViewsService),
    __param(3, IEditorService),
    __param(4, IContextKeyService),
    __param(5, IFileService),
    __param(6, IUserDataProfileManagementService),
    __param(7, IUserDataProfilesService),
    __param(8, IExtensionService),
    __param(9, IQuickInputService),
    __param(10, INotificationService),
    __param(11, IProgressService),
    __param(12, IDialogService),
    __param(13, ILogService)
], UserDataProfileImportExportService);
export { UserDataProfileImportExportService };
let FileUserDataProfileContentHandler = class FileUserDataProfileContentHandler {
    fileDialogService;
    uriIdentityService;
    fileService;
    textFileService;
    id = 'file';
    name = localize('file', "File");
    constructor(fileDialogService, uriIdentityService, fileService, textFileService) {
        this.fileDialogService = fileDialogService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.textFileService = textFileService;
    }
    async saveProfile(content) {
        const profileLocation = await this.fileDialogService.showSaveDialog({
            title: localize('export profile dialog', "Save Profile"),
            filters: PROFILE_FILTER,
            defaultUri: this.uriIdentityService.extUri.joinPath(await this.fileDialogService.defaultFilePath(), `profile.${PROFILE_EXTENSION}`),
        });
        if (!profileLocation) {
            return null;
        }
        await this.textFileService.create([{ resource: profileLocation, value: content, options: { overwrite: true } }]);
        return profileLocation;
    }
    async readProfile(uri) {
        return (await this.fileService.readFile(uri)).value.toString();
    }
    async selectProfile() {
        const profileLocation = await this.fileDialogService.showOpenDialog({
            canSelectFolders: false,
            canSelectFiles: true,
            canSelectMany: false,
            filters: PROFILE_FILTER,
            title: localize('select profile', "Select Profile"),
        });
        return profileLocation ? profileLocation[0] : null;
    }
};
FileUserDataProfileContentHandler = __decorate([
    __param(0, IFileDialogService),
    __param(1, IUriIdentityService),
    __param(2, IFileService),
    __param(3, ITextFileService)
], FileUserDataProfileContentHandler);
let UserDataProfileExportViewPane = class UserDataProfileExportViewPane extends TreeViewPane {
    userDataProfileData;
    confirmLabel;
    onConfirm;
    onCancel;
    buttonsContainer;
    confirmButton;
    cancelButton;
    dimension;
    totalTreeItemsCount = 0;
    constructor(userDataProfileData, confirmLabel, onConfirm, onCancel, options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, notificationService);
        this.userDataProfileData = userDataProfileData;
        this.confirmLabel = confirmLabel;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
    }
    renderTreeView(container) {
        this.treeView.dataProvider = this.userDataProfileData;
        super.renderTreeView(DOM.append(container, DOM.$('')));
        this.createButtons(container);
        this._register(this.treeView.onDidChangeCheckboxState(items => {
            this.treeView.refresh(this.userDataProfileData.onDidChangeCheckboxState(items));
            this.updateConfirmButtonEnablement();
        }));
        this.userDataProfileData.getExpandedItemsCount().then(count => {
            this.totalTreeItemsCount = count;
            if (this.dimension) {
                this.layoutTreeView(this.dimension.height, this.dimension.width);
            }
        });
    }
    createButtons(container) {
        this.buttonsContainer = DOM.append(container, DOM.$('.manual-sync-buttons-container'));
        this.confirmButton = this._register(new Button(this.buttonsContainer, { ...defaultButtonStyles }));
        this.confirmButton.label = this.confirmLabel;
        this._register(this.confirmButton.onDidClick(() => this.onConfirm()));
        this.cancelButton = this._register(new Button(this.buttonsContainer, { secondary: true, ...defaultButtonStyles }));
        this.cancelButton.label = localize('cancel', "Cancel");
        this._register(this.cancelButton.onDidClick(() => this.onCancel()));
    }
    layoutTreeView(height, width) {
        this.dimension = new DOM.Dimension(width, height);
        const buttonContainerHeight = 78;
        this.buttonsContainer.style.height = `${buttonContainerHeight}px`;
        this.buttonsContainer.style.width = `${width}px`;
        super.layoutTreeView(Math.min(height - buttonContainerHeight, 22 * (this.totalTreeItemsCount || 12)), width);
    }
    updateConfirmButtonEnablement() {
        this.confirmButton.enabled = this.userDataProfileData.isEnabled();
    }
};
UserDataProfileExportViewPane = __decorate([
    __param(5, IKeybindingService),
    __param(6, IContextMenuService),
    __param(7, IConfigurationService),
    __param(8, IContextKeyService),
    __param(9, IViewDescriptorService),
    __param(10, IInstantiationService),
    __param(11, IOpenerService),
    __param(12, IThemeService),
    __param(13, ITelemetryService),
    __param(14, INotificationService)
], UserDataProfileExportViewPane);
const USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME = 'userdataprofileexportpreview';
class UserDataProfileTreeViewData extends Disposable {
    async getExpandedItemsCount() {
        const roots = await this.getRoots();
        const children = await Promise.all(roots.map(async (root) => {
            if (root.collapsibleState === TreeItemCollapsibleState.Expanded) {
                const children = await root.getChildren();
                return children ?? [];
            }
            return [];
        }));
        return roots.length + children.flat().length;
    }
    rootsPromise;
    async getChildren(element) {
        if (element) {
            return element.getChildren();
        }
        else {
            this.rootsPromise = undefined;
            return this.getRoots();
        }
    }
    getRoots() {
        if (!this.rootsPromise) {
            this.rootsPromise = this.fetchRoots();
        }
        return this.rootsPromise;
    }
}
let UserDataProfileExportData = class UserDataProfileExportData extends UserDataProfileTreeViewData {
    profile;
    fileService;
    instantiationService;
    settingsResourceTreeItem;
    keybindingsResourceTreeItem;
    tasksResourceTreeItem;
    snippetsResourceTreeItem;
    extensionsResourceTreeItem;
    globalStateResourceTreeItem;
    disposables = this._register(new DisposableStore());
    constructor(profile, fileService, instantiationService) {
        super();
        this.profile = profile;
        this.fileService = fileService;
        this.instantiationService = instantiationService;
    }
    onDidChangeCheckboxState(items) {
        const toRefresh = [];
        for (const item of items) {
            if (item.children) {
                for (const child of item.children) {
                    if (child.checkbox) {
                        child.checkbox.isChecked = !!item.checkbox?.isChecked;
                    }
                }
                toRefresh.push(item);
            }
            else {
                const parent = item.parent;
                if (item.checkbox?.isChecked && parent?.checkbox) {
                    parent.checkbox.isChecked = true;
                    toRefresh.push(parent);
                }
            }
        }
        return items;
    }
    async fetchRoots() {
        this.disposables.clear();
        this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME, this._register(new InMemoryFileSystemProvider())));
        const roots = [];
        const exportPreviewProfle = this.createExportPreviewProfile(this.profile);
        const settingsResource = this.instantiationService.createInstance(SettingsResource);
        const settingsContent = await settingsResource.getContent(this.profile);
        await settingsResource.apply(settingsContent, exportPreviewProfle);
        this.settingsResourceTreeItem = this.instantiationService.createInstance(SettingsResourceTreeItem, exportPreviewProfle);
        if (await this.settingsResourceTreeItem.hasContent()) {
            roots.push(this.settingsResourceTreeItem);
        }
        const keybindingsResource = this.instantiationService.createInstance(KeybindingsResource);
        const keybindingsContent = await keybindingsResource.getContent(this.profile);
        await keybindingsResource.apply(keybindingsContent, exportPreviewProfle);
        this.keybindingsResourceTreeItem = this.instantiationService.createInstance(KeybindingsResourceTreeItem, exportPreviewProfle);
        if (await this.keybindingsResourceTreeItem.hasContent()) {
            roots.push(this.keybindingsResourceTreeItem);
        }
        const tasksResource = this.instantiationService.createInstance(TasksResource);
        const tasksContent = await tasksResource.getContent(this.profile);
        await tasksResource.apply(tasksContent, exportPreviewProfle);
        this.tasksResourceTreeItem = this.instantiationService.createInstance(TasksResourceTreeItem, exportPreviewProfle);
        if (await this.tasksResourceTreeItem.hasContent()) {
            roots.push(this.tasksResourceTreeItem);
        }
        const snippetsResource = this.instantiationService.createInstance(SnippetsResource);
        const snippetsContent = await snippetsResource.getContent(this.profile);
        await snippetsResource.apply(snippetsContent, exportPreviewProfle);
        this.snippetsResourceTreeItem = this.instantiationService.createInstance(SnippetsResourceTreeItem, exportPreviewProfle);
        if (await this.snippetsResourceTreeItem.hasContent()) {
            roots.push(this.snippetsResourceTreeItem);
        }
        this.globalStateResourceTreeItem = this.instantiationService.createInstance(GlobalStateResourceExportTreeItem, exportPreviewProfle);
        if (await this.globalStateResourceTreeItem.hasContent()) {
            roots.push(this.globalStateResourceTreeItem);
        }
        this.extensionsResourceTreeItem = this.instantiationService.createInstance(ExtensionsResourceExportTreeItem, exportPreviewProfle);
        if (await this.extensionsResourceTreeItem.hasContent()) {
            roots.push(this.extensionsResourceTreeItem);
        }
        return roots;
    }
    createExportPreviewProfile(profile) {
        return {
            id: profile.id,
            name: profile.name,
            location: profile.location,
            isDefault: profile.isDefault,
            shortName: profile.shortName,
            globalStorageHome: profile.globalStorageHome,
            settingsResource: profile.settingsResource.with({ scheme: USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME }),
            keybindingsResource: profile.keybindingsResource.with({ scheme: USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME }),
            tasksResource: profile.tasksResource.with({ scheme: USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME }),
            snippetsHome: profile.snippetsHome.with({ scheme: USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME }),
            extensionsResource: profile.extensionsResource,
            useDefaultFlags: profile.useDefaultFlags,
            isTransient: profile.isTransient
        };
    }
    async getContent() {
        const settings = this.settingsResourceTreeItem?.checkbox?.isChecked ? await this.settingsResourceTreeItem.getContent() : undefined;
        const keybindings = this.keybindingsResourceTreeItem?.checkbox?.isChecked ? await this.keybindingsResourceTreeItem.getContent() : undefined;
        const tasks = this.tasksResourceTreeItem?.checkbox?.isChecked ? await this.tasksResourceTreeItem.getContent() : undefined;
        const snippets = this.snippetsResourceTreeItem?.checkbox?.isChecked ? await this.snippetsResourceTreeItem.getContent() : undefined;
        const extensions = this.extensionsResourceTreeItem?.checkbox?.isChecked ? await this.extensionsResourceTreeItem.getContent() : undefined;
        const globalState = this.globalStateResourceTreeItem?.checkbox?.isChecked ? await this.globalStateResourceTreeItem.getContent() : undefined;
        const profile = {
            name: this.profile.name,
            shortName: this.profile.shortName,
            settings,
            keybindings,
            tasks,
            snippets,
            extensions,
            globalState
        };
        return JSON.stringify(profile);
    }
    isEnabled() {
        return !!this.settingsResourceTreeItem?.checkbox?.isChecked
            || !!this.keybindingsResourceTreeItem?.checkbox?.isChecked
            || !!this.tasksResourceTreeItem?.checkbox?.isChecked
            || !!this.snippetsResourceTreeItem?.checkbox?.isChecked
            || !!this.extensionsResourceTreeItem?.checkbox?.isChecked
            || !!this.globalStateResourceTreeItem?.checkbox?.isChecked;
    }
};
UserDataProfileExportData = __decorate([
    __param(1, IFileService),
    __param(2, IInstantiationService)
], UserDataProfileExportData);
let UserDataProfileImportData = class UserDataProfileImportData extends UserDataProfileTreeViewData {
    profile;
    fileService;
    instantiationService;
    settingsResourceTreeItem;
    keybindingsResourceTreeItem;
    tasksResourceTreeItem;
    snippetsResourceTreeItem;
    extensionsResourceTreeItem;
    globalStateResourceTreeItem;
    disposables = this._register(new DisposableStore());
    constructor(profile, fileService, instantiationService) {
        super();
        this.profile = profile;
        this.fileService = fileService;
        this.instantiationService = instantiationService;
    }
    onDidChangeCheckboxState(items) {
        return items;
    }
    async fetchRoots() {
        this.disposables.clear();
        const inMemoryProvider = this._register(new InMemoryFileSystemProvider());
        this.disposables.add(this.fileService.registerProvider(USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME, inMemoryProvider));
        const roots = [];
        const importPreviewProfle = toUserDataProfile(generateUuid(), this.profile.name, URI.file('/root').with({ scheme: USER_DATA_PROFILE_IMPORT_EXPORT_PREVIEW_SCHEME }));
        this.settingsResourceTreeItem = undefined;
        if (this.profile.settings) {
            const settingsResource = this.instantiationService.createInstance(SettingsResource);
            await settingsResource.apply(this.profile.settings, importPreviewProfle);
            this.settingsResourceTreeItem = this.instantiationService.createInstance(SettingsResourceTreeItem, importPreviewProfle);
            this.settingsResourceTreeItem.checkbox = undefined;
            roots.push(this.settingsResourceTreeItem);
        }
        this.keybindingsResourceTreeItem = undefined;
        if (this.profile.keybindings) {
            const keybindingsResource = this.instantiationService.createInstance(KeybindingsResource);
            await keybindingsResource.apply(this.profile.keybindings, importPreviewProfle);
            this.keybindingsResourceTreeItem = this.instantiationService.createInstance(KeybindingsResourceTreeItem, importPreviewProfle);
            this.keybindingsResourceTreeItem.checkbox = undefined;
            roots.push(this.keybindingsResourceTreeItem);
        }
        this.tasksResourceTreeItem = undefined;
        if (this.profile.tasks) {
            const tasksResource = this.instantiationService.createInstance(TasksResource);
            await tasksResource.apply(this.profile.tasks, importPreviewProfle);
            this.tasksResourceTreeItem = this.instantiationService.createInstance(TasksResourceTreeItem, importPreviewProfle);
            this.tasksResourceTreeItem.checkbox = undefined;
            roots.push(this.tasksResourceTreeItem);
        }
        this.snippetsResourceTreeItem = undefined;
        if (this.profile.snippets) {
            const snippetsResource = this.instantiationService.createInstance(SnippetsResource);
            await snippetsResource.apply(this.profile.snippets, importPreviewProfle);
            this.snippetsResourceTreeItem = this.instantiationService.createInstance(SnippetsResourceTreeItem, importPreviewProfle);
            this.snippetsResourceTreeItem.checkbox = undefined;
            roots.push(this.snippetsResourceTreeItem);
        }
        this.globalStateResourceTreeItem = undefined;
        if (this.profile.globalState) {
            const globalStateResource = joinPath(importPreviewProfle.globalStorageHome, 'globalState.json');
            await this.fileService.writeFile(globalStateResource, VSBuffer.fromString(JSON.stringify(JSON.parse(this.profile.globalState), null, '\t')));
            this.globalStateResourceTreeItem = this.instantiationService.createInstance(GlobalStateResourceImportTreeItem, globalStateResource);
            roots.push(this.globalStateResourceTreeItem);
        }
        this.extensionsResourceTreeItem = undefined;
        if (this.profile.extensions) {
            this.extensionsResourceTreeItem = this.instantiationService.createInstance(ExtensionsResourceImportTreeItem, this.profile.extensions);
            roots.push(this.extensionsResourceTreeItem);
        }
        inMemoryProvider.setReadOnly(true);
        return roots;
    }
    isEnabled() {
        return true;
    }
};
UserDataProfileImportData = __decorate([
    __param(1, IFileService),
    __param(2, IInstantiationService)
], UserDataProfileImportData);
registerSingleton(IUserDataProfileImportExportService, UserDataProfileImportExportService, 1 /* InstantiationType.Delayed */);
