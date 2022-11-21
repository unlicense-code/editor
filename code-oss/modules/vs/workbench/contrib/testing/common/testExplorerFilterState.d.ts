import { Event } from 'vs/base/common/event';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IObservableValue, MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
export interface ITestExplorerFilterState {
    _serviceBrand: undefined;
    /** Current filter text */
    readonly text: IObservableValue<string>;
    /** Test ID the user wants to reveal in the explorer */
    readonly reveal: MutableObservableValue<string | undefined>;
    /** Event that fires when {@link focusInput} is invoked. */
    readonly onDidRequestInputFocus: Event<void>;
    /**
     * Glob list to filter for based on the {@link text}
     */
    readonly globList: readonly {
        include: boolean;
        text: string;
    }[];
    /**
     * The user requested to filter including tags.
     */
    readonly includeTags: ReadonlySet<string>;
    /**
     * The user requested to filter excluding tags.
     */
    readonly excludeTags: ReadonlySet<string>;
    /**
     * Whether fuzzy searching is enabled.
     */
    readonly fuzzy: MutableObservableValue<boolean>;
    /**
     * Focuses the filter input in the test explorer view.
     */
    focusInput(): void;
    /**
     * Replaces the filter {@link text}.
     */
    setText(text: string): void;
    /**
     * Sets whether the {@link text} is filtering for a special term.
     */
    isFilteringFor(term: TestFilterTerm): boolean;
    /**
     * Sets whether the {@link text} includes a special filter term.
     */
    toggleFilteringFor(term: TestFilterTerm, shouldFilter?: boolean): void;
}
export declare const ITestExplorerFilterState: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITestExplorerFilterState>;
export declare class TestExplorerFilterState implements ITestExplorerFilterState {
    private readonly storageService;
    _serviceBrand: undefined;
    private readonly focusEmitter;
    /**
     * Mapping of terms to whether they're included in the text.
     */
    private termFilterState;
    /** @inheritdoc */
    globList: {
        include: boolean;
        text: string;
    }[];
    /** @inheritdoc */
    includeTags: Set<string>;
    /** @inheritdoc */
    excludeTags: Set<string>;
    /** @inheritdoc */
    readonly text: MutableObservableValue<string>;
    /** @inheritdoc */
    readonly fuzzy: MutableObservableValue<boolean>;
    readonly reveal: MutableObservableValue<string | undefined>;
    readonly onDidRequestInputFocus: Event<void>;
    constructor(storageService: IStorageService);
    /** @inheritdoc */
    focusInput(): void;
    /** @inheritdoc */
    setText(text: string): void;
    /** @inheritdoc */
    isFilteringFor(term: TestFilterTerm): boolean;
    /** @inheritdoc */
    toggleFilteringFor(term: TestFilterTerm, shouldFilter?: boolean): void;
}
export declare const enum TestFilterTerm {
    Failed = "@failed",
    Executed = "@executed",
    CurrentDoc = "@doc",
    Hidden = "@hidden"
}
export declare const allTestFilterTerms: readonly TestFilterTerm[];
