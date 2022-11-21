import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ILogService } from 'vs/platform/log/common/log';
import { ITimelineService, TimelineChangeEvent, TimelineOptions, TimelineProvidersChangeEvent, TimelineProvider } from './timeline';
import { IViewsService } from 'vs/workbench/common/views';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare const TimelineHasProviderContext: RawContextKey<boolean>;
export declare class TimelineService implements ITimelineService {
    private readonly logService;
    protected viewsService: IViewsService;
    protected configurationService: IConfigurationService;
    protected contextKeyService: IContextKeyService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeProviders;
    readonly onDidChangeProviders: Event<TimelineProvidersChangeEvent>;
    private readonly _onDidChangeTimeline;
    readonly onDidChangeTimeline: Event<TimelineChangeEvent>;
    private readonly _onDidChangeUri;
    readonly onDidChangeUri: Event<URI>;
    private readonly hasProviderContext;
    private readonly providers;
    private readonly providerSubscriptions;
    constructor(logService: ILogService, viewsService: IViewsService, configurationService: IConfigurationService, contextKeyService: IContextKeyService);
    getSources(): {
        id: string;
        label: string;
    }[];
    getTimeline(id: string, uri: URI, options: TimelineOptions, tokenSource: CancellationTokenSource): {
        result: Promise<import("./timeline").Timeline | undefined>;
        options: TimelineOptions;
        source: string;
        tokenSource: CancellationTokenSource;
        uri: URI;
    } | undefined;
    registerTimelineProvider(provider: TimelineProvider): IDisposable;
    unregisterTimelineProvider(id: string): void;
    setUri(uri: URI): void;
    private updateHasProviderContext;
}
