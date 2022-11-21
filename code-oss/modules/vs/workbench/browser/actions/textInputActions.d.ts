import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
export declare class TextInputActionsProvider extends Disposable implements IWorkbenchContribution {
    private readonly layoutService;
    private readonly contextMenuService;
    private readonly clipboardService;
    private textInputActions;
    constructor(layoutService: IWorkbenchLayoutService, contextMenuService: IContextMenuService, clipboardService: IClipboardService);
    private createActions;
    private registerListeners;
    private onContextMenu;
}
