import { ISettingsEditorModel, ISetting, ISearchResult, SettingMatchType } from 'vs/workbench/services/preferences/common/preferences';
import { IRange } from 'vs/editor/common/core/range';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IPreferencesSearchService, ISearchProvider } from 'vs/workbench/contrib/preferences/common/preferences';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProductService } from 'vs/platform/product/common/productService';
export interface IEndpointDetails {
    urlBase?: string;
    key?: string;
}
export declare class PreferencesSearchService extends Disposable implements IPreferencesSearchService {
    private readonly instantiationService;
    private readonly configurationService;
    private readonly productService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    readonly _serviceBrand: undefined;
    private _installedExtensions;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService, productService: IProductService, extensionManagementService: IExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    private get remoteSearchAllowed();
    private get _endpoint();
    getRemoteSearchProvider(filter: string, newExtensionsOnly?: boolean): ISearchProvider | undefined;
    getLocalSearchProvider(filter: string): LocalSearchProvider;
}
export declare class LocalSearchProvider implements ISearchProvider {
    private _filter;
    private readonly configurationService;
    static readonly EXACT_MATCH_SCORE = 10000;
    static readonly START_SCORE = 1000;
    constructor(_filter: string, configurationService: IConfigurationService);
    searchModel(preferencesModel: ISettingsEditorModel, token?: CancellationToken): Promise<ISearchResult | null>;
    private getGroupFilter;
}
export declare class SettingMatches {
    private requireFullQueryMatch;
    private searchDescription;
    private valuesMatcher;
    private readonly configurationService;
    private readonly descriptionMatchingWords;
    private readonly keyMatchingWords;
    private readonly valueMatchingWords;
    readonly matches: IRange[];
    matchType: SettingMatchType;
    constructor(searchString: string, setting: ISetting, requireFullQueryMatch: boolean, searchDescription: boolean, valuesMatcher: (filter: string, setting: ISetting) => IRange[], configurationService: IConfigurationService);
    private _findMatchesInSetting;
    private _doFindMatchesInSetting;
    private checkForWholeWordMatchType;
    private refreshMatchType;
    private getRangesForWords;
    private toKeyRange;
    private toDescriptionRange;
    private toValueRange;
}
