import { TestResultState, TestRunProfileBitset } from 'vs/workbench/contrib/testing/common/testTypes';
export declare const enum Testing {
    ViewletId = "workbench.view.extension.test",
    ExplorerViewId = "workbench.view.testing",
    OutputPeekContributionId = "editor.contrib.testingOutputPeek",
    DecorationsContributionId = "editor.contrib.testingDecorations"
}
export declare const enum TestExplorerViewMode {
    List = "list",
    Tree = "true"
}
export declare const enum TestExplorerViewSorting {
    ByLocation = "location",
    ByStatus = "status",
    ByDuration = "duration"
}
export declare const enum TestExplorerStateFilter {
    OnlyFailed = "failed",
    OnlyExecuted = "excuted",
    All = "all"
}
export declare const testStateNames: {
    [K in TestResultState]: string;
};
export declare const labelForTestInState: (label: string, state: TestResultState) => string;
export declare const testConfigurationGroupNames: Partial<Record<TestRunProfileBitset, string | undefined>>;
export declare const enum TestCommandId {
    CancelTestRefreshAction = "testing.cancelTestRefresh",
    CancelTestRunAction = "testing.cancelRun",
    ClearTestResultsAction = "testing.clearTestResults",
    CollapseAllAction = "testing.collapseAll",
    ConfigureTestProfilesAction = "testing.configureProfile",
    DebugAction = "testing.debug",
    DebugAllAction = "testing.debugAll",
    DebugAtCursor = "testing.debugAtCursor",
    DebugCurrentFile = "testing.debugCurrentFile",
    DebugFailedTests = "testing.debugFailTests",
    DebugLastRun = "testing.debugLastRun",
    DebugSelectedAction = "testing.debugSelected",
    FilterAction = "workbench.actions.treeView.testExplorer.filter",
    GoToTest = "testing.editFocusedTest",
    HideTestAction = "testing.hideTest",
    OpenOutputPeek = "testing.openOutputPeek",
    RefreshTestsAction = "testing.refreshTests",
    ReRunFailedTests = "testing.reRunFailTests",
    ReRunLastRun = "testing.reRunLastRun",
    RunAction = "testing.run",
    RunAllAction = "testing.runAll",
    RunAtCursor = "testing.runAtCursor",
    RunCurrentFile = "testing.runCurrentFile",
    RunSelectedAction = "testing.runSelected",
    RunUsingProfileAction = "testing.runUsing",
    SearchForTestExtension = "testing.searchForTestExtension",
    SelectDefaultTestProfiles = "testing.selectDefaultTestProfiles",
    ShowMostRecentOutputAction = "testing.showMostRecentOutput",
    TestingSortByDurationAction = "testing.sortByDuration",
    TestingSortByLocationAction = "testing.sortByLocation",
    TestingSortByStatusAction = "testing.sortByStatus",
    TestingViewAsListAction = "testing.viewAsList",
    TestingViewAsTreeAction = "testing.viewAsTree",
    ToggleAutoRun = "testing.toggleautoRun",
    ToggleInlineTestOutput = "testing.toggleInlineTestOutput",
    UnhideTestAction = "testing.unhideTest",
    UnhideAllTestsAction = "testing.unhideAllTests"
}
