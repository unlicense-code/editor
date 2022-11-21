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
import { KeyChord } from 'vs/base/common/keyCodes';
import { Disposable, DisposableStore, MutableDisposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { isObject } from 'vs/base/common/types';
import 'vs/css!./media/preferences';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { Context as SuggestContext } from 'vs/editor/contrib/suggest/browser/suggest';
import * as nls from 'vs/nls';
import { Action2, MenuId, MenuRegistry, registerAction2 } from 'vs/platform/actions/common/actions';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { InputFocusedContext, IsMacNativeContext } from 'vs/platform/contextkey/common/contextkeys';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { ILabelService } from 'vs/platform/label/common/label';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from 'vs/workbench/browser/actions/workspaceCommands';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { ResourceContextKey, RemoteNameContext, WorkbenchStateContext } from 'vs/workbench/common/contextkeys';
import { ExplorerFolderContext, ExplorerRootContext } from 'vs/workbench/contrib/files/common/files';
import { KeybindingsEditor } from 'vs/workbench/contrib/preferences/browser/keybindingsEditor';
import { ConfigureLanguageBasedSettingsAction } from 'vs/workbench/contrib/preferences/browser/preferencesActions';
import { SettingsEditorContribution } from 'vs/workbench/contrib/preferences/browser/preferencesEditor';
import { preferencesOpenSettingsIcon } from 'vs/workbench/contrib/preferences/browser/preferencesIcons';
import { SettingsEditor2 } from 'vs/workbench/contrib/preferences/browser/settingsEditor2';
import { CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDING_FOCUS, CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_EDITOR_IN_USER_TAB, CONTEXT_SETTINGS_JSON_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, CONTEXT_WHEN_FOCUS, KEYBINDINGS_EDITOR_COMMAND_ADD, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, KEYBINDINGS_EDITOR_COMMAND_COPY, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE, KEYBINDINGS_EDITOR_COMMAND_DEFINE, KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN, KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS, KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, KEYBINDINGS_EDITOR_COMMAND_REMOVE, KEYBINDINGS_EDITOR_COMMAND_RESET, KEYBINDINGS_EDITOR_COMMAND_SEARCH, KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR, KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU } from 'vs/workbench/contrib/preferences/common/preferences';
import { PreferencesContribution } from 'vs/workbench/contrib/preferences/common/preferencesContribution';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { KeybindingsEditorInput } from 'vs/workbench/services/preferences/browser/keybindingsEditorInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { SettingsEditor2Input } from 'vs/workbench/services/preferences/common/preferencesEditorInput';
import { IUserDataProfileService, CURRENT_PROFILE_CONTEXT } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
const SETTINGS_EDITOR_COMMAND_SEARCH = 'settings.action.search';
const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = 'settings.action.focusSettingsFile';
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = 'settings.action.focusSettingsFromSearch';
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = 'settings.action.focusSettingsList';
const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = 'settings.action.focusTOC';
const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = 'settings.action.focusSettingControl';
const SETTINGS_EDITOR_COMMAND_FOCUS_UP = 'settings.action.focusLevelUp';
const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = 'settings.switchToJSON';
const SETTINGS_EDITOR_COMMAND_SWITCH_TO_APPLICATION_JSON = 'settings.switchToApplicationJSON';
const SETTINGS_EDITOR_COMMAND_SWITCH_TO_CURRENT_PROFILE_JSON = 'settings.switchToCurrentProfileJSON';
const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = 'settings.filterByOnline';
const SETTINGS_EDITOR_COMMAND_FILTER_TELEMETRY = 'settings.filterByTelemetry';
const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = 'settings.filterUntrusted';
const SETTINGS_COMMAND_OPEN_SETTINGS = 'workbench.action.openSettings';
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(SettingsEditor2, SettingsEditor2.ID, nls.localize('settingsEditor2', "Settings Editor 2")), [
    new SyncDescriptor(SettingsEditor2Input)
]);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(KeybindingsEditor, KeybindingsEditor.ID, nls.localize('keybindingsEditor', "Keybindings Editor")), [
    new SyncDescriptor(KeybindingsEditorInput)
]);
class KeybindingsEditorInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(KeybindingsEditorInput);
    }
}
class SettingsEditor2InputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(input) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(SettingsEditor2Input);
    }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(SettingsEditor2Input.ID, SettingsEditor2InputSerializer);
