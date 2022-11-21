import { BrowserClipboardService as BaseBrowserClipboardService } from 'vs/platform/clipboard/browser/clipboardService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ILogService } from 'vs/platform/log/common/log';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
export declare class BrowserClipboardService extends BaseBrowserClipboardService {
    private readonly notificationService;
    private readonly openerService;
    private readonly environmentService;
    constructor(notificationService: INotificationService, openerService: IOpenerService, environmentService: IWorkbenchEnvironmentService, logService: ILogService, layoutService: ILayoutService);
    readText(type?: string): Promise<string>;
}
