import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { StringBuilder } from 'vs/editor/common/core/stringBuilder';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { ViewportData } from 'vs/editor/common/viewLayout/viewLinesViewportData';
/**
 * Represents a visible line
 */
export interface IVisibleLine extends ILine {
    getDomNode(): HTMLElement | null;
    setDomNode(domNode: HTMLElement): void;
    /**
     * Return null if the HTML should not be touched.
     * Return the new HTML otherwise.
     */
    renderLine(lineNumber: number, deltaTop: number, viewportData: ViewportData, sb: StringBuilder): boolean;
    /**
     * Layout the line.
     */
    layoutLine(lineNumber: number, deltaTop: number): void;
}
export interface ILine {
    onContentChanged(): void;
    onTokensChanged(): void;
}
export declare class RenderedLinesCollection<T extends ILine> {
    private readonly _createLine;
    private _lines;
    private _rendLineNumberStart;
    constructor(createLine: () => T);
    flush(): void;
    _set(rendLineNumberStart: number, lines: T[]): void;
    _get(): {
        rendLineNumberStart: number;
        lines: T[];
    };
    /**
     * @returns Inclusive line number that is inside this collection
     */
    getStartLineNumber(): number;
    /**
     * @returns Inclusive line number that is inside this collection
     */
    getEndLineNumber(): number;
    getCount(): number;
    getLine(lineNumber: number): T;
    /**
     * @returns Lines that were removed from this collection
     */
    onLinesDeleted(deleteFromLineNumber: number, deleteToLineNumber: number): T[] | null;
    onLinesChanged(changeFromLineNumber: number, changeCount: number): boolean;
    onLinesInserted(insertFromLineNumber: number, insertToLineNumber: number): T[] | null;
    onTokensChanged(ranges: {
        fromLineNumber: number;
        toLineNumber: number;
    }[]): boolean;
}
export interface IVisibleLinesHost<T extends IVisibleLine> {
    createVisibleLine(): T;
}
export declare class VisibleLinesCollection<T extends IVisibleLine> {
    private readonly _host;
    readonly domNode: FastDomNode<HTMLElement>;
    private readonly _linesCollection;
    constructor(host: IVisibleLinesHost<T>);
    private _createDomNode;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    getStartLineNumber(): number;
    getEndLineNumber(): number;
    getVisibleLine(lineNumber: number): T;
    renderLines(viewportData: ViewportData): void;
}
