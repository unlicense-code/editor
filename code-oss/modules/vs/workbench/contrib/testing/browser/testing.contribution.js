/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { localize } from 'vs/nls';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IFileService } from 'vs/platform/files/common/files';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Extensions as ViewContainerExtensions, IViewsService } from 'vs/workbench/common/views';
import { REVEAL_IN_EXPLORER_COMMAND_ID } from 'vs/workbench/contrib/files/browser/fileConstants';
import { testingViewIcon } from 'vs/workbench/contrib/testing/browser/icons';
import { TestingDecorations, TestingDecorationService } from 'vs/workbench/contrib/testing/browser/testingDecorations';
import { TestingExplorerView } from 'vs/workbench/contrib/testing/browser/testingExplorerView';
import { CloseTestPeek, GoToNextMessageAction, GoToPreviousMessageAction, OpenMessageInEditorAction, TestingOutputPeekController, TestingPeekOpener, ToggleTestingPeekHistory } from 'vs/workbench/contrib/testing/browser/testingOutputPeek';
import { ITestingOutputTerminalService, TestingOutputTerminalService } from 'vs/workbench/contrib/testing/browser/testingOutputTerminalService';
import { ITestingProgressUiService, TestingProgressTrigger, TestingProgressUiService } from 'vs/workbench/contrib/testing/browser/testingProgressUiService';
import { TestingViewPaneContainer } from 'vs/workbench/contrib/testing/browser/testingViewPaneContainer';
import { testingConfiguation } from 'vs/workbench/contrib/testing/common/configuration';
import { ITestExplorerFilterState, TestExplorerFilterState } from 'vs/workbench/contrib/testing/common/testExplorerFilterState';
import { TestId } from 'vs/workbench/contrib/testing/common/testId';
import { TestingContentProvider } from 'vs/workbench/contrib/testing/common/testingContentProvider';
import { TestingContextKeys } from 'vs/workbench/contrib/testing/common/testingContextKeys';
import { ITestingDecorationsService } from 'vs/workbench/contrib/testing/common/testingDecorations';
import { ITestingPeekOpener } from 'vs/workbench/contrib/testing/common/testingPeekOpener';
import { ITestProfileService, TestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { ITestResultService, TestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestResultStorage, TestResultStorage } from 'vs/workbench/contrib/testing/common/testResultStorage';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { TestService } from 'vs/workbench/contrib/testing/common/testServiceImpl';
import { allTestActions, discoverAndRunTests } from './testExplorerActions';
import './testingConfigurationUi';
registerSingleton(ITestService, TestService, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestResultStorage, TestResultStorage, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestProfileService, TestProfileService, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestResultService, TestResultService, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestExplorerFilterState, TestExplorerFilterState, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestingOutputTerminalService, TestingOutputTerminalService, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestingPeekOpener, TestingPeekOpener, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestingProgressUiService, TestingProgressUiService, 1 /* InstantiationType.Delayed */);
registerSingleton(ITestingDecorationsService, TestingDecorationService, 1 /* InstantiationType.Delayed */);
const viewContainer = Registry.as(ViewContainerExtensions.ViewContainersRegistry).registerViewContainer({
    id: "workbench.view.extension.test" /* Testing.ViewletId */,
    title: localize('test', "Testing"),
    ctorDescriptor: new SyncDescriptor(TestingViewPaneContainer),
    icon: testingViewIcon,
    alwaysUseContainerInfo: true,
    order: 6,
    openCommandActionDescriptor: {
        id: "workbench.view.extension.test" /* Testing.ViewletId */,
        mnemonicTitle: localize({ key: 'miViewTesting', comment: ['&& denotes a mnemonic'] }, "T&&esting"),
        // todo: coordinate with joh whether this is available
        // keybindings: { primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.US_SEMICOLON },
        order: 4,
    },
    hideIfEmpty: true,
}, 0 /* ViewContainerLocation.Sidebar */);
const viewsRegistry = Registry.as(ViewContainerExtensions.ViewsRegistry);
viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* Testing.ExplorerViewId */, {
    content: localize('noTestProvidersRegistered', "No tests have been found in this workspace yet."),
});
viewsRegistry.registerViewWelcomeContent("workbench.view.testing" /* Testing.ExplorerViewId */, {
    content: '[' + localize('searchForAdditionalTestExtensions', "Install Additional Test Extensions...") + `](command:${"testing.searchForTestExtension" /* TestCommandId.SearchForTestExtension */})`,
    order: 10
});
viewsRegistry.registerViews([{
        id: "workbench.view.testing" /* Testing.ExplorerViewId */,
        name: localize('testExplorer', "Test Explorer"),
        ctorDescriptor: new SyncDescriptor(TestingExplorerView),
        canToggleVisibility: true,
        canMoveView: true,
        weight: 80,
        order: -999,
        containerIcon: testingViewIcon,
        // temporary until release, at which point we can show the welcome view:
        when: ContextKeyExpr.greater(TestingContextKeys.providerCount.key, 0),
    }], viewContainer);
