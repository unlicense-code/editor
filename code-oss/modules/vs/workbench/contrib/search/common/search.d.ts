import { IDisposable } from 'vs/base/common/lifecycle';
import { ISearchConfiguration, ISearchConfigurationProperties } from 'vs/workbench/services/search/common/search';
import { SymbolKind, Location, ProviderResult, SymbolTag } from 'vs/editor/common/languages';
import { URI } from 'vs/base/common/uri';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IRange } from 'vs/editor/common/core/range';
import { RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export interface IWorkspaceSymbol {
    name: string;
    containerName?: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    location: Location;
}
export interface IWorkspaceSymbolProvider {
    provideWorkspaceSymbols(search: string, token: CancellationToken): ProviderResult<IWorkspaceSymbol[]>;
    resolveWorkspaceSymbol?(item: IWorkspaceSymbol, token: CancellationToken): ProviderResult<IWorkspaceSymbol>;
}
export declare namespace WorkspaceSymbolProviderRegistry {
    function register(provider: IWorkspaceSymbolProvider): IDisposable;
    function all(): IWorkspaceSymbolProvider[];
}
export declare class WorkspaceSymbolItem {
    readonly symbol: IWorkspaceSymbol;
    readonly provider: IWorkspaceSymbolProvider;
    constructor(symbol: IWorkspaceSymbol, provider: IWorkspaceSymbolProvider);
}
export declare function getWorkspaceSymbols(query: string, token?: CancellationToken): Promise<WorkspaceSymbolItem[]>;
export interface IWorkbenchSearchConfigurationProperties extends ISearchConfigurationProperties {
    quickOpen: {
        includeSymbols: boolean;
        includeHistory: boolean;
        history: {
            filterSortOrder: 'default' | 'recency';
        };
    };
}
export interface IWorkbenchSearchConfiguration extends ISearchConfiguration {
    search: IWorkbenchSearchConfigurationProperties;
}
/**
 * Helper to return all opened editors with resources not belonging to the currently opened workspace.
 */
export declare function getOutOfWorkspaceEditorResources(accessor: ServicesAccessor): URI[];
export interface IFilterAndRange {
    filter: string;
    range: IRange;
}
export declare function extractRangeFromFilter(filter: string, unless?: string[]): IFilterAndRange | undefined;
export declare enum SearchUIState {
    Idle = 0,
    Searching = 1,
    SlowSearch = 2
}
export declare const SearchStateKey: RawContextKey<SearchUIState>;
