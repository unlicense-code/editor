/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are strings.
 */
export declare type IStringDictionary<V> = Record<string, V>;
/**
 * An interface for a JavaScript object that
 * acts a dictionary. The keys are numbers.
 */
export declare type INumberDictionary<V> = Record<number, V>;
/**
 * Groups the collection into a dictionary based on the provided
 * group function.
 */
export declare function groupBy<K extends string | number | symbol, V>(data: V[], groupFn: (element: V) => K): Record<K, V[]>;
export declare function diffSets<T>(before: Set<T>, after: Set<T>): {
    removed: T[];
    added: T[];
};
export declare function diffMaps<K, V>(before: Map<K, V>, after: Map<K, V>): {
    removed: V[];
    added: V[];
};
export declare class SetMap<K, V> {
    private map;
    add(key: K, value: V): void;
    delete(key: K, value: V): void;
    forEach(key: K, fn: (value: V) => void): void;
}
