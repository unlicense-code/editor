import 'vs/css!./notebookKernelActionViewItem';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { IAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { INotebookEditor } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class NotebooKernelActionViewItem extends ActionViewItem {
    private readonly _editor;
    private readonly _notebookKernelService;
    private readonly _configurationService;
    private _kernelLabel?;
    constructor(actualAction: IAction, _editor: {
        onDidChangeModel: Event<void>;
        textModel: NotebookTextModel | undefined;
        scopedContextKeyService?: IContextKeyService;
    } | INotebookEditor, _notebookKernelService: INotebookKernelService, _configurationService: IConfigurationService);
    render(container: HTMLElement): void;
    updateLabel(): void;
    protected _update(): void;
    private _resetAction;
}