const OPEN_USER_SETTINGS_UI_TITLE = { value: nls.localize('openSettings2', "Open Settings (UI)"), original: 'Open Settings (UI)' };
const OPEN_USER_SETTINGS_JSON_TITLE = { value: nls.localize('openUserSettingsJson', "Open User Settings (JSON)"), original: 'Open User Settings (JSON)' };
const OPEN_CURRENT_PROFILE_SETTINGS_JSON_TITLE = { value: nls.localize('openCurrentProfileSettingsJson', "Open Current Profile Settings (JSON)"), original: 'Open Current Profile Settings (JSON)' };
const category = { value: nls.localize('preferences', "Preferences"), original: 'Preferences' };
function sanitizeOpenSettingsArgs(args) {
    if (!isObject(args)) {
        args = {};
    }
    return {
        openToSide: args.openToSide,
        query: args.query
    };
}
let PreferencesActionsContribution = class PreferencesActionsContribution extends Disposable {
    environmentService;
    userDataProfileService;
    preferencesService;
    workspaceContextService;
    labelService;
    extensionService;
    userDataProfilesService;
    constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
        super();
        this.environmentService = environmentService;
        this.userDataProfileService = userDataProfileService;
        this.preferencesService = preferencesService;
        this.workspaceContextService = workspaceContextService;
        this.labelService = labelService;
        this.extensionService = extensionService;
        this.userDataProfilesService = userDataProfilesService;
        this.registerSettingsActions();
        this.registerKeybindingsActions();
        this.updatePreferencesEditorMenuItem();
        this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
        this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
    }
    registerSettingsActions() {
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_COMMAND_OPEN_SETTINGS,
                    title: nls.localize('settings', "Settings"),
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 82 /* KeyCode.Comma */,
                    },
                    menu: {
                        id: MenuId.GlobalActivity,
                        group: '2_configuration',
                        order: 1
                    }
                });
            }
            run(accessor, args) {
                // args takes a string for backcompat
                const opts = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openSettings(opts);
            }
        });
        MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
            group: '1_settings',
            command: {
                id: SETTINGS_COMMAND_OPEN_SETTINGS,
                title: nls.localize({ key: 'miOpenSettings', comment: ['&& denotes a mnemonic'] }, "&&Settings")
            },
            order: 1
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openSettings2',
                    title: { value: nls.localize('openSettings2', "Open Settings (UI)"), original: 'Open Settings (UI)' },
                    category,
                    f1: true,
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openSettings({ jsonEditor: false, ...args });
            }
        });
        const that = this;
        const registerOpenSettingsJsonCommandDisposable = this._register(new MutableDisposable());
        const registerOpenSettingsJsonCommand = () => {
            registerOpenSettingsJsonCommandDisposable.value = registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openSettingsJson',
                        title: that.userDataProfileService.currentProfile.isDefault ? OPEN_USER_SETTINGS_JSON_TITLE : OPEN_CURRENT_PROFILE_SETTINGS_JSON_TITLE,
                        category,
                        f1: true,
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openSettings({ jsonEditor: true, ...args });
                }
            });
        };
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openApplicationSettingsJson',
                    title: OPEN_USER_SETTINGS_JSON_TITLE,
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: ContextKeyExpr.notEquals(CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id)
                    }
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openApplicationSettings({ jsonEditor: true, ...args });
            }
        });
        // Opens the User tab of the Settings editor
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openGlobalSettings',
                    title: { value: nls.localize('openGlobalSettings', "Open User Settings"), original: 'Open User Settings' },
                    category,
                    f1: true,
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openUserSettings(args);
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openRawDefaultSettings',
                    title: { value: nls.localize('openRawDefaultSettings', "Open Default Settings (JSON)"), original: 'Open Default Settings (JSON)' },
                    category,
                    f1: true,
                });
            }
            run(accessor) {
                return accessor.get(IPreferencesService).openRawDefaultSettings();
            }
        });
        const registerOpenUserSettingsEditorFromJsonActionDisposable = this._register(new MutableDisposable());
        const registerOpenUserSettingsEditorFromJsonAction = () => {
            let when = ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.userDataProfileService.currentProfile.settingsResource.toString()), ContextKeyExpr.not('isInDiffEditor'));
            if (!this.userDataProfileService.currentProfile.isDefault) {
                // If the default profile is not active, also show the action when we're in the
                // default profile JSON file, which contains the application-scoped settings.
                when = ContextKeyExpr.or(when, ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.userDataProfilesService.defaultProfile.settingsResource.toString()), ContextKeyExpr.not('isInDiffEditor')));
            }
            registerOpenUserSettingsEditorFromJsonActionDisposable.value = registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: '_workbench.openUserSettingsEditor',
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesOpenSettingsIcon,
                        menu: [{
                                id: MenuId.EditorTitle,
                                when,
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, ...args });
                }
            });
        };
        const openJsonFromSettingsEditorDisposableStore = this._register(new DisposableStore());
        const registerOpenJsonFromSettingsEditorAction = () => {
            openJsonFromSettingsEditorDisposableStore.clear();
            if (!this.userDataProfileService.currentProfile.isDefault) {
                // When the default profile is not active, the action for the User tab needs a dropdown
                // because User tab settings in that case are actually saved in two separate files.
                const submenuId = MenuId.for('PreferencesSubMenu');
                openJsonFromSettingsEditorDisposableStore.add(registerAction2(class extends Action2 {
                    constructor() {
                        super({
                            id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_CURRENT_PROFILE_JSON,
                            title: OPEN_CURRENT_PROFILE_SETTINGS_JSON_TITLE,
                            menu: [{ id: submenuId, order: 1 }]
                        });
                    }
                    run(accessor) {
                        const editorPane = accessor.get(IEditorService).activeEditorPane;
                        if (editorPane instanceof SettingsEditor2) {
                            return editorPane.switchToSettingsFile();
                        }
                        return null;
                    }
                }));
                openJsonFromSettingsEditorDisposableStore.add(registerAction2(class extends Action2 {
                    constructor() {
                        super({
                            id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_APPLICATION_JSON,
                            title: OPEN_USER_SETTINGS_JSON_TITLE,
                            menu: [{ id: submenuId, order: 2 }]
                        });
                    }
                    run(accessor) {
                        const editorPane = accessor.get(IEditorService).activeEditorPane;
                        if (editorPane instanceof SettingsEditor2) {
                            return editorPane.switchToApplicationSettingsFile();
                        }
                        return null;
                    }
                }));
                openJsonFromSettingsEditorDisposableStore.add(MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
                    title: { value: nls.localize('openSettingsJson', "Open Settings (JSON)"), original: 'Open Settings (JSON)' },
                    submenu: submenuId,
                    icon: preferencesOpenSettingsIcon,
                    when: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_EDITOR_IN_USER_TAB, CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                    group: 'navigation',
                    order: 1
                }));
            }
            let openSettingsJsonWhen = ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_JSON_EDITOR.toNegated());
            if (!this.userDataProfileService.currentProfile.isDefault) {
                // If we're not in the default profile, we already created the action for the User tab above,
                // so we want to make sure the user is not in the User tab for this more general action.
                openSettingsJsonWhen = ContextKeyExpr.and(openSettingsJsonWhen, CONTEXT_SETTINGS_EDITOR_IN_USER_TAB.toNegated());
            }
            openJsonFromSettingsEditorDisposableStore.add(registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
                        title: { value: nls.localize('openSettingsJson', "Open Settings (JSON)"), original: 'Open Settings (JSON)' },
                        icon: preferencesOpenSettingsIcon,
                        menu: [{
                                id: MenuId.EditorTitle,
                                when: openSettingsJsonWhen,
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor) {
                    const editorPane = accessor.get(IEditorService).activeEditorPane;
                    if (editorPane instanceof SettingsEditor2) {
                        return editorPane.switchToSettingsFile();
                    }
                    return null;
                }
            }));
        };
        registerOpenUserSettingsEditorFromJsonAction();
        registerOpenJsonFromSettingsEditorAction();
        registerOpenSettingsJsonCommand();
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => {
            registerOpenUserSettingsEditorFromJsonAction();
            registerOpenJsonFromSettingsEditorAction();
            registerOpenSettingsJsonCommand();
        }));
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: ConfigureLanguageBasedSettingsAction.ID,
                    title: ConfigureLanguageBasedSettingsAction.LABEL,
                    category,
                    f1: true,
                });
            }
            run(accessor) {
                return accessor.get(IInstantiationService).createInstance(ConfigureLanguageBasedSettingsAction, ConfigureLanguageBasedSettingsAction.ID, ConfigureLanguageBasedSettingsAction.LABEL.value).run();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openWorkspaceSettings',
                    title: { value: nls.localize('openWorkspaceSettings', "Open Workspace Settings"), original: 'Open Workspace Settings' },
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.notEqualsTo('empty')
                    }
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openWorkspaceSettings(args);
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openAccessibilitySettings',
                    title: { value: nls.localize('openAccessibilitySettings', "Open Accessibility Settings"), original: 'Open Accessibility Settings' },
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.notEqualsTo('empty')
                    }
                });
            }
            async run(accessor) {
                await accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:accessibility' });
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openWorkspaceSettingsFile',
                    title: { value: nls.localize('openWorkspaceSettingsFile', "Open Workspace Settings (JSON)"), original: 'Open Workspace Settings (JSON)' },
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.notEqualsTo('empty')
                    }
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: true, ...args });
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openFolderSettings',
                    title: { value: nls.localize('openFolderSettings', "Open Folder Settings"), original: 'Open Folder Settings' },
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.isEqualTo('workspace')
                    }
                });
            }
            async run(accessor, args) {
                const commandService = accessor.get(ICommandService);
                const preferencesService = accessor.get(IPreferencesService);
                const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
                if (workspaceFolder) {
                    args = sanitizeOpenSettingsArgs(args);
                    await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args });
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openFolderSettingsFile',
                    title: { value: nls.localize('openFolderSettingsFile', "Open Folder Settings (JSON)"), original: 'Open Folder Settings (JSON)' },
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.isEqualTo('workspace')
                    }
                });
            }
            async run(accessor, args) {
                const commandService = accessor.get(ICommandService);
                const preferencesService = accessor.get(IPreferencesService);
                const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
                if (workspaceFolder) {
                    args = sanitizeOpenSettingsArgs(args);
                    await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args });
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: '_workbench.action.openFolderSettings',
                    title: { value: nls.localize('openFolderSettings', "Open Folder Settings"), original: 'Open Folder Settings' },
                    category,
                    menu: {
                        id: MenuId.ExplorerContext,
                        group: '2_workspace',
                        order: 20,
                        when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext)
                    }
                });
            }
            run(accessor, resource) {
                return accessor.get(IPreferencesService).openFolderSettings({ folderUri: resource });
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                    title: nls.localize({ key: 'miOpenOnlineSettings', comment: ['&& denotes a mnemonic'] }, "&&Online Services Settings"),
                    menu: {
                        id: MenuId.MenubarPreferencesMenu,
                        group: '1_settings',
                        order: 2,
                    }
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof SettingsEditor2) {
                    editorPane.focusSearch(`@tag:usesOnlineServices`);
                }
                else {
                    accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:usesOnlineServices' });
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FILTER_TELEMETRY,
                    title: { value: nls.localize('showTelemtrySettings', "Telemetry Settings"), original: 'Telemetry Settings' },
                    menu: {
                        id: MenuId.MenubarPreferencesMenu,
                        group: '1_settings',
                        order: 3,
                    }
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof SettingsEditor2) {
                    editorPane.focusSearch('@tag:telemetry');
                }
                else {
                    accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:telemetry' });
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
                    title: { value: nls.localize('filterUntrusted', "Show untrusted workspace settings"), original: 'Show untrusted workspace settings' },
                });
            }
            run(accessor) {
                accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
            }
        });
        this.registerSettingsEditorActions();
        this.extensionService.whenInstalledExtensionsRegistered()
            .then(() => {
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
            const label = nls.localize('openRemoteSettings', "Open Remote Settings ({0})", hostLabel);
            registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRemoteSettings',
                        title: { value: label, original: `Open Remote Settings (${hostLabel})` },
                        category,
                        menu: {
                            id: MenuId.CommandPalette,
                            when: RemoteNameContext.notEqualsTo('')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openRemoteSettings(args);
                }
            });
            const jsonLabel = nls.localize('openRemoteSettingsJSON', "Open Remote Settings (JSON) ({0})", hostLabel);
            registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRemoteSettingsFile',
                        title: { value: jsonLabel, original: `Open Remote Settings (JSON) (${hostLabel})` },
                        category,
                        menu: {
                            id: MenuId.CommandPalette,
                            when: RemoteNameContext.notEqualsTo('')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openRemoteSettings({ jsonEditor: true, ...args });
                }
            });
        });
    }
    registerSettingsEditorActions() {
        function getPreferencesEditor(accessor) {
            const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
            if (activeEditorPane instanceof SettingsEditor2) {
                return activeEditorPane;
            }
            return null;
        }
        function settingsEditorFocusSearch(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            preferencesEditor?.focusSearch();
        }
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_SEARCH,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: null
                    },
                    category,
                    f1: true,
                    title: { value: nls.localize('settings.focusSearch', "Focus Settings Search"), original: 'Focus Settings Search' }
                });
            }
            run(accessor) { settingsEditorFocusSearch(accessor); }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    keybinding: {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: CONTEXT_SETTINGS_SEARCH_FOCUS
                    },
                    category,
                    f1: true,
                    title: { value: nls.localize('settings.clearResults', "Clear Settings Search Results"), original: 'Clear Settings Search Results' }
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.clearSearchResults();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, SuggestContext.Visible.toNegated()),
                    keybinding: {
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: null
                    },
                    title: nls.localize('settings.focusFile', "Focus settings file")
                });
            }
            run(accessor, args) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSettings();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, SuggestContext.Visible.toNegated()),
                    keybinding: {
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    title: nls.localize('settings.focusFile', "Focus settings file")
                });
            }
            run(accessor, args) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSettings();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_TOC_ROW_FOCUS),
                    keybinding: {
                        primary: 3 /* KeyCode.Enter */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    title: nls.localize('settings.focusSettingsList', "Focus settings list")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (preferencesEditor instanceof SettingsEditor2) {
                    preferencesEditor.focusSettings();
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    f1: true,
                    keybinding: [
                        {
                            primary: 15 /* KeyCode.LeftArrow */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: CONTEXT_SETTINGS_ROW_FOCUS
                        }
                    ],
                    category,
                    title: { value: nls.localize('settings.focusSettingsTOC', "Focus Settings Table of Contents"), original: 'Focus Settings Table of Contents' }
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (!(preferencesEditor instanceof SettingsEditor2)) {
                    return;
                }
                preferencesEditor.focusTOC();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
                    precondition: CONTEXT_SETTINGS_ROW_FOCUS,
                    keybinding: {
                        primary: 3 /* KeyCode.Enter */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    },
                    title: nls.localize('settings.focusSettingControl', "Focus Setting Control")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (!(preferencesEditor instanceof SettingsEditor2)) {
                    return;
                }
                if (document.activeElement?.classList.contains('monaco-list')) {
                    preferencesEditor.focusSettings(true);
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    keybinding: {
                        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    f1: true,
                    category,
                    title: { value: nls.localize('settings.showContextMenu', "Show Setting Context Menu"), original: 'Show Setting Context Menu' }
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (preferencesEditor instanceof SettingsEditor2) {
                    preferencesEditor.showContextMenu();
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                    keybinding: {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    f1: true,
                    category,
                    title: { value: nls.localize('settings.focusLevelUp', "Move Focus Up One Level"), original: 'Move Focus Up One Level' }
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (!(preferencesEditor instanceof SettingsEditor2)) {
                    return;
                }
                if (preferencesEditor.currentFocusContext === 3 /* SettingsFocusContext.SettingControl */) {
                    preferencesEditor.focusSettings();
                }
                else if (preferencesEditor.currentFocusContext === 2 /* SettingsFocusContext.SettingTree */) {
                    preferencesEditor.focusTOC();
                }
                else if (preferencesEditor.currentFocusContext === 1 /* SettingsFocusContext.TableOfContents */) {
                    preferencesEditor.focusSearch();
                }
            }
        });
    }
    registerKeybindingsActions() {
        const that = this;
        const category = { value: nls.localize('preferences', "Preferences"), original: 'Preferences' };
        const registerOpenGlobalKeybindingsActionDisposable = this._register(new MutableDisposable());
        const registerOpenGlobalKeybindingsAction = () => {
            registerOpenGlobalKeybindingsActionDisposable.value = registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openGlobalKeybindings',
                        title: { value: nls.localize('openGlobalKeybindings', "Open Keyboard Shortcuts"), original: 'Open Keyboard Shortcuts' },
                        category,
                        icon: preferencesOpenSettingsIcon,
                        keybinding: {
                            when: null,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */)
                        },
                        menu: [
                            { id: MenuId.CommandPalette },
                            {
                                id: MenuId.EditorTitle,
                                when: ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
                                group: 'navigation',
                                order: 1,
                            }
                        ]
                    });
                }
                run(accessor, args) {
                    const query = typeof args === 'string' ? args : undefined;
                    return accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, { query });
                }
            });
        };
        registerOpenGlobalKeybindingsAction();
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => registerOpenGlobalKeybindingsAction()));
        MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
            command: {
                id: 'workbench.action.openGlobalKeybindings',
                title: { value: nls.localize('Keyboard Shortcuts', "Keyboard Shortcuts"), original: 'Keyboard Shortcuts' }
            },
            group: '2_keybindings',
            order: 1
        });
        MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
            command: {
                id: 'workbench.action.openGlobalKeybindings',
                title: { value: nls.localize('Keyboard Shortcuts', "Keyboard Shortcuts"), original: 'Keyboard Shortcuts' }
            },
            group: '2_keybindings',
            order: 1
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openDefaultKeybindingsFile',
                    title: { value: nls.localize('openDefaultKeybindingsFile', "Open Default Keyboard Shortcuts (JSON)"), original: 'Open Default Keyboard Shortcuts (JSON)' },
                    category,
                    menu: { id: MenuId.CommandPalette }
                });
            }
            run(accessor) {
                return accessor.get(IPreferencesService).openDefaultKeybindingsFile();
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openGlobalKeybindingsFile',
                    title: { value: nls.localize('openGlobalKeybindingsFile', "Open Keyboard Shortcuts (JSON)"), original: 'Open Keyboard Shortcuts (JSON)' },
                    category,
                    icon: preferencesOpenSettingsIcon,
                    menu: [
                        { id: MenuId.CommandPalette },
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: 'navigation',
                        }
                    ]
                });
            }
            run(accessor) {
                return accessor.get(IPreferencesService).openGlobalKeybindingSettings(true);
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
                    title: { value: nls.localize('showDefaultKeybindings', "Show Default Keybindings"), original: 'Show Default Keybindings' },
                    menu: [
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: '1_keyboard_preferences_actions'
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.search('@source:default');
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
                    title: { value: nls.localize('showExtensionKeybindings', "Show Extension Keybindings"), original: 'Show Extension Keybindings' },
                    menu: [
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: '1_keyboard_preferences_actions'
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.search('@source:extension');
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
                    title: { value: nls.localize('showUserKeybindings', "Show User Keybindings"), original: 'Show User Keybindings' },
                    menu: [
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: '1_keyboard_preferences_actions'
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.search('@source:user');
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                    title: nls.localize('clear', "Clear Search Results"),
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                        primary: 9 /* KeyCode.Escape */,
                    }
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.clearSearchResults();
                }
            }
        });
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
                    title: nls.localize('clearHistory', "Clear Keyboard Shortcuts Search History"),
                    category,
                    menu: [
                        {
                            id: MenuId.CommandPalette,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.clearKeyboardShortcutSearchHistory();
                }
            }
        });
        this.registerKeybindingEditorActions();
    }
    registerKeybindingEditorActions() {
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 3 /* KeyCode.Enter */,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_ADD,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
                    editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, InputFocusedContext.toNegated()),
            primary: 20 /* KeyCode.Delete */,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
            },
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_RESET,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_SEARCH,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.focusSearch();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
            primary: 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */ },
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.recordSearchKeys();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
            primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ },
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.toggleSortByPrecedence();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_COPY,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.negate()),
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
            primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.focusKeybindings();
                }
            }
        });
    }
    updatePreferencesEditorMenuItem() {
        const commandId = '_workbench.openWorkspaceSettingsEditor';
        if (this.workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && !CommandsRegistry.getCommand(commandId)) {
            CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings({ jsonEditor: false }));
            MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
                command: {
                    id: commandId,
                    title: OPEN_USER_SETTINGS_UI_TITLE,
                    icon: preferencesOpenSettingsIcon
                },
                when: ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), WorkbenchStateContext.isEqualTo('workspace'), ContextKeyExpr.not('isInDiffEditor')),
                group: 'navigation',
                order: 1
            });
        }
        this.updatePreferencesEditorMenuItemForWorkspaceFolders();
    }
    updatePreferencesEditorMenuItemForWorkspaceFolders() {
        for (const folder of this.workspaceContextService.getWorkspace().folders) {
            const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
            if (!CommandsRegistry.getCommand(commandId)) {
                CommandsRegistry.registerCommand(commandId, () => {
                    if (this.workspaceContextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                        return this.preferencesService.openWorkspaceSettings({ jsonEditor: false });
                    }
                    else {
                        return this.preferencesService.openFolderSettings({ folderUri: folder.uri, jsonEditor: false });
                    }
                });
                MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
                    command: {
                        id: commandId,
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesOpenSettingsIcon
                    },
                    when: ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString()), ContextKeyExpr.not('isInDiffEditor')),
                    group: 'navigation',
                    order: 1
                });
            }
        }
    }
};
PreferencesActionsContribution = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IUserDataProfileService),
    __param(2, IPreferencesService),
    __param(3, IWorkspaceContextService),
    __param(4, ILabelService),
    __param(5, IExtensionService),
    __param(6, IUserDataProfilesService)
], PreferencesActionsContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(PreferencesActionsContribution, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(PreferencesContribution, 1 /* LifecyclePhase.Starting */);
registerEditorContribution(SettingsEditorContribution.ID, SettingsEditorContribution);
// Preferences menu
MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
    title: nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences"),
    submenu: MenuId.MenubarPreferencesMenu,
    group: '5_autosave',
    order: 2,
    when: IsMacNativeContext.toNegated() // on macOS native the preferences menu is separate under the application menu
});
