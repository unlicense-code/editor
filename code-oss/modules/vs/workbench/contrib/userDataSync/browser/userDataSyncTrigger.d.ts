import { Disposable } from 'vs/base/common/lifecycle';
import { IUserDataProfilesService } from 'vs/platform/userDataProfile/common/userDataProfile';
import { IUserDataAutoSyncService } from 'vs/platform/userDataSync/common/userDataSync';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IViewsService } from 'vs/workbench/common/views';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
export declare class UserDataSyncTrigger extends Disposable implements IWorkbenchContribution {
    private readonly userDataProfilesService;
    constructor(editorService: IEditorService, userDataProfilesService: IUserDataProfilesService, viewsService: IViewsService, userDataAutoSyncService: IUserDataAutoSyncService, hostService: IHostService);
    private getUserDataEditorInputSource;
}
