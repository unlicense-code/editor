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
import { Disposable } from 'vs/base/common/lifecycle';
import { ResourceMap } from 'vs/base/common/map';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { CHANGE_CELL_LANGUAGE, DETECT_CELL_LANGUAGE } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { CellKind } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
let CellStatusBarLanguagePickerProvider = class CellStatusBarLanguagePickerProvider {
    _notebookService;
    _languageService;
    viewType = '*';
    constructor(_notebookService, _languageService) {
        this._notebookService = _notebookService;
        this._languageService = _languageService;
    }
    async provideCellStatusBarItems(uri, index, _token) {
        const doc = this._notebookService.getNotebookTextModel(uri);
        const cell = doc?.cells[index];
        if (!cell) {
            return;
        }
        const languageId = cell.cellKind === CellKind.Markup ?
            'markdown' :
            (this._languageService.getLanguageIdByLanguageName(cell.language) || cell.language);
        const text = this._languageService.getLanguageName(languageId) || languageId;
        const item = {
            text,
            command: CHANGE_CELL_LANGUAGE,
            tooltip: localize('notebook.cell.status.language', "Select Cell Language Mode"),
            alignment: 2 /* CellStatusbarAlignment.Right */,
            priority: -Number.MAX_SAFE_INTEGER
        };
        return {
            items: [item]
        };
    }
};
CellStatusBarLanguagePickerProvider = __decorate([
    __param(0, INotebookService),
    __param(1, ILanguageService)
], CellStatusBarLanguagePickerProvider);
let CellStatusBarLanguageDetectionProvider = class CellStatusBarLanguageDetectionProvider {
    _notebookService;
    _notebookKernelService;
    _languageService;
    _configurationService;
    _languageDetectionService;
    _keybindingService;
    viewType = '*';
    cache = new ResourceMap();
    constructor(_notebookService, _notebookKernelService, _languageService, _configurationService, _languageDetectionService, _keybindingService) {
        this._notebookService = _notebookService;
        this._notebookKernelService = _notebookKernelService;
        this._languageService = _languageService;
        this._configurationService = _configurationService;
        this._languageDetectionService = _languageDetectionService;
        this._keybindingService = _keybindingService;
    }
    async provideCellStatusBarItems(uri, index, token) {
        const doc = this._notebookService.getNotebookTextModel(uri);
        const cell = doc?.cells[index];
        if (!cell) {
            return;
        }
        const enablementConfig = this._configurationService.getValue('workbench.editor.languageDetectionHints');
        const enabled = typeof enablementConfig === 'object' && enablementConfig?.notebookEditors;
        if (!enabled) {
            return;
        }
        const cellUri = cell.uri;
        const contentVersion = cell.textModel?.getVersionId();
        if (!contentVersion) {
            return;
        }
        const currentLanguageId = cell.cellKind === CellKind.Markup ?
            'markdown' :
            (this._languageService.getLanguageIdByLanguageName(cell.language) || cell.language);
        if (!this.cache.has(cellUri)) {
            this.cache.set(cellUri, {
                cellLanguage: currentLanguageId,
                updateTimestamp: 0,
                contentVersion: 1, // dont run for the initial contents, only on update
            });
        }
        const cached = this.cache.get(cellUri);
        if (cached.cellLanguage !== currentLanguageId || (cached.updateTimestamp < Date.now() - 1000 && cached.contentVersion !== contentVersion)) {
            cached.updateTimestamp = Date.now();
            cached.cellLanguage = currentLanguageId;
            cached.contentVersion = contentVersion;
            const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(doc);
            if (kernel) {
                const supportedLangs = [...kernel.supportedLanguages, 'markdown'];
                cached.guess = await this._languageDetectionService.detectLanguage(cell.uri, supportedLangs);
            }
        }
        const items = [];
        if (cached.guess && currentLanguageId !== cached.guess) {
            const detectedName = this._languageService.getLanguageName(cached.guess) || cached.guess;
            let tooltip = localize('notebook.cell.status.autoDetectLanguage', "Accept Detected Language: {0}", detectedName);
            const keybinding = this._keybindingService.lookupKeybinding(DETECT_CELL_LANGUAGE);
            const label = keybinding?.getLabel();
            if (label) {
                tooltip += ` (${label})`;
            }
            items.push({
                text: '$(lightbulb-autofix)',
                command: DETECT_CELL_LANGUAGE,
                tooltip,
                alignment: 2 /* CellStatusbarAlignment.Right */,
                priority: -Number.MAX_SAFE_INTEGER + 1
            });
        }
        return { items };
    }
};
CellStatusBarLanguageDetectionProvider = __decorate([
    __param(0, INotebookService),
    __param(1, INotebookKernelService),
    __param(2, ILanguageService),
    __param(3, IConfigurationService),
    __param(4, ILanguageDetectionService),
    __param(5, IKeybindingService)
], CellStatusBarLanguageDetectionProvider);
let BuiltinCellStatusBarProviders = class BuiltinCellStatusBarProviders extends Disposable {
    constructor(instantiationService, notebookCellStatusBarService) {
        super();
        const builtinProviders = [
            CellStatusBarLanguagePickerProvider,
            CellStatusBarLanguageDetectionProvider,
        ];
        builtinProviders.forEach(p => {
            this._register(notebookCellStatusBarService.registerCellStatusBarItemProvider(instantiationService.createInstance(p)));
        });
    }
};
BuiltinCellStatusBarProviders = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookCellStatusBarService)
], BuiltinCellStatusBarProviders);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(BuiltinCellStatusBarProviders, 3 /* LifecyclePhase.Restored */);
