import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { Disposable } from 'vs/base/common/lifecycle';
export declare class ExtensionDependencyChecker extends Disposable implements IWorkbenchContribution {
    private readonly extensionService;
    private readonly extensionsWorkbenchService;
    private readonly notificationService;
    private readonly hostService;
    constructor(extensionService: IExtensionService, extensionsWorkbenchService: IExtensionsWorkbenchService, notificationService: INotificationService, hostService: IHostService);
    private getUninstalledMissingDependencies;
    private getAllMissingDependencies;
    private installMissingDependencies;
}
