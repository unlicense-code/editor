import { IAction } from 'vs/base/common/actions';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IRemoteExplorerService } from 'vs/workbench/services/remote/common/remoteExplorerService';
import { ISelectOptionItem } from 'vs/base/browser/ui/selectBox/selectBox';
import { IViewDescriptor } from 'vs/workbench/common/views';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { SelectActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
interface IRemoteSelectItem extends ISelectOptionItem {
    authority: string[];
}
export declare class SwitchRemoteViewItem extends SelectActionViewItem {
    private readonly optionsItems;
    private remoteExplorerService;
    private environmentService;
    private readonly storageService;
    constructor(action: IAction, optionsItems: IRemoteSelectItem[], themeService: IThemeService, contextViewService: IContextViewService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, storageService: IStorageService);
    setSelectionForConnection(): boolean;
    setSelection(): void;
    private getOptionIndexForExplorerType;
    render(container: HTMLElement): void;
    protected getActionContext(_: string, index: number): any;
    static createOptionItems(views: IViewDescriptor[], contextKeyService: IContextKeyService): IRemoteSelectItem[];
}
export declare class SwitchRemoteAction extends Action2 {
    static readonly ID = "remote.explorer.switch";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor, args: IRemoteSelectItem): Promise<any>;
}
export {};
