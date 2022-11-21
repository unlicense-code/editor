/**
 * Throws an error with the provided message if the provided value does not evaluate to a true Javascript value.
 *
 * @deprecated Use `assert(...)` instead.
 * This method is usually used like this:
 * ```ts
 * import * as assert from 'vs/base/common/assert';
 * assert.ok(...);
 * ```
 *
 * However, `assert` in that example is a user chosen name.
 * There is no tooling for generating such an import statement.
 * Thus, the `assert(...)` function should be used instead.
 */
export declare function ok(value?: unknown, message?: string): void;
export declare function assertNever(value: never, message?: string): never;
export declare function assert(condition: boolean): void;
/**
 * condition must be side-effect free!
 */
export declare function assertFn(condition: () => boolean): void;
export declare function checkAdjacentItems<T>(items: readonly T[], predicate: (item1: T, item2: T) => boolean): boolean;
