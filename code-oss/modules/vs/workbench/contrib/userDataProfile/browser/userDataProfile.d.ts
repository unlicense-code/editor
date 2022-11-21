import { Disposable } from 'vs/base/common/lifecycle';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IProductService } from 'vs/platform/product/common/productService';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IUserDataProfileManagementService, IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class UserDataProfilesWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly userDataProfileService;
    private readonly userDataProfilesService;
    private readonly userDataProfileManagementService;
    private readonly productService;
    private readonly currentProfileContext;
    private readonly isCurrentProfileTransientContext;
    private readonly hasProfilesContext;
    constructor(userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, userDataProfileManagementService: IUserDataProfileManagementService, productService: IProductService, contextKeyService: IContextKeyService, lifecycleService: ILifecycleService);
    private registerConfiguration;
    private registerActions;
    private registerManageProfilesSubMenu;
    private readonly profilesDisposable;
    private registerProfilesActions;
    private registerProfileEntryAction;
    private readonly currentprofileActionsDisposable;
    private registerCurrentProfilesActions;
    private registerUpdateCurrentProfileShortNameAction;
    private registerRenameCurrentProfileAction;
    private registerExportCurrentProfileAction;
    private registerImportProfileAction;
}
