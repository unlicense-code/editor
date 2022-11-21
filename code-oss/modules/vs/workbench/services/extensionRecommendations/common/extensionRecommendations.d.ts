import { IStringDictionary } from 'vs/base/common/collections';
import { Event } from 'vs/base/common/event';
export declare type DynamicRecommendation = 'dynamic';
export declare type ConfigRecommendation = 'config';
export declare type ExecutableRecommendation = 'executable';
export declare type CachedRecommendation = 'cached';
export declare type ApplicationRecommendation = 'application';
export declare type ExperimentalRecommendation = 'experimental';
export declare const enum ExtensionRecommendationReason {
    Workspace = 0,
    File = 1,
    Executable = 2,
    WorkspaceConfig = 3,
    DynamicWorkspace = 4,
    Experimental = 5,
    Application = 6
}
export interface IExtensionRecommendationReson {
    reasonId: ExtensionRecommendationReason;
    reasonText: string;
}
export declare const IExtensionRecommendationsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionRecommendationsService>;
export interface IExtensionRecommendationsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeRecommendations: Event<void>;
    getAllRecommendationsWithReason(): IStringDictionary<IExtensionRecommendationReson>;
    getImportantRecommendations(): Promise<string[]>;
    getOtherRecommendations(): Promise<string[]>;
    getFileBasedRecommendations(): string[];
    getExeBasedRecommendations(exe?: string): Promise<{
        important: string[];
        others: string[];
    }>;
    getConfigBasedRecommendations(): Promise<{
        important: string[];
        others: string[];
    }>;
    getWorkspaceRecommendations(): Promise<string[]>;
    getKeymapRecommendations(): string[];
    getLanguageRecommendations(): string[];
}
export declare type IgnoredRecommendationChangeNotification = {
    extensionId: string;
    isRecommended: boolean;
};
export declare const IExtensionIgnoredRecommendationsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionIgnoredRecommendationsService>;
export interface IExtensionIgnoredRecommendationsService {
    readonly _serviceBrand: undefined;
    onDidChangeIgnoredRecommendations: Event<void>;
    readonly ignoredRecommendations: string[];
    onDidChangeGlobalIgnoredRecommendation: Event<IgnoredRecommendationChangeNotification>;
    readonly globalIgnoredRecommendations: string[];
    toggleGlobalIgnoredRecommendation(extensionId: string, ignore: boolean): void;
}
