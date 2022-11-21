import { IViewsService } from 'vs/workbench/common/views';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ITestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
export interface ITestingOutputTerminalService {
    _serviceBrand: undefined;
    /**
     * Opens a terminal for the given test's output. Optionally, scrolls to and
     * selects the given marker in the test results.
     */
    open(result: ITestResult, marker?: number): Promise<void>;
}
export declare const ITestingOutputTerminalService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITestingOutputTerminalService>;
export declare class TestingOutputTerminalService implements ITestingOutputTerminalService {
    private readonly terminalService;
    private readonly terminalGroupService;
    private readonly terminalEditorService;
    private viewsService;
    _serviceBrand: undefined;
    private outputTerminals;
    constructor(terminalService: ITerminalService, terminalGroupService: ITerminalGroupService, terminalEditorService: ITerminalEditorService, resultService: ITestResultService, viewsService: IViewsService);
    /**
     * @inheritdoc
     */
    open(result: ITestResult | undefined, marker?: number): Promise<void>;
    private showResultsInTerminal;
    private revealMarker;
}
