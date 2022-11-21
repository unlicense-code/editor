import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IExtensionStatus } from 'vs/workbench/contrib/extensions/common/extensionsUtils';
import { INotebookKeymapService } from 'vs/workbench/contrib/notebook/common/notebookKeymapService';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class NotebookKeymapService extends Disposable implements INotebookKeymapService {
    private readonly instantiationService;
    private readonly extensionEnablementService;
    private readonly notificationService;
    _serviceBrand: undefined;
    private notebookKeymapMemento;
    private notebookKeymap;
    constructor(instantiationService: IInstantiationService, extensionEnablementService: IWorkbenchExtensionEnablementService, notificationService: INotificationService, storageService: IStorageService, lifecycleService: ILifecycleService);
    private checkForOtherKeymaps;
    private promptForDisablingOtherKeymaps;
}
export declare function isNotebookKeymapExtension(extension: IExtensionStatus): boolean;
