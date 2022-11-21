import { UriComponents } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IRawFileMatch2, ISearchService } from 'vs/workbench/services/search/common/search';
import { MainThreadSearchShape } from '../common/extHost.protocol';
export declare class MainThreadSearch implements MainThreadSearchShape {
    private readonly _searchService;
    private readonly _telemetryService;
    private readonly _proxy;
    private readonly _searchProvider;
    constructor(extHostContext: IExtHostContext, _searchService: ISearchService, _telemetryService: ITelemetryService, _configurationService: IConfigurationService);
    dispose(): void;
    $registerTextSearchProvider(handle: number, scheme: string): void;
    $registerFileSearchProvider(handle: number, scheme: string): void;
    $unregisterProvider(handle: number): void;
    $handleFileMatch(handle: number, session: number, data: UriComponents[]): void;
    $handleTextMatch(handle: number, session: number, data: IRawFileMatch2[]): void;
    $handleTelemetry(eventName: string, data: any): void;
}
