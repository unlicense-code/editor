import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ICodeEditor, IEditorMouseEvent } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Range } from 'vs/editor/common/core/range';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IModelService } from 'vs/editor/common/services/model';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ITestDecoration as IPublicTestDecoration, ITestingDecorationsService } from 'vs/workbench/contrib/testing/common/testingDecorations';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
import { ITestService } from 'vs/workbench/contrib/testing/common/testService';
import { ITestMessage } from 'vs/workbench/contrib/testing/common/testTypes';
interface ITestDecoration extends IPublicTestDecoration {
    id: string;
    click(e: IEditorMouseEvent): boolean;
}
export declare class TestingDecorationService extends Disposable implements ITestingDecorationsService {
    private readonly configurationService;
    private readonly testService;
    private readonly results;
    private readonly instantiationService;
    private readonly modelService;
    _serviceBrand: undefined;
    private generation;
    private readonly changeEmitter;
    private readonly decorationCache;
    /**
     * List of messages that should be hidden because an editor changed their
     * underlying ranges. I think this is good enough, because:
     *  - Message decorations are never shown across reloads; this does not
     *    need to persist
     *  - Message instances are stable for any completed test results for
     *    the duration of the session.
     */
    private readonly invalidatedMessages;
    /** @inheritdoc */
    readonly onDidChange: Event<void>;
    constructor(codeEditorService: ICodeEditorService, configurationService: IConfigurationService, testService: ITestService, results: ITestResultService, instantiationService: IInstantiationService, modelService: IModelService);
    /** @inheritdoc */
    invalidateResultMessage(message: ITestMessage): void;
    /** @inheritdoc */
    syncDecorations(resource: URI): ReadonlyMap<string, ITestDecoration>;
    /** @inheritdoc */
    getDecoratedRangeForTest(resource: URI, testId: string): Range | undefined;
    private invalidate;
    /**
     * Applies the current set of test decorations to the given text model.
     */
    private applyDecorations;
}
export declare class TestingDecorations extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly codeEditorService;
    private readonly testService;
    private readonly decorations;
    private readonly uriIdentityService;
    /**
     * Gets the decorations associated with the given code editor.
     */
    static get(editor: ICodeEditor): TestingDecorations | null;
    private currentUri?;
    private readonly expectedWidget;
    private readonly actualWidget;
    constructor(editor: ICodeEditor, codeEditorService: ICodeEditorService, testService: ITestService, decorations: ITestingDecorationsService, uriIdentityService: IUriIdentityService);
    private attachModel;
}
export {};
