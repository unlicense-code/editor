import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction2 } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IPeekViewService, PeekViewWidget } from 'vs/editor/contrib/peekView/browser/peekView';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IInstantiationService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IObservableValue, MutableObservableValue } from 'vs/workbench/contrib/testing/common/observableValue';
import { ITestingPeekOpener } from 'vs/workbench/contrib/testing/common/testingPeekOpener';
import { ITestResult } from 'vs/workbench/contrib/testing/common/testResult';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { IRichLocation, ITestItem, ITestMessage, TestResultItem } from 'vs/workbench/contrib/testing/common/testTypes';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import 'vs/css!./testingOutputPeek';
declare class TestDto {
    readonly resultId: string;
    readonly taskIndex: number;
    readonly messageIndex: number;
    readonly test: ITestItem;
    readonly messages: ITestMessage[];
    readonly expectedUri: URI;
    readonly actualUri: URI;
    readonly messageUri: URI;
    readonly revealLocation: IRichLocation | undefined;
    get isDiffable(): boolean;
    constructor(resultId: string, test: TestResultItem, taskIndex: number, messageIndex: number);
}
export declare class TestingPeekOpener extends Disposable implements ITestingPeekOpener {
    private readonly configuration;
    private readonly editorService;
    private readonly codeEditorService;
    private readonly testResults;
    private readonly testService;
    _serviceBrand: undefined;
    private lastUri?;
    constructor(configuration: IConfigurationService, editorService: IEditorService, codeEditorService: ICodeEditorService, testResults: ITestResultService, testService: ITestService);
    /** @inheritdoc */
    open(): Promise<boolean>;
    /** @inheritdoc */
    tryPeekFirstError(result: ITestResult, test: TestResultItem, options?: Partial<ITextEditorOptions>): boolean;
    /** @inheritdoc */
    peekUri(uri: URI, options?: Partial<ITextEditorOptions>): boolean;
    /** @inheritdoc */
    closeAllPeeks(): void;
    /** @inheritdoc */
    private showPeekFromUri;
    /**
     * Opens the peek view on a test failure, based on user preferences.
     */
    private openPeekOnFailure;
    /**
     * Gets the message closest to the given position from a test in the file.
     */
    private getFileCandidateMessage;
    /**
     * Gets any possible still-relevant message from the results.
     */
    private getAnyCandidateMessage;
    /**
     * Gets the first failed message that can be displayed from the result.
     */
    private getFailedCandidateMessage;
}
/**
 * Adds output/message peek functionality to code editors.
 */
export declare class TestingOutputPeekController extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly editorService;
    private readonly codeEditorService;
    private readonly instantiationService;
    private readonly testResults;
    private readonly storageService;
    private readonly commandService;
    /**
     * Gets the controller associated with the given code editor.
     */
    static get(editor: ICodeEditor): TestingOutputPeekController | null;
    /**
     * Currently-shown peek view.
     */
    private readonly peek;
    /**
     * URI of the currently-visible peek, if any.
     */
    private currentPeekUri;
    /**
     * Context key updated when the peek is visible/hidden.
     */
    private readonly visible;
    /**
     * Gets whether a peek is currently shown in the associated editor.
     */
    get isVisible(): TestingOutputPeek | undefined;
    /**
     * Whether the history part of the peek view should be visible.
     */
    readonly historyVisible: MutableObservableValue<boolean>;
    constructor(editor: ICodeEditor, editorService: IEditorService, codeEditorService: ICodeEditorService, instantiationService: IInstantiationService, testResults: ITestResultService, storageService: IStorageService, contextKeyService: IContextKeyService, commandService: ICommandService);
    /**
     * Toggles peek visibility for the URI.
     */
    toggle(uri: URI): void;
    openCurrentInEditor(): void;
    /**
     * Shows a peek for the message in the editor.
     */
    show(uri: URI): Promise<void>;
    openAndShow(uri: URI): Promise<void>;
    /**
     * Disposes the peek view, if any.
     */
    removePeek(): void;
    /**
     * Shows the next message in the peek, if possible.
     */
    next(): void;
    /**
     * Shows the previous message in the peek, if possible.
     */
    previous(): void;
    /**
     * Removes the peek view if it's being displayed on the given test ID.
     */
    removeIfPeekingForTest(testId: string): void;
    /**
     * If the test we're currently showing has its state change to something
     * else, then clear the peek.
     */
    private closePeekOnTestChange;
    private closePeekOnCertainResultEvents;
    private retrieveTest;
}
declare class TestingOutputPeek extends PeekViewWidget {
    private readonly historyVisible;
    private readonly contextKeyService;
    private readonly menuService;
    protected readonly modelService: ITextModelService;
    private static lastHeightInLines?;
    private static lastSplitWidth?;
    private readonly visibilityChange;
    private readonly didReveal;
    private dimension?;
    private splitView;
    private contentProviders;
    current?: TestDto;
    constructor(editor: ICodeEditor, historyVisible: IObservableValue<boolean>, themeService: IThemeService, peekViewService: IPeekViewService, contextKeyService: IContextKeyService, menuService: IMenuService, instantiationService: IInstantiationService, modelService: ITextModelService);
    private applyTheme;
    protected _fillHead(container: HTMLElement): void;
    protected _fillBody(containerElement: HTMLElement): void;
    /**
     * Updates the test to be shown.
     */
    setModel(dto: TestDto): Promise<void>;
    /**
     * Shows a message in-place without showing or changing the peek location.
     * This is mostly used if peeking a message without a location.
     */
    showInPlace(dto: TestDto): Promise<void>;
    protected _relayout(newHeightInLines: number): void;
    /** @override */
    protected _doLayoutBody(height: number, width: number): void;
    /** @override */
    protected _onWidth(width: number): void;
}
export declare class CloseTestPeek extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
interface ITreeElement {
    type: string;
    context: unknown;
    id: string;
    label: string;
    labelWithIcons?: readonly (HTMLSpanElement | string)[];
    icon?: ThemeIcon;
    description?: string;
    ariaLabel?: string;
}
export declare class TestResultElement implements ITreeElement {
    readonly value: ITestResult;
    readonly type = "result";
    readonly context: string;
    readonly id: string;
    readonly label: string;
    get icon(): ThemeIcon | undefined;
    constructor(value: ITestResult);
}
export declare class TestCaseElement implements ITreeElement {
    private readonly results;
    readonly test: TestResultItem;
    readonly type = "test";
    readonly context: string;
    readonly id: string;
    readonly label: string;
    readonly labelWithIcons: (string | HTMLSpanElement)[];
    readonly description?: string;
    get icon(): ThemeIcon | undefined;
    constructor(results: ITestResult, test: TestResultItem);
}
export declare class GoToNextMessageAction extends EditorAction2 {
    static readonly ID = "testing.goToNextMessage";
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToPreviousMessageAction extends EditorAction2 {
    static readonly ID = "testing.goToPreviousMessage";
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class OpenMessageInEditorAction extends EditorAction2 {
    static readonly ID = "testing.openMessageInEditor";
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class ToggleTestingPeekHistory extends EditorAction2 {
    static readonly ID = "testing.toggleTestingPeekHistory";
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export {};
