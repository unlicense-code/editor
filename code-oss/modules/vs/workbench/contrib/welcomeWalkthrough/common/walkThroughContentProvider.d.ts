import { URI } from 'vs/base/common/uri';
import { ITextModelService, ITextModelContentProvider } from 'vs/editor/common/services/resolverService';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare function requireToContent(instantiationService: IInstantiationService, resource: URI): Promise<string>;
export declare class WalkThroughSnippetContentProvider implements ITextModelContentProvider, IWorkbenchContribution {
    private readonly textModelResolverService;
    private readonly languageService;
    private readonly modelService;
    private readonly instantiationService;
    private loads;
    constructor(textModelResolverService: ITextModelService, languageService: ILanguageService, modelService: IModelService, instantiationService: IInstantiationService);
    private textBufferFactoryFromResource;
    provideTextContent(resource: URI): Promise<ITextModel>;
}
