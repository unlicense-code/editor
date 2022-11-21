import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IJSONEditingService } from 'vs/workbench/services/configuration/common/jsonEditing';
export declare const EXTENSIONS_CONFIG = ".vscode/extensions.json";
export interface IExtensionsConfigContent {
    recommendations?: string[];
    unwantedRecommendations?: string[];
}
export declare const IWorkspaceExtensionsConfigService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IWorkspaceExtensionsConfigService>;
export interface IWorkspaceExtensionsConfigService {
    readonly _serviceBrand: undefined;
    onDidChangeExtensionsConfigs: Event<void>;
    getExtensionsConfigs(): Promise<IExtensionsConfigContent[]>;
    getRecommendations(): Promise<string[]>;
    getUnwantedRecommendations(): Promise<string[]>;
    toggleRecommendation(extensionId: string): Promise<void>;
    toggleUnwantedRecommendation(extensionId: string): Promise<void>;
}
export declare class WorkspaceExtensionsConfigService extends Disposable implements IWorkspaceExtensionsConfigService {
    private readonly workspaceContextService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly modelService;
    private readonly languageService;
    private readonly jsonEditingService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeExtensionsConfigs;
    readonly onDidChangeExtensionsConfigs: Event<void>;
    constructor(workspaceContextService: IWorkspaceContextService, fileService: IFileService, quickInputService: IQuickInputService, modelService: IModelService, languageService: ILanguageService, jsonEditingService: IJSONEditingService);
    getExtensionsConfigs(): Promise<IExtensionsConfigContent[]>;
    getRecommendations(): Promise<string[]>;
    getUnwantedRecommendations(): Promise<string[]>;
    toggleRecommendation(extensionId: string): Promise<void>;
    toggleUnwantedRecommendation(extensionId: string): Promise<void>;
    private addOrRemoveWorkspaceFolderRecommendation;
    private addOrRemoveWorkspaceRecommendation;
    private addOrRemoveWorkspaceFolderUnwantedRecommendation;
    private addOrRemoveWorkspaceUnwantedRecommendation;
    private pickWorkspaceOrFolders;
    private resolveWorkspaceExtensionConfig;
    private resolveWorkspaceFolderExtensionConfig;
    private parseExtensionConfig;
}
