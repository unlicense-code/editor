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
import { getCodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, registerEditorAction } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import * as nls from 'vs/nls';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { formatDocumentRangesWithProvider, formatDocumentWithProvider, getRealAndSyntheticDocumentFormattersOrdered, FormattingConflicts } from 'vs/editor/contrib/format/browser/format';
import { Range } from 'vs/editor/common/core/range';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { IExtensionService, toExtension } from 'vs/workbench/services/extensions/common/extensions';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { editorConfigurationBaseNode } from 'vs/editor/common/config/editorConfigurationSchema';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { ILanguageStatusService } from 'vs/workbench/services/languageStatus/common/languageStatusService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { generateUuid } from 'vs/base/common/uuid';
let DefaultFormatter = class DefaultFormatter extends Disposable {
    _extensionService;
    _extensionEnablementService;
    _configService;
    _notificationService;
    _dialogService;
    _quickInputService;
    _languageService;
    _languageFeaturesService;
    _languageStatusService;
    _editorService;
    static configName = 'editor.defaultFormatter';
    static extensionIds = [];
    static extensionItemLabels = [];
    static extensionDescriptions = [];
    _languageStatusStore = this._store.add(new DisposableStore());
    constructor(_extensionService, _extensionEnablementService, _configService, _notificationService, _dialogService, _quickInputService, _languageService, _languageFeaturesService, _languageStatusService, _editorService) {
        super();
        this._extensionService = _extensionService;
        this._extensionEnablementService = _extensionEnablementService;
        this._configService = _configService;
        this._notificationService = _notificationService;
        this._dialogService = _dialogService;
        this._quickInputService = _quickInputService;
        this._languageService = _languageService;
        this._languageFeaturesService = _languageFeaturesService;
        this._languageStatusService = _languageStatusService;
        this._editorService = _editorService;
        this._store.add(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
        this._store.add(FormattingConflicts.setFormatterSelector((formatter, document, mode) => this._selectFormatter(formatter, document, mode)));
        this._store.add(_editorService.onDidActiveEditorChange(this._updateStatus, this));
        this._store.add(_languageFeaturesService.documentFormattingEditProvider.onDidChange(this._updateStatus, this));
        this._store.add(_languageFeaturesService.documentRangeFormattingEditProvider.onDidChange(this._updateStatus, this));
        this._store.add(_configService.onDidChangeConfiguration(e => e.affectsConfiguration(DefaultFormatter.configName) && this._updateStatus()));
        this._updateConfigValues();
    }
    async _updateConfigValues() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        let extensions = [...this._extensionService.extensions];
        extensions = extensions.sort((a, b) => {
            const boostA = a.categories?.find(cat => cat === 'Formatters' || cat === 'Programming Languages');
            const boostB = b.categories?.find(cat => cat === 'Formatters' || cat === 'Programming Languages');
            if (boostA && !boostB) {
                return -1;
            }
            else if (!boostA && boostB) {
                return 1;
            }
            else {
                return a.name.localeCompare(b.name);
            }
        });
        DefaultFormatter.extensionIds.length = 0;
        DefaultFormatter.extensionItemLabels.length = 0;
        DefaultFormatter.extensionDescriptions.length = 0;
        DefaultFormatter.extensionIds.push(null);
        DefaultFormatter.extensionItemLabels.push(nls.localize('null', 'None'));
        DefaultFormatter.extensionDescriptions.push(nls.localize('nullFormatterDescription', "None"));
        for (const extension of extensions) {
            if (extension.main || extension.browser) {
                DefaultFormatter.extensionIds.push(extension.identifier.value);
                DefaultFormatter.extensionItemLabels.push(extension.displayName ?? '');
                DefaultFormatter.extensionDescriptions.push(extension.description ?? '');
            }
        }
    }
    static _maybeQuotes(s) {
        return s.match(/\s/) ? `'${s}'` : s;
    }
    async _analyzeFormatter(formatter, document) {
        const defaultFormatterId = this._configService.getValue(DefaultFormatter.configName, {
            resource: document.uri,
            overrideIdentifier: document.getLanguageId()
        });
        if (defaultFormatterId) {
            // good -> formatter configured
            const defaultFormatter = formatter.find(formatter => ExtensionIdentifier.equals(formatter.extensionId, defaultFormatterId));
            if (defaultFormatter) {
                // formatter available
                return defaultFormatter;
            }
            // bad -> formatter gone
            const extension = await this._extensionService.getExtension(defaultFormatterId);
            if (extension && this._extensionEnablementService.isEnabled(toExtension(extension))) {
                // formatter does not target this file
                const langName = this._languageService.getLanguageName(document.getLanguageId()) || document.getLanguageId();
                const detail = nls.localize('miss', "Extension '{0}' is configured as formatter but it cannot format '{1}'-files", extension.displayName || extension.name, langName);
                return detail;
            }
        }
        else if (formatter.length === 1) {
            // ok -> nothing configured but only one formatter available
            return formatter[0];
        }
        const langName = this._languageService.getLanguageName(document.getLanguageId()) || document.getLanguageId();
        const message = !defaultFormatterId
            ? nls.localize('config.needed', "There are multiple formatters for '{0}' files. One of them should be configured as default formatter.", DefaultFormatter._maybeQuotes(langName))
            : nls.localize('config.bad', "Extension '{0}' is configured as formatter but not available. Select a different default formatter to continue.", defaultFormatterId);
        return message;
    }
    async _selectFormatter(formatter, document, mode) {
        const formatterOrMessage = await this._analyzeFormatter(formatter, document);
        if (typeof formatterOrMessage !== 'string') {
            return formatterOrMessage;
        }
        if (mode !== 2 /* FormattingMode.Silent */) {
            // running from a user action -> show modal dialog so that users configure
            // a default formatter
            const result = await this._dialogService.confirm({
                message: nls.localize('miss.1', "Configure Default Formatter"),
                detail: formatterOrMessage,
                primaryButton: nls.localize('do.config', "Configure..."),
                secondaryButton: nls.localize('cancel', "Cancel")
            });
            if (result.confirmed) {
                return this._pickAndPersistDefaultFormatter(formatter, document);
            }
        }
        else {
            // no user action -> show a silent notification and proceed
            this._notificationService.prompt(Severity.Info, formatterOrMessage, [{ label: nls.localize('do.config', "Configure..."), run: () => this._pickAndPersistDefaultFormatter(formatter, document) }], { silent: true });
        }
        return undefined;
    }
    async _pickAndPersistDefaultFormatter(formatter, document) {
        const picks = formatter.map((formatter, index) => {
            return {
                index,
                label: formatter.displayName || (formatter.extensionId ? formatter.extensionId.value : '?'),
                description: formatter.extensionId && formatter.extensionId.value
            };
        });
        const langName = this._languageService.getLanguageName(document.getLanguageId()) || document.getLanguageId();
        const pick = await this._quickInputService.pick(picks, { placeHolder: nls.localize('select', "Select a default formatter for '{0}' files", DefaultFormatter._maybeQuotes(langName)) });
        if (!pick || !formatter[pick.index].extensionId) {
            return undefined;
        }
        this._configService.updateValue(DefaultFormatter.configName, formatter[pick.index].extensionId.value, {
            resource: document.uri,
            overrideIdentifier: document.getLanguageId()
        });
        return formatter[pick.index];
    }
    // --- status item
    _updateStatus() {
        this._languageStatusStore.clear();
        const editor = getCodeEditor(this._editorService.activeTextEditorControl);
        if (!editor || !editor.hasModel()) {
            return;
        }
        const document = editor.getModel();
        const formatter = getRealAndSyntheticDocumentFormattersOrdered(this._languageFeaturesService.documentFormattingEditProvider, this._languageFeaturesService.documentRangeFormattingEditProvider, document);
        if (formatter.length === 0) {
            return;
        }
        const cts = new CancellationTokenSource();
        this._languageStatusStore.add(toDisposable(() => cts.dispose(true)));
        this._analyzeFormatter(formatter, document).then(result => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            if (typeof result !== 'string') {
                return;
            }
            const command = { id: `formatter/configure/dfl/${generateUuid()}`, title: nls.localize('do.config', "Configure...") };
            this._languageStatusStore.add(CommandsRegistry.registerCommand(command.id, () => this._pickAndPersistDefaultFormatter(formatter, document)));
            this._languageStatusStore.add(this._languageStatusService.addStatus({
                id: 'formatter.conflict',
                name: nls.localize('summary', "Formatter Conflicts"),
                selector: { language: document.getLanguageId(), pattern: document.uri.fsPath },
                severity: Severity.Error,
                label: nls.localize('formatter', "Formatting"),
                detail: result,
                busy: false,
                source: '',
                command,
                accessibilityInfo: undefined
            }));
        });
    }
};
DefaultFormatter = __decorate([
    __param(0, IExtensionService),
    __param(1, IWorkbenchExtensionEnablementService),
    __param(2, IConfigurationService),
    __param(3, INotificationService),
    __param(4, IDialogService),
    __param(5, IQuickInputService),
    __param(6, ILanguageService),
    __param(7, ILanguageFeaturesService),
    __param(8, ILanguageStatusService),
    __param(9, IEditorService)
], DefaultFormatter);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(DefaultFormatter, 3 /* LifecyclePhase.Restored */);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    ...editorConfigurationBaseNode,
    properties: {
        [DefaultFormatter.configName]: {
            description: nls.localize('formatter.default', "Defines a default formatter which takes precedence over all other formatter settings. Must be the identifier of an extension contributing a formatter."),
            type: ['string', 'null'],
            default: null,
            enum: DefaultFormatter.extensionIds,
            enumItemLabels: DefaultFormatter.extensionItemLabels,
            markdownEnumDescriptions: DefaultFormatter.extensionDescriptions
        }
    }
});
function logFormatterTelemetry(telemetryService, mode, options, pick) {
    function extKey(obj) {
        return obj.extensionId ? ExtensionIdentifier.toKey(obj.extensionId) : 'unknown';
    }
    telemetryService.publicLog2('formatterpick', {
        mode,
        extensions: options.map(extKey),
        pick: pick ? extKey(pick) : 'none'
    });
}
async function showFormatterPick(accessor, model, formatters) {
    const quickPickService = accessor.get(IQuickInputService);
    const configService = accessor.get(IConfigurationService);
    const languageService = accessor.get(ILanguageService);
    const overrides = { resource: model.uri, overrideIdentifier: model.getLanguageId() };
    const defaultFormatter = configService.getValue(DefaultFormatter.configName, overrides);
    let defaultFormatterPick;
    const picks = formatters.map((provider, index) => {
        const isDefault = ExtensionIdentifier.equals(provider.extensionId, defaultFormatter);
        const pick = {
            index,
            label: provider.displayName || '',
            description: isDefault ? nls.localize('def', "(default)") : undefined,
        };
        if (isDefault) {
            // autofocus default pick
            defaultFormatterPick = pick;
        }
        return pick;
    });
    const configurePick = {
        label: nls.localize('config', "Configure Default Formatter...")
    };
    const pick = await quickPickService.pick([...picks, { type: 'separator' }, configurePick], {
        placeHolder: nls.localize('format.placeHolder', "Select a formatter"),
        activeItem: defaultFormatterPick
    });
    if (!pick) {
        // dismissed
        return undefined;
    }
    else if (pick === configurePick) {
        // config default
        const langName = languageService.getLanguageName(model.getLanguageId()) || model.getLanguageId();
        const pick = await quickPickService.pick(picks, { placeHolder: nls.localize('select', "Select a default formatter for '{0}' files", DefaultFormatter._maybeQuotes(langName)) });
        if (pick && formatters[pick.index].extensionId) {
            configService.updateValue(DefaultFormatter.configName, formatters[pick.index].extensionId.value, overrides);
        }
        return undefined;
    }
    else {
        // picked one
        return pick.index;
    }
}
registerEditorAction(class FormatDocumentMultipleAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.formatDocument.multiple',
            label: nls.localize('formatDocument.label.multiple', "Format Document With..."),
            alias: 'Format Document...',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasMultipleDocumentFormattingProvider),
            contextMenuOpts: {
                group: '1_modification',
                order: 1.3
            }
        });
    }
    async run(accessor, editor, args) {
        if (!editor.hasModel()) {
            return;
        }
        const instaService = accessor.get(IInstantiationService);
        const telemetryService = accessor.get(ITelemetryService);
        const languageFeaturesService = accessor.get(ILanguageFeaturesService);
        const model = editor.getModel();
        const provider = getRealAndSyntheticDocumentFormattersOrdered(languageFeaturesService.documentFormattingEditProvider, languageFeaturesService.documentRangeFormattingEditProvider, model);
        const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
        if (typeof pick === 'number') {
            await instaService.invokeFunction(formatDocumentWithProvider, provider[pick], editor, 1 /* FormattingMode.Explicit */, CancellationToken.None);
        }
        logFormatterTelemetry(telemetryService, 'document', provider, typeof pick === 'number' && provider[pick] || undefined);
    }
});
registerEditorAction(class FormatSelectionMultipleAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.formatSelection.multiple',
            label: nls.localize('formatSelection.label.multiple', "Format Selection With..."),
            alias: 'Format Code...',
            precondition: ContextKeyExpr.and(ContextKeyExpr.and(EditorContextKeys.writable), EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider),
            contextMenuOpts: {
                when: ContextKeyExpr.and(EditorContextKeys.hasNonEmptySelection),
                group: '1_modification',
                order: 1.31
            }
        });
    }
    async run(accessor, editor) {
        if (!editor.hasModel()) {
            return;
        }
        const instaService = accessor.get(IInstantiationService);
        const languageFeaturesService = accessor.get(ILanguageFeaturesService);
        const telemetryService = accessor.get(ITelemetryService);
        const model = editor.getModel();
        let range = editor.getSelection();
        if (range.isEmpty()) {
            range = new Range(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber));
        }
        const provider = languageFeaturesService.documentRangeFormattingEditProvider.ordered(model);
        const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
        if (typeof pick === 'number') {
            await instaService.invokeFunction(formatDocumentRangesWithProvider, provider[pick], editor, range, CancellationToken.None);
        }
        logFormatterTelemetry(telemetryService, 'range', provider, typeof pick === 'number' && provider[pick] || undefined);
    }
});
