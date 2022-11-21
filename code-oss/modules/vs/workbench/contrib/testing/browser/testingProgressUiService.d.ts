import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { TestStateCount } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export interface ITestingProgressUiService {
    readonly _serviceBrand: undefined;
    readonly onCountChange: Event<CountSummary>;
    readonly onTextChange: Event<string>;
    update(): void;
}
export declare const ITestingProgressUiService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITestingProgressUiService>;
/** Workbench contribution that triggers updates in the TestingProgressUi service */
export declare class TestingProgressTrigger extends Disposable {
    private readonly configurationService;
    private readonly paneCompositeService;
    constructor(resultService: ITestResultService, progressService: ITestingProgressUiService, configurationService: IConfigurationService, paneCompositeService: IPaneCompositePartService);
    private attachAutoOpenForNewResults;
    private openTestView;
}
export declare class TestingProgressUiService extends Disposable implements ITestingProgressUiService {
    private readonly resultService;
    private readonly instantiaionService;
    _serviceBrand: undefined;
    private readonly windowProg;
    private readonly testViewProg;
    private readonly updateCountsEmitter;
    private readonly updateTextEmitter;
    private lastRunSoFar;
    readonly onCountChange: Event<{
        isRunning: boolean;
        passed: number;
        failed: number;
        runSoFar: number;
        totalWillBeRun: number;
        skipped: number;
    }>;
    readonly onTextChange: Event<string>;
    constructor(resultService: ITestResultService, instantiaionService: IInstantiationService);
    /** @inheritdoc */
    update(): void;
}
declare type CountSummary = ReturnType<typeof collectTestStateCounts>;
declare const collectTestStateCounts: (isRunning: boolean, ...counts: ReadonlyArray<TestStateCount>) => {
    isRunning: boolean;
    passed: number;
    failed: number;
    runSoFar: number;
    totalWillBeRun: number;
    skipped: number;
};
export {};
