import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { MainThreadTestCollection } from 'vs/workbench/contrib/testing/common/mainThreadTestCollection';
import { MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { ResolvedTestRunRequest, TestsDiff } from 'vs/workbench/contrib/testing/common/testTypes';
import { TestExclusions } from 'vs/workbench/contrib/testing/common/testExclusions';
import { ITestProfileService } from 'vs/workbench/contrib/testing/common/testProfileService';
import { ITestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { AmbiguousRunTestsRequest, IMainThreadTestController, ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class TestService extends Disposable implements ITestService {
    private readonly storage;
    private readonly editorService;
    private readonly testProfiles;
    private readonly notificationService;
    private readonly configurationService;
    private readonly testResults;
    private readonly workspaceTrustRequestService;
    readonly _serviceBrand: undefined;
    private testControllers;
    private readonly cancelExtensionTestRunEmitter;
    private readonly willProcessDiffEmitter;
    private readonly didProcessDiffEmitter;
    private readonly testRefreshCancellations;
    private readonly providerCount;
    private readonly canRefreshTests;
    private readonly isRefreshingTests;
    /**
     * Cancellation for runs requested by the user being managed by the UI.
     * Test runs initiated by extensions are not included here.
     */
    private readonly uiRunningTests;
    /**
     * @inheritdoc
     */
    readonly onWillProcessDiff: import("vs/base/common/event").Event<TestsDiff>;
    /**
     * @inheritdoc
     */
    readonly onDidProcessDiff: import("vs/base/common/event").Event<TestsDiff>;
    /**
     * @inheritdoc
     */
    readonly onDidCancelTestRun: import("vs/base/common/event").Event<{
        runId: string | undefined;
    }>;
    /**
     * @inheritdoc
     */
    readonly collection: MainThreadTestCollection;
    /**
     * @inheritdoc
     */
    readonly excluded: TestExclusions;
    /**
     * @inheritdoc
     */
    readonly showInlineOutput: MutableObservableValue<boolean>;
    constructor(contextKeyService: IContextKeyService, instantiationService: IInstantiationService, storage: IStorageService, editorService: IEditorService, testProfiles: ITestProfileService, notificationService: INotificationService, configurationService: IConfigurationService, testResults: ITestResultService, workspaceTrustRequestService: IWorkspaceTrustRequestService);
    /**
     * @inheritdoc
     */
    expandTest(id: string, levels: number): Promise<void>;
    /**
     * @inheritdoc
     */
    cancelTestRun(runId?: string): void;
    /**
     * @inheritdoc
     */
    runTests(req: AmbiguousRunTestsRequest, token?: Readonly<CancellationToken>): Promise<ITestResult>;
    /**
     * @inheritdoc
     */
    runResolvedTests(req: ResolvedTestRunRequest, token?: Readonly<CancellationToken>): Promise<import("vs/workbench/contrib/testing/common/testResult").LiveTestResult>;
    /**
     * @inheritdoc
     */
    publishDiff(_controllerId: string, diff: TestsDiff): void;
    /**
     * @inheritdoc
     */
    getTestController(id: string): IMainThreadTestController | undefined;
    /**
     * @inheritdoc
     */
    syncTests(): Promise<void>;
    /**
     * @inheritdoc
     */
    refreshTests(controllerId?: string): Promise<void>;
    /**
     * @inheritdoc
     */
    cancelRefreshTests(): void;
    /**
     * @inheritdoc
     */
    registerTestController(id: string, controller: IMainThreadTestController): IDisposable;
    private saveAllBeforeTest;
    private updateCanRefresh;
}
