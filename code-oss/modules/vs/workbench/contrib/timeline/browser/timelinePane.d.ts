import 'vs/css!./media/timelinePane';
import { ILabelService } from 'vs/platform/label/common/label';
import { URI } from 'vs/base/common/uri';
import { IListVirtualDelegate, IIdentityProvider, IKeyboardNavigationLabelProvider } from 'vs/base/browser/ui/list/list';
import { ViewPane, IViewPaneOptions } from 'vs/workbench/browser/parts/views/viewPane';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITimelineService, TimelineItem } from 'vs/workbench/contrib/timeline/common/timeline';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IStorageService } from 'vs/platform/storage/common/storage';
declare type TreeElement = TimelineItem | LoadMoreCommand;
declare class LoadMoreCommand {
    readonly handle = "vscode-command:loadMore";
    readonly timestamp = 0;
    readonly description: undefined;
    readonly tooltip: undefined;
    readonly contextValue: undefined;
    readonly id: undefined;
    readonly icon: undefined;
    readonly iconDark: undefined;
    readonly source: undefined;
    readonly relativeTime: undefined;
    readonly relativeTimeFullWord: undefined;
    readonly hideRelativeTime: undefined;
    constructor(loading: boolean);
    private _loading;
    get loading(): boolean;
    set loading(value: boolean);
    get ariaLabel(): string;
    get label(): string;
    get themeIcon(): ThemeIcon | undefined;
}
export declare const TimelineFollowActiveEditorContext: RawContextKey<boolean>;
export declare const TimelineExcludeSources: RawContextKey<string>;
export declare class TimelinePane extends ViewPane {
    private readonly storageService;
    protected editorService: IEditorService;
    protected commandService: ICommandService;
    private readonly progressService;
    protected timelineService: ITimelineService;
    private readonly labelService;
    private readonly uriIdentityService;
    private readonly extensionService;
    static readonly TITLE: string;
    private $container;
    private $message;
    private $tree;
    private tree;
    private treeRenderer;
    private commands;
    private visibilityDisposables;
    private followActiveEditorContext;
    private timelineExcludeSourcesContext;
    private excludedSources;
    private pendingRequests;
    private timelinesBySource;
    private uri;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, storageService: IStorageService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, editorService: IEditorService, commandService: ICommandService, progressService: IProgressService, timelineService: ITimelineService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, labelService: ILabelService, uriIdentityService: IUriIdentityService, extensionService: IExtensionService);
    private _followActiveEditor;
    get followActiveEditor(): boolean;
    set followActiveEditor(value: boolean);
    private _pageOnScroll;
    get pageOnScroll(): boolean;
    get pageSize(): number;
    reset(): void;
    setUri(uri: URI): void;
    private setUriCore;
    private onStorageServiceChanged;
    private onConfigurationChanged;
    private onActiveEditorChanged;
    private onProvidersChanged;
    private onTimelineChanged;
    private _filename;
    updateFilename(filename: string | undefined): void;
    private _message;
    get message(): string | undefined;
    set message(message: string | undefined);
    private updateMessage;
    private showMessage;
    private hideMessage;
    private resetMessageElement;
    private _isEmpty;
    private _maxItemCount;
    private _visibleItemCount;
    private get hasVisibleItems();
    private clear;
    private loadTimeline;
    private loadTimelineForSource;
    private updateTimeline;
    private _pendingRefresh;
    private handleRequest;
    private getItems;
    private refresh;
    private refreshDebounced;
    focus(): void;
    setExpanded(expanded: boolean): boolean;
    setVisible(visible: boolean): void;
    protected layoutBody(height: number, width: number): void;
    protected renderHeaderTitle(container: HTMLElement): void;
    protected renderBody(container: HTMLElement): void;
    private loadMore;
    ensureValidItems(): boolean;
    setLoadingUriMessage(): void;
    private onContextMenu;
}
export declare class TimelineIdentityProvider implements IIdentityProvider<TreeElement> {
    getId(item: TreeElement): {
        toString(): string;
    };
}
export declare class TimelineKeyboardNavigationLabelProvider implements IKeyboardNavigationLabelProvider<TreeElement> {
    getKeyboardNavigationLabel(element: TreeElement): {
        toString(): string;
    };
}
export declare class TimelineListVirtualDelegate implements IListVirtualDelegate<TreeElement> {
    getHeight(_element: TreeElement): number;
    getTemplateId(element: TreeElement): string;
}
export {};