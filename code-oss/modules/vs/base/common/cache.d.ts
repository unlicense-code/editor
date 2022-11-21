import { CancellationToken } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
export interface CacheResult<T> extends IDisposable {
    promise: Promise<T>;
}
export declare class Cache<T> {
    private task;
    private result;
    constructor(task: (ct: CancellationToken) => Promise<T>);
    get(): CacheResult<T>;
}
/**
 * Uses a LRU cache to make a given parametrized function cached.
 * Caches just the last value.
 * The key must be JSON serializable.
*/
export declare class LRUCachedFunction<TArg, TComputed> {
    private readonly fn;
    private lastCache;
    private lastArgKey;
    constructor(fn: (arg: TArg) => TComputed);
    get(arg: TArg): TComputed;
}
/**
 * Uses an unbounded cache (referential equality) to memoize the results of the given function.
*/
export declare class CachedFunction<TArg, TValue> {
    private readonly fn;
    private readonly _map;
    get cachedValues(): ReadonlyMap<TArg, TValue>;
    constructor(fn: (arg: TArg) => TValue);
    get(arg: TArg): TValue;
}
