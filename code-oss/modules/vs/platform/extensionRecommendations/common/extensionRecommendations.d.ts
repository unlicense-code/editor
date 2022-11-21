export declare const enum RecommendationSource {
    FILE = 1,
    WORKSPACE = 2,
    EXE = 3
}
export declare function RecommendationSourceToString(source: RecommendationSource): "file" | "workspace" | "exe";
export declare const enum RecommendationsNotificationResult {
    Ignored = "ignored",
    Cancelled = "cancelled",
    TooMany = "toomany",
    IncompatibleWindow = "incompatibleWindow",
    Accepted = "reacted"
}
export declare const IExtensionRecommendationNotificationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionRecommendationNotificationService>;
export interface IExtensionRecommendationNotificationService {
    readonly _serviceBrand: undefined;
    readonly ignoredRecommendations: string[];
    hasToIgnoreRecommendationNotifications(): boolean;
    promptImportantExtensionsInstallNotification(extensionIds: string[], message: string, searchValue: string, source: RecommendationSource): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: string[]): Promise<void>;
}
