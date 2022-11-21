import { ViewContainer } from 'vs/workbench/common/views';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IUserDataSyncService, IUserDataSyncEnablementService } from 'vs/platform/userDataSync/common/userDataSync';
import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataSyncMachinesService } from 'vs/platform/userDataSync/common/userDataSyncMachines';
export declare class UserDataSyncDataViews extends Disposable {
    private readonly instantiationService;
    private readonly userDataSyncEnablementService;
    private readonly userDataSyncMachinesService;
    private readonly userDataSyncService;
    constructor(container: ViewContainer, instantiationService: IInstantiationService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncMachinesService: IUserDataSyncMachinesService, userDataSyncService: IUserDataSyncService);
    private registerViews;
    private registerConflictsView;
    private registerMachinesView;
    private registerActivityView;
    private registerDataViewActions;
    private registerTroubleShootView;
}
