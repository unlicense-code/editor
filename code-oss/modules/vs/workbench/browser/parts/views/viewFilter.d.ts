import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { MenuId } from 'vs/platform/actions/common/actions';
import { Widget } from 'vs/base/browser/ui/widget';
export declare const viewFilterSubmenu: MenuId;
export interface IFilterWidgetOptions {
    readonly text?: string;
    readonly placeholder?: string;
    readonly ariaLabel?: string;
    readonly history?: string[];
    readonly focusContextKey?: string;
}
export declare class FilterWidget extends Widget {
    private readonly options;
    private readonly instantiationService;
    private readonly contextViewService;
    private readonly themeService;
    private readonly keybindingService;
    readonly element: HTMLElement;
    private readonly delayedFilterUpdate;
    private readonly filterInputBox;
    private readonly filterBadge;
    private readonly toolbar;
    private readonly focusContextKey;
    private readonly _onDidChangeFilterText;
    readonly onDidChangeFilterText: import("vs/base/common/event").Event<string>;
    private moreFiltersActionViewItem;
    private isMoreFiltersChecked;
    constructor(options: IFilterWidgetOptions, instantiationService: IInstantiationService, contextViewService: IContextViewService, themeService: IThemeService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    focus(): void;
    blur(): void;
    updateBadge(message: string | undefined): void;
    setFilterText(filterText: string): void;
    getFilterText(): string;
    getHistory(): string[];
    layout(width: number): void;
    checkMoreFilters(checked: boolean): void;
    private createInput;
    private createBadge;
    private createToolBar;
    private onDidInputChange;
    private adjustInputBox;
    private handleKeyboardEvent;
    private onInputKeyDown;
}