allTestActions.forEach(registerAction2);
registerAction2(OpenMessageInEditorAction);
registerAction2(GoToPreviousMessageAction);
registerAction2(GoToNextMessageAction);
registerAction2(CloseTestPeek);
registerAction2(ToggleTestingPeekHistory);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(TestingContentProvider, 3 /* LifecyclePhase.Restored */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(TestingPeekOpener, 4 /* LifecyclePhase.Eventually */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(TestingProgressTrigger, 4 /* LifecyclePhase.Eventually */);
registerEditorContribution("editor.contrib.testingOutputPeek" /* Testing.OutputPeekContributionId */, TestingOutputPeekController);
registerEditorContribution("editor.contrib.testingDecorations" /* Testing.DecorationsContributionId */, TestingDecorations);
CommandsRegistry.registerCommand({
    id: '_revealTestInExplorer',
    handler: async (accessor, testId, focus) => {
        accessor.get(ITestExplorerFilterState).reveal.value = typeof testId === 'string' ? testId : testId.extId;
        accessor.get(IViewsService).openView("workbench.view.testing" /* Testing.ExplorerViewId */, focus);
    }
});
CommandsRegistry.registerCommand({
    id: 'vscode.peekTestError',
    handler: async (accessor, extId) => {
        const lookup = accessor.get(ITestResultService).getStateById(extId);
        if (!lookup) {
            return false;
        }
        const [result, ownState] = lookup;
        const opener = accessor.get(ITestingPeekOpener);
        if (opener.tryPeekFirstError(result, ownState)) { // fast path
            return true;
        }
        for (const test of result.tests) {
            if (TestId.compare(ownState.item.extId, test.item.extId) === 2 /* TestPosition.IsChild */ && opener.tryPeekFirstError(result, test)) {
                return true;
            }
        }
        return false;
    }
});
CommandsRegistry.registerCommand({
    id: 'vscode.revealTest',
    handler: async (accessor, extId) => {
        const test = accessor.get(ITestService).collection.getNodeById(extId);
        if (!test) {
            return;
        }
        const commandService = accessor.get(ICommandService);
        const fileService = accessor.get(IFileService);
        const openerService = accessor.get(IOpenerService);
        let { range, uri } = test.item;
        if (!uri) {
            return;
        }
        // If an editor has the file open, there are decorations. Try to adjust the
        // revealed range to those decorations (#133441).
        range = accessor.get(ITestingDecorationsService).getDecoratedRangeForTest(uri, extId) || range;
        accessor.get(ITestExplorerFilterState).reveal.value = extId;
        accessor.get(ITestingPeekOpener).closeAllPeeks();
        let isFile = true;
        try {
            if (!(await fileService.stat(uri)).isFile) {
                isFile = false;
            }
        }
        catch {
            // ignored
        }
        if (!isFile) {
            await commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, uri);
            return;
        }
        await openerService.open(range
            ? uri.with({ fragment: `L${range.startLineNumber}:${range.startColumn}` })
            : uri);
    }
});
CommandsRegistry.registerCommand({
    id: 'vscode.runTestsById',
    handler: async (accessor, group, ...testIds) => {
        const testService = accessor.get(ITestService);
        await discoverAndRunTests(accessor.get(ITestService).collection, accessor.get(IProgressService), testIds, tests => testService.runTests({ group, tests }));
    }
});
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration(testingConfiguation);
