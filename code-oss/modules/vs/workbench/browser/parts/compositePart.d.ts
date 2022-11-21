import 'vs/css!./media/compositepart';
import { Emitter } from 'vs/base/common/event';
import { IActionViewItem } from 'vs/base/browser/ui/actionbar/actionbar';
import { IAction } from 'vs/base/common/actions';
import { Part, IPartOptions } from 'vs/workbench/browser/part';
import { Composite, CompositeRegistry } from 'vs/workbench/browser/composite';
import { IComposite } from 'vs/workbench/common/composite';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProgressIndicator } from 'vs/platform/progress/common/progress';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { AnchorAlignment } from 'vs/base/browser/ui/contextview/contextview';
import { WorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
export interface ICompositeTitleLabel {
    /**
     * Asks to update the title for the composite with the given ID.
     */
    updateTitle(id: string, title: string, keybinding?: string): void;
    /**
     * Called when theming information changes.
     */
    updateStyles(): void;
}
export declare abstract class CompositePart<T extends Composite> extends Part {
    private readonly notificationService;
    protected readonly storageService: IStorageService;
    private readonly telemetryService;
    protected readonly contextMenuService: IContextMenuService;
    protected readonly keybindingService: IKeybindingService;
    protected readonly instantiationService: IInstantiationService;
    protected readonly registry: CompositeRegistry<T>;
    private readonly activeCompositeSettingsKey;
    private readonly defaultCompositeId;
    private readonly nameForTelemetry;
    private readonly compositeCSSClass;
    private readonly titleForegroundColor;
    protected readonly onDidCompositeOpen: Emitter<{
        composite: IComposite;
        focus: boolean;
    }>;
    protected readonly onDidCompositeClose: Emitter<IComposite>;
    protected toolBar: WorkbenchToolBar | undefined;
    protected titleLabelElement: HTMLElement | undefined;
    private readonly mapCompositeToCompositeContainer;
    private readonly mapActionsBindingToComposite;
    private activeComposite;
    private lastActiveCompositeId;
    private readonly instantiatedCompositeItems;
    private titleLabel;
    private progressBar;
    private contentAreaSize;
    private readonly telemetryActionsListener;
    private currentCompositeOpenToken;
    constructor(notificationService: INotificationService, storageService: IStorageService, telemetryService: ITelemetryService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, themeService: IThemeService, registry: CompositeRegistry<T>, activeCompositeSettingsKey: string, defaultCompositeId: string, nameForTelemetry: string, compositeCSSClass: string, titleForegroundColor: string | undefined, id: string, options: IPartOptions);
    protected openComposite(id: string, focus?: boolean): Composite | undefined;
    private doOpenComposite;
    protected createComposite(id: string, isActive?: boolean): Composite;
    protected showComposite(composite: Composite): void;
    protected onTitleAreaUpdate(compositeId: string): void;
    private updateTitle;
    private collectCompositeActions;
    protected getActiveComposite(): IComposite | undefined;
    protected getLastActiveCompositetId(): string;
    protected hideActiveComposite(): Composite | undefined;
    createTitleArea(parent: HTMLElement): HTMLElement;
    protected createTitleLabel(parent: HTMLElement): ICompositeTitleLabel;
    updateStyles(): void;
    protected actionViewItemProvider(action: IAction): IActionViewItem | undefined;
    protected actionsContextProvider(): unknown;
    createContentArea(parent: HTMLElement): HTMLElement;
    getProgressIndicator(id: string): IProgressIndicator | undefined;
    protected getTitleAreaDropDownAnchorAlignment(): AnchorAlignment;
    layout(width: number, height: number, top: number, left: number): void;
    protected removeComposite(compositeId: string): boolean;
    dispose(): void;
}
