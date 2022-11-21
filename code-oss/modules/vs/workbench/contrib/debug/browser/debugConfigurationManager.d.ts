import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI as uri } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { AdapterManager } from 'vs/workbench/contrib/debug/browser/debugAdapterManager';
import { DebugConfigurationProviderTriggerKind, IConfig, IConfigPresentation, IConfigurationManager, IDebugConfigurationProvider, ILaunch } from 'vs/workbench/contrib/debug/common/debug';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
export declare class ConfigurationManager implements IConfigurationManager {
    private readonly adapterManager;
    private readonly contextService;
    private readonly configurationService;
    private readonly quickInputService;
    private readonly instantiationService;
    private readonly storageService;
    private readonly extensionService;
    private readonly historyService;
    private readonly uriIdentityService;
    private launches;
    private selectedName;
    private selectedLaunch;
    private getSelectedConfig;
    private selectedType;
    private selectedDynamic;
    private toDispose;
    private readonly _onDidSelectConfigurationName;
    private configProviders;
    private debugConfigurationTypeContext;
    constructor(adapterManager: AdapterManager, contextService: IWorkspaceContextService, configurationService: IConfigurationService, quickInputService: IQuickInputService, instantiationService: IInstantiationService, storageService: IStorageService, extensionService: IExtensionService, historyService: IHistoryService, uriIdentityService: IUriIdentityService, contextKeyService: IContextKeyService);
    registerDebugConfigurationProvider(debugConfigurationProvider: IDebugConfigurationProvider): IDisposable;
    unregisterDebugConfigurationProvider(debugConfigurationProvider: IDebugConfigurationProvider): void;
    /**
     * if scope is not specified,a value of DebugConfigurationProvideTrigger.Initial is assumed.
     */
    hasDebugConfigurationProvider(debugType: string, triggerKind?: DebugConfigurationProviderTriggerKind): boolean;
    resolveConfigurationByProviders(folderUri: uri | undefined, type: string | undefined, config: IConfig, token: CancellationToken): Promise<IConfig | null | undefined>;
    resolveDebugConfigurationWithSubstitutedVariables(folderUri: uri | undefined, type: string | undefined, config: IConfig, token: CancellationToken): Promise<IConfig | null | undefined>;
    provideDebugConfigurations(folderUri: uri | undefined, type: string, token: CancellationToken): Promise<any[]>;
    getDynamicProviders(): Promise<{
        label: string;
        type: string;
        getProvider: () => Promise<IDebugConfigurationProvider | undefined>;
        pick: () => Promise<{
            launch: ILaunch;
            config: IConfig;
        } | undefined>;
    }[]>;
    getAllConfigurations(): {
        launch: ILaunch;
        name: string;
        presentation?: IConfigPresentation;
    }[];
    removeRecentDynamicConfigurations(name: string, type: string): void;
    getRecentDynamicConfigurations(): {
        name: string;
        type: string;
    }[];
    private registerListeners;
    private initLaunches;
    private setCompoundSchemaValues;
    getLaunches(): ILaunch[];
    getLaunch(workspaceUri: uri | undefined): ILaunch | undefined;
    get selectedConfiguration(): {
        launch: ILaunch | undefined;
        name: string | undefined;
        getConfig: () => Promise<IConfig | undefined>;
        type: string | undefined;
    };
    get onDidSelectConfiguration(): Event<void>;
    getWorkspaceLaunch(): ILaunch | undefined;
    selectConfiguration(launch: ILaunch | undefined, name?: string, config?: IConfig, dynamicConfig?: {
        type?: string;
    }): Promise<void>;
    private setSelectedLaunchName;
    dispose(): void;
}
