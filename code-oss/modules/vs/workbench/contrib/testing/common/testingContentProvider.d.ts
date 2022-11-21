import { URI } from 'vs/base/common/uri';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelContentProvider, ITextModelService } from 'vs/editor/common/services/resolverService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITestResultService } from 'vs/workbench/contrib/testing/common/testResultService';
/**
 * A content provider that returns various outputs for tests. This is used
 * in the inline peek view.
 */
export declare class TestingContentProvider implements IWorkbenchContribution, ITextModelContentProvider {
    private readonly languageService;
    private readonly modelService;
    private readonly resultService;
    constructor(textModelResolverService: ITextModelService, languageService: ILanguageService, modelService: IModelService, resultService: ITestResultService);
    /**
     * @inheritdoc
     */
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
