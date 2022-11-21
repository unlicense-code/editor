import { IModelService } from 'vs/editor/common/services/model';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class OutputLinkProvider {
    private readonly contextService;
    private readonly modelService;
    private readonly languageConfigurationService;
    private readonly languageFeaturesService;
    private static readonly DISPOSE_WORKER_TIME;
    private worker?;
    private disposeWorkerScheduler;
    private linkProviderRegistration;
    constructor(contextService: IWorkspaceContextService, modelService: IModelService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    private registerListeners;
    private updateLinkProviderWorker;
    private getOrCreateWorker;
    private provideLinks;
    private disposeWorker;
}
