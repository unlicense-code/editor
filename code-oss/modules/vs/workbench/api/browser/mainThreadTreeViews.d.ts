import { Disposable } from 'vs/base/common/lifecycle';
import { MainThreadTreeViewsShape } from 'vs/workbench/api/common/extHost.protocol';
import { ITreeItem, IViewsService, IRevealOptions, IViewBadge } from 'vs/workbench/common/views';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { VSBuffer } from 'vs/base/common/buffer';
export declare class MainThreadTreeViews extends Disposable implements MainThreadTreeViewsShape {
    private readonly viewsService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly logService;
    private readonly _proxy;
    private readonly _dataProviders;
    private readonly _dndControllers;
    constructor(extHostContext: IExtHostContext, viewsService: IViewsService, notificationService: INotificationService, extensionService: IExtensionService, logService: ILogService);
    $registerTreeViewDataProvider(treeViewId: string, options: {
        showCollapseAll: boolean;
        canSelectMany: boolean;
        dropMimeTypes: string[];
        dragMimeTypes: string[];
        hasHandleDrag: boolean;
        hasHandleDrop: boolean;
    }): Promise<void>;
    $reveal(treeViewId: string, itemInfo: {
        item: ITreeItem;
        parentChain: ITreeItem[];
    } | undefined, options: IRevealOptions): Promise<void>;
    $refresh(treeViewId: string, itemsToRefreshByHandle: {
        [treeItemHandle: string]: ITreeItem;
    }): Promise<void>;
    $setMessage(treeViewId: string, message: string): void;
    $setTitle(treeViewId: string, title: string, description: string | undefined): void;
    $setBadge(treeViewId: string, badge: IViewBadge | undefined): void;
    $resolveDropFileData(destinationViewId: string, requestId: number, dataItemId: string): Promise<VSBuffer>;
    $disposeTree(treeViewId: string): Promise<void>;
    private reveal;
    private registerListeners;
    private getTreeView;
    dispose(): void;
}
