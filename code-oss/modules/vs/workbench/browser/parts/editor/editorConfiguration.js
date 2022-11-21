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
import { Disposable } from 'vs/base/common/lifecycle';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { IEditorResolverService, RegisteredEditorPriority } from 'vs/workbench/services/editor/common/editorResolverService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { coalesce } from 'vs/base/common/arrays';
import { Event } from 'vs/base/common/event';
let DynamicEditorConfigurations = class DynamicEditorConfigurations extends Disposable {
    editorResolverService;
    static AUTO_LOCK_DEFAULT_ENABLED = new Set(['terminalEditor']);
    static AUTO_LOCK_EXTRA_EDITORS = [
        // Any webview editor is not a registered editor but we
        // still want to support auto-locking for them, so we
        // manually add them here...
        {
            id: 'mainThreadWebview-markdown.preview',
            label: localize('markdownPreview', "Markdown Preview"),
            priority: RegisteredEditorPriority.builtin
        }
    ];
    configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
    autoLockConfigurationNode;
    defaultBinaryEditorConfigurationNode;
    editorAssociationsConfigurationNode;
    constructor(editorResolverService, extensionService) {
        super();
        this.editorResolverService = editorResolverService;
        // Editor configurations are getting updated very aggressively
        // (atleast 20 times) while the extensions are getting registered.
        // As such push out the dynamic configuration until after extensions
        // are registered.
        (async () => {
            await extensionService.whenInstalledExtensionsRegistered();
            this.updateDynamicEditorConfigurations();
            this.registerListeners();
        })();
    }
    registerListeners() {
        // Registered editors (debounced to reduce perf overhead)
        Event.debounce(this.editorResolverService.onDidChangeEditorRegistrations, (_, e) => e)(() => this.updateDynamicEditorConfigurations());
    }
    updateDynamicEditorConfigurations() {
        const lockableEditors = [...this.editorResolverService.getEditors(), ...DynamicEditorConfigurations.AUTO_LOCK_EXTRA_EDITORS];
        const binaryEditorCandidates = this.editorResolverService.getEditors().filter(e => e.priority !== RegisteredEditorPriority.exclusive).map(e => e.id);
        // Build config from registered editors
        const autoLockGroupConfiguration = Object.create(null);
        for (const editor of lockableEditors) {
            autoLockGroupConfiguration[editor.id] = {
                type: 'boolean',
                default: DynamicEditorConfigurations.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id),
                description: editor.label
            };
        }
        // Build default config too
        const defaultAutoLockGroupConfiguration = Object.create(null);
        for (const editor of lockableEditors) {
            defaultAutoLockGroupConfiguration[editor.id] = DynamicEditorConfigurations.AUTO_LOCK_DEFAULT_ENABLED.has(editor.id);
        }
        // Register settng for auto locking groups
        const oldAutoLockConfigurationNode = this.autoLockConfigurationNode;
        this.autoLockConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editor.autoLockGroups': {
                    type: 'object',
                    description: localize('workbench.editor.autoLockGroups', "If an editor matching one of the listed types is opened as the first in an editor group and more than one group is open, the group is automatically locked. Locked groups will only be used for opening editors when explicitly chosen by a user gesture (for example drag and drop), but not by default. Consequently, the active editor in a locked group is less likely to be replaced accidentally with a different editor."),
                    properties: autoLockGroupConfiguration,
                    default: defaultAutoLockGroupConfiguration,
                    additionalProperties: false
                }
            }
        };
        // Registers setting for default binary editors
        const oldDefaultBinaryEditorConfigurationNode = this.defaultBinaryEditorConfigurationNode;
        this.defaultBinaryEditorConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editor.defaultBinaryEditor': {
                    type: 'string',
                    default: '',
                    // This allows for intellisense autocompletion
                    enum: [...binaryEditorCandidates, ''],
                    description: localize('workbench.editor.defaultBinaryEditor', "The default editor for files detected as binary. If undefined, the user will be presented with a picker."),
                }
            }
        };
        // Registers setting for editorAssociations
        const oldEditorAssociationsConfigurationNode = this.editorAssociationsConfigurationNode;
        this.editorAssociationsConfigurationNode = {
            ...workbenchConfigurationNodeBase,
            properties: {
                'workbench.editorAssociations': {
                    type: 'object',
                    markdownDescription: localize('editor.editorAssociations', "Configure glob patterns to editors (for example `\"*.hex\": \"hexEditor.hexEdit\"`). These have precedence over the default behavior."),
                    patternProperties: {
                        '.*': {
                            type: 'string',
                            enum: binaryEditorCandidates,
                        }
                    }
                }
            }
        };
        this.configurationRegistry.updateConfigurations({
            add: [
                this.autoLockConfigurationNode,
                this.defaultBinaryEditorConfigurationNode,
                this.editorAssociationsConfigurationNode
            ],
            remove: coalesce([
                oldAutoLockConfigurationNode,
                oldDefaultBinaryEditorConfigurationNode,
                oldEditorAssociationsConfigurationNode
            ])
        });
    }
};
DynamicEditorConfigurations = __decorate([
    __param(0, IEditorResolverService),
    __param(1, IExtensionService)
], DynamicEditorConfigurations);
export { DynamicEditorConfigurations };
