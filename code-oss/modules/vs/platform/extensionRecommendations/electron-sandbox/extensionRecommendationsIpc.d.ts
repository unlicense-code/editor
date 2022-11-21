import { Event } from 'vs/base/common/event';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { IExtensionRecommendationNotificationService, RecommendationsNotificationResult, RecommendationSource } from 'vs/platform/extensionRecommendations/common/extensionRecommendations';
export declare class ExtensionRecommendationNotificationServiceChannelClient implements IExtensionRecommendationNotificationService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    get ignoredRecommendations(): string[];
    promptImportantExtensionsInstallNotification(extensionIds: string[], message: string, searchValue: string, priority: RecommendationSource): Promise<RecommendationsNotificationResult>;
    promptWorkspaceRecommendations(recommendations: string[]): Promise<void>;
    hasToIgnoreRecommendationNotifications(): boolean;
}
export declare class ExtensionRecommendationNotificationServiceChannel implements IServerChannel {
    private service;
    constructor(service: IExtensionRecommendationNotificationService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, args?: any): Promise<any>;
}
