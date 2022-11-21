import { IActivityService, IActivity } from 'vs/workbench/services/activity/common/activity';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class ActivityService implements IActivityService {
    private readonly paneCompositeService;
    private readonly viewDescriptorService;
    private readonly instantiationService;
    _serviceBrand: undefined;
    private viewActivities;
    constructor(paneCompositeService: IPaneCompositePartService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService);
    showViewContainerActivity(viewContainerId: string, { badge, clazz, priority }: IActivity): IDisposable;
    showViewActivity(viewId: string, activity: IActivity): IDisposable;
    showAccountsActivity({ badge, clazz, priority }: IActivity): IDisposable;
    showGlobalActivity({ badge, clazz, priority }: IActivity): IDisposable;
}
