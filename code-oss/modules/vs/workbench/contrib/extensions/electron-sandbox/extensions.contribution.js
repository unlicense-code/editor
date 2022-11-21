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
import { Registry } from 'vs/platform/registry/common/platform';
import { MenuRegistry, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { RuntimeExtensionsEditor, StartExtensionHostProfileAction, StopExtensionHostProfileAction, CONTEXT_PROFILE_SESSION_STATE, CONTEXT_EXTENSION_HOST_PROFILE_RECORDED, SaveExtensionHostProfileAction, IExtensionHostProfileService } from 'vs/workbench/contrib/extensions/electron-sandbox/runtimeExtensionsEditor';
import { DebugExtensionHostAction } from 'vs/workbench/contrib/extensions/electron-sandbox/debugExtensionHostAction';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { ActiveEditorContext } from 'vs/workbench/common/contextkeys';
import { RuntimeExtensionsInput } from 'vs/workbench/contrib/extensions/common/runtimeExtensionsInput';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { OpenExtensionsFolderAction } from 'vs/workbench/contrib/extensions/electron-sandbox/extensionsActions';
import { IExtensionRecommendationNotificationService } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
import { ISharedProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ExtensionRecommendationNotificationServiceChannel } from 'vs/platform/extensionRecommendations/electron-sandbox/extensionRecommendationsIpc';
import { Codicon } from 'vs/base/common/codicons';
import { RemoteExtensionsInitializerContribution } from 'vs/workbench/contrib/extensions/electron-sandbox/remoteExtensionsInit';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ExtensionHostProfileService } from 'vs/workbench/contrib/extensions/electron-sandbox/extensionProfileService';
import { ExtensionsAutoProfiler } from 'vs/workbench/contrib/extensions/electron-sandbox/extensionsAutoProfiler';
// Singletons
registerSingleton(IExtensionHostProfileService, ExtensionHostProfileService, 1 /* InstantiationType.Delayed */);
// Running Extensions Editor
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(RuntimeExtensionsEditor, RuntimeExtensionsEditor.ID, localize('runtimeExtension', "Running Extensions")), [new SyncDescriptor(RuntimeExtensionsInput)]);
class RuntimeExtensionsInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        return '';
    }
    deserialize(instantiationService) {
        return RuntimeExtensionsInput.instance;
    }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(RuntimeExtensionsInput.ID, RuntimeExtensionsInputSerializer);
// Global actions
let ExtensionsContributions = class ExtensionsContributions {
    constructor(extensionRecommendationNotificationService, sharedProcessService) {
        sharedProcessService.registerChannel('extensionRecommendationNotification', new ExtensionRecommendationNotificationServiceChannel(extensionRecommendationNotificationService));
        registerAction2(OpenExtensionsFolderAction);
    }
};
ExtensionsContributions = __decorate([
    __param(0, IExtensionRecommendationNotificationService),
    __param(1, ISharedProcessService)
], ExtensionsContributions);
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(ExtensionsContributions, 3 /* LifecyclePhase.Restored */);
workbenchRegistry.registerWorkbenchContribution(ExtensionsAutoProfiler, 4 /* LifecyclePhase.Eventually */);
workbenchRegistry.registerWorkbenchContribution(RemoteExtensionsInitializerContribution, 3 /* LifecyclePhase.Restored */);
// Register Commands
CommandsRegistry.registerCommand(DebugExtensionHostAction.ID, (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(DebugExtensionHostAction).run();
});
CommandsRegistry.registerCommand(StartExtensionHostProfileAction.ID, (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(StartExtensionHostProfileAction, StartExtensionHostProfileAction.ID, StartExtensionHostProfileAction.LABEL).run();
});
CommandsRegistry.registerCommand(StopExtensionHostProfileAction.ID, (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(StopExtensionHostProfileAction, StopExtensionHostProfileAction.ID, StopExtensionHostProfileAction.LABEL).run();
});
CommandsRegistry.registerCommand(SaveExtensionHostProfileAction.ID, (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(SaveExtensionHostProfileAction, SaveExtensionHostProfileAction.ID, SaveExtensionHostProfileAction.LABEL).run();
});
// Running extensions
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: {
        id: DebugExtensionHostAction.ID,
        title: DebugExtensionHostAction.LABEL,
        icon: Codicon.debugStart
    },
    group: 'navigation',
    when: ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID)
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: {
        id: StartExtensionHostProfileAction.ID,
        title: StartExtensionHostProfileAction.LABEL,
        icon: Codicon.circleFilled
    },
    group: 'navigation',
    when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID), CONTEXT_PROFILE_SESSION_STATE.notEqualsTo('running'))
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: {
        id: StopExtensionHostProfileAction.ID,
        title: StopExtensionHostProfileAction.LABEL,
        icon: Codicon.debugStop
    },
    group: 'navigation',
    when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID), CONTEXT_PROFILE_SESSION_STATE.isEqualTo('running'))
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
    command: {
        id: SaveExtensionHostProfileAction.ID,
        title: SaveExtensionHostProfileAction.LABEL,
        icon: Codicon.saveAll,
        precondition: CONTEXT_EXTENSION_HOST_PROFILE_RECORDED
    },
    group: 'navigation',
    when: ContextKeyExpr.and(ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID))
});
