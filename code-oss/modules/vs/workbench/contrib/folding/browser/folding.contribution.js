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
import Severity from 'vs/base/common/severity';
import { getCodeEditor } from 'vs/editor/browser/editorBrowser';
import { FoldingController } from 'vs/editor/contrib/folding/browser/folding';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILanguageStatusService } from 'vs/workbench/services/languageStatus/common/languageStatusService';
import * as nls from 'vs/nls';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { editorConfigurationBaseNode } from 'vs/editor/common/config/editorConfigurationSchema';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
const openSettingsCommand = 'workbench.action.openSettings';
const configureSettingsLabel = nls.localize('status.button.configure', "Configure");
const foldingMaximumRegionsSettingsId = 'editor.foldingMaximumRegions';
let FoldingLimitIndicatorContribution = class FoldingLimitIndicatorContribution extends Disposable {
    editorService;
    languageStatusService;
    constructor(editorService, languageStatusService) {
        super();
        this.editorService = editorService;
        this.languageStatusService = languageStatusService;
        let changeListener;
        let control;
        const onActiveEditorChanged = () => {
            const activeControl = editorService.activeTextEditorControl;
            if (activeControl === control) {
                return;
            }
            control = undefined;
            if (changeListener) {
                changeListener.dispose();
                changeListener = undefined;
            }
            const editor = getCodeEditor(activeControl);
            if (editor) {
                const controller = FoldingController.get(editor);
                if (controller) {
                    const info = controller.foldingLimitInfo;
                    this.updateLimitInfo(info);
                    control = activeControl;
                    changeListener = controller.onDidChangeFoldingLimit(info => {
                        this.updateLimitInfo(info);
                    });
                }
                else {
                    this.updateLimitInfo(undefined);
                }
            }
            else {
                this.updateLimitInfo(undefined);
            }
        };
        this._register(this.editorService.onDidActiveEditorChange(onActiveEditorChanged));
        onActiveEditorChanged();
    }
    _limitStatusItem;
    updateLimitInfo(info) {
        if (this._limitStatusItem) {
            this._limitStatusItem.dispose();
            this._limitStatusItem = undefined;
        }
        if (info && info.limited !== false) {
            const status = {
                id: 'foldingLimitInfo',
                selector: '*',
                name: nls.localize('foldingRangesStatusItem.name', 'Folding Status'),
                severity: Severity.Warning,
                label: nls.localize('status.limitedFoldingRanges.short', 'Folding Ranges Limited'),
                detail: nls.localize('status.limitedFoldingRanges.details', 'only {0} folding ranges shown for performance reasons', info.limited),
                command: { id: openSettingsCommand, arguments: [foldingMaximumRegionsSettingsId], title: configureSettingsLabel },
                accessibilityInfo: undefined,
                source: nls.localize('foldingRangesStatusItem.source', 'Folding'),
                busy: false
            };
            this._limitStatusItem = this.languageStatusService.addStatus(status);
        }
    }
};
FoldingLimitIndicatorContribution = __decorate([
    __param(0, IEditorService),
    __param(1, ILanguageStatusService)
], FoldingLimitIndicatorContribution);
export { FoldingLimitIndicatorContribution };
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(FoldingLimitIndicatorContribution, 3 /* LifecyclePhase.Restored */);
let DefaultFoldingRangeProvider = class DefaultFoldingRangeProvider extends Disposable {
    _extensionService;
    _configurationService;
    static configName = 'editor.defaultFoldingRangeProvider';
    static extensionIds = [];
    static extensionItemLabels = [];
    static extensionDescriptions = [];
    constructor(_extensionService, _configurationService) {
        super();
        this._extensionService = _extensionService;
        this._configurationService = _configurationService;
        this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
        this._store.add(FoldingController.setFoldingRangeProviderSelector(this._selectFoldingRangeProvider.bind(this)));
        this._updateConfigValues();
    }
    async _updateConfigValues() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        DefaultFoldingRangeProvider.extensionIds.length = 0;
        DefaultFoldingRangeProvider.extensionItemLabels.length = 0;
        DefaultFoldingRangeProvider.extensionDescriptions.length = 0;
        DefaultFoldingRangeProvider.extensionIds.push(null);
        DefaultFoldingRangeProvider.extensionItemLabels.push(nls.localize('null', 'All'));
        DefaultFoldingRangeProvider.extensionDescriptions.push(nls.localize('nullFormatterDescription', "All active folding range providers"));
        const languageExtensions = [];
        const otherExtensions = [];
        for (const extension of this._extensionService.extensions) {
            if (extension.main || extension.browser) {
                if (extension.categories?.find(cat => cat === 'Programming Languages')) {
                    languageExtensions.push(extension);
                }
                else {
                    otherExtensions.push(extension);
                }
            }
        }
        const sorter = (a, b) => a.name.localeCompare(b.name);
        for (const extension of languageExtensions.sort(sorter)) {
            DefaultFoldingRangeProvider.extensionIds.push(extension.identifier.value);
            DefaultFoldingRangeProvider.extensionItemLabels.push(extension.displayName ?? '');
            DefaultFoldingRangeProvider.extensionDescriptions.push(extension.description ?? '');
        }
        for (const extension of otherExtensions.sort(sorter)) {
            DefaultFoldingRangeProvider.extensionIds.push(extension.identifier.value);
            DefaultFoldingRangeProvider.extensionItemLabels.push(extension.displayName ?? '');
            DefaultFoldingRangeProvider.extensionDescriptions.push(extension.description ?? '');
        }
    }
    _selectFoldingRangeProvider(providers, document) {
        const value = this._configurationService.getValue(DefaultFoldingRangeProvider.configName, { overrideIdentifier: document.getLanguageId() });
        if (value) {
            return providers.filter(p => p.id === value);
        }
        return providers;
    }
};
DefaultFoldingRangeProvider = __decorate([
    __param(0, IExtensionService),
    __param(1, IConfigurationService)
], DefaultFoldingRangeProvider);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    ...editorConfigurationBaseNode,
    properties: {
        [DefaultFoldingRangeProvider.configName]: {
            description: nls.localize('formatter.default', "Defines a default folding range provider that takes precedence over all other folding range providers. Must be the identifier of an extension contributing a folding range provider."),
            type: ['string', 'null'],
            default: null,
            enum: DefaultFoldingRangeProvider.extensionIds,
            enumItemLabels: DefaultFoldingRangeProvider.extensionItemLabels,
            markdownEnumDescriptions: DefaultFoldingRangeProvider.extensionDescriptions
        }
    }
});
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(DefaultFoldingRangeProvider, 3 /* LifecyclePhase.Restored */);
