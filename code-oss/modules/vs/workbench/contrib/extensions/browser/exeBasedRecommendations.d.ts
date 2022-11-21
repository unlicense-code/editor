import { IExtensionTipsService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
export declare class ExeBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionTipsService;
    private _otherTips;
    private _importantTips;
    get otherRecommendations(): ReadonlyArray<ExtensionRecommendation>;
    get importantRecommendations(): ReadonlyArray<ExtensionRecommendation>;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(extensionTipsService: IExtensionTipsService);
    getRecommendations(exe: string): {
        important: ExtensionRecommendation[];
        others: ExtensionRecommendation[];
    };
    protected doActivate(): Promise<void>;
    private _importantExeBasedRecommendations;
    private fetchImportantExeBasedRecommendations;
    private doFetchImportantExeBasedRecommendations;
    private toExtensionRecommendation;
}
