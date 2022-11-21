import 'vs/css!./media/tunnelView';
import { IViewDescriptor, IViewDescriptorService } from 'vs/workbench/common/views';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ICommandService, ICommandHandler } from 'vs/platform/commands/common/commands';
import { Event } from 'vs/base/common/event';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { ILocalizedString } from 'vs/platform/action/common/action';
import { IRemoteExplorerService, TunnelModel, TunnelType, ITunnelItem, Tunnel, TunnelSource } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPane';
import { URI } from 'vs/base/common/uri';
import { ITunnelService, TunnelPrivacyId, TunnelProtocol } from 'vs/platform/tunnel/common/tunnel';
import { TunnelPrivacy } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExternalUriOpenerService } from 'vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
export declare const forwardedPortsViewEnabled: RawContextKey<boolean>;
export declare const openPreviewEnabledContext: RawContextKey<boolean>;
interface ITunnelViewModel {
    readonly onForwardedPortsChanged: Event<void>;
    readonly all: TunnelItem[];
    readonly input: TunnelItem;
    isEmpty(): boolean;
}
export declare class TunnelViewModel implements ITunnelViewModel {
    private readonly remoteExplorerService;
    private readonly tunnelService;
    readonly onForwardedPortsChanged: Event<void>;
    private model;
    private _candidates;
    readonly input: {
        label: string;
        icon: undefined;
        tunnelType: TunnelType;
        hasRunningProcess: boolean;
        remoteHost: string;
        remotePort: number;
        processDescription: string;
        tooltipPostfix: string;
        iconTooltip: string;
        portTooltip: string;
        processTooltip: string;
        originTooltip: string;
        privacyTooltip: string;
        source: {
            source: TunnelSource;
            description: string;
        };
        protocol: TunnelProtocol;
        privacy: {
            id: TunnelPrivacyId;
            themeIcon: string;
            label: string;
        };
        strip: () => undefined;
    };
    constructor(remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService);
    get all(): TunnelItem[];
    private addProcessInfoFromCandidate;
    private get forwarded();
    private get detected();
    isEmpty(): boolean;
}
declare class TunnelItem implements ITunnelItem {
    tunnelType: TunnelType;
    remoteHost: string;
    remotePort: number;
    source: {
        source: TunnelSource;
        description: string;
    };
    hasRunningProcess: boolean;
    protocol: TunnelProtocol;
    localUri?: URI | undefined;
    localAddress?: string | undefined;
    localPort?: number | undefined;
    closeable?: boolean | undefined;
    name?: string | undefined;
    private runningProcess?;
    private pid?;
    private _privacy?;
    private remoteExplorerService?;
    private tunnelService?;
    static createFromTunnel(remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, tunnel: Tunnel, type?: TunnelType, closeable?: boolean): TunnelItem;
    /**
     * Removes all non-serializable properties from the tunnel
     * @returns A new TunnelItem without any services
     */
    strip(): TunnelItem | undefined;
    constructor(tunnelType: TunnelType, remoteHost: string, remotePort: number, source: {
        source: TunnelSource;
        description: string;
    }, hasRunningProcess: boolean, protocol: TunnelProtocol, localUri?: URI | undefined, localAddress?: string | undefined, localPort?: number | undefined, closeable?: boolean | undefined, name?: string | undefined, runningProcess?: string | undefined, pid?: number | undefined, _privacy?: string | undefined, remoteExplorerService?: IRemoteExplorerService | undefined, tunnelService?: ITunnelService | undefined);
    get label(): string;
    set processDescription(description: string | undefined);
    get processDescription(): string | undefined;
    get tooltipPostfix(): string;
    get iconTooltip(): string;
    get portTooltip(): string;
    get processTooltip(): string;
    get originTooltip(): string;
    get privacy(): TunnelPrivacy;
}
export declare class TunnelPanel extends ViewPane {
    protected viewModel: ITunnelViewModel;
    protected quickInputService: IQuickInputService;
    protected commandService: ICommandService;
    private readonly menuService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly contextViewService;
    private readonly hoverService;
    static readonly ID = "~remote.forwardedPorts";
    static readonly TITLE: string;
    private table;
    private tunnelTypeContext;
    private tunnelCloseableContext;
    private tunnelPrivacyContext;
    private tunnelPrivacyEnabledContext;
    private tunnelProtocolContext;
    private tunnelViewFocusContext;
    private tunnelViewSelectionContext;
    private tunnelViewMultiSelectionContext;
    private portChangableContextKey;
    private isEditing;
    private titleActions;
    private lastFocus;
    constructor(viewModel: ITunnelViewModel, options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, openerService: IOpenerService, quickInputService: IQuickInputService, commandService: ICommandService, menuService: IMenuService, themeService: IThemeService, remoteExplorerService: IRemoteExplorerService, telemetryService: ITelemetryService, tunnelService: ITunnelService, contextViewService: IContextViewService, hoverService: IHoverService);
    private registerPrivacyActions;
    get portCount(): number;
    protected renderBody(container: HTMLElement): void;
    shouldShowWelcome(): boolean;
    focus(): void;
    private onFocusChanged;
    private hasOpenLinkModifier;
    private onSelectionChanged;
    private onContextMenu;
    private onMouseDblClick;
    protected layoutBody(height: number, width: number): void;
}
export declare class TunnelPanelDescriptor implements IViewDescriptor {
    readonly id = "~remote.forwardedPorts";
    readonly name: string;
    readonly ctorDescriptor: SyncDescriptor<TunnelPanel>;
    readonly canToggleVisibility = true;
    readonly hideByDefault = false;
    readonly group = "details@0";
    readonly order = -500;
    readonly remoteAuthority?: string | string[];
    readonly canMoveView = true;
    readonly containerIcon: ThemeIcon;
    constructor(viewModel: ITunnelViewModel, environmentService: IWorkbenchEnvironmentService);
}
export declare namespace ForwardPortAction {
    const INLINE_ID = "remote.tunnel.forwardInline";
    const COMMANDPALETTE_ID = "remote.tunnel.forwardCommandPalette";
    const LABEL: ILocalizedString;
    const TREEITEM_LABEL: string;
    function inlineHandler(): ICommandHandler;
    function commandPaletteHandler(): ICommandHandler;
}
export declare namespace OpenPortInBrowserAction {
    const ID = "remote.tunnel.open";
    const LABEL: string;
    function handler(): ICommandHandler;
    function run(model: TunnelModel, openerService: IOpenerService, key: string): Promise<void> | Promise<boolean>;
}
export declare namespace OpenPortInPreviewAction {
    const ID = "remote.tunnel.openPreview";
    const LABEL: string;
    function handler(): ICommandHandler;
    function run(model: TunnelModel, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, key: string): Promise<boolean | void>;
}
export {};
