import { IHorizontalSashLayoutProvider } from 'vs/base/browser/ui/sash/sash';
import { Color } from 'vs/base/common/color';
import { DisposableStore } from 'vs/base/common/lifecycle';
import 'vs/css!./zoneWidget';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, IViewZone } from 'vs/editor/browser/editorBrowser';
import { IPosition, Position } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
export interface IOptions {
    showFrame?: boolean;
    showArrow?: boolean;
    frameWidth?: number;
    className?: string;
    isAccessible?: boolean;
    isResizeable?: boolean;
    frameColor?: Color;
    arrowColor?: Color;
    keepEditorSelection?: boolean;
}
export interface IStyles {
    frameColor?: Color | null;
    arrowColor?: Color | null;
}
export declare class ViewZoneDelegate implements IViewZone {
    domNode: HTMLElement;
    id: string;
    afterLineNumber: number;
    afterColumn: number;
    heightInLines: number;
    private readonly _onDomNodeTop;
    private readonly _onComputedHeight;
    constructor(domNode: HTMLElement, afterLineNumber: number, afterColumn: number, heightInLines: number, onDomNodeTop: (top: number) => void, onComputedHeight: (height: number) => void);
    onDomNodeTop(top: number): void;
    onComputedHeight(height: number): void;
}
export declare class OverlayWidgetDelegate implements IOverlayWidget {
    private readonly _id;
    private readonly _domNode;
    constructor(id: string, domNode: HTMLElement);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
}
export declare abstract class ZoneWidget implements IHorizontalSashLayoutProvider {
    private _arrow;
    private _overlayWidget;
    private _resizeSash;
    private readonly _positionMarkerId;
    protected _viewZone: ViewZoneDelegate | null;
    protected readonly _disposables: DisposableStore;
    container: HTMLElement | null;
    domNode: HTMLElement;
    editor: ICodeEditor;
    options: IOptions;
    constructor(editor: ICodeEditor, options?: IOptions);
    dispose(): void;
    create(): void;
    style(styles: IStyles): void;
    protected _applyStyles(): void;
    private _getWidth;
    private _getLeft;
    private _onViewZoneTop;
    private _onViewZoneHeight;
    get position(): Position | undefined;
    protected _isShowing: boolean;
    show(rangeOrPos: IRange | IPosition, heightInLines: number): void;
    hide(): void;
    private _decoratingElementsHeight;
    private _showImpl;
    protected revealLine(lineNumber: number, isLastLine: boolean): void;
    protected setCssClass(className: string, classToReplace?: string): void;
    protected abstract _fillContainer(container: HTMLElement): void;
    protected _onWidth(widthInPixel: number): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    protected _relayout(newHeightInLines: number): void;
    private _initSash;
    getHorizontalSashLeft(): number;
    getHorizontalSashTop(): number;
    getHorizontalSashWidth(): number;
}
