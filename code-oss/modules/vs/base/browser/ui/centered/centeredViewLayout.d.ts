import { IView, IViewSize } from 'vs/base/browser/ui/grid/grid';
import { IBoundarySashes } from 'vs/base/browser/ui/grid/gridview';
import { ISplitViewStyles } from 'vs/base/browser/ui/splitview/splitview';
import { Color } from 'vs/base/common/color';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
export interface CenteredViewState {
    leftMarginRatio: number;
    rightMarginRatio: number;
}
export interface ICenteredViewStyles extends ISplitViewStyles {
    background: Color;
}
export declare class CenteredViewLayout implements IDisposable {
    private container;
    private view;
    readonly state: CenteredViewState;
    private splitView?;
    private width;
    private height;
    private style;
    private didLayout;
    private emptyViews;
    private readonly splitViewDisposables;
    constructor(container: HTMLElement, view: IView, state?: CenteredViewState);
    get minimumWidth(): number;
    get maximumWidth(): number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    get onDidChange(): Event<IViewSize | undefined>;
    private _boundarySashes;
    get boundarySashes(): IBoundarySashes;
    set boundarySashes(boundarySashes: IBoundarySashes);
    layout(width: number, height: number, top: number, left: number): void;
    private resizeMargins;
    isActive(): boolean;
    styles(style: ICenteredViewStyles): void;
    activate(active: boolean): void;
    isDefault(state: CenteredViewState): boolean;
    dispose(): void;
}
