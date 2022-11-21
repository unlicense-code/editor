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
import * as nls from 'vs/nls';
import { STATUS_BAR_HOST_NAME_BACKGROUND, STATUS_BAR_HOST_NAME_FOREGROUND } from 'vs/workbench/common/theme';
import { themeColorFromId } from 'vs/platform/theme/common/themeService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { MenuId, IMenuService, MenuItemAction, MenuRegistry, registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { ILabelService } from 'vs/platform/label/common/label';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { Schemas } from 'vs/base/common/network';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IBrowserWorkbenchEnvironmentService } from 'vs/workbench/services/environment/browser/environmentService';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { isWeb } from 'vs/base/common/platform';
import { once } from 'vs/base/common/functional';
import { truncate } from 'vs/base/common/strings';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { getRemoteName } from 'vs/platform/remote/common/remoteHosts';
import { getVirtualWorkspaceLocation } from 'vs/platform/workspace/common/virtualWorkspace';
import { getCodiconAriaLabel } from 'vs/base/common/codicons';
import { ILogService } from 'vs/platform/log/common/log';
import { ReloadWindowAction } from 'vs/workbench/browser/actions/windowActions';
import { IExtensionGalleryService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID, VIEWLET_ID } from 'vs/workbench/contrib/extensions/common/extensions';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { RemoteNameContext, VirtualWorkspaceContext } from 'vs/workbench/common/contextkeys';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
let RemoteStatusIndicator = class RemoteStatusIndicator extends Disposable {
    statusbarService;
    environmentService;
    labelService;
    contextKeyService;
    menuService;
    quickInputService;
    commandService;
    extensionService;
    remoteAgentService;
    remoteAuthorityResolverService;
    hostService;
    workspaceContextService;
    logService;
    extensionGalleryService;
    static REMOTE_ACTIONS_COMMAND_ID = 'workbench.action.remote.showMenu';
    static CLOSE_REMOTE_COMMAND_ID = 'workbench.action.remote.close';
    static SHOW_CLOSE_REMOTE_COMMAND_ID = !isWeb; // web does not have a "Close Remote" command
    static INSTALL_REMOTE_EXTENSIONS_ID = 'workbench.action.remote.extensions';
    static REMOTE_STATUS_LABEL_MAX_LENGTH = 40;
    remoteStatusEntry;
    legacyIndicatorMenu = this._register(this.menuService.createMenu(MenuId.StatusBarWindowIndicatorMenu, this.contextKeyService)); // to be removed once migration completed
    remoteIndicatorMenu = this._register(this.menuService.createMenu(MenuId.StatusBarRemoteIndicatorMenu, this.contextKeyService));
    remoteMenuActionsGroups;
    remoteAuthority = this.environmentService.remoteAuthority;
    virtualWorkspaceLocation = undefined;
    connectionState = undefined;
    connectionStateContextKey = new RawContextKey('remoteConnectionState', '').bindTo(this.contextKeyService);
    loggedInvalidGroupNames = Object.create(null);
    constructor(statusbarService, environmentService, labelService, contextKeyService, menuService, quickInputService, commandService, extensionService, remoteAgentService, remoteAuthorityResolverService, hostService, workspaceContextService, logService, extensionGalleryService) {
        super();
        this.statusbarService = statusbarService;
        this.environmentService = environmentService;
        this.labelService = labelService;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this.quickInputService = quickInputService;
        this.commandService = commandService;
        this.extensionService = extensionService;
        this.remoteAgentService = remoteAgentService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this.hostService = hostService;
        this.workspaceContextService = workspaceContextService;
        this.logService = logService;
        this.extensionGalleryService = extensionGalleryService;
        // Set initial connection state
        if (this.remoteAuthority) {
            this.connectionState = 'initializing';
            this.connectionStateContextKey.set(this.connectionState);
        }
        else {
            this.updateVirtualWorkspaceLocation();
        }
        this.registerActions();
        this.registerListeners();
        this.updateWhenInstalledExtensionsRegistered();
        this.updateRemoteStatusIndicator();
    }
    registerActions() {
        const category = { value: nls.localize('remote.category', "Remote"), original: 'Remote' };
        // Show Remote Menu
        const that = this;
        registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID,
                    category,
                    title: { value: nls.localize('remote.showMenu', "Show Remote Menu"), original: 'Show Remote Menu' },
                    f1: true,
                });
            }
            run = () => that.showRemoteMenu();
        });
        // Close Remote Connection
        if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
            registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                        category,
                        title: { value: nls.localize('remote.close', "Close Remote Connection"), original: 'Close Remote Connection' },
                        f1: true,
                        precondition: ContextKeyExpr.or(RemoteNameContext, VirtualWorkspaceContext)
                    });
                }
                run = () => that.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
            });
            if (this.remoteAuthority) {
                MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
                    group: '6_close',
                    command: {
                        id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                        title: nls.localize({ key: 'miCloseRemote', comment: ['&& denotes a mnemonic'] }, "Close Re&&mote Connection")
                    },
                    order: 3.5
                });
            }
        }
        if (this.extensionGalleryService.isEnabled()) {
            registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: RemoteStatusIndicator.INSTALL_REMOTE_EXTENSIONS_ID,
                        category,
                        title: { value: nls.localize('remote.install', "Install Remote Development Extensions"), original: 'Install Remote Development Extensions' },
                        f1: true
                    });
                }
                run = (accessor, input) => {
                    const paneCompositeService = accessor.get(IPaneCompositePartService);
                    return paneCompositeService.openPaneComposite(VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true).then(viewlet => {
                        if (viewlet) {
                            (viewlet?.getViewPaneContainer()).search(`tag:"remote-menu"`);
                            viewlet.focus();
                        }
                    });
                };
            });
        }
    }
    registerListeners() {
        // Menu changes
        const updateRemoteActions = () => {
            this.remoteMenuActionsGroups = undefined;
            this.updateRemoteStatusIndicator();
        };
        this._register(this.legacyIndicatorMenu.onDidChange(updateRemoteActions));
        this._register(this.remoteIndicatorMenu.onDidChange(updateRemoteActions));
        // Update indicator when formatter changes as it may have an impact on the remote label
        this._register(this.labelService.onDidChangeFormatters(() => this.updateRemoteStatusIndicator()));
        // Update based on remote indicator changes if any
        const remoteIndicator = this.environmentService.options?.windowIndicator;
        if (remoteIndicator && remoteIndicator.onDidChange) {
            this._register(remoteIndicator.onDidChange(() => this.updateRemoteStatusIndicator()));
        }
        // Listen to changes of the connection
        if (this.remoteAuthority) {
            const connection = this.remoteAgentService.getConnection();
            if (connection) {
                this._register(connection.onDidStateChange((e) => {
                    switch (e.type) {
                        case 0 /* PersistentConnectionEventType.ConnectionLost */:
                        case 2 /* PersistentConnectionEventType.ReconnectionRunning */:
                        case 1 /* PersistentConnectionEventType.ReconnectionWait */:
                            this.setState('reconnecting');
                            break;
                        case 3 /* PersistentConnectionEventType.ReconnectionPermanentFailure */:
                            this.setState('disconnected');
                            break;
                        case 4 /* PersistentConnectionEventType.ConnectionGain */:
                            this.setState('connected');
                            break;
                    }
                }));
            }
        }
        else {
            this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => {
                this.updateVirtualWorkspaceLocation();
                this.updateRemoteStatusIndicator();
            }));
        }
    }
    updateVirtualWorkspaceLocation() {
        this.virtualWorkspaceLocation = getVirtualWorkspaceLocation(this.workspaceContextService.getWorkspace());
    }
    async updateWhenInstalledExtensionsRegistered() {
        await this.extensionService.whenInstalledExtensionsRegistered();
        const remoteAuthority = this.remoteAuthority;
        if (remoteAuthority) {
            // Try to resolve the authority to figure out connection state
            (async () => {
                try {
                    await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority);
                    this.setState('connected');
                }
                catch (error) {
                    this.setState('disconnected');
                }
            })();
        }
        this.updateRemoteStatusIndicator();
    }
    setState(newState) {
        if (this.connectionState !== newState) {
            this.connectionState = newState;
            // simplify context key which doesn't support `connecting`
            if (this.connectionState === 'reconnecting') {
                this.connectionStateContextKey.set('disconnected');
            }
            else {
                this.connectionStateContextKey.set(this.connectionState);
            }
            this.updateRemoteStatusIndicator();
        }
    }
    validatedGroup(group) {
        if (!group.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/)) {
            if (!this.loggedInvalidGroupNames[group]) {
                this.loggedInvalidGroupNames[group] = true;
                this.logService.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`);
            }
            return false;
        }
        return true;
    }
    getRemoteMenuActions(doNotUseCache) {
        if (!this.remoteMenuActionsGroups || doNotUseCache) {
            this.remoteMenuActionsGroups = this.remoteIndicatorMenu.getActions().filter(a => this.validatedGroup(a[0])).concat(this.legacyIndicatorMenu.getActions());
        }
        return this.remoteMenuActionsGroups;
    }
    updateRemoteStatusIndicator() {
        // Remote Indicator: show if provided via options, e.g. by the web embedder API
        const remoteIndicator = this.environmentService.options?.windowIndicator;
        if (remoteIndicator) {
            this.renderRemoteStatusIndicator(truncate(remoteIndicator.label, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH), remoteIndicator.tooltip, remoteIndicator.command);
            return;
        }
        // Show for remote windows on the desktop, but not when in code server web
        if (this.remoteAuthority && (!isWeb || this.environmentService.options?.webSocketFactory)) {
            const hostLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, this.remoteAuthority) || this.remoteAuthority;
            switch (this.connectionState) {
                case 'initializing':
                    this.renderRemoteStatusIndicator(nls.localize('host.open', "Opening Remote..."), nls.localize('host.open', "Opening Remote..."), undefined, true /* progress */);
                    break;
                case 'reconnecting':
                    this.renderRemoteStatusIndicator(`${nls.localize('host.reconnecting', "Reconnecting to {0}...", truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`, undefined, undefined, true);
                    break;
                case 'disconnected':
                    this.renderRemoteStatusIndicator(`$(alert) ${nls.localize('disconnectedFrom', "Disconnected from {0}", truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`);
                    break;
                default: {
                    const tooltip = new MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                    const hostNameTooltip = this.labelService.getHostTooltip(Schemas.vscodeRemote, this.remoteAuthority);
                    if (hostNameTooltip) {
                        tooltip.appendMarkdown(hostNameTooltip);
                    }
                    else {
                        tooltip.appendText(nls.localize({ key: 'host.tooltip', comment: ['{0} is a remote host name, e.g. Dev Container'] }, "Editing on {0}", hostLabel));
                    }
                    this.renderRemoteStatusIndicator(`$(remote) ${truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
                }
            }
            return;
        }
        // Show when in a virtual workspace
        if (this.virtualWorkspaceLocation) {
            // Workspace with label: indicate editing source
            const workspaceLabel = this.labelService.getHostLabel(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
            if (workspaceLabel) {
                const tooltip = new MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                const hostNameTooltip = this.labelService.getHostTooltip(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
                if (hostNameTooltip) {
                    tooltip.appendMarkdown(hostNameTooltip);
                }
                else {
                    tooltip.appendText(nls.localize({ key: 'workspace.tooltip', comment: ['{0} is a remote workspace name, e.g. GitHub'] }, "Editing on {0}", workspaceLabel));
                }
                if (!isWeb || this.remoteAuthority) {
                    tooltip.appendMarkdown('\n\n');
                    tooltip.appendMarkdown(nls.localize({ key: 'workspace.tooltip2', comment: ['[features are not available]({1}) is a link. Only translate `features are not available`. Do not change brackets and parentheses or {0}'] }, "Some [features are not available]({0}) for resources located on a virtual file system.", `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`));
                }
                this.renderRemoteStatusIndicator(`$(remote) ${truncate(workspaceLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
                return;
            }
        }
        // Show when there are commands other than the 'install additional remote extensions' command.
        if (this.hasRemoteMenuCommands(true)) {
            this.renderRemoteStatusIndicator(`$(remote)`, nls.localize('noHost.tooltip', "Open a Remote Window"));
            return;
        }
        // No Remote Extensions: hide status indicator
        dispose(this.remoteStatusEntry);
        this.remoteStatusEntry = undefined;
    }
    renderRemoteStatusIndicator(text, tooltip, command, showProgress) {
        const name = nls.localize('remoteHost', "Remote Host");
        if (typeof command !== 'string' && (this.hasRemoteMenuCommands(false))) {
            command = RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID;
        }
        const ariaLabel = getCodiconAriaLabel(text);
        const properties = {
            name,
            backgroundColor: themeColorFromId(STATUS_BAR_HOST_NAME_BACKGROUND),
            color: themeColorFromId(STATUS_BAR_HOST_NAME_FOREGROUND),
            ariaLabel,
            text,
            showProgress,
            tooltip,
            command
        };
        if (this.remoteStatusEntry) {
            this.remoteStatusEntry.update(properties);
        }
        else {
            this.remoteStatusEntry = this.statusbarService.addEntry(properties, 'status.host', 0 /* StatusbarAlignment.LEFT */, Number.MAX_VALUE /* first entry */);
        }
    }
    showRemoteMenu() {
        const getCategoryLabel = (action) => {
            if (action.item.category) {
                return typeof action.item.category === 'string' ? action.item.category : action.item.category.value;
            }
            return undefined;
        };
        const matchCurrentRemote = () => {
            if (this.remoteAuthority) {
                return new RegExp(`^remote_\\d\\d_${getRemoteName(this.remoteAuthority)}_`);
            }
            else if (this.virtualWorkspaceLocation) {
                return new RegExp(`^virtualfs_\\d\\d_${this.virtualWorkspaceLocation.scheme}_`);
            }
            return undefined;
        };
        const computeItems = () => {
            let actionGroups = this.getRemoteMenuActions(true);
            const items = [];
            const currentRemoteMatcher = matchCurrentRemote();
            if (currentRemoteMatcher) {
                // commands for the current remote go first
                actionGroups = actionGroups.sort((g1, g2) => {
                    const isCurrentRemote1 = currentRemoteMatcher.test(g1[0]);
                    const isCurrentRemote2 = currentRemoteMatcher.test(g2[0]);
                    if (isCurrentRemote1 !== isCurrentRemote2) {
                        return isCurrentRemote1 ? -1 : 1;
                    }
                    return g1[0].localeCompare(g2[0]);
                });
            }
            let lastCategoryName = undefined;
            for (const actionGroup of actionGroups) {
                let hasGroupCategory = false;
                for (const action of actionGroup[1]) {
                    if (action instanceof MenuItemAction) {
                        if (!hasGroupCategory) {
                            const category = getCategoryLabel(action);
                            if (category !== lastCategoryName) {
                                items.push({ type: 'separator', label: category });
                                lastCategoryName = category;
                            }
                            hasGroupCategory = true;
                        }
                        const label = typeof action.item.title === 'string' ? action.item.title : action.item.title.value;
                        items.push({
                            type: 'item',
                            id: action.item.id,
                            label
                        });
                    }
                }
            }
            items.push({
                type: 'separator'
            });
            const entriesBeforeConfig = items.length;
            if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
                if (this.remoteAuthority) {
                    items.push({
                        type: 'item',
                        id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                        label: nls.localize('closeRemoteConnection.title', 'Close Remote Connection')
                    });
                    if (this.connectionState === 'disconnected') {
                        items.push({
                            type: 'item',
                            id: ReloadWindowAction.ID,
                            label: nls.localize('reloadWindow', 'Reload Window')
                        });
                    }
                }
                else if (this.virtualWorkspaceLocation) {
                    items.push({
                        type: 'item',
                        id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
                        label: nls.localize('closeVirtualWorkspace.title', 'Close Remote Workspace')
                    });
                }
            }
            if (!this.remoteAuthority && !this.virtualWorkspaceLocation && this.extensionGalleryService.isEnabled()) {
                items.push({
                    id: RemoteStatusIndicator.INSTALL_REMOTE_EXTENSIONS_ID,
                    label: nls.localize('installRemotes', "Install Additional Remote Extensions..."),
                    alwaysShow: true
                });
            }
            if (items.length === entriesBeforeConfig) {
                items.pop(); // remove the separator again
            }
            return items;
        };
        const quickPick = this.quickInputService.createQuickPick();
        quickPick.placeholder = nls.localize('remoteActions', "Select an option to open a Remote Window");
        quickPick.items = computeItems();
        quickPick.sortByLabel = false;
        quickPick.canSelectMany = false;
        once(quickPick.onDidAccept)((_ => {
            const selectedItems = quickPick.selectedItems;
            if (selectedItems.length === 1) {
                this.commandService.executeCommand(selectedItems[0].id);
            }
            quickPick.hide();
        }));
        // refresh the items when actions change
        const legacyItemUpdater = this.legacyIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
        quickPick.onDidHide(legacyItemUpdater.dispose);
        const itemUpdater = this.remoteIndicatorMenu.onDidChange(() => quickPick.items = computeItems());
        quickPick.onDidHide(itemUpdater.dispose);
        quickPick.show();
    }
    hasRemoteMenuCommands(ignoreInstallAdditional) {
        if (this.remoteAuthority !== undefined || this.virtualWorkspaceLocation !== undefined) {
            if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
                return true;
            }
        }
        else if (!ignoreInstallAdditional && this.extensionGalleryService.isEnabled()) {
            return true;
        }
        return this.getRemoteMenuActions().length > 0;
    }
};
RemoteStatusIndicator = __decorate([
    __param(0, IStatusbarService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __param(2, ILabelService),
    __param(3, IContextKeyService),
    __param(4, IMenuService),
    __param(5, IQuickInputService),
    __param(6, ICommandService),
    __param(7, IExtensionService),
    __param(8, IRemoteAgentService),
    __param(9, IRemoteAuthorityResolverService),
    __param(10, IHostService),
    __param(11, IWorkspaceContextService),
    __param(12, ILogService),
    __param(13, IExtensionGalleryService)
], RemoteStatusIndicator);
export { RemoteStatusIndicator };
