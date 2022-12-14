import { IDragAndDropData } from 'vs/base/browser/dnd';
import { IKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { GestureEvent } from 'vs/base/browser/touch';
export interface IListVirtualDelegate<T> {
    getHeight(element: T): number;
    getTemplateId(element: T): string;
    hasDynamicHeight?(element: T): boolean;
    getDynamicHeight?(element: T): number | null;
    setDynamicHeight?(element: T, height: number): void;
}
export interface IListRenderer<T, TTemplateData> {
    readonly templateId: string;
    renderTemplate(container: HTMLElement): TTemplateData;
    renderElement(element: T, index: number, templateData: TTemplateData, height: number | undefined): void;
    disposeElement?(element: T, index: number, templateData: TTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: TTemplateData): void;
}
export interface IListEvent<T> {
    elements: T[];
    indexes: number[];
    browserEvent?: UIEvent;
}
export interface IListMouseEvent<T> {
    browserEvent: MouseEvent;
    element: T | undefined;
    index: number | undefined;
}
export interface IListTouchEvent<T> {
    browserEvent: TouchEvent;
    element: T | undefined;
    index: number | undefined;
}
export interface IListGestureEvent<T> {
    browserEvent: GestureEvent;
    element: T | undefined;
    index: number | undefined;
}
export interface IListDragEvent<T> {
    browserEvent: DragEvent;
    element: T | undefined;
    index: number | undefined;
}
export interface IListContextMenuEvent<T> {
    browserEvent: UIEvent;
    element: T | undefined;
    index: number | undefined;
    anchor: HTMLElement | {
        x: number;
        y: number;
    };
}
export interface IIdentityProvider<T> {
    getId(element: T): {
        toString(): string;
    };
}
export interface IKeyboardNavigationLabelProvider<T> {
    /**
     * Return a keyboard navigation label(s) which will be used by
     * the list for filtering/navigating. Return `undefined` to make
     * an element always match.
     */
    getKeyboardNavigationLabel(element: T): {
        toString(): string | undefined;
    } | {
        toString(): string | undefined;
    }[] | undefined;
}
export interface IKeyboardNavigationDelegate {
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
}
export declare const enum ListDragOverEffect {
    Copy = 0,
    Move = 1
}
export interface IListDragOverReaction {
    accept: boolean;
    effect?: ListDragOverEffect;
    feedback?: number[];
}
export declare const ListDragOverReactions: {
    reject(): IListDragOverReaction;
    accept(): IListDragOverReaction;
};
export interface IListDragAndDrop<T> {
    getDragURI(element: T): string | null;
    getDragLabel?(elements: T[], originalEvent: DragEvent): string | undefined;
    onDragStart?(data: IDragAndDropData, originalEvent: DragEvent): void;
    onDragOver(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, originalEvent: DragEvent): boolean | IListDragOverReaction;
    onDragLeave?(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, originalEvent: DragEvent): void;
    drop(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, originalEvent: DragEvent): void;
    onDragEnd?(originalEvent: DragEvent): void;
}
export declare class ListError extends Error {
    constructor(user: string, message: string);
}
export declare abstract class CachedListVirtualDelegate<T extends object> implements IListVirtualDelegate<T> {
    private cache;
    getHeight(element: T): number;
    protected abstract estimateHeight(element: T): number;
    abstract getTemplateId(element: T): string;
    setDynamicHeight(element: T, height: number): void;
}
