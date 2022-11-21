import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ICodeEditor, IContentWidget, IContentWidgetPosition, IEditorMouseEvent } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { HoverStartMode, HoverStartSource } from 'vs/editor/contrib/hover/browser/hoverOperation';
import { IEditorHoverColorPickerWidget, IHoverPart } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export declare class ContentHoverController extends Disposable {
    private readonly _editor;
    private readonly _instantiationService;
    private readonly _keybindingService;
    private readonly _participants;
    private readonly _widget;
    private readonly _computer;
    private readonly _hoverOperation;
    private _currentResult;
    constructor(_editor: ICodeEditor, _instantiationService: IInstantiationService, _keybindingService: IKeybindingService);
    /**
     * Returns true if the hover shows now or will show.
     */
    maybeShowAt(mouseEvent: IEditorMouseEvent): boolean;
    startShowingAtRange(range: Range, mode: HoverStartMode, source: HoverStartSource, focus: boolean): void;
    /**
     * Returns true if the hover shows now or will show.
     */
    private _startShowingOrUpdateHover;
    private _startHoverOperationIfNecessary;
    private _setCurrentResult;
    hide(): void;
    isColorPickerVisible(): boolean;
    isVisibleFromKeyboard(): boolean;
    containsNode(node: Node): boolean;
    private _addLoadingMessage;
    private _withResult;
    private _renderMessages;
    private static readonly _DECORATION_OPTIONS;
    static computeHoverRanges(editor: ICodeEditor, anchorRange: Range, messages: IHoverPart[]): {
        showAtPosition: Position;
        showAtSecondaryPosition: Position;
        highlightRange: Range;
    };
}
declare class ContentHoverVisibleData {
    readonly colorPicker: IEditorHoverColorPickerWidget | null;
    readonly showAtPosition: Position;
    readonly showAtSecondaryPosition: Position;
    readonly preferAbove: boolean;
    readonly stoleFocus: boolean;
    readonly source: HoverStartSource;
    readonly isBeforeContent: boolean;
    initialMousePosX: number | undefined;
    initialMousePosY: number | undefined;
    readonly disposables: DisposableStore;
    closestMouseDistance: number | undefined;
    constructor(colorPicker: IEditorHoverColorPickerWidget | null, showAtPosition: Position, showAtSecondaryPosition: Position, preferAbove: boolean, stoleFocus: boolean, source: HoverStartSource, isBeforeContent: boolean, initialMousePosX: number | undefined, initialMousePosY: number | undefined, disposables: DisposableStore);
}
export declare class ContentHoverWidget extends Disposable implements IContentWidget {
    private readonly _editor;
    private readonly _contextKeyService;
    static readonly ID = "editor.contrib.contentHoverWidget";
    readonly allowEditorOverflow = true;
    private readonly _hoverVisibleKey;
    private readonly _hover;
    private _visibleData;
    /**
     * Returns `null` if the hover is not visible.
     */
    get position(): Position | null;
    get isColorPickerVisible(): boolean;
    get isVisibleFromKeyboard(): boolean;
    constructor(_editor: ICodeEditor, _contextKeyService: IContextKeyService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    isMouseGettingCloser(posx: number, posy: number): boolean;
    private _setVisibleData;
    private _layout;
    private _updateFont;
    showAt(node: DocumentFragment, visibleData: ContentHoverVisibleData): void;
    hide(): void;
    onContentsChanged(): void;
    clear(): void;
}
export {};
