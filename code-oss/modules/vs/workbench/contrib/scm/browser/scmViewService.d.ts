import { Event } from 'vs/base/common/event';
import { ISCMViewService, ISCMRepository, ISCMService, ISCMViewVisibleRepositoryChangeEvent, ISCMMenus, ISCMRepositorySortKey } from 'vs/workbench/contrib/scm/common/scm';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
export declare const RepositoryContextKeys: {
    RepositorySortKey: RawContextKey<ISCMRepositorySortKey>;
};
export interface ISCMViewServiceState {
    readonly all: string[];
    readonly sortKey: ISCMRepositorySortKey;
    readonly visible: number[];
}
export declare class SCMViewService implements ISCMViewService {
    private readonly configurationService;
    private readonly storageService;
    private readonly workspaceContextService;
    readonly _serviceBrand: undefined;
    readonly menus: ISCMMenus;
    private didFinishLoading;
    private didSelectRepository;
    private previousState;
    private disposables;
    private _repositories;
    get repositories(): ISCMRepository[];
    get visibleRepositories(): ISCMRepository[];
    set visibleRepositories(visibleRepositories: ISCMRepository[]);
    private _onDidChangeRepositories;
    readonly onDidChangeRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    private _onDidSetVisibleRepositories;
    readonly onDidChangeVisibleRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    get focusedRepository(): ISCMRepository | undefined;
    private _onDidFocusRepository;
    readonly onDidFocusRepository: Event<ISCMRepository | undefined>;
    private _repositoriesSortKey;
    private _sortKeyContextKey;
    constructor(scmService: ISCMService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, configurationService: IConfigurationService, storageService: IStorageService, workspaceContextService: IWorkspaceContextService);
    private onDidAddRepository;
    private onDidRemoveRepository;
    isVisible(repository: ISCMRepository): boolean;
    toggleVisibility(repository: ISCMRepository, visible?: boolean): void;
    toggleSortKey(sortKey: ISCMRepositorySortKey): void;
    focus(repository: ISCMRepository | undefined): void;
    private compareRepositories;
    private getMaxSelectionIndex;
    private getViewSortOrder;
    private insertRepositoryView;
    private onWillSaveState;
    private eventuallyFinishLoading;
    private finishLoading;
    dispose(): void;
}
