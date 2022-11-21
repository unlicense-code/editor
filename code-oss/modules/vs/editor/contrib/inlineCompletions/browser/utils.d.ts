import { IDisposable, IReference } from 'vs/base/common/lifecycle';
import { IRange } from 'vs/editor/common/core/range';
export declare function createDisposableRef<T>(object: T, disposable?: IDisposable): IReference<T>;
export declare function applyEdits(text: string, edits: {
    range: IRange;
    text: string;
}[]): string;
export declare function getReadonlyEmptyArray<T>(): readonly T[];
