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
import { GettingStartedInputSerializer, GettingStartedPage, inWelcomeContext } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStarted';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { MenuId, registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { IWalkthroughsService } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService';
import { GettingStartedInput } from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedInput';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { isLinux, isMacintosh, isWindows } from 'vs/base/common/platform';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { StartupPageContribution, } from 'vs/workbench/contrib/welcomeGettingStarted/browser/startupPage';
import { ExtensionsInput } from 'vs/workbench/contrib/extensions/common/extensionsInput';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
export * as icons from 'vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedIcons';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.openWalkthrough',
            title: { value: localize('miGetStarted', "Get Started"), original: 'Get Started' },
            category: Categories.Help,
            f1: true,
            menu: {
                id: MenuId.MenubarHelpMenu,
                group: '1_welcome',
                order: 1,
            }
        });
    }
    run(accessor, walkthroughID, toSide) {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const instantiationService = accessor.get(IInstantiationService);
        const editorService = accessor.get(IEditorService);
        const commandService = accessor.get(ICommandService);
        if (walkthroughID) {
            const selectedCategory = typeof walkthroughID === 'string' ? walkthroughID : walkthroughID.category;
            const selectedStep = typeof walkthroughID === 'string' ? undefined : walkthroughID.step;
            // Try first to select the walkthrough on an active welcome page with no selected walkthrough
            for (const group of editorGroupsService.groups) {
                if (group.activeEditor instanceof GettingStartedInput) {
                    if (!group.activeEditor.selectedCategory) {
                        group.activeEditorPane.makeCategoryVisibleWhenAvailable(selectedCategory, selectedStep);
                        return;
                    }
                }
            }
            // Otherwise, try to find a welcome input somewhere with no selected walkthrough, and open it to this one.
            const result = editorService.findEditors({ typeId: GettingStartedInput.ID, editorId: undefined, resource: GettingStartedInput.RESOURCE });
            for (const { editor, groupId } of result) {
                if (editor instanceof GettingStartedInput) {
                    const group = editorGroupsService.getGroup(groupId);
                    if (!editor.selectedCategory && group) {
                        editor.selectedCategory = selectedCategory;
                        editor.selectedStep = selectedStep;
                        group.openEditor(editor, { revealIfOpened: true });
                        return;
                    }
                }
            }
            const activeEditor = editorService.activeEditor;
            // If the walkthrough is already open just reveal the step
            if (selectedStep && activeEditor instanceof GettingStartedInput && activeEditor.selectedCategory === selectedCategory) {
                commandService.executeCommand('walkthroughs.selectStep', selectedStep);
                return;
            }
            const gettingStartedInput = instantiationService.createInstance(GettingStartedInput, { selectedCategory: selectedCategory, selectedStep: selectedStep });
            // If it's the extension install page then lets replace it with the getting started page
            if (activeEditor instanceof ExtensionsInput) {
                const activeGroup = editorGroupsService.activeGroup;
                activeGroup.replaceEditors([{
                        editor: activeEditor,
                        replacement: gettingStartedInput
                    }]);
            }
            else {
                // else open respecting toSide
                editorService.openEditor(gettingStartedInput, { preserveFocus: toSide ?? false }, toSide ? SIDE_GROUP : undefined);
            }
        }
        else {
            editorService.openEditor(new GettingStartedInput({}), {});
        }
    }
});
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(GettingStartedInput.ID, GettingStartedInputSerializer);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(GettingStartedPage, GettingStartedPage.ID, localize('getStarted', "Get Started")), [
    new SyncDescriptor(GettingStartedInput)
]);
const category = { value: localize('getStarted', "Get Started"), original: 'Get Started' };
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'welcome.goBack',
            title: { value: localize('welcome.goBack', "Go Back"), original: 'Go Back' },
            category,
            keybinding: {
                weight: 100 /* KeybindingWeight.EditorContrib */,
                primary: 9 /* KeyCode.Escape */,
                when: inWelcomeContext
            },
            precondition: ContextKeyExpr.equals('activeEditor', 'gettingStartedPage'),
            f1: true
        });
    }
    run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editorPane = editorService.activeEditorPane;
        if (editorPane instanceof GettingStartedPage) {
            editorPane.escape();
        }
    }
});
CommandsRegistry.registerCommand({
    id: 'walkthroughs.selectStep',
    handler: (accessor, stepID) => {
        const editorService = accessor.get(IEditorService);
        const editorPane = editorService.activeEditorPane;
        if (editorPane instanceof GettingStartedPage) {
            editorPane.selectStepLoose(stepID);
        }
        else {
            console.error('Cannot run walkthroughs.selectStep outside of walkthrough context');
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'welcome.markStepComplete',
            title: localize('welcome.markStepComplete', "Mark Step Complete"),
            category,
        });
    }
    run(accessor, arg) {
        if (!arg) {
            return;
        }
        const gettingStartedService = accessor.get(IWalkthroughsService);
        gettingStartedService.progressStep(arg);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'welcome.markStepIncomplete',
            title: localize('welcome.markStepInomplete', "Mark Step Incomplete"),
            category,
        });
    }
    run(accessor, arg) {
        if (!arg) {
            return;
        }
        const gettingStartedService = accessor.get(IWalkthroughsService);
        gettingStartedService.deprogressStep(arg);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'welcome.showAllWalkthroughs',
            title: { value: localize('welcome.showAllWalkthroughs', "Open Walkthrough..."), original: 'Open Walkthrough...' },
            category,
            f1: true,
        });
    }
    getQuickPickItems(contextService, gettingStartedService) {
        const categories = gettingStartedService.getWalkthroughs();
        return categories
            .filter(c => contextService.contextMatchesRules(c.when))
            .map(x => ({
            id: x.id,
            label: x.title,
            detail: x.description,
            description: x.source,
        }));
    }
    async run(accessor) {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextKeyService);
        const quickInputService = accessor.get(IQuickInputService);
        const gettingStartedService = accessor.get(IWalkthroughsService);
        const extensionService = accessor.get(IExtensionService);
        const quickPick = quickInputService.createQuickPick();
        quickPick.canSelectMany = false;
        quickPick.matchOnDescription = true;
        quickPick.matchOnDetail = true;
        quickPick.placeholder = localize('pickWalkthroughs', 'Select a walkthrough to open');
        quickPick.items = this.getQuickPickItems(contextService, gettingStartedService);
        quickPick.busy = true;
        quickPick.onDidAccept(() => {
            const selection = quickPick.selectedItems[0];
            if (selection) {
                commandService.executeCommand('workbench.action.openWalkthrough', selection.id);
            }
            quickPick.hide();
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
        await extensionService.whenInstalledExtensionsRegistered();
        quickPick.busy = false;
        await gettingStartedService.installedExtensionsRegistered;
        quickPick.items = this.getQuickPickItems(contextService, gettingStartedService);
    }
});
export const WorkspacePlatform = new RawContextKey('workspacePlatform', undefined, localize('workspacePlatform', "The platform of the current workspace, which in remote or serverless contexts may be different from the platform of the UI"));
let WorkspacePlatformContribution = class WorkspacePlatformContribution {
    extensionManagementServerService;
    remoteAgentService;
    contextService;
    constructor(extensionManagementServerService, remoteAgentService, contextService) {
        this.extensionManagementServerService = extensionManagementServerService;
        this.remoteAgentService = remoteAgentService;
        this.contextService = contextService;
        this.remoteAgentService.getEnvironment().then(env => {
            const remoteOS = env?.os;
            const remotePlatform = remoteOS === 2 /* OS.Macintosh */ ? 'mac'
                : remoteOS === 1 /* OS.Windows */ ? 'windows'
                    : remoteOS === 3 /* OS.Linux */ ? 'linux'
                        : undefined;
            if (remotePlatform) {
                WorkspacePlatform.bindTo(this.contextService).set(remotePlatform);
            }
            else if (this.extensionManagementServerService.localExtensionManagementServer) {
                if (isMacintosh) {
                    WorkspacePlatform.bindTo(this.contextService).set('mac');
                }
                else if (isLinux) {
                    WorkspacePlatform.bindTo(this.contextService).set('linux');
                }
                else if (isWindows) {
                    WorkspacePlatform.bindTo(this.contextService).set('windows');
                }
            }
            else if (this.extensionManagementServerService.webExtensionManagementServer) {
                WorkspacePlatform.bindTo(this.contextService).set('webworker');
            }
            else {
                console.error('Error: Unable to detect workspace platform');
            }
        });
    }
};
WorkspacePlatformContribution = __decorate([
    __param(0, IExtensionManagementServerService),
    __param(1, IRemoteAgentService),
    __param(2, IContextKeyService)
], WorkspacePlatformContribution);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WorkspacePlatformContribution, 3 /* LifecyclePhase.Restored */);
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    properties: {
        'workbench.welcomePage.walkthroughs.openOnInstall': {
            scope: 2 /* ConfigurationScope.MACHINE */,
            type: 'boolean',
            default: true,
            description: localize('workbench.welcomePage.walkthroughs.openOnInstall', "When enabled, an extension's walkthrough will open upon install of the extension.")
        },
        'workbench.welcomePage.experimental.videoTutorials': {
            scope: 2 /* ConfigurationScope.MACHINE */,
            type: 'string',
            enum: [
                'off',
                'on',
                'experimental'
            ],
            tags: ['experimental'],
            default: 'off',
            description: localize('workbench.welcomePage.videoTutorials', "When enabled, the get started page has additional links to video tutorials.")
        },
        'workbench.startupEditor': {
            'scope': 4 /* ConfigurationScope.RESOURCE */,
            'type': 'string',
            'enum': ['none', 'welcomePage', 'readme', 'newUntitledFile', 'welcomePageInEmptyWorkbench'],
            'enumDescriptions': [
                localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.none' }, "Start without an editor."),
                localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePage' }, "Open the Welcome page, with content to aid in getting started with VS Code and extensions."),
                localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.readme' }, "Open the README when opening a folder that contains one, fallback to 'welcomePage' otherwise. Note: This is only observed as a global configuration, it will be ignored if set in a workspace or folder configuration."),
                localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.newUntitledFile' }, "Open a new untitled file (only applies when opening an empty window)."),
                localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.startupEditor.welcomePageInEmptyWorkbench' }, "Open the Welcome page when opening an empty workbench."),
            ],
            'default': 'welcomePage',
            'description': localize('workbench.startupEditor', "Controls which editor is shown at startup, if none are restored from the previous session.")
        },
        'workbench.welcomePage.preferReducedMotion': {
            scope: 1 /* ConfigurationScope.APPLICATION */,
            type: 'boolean',
            default: false,
            deprecationMessage: localize('deprecationMessage', "Deprecated, use the global `workbench.reduceMotion`."),
            description: localize('workbench.welcomePage.preferReducedMotion', "When enabled, reduce motion in welcome page.")
        }
    }
});
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(StartupPageContribution, 3 /* LifecyclePhase.Restored */);
