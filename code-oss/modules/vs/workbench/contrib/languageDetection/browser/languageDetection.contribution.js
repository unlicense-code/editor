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
import { DisposableStore } from 'vs/base/common/lifecycle';
import { getCodeEditor } from 'vs/editor/browser/editorBrowser';
import { localize } from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { ILanguageDetectionService, LanguageDetectionLanguageEventSource } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { ThrottledDelayer } from 'vs/base/common/async';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { NOTEBOOK_EDITOR_EDITABLE } from 'vs/workbench/contrib/notebook/common/notebookContextKeys';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { Schemas } from 'vs/base/common/network';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
const detectLanguageCommandId = 'editor.detectLanguage';
let LanguageDetectionStatusContribution = class LanguageDetectionStatusContribution {
    _languageDetectionService;
    _statusBarService;
    _configurationService;
    _editorService;
    _languageService;
    _keybindingService;
    static _id = 'status.languageDetectionStatus';
    _disposables = new DisposableStore();
    _combinedEntry;
    _delayer = new ThrottledDelayer(1000);
    _renderDisposables = new DisposableStore();
    constructor(_languageDetectionService, _statusBarService, _configurationService, _editorService, _languageService, _keybindingService) {
        this._languageDetectionService = _languageDetectionService;
        this._statusBarService = _statusBarService;
        this._configurationService = _configurationService;
        this._editorService = _editorService;
        this._languageService = _languageService;
        this._keybindingService = _keybindingService;
        _editorService.onDidActiveEditorChange(() => this._update(true), this, this._disposables);
        this._update(false);
    }
    dispose() {
        this._disposables.dispose();
        this._delayer.dispose();
        this._combinedEntry?.dispose();
        this._renderDisposables.dispose();
    }
    _update(clear) {
        if (clear) {
            this._combinedEntry?.dispose();
            this._combinedEntry = undefined;
        }
        this._delayer.trigger(() => this._doUpdate());
    }
    async _doUpdate() {
        const editor = getCodeEditor(this._editorService.activeTextEditorControl);
        this._renderDisposables.clear();
        // update when editor language changes
        editor?.onDidChangeModelLanguage(() => this._update(true), this, this._renderDisposables);
        editor?.onDidChangeModelContent(() => this._update(false), this, this._renderDisposables);
        const editorModel = editor?.getModel();
        const editorUri = editorModel?.uri;
        const existingId = editorModel?.getLanguageId();
        const enablementConfig = this._configurationService.getValue('workbench.editor.languageDetectionHints');
        const enabled = typeof enablementConfig === 'object' && enablementConfig?.untitledEditors;
        const disableLightbulb = !enabled || editorUri?.scheme !== Schemas.untitled || !existingId;
        if (disableLightbulb || !editorUri) {
            this._combinedEntry?.dispose();
            this._combinedEntry = undefined;
        }
        else {
            const lang = await this._languageDetectionService.detectLanguage(editorUri);
            const skip = { 'jsonc': 'json' };
            const existing = editorModel.getLanguageId();
            if (lang && lang !== existing && skip[existing] !== lang) {
                const detectedName = this._languageService.getLanguageName(lang) || lang;
                let tooltip = localize('status.autoDetectLanguage', "Accept Detected Language: {0}", detectedName);
                const keybinding = this._keybindingService.lookupKeybinding(detectLanguageCommandId);
                const label = keybinding?.getLabel();
                if (label) {
                    tooltip += ` (${label})`;
                }
                const props = {
                    name: localize('langDetection.name', "Language Detection"),
                    ariaLabel: localize('langDetection.aria', "Change to Detected Language: {0}", lang),
                    tooltip,
                    command: detectLanguageCommandId,
                    text: '$(lightbulb-autofix)',
                };
                if (!this._combinedEntry) {
                    this._combinedEntry = this._statusBarService.addEntry(props, LanguageDetectionStatusContribution._id, 1 /* StatusbarAlignment.RIGHT */, { id: 'status.editor.mode', alignment: 1 /* StatusbarAlignment.RIGHT */, compact: true });
                }
                else {
                    this._combinedEntry.update(props);
                }
            }
            else {
                this._combinedEntry?.dispose();
                this._combinedEntry = undefined;
            }
        }
    }
};
LanguageDetectionStatusContribution = __decorate([
    __param(0, ILanguageDetectionService),
    __param(1, IStatusbarService),
    __param(2, IConfigurationService),
    __param(3, IEditorService),
    __param(4, ILanguageService),
    __param(5, IKeybindingService)
], LanguageDetectionStatusContribution);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LanguageDetectionStatusContribution, 3 /* LifecyclePhase.Restored */);
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: detectLanguageCommandId,
            title: { value: localize('detectlang', 'Detect Language from Content'), original: 'Detect Language from Content' },
            f1: true,
            precondition: ContextKeyExpr.and(NOTEBOOK_EDITOR_EDITABLE.toNegated(), EditorContextKeys.editorTextFocus),
            keybinding: { primary: 34 /* KeyCode.KeyD */ | 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ }
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const languageDetectionService = accessor.get(ILanguageDetectionService);
        const editor = getCodeEditor(editorService.activeTextEditorControl);
        const notificationService = accessor.get(INotificationService);
        const editorUri = editor?.getModel()?.uri;
        if (editorUri) {
            const lang = await languageDetectionService.detectLanguage(editorUri);
            if (lang) {
                editor.getModel()?.setMode(lang, LanguageDetectionLanguageEventSource);
            }
            else {
                notificationService.warn(localize('noDetection', "Unable to detect editor language"));
            }
        }
    }
});
