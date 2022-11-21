import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { InternalTestItem } from 'vs/workbench/contrib/testing/common/testTypes';
export declare class TestExclusions extends Disposable {
    private readonly storageService;
    private readonly excluded;
    constructor(storageService: IStorageService);
    /**
     * Event that fires when the excluded tests change.
     */
    readonly onTestExclusionsChanged: Event<unknown>;
    /**
     * Gets whether there's any excluded tests.
     */
    get hasAny(): boolean;
    /**
     * Gets all excluded tests.
     */
    get all(): Iterable<string>;
    /**
     * Sets whether a test is excluded.
     */
    toggle(test: InternalTestItem, exclude?: boolean): void;
    /**
     * Gets whether a test is excluded.
     */
    contains(test: InternalTestItem): boolean;
    /**
     * Removes all test exclusions.
     */
    clear(): void;
}
