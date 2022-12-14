import 'vs/css!./media/part';
import { Component } from 'vs/workbench/common/component';
import { IThemeService, IColorTheme } from 'vs/platform/theme/common/themeService';
import { Dimension, IDimension } from 'vs/base/browser/dom';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ISerializableView, IViewSize } from 'vs/base/browser/ui/grid/grid';
import { Event, Emitter } from 'vs/base/common/event';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
export interface IPartOptions {
    readonly hasTitle?: boolean;
    readonly borderWidth?: () => number;
}
export interface ILayoutContentResult {
    readonly titleSize: IDimension;
    readonly contentSize: IDimension;
}
/**
 * Parts are layed out in the workbench and have their own layout that
 * arranges an optional title and mandatory content area to show content.
 */
export declare abstract class Part extends Component implements ISerializableView {
    private options;
    protected readonly layoutService: IWorkbenchLayoutService;
    private _dimension;
    get dimension(): Dimension | undefined;
    protected _onDidVisibilityChange: Emitter<boolean>;
    readonly onDidVisibilityChange: Event<boolean>;
    private parent;
    private titleArea;
    private contentArea;
    private partLayout;
    constructor(id: string, options: IPartOptions, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService);
    protected onThemeChange(theme: IColorTheme): void;
    updateStyles(): void;
    /**
     * Note: Clients should not call this method, the workbench calls this
     * method. Calling it otherwise may result in unexpected behavior.
     *
     * Called to create title and content area of the part.
     */
    create(parent: HTMLElement, options?: object): void;
    /**
     * Returns the overall part container.
     */
    getContainer(): HTMLElement | undefined;
    /**
     * Subclasses override to provide a title area implementation.
     */
    protected createTitleArea(parent: HTMLElement, options?: object): HTMLElement | undefined;
    /**
     * Returns the title area container.
     */
    protected getTitleArea(): HTMLElement | undefined;
    /**
     * Subclasses override to provide a content area implementation.
     */
    protected createContentArea(parent: HTMLElement, options?: object): HTMLElement | undefined;
    /**
     * Returns the content area container.
     */
    protected getContentArea(): HTMLElement | undefined;
    /**
     * Layout title and content area in the given dimension.
     */
    protected layoutContents(width: number, height: number): ILayoutContentResult;
    protected _onDidChange: Emitter<IViewSize | undefined>;
    get onDidChange(): Event<IViewSize | undefined>;
    element: HTMLElement;
    abstract minimumWidth: number;
    abstract maximumWidth: number;
    abstract minimumHeight: number;
    abstract maximumHeight: number;
    layout(width: number, height: number, _top: number, _left: number): void;
    setVisible(visible: boolean): void;
    abstract toJSON(): object;
}
