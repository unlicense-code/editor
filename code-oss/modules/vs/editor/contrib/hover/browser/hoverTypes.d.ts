import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IEditorMouseEvent } from 'vs/editor/browser/editorBrowser';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecoration } from 'vs/editor/common/model';
import { BrandedService, IConstructorSignature } from 'vs/platform/instantiation/common/instantiation';
export interface IHoverPart {
    /**
     * The creator of this hover part.
     */
    readonly owner: IEditorHoverParticipant;
    /**
     * The range where this hover part applies.
     */
    readonly range: Range;
    /**
     * Force the hover to always be rendered at this specific range,
     * even in the case of multiple hover parts.
     */
    readonly forceShowAtRange?: boolean;
    /**
     * If true, the hover item should appear before content
     */
    readonly isBeforeContent?: boolean;
    /**
     * Is this hover part still valid for this new anchor?
     */
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare const enum HoverAnchorType {
    Range = 1,
    ForeignElement = 2
}
export declare class HoverRangeAnchor {
    readonly priority: number;
    readonly range: Range;
    readonly initialMousePosX: number | undefined;
    readonly initialMousePosY: number | undefined;
    readonly type = HoverAnchorType.Range;
    constructor(priority: number, range: Range, initialMousePosX: number | undefined, initialMousePosY: number | undefined);
    equals(other: HoverAnchor): boolean;
    canAdoptVisibleHover(lastAnchor: HoverAnchor, showAtPosition: Position): boolean;
}
export declare class HoverForeignElementAnchor {
    readonly priority: number;
    readonly owner: IEditorHoverParticipant;
    readonly range: Range;
    readonly initialMousePosX: number | undefined;
    readonly initialMousePosY: number | undefined;
    readonly type = HoverAnchorType.ForeignElement;
    constructor(priority: number, owner: IEditorHoverParticipant, range: Range, initialMousePosX: number | undefined, initialMousePosY: number | undefined);
    equals(other: HoverAnchor): boolean;
    canAdoptVisibleHover(lastAnchor: HoverAnchor, showAtPosition: Position): boolean;
}
export declare type HoverAnchor = HoverRangeAnchor | HoverForeignElementAnchor;
export interface IEditorHoverStatusBar {
    addAction(actionOptions: {
        label: string;
        iconClass?: string;
        run: (target: HTMLElement) => void;
        commandId: string;
    }): IEditorHoverAction;
    append(element: HTMLElement): HTMLElement;
}
export interface IEditorHoverAction {
    setEnabled(enabled: boolean): void;
}
export interface IEditorHoverColorPickerWidget {
    layout(): void;
}
export interface IEditorHoverRenderContext {
    /**
     * The fragment where dom elements should be attached.
     */
    readonly fragment: DocumentFragment;
    /**
     * The status bar for actions for this hover.
     */
    readonly statusBar: IEditorHoverStatusBar;
    /**
     * Set if the hover will render a color picker widget.
     */
    setColorPicker(widget: IEditorHoverColorPickerWidget): void;
    /**
     * The contents rendered inside the fragment have been changed, which means that the hover should relayout.
     */
    onContentsChanged(): void;
    /**
     * Hide the hover.
     */
    hide(): void;
}
export interface IEditorHoverParticipant<T extends IHoverPart = IHoverPart> {
    readonly hoverOrdinal: number;
    suggestHoverAnchor?(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): T[];
    computeAsync?(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<T>;
    createLoadingMessage?(anchor: HoverAnchor): T | null;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: T[]): IDisposable;
}
export declare type IEditorHoverParticipantCtor = IConstructorSignature<IEditorHoverParticipant, [ICodeEditor]>;
export declare const HoverParticipantRegistry: {
    _participants: IEditorHoverParticipantCtor[];
    register<Services extends BrandedService[]>(ctor: new (editor: ICodeEditor, ...services: Services) => IEditorHoverParticipant): void;
    getAll(): IEditorHoverParticipantCtor[];
};
