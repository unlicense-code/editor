import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { TestExplorerViewMode, TestExplorerViewSorting } from 'vs/workbench/contrib/testing/common/constants';
import { TestRunProfileBitset } from 'vs/workbench/contrib/testing/common/testTypes';
export declare namespace TestingContextKeys {
    const providerCount: RawContextKey<0>;
    const canRefreshTests: RawContextKey<false>;
    const isRefreshingTests: RawContextKey<false>;
    const hasDebuggableTests: RawContextKey<false>;
    const hasRunnableTests: RawContextKey<false>;
    const hasCoverableTests: RawContextKey<false>;
    const hasNonDefaultProfile: RawContextKey<false>;
    const hasConfigurableProfile: RawContextKey<false>;
    const capabilityToContextKey: {
        [K in TestRunProfileBitset]: RawContextKey<boolean>;
    };
    const hasAnyResults: RawContextKey<boolean>;
    const viewMode: RawContextKey<TestExplorerViewMode>;
    const viewSorting: RawContextKey<TestExplorerViewSorting>;
    const isRunning: RawContextKey<boolean>;
    const isInPeek: RawContextKey<boolean>;
    const isPeekVisible: RawContextKey<boolean>;
    const autoRun: RawContextKey<boolean>;
    const peekItemType: RawContextKey<string | undefined>;
    const controllerId: RawContextKey<string | undefined>;
    const testItemExtId: RawContextKey<string | undefined>;
    const testItemHasUri: RawContextKey<boolean>;
    const testItemIsHidden: RawContextKey<boolean>;
}
