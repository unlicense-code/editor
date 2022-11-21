import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
export declare class SnippetCodeActions implements IWorkbenchContribution {
    private readonly _store;
    constructor(instantiationService: IInstantiationService, languageFeaturesService: ILanguageFeaturesService, configService: IConfigurationService);
    dispose(): void;
}
