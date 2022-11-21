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
import { DisposableStore, dispose } from 'vs/base/common/lifecycle';
import { isEqual } from 'vs/base/common/resources';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import * as JSONContributionRegistry from 'vs/platform/jsonschemas/common/jsonContributionRegistry';
import { Registry } from 'vs/platform/registry/common/platform';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { SideBySideEditorInput } from 'vs/workbench/common/editor/sideBySideEditorInput';
import { RegisteredEditorPriority, IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { ITextEditorService } from 'vs/workbench/services/textfile/common/textEditorService';
import { DEFAULT_SETTINGS_EDITOR_SETTING, FOLDER_SETTINGS_PATH, IPreferencesService, USE_SPLIT_JSON_SETTING } from 'vs/workbench/services/preferences/common/preferences';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
const schemaRegistry = Registry.as(JSONContributionRegistry.Extensions.JSONContribution);
let PreferencesContribution = class PreferencesContribution {
    modelService;
    textModelResolverService;
    preferencesService;
    languageService;
    userDataProfileService;
    workspaceService;
    configurationService;
    editorResolverService;
    textEditorService;
    editorOpeningListener;
    settingsListener;
    constructor(modelService, textModelResolverService, preferencesService, languageService, userDataProfileService, workspaceService, configurationService, editorResolverService, textEditorService) {
        this.modelService = modelService;
        this.textModelResolverService = textModelResolverService;
        this.preferencesService = preferencesService;
        this.languageService = languageService;
        this.userDataProfileService = userDataProfileService;
        this.workspaceService = workspaceService;
        this.configurationService = configurationService;
        this.editorResolverService = editorResolverService;
        this.textEditorService = textEditorService;
        this.settingsListener = this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(USE_SPLIT_JSON_SETTING) || e.affectsConfiguration(DEFAULT_SETTINGS_EDITOR_SETTING)) {
                this.handleSettingsEditorRegistration();
            }
        });
        this.handleSettingsEditorRegistration();
        this.start();
    }
    handleSettingsEditorRegistration() {
        // dispose any old listener we had
        dispose(this.editorOpeningListener);
        // install editor opening listener unless user has disabled this
        if (!!this.configurationService.getValue(USE_SPLIT_JSON_SETTING) || !!this.configurationService.getValue(DEFAULT_SETTINGS_EDITOR_SETTING)) {
            this.editorOpeningListener = this.editorResolverService.registerEditor('**/settings.json', {
                id: SideBySideEditorInput.ID,
                label: nls.localize('splitSettingsEditorLabel', "Split Settings Editor"),
                priority: RegisteredEditorPriority.builtin,
            }, {}, {
                createEditorInput: ({ resource, options }) => {
                    // Global User Settings File
                    if (isEqual(resource, this.userDataProfileService.currentProfile.settingsResource)) {
                        return { editor: this.preferencesService.createSplitJsonEditorInput(3 /* ConfigurationTarget.USER_LOCAL */, resource), options };
                    }
                    // Single Folder Workspace Settings File
                    const state = this.workspaceService.getWorkbenchState();
                    if (state === 2 /* WorkbenchState.FOLDER */) {
                        const folders = this.workspaceService.getWorkspace().folders;
                        if (isEqual(resource, folders[0].toResource(FOLDER_SETTINGS_PATH))) {
                            return { editor: this.preferencesService.createSplitJsonEditorInput(5 /* ConfigurationTarget.WORKSPACE */, resource), options };
                        }
                    }
                    // Multi Folder Workspace Settings File
                    else if (state === 3 /* WorkbenchState.WORKSPACE */) {
                        const folders = this.workspaceService.getWorkspace().folders;
                        for (const folder of folders) {
                            if (isEqual(resource, folder.toResource(FOLDER_SETTINGS_PATH))) {
                                return { editor: this.preferencesService.createSplitJsonEditorInput(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, resource), options };
                            }
                        }
                    }
                    return { editor: this.textEditorService.createTextEditor({ resource }), options };
                }
            });
        }
    }
    start() {
        this.textModelResolverService.registerTextModelContentProvider('vscode', {
            provideTextContent: (uri) => {
                if (uri.scheme !== 'vscode') {
                    return null;
                }
                if (uri.authority === 'schemas') {
                    const schemaModel = this.getSchemaModel(uri);
                    if (schemaModel) {
                        return Promise.resolve(schemaModel);
                    }
                }
                return Promise.resolve(this.preferencesService.resolveModel(uri));
            }
        });
    }
    getSchemaModel(uri) {
        let schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()];
        if (schema) {
            const modelContent = JSON.stringify(schema);
            const languageSelection = this.languageService.createById('jsonc');
            const model = this.modelService.createModel(modelContent, languageSelection, uri);
            const disposables = new DisposableStore();
            disposables.add(schemaRegistry.onDidChangeSchema(schemaUri => {
                if (schemaUri === uri.toString()) {
                    schema = schemaRegistry.getSchemaContributions().schemas[uri.toString()];
                    model.setValue(JSON.stringify(schema));
                }
            }));
            disposables.add(model.onWillDispose(() => disposables.dispose()));
            return model;
        }
        return null;
    }
    dispose() {
        dispose(this.editorOpeningListener);
        dispose(this.settingsListener);
    }
};
PreferencesContribution = __decorate([
    __param(0, IModelService),
    __param(1, ITextModelService),
    __param(2, IPreferencesService),
    __param(3, ILanguageService),
    __param(4, IUserDataProfileService),
    __param(5, IWorkspaceContextService),
    __param(6, IConfigurationService),
    __param(7, IEditorResolverService),
    __param(8, ITextEditorService)
], PreferencesContribution);
export { PreferencesContribution };
const registry = Registry.as(Extensions.Configuration);
registry.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    'properties': {
        'workbench.settings.enableNaturalLanguageSearch': {
            'type': 'boolean',
            'description': nls.localize('enableNaturalLanguageSettingsSearch', "Controls whether to enable the natural language search mode for settings. The natural language search is provided by a Microsoft online service."),
            'default': true,
            'scope': 3 /* ConfigurationScope.WINDOW */,
            'tags': ['usesOnlineServices']
        },
        'workbench.settings.settingsSearchTocBehavior': {
            'type': 'string',
            'enum': ['hide', 'filter'],
            'enumDescriptions': [
                nls.localize('settingsSearchTocBehavior.hide', "Hide the Table of Contents while searching."),
                nls.localize('settingsSearchTocBehavior.filter', "Filter the Table of Contents to just categories that have matching settings. Clicking a category will filter the results to that category."),
            ],
            'description': nls.localize('settingsSearchTocBehavior', "Controls the behavior of the settings editor Table of Contents while searching."),
            'default': 'filter',
            'scope': 3 /* ConfigurationScope.WINDOW */
        },
    }
});
