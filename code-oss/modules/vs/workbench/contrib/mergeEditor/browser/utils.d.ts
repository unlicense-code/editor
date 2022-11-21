import { CompareResult } from 'vs/base/common/arrays';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IObservable } from 'vs/base/common/observable';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { IModelDeltaDecoration } from 'vs/editor/common/model';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class ReentrancyBarrier {
    private _isActive;
    get isActive(): boolean;
    makeExclusive<TFunction extends Function>(fn: TFunction): TFunction;
    runExclusively(fn: () => void): void;
    runExclusivelyOrThrow(fn: () => void): void;
}
export declare function setStyle(element: HTMLElement, style: {
    width?: number | string;
    height?: number | string;
    left?: number | string;
    top?: number | string;
}): void;
export declare function applyObservableDecorations(editor: CodeEditorWidget, decorations: IObservable<IModelDeltaDecoration[]>): IDisposable;
export declare function leftJoin<TLeft, TRight>(left: Iterable<TLeft>, right: readonly TRight[], compare: (left: TLeft, right: TRight) => CompareResult): IterableIterator<{
    left: TLeft;
    rights: TRight[];
}>;
export declare function join<TLeft, TRight>(left: Iterable<TLeft>, right: readonly TRight[], compare: (left: TLeft, right: TRight) => CompareResult): IterableIterator<{
    left?: TLeft;
    rights: TRight[];
}>;
export declare function concatArrays<TArr extends any[]>(...arrays: TArr): TArr[number][number][];
export declare function elementAtOrUndefined<T>(arr: T[], index: number): T | undefined;
export declare function thenIfNotDisposed<T>(promise: Promise<T>, then: () => void): IDisposable;
export declare function setFields<T extends {}>(obj: T, fields: Partial<T>): T;
export declare function deepMerge<T extends {}>(source1: T, source2: Partial<T>): T;
export declare class PersistentStore<T> {
    private readonly key;
    private readonly storageService;
    private hasValue;
    private value;
    constructor(key: string, storageService: IStorageService);
    get(): Readonly<T> | undefined;
    set(newValue: T | undefined): void;
}
