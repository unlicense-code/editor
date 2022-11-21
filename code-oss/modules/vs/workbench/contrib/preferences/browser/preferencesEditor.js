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
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { UserSettingsRenderer, WorkspaceSettingsRenderer } from 'vs/workbench/contrib/preferences/browser/preferencesRenderers';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { SettingsEditorModel } from 'vs/workbench/services/preferences/common/preferencesModels';
let SettingsEditorContribution = class SettingsEditorContribution extends Disposable {
    editor;
    instantiationService;
    preferencesService;
    workspaceContextService;
    static ID = 'editor.contrib.settings';
    currentRenderer;
    disposables = this._register(new DisposableStore());
    constructor(editor, instantiationService, preferencesService, workspaceContextService) {
        super();
        this.editor = editor;
        this.instantiationService = instantiationService;
        this.preferencesService = preferencesService;
        this.workspaceContextService = workspaceContextService;
        this._createPreferencesRenderer();
        this._register(this.editor.onDidChangeModel(e => this._createPreferencesRenderer()));
        this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => this._createPreferencesRenderer()));
    }
    async _createPreferencesRenderer() {
        this.disposables.clear();
        this.currentRenderer = undefined;
        const model = this.editor.getModel();
        if (model && /\.(json|code-workspace)$/.test(model.uri.path)) {
            // Fast check: the preferences renderer can only appear
            // in settings files or workspace files
            const settingsModel = await this.preferencesService.createPreferencesEditorModel(model.uri);
            if (settingsModel instanceof SettingsEditorModel && this.editor.getModel()) {
                this.disposables.add(settingsModel);
                switch (settingsModel.configurationTarget) {
                    case 5 /* ConfigurationTarget.WORKSPACE */:
                        this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(WorkspaceSettingsRenderer, this.editor, settingsModel));
                        break;
                    default:
                        this.currentRenderer = this.disposables.add(this.instantiationService.createInstance(UserSettingsRenderer, this.editor, settingsModel));
                        break;
                }
            }
            this.currentRenderer?.render();
        }
    }
};
SettingsEditorContribution = __decorate([
    __param(1, IInstantiationService),
    __param(2, IPreferencesService),
    __param(3, IWorkspaceContextService)
], SettingsEditorContribution);
export { SettingsEditorContribution };
