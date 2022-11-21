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
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { areSameExtensions } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export const VIEWLET_ID = 'workbench.view.extensions';
export var ExtensionState;
(function (ExtensionState) {
    ExtensionState[ExtensionState["Installing"] = 0] = "Installing";
    ExtensionState[ExtensionState["Installed"] = 1] = "Installed";
    ExtensionState[ExtensionState["Uninstalling"] = 2] = "Uninstalling";
    ExtensionState[ExtensionState["Uninstalled"] = 3] = "Uninstalled";
})(ExtensionState || (ExtensionState = {}));
export const SERVICE_ID = 'extensionsWorkbenchService';
export const IExtensionsWorkbenchService = createDecorator(SERVICE_ID);
export var ExtensionEditorTab;
(function (ExtensionEditorTab) {
    ExtensionEditorTab["Readme"] = "readme";
    ExtensionEditorTab["Contributions"] = "contributions";
    ExtensionEditorTab["Changelog"] = "changelog";
    ExtensionEditorTab["Dependencies"] = "dependencies";
    ExtensionEditorTab["ExtensionPack"] = "extensionPack";
    ExtensionEditorTab["RuntimeStatus"] = "runtimeStatus";
})(ExtensionEditorTab || (ExtensionEditorTab = {}));
export const ConfigurationKey = 'extensions';
export const AutoUpdateConfigurationKey = 'extensions.autoUpdate';
export const AutoCheckUpdatesConfigurationKey = 'extensions.autoCheckUpdates';
export const CloseExtensionDetailsOnViewChangeKey = 'extensions.closeExtensionDetailsOnViewChange';
let ExtensionContainers = class ExtensionContainers extends Disposable {
    containers;
    constructor(containers, extensionsWorkbenchService) {
        super();
        this.containers = containers;
        this._register(extensionsWorkbenchService.onChange(this.update, this));
    }
    set extension(extension) {
        this.containers.forEach(c => c.extension = extension);
    }
    update(extension) {
        for (const container of this.containers) {
            if (extension && container.extension) {
                if (areSameExtensions(container.extension.identifier, extension.identifier)) {
                    if (container.extension.server && extension.server && container.extension.server !== extension.server) {
                        if (container.updateWhenCounterExtensionChanges) {
                            container.update();
                        }
                    }
                    else {
                        container.extension = extension;
                    }
                }
            }
            else {
                container.update();
            }
        }
    }
};
ExtensionContainers = __decorate([
    __param(1, IExtensionsWorkbenchService)
], ExtensionContainers);
export { ExtensionContainers };
export const WORKSPACE_RECOMMENDATIONS_VIEW_ID = 'workbench.views.extensions.workspaceRecommendations';
export const OUTDATED_EXTENSIONS_VIEW_ID = 'workbench.views.extensions.searchOutdated';
export const TOGGLE_IGNORE_EXTENSION_ACTION_ID = 'workbench.extensions.action.toggleIgnoreExtension';
export const SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID = 'workbench.extensions.action.installVSIX';
export const INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID = 'workbench.extensions.command.installFromVSIX';
export const LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID = 'workbench.extensions.action.listWorkspaceUnsupportedExtensions';
// Context Keys
export const HasOutdatedExtensionsContext = new RawContextKey('hasOutdatedExtensions', false);
export const CONTEXT_HAS_GALLERY = new RawContextKey('hasGallery', false);
// Context Menu Groups
export const THEME_ACTIONS_GROUP = '_theme_';
export const INSTALL_ACTIONS_GROUP = '0_install';
