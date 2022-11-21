import { IQuickPickSeparator } from 'vs/platform/quickinput/common/quickInput';
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from 'vs/platform/quickinput/browser/pickerQuickAccess';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IExtensionGalleryService, IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILogService } from 'vs/platform/log/common/log';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
export declare class InstallExtensionQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly paneCompositeService;
    private readonly galleryService;
    private readonly extensionsService;
    private readonly notificationService;
    private readonly logService;
    static PREFIX: string;
    constructor(paneCompositeService: IPaneCompositePartService, galleryService: IExtensionGalleryService, extensionsService: IExtensionManagementService, notificationService: INotificationService, logService: ILogService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Array<IPickerQuickAccessItem | IQuickPickSeparator> | Promise<Array<IPickerQuickAccessItem | IQuickPickSeparator>>;
    private getPicksForExtensionId;
    private installExtension;
    private searchExtension;
}
export declare class ManageExtensionsQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly paneCompositeService;
    static PREFIX: string;
    constructor(paneCompositeService: IPaneCompositePartService);
    protected _getPicks(): Array<IPickerQuickAccessItem | IQuickPickSeparator>;
}
