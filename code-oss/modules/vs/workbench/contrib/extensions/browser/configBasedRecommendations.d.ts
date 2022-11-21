import { IExtensionTipsService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare type ConfigBasedExtensionRecommendation = ExtensionRecommendation & {
    whenNotInstalled: string[] | undefined;
};
export declare class ConfigBasedRecommendations extends ExtensionRecommendations {
    private readonly extensionTipsService;
    private readonly workspaceContextService;
    private importantTips;
    private otherTips;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: import("vs/base/common/event").Event<void>;
    private _otherRecommendations;
    get otherRecommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    private _importantRecommendations;
    get importantRecommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    get recommendations(): ReadonlyArray<ConfigBasedExtensionRecommendation>;
    constructor(extensionTipsService: IExtensionTipsService, workspaceContextService: IWorkspaceContextService);
    protected doActivate(): Promise<void>;
    private fetch;
    private onWorkspaceFoldersChanged;
    private toExtensionRecommendation;
}
