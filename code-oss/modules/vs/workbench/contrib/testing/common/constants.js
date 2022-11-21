/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { stripIcons } from 'vs/base/common/iconLabels';
import { localize } from 'vs/nls';
export var Testing;
(function (Testing) {
    // marked as "extension" so that any existing test extensions are assigned to it.
    Testing["ViewletId"] = "workbench.view.extension.test";
    Testing["ExplorerViewId"] = "workbench.view.testing";
    Testing["OutputPeekContributionId"] = "editor.contrib.testingOutputPeek";
    Testing["DecorationsContributionId"] = "editor.contrib.testingDecorations";
})(Testing || (Testing = {}));
export var TestExplorerViewMode;
(function (TestExplorerViewMode) {
    TestExplorerViewMode["List"] = "list";
    TestExplorerViewMode["Tree"] = "true";
})(TestExplorerViewMode || (TestExplorerViewMode = {}));
export var TestExplorerViewSorting;
(function (TestExplorerViewSorting) {
    TestExplorerViewSorting["ByLocation"] = "location";
    TestExplorerViewSorting["ByStatus"] = "status";
    TestExplorerViewSorting["ByDuration"] = "duration";
})(TestExplorerViewSorting || (TestExplorerViewSorting = {}));
export var TestExplorerStateFilter;
(function (TestExplorerStateFilter) {
    TestExplorerStateFilter["OnlyFailed"] = "failed";
    TestExplorerStateFilter["OnlyExecuted"] = "excuted";
    TestExplorerStateFilter["All"] = "all";
})(TestExplorerStateFilter || (TestExplorerStateFilter = {}));
export const testStateNames = {
    [6 /* TestResultState.Errored */]: localize('testState.errored', 'Errored'),
    [4 /* TestResultState.Failed */]: localize('testState.failed', 'Failed'),
    [3 /* TestResultState.Passed */]: localize('testState.passed', 'Passed'),
    [1 /* TestResultState.Queued */]: localize('testState.queued', 'Queued'),
    [2 /* TestResultState.Running */]: localize('testState.running', 'Running'),
    [5 /* TestResultState.Skipped */]: localize('testState.skipped', 'Skipped'),
    [0 /* TestResultState.Unset */]: localize('testState.unset', 'Not yet run'),
};
export const labelForTestInState = (label, state) => localize({
    key: 'testing.treeElementLabel',
    comment: ['label then the unit tests state, for example "Addition Tests (Running)"'],
}, '{0} ({1})', stripIcons(label), testStateNames[state]);
export const testConfigurationGroupNames = {
    [4 /* TestRunProfileBitset.Debug */]: localize('testGroup.debug', 'Debug'),
    [2 /* TestRunProfileBitset.Run */]: localize('testGroup.run', 'Run'),
    [8 /* TestRunProfileBitset.Coverage */]: localize('testGroup.coverage', 'Coverage'),
};
export var TestCommandId;
(function (TestCommandId) {
    TestCommandId["CancelTestRefreshAction"] = "testing.cancelTestRefresh";
    TestCommandId["CancelTestRunAction"] = "testing.cancelRun";
    TestCommandId["ClearTestResultsAction"] = "testing.clearTestResults";
    TestCommandId["CollapseAllAction"] = "testing.collapseAll";
    TestCommandId["ConfigureTestProfilesAction"] = "testing.configureProfile";
    TestCommandId["DebugAction"] = "testing.debug";
    TestCommandId["DebugAllAction"] = "testing.debugAll";
    TestCommandId["DebugAtCursor"] = "testing.debugAtCursor";
    TestCommandId["DebugCurrentFile"] = "testing.debugCurrentFile";
    TestCommandId["DebugFailedTests"] = "testing.debugFailTests";
    TestCommandId["DebugLastRun"] = "testing.debugLastRun";
    TestCommandId["DebugSelectedAction"] = "testing.debugSelected";
    TestCommandId["FilterAction"] = "workbench.actions.treeView.testExplorer.filter";
    TestCommandId["GoToTest"] = "testing.editFocusedTest";
    TestCommandId["HideTestAction"] = "testing.hideTest";
    TestCommandId["OpenOutputPeek"] = "testing.openOutputPeek";
    TestCommandId["RefreshTestsAction"] = "testing.refreshTests";
    TestCommandId["ReRunFailedTests"] = "testing.reRunFailTests";
    TestCommandId["ReRunLastRun"] = "testing.reRunLastRun";
    TestCommandId["RunAction"] = "testing.run";
    TestCommandId["RunAllAction"] = "testing.runAll";
    TestCommandId["RunAtCursor"] = "testing.runAtCursor";
    TestCommandId["RunCurrentFile"] = "testing.runCurrentFile";
    TestCommandId["RunSelectedAction"] = "testing.runSelected";
    TestCommandId["RunUsingProfileAction"] = "testing.runUsing";
    TestCommandId["SearchForTestExtension"] = "testing.searchForTestExtension";
    TestCommandId["SelectDefaultTestProfiles"] = "testing.selectDefaultTestProfiles";
    TestCommandId["ShowMostRecentOutputAction"] = "testing.showMostRecentOutput";
    TestCommandId["TestingSortByDurationAction"] = "testing.sortByDuration";
    TestCommandId["TestingSortByLocationAction"] = "testing.sortByLocation";
    TestCommandId["TestingSortByStatusAction"] = "testing.sortByStatus";
    TestCommandId["TestingViewAsListAction"] = "testing.viewAsList";
    TestCommandId["TestingViewAsTreeAction"] = "testing.viewAsTree";
    TestCommandId["ToggleAutoRun"] = "testing.toggleautoRun";
    TestCommandId["ToggleInlineTestOutput"] = "testing.toggleInlineTestOutput";
    TestCommandId["UnhideTestAction"] = "testing.unhideTest";
    TestCommandId["UnhideAllTestsAction"] = "testing.unhideAllTests";
})(TestCommandId || (TestCommandId = {}));
