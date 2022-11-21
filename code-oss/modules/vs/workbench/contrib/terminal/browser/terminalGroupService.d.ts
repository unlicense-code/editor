import { Orientation } from 'vs/base/browser/ui/sash/sash';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IShellLaunchConfig } from 'vs/platform/terminal/common/terminal';
import { IViewDescriptorService, IViewsService } from 'vs/workbench/common/views';
import { ITerminalGroup, ITerminalGroupService, ITerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminal';
export declare class TerminalGroupService extends Disposable implements ITerminalGroupService {
    private _contextKeyService;
    private readonly _instantiationService;
    private readonly _viewsService;
    private readonly _viewDescriptorService;
    private readonly _configurationService;
    _serviceBrand: undefined;
    groups: ITerminalGroup[];
    activeGroupIndex: number;
    get instances(): ITerminalInstance[];
    private _terminalGroupCountContextKey;
    private _container;
    private readonly _onDidChangeActiveGroup;
    readonly onDidChangeActiveGroup: Event<ITerminalGroup | undefined>;
    private readonly _onDidDisposeGroup;
    readonly onDidDisposeGroup: Event<ITerminalGroup>;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    private readonly _onDidShow;
    readonly onDidShow: Event<void>;
    private readonly _onDidDisposeInstance;
    readonly onDidDisposeInstance: Event<ITerminalInstance>;
    private readonly _onDidFocusInstance;
    readonly onDidFocusInstance: Event<ITerminalInstance>;
    private readonly _onDidChangeActiveInstance;
    readonly onDidChangeActiveInstance: Event<ITerminalInstance | undefined>;
    private readonly _onDidChangeInstances;
    readonly onDidChangeInstances: Event<void>;
    private readonly _onDidChangeInstanceCapability;
    readonly onDidChangeInstanceCapability: Event<ITerminalInstance>;
    private readonly _onDidChangePanelOrientation;
    readonly onDidChangePanelOrientation: Event<Orientation>;
    constructor(_contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _viewsService: IViewsService, _viewDescriptorService: IViewDescriptorService, _configurationService: IConfigurationService);
    hidePanel(): void;
    showTabs(): void;
    get activeGroup(): ITerminalGroup | undefined;
    set activeGroup(value: ITerminalGroup | undefined);
    get activeInstance(): ITerminalInstance | undefined;
    setActiveInstance(instance: ITerminalInstance): void;
    private _getIndexFromId;
    setContainer(container: HTMLElement): void;
    focusTabs(): Promise<void>;
    focusActiveInstance(): Promise<void>;
    createGroup(slcOrInstance?: IShellLaunchConfig | ITerminalInstance): ITerminalGroup;
    showPanel(focus?: boolean): Promise<void>;
    getInstanceFromResource(resource: URI | undefined): ITerminalInstance | undefined;
    private _removeGroup;
    /**
     * @param force Whether to force the group change, this should be used when the previous active
     * group has been removed.
     */
    setActiveGroupByIndex(index: number, force?: boolean): void;
    private _getInstanceLocation;
    setActiveInstanceByIndex(index: number): void;
    setActiveGroupToNext(): void;
    setActiveGroupToPrevious(): void;
    moveGroup(source: ITerminalInstance, target: ITerminalInstance): void;
    moveGroupToEnd(source: ITerminalInstance): void;
    moveInstance(source: ITerminalInstance, target: ITerminalInstance, side: 'before' | 'after'): void;
    unsplitInstance(instance: ITerminalInstance): void;
    joinInstances(instances: ITerminalInstance[]): void;
    instanceIsSplit(instance: ITerminalInstance): boolean;
    getGroupForInstance(instance: ITerminalInstance): ITerminalGroup | undefined;
    getGroupLabels(): string[];
    /**
     * Visibility should be updated in the following cases:
     * 1. Toggle `TERMINAL_VIEW_ID` visibility
     * 2. Change active group
     * 3. Change instances in active group
     */
    updateVisibility(): void;
}
