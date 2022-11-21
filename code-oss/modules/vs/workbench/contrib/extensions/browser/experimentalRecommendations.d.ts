import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { IExperimentService } from 'vs/workbench/contrib/experiments/common/experimentService';
export declare class ExperimentalRecommendations extends ExtensionRecommendations {
    private readonly experimentService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(experimentService: IExperimentService);
    /**
     * Fetch extensions used by others on the same workspace as recommendations
     */
    protected doActivate(): Promise<void>;
}
