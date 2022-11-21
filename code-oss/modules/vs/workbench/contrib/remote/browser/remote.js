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
import 'vs/css!./media/remoteViewlet';
import * as nls from 'vs/nls';
import * as dom from 'vs/base/browser/dom';
import { URI } from 'vs/base/common/uri';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IExtensionService, isProposedApiEnabled } from 'vs/workbench/services/extensions/common/extensions';
import { FilterViewPaneContainer } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { VIEWLET_ID } from 'vs/workbench/contrib/remote/browser/remoteExplorer';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { Extensions, IViewDescriptorService } from 'vs/workbench/common/views';
import { Registry } from 'vs/platform/registry/common/platform';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import Severity from 'vs/base/common/severity';
import { ReloadWindowAction } from 'vs/workbench/browser/actions/windowActions';
import { Disposable } from 'vs/base/common/lifecycle';
import { SwitchRemoteViewItem, SwitchRemoteAction } from 'vs/workbench/contrib/remote/browser/explorerViewItems';
import { isStringArray } from 'vs/base/common/types';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { Event } from 'vs/base/common/event';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import * as icons from 'vs/workbench/contrib/remote/browser/remoteIcons';
import { ILogService } from 'vs/platform/log/common/log';
import { ITimerService } from 'vs/workbench/services/timer/browser/timerService';
import { getRemoteName } from 'vs/platform/remote/common/remoteHosts';
const remoteHelpExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'remoteHelp',
    jsonSchema: {
        description: nls.localize('RemoteHelpInformationExtPoint', 'Contributes help information for Remote'),
        type: 'object',
        properties: {
            'getStarted': {
                description: nls.localize('RemoteHelpInformationExtPoint.getStarted', "The url, or a command that returns the url, to your project's Getting Started page"),
                type: 'string'
            },
            'documentation': {
                description: nls.localize('RemoteHelpInformationExtPoint.documentation', "The url, or a command that returns the url, to your project's documentation page"),
                type: 'string'
            },
            'feedback': {
                description: nls.localize('RemoteHelpInformationExtPoint.feedback', "The url, or a command that returns the url, to your project's feedback reporter"),
                type: 'string'
            },
            'issues': {
                description: nls.localize('RemoteHelpInformationExtPoint.issues', "The url, or a command that returns the url, to your project's issues list"),
                type: 'string'
            }
        }
    }
});
class HelpTreeVirtualDelegate {
    getHeight(element) {
        return 22;
    }
    getTemplateId(element) {
        return 'HelpItemTemplate';
    }
}
class HelpTreeRenderer {
    templateId = 'HelpItemTemplate';
    renderTemplate(container) {
        container.classList.add('remote-help-tree-node-item');
        const icon = dom.append(container, dom.$('.remote-help-tree-node-item-icon'));
        const data = Object.create(null);
        data.parent = container;
        data.icon = icon;
        return data;
    }
    renderElement(element, index, templateData, height) {
        const container = templateData.parent;
        dom.append(container, templateData.icon);
        templateData.icon.classList.add(...element.element.iconClasses);
        const labelContainer = dom.append(container, dom.$('.help-item-label'));
        labelContainer.innerText = element.element.label;
    }
    disposeTemplate(templateData) {
    }
}
class HelpDataSource {
    hasChildren(element) {
        return element instanceof HelpModel;
    }
    getChildren(element) {
        if (element instanceof HelpModel && element.items) {
            return element.items;
        }
        return [];
    }
}
class HelpModel {
    items;
    constructor(viewModel, openerService, quickInputService, commandService, remoteExplorerService, environmentService) {
        const helpItems = [];
        const getStarted = viewModel.helpInformation.filter(info => info.getStarted);
        if (getStarted.length) {
            helpItems.push(new HelpItem(icons.getStartedIcon, nls.localize('remote.help.getStarted', "Get Started"), getStarted.map((info) => (new HelpItemValue(commandService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.getStarted))), quickInputService, environmentService, openerService, remoteExplorerService));
        }
        const documentation = viewModel.helpInformation.filter(info => info.documentation);
        if (documentation.length) {
            helpItems.push(new HelpItem(icons.documentationIcon, nls.localize('remote.help.documentation', "Read Documentation"), documentation.map((info) => (new HelpItemValue(commandService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.documentation))), quickInputService, environmentService, openerService, remoteExplorerService));
        }
        const feedback = viewModel.helpInformation.filter(info => info.feedback);
        if (feedback.length) {
            helpItems.push(new HelpItem(icons.feedbackIcon, nls.localize('remote.help.feedback', "Provide Feedback"), feedback.map((info) => (new HelpItemValue(commandService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.feedback))), quickInputService, environmentService, openerService, remoteExplorerService));
        }
        const issues = viewModel.helpInformation.filter(info => info.issues);
        if (issues.length) {
            helpItems.push(new HelpItem(icons.reviewIssuesIcon, nls.localize('remote.help.issues', "Review Issues"), issues.map((info) => (new HelpItemValue(commandService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName, info.issues))), quickInputService, environmentService, openerService, remoteExplorerService));
        }
        if (helpItems.length) {
            helpItems.push(new IssueReporterItem(icons.reportIssuesIcon, nls.localize('remote.help.report', "Report Issue"), viewModel.helpInformation.map(info => (new HelpItemValue(commandService, info.extensionDescription, (typeof info.remoteName === 'string') ? [info.remoteName] : info.remoteName))), quickInputService, environmentService, commandService, remoteExplorerService));
        }
        if (helpItems.length) {
            this.items = helpItems;
        }
    }
}
class HelpItemValue {
    commandService;
    extensionDescription;
    remoteAuthority;
    urlOrCommand;
    _url;
    constructor(commandService, extensionDescription, remoteAuthority, urlOrCommand) {
        this.commandService = commandService;
        this.extensionDescription = extensionDescription;
        this.remoteAuthority = remoteAuthority;
        this.urlOrCommand = urlOrCommand;
    }
    get url() {
        return this.getUrl();
    }
    async getUrl() {
        if (this._url === undefined) {
            if (this.urlOrCommand) {
                const url = URI.parse(this.urlOrCommand);
                if (url.authority) {
                    this._url = this.urlOrCommand;
                }
                else {
                    const urlCommand = this.commandService.executeCommand(this.urlOrCommand);
                    // We must be defensive. The command may never return, meaning that no help at all is ever shown!
                    const emptyString = new Promise(resolve => setTimeout(() => resolve(''), 500));
                    this._url = await Promise.race([urlCommand, emptyString]);
                }
            }
        }
        if (this._url === undefined) {
            this._url = '';
        }
        return this._url;
    }
}
class HelpItemBase {
    icon;
    label;
    values;
    quickInputService;
    environmentService;
    remoteExplorerService;
    iconClasses = [];
    constructor(icon, label, values, quickInputService, environmentService, remoteExplorerService) {
        this.icon = icon;
        this.label = label;
        this.values = values;
        this.quickInputService = quickInputService;
        this.environmentService = environmentService;
        this.remoteExplorerService = remoteExplorerService;
        this.iconClasses.push(...ThemeIcon.asClassNameArray(icon));
        this.iconClasses.push('remote-help-tree-node-item-icon');
    }
    async handleClick() {
        const remoteAuthority = this.environmentService.remoteAuthority;
        if (remoteAuthority) {
            for (let i = 0; i < this.remoteExplorerService.targetType.length; i++) {
                if (remoteAuthority.startsWith(this.remoteExplorerService.targetType[i])) {
                    for (const value of this.values) {
                        if (value.remoteAuthority) {
                            for (const authority of value.remoteAuthority) {
                                if (remoteAuthority.startsWith(authority)) {
                                    await this.takeAction(value.extensionDescription, await value.url);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (this.values.length > 1) {
            const actions = (await Promise.all(this.values.map(async (value) => {
                return {
                    label: value.extensionDescription.displayName || value.extensionDescription.identifier.value,
                    description: await value.url,
                    extensionDescription: value.extensionDescription
                };
            }))).filter(item => item.description);
            if (actions.length) {
                const action = await this.quickInputService.pick(actions, { placeHolder: nls.localize('pickRemoteExtension', "Select url to open") });
                if (action) {
                    await this.takeAction(action.extensionDescription, action.description);
                }
            }
        }
        else {
            await this.takeAction(this.values[0].extensionDescription, await this.values[0].url);
        }
    }
}
class HelpItem extends HelpItemBase {
    openerService;
    constructor(icon, label, values, quickInputService, environmentService, openerService, remoteExplorerService) {
        super(icon, label, values, quickInputService, environmentService, remoteExplorerService);
        this.openerService = openerService;
    }
    async takeAction(extensionDescription, url) {
        await this.openerService.open(URI.parse(url), { allowCommands: true });
    }
}
class IssueReporterItem extends HelpItemBase {
    commandService;
    constructor(icon, label, values, quickInputService, environmentService, commandService, remoteExplorerService) {
        super(icon, label, values, quickInputService, environmentService, remoteExplorerService);
        this.commandService = commandService;
    }
    async takeAction(extensionDescription) {
        await this.commandService.executeCommand('workbench.action.openIssueReporter', [extensionDescription.identifier.value]);
    }
}
let HelpPanel = class HelpPanel extends ViewPane {
    viewModel;
    quickInputService;
    commandService;
    remoteExplorerService;
    environmentService;
    static ID = '~remote.helpPanel';
    static TITLE = nls.localize('remote.help', "Help and feedback");
    tree;
    constructor(viewModel, options, keybindingService, contextMenuService, contextKeyService, configurationService, instantiationService, viewDescriptorService, openerService, quickInputService, commandService, remoteExplorerService, environmentService, themeService, telemetryService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.viewModel = viewModel;
        this.quickInputService = quickInputService;
        this.commandService = commandService;
        this.remoteExplorerService = remoteExplorerService;
        this.environmentService = environmentService;
    }
    renderBody(container) {
        super.renderBody(container);
        container.classList.add('remote-help');
        const treeContainer = document.createElement('div');
        treeContainer.classList.add('remote-help-content');
        container.appendChild(treeContainer);
        this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, 'RemoteHelp', treeContainer, new HelpTreeVirtualDelegate(), [new HelpTreeRenderer()], new HelpDataSource(), {
            accessibilityProvider: {
                getAriaLabel: (item) => {
                    return item.label;
                },
                getWidgetAriaLabel: () => nls.localize('remotehelp', "Remote Help")
            }
        });
        const model = new HelpModel(this.viewModel, this.openerService, this.quickInputService, this.commandService, this.remoteExplorerService, this.environmentService);
        this.tree.setInput(model);
        this._register(Event.debounce(this.tree.onDidOpen, (last, event) => event, 75, true)(e => {
            e.element?.handleClick();
        }));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.tree.layout(height, width);
    }
};
HelpPanel = __decorate([
    __param(2, IKeybindingService),
    __param(3, IContextMenuService),
    __param(4, IContextKeyService),
    __param(5, IConfigurationService),
    __param(6, IInstantiationService),
    __param(7, IViewDescriptorService),
    __param(8, IOpenerService),
    __param(9, IQuickInputService),
    __param(10, ICommandService),
    __param(11, IRemoteExplorerService),
    __param(12, IWorkbenchEnvironmentService),
    __param(13, IThemeService),
    __param(14, ITelemetryService)
], HelpPanel);
class HelpPanelDescriptor {
    id = HelpPanel.ID;
    name = HelpPanel.TITLE;
    ctorDescriptor;
    canToggleVisibility = true;
    hideByDefault = false;
    group = 'help@50';
    order = -10;
    constructor(viewModel) {
        this.ctorDescriptor = new SyncDescriptor(HelpPanel, [viewModel]);
    }
}
let RemoteViewPaneContainer = class RemoteViewPaneContainer extends FilterViewPaneContainer {
    remoteExplorerService;
    environmentService;
    contextKeyService;
    helpPanelDescriptor = new HelpPanelDescriptor(this);
    helpInformation = [];
    hasSetSwitchForConnection = false;
    constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, themeService, contextMenuService, extensionService, remoteExplorerService, environmentService, contextKeyService, viewDescriptorService) {
        super(VIEWLET_ID, remoteExplorerService.onDidChangeTargetType, configurationService, layoutService, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, viewDescriptorService);
        this.remoteExplorerService = remoteExplorerService;
        this.environmentService = environmentService;
        this.contextKeyService = contextKeyService;
        this.addConstantViewDescriptors([this.helpPanelDescriptor]);
        remoteHelpExtPoint.setHandler((extensions) => {
            const helpInformation = [];
            for (const extension of extensions) {
                this._handleRemoteInfoExtensionPoint(extension, helpInformation);
            }
            this.helpInformation = helpInformation;
            const viewsRegistry = Registry.as(Extensions.ViewsRegistry);
            if (this.helpInformation.length) {
                viewsRegistry.registerViews([this.helpPanelDescriptor], this.viewContainer);
            }
            else {
                viewsRegistry.deregisterViews([this.helpPanelDescriptor], this.viewContainer);
            }
        });
    }
    _handleRemoteInfoExtensionPoint(extension, helpInformation) {
        if (!isProposedApiEnabled(extension.description, 'contribRemoteHelp')) {
            return;
        }
        if (!extension.value.documentation && !extension.value.feedback && !extension.value.getStarted && !extension.value.issues) {
            return;
        }
        helpInformation.push({
            extensionDescription: extension.description,
            getStarted: extension.value.getStarted,
            documentation: extension.value.documentation,
            feedback: extension.value.feedback,
            issues: extension.value.issues,
            remoteName: extension.value.remoteName
        });
    }
    getFilterOn(viewDescriptor) {
        return isStringArray(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority[0] : viewDescriptor.remoteAuthority;
    }
    setFilter(viewDescriptor) {
        this.remoteExplorerService.targetType = isStringArray(viewDescriptor.remoteAuthority) ? viewDescriptor.remoteAuthority : [viewDescriptor.remoteAuthority];
    }
    getActionViewItem(action) {
        if (action.id === SwitchRemoteAction.ID) {
            const optionItems = SwitchRemoteViewItem.createOptionItems(Registry.as(Extensions.ViewsRegistry).getViews(this.viewContainer), this.contextKeyService);
            const item = this.instantiationService.createInstance(SwitchRemoteViewItem, action, optionItems);
            if (!this.hasSetSwitchForConnection) {
                this.hasSetSwitchForConnection = item.setSelectionForConnection();
            }
            else {
                item.setSelection();
            }
            return item;
        }
        return super.getActionViewItem(action);
    }
    getTitle() {
        const title = nls.localize('remote.explorer', "Remote Explorer");
        return title;
    }
};
RemoteViewPaneContainer = __decorate([
    __param(0, IWorkbenchLayoutService),
    __param(1, ITelemetryService),
    __param(2, IWorkspaceContextService),
    __param(3, IStorageService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IThemeService),
    __param(7, IContextMenuService),
    __param(8, IExtensionService),
    __param(9, IRemoteExplorerService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IContextKeyService),
    __param(12, IViewDescriptorService)
], RemoteViewPaneContainer);
registerAction2(SwitchRemoteAction);
Registry.as(Extensions.ViewContainersRegistry).registerViewContainer({
    id: VIEWLET_ID,
    title: { value: nls.localize('remote.explorer', "Remote Explorer"), original: 'Remote Explorer' },
    ctorDescriptor: new SyncDescriptor(RemoteViewPaneContainer),
    hideIfEmpty: true,
    viewOrderDelegate: {
        getOrder: (group) => {
            if (!group) {
                return;
            }
            let matches = /^targets@(\d+)$/.exec(group);
            if (matches) {
                return -1000;
            }
            matches = /^details(@(\d+))?$/.exec(group);
            if (matches) {
                return -500 + Number(matches[2]);
            }
            matches = /^help(@(\d+))?$/.exec(group);
            if (matches) {
                return -10;
            }
            return;
        }
    },
    icon: icons.remoteExplorerViewIcon,
    order: 4
}, 0 /* ViewContainerLocation.Sidebar */);
let RemoteMarkers = class RemoteMarkers {
    constructor(remoteAgentService, timerService) {
        remoteAgentService.getEnvironment().then(remoteEnv => {
            if (remoteEnv) {
                timerService.setPerformanceMarks('server', remoteEnv.marks);
            }
        });
    }
};
RemoteMarkers = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, ITimerService)
], RemoteMarkers);
export { RemoteMarkers };
class VisibleProgress {
    location;
    _isDisposed;
    _lastReport;
    _currentProgressPromiseResolve;
    _currentProgress;
    _currentTimer;
    get lastReport() {
        return this._lastReport;
    }
    constructor(progressService, location, initialReport, buttons, onDidCancel) {
        this.location = location;
        this._isDisposed = false;
        this._lastReport = initialReport;
        this._currentProgressPromiseResolve = null;
        this._currentProgress = null;
        this._currentTimer = null;
        const promise = new Promise((resolve) => this._currentProgressPromiseResolve = resolve);
        progressService.withProgress({ location: location, buttons: buttons }, (progress) => { if (!this._isDisposed) {
            this._currentProgress = progress;
        } return promise; }, (choice) => onDidCancel(choice, this._lastReport));
        if (this._lastReport) {
            this.report();
        }
    }
    dispose() {
        this._isDisposed = true;
        if (this._currentProgressPromiseResolve) {
            this._currentProgressPromiseResolve();
            this._currentProgressPromiseResolve = null;
        }
        this._currentProgress = null;
        if (this._currentTimer) {
            this._currentTimer.dispose();
            this._currentTimer = null;
        }
    }
    report(message) {
        if (message) {
            this._lastReport = message;
        }
        if (this._lastReport && this._currentProgress) {
            this._currentProgress.report({ message: this._lastReport });
        }
    }
    startTimer(completionTime) {
        this.stopTimer();
        this._currentTimer = new ReconnectionTimer(this, completionTime);
    }
    stopTimer() {
        if (this._currentTimer) {
            this._currentTimer.dispose();
            this._currentTimer = null;
        }
    }
}
class ReconnectionTimer {
    _parent;
    _completionTime;
    _token;
    constructor(parent, completionTime) {
        this._parent = parent;
        this._completionTime = completionTime;
        this._token = setInterval(() => this._render(), 1000);
        this._render();
    }
    dispose() {
        clearInterval(this._token);
    }
    _render() {
        const remainingTimeMs = this._completionTime - Date.now();
        if (remainingTimeMs < 0) {
            return;
        }
        const remainingTime = Math.ceil(remainingTimeMs / 1000);
        if (remainingTime === 1) {
            this._parent.report(nls.localize('reconnectionWaitOne', "Attempting to reconnect in {0} second...", remainingTime));
        }
        else {
            this._parent.report(nls.localize('reconnectionWaitMany', "Attempting to reconnect in {0} seconds...", remainingTime));
        }
    }
}
/**
 * The time when a prompt is shown to the user
 */
const DISCONNECT_PROMPT_TIME = 40 * 1000; // 40 seconds
let RemoteAgentConnectionStatusListener = class RemoteAgentConnectionStatusListener extends Disposable {
    _reloadWindowShown = false;
    constructor(remoteAgentService, progressService, dialogService, commandService, quickInputService, logService, environmentService, telemetryService) {
        super();
        const connection = remoteAgentService.getConnection();
        if (connection) {
            let quickInputVisible = false;
            quickInputService.onShow(() => quickInputVisible = true);
            quickInputService.onHide(() => quickInputVisible = false);
            let visibleProgress = null;
            let reconnectWaitEvent = null;
            let disposableListener = null;
            function showProgress(location, buttons, initialReport = null) {
                if (visibleProgress) {
                    visibleProgress.dispose();
                    visibleProgress = null;
                }
                if (!location) {
                    location = quickInputVisible ? 15 /* ProgressLocation.Notification */ : 20 /* ProgressLocation.Dialog */;
                }
                return new VisibleProgress(progressService, location, initialReport, buttons.map(button => button.label), (choice, lastReport) => {
                    // Handle choice from dialog
                    if (typeof choice !== 'undefined' && buttons[choice]) {
                        buttons[choice].callback();
                    }
                    else {
                        if (location === 20 /* ProgressLocation.Dialog */) {
                            visibleProgress = showProgress(15 /* ProgressLocation.Notification */, buttons, lastReport);
                        }
                        else {
                            hideProgress();
                        }
                    }
                });
            }
            function hideProgress() {
                if (visibleProgress) {
                    visibleProgress.dispose();
                    visibleProgress = null;
                }
            }
            let reconnectionToken = '';
            let lastIncomingDataTime = 0;
            let reconnectionAttempts = 0;
            const reconnectButton = {
                label: nls.localize('reconnectNow', "Reconnect Now"),
                callback: () => {
                    reconnectWaitEvent?.skipWait();
                }
            };
            const reloadButton = {
                label: nls.localize('reloadWindow', "Reload Window"),
                callback: () => {
                    telemetryService.publicLog2('remoteReconnectionReload', {
                        remoteName: getRemoteName(environmentService.remoteAuthority),
                        reconnectionToken: reconnectionToken,
                        millisSinceLastIncomingData: Date.now() - lastIncomingDataTime,
                        attempt: reconnectionAttempts
                    });
                    commandService.executeCommand(ReloadWindowAction.ID);
                }
            };
            // Possible state transitions:
            // ConnectionGain      -> ConnectionLost
            // ConnectionLost      -> ReconnectionWait, ReconnectionRunning
            // ReconnectionWait    -> ReconnectionRunning
            // ReconnectionRunning -> ConnectionGain, ReconnectionPermanentFailure
            connection.onDidStateChange((e) => {
                visibleProgress?.stopTimer();
                if (disposableListener) {
                    disposableListener.dispose();
                    disposableListener = null;
                }
                switch (e.type) {
                    case 0 /* PersistentConnectionEventType.ConnectionLost */:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = 0;
                        telemetryService.publicLog2('remoteConnectionLost', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                        });
                        if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                            if (!visibleProgress) {
                                visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                            }
                            visibleProgress.report(nls.localize('connectionLost', "Connection Lost"));
                        }
                        break;
                    case 1 /* PersistentConnectionEventType.ReconnectionWait */:
                        if (visibleProgress) {
                            reconnectWaitEvent = e;
                            visibleProgress = showProgress(null, [reconnectButton, reloadButton]);
                            visibleProgress.startTimer(Date.now() + 1000 * e.durationSeconds);
                        }
                        break;
                    case 2 /* PersistentConnectionEventType.ReconnectionRunning */:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = e.attempt;
                        telemetryService.publicLog2('remoteReconnectionRunning', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                            millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                            attempt: e.attempt
                        });
                        if (visibleProgress || e.millisSinceLastIncomingData > DISCONNECT_PROMPT_TIME) {
                            visibleProgress = showProgress(null, [reloadButton]);
                            visibleProgress.report(nls.localize('reconnectionRunning', "Disconnected. Attempting to reconnect..."));
                            // Register to listen for quick input is opened
                            disposableListener = quickInputService.onShow(() => {
                                // Need to move from dialog if being shown and user needs to type in a prompt
                                if (visibleProgress && visibleProgress.location === 20 /* ProgressLocation.Dialog */) {
                                    visibleProgress = showProgress(15 /* ProgressLocation.Notification */, [reloadButton], visibleProgress.lastReport);
                                }
                            });
                        }
                        break;
                    case 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = e.attempt;
                        telemetryService.publicLog2('remoteReconnectionPermanentFailure', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                            millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                            attempt: e.attempt,
                            handled: e.handled
                        });
                        hideProgress();
                        if (e.handled) {
                            logService.info(`Error handled: Not showing a notification for the error.`);
                            console.log(`Error handled: Not showing a notification for the error.`);
                        }
                        else if (!this._reloadWindowShown) {
                            this._reloadWindowShown = true;
                            dialogService.show(Severity.Error, nls.localize('reconnectionPermanentFailure', "Cannot reconnect. Please reload the window."), [nls.localize('reloadWindow', "Reload Window"), nls.localize('cancel', "Cancel")], { cancelId: 1, custom: true }).then(result => {
                                // Reload the window
                                if (result.choice === 0) {
                                    commandService.executeCommand(ReloadWindowAction.ID);
                                }
                            });
                        }
                        break;
                    case 4 /* PersistentConnectionEventType.ConnectionGain */:
                        reconnectionToken = e.reconnectionToken;
                        lastIncomingDataTime = Date.now() - e.millisSinceLastIncomingData;
                        reconnectionAttempts = e.attempt;
                        telemetryService.publicLog2('remoteConnectionGain', {
                            remoteName: getRemoteName(environmentService.remoteAuthority),
                            reconnectionToken: e.reconnectionToken,
                            millisSinceLastIncomingData: e.millisSinceLastIncomingData,
                            attempt: e.attempt
                        });
                        hideProgress();
                        break;
                }
            });
        }
    }
};
RemoteAgentConnectionStatusListener = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IProgressService),
    __param(2, IDialogService),
    __param(3, ICommandService),
    __param(4, IQuickInputService),
    __param(5, ILogService),
    __param(6, IWorkbenchEnvironmentService),
    __param(7, ITelemetryService)
], RemoteAgentConnectionStatusListener);
export { RemoteAgentConnectionStatusListener };
