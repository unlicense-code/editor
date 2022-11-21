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
import 'vs/css!./media/extensionActions';
import { localize } from 'vs/nls';
import { Action, Separator, SubmenuAction } from 'vs/base/common/actions';
import { Delayer, Promises, Throttler } from 'vs/base/common/async';
import * as DOM from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';
import * as json from 'vs/base/common/json';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { disposeIfDisposable } from 'vs/base/common/lifecycle';
import { IExtensionsWorkbenchService, VIEWLET_ID, TOGGLE_IGNORE_EXTENSION_ACTION_ID, SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID, THEME_ACTIONS_GROUP, INSTALL_ACTIONS_GROUP } from 'vs/workbench/contrib/extensions/common/extensions';
import { ExtensionsConfigurationInitialContent } from 'vs/workbench/contrib/extensions/common/extensionsFileTemplate';
import { IExtensionGalleryService, TargetPlatformToString, ExtensionManagementErrorCode, isTargetPlatformCompatible } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService, IExtensionManagementServerService, IWorkbenchExtensionManagementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService } from 'vs/workbench/services/extensionRecommendations/common/extensionRecommendations';
import { areSameExtensions, getExtensionId } from 'vs/platform/extensionManagement/common/extensionManagementUtil';
import { ExtensionIdentifier, isLanguagePackExtension, getWorkspaceSupportTypeMessage } from 'vs/platform/extensions/common/extensions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IExtensionService, toExtension, toExtensionDescription } from 'vs/workbench/services/extensions/common/extensions';
import { URI } from 'vs/base/common/uri';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { registerThemingParticipant, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { buttonBackground, buttonForeground, buttonHoverBackground, registerColor, editorWarningForeground, editorInfoForeground, editorErrorForeground, buttonSeparator } from 'vs/platform/theme/common/colorRegistry';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { MenuId, IMenuService } from 'vs/platform/actions/common/actions';
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from 'vs/workbench/browser/actions/workspaceCommands';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { CancellationToken } from 'vs/base/common/cancellation';
import { alert } from 'vs/base/browser/ui/aria/aria';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { ILabelService } from 'vs/platform/label/common/label';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IProductService } from 'vs/platform/product/common/productService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { EXTENSIONS_CONFIG } from 'vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig';
import { getErrorMessage, isCancellationError } from 'vs/base/common/errors';
import { IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { ActionWithDropdownActionViewItem } from 'vs/base/browser/ui/dropdown/dropdownActionViewItem';
import { ILogService } from 'vs/platform/log/common/log';
import * as Constants from 'vs/workbench/contrib/logs/common/logConstants';
import { errorIcon, infoIcon, manageExtensionIcon, preReleaseIcon, syncEnabledIcon, syncIgnoredIcon, trustIcon, warningIcon } from 'vs/workbench/contrib/extensions/browser/extensionsIcons';
import { isIOS, isWeb, language } from 'vs/base/common/platform';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { isVirtualWorkspace } from 'vs/platform/workspace/common/virtualWorkspace';
import { escapeMarkdownSyntaxTokens, MarkdownString } from 'vs/base/common/htmlContent';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { flatten } from 'vs/base/common/arrays';
import { fromNow } from 'vs/base/common/date';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
import { ILocaleService } from 'vs/workbench/contrib/localization/common/locale';
let PromptExtensionInstallFailureAction = class PromptExtensionInstallFailureAction extends Action {
    extension;
    version;
    installOperation;
    installOptions;
    error;
    productService;
    openerService;
    notificationService;
    dialogService;
    commandService;
    logService;
    extensionManagementServerService;
    instantiationService;
    constructor(extension, version, installOperation, installOptions, error, productService, openerService, notificationService, dialogService, commandService, logService, extensionManagementServerService, instantiationService) {
        super('extension.promptExtensionInstallFailure');
        this.extension = extension;
        this.version = version;
        this.installOperation = installOperation;
        this.installOptions = installOptions;
        this.error = error;
        this.productService = productService;
        this.openerService = openerService;
        this.notificationService = notificationService;
        this.dialogService = dialogService;
        this.commandService = commandService;
        this.logService = logService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.instantiationService = instantiationService;
    }
    async run() {
        if (isCancellationError(this.error)) {
            return;
        }
        this.logService.error(this.error);
        if (this.error.name === ExtensionManagementErrorCode.Unsupported) {
            const productName = isWeb ? localize('VS Code for Web', "{0} for the Web", this.productService.nameLong) : this.productService.nameLong;
            const message = localize('cannot be installed', "The '{0}' extension is not available in {1}. Click 'More Information' to learn more.", this.extension.displayName || this.extension.identifier.id, productName);
            const result = await this.dialogService.show(Severity.Info, message, [localize('close', "Close"), localize('more information', "More Information")], { cancelId: 0 });
            if (result.choice === 1) {
                this.openerService.open(isWeb ? URI.parse('https://aka.ms/vscode-web-extensions-guide') : URI.parse('https://aka.ms/vscode-remote'));
            }
            return;
        }
        if ([ExtensionManagementErrorCode.Incompatible, ExtensionManagementErrorCode.IncompatibleTargetPlatform, ExtensionManagementErrorCode.Malicious, ExtensionManagementErrorCode.ReleaseVersionNotFound, ExtensionManagementErrorCode.Deprecated].includes(this.error.name)) {
            await this.dialogService.show(Severity.Info, getErrorMessage(this.error));
            return;
        }
        let operationMessage = this.installOperation === 3 /* InstallOperation.Update */ ? localize('update operation', "Error while updating '{0}' extension.", this.extension.displayName || this.extension.identifier.id)
            : localize('install operation', "Error while installing '{0}' extension.", this.extension.displayName || this.extension.identifier.id);
        let additionalMessage;
        const promptChoices = [];
        if (ExtensionManagementErrorCode.IncompatiblePreRelease === this.error.name) {
            operationMessage = getErrorMessage(this.error);
            additionalMessage = localize('install release version message', "Would you like to install the release version?");
            promptChoices.push({
                label: localize('install release version', "Install Release Version"),
                run: () => {
                    const installAction = this.installOptions?.isMachineScoped ? this.instantiationService.createInstance(InstallAction, !!this.installOptions.installPreReleaseVersion) : this.instantiationService.createInstance(InstallAndSyncAction, !!this.installOptions?.installPreReleaseVersion);
                    installAction.extension = this.extension;
                    return installAction.run();
                }
            });
        }
        else if (this.extension.gallery && this.productService.extensionsGallery && (this.extensionManagementServerService.localExtensionManagementServer || this.extensionManagementServerService.remoteExtensionManagementServer) && !isIOS) {
            additionalMessage = localize('check logs', "Please check the [log]({0}) for more details.", `command:${Constants.showWindowLogActionId}`);
            promptChoices.push({
                label: localize('download', "Try Downloading Manually..."),
                run: () => this.openerService.open(URI.parse(`${this.productService.extensionsGallery.serviceUrl}/publishers/${this.extension.publisher}/vsextensions/${this.extension.name}/${this.version}/vspackage`)).then(() => {
                    this.notificationService.prompt(Severity.Info, localize('install vsix', 'Once downloaded, please manually install the downloaded VSIX of \'{0}\'.', this.extension.identifier.id), [{
                            label: localize('installVSIX', "Install from VSIX..."),
                            run: () => this.commandService.executeCommand(SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID)
                        }]);
                })
            });
        }
        const message = `${operationMessage}${additionalMessage ? ` ${additionalMessage}` : ''}`;
        this.notificationService.prompt(Severity.Error, message, promptChoices);
    }
};
PromptExtensionInstallFailureAction = __decorate([
    __param(5, IProductService),
    __param(6, IOpenerService),
    __param(7, INotificationService),
    __param(8, IDialogService),
    __param(9, ICommandService),
    __param(10, ILogService),
    __param(11, IExtensionManagementServerService),
    __param(12, IInstantiationService)
], PromptExtensionInstallFailureAction);
export { PromptExtensionInstallFailureAction };
export class ExtensionAction extends Action {
    static EXTENSION_ACTION_CLASS = 'extension-action';
    static TEXT_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} text`;
    static LABEL_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} label`;
    static ICON_ACTION_CLASS = `${ExtensionAction.EXTENSION_ACTION_CLASS} icon`;
    _extension = null;
    get extension() { return this._extension; }
    set extension(extension) { this._extension = extension; this.update(); }
}
export class ActionWithDropDownAction extends ExtensionAction {
    actionsGroups;
    action;
    _menuActions = [];
    get menuActions() { return [...this._menuActions]; }
    get extension() {
        return super.extension;
    }
    set extension(extension) {
        this.extensionActions.forEach(a => a.extension = extension);
        super.extension = extension;
    }
    extensionActions;
    constructor(id, label, actionsGroups) {
        super(id, label);
        this.actionsGroups = actionsGroups;
        this.extensionActions = flatten(actionsGroups);
        this.update();
        this._register(Event.any(...this.extensionActions.map(a => a.onDidChange))(() => this.update(true)));
        this.extensionActions.forEach(a => this._register(a));
    }
    update(donotUpdateActions) {
        if (!donotUpdateActions) {
            this.extensionActions.forEach(a => a.update());
        }
        const enabledActionsGroups = this.actionsGroups.map(actionsGroup => actionsGroup.filter(a => a.enabled));
        let actions = [];
        for (const enabledActions of enabledActionsGroups) {
            if (enabledActions.length) {
                actions = [...actions, ...enabledActions, new Separator()];
            }
        }
        actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
        this.action = actions[0];
        this._menuActions = actions.length > 1 ? actions : [];
        this.enabled = !!this.action;
        if (this.action) {
            this.label = this.getLabel(this.action);
            this.tooltip = this.action.tooltip;
        }
        let clazz = (this.action || this.extensionActions[0])?.class || '';
        clazz = clazz ? `${clazz} action-dropdown` : 'action-dropdown';
        if (this._menuActions.length === 0) {
            clazz += ' action-dropdown';
        }
        this.class = clazz;
    }
    run() {
        const enabledActions = this.extensionActions.filter(a => a.enabled);
        return enabledActions[0].run();
    }
    getLabel(action) {
        return action.label;
    }
}
let AbstractInstallAction = class AbstractInstallAction extends ExtensionAction {
    installPreReleaseVersion;
    extensionsWorkbenchService;
    instantiationService;
    runtimeExtensionService;
    workbenchThemeService;
    labelService;
    dialogService;
    preferencesService;
    static Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`;
    _manifest = null;
    set manifest(manifest) {
        this._manifest = manifest;
        this.updateLabel();
    }
    updateThrottler = new Throttler();
    constructor(id, installPreReleaseVersion, cssClass, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService) {
        super(id, localize('install', "Install"), cssClass, false);
        this.installPreReleaseVersion = installPreReleaseVersion;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.instantiationService = instantiationService;
        this.runtimeExtensionService = runtimeExtensionService;
        this.workbenchThemeService = workbenchThemeService;
        this.labelService = labelService;
        this.dialogService = dialogService;
        this.preferencesService = preferencesService;
        this.update();
        this._register(this.labelService.onDidChangeFormatters(() => this.updateLabel(), this));
    }
    update() {
        this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
    }
    async computeAndUpdateEnablement() {
        this.enabled = false;
        if (!this.extension) {
            return;
        }
        if (this.extension.isBuiltin) {
            return;
        }
        if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
            return;
        }
        if (this.extension.state === 3 /* ExtensionState.Uninstalled */ && await this.extensionsWorkbenchService.canInstall(this.extension)) {
            this.enabled = this.installPreReleaseVersion ? this.extension.hasPreReleaseVersion : this.extension.hasReleaseVersion;
            this.updateLabel();
        }
    }
    async run() {
        if (!this.extension) {
            return;
        }
        if (this.extension.deprecationInfo) {
            let detail = localize('deprecated message', "This extension is deprecated as it is no longer being maintained.");
            let action = async () => undefined;
            const buttons = [
                localize('install anyway', "Install Anyway"),
                localize('cancel', "Cancel"),
            ];
            if (this.extension.deprecationInfo.extension) {
                detail = localize('deprecated with alternate extension message', "This extension is deprecated. Use the {0} extension instead.", this.extension.deprecationInfo.extension.displayName);
                buttons.splice(1, 0, localize('Show alternate extension', "Open {0}", this.extension.deprecationInfo.extension.displayName));
                const alternateExtension = this.extension.deprecationInfo.extension;
                action = () => this.extensionsWorkbenchService.getExtensions([{ id: alternateExtension.id, preRelease: alternateExtension.preRelease }], CancellationToken.None)
                    .then(([extension]) => this.extensionsWorkbenchService.open(extension));
            }
            else if (this.extension.deprecationInfo.settings) {
                detail = localize('deprecated with alternate settings message', "This extension is deprecated as this functionality is now built-in to VS Code.");
                buttons.splice(1, 0, localize('configure in settings', "Configure Settings"));
                const settings = this.extension.deprecationInfo.settings;
                action = () => this.preferencesService.openSettings({ query: settings.map(setting => `@id:${setting}`).join(' ') });
            }
            const result = await this.dialogService.show(Severity.Warning, localize('install confirmation', "Are you sure you want to install '{0}'?", this.extension.displayName), buttons, { detail, cancelId: buttons.length - 1 });
            if (result.choice === 1) {
                return action();
            }
            if (result.choice === 2) {
                return;
            }
        }
        this.extensionsWorkbenchService.open(this.extension, { showPreReleaseVersion: this.installPreReleaseVersion });
        alert(localize('installExtensionStart', "Installing extension {0} started. An editor is now open with more details on this extension", this.extension.displayName));
        const extension = await this.install(this.extension);
        if (extension?.local) {
            alert(localize('installExtensionComplete', "Installing extension {0} is completed.", this.extension.displayName));
            const runningExtension = await this.getRunningExtension(extension.local);
            if (runningExtension && !(runningExtension.activationEvents && runningExtension.activationEvents.some(activationEent => activationEent.startsWith('onLanguage')))) {
                const action = await this.getThemeAction(extension);
                if (action) {
                    action.extension = extension;
                    try {
                        return action.run({ showCurrentTheme: true, ignoreFocusLost: true });
                    }
                    finally {
                        action.dispose();
                    }
                }
            }
        }
    }
    async getThemeAction(extension) {
        const colorThemes = await this.workbenchThemeService.getColorThemes();
        if (colorThemes.some(theme => isThemeFromExtension(theme, extension))) {
            return this.instantiationService.createInstance(SetColorThemeAction);
        }
        const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
        if (fileIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
            return this.instantiationService.createInstance(SetFileIconThemeAction);
        }
        const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
        if (productIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
            return this.instantiationService.createInstance(SetProductIconThemeAction);
        }
        return undefined;
    }
    async install(extension) {
        const installOptions = this.getInstallOptions();
        try {
            return await this.extensionsWorkbenchService.install(extension, installOptions);
        }
        catch (error) {
            await this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* InstallOperation.Install */, installOptions, error).run();
            return undefined;
        }
    }
    async getRunningExtension(extension) {
        const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
        if (runningExtension) {
            return runningExtension;
        }
        if (this.runtimeExtensionService.canAddExtension(toExtensionDescription(extension))) {
            return new Promise((c, e) => {
                const disposable = this.runtimeExtensionService.onDidChangeExtensions(async () => {
                    const runningExtension = await this.runtimeExtensionService.getExtension(extension.identifier.id);
                    if (runningExtension) {
                        disposable.dispose();
                        c(runningExtension);
                    }
                });
            });
        }
        return null;
    }
    updateLabel() {
        this.label = this.getLabel();
    }
    getLabel(primary) {
        /* install pre-release version */
        if (this.installPreReleaseVersion && this.extension?.hasPreReleaseVersion) {
            return primary ? localize('install pre-release', "Install Pre-Release") : localize('install pre-release version', "Install Pre-Release Version");
        }
        /* install released version that has a pre release version */
        if (this.extension?.hasPreReleaseVersion) {
            return primary ? localize('install', "Install") : localize('install release version', "Install Release Version");
        }
        return localize('install', "Install");
    }
    getInstallOptions() {
        return { installPreReleaseVersion: this.installPreReleaseVersion };
    }
};
AbstractInstallAction = __decorate([
    __param(3, IExtensionsWorkbenchService),
    __param(4, IInstantiationService),
    __param(5, IExtensionService),
    __param(6, IWorkbenchThemeService),
    __param(7, ILabelService),
    __param(8, IDialogService),
    __param(9, IPreferencesService)
], AbstractInstallAction);
export { AbstractInstallAction };
let InstallAction = class InstallAction extends AbstractInstallAction {
    extensionManagementServerService;
    workbenchExtensioManagementService;
    userDataSyncEnablementService;
    constructor(installPreReleaseVersion, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService, extensionManagementServerService, workbenchExtensioManagementService, userDataSyncEnablementService) {
        super(`extensions.install`, installPreReleaseVersion, InstallAction.Class, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService);
        this.extensionManagementServerService = extensionManagementServerService;
        this.workbenchExtensioManagementService = workbenchExtensioManagementService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.updateLabel();
        this._register(labelService.onDidChangeFormatters(() => this.updateLabel(), this));
        this._register(Event.any(userDataSyncEnablementService.onDidChangeEnablement, Event.filter(userDataSyncEnablementService.onDidChangeResourceEnablement, e => e[0] === "extensions" /* SyncResource.Extensions */))(() => this.update()));
    }
    getLabel(primary) {
        const baseLabel = super.getLabel(primary);
        const donotSyncLabel = localize('do no sync', "Do not sync");
        const isMachineScoped = this.getInstallOptions().isMachineScoped;
        // When remote connection exists
        if (this._manifest && this.extensionManagementServerService.remoteExtensionManagementServer) {
            const server = this.workbenchExtensioManagementService.getExtensionManagementServerToInstall(this._manifest);
            if (server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                const host = this.extensionManagementServerService.remoteExtensionManagementServer.label;
                return isMachineScoped
                    ? localize({
                        key: 'install extension in remote and do not sync',
                        comment: [
                            'First placeholder is install action label.',
                            'Second placeholder is the name of the action to install an extension in remote server and do not sync it. Placeholder is for the name of remote server.',
                            'Third placeholder is do not sync label.',
                        ]
                    }, "{0} in {1} ({2})", baseLabel, host, donotSyncLabel)
                    : localize({
                        key: 'install extension in remote',
                        comment: [
                            'First placeholder is install action label.',
                            'Second placeholder is the name of the action to install an extension in remote server and do not sync it. Placeholder is for the name of remote server.',
                        ]
                    }, "{0} in {1}", baseLabel, host);
            }
            return isMachineScoped ?
                localize('install extension locally and do not sync', "{0} Locally ({1})", baseLabel, donotSyncLabel) : localize('install extension locally', "{0} Locally", baseLabel);
        }
        return isMachineScoped ? `${baseLabel} (${donotSyncLabel})` : baseLabel;
    }
    getInstallOptions() {
        return { ...super.getInstallOptions(), isMachineScoped: this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */) };
    }
};
InstallAction = __decorate([
    __param(1, IExtensionsWorkbenchService),
    __param(2, IInstantiationService),
    __param(3, IExtensionService),
    __param(4, IWorkbenchThemeService),
    __param(5, ILabelService),
    __param(6, IDialogService),
    __param(7, IPreferencesService),
    __param(8, IExtensionManagementServerService),
    __param(9, IWorkbenchExtensionManagementService),
    __param(10, IUserDataSyncEnablementService)
], InstallAction);
export { InstallAction };
let InstallAndSyncAction = class InstallAndSyncAction extends AbstractInstallAction {
    userDataSyncEnablementService;
    constructor(installPreReleaseVersion, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService, productService, userDataSyncEnablementService) {
        super('extensions.installAndSync', installPreReleaseVersion, AbstractInstallAction.Class, extensionsWorkbenchService, instantiationService, runtimeExtensionService, workbenchThemeService, labelService, dialogService, preferencesService);
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.tooltip = localize({ key: 'install everywhere tooltip', comment: ['Placeholder is the name of the product. Eg: Visual Studio Code or Visual Studio Code - Insiders'] }, "Install this extension in all your synced {0} instances", productService.nameLong);
        this._register(Event.any(userDataSyncEnablementService.onDidChangeEnablement, Event.filter(userDataSyncEnablementService.onDidChangeResourceEnablement, e => e[0] === "extensions" /* SyncResource.Extensions */))(() => this.update()));
    }
    async computeAndUpdateEnablement() {
        await super.computeAndUpdateEnablement();
        if (this.enabled) {
            this.enabled = this.userDataSyncEnablementService.isEnabled() && this.userDataSyncEnablementService.isResourceEnabled("extensions" /* SyncResource.Extensions */);
        }
    }
    getInstallOptions() {
        return { ...super.getInstallOptions(), isMachineScoped: false };
    }
};
InstallAndSyncAction = __decorate([
    __param(1, IExtensionsWorkbenchService),
    __param(2, IInstantiationService),
    __param(3, IExtensionService),
    __param(4, IWorkbenchThemeService),
    __param(5, ILabelService),
    __param(6, IDialogService),
    __param(7, IPreferencesService),
    __param(8, IProductService),
    __param(9, IUserDataSyncEnablementService)
], InstallAndSyncAction);
export { InstallAndSyncAction };
let InstallDropdownAction = class InstallDropdownAction extends ActionWithDropDownAction {
    set manifest(manifest) {
        this.extensionActions.forEach(a => a.manifest = manifest);
        this.update();
    }
    constructor(instantiationService, extensionsWorkbenchService) {
        super(`extensions.installActions`, '', [
            [
                instantiationService.createInstance(InstallAndSyncAction, extensionsWorkbenchService.preferPreReleases),
                instantiationService.createInstance(InstallAndSyncAction, !extensionsWorkbenchService.preferPreReleases),
            ],
            [
                instantiationService.createInstance(InstallAction, extensionsWorkbenchService.preferPreReleases),
                instantiationService.createInstance(InstallAction, !extensionsWorkbenchService.preferPreReleases),
            ]
        ]);
    }
    getLabel(action) {
        return action.getLabel(true);
    }
};
InstallDropdownAction = __decorate([
    __param(0, IInstantiationService),
    __param(1, IExtensionsWorkbenchService)
], InstallDropdownAction);
export { InstallDropdownAction };
export class InstallingLabelAction extends ExtensionAction {
    static LABEL = localize('installing', "Installing");
    static CLASS = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`;
    constructor() {
        super('extension.installing', InstallingLabelAction.LABEL, InstallingLabelAction.CLASS, false);
    }
    update() {
        this.class = `${InstallingLabelAction.CLASS}${this.extension && this.extension.state === 0 /* ExtensionState.Installing */ ? '' : ' hide'}`;
    }
}
let InstallInOtherServerAction = class InstallInOtherServerAction extends ExtensionAction {
    server;
    canInstallAnyWhere;
    fileService;
    logService;
    extensionsWorkbenchService;
    extensionManagementServerService;
    extensionManifestPropertiesService;
    extensionGalleryService;
    static INSTALL_LABEL = localize('install', "Install");
    static INSTALLING_LABEL = localize('installing', "Installing");
    static Class = `${ExtensionAction.LABEL_ACTION_CLASS} prominent install`;
    static InstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} install installing`;
    updateWhenCounterExtensionChanges = true;
    constructor(id, server, canInstallAnyWhere, fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService) {
        super(id, InstallInOtherServerAction.INSTALL_LABEL, InstallInOtherServerAction.Class, false);
        this.server = server;
        this.canInstallAnyWhere = canInstallAnyWhere;
        this.fileService = fileService;
        this.logService = logService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.extensionGalleryService = extensionGalleryService;
        this.update();
    }
    update() {
        this.enabled = false;
        this.class = InstallInOtherServerAction.Class;
        if (this.canInstall()) {
            const extensionInOtherServer = this.extensionsWorkbenchService.installed.filter(e => areSameExtensions(e.identifier, this.extension.identifier) && e.server === this.server)[0];
            if (extensionInOtherServer) {
                // Getting installed in other server
                if (extensionInOtherServer.state === 0 /* ExtensionState.Installing */ && !extensionInOtherServer.local) {
                    this.enabled = true;
                    this.label = InstallInOtherServerAction.INSTALLING_LABEL;
                    this.class = InstallInOtherServerAction.InstallingClass;
                }
            }
            else {
                // Not installed in other server
                this.enabled = true;
                this.label = this.getInstallLabel();
            }
        }
    }
    canInstall() {
        // Disable if extension is not installed or not an user extension
        if (!this.extension
            || !this.server
            || !this.extension.local
            || this.extension.state !== 1 /* ExtensionState.Installed */
            || this.extension.type !== 1 /* ExtensionType.User */
            || this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */ || this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ || this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
            return false;
        }
        if (isLanguagePackExtension(this.extension.local.manifest)) {
            return true;
        }
        // Prefers to run on UI
        if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
            return true;
        }
        // Prefers to run on Workspace
        if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
            return true;
        }
        // Prefers to run on Web
        if (this.server === this.extensionManagementServerService.webExtensionManagementServer && this.extensionManifestPropertiesService.prefersExecuteOnWeb(this.extension.local.manifest)) {
            return true;
        }
        if (this.canInstallAnyWhere) {
            // Can run on UI
            if (this.server === this.extensionManagementServerService.localExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnUI(this.extension.local.manifest)) {
                return true;
            }
            // Can run on Workspace
            if (this.server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManifestPropertiesService.canExecuteOnWorkspace(this.extension.local.manifest)) {
                return true;
            }
        }
        return false;
    }
    async run() {
        if (!this.extension?.local) {
            return;
        }
        if (!this.extension?.server) {
            return;
        }
        if (!this.server) {
            return;
        }
        this.extensionsWorkbenchService.open(this.extension);
        alert(localize('installExtensionStart', "Installing extension {0} started. An editor is now open with more details on this extension", this.extension.displayName));
        const gallery = this.extension.gallery ?? (this.extensionGalleryService.isEnabled() && (await this.extensionGalleryService.getExtensions([this.extension.identifier], CancellationToken.None))[0]);
        if (gallery) {
            await this.server.extensionManagementService.installFromGallery(gallery, { installPreReleaseVersion: this.extension.local.preRelease });
            return;
        }
        const targetPlatform = await this.server.extensionManagementService.getTargetPlatform();
        if (!isTargetPlatformCompatible(this.extension.local.targetPlatform, [this.extension.local.targetPlatform], targetPlatform)) {
            throw new Error(localize('incompatible', "Can't install '{0}' extension because it is not compatible.", this.extension.identifier.id));
        }
        const vsix = await this.extension.server.extensionManagementService.zip(this.extension.local);
        try {
            await this.server.extensionManagementService.install(vsix);
        }
        finally {
            try {
                await this.fileService.del(vsix);
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    }
};
InstallInOtherServerAction = __decorate([
    __param(3, IFileService),
    __param(4, ILogService),
    __param(5, IExtensionsWorkbenchService),
    __param(6, IExtensionManagementServerService),
    __param(7, IExtensionManifestPropertiesService),
    __param(8, IExtensionGalleryService)
], InstallInOtherServerAction);
export { InstallInOtherServerAction };
let RemoteInstallAction = class RemoteInstallAction extends InstallInOtherServerAction {
    constructor(canInstallAnyWhere, fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService) {
        super(`extensions.remoteinstall`, extensionManagementServerService.remoteExtensionManagementServer, canInstallAnyWhere, fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService);
    }
    getInstallLabel() {
        return this.extensionManagementServerService.remoteExtensionManagementServer
            ? localize({ key: 'install in remote', comment: ['This is the name of the action to install an extension in remote server. Placeholder is for the name of remote server.'] }, "Install in {0}", this.extensionManagementServerService.remoteExtensionManagementServer.label)
            : InstallInOtherServerAction.INSTALL_LABEL;
    }
};
RemoteInstallAction = __decorate([
    __param(1, IFileService),
    __param(2, ILogService),
    __param(3, IExtensionsWorkbenchService),
    __param(4, IExtensionManagementServerService),
    __param(5, IExtensionManifestPropertiesService),
    __param(6, IExtensionGalleryService)
], RemoteInstallAction);
export { RemoteInstallAction };
let LocalInstallAction = class LocalInstallAction extends InstallInOtherServerAction {
    constructor(fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService) {
        super(`extensions.localinstall`, extensionManagementServerService.localExtensionManagementServer, false, fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService);
    }
    getInstallLabel() {
        return localize('install locally', "Install Locally");
    }
};
LocalInstallAction = __decorate([
    __param(0, IFileService),
    __param(1, ILogService),
    __param(2, IExtensionsWorkbenchService),
    __param(3, IExtensionManagementServerService),
    __param(4, IExtensionManifestPropertiesService),
    __param(5, IExtensionGalleryService)
], LocalInstallAction);
export { LocalInstallAction };
let WebInstallAction = class WebInstallAction extends InstallInOtherServerAction {
    constructor(fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService) {
        super(`extensions.webInstall`, extensionManagementServerService.webExtensionManagementServer, false, fileService, logService, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService, extensionGalleryService);
    }
    getInstallLabel() {
        return localize('install browser', "Install in Browser");
    }
};
WebInstallAction = __decorate([
    __param(0, IFileService),
    __param(1, ILogService),
    __param(2, IExtensionsWorkbenchService),
    __param(3, IExtensionManagementServerService),
    __param(4, IExtensionManifestPropertiesService),
    __param(5, IExtensionGalleryService)
], WebInstallAction);
export { WebInstallAction };
let UninstallAction = class UninstallAction extends ExtensionAction {
    extensionsWorkbenchService;
    static UninstallLabel = localize('uninstallAction', "Uninstall");
    static UninstallingLabel = localize('Uninstalling', "Uninstalling");
    static UninstallClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall`;
    static UnInstallingClass = `${ExtensionAction.LABEL_ACTION_CLASS} uninstall uninstalling`;
    constructor(extensionsWorkbenchService) {
        super('extensions.uninstall', UninstallAction.UninstallLabel, UninstallAction.UninstallClass, false);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.update();
    }
    update() {
        if (!this.extension) {
            this.enabled = false;
            return;
        }
        const state = this.extension.state;
        if (state === 2 /* ExtensionState.Uninstalling */) {
            this.label = UninstallAction.UninstallingLabel;
            this.class = UninstallAction.UnInstallingClass;
            this.enabled = false;
            return;
        }
        this.label = UninstallAction.UninstallLabel;
        this.class = UninstallAction.UninstallClass;
        this.tooltip = UninstallAction.UninstallLabel;
        if (state !== 1 /* ExtensionState.Installed */) {
            this.enabled = false;
            return;
        }
        if (this.extension.isBuiltin) {
            this.enabled = false;
            return;
        }
        this.enabled = true;
    }
    async run() {
        if (!this.extension) {
            return;
        }
        alert(localize('uninstallExtensionStart', "Uninstalling extension {0} started.", this.extension.displayName));
        return this.extensionsWorkbenchService.uninstall(this.extension).then(() => {
            alert(localize('uninstallExtensionComplete', "Please reload Visual Studio Code to complete the uninstallation of the extension {0}.", this.extension.displayName));
        });
    }
};
UninstallAction = __decorate([
    __param(0, IExtensionsWorkbenchService)
], UninstallAction);
export { UninstallAction };
class AbstractUpdateAction extends ExtensionAction {
    extensionsWorkbenchService;
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent update`;
    static DisabledClass = `${AbstractUpdateAction.EnabledClass} disabled`;
    updateThrottler = new Throttler();
    constructor(id, label, extensionsWorkbenchService) {
        super(id, label, AbstractUpdateAction.DisabledClass, false);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.update();
    }
    update() {
        this.updateThrottler.queue(() => this.computeAndUpdateEnablement());
    }
    async computeAndUpdateEnablement() {
        this.enabled = false;
        this.class = UpdateAction.DisabledClass;
        if (!this.extension) {
            return;
        }
        if (this.extension.deprecationInfo) {
            return;
        }
        const canInstall = await this.extensionsWorkbenchService.canInstall(this.extension);
        const isInstalled = this.extension.state === 1 /* ExtensionState.Installed */;
        this.enabled = canInstall && isInstalled && this.extension.outdated;
        this.class = this.enabled ? AbstractUpdateAction.EnabledClass : AbstractUpdateAction.DisabledClass;
    }
}
let UpdateAction = class UpdateAction extends AbstractUpdateAction {
    verbose;
    extensionsWorkbenchService;
    instantiationService;
    constructor(verbose, extensionsWorkbenchService, instantiationService) {
        super(`extensions.update`, localize('update', "Update"), extensionsWorkbenchService);
        this.verbose = verbose;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.instantiationService = instantiationService;
    }
    update() {
        super.update();
        if (this.extension) {
            this.label = this.verbose ? localize('update to', "Update to v{0}", this.extension.latestVersion) : localize('update', "Update");
        }
    }
    async run() {
        if (!this.extension) {
            return;
        }
        alert(localize('updateExtensionStart', "Updating extension {0} to version {1} started.", this.extension.displayName, this.extension.latestVersion));
        return this.install(this.extension);
    }
    async install(extension) {
        try {
            await this.extensionsWorkbenchService.install(extension, extension.local?.preRelease ? { installPreReleaseVersion: true } : undefined);
            alert(localize('updateExtensionComplete', "Updating extension {0} to version {1} completed.", extension.displayName, extension.latestVersion));
        }
        catch (err) {
            this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 3 /* InstallOperation.Update */, undefined, err).run();
        }
    }
};
UpdateAction = __decorate([
    __param(1, IExtensionsWorkbenchService),
    __param(2, IInstantiationService)
], UpdateAction);
export { UpdateAction };
let SkipUpdateAction = class SkipUpdateAction extends AbstractUpdateAction {
    extensionsWorkbenchService;
    constructor(extensionsWorkbenchService) {
        super(`extensions.ignoreUpdates`, localize('ignoreUpdates', "Ignore Updates"), extensionsWorkbenchService);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
    }
    update() {
        if (!this.extension) {
            return;
        }
        if (this.extension.isBuiltin) {
            this.enabled = false;
            return;
        }
        super.update();
        this._checked = this.extensionsWorkbenchService.isExtensionIgnoresUpdates(this.extension);
    }
    async run() {
        if (!this.extension) {
            return;
        }
        alert(localize('ignoreExtensionUpdate', "Ignoring {0} updates", this.extension.displayName));
        const newIgnoresAutoUpdates = !this.extensionsWorkbenchService.isExtensionIgnoresUpdates(this.extension);
        this.extensionsWorkbenchService.setExtensionIgnoresUpdate(this.extension, newIgnoresAutoUpdates);
    }
};
SkipUpdateAction = __decorate([
    __param(0, IExtensionsWorkbenchService)
], SkipUpdateAction);
export { SkipUpdateAction };
let MigrateDeprecatedExtensionAction = class MigrateDeprecatedExtensionAction extends ExtensionAction {
    small;
    extensionsWorkbenchService;
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} prominent migrate`;
    static DisabledClass = `${MigrateDeprecatedExtensionAction.EnabledClass} disabled`;
    constructor(small, extensionsWorkbenchService) {
        super('extensionsAction.migrateDeprecatedExtension', localize('migrateExtension', "Migrate"), MigrateDeprecatedExtensionAction.DisabledClass, false);
        this.small = small;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.update();
    }
    update() {
        this.enabled = false;
        this.class = MigrateDeprecatedExtensionAction.DisabledClass;
        if (!this.extension?.local) {
            return;
        }
        if (this.extension.state !== 1 /* ExtensionState.Installed */) {
            return;
        }
        if (!this.extension.deprecationInfo?.extension) {
            return;
        }
        const id = this.extension.deprecationInfo.extension.id;
        if (this.extensionsWorkbenchService.local.some(e => areSameExtensions(e.identifier, { id }))) {
            return;
        }
        this.enabled = true;
        this.class = MigrateDeprecatedExtensionAction.EnabledClass;
        this.tooltip = localize('migrate to', "Migrate to {0}", this.extension.deprecationInfo.extension.displayName);
        this.label = this.small ? localize('migrate', "Migrate") : this.tooltip;
    }
    async run() {
        if (!this.extension?.deprecationInfo?.extension) {
            return;
        }
        const local = this.extension.local;
        await this.extensionsWorkbenchService.uninstall(this.extension);
        const [extension] = await this.extensionsWorkbenchService.getExtensions([{ id: this.extension.deprecationInfo.extension.id, preRelease: this.extension.deprecationInfo?.extension?.preRelease }], CancellationToken.None);
        await this.extensionsWorkbenchService.install(extension, { isMachineScoped: local?.isMachineScoped });
    }
};
MigrateDeprecatedExtensionAction = __decorate([
    __param(1, IExtensionsWorkbenchService)
], MigrateDeprecatedExtensionAction);
export { MigrateDeprecatedExtensionAction };
export class ExtensionActionWithDropdownActionViewItem extends ActionWithDropdownActionViewItem {
    constructor(action, options, contextMenuProvider) {
        super(null, action, options, contextMenuProvider);
    }
    render(container) {
        super.render(container);
        this.updateClass();
    }
    updateClass() {
        super.updateClass();
        if (this.element && this.dropdownMenuActionViewItem && this.dropdownMenuActionViewItem.element) {
            this.element.classList.toggle('empty', this._action.menuActions.length === 0);
            this.dropdownMenuActionViewItem.element.classList.toggle('hide', this._action.menuActions.length === 0);
        }
    }
}
let ExtensionDropDownAction = class ExtensionDropDownAction extends ExtensionAction {
    instantiationService;
    constructor(id, label, cssClass, enabled, instantiationService) {
        super(id, label, cssClass, enabled);
        this.instantiationService = instantiationService;
    }
    _actionViewItem = null;
    createActionViewItem() {
        this._actionViewItem = this.instantiationService.createInstance(DropDownMenuActionViewItem, this);
        return this._actionViewItem;
    }
    run({ actionGroups, disposeActionsOnHide }) {
        this._actionViewItem?.showMenu(actionGroups, disposeActionsOnHide);
        return Promise.resolve();
    }
};
ExtensionDropDownAction = __decorate([
    __param(4, IInstantiationService)
], ExtensionDropDownAction);
export { ExtensionDropDownAction };
let DropDownMenuActionViewItem = class DropDownMenuActionViewItem extends ActionViewItem {
    contextMenuService;
    constructor(action, contextMenuService) {
        super(null, action, { icon: true, label: true });
        this.contextMenuService = contextMenuService;
    }
    showMenu(menuActionGroups, disposeActionsOnHide) {
        if (this.element) {
            const actions = this.getActions(menuActionGroups);
            const elementPosition = DOM.getDomNodePagePosition(this.element);
            const anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
            this.contextMenuService.showContextMenu({
                getAnchor: () => anchor,
                getActions: () => actions,
                actionRunner: this.actionRunner,
                onHide: () => { if (disposeActionsOnHide) {
                    disposeIfDisposable(actions);
                } }
            });
        }
    }
    getActions(menuActionGroups) {
        let actions = [];
        for (const menuActions of menuActionGroups) {
            actions = [...actions, ...menuActions, new Separator()];
        }
        return actions.length ? actions.slice(0, actions.length - 1) : actions;
    }
};
DropDownMenuActionViewItem = __decorate([
    __param(1, IContextMenuService)
], DropDownMenuActionViewItem);
export { DropDownMenuActionViewItem };
async function getContextMenuActionsGroups(extension, contextKeyService, instantiationService) {
    return instantiationService.invokeFunction(async (accessor) => {
        const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        const languagePackService = accessor.get(ILanguagePackService);
        const menuService = accessor.get(IMenuService);
        const extensionRecommendationsService = accessor.get(IExtensionRecommendationsService);
        const extensionIgnoredRecommendationsService = accessor.get(IExtensionIgnoredRecommendationsService);
        const workbenchThemeService = accessor.get(IWorkbenchThemeService);
        const cksOverlay = [];
        if (extension) {
            cksOverlay.push(['extension', extension.identifier.id]);
            cksOverlay.push(['isBuiltinExtension', extension.isBuiltin]);
            cksOverlay.push(['extensionHasConfiguration', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.configuration]);
            cksOverlay.push(['isExtensionRecommended', !!extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]]);
            cksOverlay.push(['isExtensionWorkspaceRecommended', extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]?.reasonId === 0 /* ExtensionRecommendationReason.Workspace */]);
            cksOverlay.push(['isUserIgnoredRecommendation', extensionIgnoredRecommendationsService.globalIgnoredRecommendations.some(e => e === extension.identifier.id.toLowerCase())]);
            if (extension.state === 1 /* ExtensionState.Installed */) {
                cksOverlay.push(['extensionStatus', 'installed']);
            }
            cksOverlay.push(['installedExtensionIsPreReleaseVersion', !!extension.local?.isPreReleaseVersion]);
            cksOverlay.push(['galleryExtensionIsPreReleaseVersion', !!extension.gallery?.properties.isPreReleaseVersion]);
            cksOverlay.push(['extensionHasPreReleaseVersion', extension.hasPreReleaseVersion]);
            cksOverlay.push(['extensionHasReleaseVersion', extension.hasReleaseVersion]);
            const [colorThemes, fileIconThemes, productIconThemes] = await Promise.all([workbenchThemeService.getColorThemes(), workbenchThemeService.getFileIconThemes(), workbenchThemeService.getProductIconThemes()]);
            cksOverlay.push(['extensionHasColorThemes', colorThemes.some(theme => isThemeFromExtension(theme, extension))]);
            cksOverlay.push(['extensionHasFileIconThemes', fileIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
            cksOverlay.push(['extensionHasProductIconThemes', productIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
            cksOverlay.push(['canSetLanguage', extensionsWorkbenchService.canSetLanguage(extension)]);
            cksOverlay.push(['isActiveLanguagePackExtension', extension.gallery && language === languagePackService.getLocale(extension.gallery)]);
        }
        const menu = menuService.createMenu(MenuId.ExtensionContext, contextKeyService.createOverlay(cksOverlay));
        const actionsGroups = menu.getActions({ shouldForwardArgs: true });
        menu.dispose();
        return actionsGroups;
    });
}
function toActions(actionsGroups, instantiationService) {
    const result = [];
    for (const [, actions] of actionsGroups) {
        result.push(actions.map(action => {
            if (action instanceof SubmenuAction) {
                return action;
            }
            return instantiationService.createInstance(MenuItemExtensionAction, action);
        }));
    }
    return result;
}
export async function getContextMenuActions(extension, contextKeyService, instantiationService) {
    const actionsGroups = await getContextMenuActionsGroups(extension, contextKeyService, instantiationService);
    return toActions(actionsGroups, instantiationService);
}
let ManageExtensionAction = class ManageExtensionAction extends ExtensionDropDownAction {
    extensionService;
    contextKeyService;
    static ID = 'extensions.manage';
    static Class = `${ExtensionAction.ICON_ACTION_CLASS} manage ` + ThemeIcon.asClassName(manageExtensionIcon);
    static HideManageExtensionClass = `${ManageExtensionAction.Class} hide`;
    constructor(instantiationService, extensionService, contextKeyService) {
        super(ManageExtensionAction.ID, '', '', true, instantiationService);
        this.extensionService = extensionService;
        this.contextKeyService = contextKeyService;
        this.tooltip = localize('manage', "Manage");
        this.update();
    }
    async getActionGroups() {
        const groups = [];
        const contextMenuActionsGroups = await getContextMenuActionsGroups(this.extension, this.contextKeyService, this.instantiationService);
        const themeActions = [], installActions = [], otherActionGroups = [];
        for (const [group, actions] of contextMenuActionsGroups) {
            if (group === INSTALL_ACTIONS_GROUP) {
                installActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
            }
            else if (group === THEME_ACTIONS_GROUP) {
                themeActions.push(...toActions([[group, actions]], this.instantiationService)[0]);
            }
            else {
                otherActionGroups.push(...toActions([[group, actions]], this.instantiationService));
            }
        }
        if (themeActions.length) {
            groups.push(themeActions);
        }
        groups.push([
            this.instantiationService.createInstance(EnableGloballyAction),
            this.instantiationService.createInstance(EnableForWorkspaceAction)
        ]);
        groups.push([
            this.instantiationService.createInstance(DisableGloballyAction),
            this.instantiationService.createInstance(DisableForWorkspaceAction)
        ]);
        groups.push([
            ...(installActions.length ? installActions : []),
            this.instantiationService.createInstance(InstallAnotherVersionAction),
            this.instantiationService.createInstance(UninstallAction),
        ]);
        otherActionGroups.forEach(actions => groups.push(actions));
        groups.forEach(group => group.forEach(extensionAction => {
            if (extensionAction instanceof ExtensionAction) {
                extensionAction.extension = this.extension;
            }
        }));
        return groups;
    }
    async run() {
        await this.extensionService.whenInstalledExtensionsRegistered();
        return super.run({ actionGroups: await this.getActionGroups(), disposeActionsOnHide: true });
    }
    update() {
        this.class = ManageExtensionAction.HideManageExtensionClass;
        this.enabled = false;
        if (this.extension) {
            const state = this.extension.state;
            this.enabled = state === 1 /* ExtensionState.Installed */;
            this.class = this.enabled || state === 2 /* ExtensionState.Uninstalling */ ? ManageExtensionAction.Class : ManageExtensionAction.HideManageExtensionClass;
            this.tooltip = state === 2 /* ExtensionState.Uninstalling */ ? localize('ManageExtensionAction.uninstallingTooltip', "Uninstalling") : '';
        }
    }
};
ManageExtensionAction = __decorate([
    __param(0, IInstantiationService),
    __param(1, IExtensionService),
    __param(2, IContextKeyService)
], ManageExtensionAction);
export { ManageExtensionAction };
export class ExtensionEditorManageExtensionAction extends ExtensionDropDownAction {
    contextKeyService;
    constructor(contextKeyService, instantiationService) {
        super('extensionEditor.manageExtension', '', `${ExtensionAction.ICON_ACTION_CLASS} manage ${ThemeIcon.asClassName(manageExtensionIcon)}`, true, instantiationService);
        this.contextKeyService = contextKeyService;
        this.tooltip = localize('manage', "Manage");
    }
    update() { }
    async run() {
        const actionGroups = [];
        (await getContextMenuActions(this.extension, this.contextKeyService, this.instantiationService)).forEach(actions => actionGroups.push(actions));
        actionGroups.forEach(group => group.forEach(extensionAction => {
            if (extensionAction instanceof ExtensionAction) {
                extensionAction.extension = this.extension;
            }
        }));
        return super.run({ actionGroups, disposeActionsOnHide: true });
    }
}
let MenuItemExtensionAction = class MenuItemExtensionAction extends ExtensionAction {
    action;
    extensionsWorkbenchService;
    constructor(action, extensionsWorkbenchService) {
        super(action.id, action.label);
        this.action = action;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
    }
    update() {
        if (!this.extension) {
            return;
        }
        if (this.action.id === TOGGLE_IGNORE_EXTENSION_ACTION_ID) {
            this.checked = !this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
        }
    }
    async run() {
        if (this.extension) {
            await this.action.run(this.extension.local ? getExtensionId(this.extension.local.manifest.publisher, this.extension.local.manifest.name)
                : this.extension.gallery ? getExtensionId(this.extension.gallery.publisher, this.extension.gallery.name)
                    : this.extension.identifier.id);
        }
    }
};
MenuItemExtensionAction = __decorate([
    __param(1, IExtensionsWorkbenchService)
], MenuItemExtensionAction);
export { MenuItemExtensionAction };
let SwitchToPreReleaseVersionAction = class SwitchToPreReleaseVersionAction extends ExtensionAction {
    commandService;
    static ID = 'workbench.extensions.action.switchToPreReleaseVersion';
    static TITLE = { value: localize('switch to pre-release version', "Switch to Pre-Release Version"), original: 'Switch to  Pre-Release Version' };
    constructor(icon, commandService) {
        super(SwitchToPreReleaseVersionAction.ID, icon ? '' : SwitchToPreReleaseVersionAction.TITLE.value, `${icon ? ExtensionAction.ICON_ACTION_CLASS + ' ' + ThemeIcon.asClassName(preReleaseIcon) : ExtensionAction.LABEL_ACTION_CLASS} hide-when-disabled switch-to-prerelease`, true);
        this.commandService = commandService;
        this.tooltip = localize('switch to pre-release version tooltip', "Switch to Pre-Release version of this extension");
        this.update();
    }
    update() {
        this.enabled = !!this.extension && !this.extension.isBuiltin && !this.extension.local?.isPreReleaseVersion && this.extension.hasPreReleaseVersion && this.extension.state === 1 /* ExtensionState.Installed */;
    }
    async run() {
        if (!this.enabled) {
            return;
        }
        return this.commandService.executeCommand(SwitchToPreReleaseVersionAction.ID, this.extension?.identifier.id);
    }
};
SwitchToPreReleaseVersionAction = __decorate([
    __param(1, ICommandService)
], SwitchToPreReleaseVersionAction);
export { SwitchToPreReleaseVersionAction };
let SwitchToReleasedVersionAction = class SwitchToReleasedVersionAction extends ExtensionAction {
    commandService;
    static ID = 'workbench.extensions.action.switchToReleaseVersion';
    static TITLE = { value: localize('switch to release version', "Switch to Release Version"), original: 'Switch to Release Version' };
    constructor(icon, commandService) {
        super(SwitchToReleasedVersionAction.ID, icon ? '' : SwitchToReleasedVersionAction.TITLE.value, `${icon ? ExtensionAction.ICON_ACTION_CLASS + ' ' + ThemeIcon.asClassName(preReleaseIcon) : ExtensionAction.LABEL_ACTION_CLASS} hide-when-disabled switch-to-released`);
        this.commandService = commandService;
        this.tooltip = localize('switch to release version tooltip', "Switch to Release version of this extension");
        this.update();
    }
    update() {
        this.enabled = !!this.extension && !this.extension.isBuiltin && this.extension.state === 1 /* ExtensionState.Installed */ && !!this.extension.local?.isPreReleaseVersion && !!this.extension.hasReleaseVersion;
    }
    async run() {
        if (!this.enabled) {
            return;
        }
        return this.commandService.executeCommand(SwitchToReleasedVersionAction.ID, this.extension?.identifier.id);
    }
};
SwitchToReleasedVersionAction = __decorate([
    __param(1, ICommandService)
], SwitchToReleasedVersionAction);
export { SwitchToReleasedVersionAction };
let InstallAnotherVersionAction = class InstallAnotherVersionAction extends ExtensionAction {
    extensionsWorkbenchService;
    extensionGalleryService;
    quickInputService;
    instantiationService;
    dialogService;
    static ID = 'workbench.extensions.action.install.anotherVersion';
    static LABEL = localize('install another version', "Install Another Version...");
    constructor(extensionsWorkbenchService, extensionGalleryService, quickInputService, instantiationService, dialogService) {
        super(InstallAnotherVersionAction.ID, InstallAnotherVersionAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionGalleryService = extensionGalleryService;
        this.quickInputService = quickInputService;
        this.instantiationService = instantiationService;
        this.dialogService = dialogService;
        this.update();
    }
    update() {
        this.enabled = !!this.extension && !this.extension.isBuiltin && !!this.extension.gallery && !!this.extension.local && !!this.extension.server && this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.deprecationInfo;
    }
    async run() {
        if (!this.enabled) {
            return;
        }
        const targetPlatform = await this.extension.server.extensionManagementService.getTargetPlatform();
        const allVersions = await this.extensionGalleryService.getAllCompatibleVersions(this.extension.gallery, this.extension.local.preRelease, targetPlatform);
        if (!allVersions.length) {
            await this.dialogService.show(Severity.Info, localize('no versions', "This extension has no other versions."));
            return;
        }
        const picks = allVersions.map((v, i) => {
            return {
                id: v.version,
                label: v.version,
                description: `${fromNow(new Date(Date.parse(v.date)), true)}${v.isPreReleaseVersion ? ` (${localize('pre-release', "pre-release")})` : ''}${v.version === this.extension.version ? ` (${localize('current', "current")})` : ''}`,
                latest: i === 0,
                ariaLabel: `${v.isPreReleaseVersion ? 'Pre-Release version' : 'Release version'} ${v.version}`,
                isPreReleaseVersion: v.isPreReleaseVersion
            };
        });
        const pick = await this.quickInputService.pick(picks, {
            placeHolder: localize('selectVersion', "Select Version to Install"),
            matchOnDetail: true
        });
        if (pick) {
            if (this.extension.version === pick.id) {
                return;
            }
            try {
                if (pick.latest) {
                    await this.extensionsWorkbenchService.install(this.extension, { installPreReleaseVersion: pick.isPreReleaseVersion });
                }
                else {
                    await this.extensionsWorkbenchService.installVersion(this.extension, pick.id, { installPreReleaseVersion: pick.isPreReleaseVersion });
                }
            }
            catch (error) {
                this.instantiationService.createInstance(PromptExtensionInstallFailureAction, this.extension, pick.latest ? this.extension.latestVersion : pick.id, 2 /* InstallOperation.Install */, undefined, error).run();
            }
        }
        return null;
    }
};
InstallAnotherVersionAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IExtensionGalleryService),
    __param(2, IQuickInputService),
    __param(3, IInstantiationService),
    __param(4, IDialogService)
], InstallAnotherVersionAction);
export { InstallAnotherVersionAction };
let EnableForWorkspaceAction = class EnableForWorkspaceAction extends ExtensionAction {
    extensionsWorkbenchService;
    extensionEnablementService;
    static ID = 'extensions.enableForWorkspace';
    static LABEL = localize('enableForWorkspaceAction', "Enable (Workspace)");
    constructor(extensionsWorkbenchService, extensionEnablementService) {
        super(EnableForWorkspaceAction.ID, EnableForWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionEnablementService = extensionEnablementService;
        this.tooltip = localize('enableForWorkspaceActionToolTip', "Enable this extension only in this workspace");
        this.update();
    }
    update() {
        this.enabled = false;
        if (this.extension && this.extension.local) {
            this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                && !this.extensionEnablementService.isEnabled(this.extension.local)
                && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
        }
    }
    async run() {
        if (!this.extension) {
            return;
        }
        return this.extensionsWorkbenchService.setEnablement(this.extension, 9 /* EnablementState.EnabledWorkspace */);
    }
};
EnableForWorkspaceAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IWorkbenchExtensionEnablementService)
], EnableForWorkspaceAction);
export { EnableForWorkspaceAction };
let EnableGloballyAction = class EnableGloballyAction extends ExtensionAction {
    extensionsWorkbenchService;
    extensionEnablementService;
    static ID = 'extensions.enableGlobally';
    static LABEL = localize('enableGloballyAction', "Enable");
    constructor(extensionsWorkbenchService, extensionEnablementService) {
        super(EnableGloballyAction.ID, EnableGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionEnablementService = extensionEnablementService;
        this.tooltip = localize('enableGloballyActionToolTip', "Enable this extension");
        this.update();
    }
    update() {
        this.enabled = false;
        if (this.extension && this.extension.local) {
            this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                && this.extensionEnablementService.isDisabledGlobally(this.extension.local)
                && this.extensionEnablementService.canChangeEnablement(this.extension.local);
        }
    }
    async run() {
        if (!this.extension) {
            return;
        }
        return this.extensionsWorkbenchService.setEnablement(this.extension, 8 /* EnablementState.EnabledGlobally */);
    }
};
EnableGloballyAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IWorkbenchExtensionEnablementService)
], EnableGloballyAction);
export { EnableGloballyAction };
let DisableForWorkspaceAction = class DisableForWorkspaceAction extends ExtensionAction {
    workspaceContextService;
    extensionsWorkbenchService;
    extensionEnablementService;
    extensionService;
    static ID = 'extensions.disableForWorkspace';
    static LABEL = localize('disableForWorkspaceAction', "Disable (Workspace)");
    constructor(workspaceContextService, extensionsWorkbenchService, extensionEnablementService, extensionService) {
        super(DisableForWorkspaceAction.ID, DisableForWorkspaceAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
        this.workspaceContextService = workspaceContextService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionEnablementService = extensionEnablementService;
        this.extensionService = extensionService;
        this.tooltip = localize('disableForWorkspaceActionToolTip', "Disable this extension only in this workspace");
        this.update();
        this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
    }
    update() {
        this.enabled = false;
        if (this.extension && this.extension.local && this.extensionService.extensions.some(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
            this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                && this.extensionEnablementService.canChangeWorkspaceEnablement(this.extension.local);
        }
    }
    async run() {
        if (!this.extension) {
            return;
        }
        return this.extensionsWorkbenchService.setEnablement(this.extension, 7 /* EnablementState.DisabledWorkspace */);
    }
};
DisableForWorkspaceAction = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IExtensionsWorkbenchService),
    __param(2, IWorkbenchExtensionEnablementService),
    __param(3, IExtensionService)
], DisableForWorkspaceAction);
export { DisableForWorkspaceAction };
let DisableGloballyAction = class DisableGloballyAction extends ExtensionAction {
    extensionsWorkbenchService;
    extensionEnablementService;
    extensionService;
    static ID = 'extensions.disableGlobally';
    static LABEL = localize('disableGloballyAction', "Disable");
    constructor(extensionsWorkbenchService, extensionEnablementService, extensionService) {
        super(DisableGloballyAction.ID, DisableGloballyAction.LABEL, ExtensionAction.LABEL_ACTION_CLASS);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionEnablementService = extensionEnablementService;
        this.extensionService = extensionService;
        this.tooltip = localize('disableGloballyActionToolTip', "Disable this extension");
        this.update();
        this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
    }
    update() {
        this.enabled = false;
        if (this.extension && this.extension.local && this.extensionService.extensions.some(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))) {
            this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                && this.extensionEnablementService.canChangeEnablement(this.extension.local);
        }
    }
    async run() {
        if (!this.extension) {
            return;
        }
        return this.extensionsWorkbenchService.setEnablement(this.extension, 6 /* EnablementState.DisabledGlobally */);
    }
};
DisableGloballyAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IWorkbenchExtensionEnablementService),
    __param(2, IExtensionService)
], DisableGloballyAction);
export { DisableGloballyAction };
let EnableDropDownAction = class EnableDropDownAction extends ActionWithDropDownAction {
    constructor(instantiationService) {
        super('extensions.enable', localize('enableAction', "Enable"), [
            [
                instantiationService.createInstance(EnableGloballyAction),
                instantiationService.createInstance(EnableForWorkspaceAction)
            ]
        ]);
    }
};
EnableDropDownAction = __decorate([
    __param(0, IInstantiationService)
], EnableDropDownAction);
export { EnableDropDownAction };
let DisableDropDownAction = class DisableDropDownAction extends ActionWithDropDownAction {
    constructor(instantiationService) {
        super('extensions.disable', localize('disableAction', "Disable"), [[
                instantiationService.createInstance(DisableGloballyAction),
                instantiationService.createInstance(DisableForWorkspaceAction)
            ]]);
    }
};
DisableDropDownAction = __decorate([
    __param(0, IInstantiationService)
], DisableDropDownAction);
export { DisableDropDownAction };
let ReloadAction = class ReloadAction extends ExtensionAction {
    hostService;
    extensionService;
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} reload`;
    static DisabledClass = `${ReloadAction.EnabledClass} disabled`;
    updateWhenCounterExtensionChanges = true;
    constructor(hostService, extensionService) {
        super('extensions.reload', localize('reloadAction', "Reload"), ReloadAction.DisabledClass, false);
        this.hostService = hostService;
        this.extensionService = extensionService;
        this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
        this.update();
    }
    update() {
        this.enabled = false;
        this.tooltip = '';
        if (!this.extension) {
            return;
        }
        const state = this.extension.state;
        if (state === 0 /* ExtensionState.Installing */ || state === 2 /* ExtensionState.Uninstalling */) {
            return;
        }
        if (this.extension.local && this.extension.local.manifest && this.extension.local.manifest.contributes && this.extension.local.manifest.contributes.localizations && this.extension.local.manifest.contributes.localizations.length > 0) {
            return;
        }
        const reloadTooltip = this.extension.reloadRequiredStatus;
        this.enabled = reloadTooltip !== undefined;
        this.label = reloadTooltip !== undefined ? localize('reload required', 'Reload Required') : '';
        this.tooltip = reloadTooltip !== undefined ? reloadTooltip : '';
        this.class = this.enabled ? ReloadAction.EnabledClass : ReloadAction.DisabledClass;
    }
    run() {
        return Promise.resolve(this.hostService.reload());
    }
};
ReloadAction = __decorate([
    __param(0, IHostService),
    __param(1, IExtensionService)
], ReloadAction);
export { ReloadAction };
function isThemeFromExtension(theme, extension) {
    return !!(extension && theme.extensionData && ExtensionIdentifier.equals(theme.extensionData.extensionId, extension.identifier.id));
}
function getQuickPickEntries(themes, currentTheme, extension, showCurrentTheme) {
    const picks = [];
    for (const theme of themes) {
        if (isThemeFromExtension(theme, extension) && !(showCurrentTheme && theme === currentTheme)) {
            picks.push({ label: theme.label, id: theme.id });
        }
    }
    if (showCurrentTheme) {
        picks.push({ type: 'separator', label: localize('current', "current") });
        picks.push({ label: currentTheme.label, id: currentTheme.id });
    }
    return picks;
}
let SetColorThemeAction = class SetColorThemeAction extends ExtensionAction {
    workbenchThemeService;
    quickInputService;
    extensionEnablementService;
    static ID = 'workbench.extensions.action.setColorTheme';
    static TITLE = { value: localize('workbench.extensions.action.setColorTheme', "Set Color Theme"), original: 'Set Color Theme' };
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
    static DisabledClass = `${SetColorThemeAction.EnabledClass} disabled`;
    constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
        super(SetColorThemeAction.ID, SetColorThemeAction.TITLE.value, SetColorThemeAction.DisabledClass, false);
        this.workbenchThemeService = workbenchThemeService;
        this.quickInputService = quickInputService;
        this.extensionEnablementService = extensionEnablementService;
        this._register(Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidColorThemeChange)(() => this.update(), this));
        this.update();
    }
    update() {
        this.workbenchThemeService.getColorThemes().then(colorThemes => {
            this.enabled = this.computeEnablement(colorThemes);
            this.class = this.enabled ? SetColorThemeAction.EnabledClass : SetColorThemeAction.DisabledClass;
        });
    }
    computeEnablement(colorThemes) {
        return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemes.some(th => isThemeFromExtension(th, this.extension));
    }
    async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
        const colorThemes = await this.workbenchThemeService.getColorThemes();
        if (!this.computeEnablement(colorThemes)) {
            return;
        }
        const currentTheme = this.workbenchThemeService.getColorTheme();
        const delayer = new Delayer(100);
        const picks = getQuickPickEntries(colorThemes, currentTheme, this.extension, showCurrentTheme);
        const pickedTheme = await this.quickInputService.pick(picks, {
            placeHolder: localize('select color theme', "Select Color Theme"),
            onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setColorTheme(item.id, undefined)),
            ignoreFocusLost
        });
        return this.workbenchThemeService.setColorTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
    }
};
SetColorThemeAction = __decorate([
    __param(0, IExtensionService),
    __param(1, IWorkbenchThemeService),
    __param(2, IQuickInputService),
    __param(3, IWorkbenchExtensionEnablementService)
], SetColorThemeAction);
export { SetColorThemeAction };
let SetFileIconThemeAction = class SetFileIconThemeAction extends ExtensionAction {
    workbenchThemeService;
    quickInputService;
    extensionEnablementService;
    static ID = 'workbench.extensions.action.setFileIconTheme';
    static TITLE = { value: localize('workbench.extensions.action.setFileIconTheme', "Set File Icon Theme"), original: 'Set File Icon Theme' };
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
    static DisabledClass = `${SetFileIconThemeAction.EnabledClass} disabled`;
    constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
        super(SetFileIconThemeAction.ID, SetFileIconThemeAction.TITLE.value, SetFileIconThemeAction.DisabledClass, false);
        this.workbenchThemeService = workbenchThemeService;
        this.quickInputService = quickInputService;
        this.extensionEnablementService = extensionEnablementService;
        this._register(Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidFileIconThemeChange)(() => this.update(), this));
        this.update();
    }
    update() {
        this.workbenchThemeService.getFileIconThemes().then(fileIconThemes => {
            this.enabled = this.computeEnablement(fileIconThemes);
            this.class = this.enabled ? SetFileIconThemeAction.EnabledClass : SetFileIconThemeAction.DisabledClass;
        });
    }
    computeEnablement(colorThemfileIconThemess) {
        return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && colorThemfileIconThemess.some(th => isThemeFromExtension(th, this.extension));
    }
    async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
        const fileIconThemes = await this.workbenchThemeService.getFileIconThemes();
        if (!this.computeEnablement(fileIconThemes)) {
            return;
        }
        const currentTheme = this.workbenchThemeService.getFileIconTheme();
        const delayer = new Delayer(100);
        const picks = getQuickPickEntries(fileIconThemes, currentTheme, this.extension, showCurrentTheme);
        const pickedTheme = await this.quickInputService.pick(picks, {
            placeHolder: localize('select file icon theme', "Select File Icon Theme"),
            onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setFileIconTheme(item.id, undefined)),
            ignoreFocusLost
        });
        return this.workbenchThemeService.setFileIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
    }
};
SetFileIconThemeAction = __decorate([
    __param(0, IExtensionService),
    __param(1, IWorkbenchThemeService),
    __param(2, IQuickInputService),
    __param(3, IWorkbenchExtensionEnablementService)
], SetFileIconThemeAction);
export { SetFileIconThemeAction };
let SetProductIconThemeAction = class SetProductIconThemeAction extends ExtensionAction {
    workbenchThemeService;
    quickInputService;
    extensionEnablementService;
    static ID = 'workbench.extensions.action.setProductIconTheme';
    static TITLE = { value: localize('workbench.extensions.action.setProductIconTheme', "Set Product Icon Theme"), original: 'Set Product Icon Theme' };
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} theme`;
    static DisabledClass = `${SetProductIconThemeAction.EnabledClass} disabled`;
    constructor(extensionService, workbenchThemeService, quickInputService, extensionEnablementService) {
        super(SetProductIconThemeAction.ID, SetProductIconThemeAction.TITLE.value, SetProductIconThemeAction.DisabledClass, false);
        this.workbenchThemeService = workbenchThemeService;
        this.quickInputService = quickInputService;
        this.extensionEnablementService = extensionEnablementService;
        this._register(Event.any(extensionService.onDidChangeExtensions, workbenchThemeService.onDidProductIconThemeChange)(() => this.update(), this));
        this.update();
    }
    update() {
        this.workbenchThemeService.getProductIconThemes().then(productIconThemes => {
            this.enabled = this.computeEnablement(productIconThemes);
            this.class = this.enabled ? SetProductIconThemeAction.EnabledClass : SetProductIconThemeAction.DisabledClass;
        });
    }
    computeEnablement(productIconThemes) {
        return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.extensionEnablementService.isEnabledEnablementState(this.extension.enablementState) && productIconThemes.some(th => isThemeFromExtension(th, this.extension));
    }
    async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
        const productIconThemes = await this.workbenchThemeService.getProductIconThemes();
        if (!this.computeEnablement(productIconThemes)) {
            return;
        }
        const currentTheme = this.workbenchThemeService.getProductIconTheme();
        const delayer = new Delayer(100);
        const picks = getQuickPickEntries(productIconThemes, currentTheme, this.extension, showCurrentTheme);
        const pickedTheme = await this.quickInputService.pick(picks, {
            placeHolder: localize('select product icon theme', "Select Product Icon Theme"),
            onDidFocus: item => delayer.trigger(() => this.workbenchThemeService.setProductIconTheme(item.id, undefined)),
            ignoreFocusLost
        });
        return this.workbenchThemeService.setProductIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
    }
};
SetProductIconThemeAction = __decorate([
    __param(0, IExtensionService),
    __param(1, IWorkbenchThemeService),
    __param(2, IQuickInputService),
    __param(3, IWorkbenchExtensionEnablementService)
], SetProductIconThemeAction);
export { SetProductIconThemeAction };
let SetLanguageAction = class SetLanguageAction extends ExtensionAction {
    extensionsWorkbenchService;
    languagePackService;
    static ID = 'workbench.extensions.action.setDisplayLanguage';
    static TITLE = { value: localize('workbench.extensions.action.setDisplayLanguage', "Set Display Language"), original: 'Set Display Language' };
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`;
    static DisabledClass = `${SetLanguageAction.EnabledClass} disabled`;
    constructor(extensionsWorkbenchService, languagePackService) {
        super(SetLanguageAction.ID, SetLanguageAction.TITLE.value, SetLanguageAction.DisabledClass, false);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.languagePackService = languagePackService;
        this.update();
    }
    update() {
        this.enabled = false;
        this.class = SetLanguageAction.DisabledClass;
        if (!this.extension) {
            return;
        }
        if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
            return;
        }
        if (this.extension.gallery && language === this.languagePackService.getLocale(this.extension.gallery)) {
            return;
        }
        this.enabled = true;
        this.class = SetLanguageAction.EnabledClass;
    }
    async run() {
        return this.extension && this.extensionsWorkbenchService.setLanguage(this.extension);
    }
};
SetLanguageAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, ILanguagePackService)
], SetLanguageAction);
export { SetLanguageAction };
let ClearLanguageAction = class ClearLanguageAction extends ExtensionAction {
    extensionsWorkbenchService;
    languagePackService;
    localeService;
    static ID = 'workbench.extensions.action.clearLanguage';
    static TITLE = { value: localize('workbench.extensions.action.clearLanguage', "Clear Display Language"), original: 'Clear Display Language' };
    static EnabledClass = `${ExtensionAction.LABEL_ACTION_CLASS} language`;
    static DisabledClass = `${ClearLanguageAction.EnabledClass} disabled`;
    constructor(extensionsWorkbenchService, languagePackService, localeService) {
        super(ClearLanguageAction.ID, ClearLanguageAction.TITLE.value, ClearLanguageAction.DisabledClass, false);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.languagePackService = languagePackService;
        this.localeService = localeService;
        this.update();
    }
    update() {
        this.enabled = false;
        this.class = ClearLanguageAction.DisabledClass;
        if (!this.extension) {
            return;
        }
        if (!this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
            return;
        }
        if (this.extension.gallery && language !== this.languagePackService.getLocale(this.extension.gallery)) {
            return;
        }
        this.enabled = true;
        this.class = ClearLanguageAction.EnabledClass;
    }
    async run() {
        return this.extension && this.localeService.clearLocalePreference();
    }
};
ClearLanguageAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, ILanguagePackService),
    __param(2, ILocaleService)
], ClearLanguageAction);
export { ClearLanguageAction };
let ShowRecommendedExtensionAction = class ShowRecommendedExtensionAction extends Action {
    paneCompositeService;
    extensionWorkbenchService;
    static ID = 'workbench.extensions.action.showRecommendedExtension';
    static LABEL = localize('showRecommendedExtension', "Show Recommended Extension");
    extensionId;
    constructor(extensionId, paneCompositeService, extensionWorkbenchService) {
        super(ShowRecommendedExtensionAction.ID, ShowRecommendedExtensionAction.LABEL, undefined, false);
        this.paneCompositeService = paneCompositeService;
        this.extensionWorkbenchService = extensionWorkbenchService;
        this.extensionId = extensionId;
    }
    async run() {
        const paneComposite = await this.paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        const paneContainer = paneComposite?.getViewPaneContainer();
        paneContainer.search(`@id:${this.extensionId}`);
        paneContainer.focus();
        const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: 'install-recommendation' }, CancellationToken.None);
        if (extension) {
            return this.extensionWorkbenchService.open(extension);
        }
        return null;
    }
};
ShowRecommendedExtensionAction = __decorate([
    __param(1, IPaneCompositePartService),
    __param(2, IExtensionsWorkbenchService)
], ShowRecommendedExtensionAction);
export { ShowRecommendedExtensionAction };
let InstallRecommendedExtensionAction = class InstallRecommendedExtensionAction extends Action {
    paneCompositeService;
    instantiationService;
    extensionWorkbenchService;
    static ID = 'workbench.extensions.action.installRecommendedExtension';
    static LABEL = localize('installRecommendedExtension', "Install Recommended Extension");
    extensionId;
    constructor(extensionId, paneCompositeService, instantiationService, extensionWorkbenchService) {
        super(InstallRecommendedExtensionAction.ID, InstallRecommendedExtensionAction.LABEL, undefined, false);
        this.paneCompositeService = paneCompositeService;
        this.instantiationService = instantiationService;
        this.extensionWorkbenchService = extensionWorkbenchService;
        this.extensionId = extensionId;
    }
    async run() {
        const viewlet = await this.paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true);
        const viewPaneContainer = viewlet?.getViewPaneContainer();
        viewPaneContainer.search(`@id:${this.extensionId}`);
        viewPaneContainer.focus();
        const [extension] = await this.extensionWorkbenchService.getExtensions([{ id: this.extensionId }], { source: 'install-recommendation' }, CancellationToken.None);
        if (extension) {
            await this.extensionWorkbenchService.open(extension);
            try {
                await this.extensionWorkbenchService.install(extension);
            }
            catch (err) {
                this.instantiationService.createInstance(PromptExtensionInstallFailureAction, extension, extension.latestVersion, 2 /* InstallOperation.Install */, undefined, err).run();
            }
        }
    }
};
InstallRecommendedExtensionAction = __decorate([
    __param(1, IPaneCompositePartService),
    __param(2, IInstantiationService),
    __param(3, IExtensionsWorkbenchService)
], InstallRecommendedExtensionAction);
export { InstallRecommendedExtensionAction };
let IgnoreExtensionRecommendationAction = class IgnoreExtensionRecommendationAction extends Action {
    extension;
    extensionRecommendationsManagementService;
    static ID = 'extensions.ignore';
    static Class = `${ExtensionAction.LABEL_ACTION_CLASS} ignore`;
    constructor(extension, extensionRecommendationsManagementService) {
        super(IgnoreExtensionRecommendationAction.ID, 'Ignore Recommendation');
        this.extension = extension;
        this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
        this.class = IgnoreExtensionRecommendationAction.Class;
        this.tooltip = localize('ignoreExtensionRecommendation', "Do not recommend this extension again");
        this.enabled = true;
    }
    run() {
        this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, true);
        return Promise.resolve();
    }
};
IgnoreExtensionRecommendationAction = __decorate([
    __param(1, IExtensionIgnoredRecommendationsService)
], IgnoreExtensionRecommendationAction);
export { IgnoreExtensionRecommendationAction };
let UndoIgnoreExtensionRecommendationAction = class UndoIgnoreExtensionRecommendationAction extends Action {
    extension;
    extensionRecommendationsManagementService;
    static ID = 'extensions.ignore';
    static Class = `${ExtensionAction.LABEL_ACTION_CLASS} undo-ignore`;
    constructor(extension, extensionRecommendationsManagementService) {
        super(UndoIgnoreExtensionRecommendationAction.ID, 'Undo');
        this.extension = extension;
        this.extensionRecommendationsManagementService = extensionRecommendationsManagementService;
        this.class = UndoIgnoreExtensionRecommendationAction.Class;
        this.tooltip = localize('undo', "Undo");
        this.enabled = true;
    }
    run() {
        this.extensionRecommendationsManagementService.toggleGlobalIgnoredRecommendation(this.extension.identifier.id, false);
        return Promise.resolve();
    }
};
UndoIgnoreExtensionRecommendationAction = __decorate([
    __param(1, IExtensionIgnoredRecommendationsService)
], UndoIgnoreExtensionRecommendationAction);
export { UndoIgnoreExtensionRecommendationAction };
let SearchExtensionsAction = class SearchExtensionsAction extends Action {
    searchValue;
    paneCompositeService;
    constructor(searchValue, paneCompositeService) {
        super('extensions.searchExtensions', localize('search recommendations', "Search Extensions"), undefined, true);
        this.searchValue = searchValue;
        this.paneCompositeService = paneCompositeService;
    }
    async run() {
        const viewPaneContainer = (await this.paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
        viewPaneContainer.search(this.searchValue);
        viewPaneContainer.focus();
    }
};
SearchExtensionsAction = __decorate([
    __param(1, IPaneCompositePartService)
], SearchExtensionsAction);
export { SearchExtensionsAction };
let AbstractConfigureRecommendedExtensionsAction = class AbstractConfigureRecommendedExtensionsAction extends Action {
    contextService;
    fileService;
    textFileService;
    editorService;
    jsonEditingService;
    textModelResolverService;
    constructor(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService) {
        super(id, label);
        this.contextService = contextService;
        this.fileService = fileService;
        this.textFileService = textFileService;
        this.editorService = editorService;
        this.jsonEditingService = jsonEditingService;
        this.textModelResolverService = textModelResolverService;
    }
    openExtensionsFile(extensionsFileResource) {
        return this.getOrCreateExtensionsFile(extensionsFileResource)
            .then(({ created, content }) => this.getSelectionPosition(content, extensionsFileResource, ['recommendations'])
            .then(selection => this.editorService.openEditor({
            resource: extensionsFileResource,
            options: {
                pinned: created,
                selection
            }
        })), error => Promise.reject(new Error(localize('OpenExtensionsFile.failed', "Unable to create 'extensions.json' file inside the '.vscode' folder ({0}).", error))));
    }
    openWorkspaceConfigurationFile(workspaceConfigurationFile) {
        return this.getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile)
            .then(content => this.getSelectionPosition(content.value.toString(), content.resource, ['extensions', 'recommendations']))
            .then(selection => this.editorService.openEditor({
            resource: workspaceConfigurationFile,
            options: {
                selection,
                forceReload: true // because content has changed
            }
        }));
    }
    getOrUpdateWorkspaceConfigurationFile(workspaceConfigurationFile) {
        return Promise.resolve(this.fileService.readFile(workspaceConfigurationFile))
            .then(content => {
            const workspaceRecommendations = json.parse(content.value.toString())['extensions'];
            if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
                return this.jsonEditingService.write(workspaceConfigurationFile, [{ path: ['extensions'], value: { recommendations: [] } }], true)
                    .then(() => this.fileService.readFile(workspaceConfigurationFile));
            }
            return content;
        });
    }
    getSelectionPosition(content, resource, path) {
        const tree = json.parseTree(content);
        const node = json.findNodeAtLocation(tree, path);
        if (node && node.parent && node.parent.children) {
            const recommendationsValueNode = node.parent.children[1];
            const lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
            const offset = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
            return Promise.resolve(this.textModelResolverService.createModelReference(resource))
                .then(reference => {
                const position = reference.object.textEditorModel.getPositionAt(offset);
                reference.dispose();
                return {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                };
            });
        }
        return Promise.resolve(undefined);
    }
    getOrCreateExtensionsFile(extensionsFileResource) {
        return Promise.resolve(this.fileService.readFile(extensionsFileResource)).then(content => {
            return { created: false, extensionsFileResource, content: content.value.toString() };
        }, err => {
            return this.textFileService.write(extensionsFileResource, ExtensionsConfigurationInitialContent).then(() => {
                return { created: true, extensionsFileResource, content: ExtensionsConfigurationInitialContent };
            });
        });
    }
};
AbstractConfigureRecommendedExtensionsAction = __decorate([
    __param(2, IWorkspaceContextService),
    __param(3, IFileService),
    __param(4, ITextFileService),
    __param(5, IEditorService),
    __param(6, IJSONEditingService),
    __param(7, ITextModelService)
], AbstractConfigureRecommendedExtensionsAction);
export { AbstractConfigureRecommendedExtensionsAction };
let ConfigureWorkspaceRecommendedExtensionsAction = class ConfigureWorkspaceRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
    static ID = 'workbench.extensions.action.configureWorkspaceRecommendedExtensions';
    static LABEL = localize('configureWorkspaceRecommendedExtensions', "Configure Recommended Extensions (Workspace)");
    constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService) {
        super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
        this._register(this.contextService.onDidChangeWorkbenchState(() => this.update(), this));
        this.update();
    }
    update() {
        this.enabled = this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
    }
    run() {
        switch (this.contextService.getWorkbenchState()) {
            case 2 /* WorkbenchState.FOLDER */:
                return this.openExtensionsFile(this.contextService.getWorkspace().folders[0].toResource(EXTENSIONS_CONFIG));
            case 3 /* WorkbenchState.WORKSPACE */:
                return this.openWorkspaceConfigurationFile(this.contextService.getWorkspace().configuration);
        }
        return Promise.resolve();
    }
};
ConfigureWorkspaceRecommendedExtensionsAction = __decorate([
    __param(2, IFileService),
    __param(3, ITextFileService),
    __param(4, IWorkspaceContextService),
    __param(5, IEditorService),
    __param(6, IJSONEditingService),
    __param(7, ITextModelService)
], ConfigureWorkspaceRecommendedExtensionsAction);
export { ConfigureWorkspaceRecommendedExtensionsAction };
let ConfigureWorkspaceFolderRecommendedExtensionsAction = class ConfigureWorkspaceFolderRecommendedExtensionsAction extends AbstractConfigureRecommendedExtensionsAction {
    commandService;
    static ID = 'workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions';
    static LABEL = localize('configureWorkspaceFolderRecommendedExtensions', "Configure Recommended Extensions (Workspace Folder)");
    constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService, commandService) {
        super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
        this.commandService = commandService;
    }
    run() {
        const folderCount = this.contextService.getWorkspace().folders.length;
        const pickFolderPromise = folderCount === 1 ? Promise.resolve(this.contextService.getWorkspace().folders[0]) : this.commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
        return Promise.resolve(pickFolderPromise)
            .then(workspaceFolder => {
            if (workspaceFolder) {
                return this.openExtensionsFile(workspaceFolder.toResource(EXTENSIONS_CONFIG));
            }
            return null;
        });
    }
};
ConfigureWorkspaceFolderRecommendedExtensionsAction = __decorate([
    __param(2, IFileService),
    __param(3, ITextFileService),
    __param(4, IWorkspaceContextService),
    __param(5, IEditorService),
    __param(6, IJSONEditingService),
    __param(7, ITextModelService),
    __param(8, ICommandService)
], ConfigureWorkspaceFolderRecommendedExtensionsAction);
export { ConfigureWorkspaceFolderRecommendedExtensionsAction };
let ExtensionStatusLabelAction = class ExtensionStatusLabelAction extends Action {
    extensionService;
    extensionManagementServerService;
    extensionEnablementService;
    static ENABLED_CLASS = `${ExtensionAction.TEXT_ACTION_CLASS} extension-status-label`;
    static DISABLED_CLASS = `${ExtensionStatusLabelAction.ENABLED_CLASS} hide`;
    initialStatus = null;
    status = null;
    enablementState = null;
    _extension = null;
    get extension() { return this._extension; }
    set extension(extension) {
        if (!(this._extension && extension && areSameExtensions(this._extension.identifier, extension.identifier))) {
            // Different extension. Reset
            this.initialStatus = null;
            this.status = null;
            this.enablementState = null;
        }
        this._extension = extension;
        this.update();
    }
    constructor(extensionService, extensionManagementServerService, extensionEnablementService) {
        super('extensions.action.statusLabel', '', ExtensionStatusLabelAction.DISABLED_CLASS, false);
        this.extensionService = extensionService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionEnablementService = extensionEnablementService;
    }
    update() {
        const label = this.computeLabel();
        this.label = label || '';
        this.class = label ? ExtensionStatusLabelAction.ENABLED_CLASS : ExtensionStatusLabelAction.DISABLED_CLASS;
    }
    computeLabel() {
        if (!this.extension) {
            return null;
        }
        const currentStatus = this.status;
        const currentEnablementState = this.enablementState;
        this.status = this.extension.state;
        if (this.initialStatus === null) {
            this.initialStatus = this.status;
        }
        this.enablementState = this.extension.enablementState;
        const canAddExtension = () => {
            const runningExtension = this.extensionService.extensions.filter(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
            if (this.extension.local) {
                if (runningExtension && this.extension.version === runningExtension.version) {
                    return true;
                }
                return this.extensionService.canAddExtension(toExtensionDescription(this.extension.local));
            }
            return false;
        };
        const canRemoveExtension = () => {
            if (this.extension.local) {
                if (this.extensionService.extensions.every(e => !(areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.extension.server === this.extensionManagementServerService.getExtensionManagementServer(toExtension(e))))) {
                    return true;
                }
                return this.extensionService.canRemoveExtension(toExtensionDescription(this.extension.local));
            }
            return false;
        };
        if (currentStatus !== null) {
            if (currentStatus === 0 /* ExtensionState.Installing */ && this.status === 1 /* ExtensionState.Installed */) {
                return canAddExtension() ? this.initialStatus === 1 /* ExtensionState.Installed */ ? localize('updated', "Updated") : localize('installed', "Installed") : null;
            }
            if (currentStatus === 2 /* ExtensionState.Uninstalling */ && this.status === 3 /* ExtensionState.Uninstalled */) {
                this.initialStatus = this.status;
                return canRemoveExtension() ? localize('uninstalled', "Uninstalled") : null;
            }
        }
        if (currentEnablementState !== null) {
            const currentlyEnabled = this.extensionEnablementService.isEnabledEnablementState(currentEnablementState);
            const enabled = this.extensionEnablementService.isEnabledEnablementState(this.enablementState);
            if (!currentlyEnabled && enabled) {
                return canAddExtension() ? localize('enabled', "Enabled") : null;
            }
            if (currentlyEnabled && !enabled) {
                return canRemoveExtension() ? localize('disabled', "Disabled") : null;
            }
        }
        return null;
    }
    run() {
        return Promise.resolve();
    }
};
ExtensionStatusLabelAction = __decorate([
    __param(0, IExtensionService),
    __param(1, IExtensionManagementServerService),
    __param(2, IWorkbenchExtensionEnablementService)
], ExtensionStatusLabelAction);
export { ExtensionStatusLabelAction };
let ToggleSyncExtensionAction = class ToggleSyncExtensionAction extends ExtensionDropDownAction {
    configurationService;
    extensionsWorkbenchService;
    userDataSyncEnablementService;
    static IGNORED_SYNC_CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-sync ${ThemeIcon.asClassName(syncIgnoredIcon)}`;
    static SYNC_CLASS = `${ToggleSyncExtensionAction.ICON_ACTION_CLASS} extension-sync ${ThemeIcon.asClassName(syncEnabledIcon)}`;
    constructor(configurationService, extensionsWorkbenchService, userDataSyncEnablementService, instantiationService) {
        super('extensions.sync', '', ToggleSyncExtensionAction.SYNC_CLASS, false, instantiationService);
        this.configurationService = configurationService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectedKeys.includes('settingsSync.ignoredExtensions'))(() => this.update()));
        this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
        this.update();
    }
    update() {
        this.enabled = !!this.extension && this.userDataSyncEnablementService.isEnabled() && this.extension.state === 1 /* ExtensionState.Installed */;
        if (this.extension) {
            const isIgnored = this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension);
            this.class = isIgnored ? ToggleSyncExtensionAction.IGNORED_SYNC_CLASS : ToggleSyncExtensionAction.SYNC_CLASS;
            this.tooltip = isIgnored ? localize('ignored', "This extension is ignored during sync") : localize('synced', "This extension is synced");
        }
    }
    async run() {
        return super.run({
            actionGroups: [
                [
                    new Action('extensions.syncignore', this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension) ? localize('sync', "Sync this extension") : localize('do not sync', "Do not sync this extension"), undefined, true, () => this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(this.extension))
                ]
            ], disposeActionsOnHide: true
        });
    }
};
ToggleSyncExtensionAction = __decorate([
    __param(0, IConfigurationService),
    __param(1, IExtensionsWorkbenchService),
    __param(2, IUserDataSyncEnablementService),
    __param(3, IInstantiationService)
], ToggleSyncExtensionAction);
export { ToggleSyncExtensionAction };
let ExtensionStatusAction = class ExtensionStatusAction extends ExtensionAction {
    extensionManagementServerService;
    labelService;
    commandService;
    workspaceTrustEnablementService;
    workspaceTrustService;
    extensionsWorkbenchService;
    extensionService;
    extensionManifestPropertiesService;
    contextService;
    productService;
    workbenchExtensionEnablementService;
    static CLASS = `${ExtensionAction.ICON_ACTION_CLASS} extension-status`;
    updateWhenCounterExtensionChanges = true;
    _status;
    get status() { return this._status; }
    _onDidChangeStatus = this._register(new Emitter());
    onDidChangeStatus = this._onDidChangeStatus.event;
    updateThrottler = new Throttler();
    constructor(extensionManagementServerService, labelService, commandService, workspaceTrustEnablementService, workspaceTrustService, extensionsWorkbenchService, extensionService, extensionManifestPropertiesService, contextService, productService, workbenchExtensionEnablementService) {
        super('extensions.status', '', `${ExtensionStatusAction.CLASS} hide`, false);
        this.extensionManagementServerService = extensionManagementServerService;
        this.labelService = labelService;
        this.commandService = commandService;
        this.workspaceTrustEnablementService = workspaceTrustEnablementService;
        this.workspaceTrustService = workspaceTrustService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionService = extensionService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.contextService = contextService;
        this.productService = productService;
        this.workbenchExtensionEnablementService = workbenchExtensionEnablementService;
        this._register(this.labelService.onDidChangeFormatters(() => this.update(), this));
        this._register(this.extensionService.onDidChangeExtensions(() => this.update()));
        this.update();
    }
    update() {
        this.updateThrottler.queue(() => this.computeAndUpdateStatus());
    }
    async computeAndUpdateStatus() {
        this.updateStatus(undefined, true);
        this.enabled = false;
        if (!this.extension) {
            return;
        }
        if (this.extension.isMalicious) {
            this.updateStatus({ icon: warningIcon, message: new MarkdownString(localize('malicious tooltip', "This extension was reported to be problematic.")) }, true);
            return;
        }
        if (this.extension.deprecationInfo) {
            if (this.extension.deprecationInfo.extension) {
                const link = `[${this.extension.deprecationInfo.extension.displayName}](${URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.extension.id]))}`)})`;
                this.updateStatus({ icon: warningIcon, message: new MarkdownString(localize('deprecated with alternate extension tooltip', "This extension is deprecated. Use the {0} extension instead.", link)) }, true);
            }
            else if (this.extension.deprecationInfo.settings) {
                const link = `[${localize('settings', "settings")}](${URI.parse(`command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.settings.map(setting => `@id:${setting}`).join(' ')]))}`)})`;
                this.updateStatus({ icon: warningIcon, message: new MarkdownString(localize('deprecated with alternate settings tooltip', "This extension is deprecated as this functionality is now built-in to VS Code. Configure these {0} to use this functionality.", link)) }, true);
            }
            else {
                this.updateStatus({ icon: warningIcon, message: new MarkdownString(localize('deprecated tooltip', "This extension is deprecated as it is no longer being maintained.")) }, true);
            }
            return;
        }
        if (this.extensionsWorkbenchService.canSetLanguage(this.extension)) {
            return;
        }
        if (this.extension.gallery && this.extension.state === 3 /* ExtensionState.Uninstalled */ && !await this.extensionsWorkbenchService.canInstall(this.extension)) {
            if (this.extensionManagementServerService.localExtensionManagementServer || this.extensionManagementServerService.remoteExtensionManagementServer) {
                const targetPlatform = await (this.extensionManagementServerService.localExtensionManagementServer ? this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform() : this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform());
                const message = new MarkdownString(`${localize('incompatible platform', "The '{0}' extension is not available in {1} for {2}.", this.extension.displayName || this.extension.identifier.id, this.productService.nameLong, TargetPlatformToString(targetPlatform))} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-platform-specific-extensions)`);
                this.updateStatus({ icon: warningIcon, message }, true);
                return;
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                const productName = localize('VS Code for Web', "{0} for the Web", this.productService.nameLong);
                const message = new MarkdownString(`${localize('not web tooltip', "The '{0}' extension is not available in {1}.", this.extension.displayName || this.extension.identifier.id, productName)} [${localize('learn why', "Learn Why")}](https://aka.ms/vscode-web-extensions-guide)`);
                this.updateStatus({ icon: warningIcon, message }, true);
                return;
            }
        }
        if (!this.extension.local ||
            !this.extension.server ||
            this.extension.state !== 1 /* ExtensionState.Installed */) {
            return;
        }
        // Extension is disabled by environment
        if (this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */) {
            this.updateStatus({ message: new MarkdownString(localize('disabled by environment', "This extension is disabled by the environment.")) }, true);
            return;
        }
        // Extension is enabled by environment
        if (this.extension.enablementState === 3 /* EnablementState.EnabledByEnvironment */) {
            this.updateStatus({ message: new MarkdownString(localize('enabled by environment', "This extension is enabled because it is required in the current environment.")) }, true);
            return;
        }
        // Extension is disabled by virtual workspace
        if (this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
            const details = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.virtualWorkspaces);
            this.updateStatus({ icon: infoIcon, message: new MarkdownString(details ? escapeMarkdownSyntaxTokens(details) : localize('disabled because of virtual workspace', "This extension has been disabled because it does not support virtual workspaces.")) }, true);
            return;
        }
        // Limited support in Virtual Workspace
        if (isVirtualWorkspace(this.contextService.getWorkspace())) {
            const virtualSupportType = this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(this.extension.local.manifest);
            const details = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.virtualWorkspaces);
            if (virtualSupportType === 'limited' || details) {
                this.updateStatus({ icon: warningIcon, message: new MarkdownString(details ? escapeMarkdownSyntaxTokens(details) : localize('extension limited because of virtual workspace', "This extension has limited features because the current workspace is virtual.")) }, true);
                return;
            }
        }
        // Extension is disabled by untrusted workspace
        if (this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ ||
            // All disabled dependencies of the extension are disabled by untrusted workspace
            (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.workbenchExtensionEnablementService.getDependenciesEnablementStates(this.extension.local).every(([, enablementState]) => this.workbenchExtensionEnablementService.isEnabledEnablementState(enablementState) || enablementState === 0 /* EnablementState.DisabledByTrustRequirement */))) {
            this.enabled = true;
            const untrustedDetails = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
            this.updateStatus({ icon: trustIcon, message: new MarkdownString(untrustedDetails ? escapeMarkdownSyntaxTokens(untrustedDetails) : localize('extension disabled because of trust requirement', "This extension has been disabled because the current workspace is not trusted.")) }, true);
            return;
        }
        // Limited support in Untrusted Workspace
        if (this.workspaceTrustEnablementService.isWorkspaceTrustEnabled() && !this.workspaceTrustService.isWorkspaceTrusted()) {
            const untrustedSupportType = this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(this.extension.local.manifest);
            const untrustedDetails = getWorkspaceSupportTypeMessage(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
            if (untrustedSupportType === 'limited' || untrustedDetails) {
                this.enabled = true;
                this.updateStatus({ icon: trustIcon, message: new MarkdownString(untrustedDetails ? escapeMarkdownSyntaxTokens(untrustedDetails) : localize('extension limited because of trust requirement', "This extension has limited features because the current workspace is not trusted.")) }, true);
                return;
            }
        }
        // Extension is disabled by extension kind
        if (this.extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
            if (!this.extensionsWorkbenchService.installed.some(e => areSameExtensions(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                let message;
                // Extension on Local Server
                if (this.extensionManagementServerService.localExtensionManagementServer === this.extension.server) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                        if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                            message = new MarkdownString(`${localize('Install in remote server to enable', "This extension is disabled in this workspace because it is defined to run in the Remote Extension Host. Please install the extension in '{0}' to enable.", this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                        }
                    }
                }
                // Extension on Remote Server
                else if (this.extensionManagementServerService.remoteExtensionManagementServer === this.extension.server) {
                    if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                        if (this.extensionManagementServerService.localExtensionManagementServer) {
                            message = new MarkdownString(`${localize('Install in local server to enable', "This extension is disabled in this workspace because it is defined to run in the Local Extension Host. Please install the extension locally to enable.", this.extensionManagementServerService.remoteExtensionManagementServer.label)} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                        }
                        else if (isWeb) {
                            message = new MarkdownString(`${localize('Defined to run in desktop', "This extension is disabled because it is defined to run only in {0} for the Desktop.", this.productService.nameLong)} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                        }
                    }
                }
                // Extension on Web Server
                else if (this.extensionManagementServerService.webExtensionManagementServer === this.extension.server) {
                    message = new MarkdownString(`${localize('Cannot be enabled', "This extension is disabled because it is not supported in {0} for the Web.", this.productService.nameLong)} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                }
                if (message) {
                    this.updateStatus({ icon: warningIcon, message }, true);
                }
                return;
            }
        }
        // Remote Workspace
        if (this.extensionManagementServerService.remoteExtensionManagementServer) {
            if (isLanguagePackExtension(this.extension.local.manifest)) {
                if (!this.extensionsWorkbenchService.installed.some(e => areSameExtensions(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                    const message = this.extension.server === this.extensionManagementServerService.localExtensionManagementServer
                        ? new MarkdownString(localize('Install language pack also in remote server', "Install the language pack extension on '{0}' to enable it there also.", this.extensionManagementServerService.remoteExtensionManagementServer.label))
                        : new MarkdownString(localize('Install language pack also locally', "Install the language pack extension locally to enable it there also."));
                    this.updateStatus({ icon: infoIcon, message }, true);
                }
                return;
            }
            const runningExtension = this.extensionService.extensions.filter(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
            const runningExtensionServer = runningExtension ? this.extensionManagementServerService.getExtensionManagementServer(toExtension(runningExtension)) : null;
            if (this.extension.server === this.extensionManagementServerService.localExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.remoteExtensionManagementServer) {
                if (this.extensionManifestPropertiesService.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                    this.updateStatus({ icon: infoIcon, message: new MarkdownString(`${localize('enabled remotely', "This extension is enabled in the Remote Extension Host because it prefers to run there.")} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                }
                return;
            }
            if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.localExtensionManagementServer) {
                if (this.extensionManifestPropertiesService.prefersExecuteOnUI(this.extension.local.manifest)) {
                    this.updateStatus({ icon: infoIcon, message: new MarkdownString(`${localize('enabled locally', "This extension is enabled in the Local Extension Host because it prefers to run there.")} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                }
                return;
            }
            if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer && runningExtensionServer === this.extensionManagementServerService.webExtensionManagementServer) {
                if (this.extensionManifestPropertiesService.canExecuteOnWeb(this.extension.local.manifest)) {
                    this.updateStatus({ icon: infoIcon, message: new MarkdownString(`${localize('enabled in web worker', "This extension is enabled in the Web Worker Extension Host because it prefers to run there.")} [${localize('learn more', "Learn More")}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                }
                return;
            }
        }
        // Extension is disabled by its dependency
        if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */) {
            this.updateStatus({ icon: warningIcon, message: new MarkdownString(localize('extension disabled because of dependency', "This extension has been disabled because it depends on an extension that is disabled.")) }, true);
            return;
        }
        const isEnabled = this.workbenchExtensionEnablementService.isEnabled(this.extension.local);
        const isRunning = this.extensionService.extensions.some(e => areSameExtensions({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier));
        if (isEnabled && isRunning) {
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                if (this.extension.server === this.extensionManagementServerService.remoteExtensionManagementServer) {
                    this.updateStatus({ message: new MarkdownString(localize('extension enabled on remote', "Extension is enabled on '{0}'", this.extension.server.label)) }, true);
                    return;
                }
            }
            if (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */) {
                this.updateStatus({ message: new MarkdownString(localize('globally enabled', "This extension is enabled globally.")) }, true);
                return;
            }
            if (this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */) {
                this.updateStatus({ message: new MarkdownString(localize('workspace enabled', "This extension is enabled for this workspace by the user.")) }, true);
                return;
            }
        }
        if (!isEnabled && !isRunning) {
            if (this.extension.enablementState === 6 /* EnablementState.DisabledGlobally */) {
                this.updateStatus({ message: new MarkdownString(localize('globally disabled', "This extension is disabled globally by the user.")) }, true);
                return;
            }
            if (this.extension.enablementState === 7 /* EnablementState.DisabledWorkspace */) {
                this.updateStatus({ message: new MarkdownString(localize('workspace disabled', "This extension is disabled for this workspace by the user.")) }, true);
                return;
            }
        }
        if (isEnabled && !isRunning && !this.extension.local.isValid) {
            const errors = this.extension.local.validations.filter(([severity]) => severity === Severity.Error).map(([, message]) => message);
            this.updateStatus({ icon: errorIcon, message: new MarkdownString(errors.join(' ').trim()) }, true);
        }
    }
    updateStatus(status, updateClass) {
        if (this._status === status) {
            return;
        }
        if (this._status && status && this._status.message === status.message && this._status.icon?.id === status.icon?.id) {
            return;
        }
        this._status = status;
        if (updateClass) {
            if (this._status?.icon === errorIcon) {
                this.class = `${ExtensionStatusAction.CLASS} extension-status-error ${ThemeIcon.asClassName(errorIcon)}`;
            }
            else if (this._status?.icon === warningIcon) {
                this.class = `${ExtensionStatusAction.CLASS} extension-status-warning ${ThemeIcon.asClassName(warningIcon)}`;
            }
            else if (this._status?.icon === infoIcon) {
                this.class = `${ExtensionStatusAction.CLASS} extension-status-info ${ThemeIcon.asClassName(infoIcon)}`;
            }
            else if (this._status?.icon === trustIcon) {
                this.class = `${ExtensionStatusAction.CLASS} ${ThemeIcon.asClassName(trustIcon)}`;
            }
            else {
                this.class = `${ExtensionStatusAction.CLASS} hide`;
            }
        }
        this._onDidChangeStatus.fire();
    }
    async run() {
        if (this._status?.icon === trustIcon) {
            return this.commandService.executeCommand('workbench.trust.manage');
        }
    }
};
ExtensionStatusAction = __decorate([
    __param(0, IExtensionManagementServerService),
    __param(1, ILabelService),
    __param(2, ICommandService),
    __param(3, IWorkspaceTrustEnablementService),
    __param(4, IWorkspaceTrustManagementService),
    __param(5, IExtensionsWorkbenchService),
    __param(6, IExtensionService),
    __param(7, IExtensionManifestPropertiesService),
    __param(8, IWorkspaceContextService),
    __param(9, IProductService),
    __param(10, IWorkbenchExtensionEnablementService)
], ExtensionStatusAction);
export { ExtensionStatusAction };
let ReinstallAction = class ReinstallAction extends Action {
    extensionsWorkbenchService;
    extensionManagementServerService;
    quickInputService;
    notificationService;
    hostService;
    instantiationService;
    extensionService;
    static ID = 'workbench.extensions.action.reinstall';
    static LABEL = localize('reinstall', "Reinstall Extension...");
    constructor(id = ReinstallAction.ID, label = ReinstallAction.LABEL, extensionsWorkbenchService, extensionManagementServerService, quickInputService, notificationService, hostService, instantiationService, extensionService) {
        super(id, label);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionManagementServerService = extensionManagementServerService;
        this.quickInputService = quickInputService;
        this.notificationService = notificationService;
        this.hostService = hostService;
        this.instantiationService = instantiationService;
        this.extensionService = extensionService;
    }
    get enabled() {
        return this.extensionsWorkbenchService.local.filter(l => !l.isBuiltin && l.local).length > 0;
    }
    run() {
        return this.quickInputService.pick(this.getEntries(), { placeHolder: localize('selectExtensionToReinstall', "Select Extension to Reinstall") })
            .then(pick => pick && this.reinstallExtension(pick.extension));
    }
    getEntries() {
        return this.extensionsWorkbenchService.queryLocal()
            .then(local => {
            const entries = local
                .filter(extension => !extension.isBuiltin && extension.server !== this.extensionManagementServerService.webExtensionManagementServer)
                .map(extension => {
                return {
                    id: extension.identifier.id,
                    label: extension.displayName,
                    description: extension.identifier.id,
                    extension,
                };
            });
            return entries;
        });
    }
    reinstallExtension(extension) {
        return this.instantiationService.createInstance(SearchExtensionsAction, '@installed ').run()
            .then(() => {
            return this.extensionsWorkbenchService.reinstall(extension)
                .then(extension => {
                const requireReload = !(extension.local && this.extensionService.canAddExtension(toExtensionDescription(extension.local)));
                const message = requireReload ? localize('ReinstallAction.successReload', "Please reload Visual Studio Code to complete reinstalling the extension {0}.", extension.identifier.id)
                    : localize('ReinstallAction.success', "Reinstalling the extension {0} is completed.", extension.identifier.id);
                const actions = requireReload ? [{
                        label: localize('InstallVSIXAction.reloadNow', "Reload Now"),
                        run: () => this.hostService.reload()
                    }] : [];
                this.notificationService.prompt(Severity.Info, message, actions, { sticky: true });
            }, error => this.notificationService.error(error));
        });
    }
};
ReinstallAction = __decorate([
    __param(2, IExtensionsWorkbenchService),
    __param(3, IExtensionManagementServerService),
    __param(4, IQuickInputService),
    __param(5, INotificationService),
    __param(6, IHostService),
    __param(7, IInstantiationService),
    __param(8, IExtensionService)
], ReinstallAction);
export { ReinstallAction };
let InstallSpecificVersionOfExtensionAction = class InstallSpecificVersionOfExtensionAction extends Action {
    extensionsWorkbenchService;
    quickInputService;
    instantiationService;
    extensionEnablementService;
    static ID = 'workbench.extensions.action.install.specificVersion';
    static LABEL = localize('install previous version', "Install Specific Version of Extension...");
    constructor(id = InstallSpecificVersionOfExtensionAction.ID, label = InstallSpecificVersionOfExtensionAction.LABEL, extensionsWorkbenchService, quickInputService, instantiationService, extensionEnablementService) {
        super(id, label);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.quickInputService = quickInputService;
        this.instantiationService = instantiationService;
        this.extensionEnablementService = extensionEnablementService;
    }
    get enabled() {
        return this.extensionsWorkbenchService.local.some(l => this.isEnabled(l));
    }
    async run() {
        const extensionPick = await this.quickInputService.pick(this.getExtensionEntries(), { placeHolder: localize('selectExtension', "Select Extension"), matchOnDetail: true });
        if (extensionPick && extensionPick.extension) {
            const action = this.instantiationService.createInstance(InstallAnotherVersionAction);
            action.extension = extensionPick.extension;
            await action.run();
            await this.instantiationService.createInstance(SearchExtensionsAction, extensionPick.extension.identifier.id).run();
        }
    }
    isEnabled(extension) {
        const action = this.instantiationService.createInstance(InstallAnotherVersionAction);
        action.extension = extension;
        return action.enabled && !!extension.local && this.extensionEnablementService.isEnabled(extension.local);
    }
    async getExtensionEntries() {
        const installed = await this.extensionsWorkbenchService.queryLocal();
        const entries = [];
        for (const extension of installed) {
            if (this.isEnabled(extension)) {
                entries.push({
                    id: extension.identifier.id,
                    label: extension.displayName || extension.identifier.id,
                    description: extension.identifier.id,
                    extension,
                });
            }
        }
        return entries.sort((e1, e2) => e1.extension.displayName.localeCompare(e2.extension.displayName));
    }
};
InstallSpecificVersionOfExtensionAction = __decorate([
    __param(2, IExtensionsWorkbenchService),
    __param(3, IQuickInputService),
    __param(4, IInstantiationService),
    __param(5, IWorkbenchExtensionEnablementService)
], InstallSpecificVersionOfExtensionAction);
export { InstallSpecificVersionOfExtensionAction };
let AbstractInstallExtensionsInServerAction = class AbstractInstallExtensionsInServerAction extends Action {
    extensionsWorkbenchService;
    quickInputService;
    notificationService;
    progressService;
    extensions = undefined;
    constructor(id, extensionsWorkbenchService, quickInputService, notificationService, progressService) {
        super(id);
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.quickInputService = quickInputService;
        this.notificationService = notificationService;
        this.progressService = progressService;
        this.update();
        this.extensionsWorkbenchService.queryLocal().then(() => this.updateExtensions());
        this._register(this.extensionsWorkbenchService.onChange(() => {
            if (this.extensions) {
                this.updateExtensions();
            }
        }));
    }
    updateExtensions() {
        this.extensions = this.extensionsWorkbenchService.local;
        this.update();
    }
    update() {
        this.enabled = !!this.extensions && this.getExtensionsToInstall(this.extensions).length > 0;
        this.tooltip = this.label;
    }
    async run() {
        return this.selectAndInstallExtensions();
    }
    async queryExtensionsToInstall() {
        const local = await this.extensionsWorkbenchService.queryLocal();
        return this.getExtensionsToInstall(local);
    }
    async selectAndInstallExtensions() {
        const quickPick = this.quickInputService.createQuickPick();
        quickPick.busy = true;
        const disposable = quickPick.onDidAccept(() => {
            disposable.dispose();
            quickPick.hide();
            quickPick.dispose();
            this.onDidAccept(quickPick.selectedItems);
        });
        quickPick.show();
        const localExtensionsToInstall = await this.queryExtensionsToInstall();
        quickPick.busy = false;
        if (localExtensionsToInstall.length) {
            quickPick.title = this.getQuickPickTitle();
            quickPick.placeholder = localize('select extensions to install', "Select extensions to install");
            quickPick.canSelectMany = true;
            localExtensionsToInstall.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
            quickPick.items = localExtensionsToInstall.map(extension => ({ extension, label: extension.displayName, description: extension.version }));
        }
        else {
            quickPick.hide();
            quickPick.dispose();
            this.notificationService.notify({
                severity: Severity.Info,
                message: localize('no local extensions', "There are no extensions to install.")
            });
        }
    }
    async onDidAccept(selectedItems) {
        if (selectedItems.length) {
            const localExtensionsToInstall = selectedItems.filter(r => !!r.extension).map(r => r.extension);
            if (localExtensionsToInstall.length) {
                await this.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: localize('installing extensions', "Installing Extensions...")
                }, () => this.installExtensions(localExtensionsToInstall));
                this.notificationService.info(localize('finished installing', "Successfully installed extensions."));
            }
        }
    }
};
AbstractInstallExtensionsInServerAction = __decorate([
    __param(1, IExtensionsWorkbenchService),
    __param(2, IQuickInputService),
    __param(3, INotificationService),
    __param(4, IProgressService)
], AbstractInstallExtensionsInServerAction);
export { AbstractInstallExtensionsInServerAction };
let InstallLocalExtensionsInRemoteAction = class InstallLocalExtensionsInRemoteAction extends AbstractInstallExtensionsInServerAction {
    extensionManagementServerService;
    extensionGalleryService;
    instantiationService;
    fileService;
    logService;
    constructor(extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, instantiationService, fileService, logService) {
        super('workbench.extensions.actions.installLocalExtensionsInRemote', extensionsWorkbenchService, quickInputService, notificationService, progressService);
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionGalleryService = extensionGalleryService;
        this.instantiationService = instantiationService;
        this.fileService = fileService;
        this.logService = logService;
    }
    get label() {
        if (this.extensionManagementServerService && this.extensionManagementServerService.remoteExtensionManagementServer) {
            return localize('select and install local extensions', "Install Local Extensions in '{0}'...", this.extensionManagementServerService.remoteExtensionManagementServer.label);
        }
        return '';
    }
    getQuickPickTitle() {
        return localize('install local extensions title', "Install Local Extensions in '{0}'", this.extensionManagementServerService.remoteExtensionManagementServer.label);
    }
    getExtensionsToInstall(local) {
        return local.filter(extension => {
            const action = this.instantiationService.createInstance(RemoteInstallAction, true);
            action.extension = extension;
            return action.enabled;
        });
    }
    async installExtensions(localExtensionsToInstall) {
        const galleryExtensions = [];
        const vsixs = [];
        const targetPlatform = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
        await Promises.settled(localExtensionsToInstall.map(async (extension) => {
            if (this.extensionGalleryService.isEnabled()) {
                const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, CancellationToken.None))[0];
                if (gallery) {
                    galleryExtensions.push(gallery);
                    return;
                }
            }
            const vsix = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.zip(extension.local);
            vsixs.push(vsix);
        }));
        await Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
        try {
            await Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.install(vsix)));
        }
        finally {
            try {
                await Promise.allSettled(vsixs.map(vsix => this.fileService.del(vsix)));
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    }
};
InstallLocalExtensionsInRemoteAction = __decorate([
    __param(0, IExtensionsWorkbenchService),
    __param(1, IQuickInputService),
    __param(2, IProgressService),
    __param(3, INotificationService),
    __param(4, IExtensionManagementServerService),
    __param(5, IExtensionGalleryService),
    __param(6, IInstantiationService),
    __param(7, IFileService),
    __param(8, ILogService)
], InstallLocalExtensionsInRemoteAction);
export { InstallLocalExtensionsInRemoteAction };
let InstallRemoteExtensionsInLocalAction = class InstallRemoteExtensionsInLocalAction extends AbstractInstallExtensionsInServerAction {
    extensionManagementServerService;
    extensionGalleryService;
    fileService;
    logService;
    constructor(id, extensionsWorkbenchService, quickInputService, progressService, notificationService, extensionManagementServerService, extensionGalleryService, fileService, logService) {
        super(id, extensionsWorkbenchService, quickInputService, notificationService, progressService);
        this.extensionManagementServerService = extensionManagementServerService;
        this.extensionGalleryService = extensionGalleryService;
        this.fileService = fileService;
        this.logService = logService;
    }
    get label() {
        return localize('select and install remote extensions', "Install Remote Extensions Locally...");
    }
    getQuickPickTitle() {
        return localize('install remote extensions', "Install Remote Extensions Locally");
    }
    getExtensionsToInstall(local) {
        return local.filter(extension => extension.type === 1 /* ExtensionType.User */ && extension.server !== this.extensionManagementServerService.localExtensionManagementServer
            && !this.extensionsWorkbenchService.installed.some(e => e.server === this.extensionManagementServerService.localExtensionManagementServer && areSameExtensions(e.identifier, extension.identifier)));
    }
    async installExtensions(extensions) {
        const galleryExtensions = [];
        const vsixs = [];
        const targetPlatform = await this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.getTargetPlatform();
        await Promises.settled(extensions.map(async (extension) => {
            if (this.extensionGalleryService.isEnabled()) {
                const gallery = (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, CancellationToken.None))[0];
                if (gallery) {
                    galleryExtensions.push(gallery);
                    return;
                }
            }
            const vsix = await this.extensionManagementServerService.remoteExtensionManagementServer.extensionManagementService.zip(extension.local);
            vsixs.push(vsix);
        }));
        await Promises.settled(galleryExtensions.map(gallery => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
        try {
            await Promises.settled(vsixs.map(vsix => this.extensionManagementServerService.localExtensionManagementServer.extensionManagementService.install(vsix)));
        }
        finally {
            try {
                await Promise.allSettled(vsixs.map(vsix => this.fileService.del(vsix)));
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    }
};
InstallRemoteExtensionsInLocalAction = __decorate([
    __param(1, IExtensionsWorkbenchService),
    __param(2, IQuickInputService),
    __param(3, IProgressService),
    __param(4, INotificationService),
    __param(5, IExtensionManagementServerService),
    __param(6, IExtensionGalleryService),
    __param(7, IFileService),
    __param(8, ILogService)
], InstallRemoteExtensionsInLocalAction);
export { InstallRemoteExtensionsInLocalAction };
CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsForLanguage', function (accessor, fileExtension) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    return paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
        .then(viewlet => viewlet?.getViewPaneContainer())
        .then(viewlet => {
        viewlet.search(`ext:${fileExtension.replace(/^\./, '')}`);
        viewlet.focus();
    });
});
CommandsRegistry.registerCommand('workbench.extensions.action.showExtensionsWithIds', function (accessor, extensionIds) {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    return paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
        .then(viewlet => viewlet?.getViewPaneContainer())
        .then(viewlet => {
        const query = extensionIds
            .map(id => `@id:${id}`)
            .join(' ');
        viewlet.search(query);
        viewlet.focus();
    });
});
registerColor('extensionButton.background', {
    dark: buttonBackground,
    light: buttonBackground,
    hcDark: null,
    hcLight: null
}, localize('extensionButtonBackground', "Button background color for extension actions."));
registerColor('extensionButton.foreground', {
    dark: buttonForeground,
    light: buttonForeground,
    hcDark: null,
    hcLight: null
}, localize('extensionButtonForeground', "Button foreground color for extension actions."));
registerColor('extensionButton.hoverBackground', {
    dark: buttonHoverBackground,
    light: buttonHoverBackground,
    hcDark: null,
    hcLight: null
}, localize('extensionButtonHoverBackground', "Button background hover color for extension actions."));
registerColor('extensionButton.separator', {
    dark: buttonSeparator,
    light: buttonSeparator,
    hcDark: buttonSeparator,
    hcLight: buttonSeparator
}, localize('extensionButtonSeparator', "Button separator color for extension actions"));
export const extensionButtonProminentBackground = registerColor('extensionButton.prominentBackground', {
    dark: buttonBackground,
    light: buttonBackground,
    hcDark: null,
    hcLight: null
}, localize('extensionButtonProminentBackground', "Button background color for extension actions that stand out (e.g. install button)."));
registerColor('extensionButton.prominentForeground', {
    dark: buttonForeground,
    light: buttonForeground,
    hcDark: null,
    hcLight: null
}, localize('extensionButtonProminentForeground', "Button foreground color for extension actions that stand out (e.g. install button)."));
registerColor('extensionButton.prominentHoverBackground', {
    dark: buttonHoverBackground,
    light: buttonHoverBackground,
    hcDark: null,
    hcLight: null
}, localize('extensionButtonProminentHoverBackground', "Button background hover color for extension actions that stand out (e.g. install button)."));
registerThemingParticipant((theme, collector) => {
    const errorColor = theme.getColor(editorErrorForeground);
    if (errorColor) {
        collector.addRule(`.extension-editor .header .actions-status-container > .status ${ThemeIcon.asCSSSelector(errorIcon)} { color: ${errorColor}; }`);
        collector.addRule(`.extension-editor .body .subcontent .runtime-status ${ThemeIcon.asCSSSelector(errorIcon)} { color: ${errorColor}; }`);
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(errorIcon)} { color: ${errorColor}; }`);
    }
    const warningColor = theme.getColor(editorWarningForeground);
    if (warningColor) {
        collector.addRule(`.extension-editor .header .actions-status-container > .status ${ThemeIcon.asCSSSelector(warningIcon)} { color: ${warningColor}; }`);
        collector.addRule(`.extension-editor .body .subcontent .runtime-status ${ThemeIcon.asCSSSelector(warningIcon)} { color: ${warningColor}; }`);
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(warningIcon)} { color: ${warningColor}; }`);
    }
    const infoColor = theme.getColor(editorInfoForeground);
    if (infoColor) {
        collector.addRule(`.extension-editor .header .actions-status-container > .status ${ThemeIcon.asCSSSelector(infoIcon)} { color: ${infoColor}; }`);
        collector.addRule(`.extension-editor .body .subcontent .runtime-status ${ThemeIcon.asCSSSelector(infoIcon)} { color: ${infoColor}; }`);
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${ThemeIcon.asCSSSelector(infoIcon)} { color: ${infoColor}; }`);
    }
});
