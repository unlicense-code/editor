import 'vs/css!./media/scm';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IMenuService, IMenu } from 'vs/platform/actions/common/actions';
import { IAction } from 'vs/base/common/actions';
import { ISCMResource, ISCMResourceGroup, ISCMProvider, ISCMService, ISCMMenus, ISCMRepositoryMenus } from 'vs/workbench/contrib/scm/common/scm';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class SCMTitleMenu implements IDisposable {
    private _actions;
    get actions(): IAction[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    private readonly _onDidChangeTitle;
    readonly onDidChangeTitle: import("vs/base/common/event").Event<void>;
    readonly menu: IMenu;
    private disposables;
    constructor(menuService: IMenuService, contextKeyService: IContextKeyService);
    private updateTitleActions;
    dispose(): void;
}
export declare class SCMRepositoryMenus implements ISCMRepositoryMenus, IDisposable {
    private readonly menuService;
    private contextKeyService;
    readonly titleMenu: SCMTitleMenu;
    private readonly resourceGroups;
    private readonly resourceGroupMenusItems;
    private _repositoryMenu;
    get repositoryMenu(): IMenu;
    private readonly disposables;
    constructor(provider: ISCMProvider, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, menuService: IMenuService);
    getResourceGroupMenu(group: ISCMResourceGroup): IMenu;
    getResourceMenu(resource: ISCMResource): IMenu;
    getResourceFolderMenu(group: ISCMResourceGroup): IMenu;
    private getOrCreateResourceGroupMenusItem;
    private onDidSpliceGroups;
    dispose(): void;
}
export declare class SCMMenus implements ISCMMenus, IDisposable {
    private instantiationService;
    readonly titleMenu: SCMTitleMenu;
    private readonly disposables;
    private readonly menus;
    constructor(scmService: ISCMService, instantiationService: IInstantiationService);
    private onDidRemoveRepository;
    getRepositoryMenus(provider: ISCMProvider): SCMRepositoryMenus;
    dispose(): void;
}
