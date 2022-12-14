import { IRange } from 'vs/base/common/range';
export interface IItem {
    size: number;
}
export interface IRangedGroup {
    range: IRange;
    size: number;
}
/**
 * Returns the intersection between a ranged group and a range.
 * Returns `[]` if the intersection is empty.
 */
export declare function groupIntersect(range: IRange, groups: IRangedGroup[]): IRangedGroup[];
/**
 * Shifts a range by that `much`.
 */
export declare function shift({ start, end }: IRange, much: number): IRange;
/**
 * Consolidates a collection of ranged groups.
 *
 * Consolidation is the process of merging consecutive ranged groups
 * that share the same `size`.
 */
export declare function consolidate(groups: IRangedGroup[]): IRangedGroup[];
export declare class RangeMap {
    private groups;
    private _size;
    splice(index: number, deleteCount: number, items?: IItem[]): void;
    /**
     * Returns the number of items in the range map.
     */
    get count(): number;
    /**
     * Returns the sum of the sizes of all items in the range map.
     */
    get size(): number;
    /**
     * Returns the index of the item at the given position.
     */
    indexAt(position: number): number;
    /**
     * Returns the index of the item right after the item at the
     * index of the given position.
     */
    indexAfter(position: number): number;
    /**
     * Returns the start position of the item at the given index.
     */
    positionAt(index: number): number;
}
