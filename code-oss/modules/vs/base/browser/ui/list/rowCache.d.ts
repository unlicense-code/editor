import { IDisposable } from 'vs/base/common/lifecycle';
import { IListRenderer } from './list';
export interface IRow {
    domNode: HTMLElement;
    templateId: string;
    templateData: any;
}
export declare class RowCache<T> implements IDisposable {
    private renderers;
    private cache;
    constructor(renderers: Map<string, IListRenderer<T, any>>);
    /**
     * Returns a row either by creating a new one or reusing
     * a previously released row which shares the same templateId.
     */
    alloc(templateId: string): IRow;
    /**
     * Releases the row for eventual reuse.
     */
    release(row: IRow): void;
    private releaseRow;
    private getTemplateCache;
    dispose(): void;
    private getRenderer;
}
