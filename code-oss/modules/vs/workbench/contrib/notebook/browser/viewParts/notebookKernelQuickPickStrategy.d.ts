import 'vs/css!./notebookKernelActionViewItem';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService, IQuickPickItem, QuickPickInput } from 'vs/platform/quickinput/common/quickInput';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { NotebookEditorWidget } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { INotebookKernel, INotebookKernelMatchResult, INotebookKernelService, ISourceAction } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { Command } from 'vs/editor/common/languages';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IAction } from 'vs/base/common/actions';
declare type KernelPick = IQuickPickItem & {
    kernel: INotebookKernel;
};
declare type SourcePick = IQuickPickItem & {
    action: ISourceAction;
};
declare type InstallExtensionPick = IQuickPickItem & {
    extensionId: string;
};
declare type KernelSourceQuickPickItem = IQuickPickItem & {
    command: Command;
};
declare type KernelQuickPickItem = IQuickPickItem | InstallExtensionPick | KernelPick | SourcePick | KernelSourceQuickPickItem;
export declare type KernelQuickPickContext = {
    id: string;
    extension: string;
} | {
    notebookEditorId: string;
} | {
    id: string;
    extension: string;
    notebookEditorId: string;
} | {
    ui?: boolean;
    notebookEditor?: NotebookEditorWidget;
};
export interface IKernelPickerStrategy {
    showQuickPick(context?: KernelQuickPickContext): Promise<boolean>;
}
declare abstract class KernelPickerStrategyBase implements IKernelPickerStrategy {
    protected readonly _notebookKernelService: INotebookKernelService;
    protected readonly _editorService: IEditorService;
    protected readonly _productService: IProductService;
    protected readonly _quickInputService: IQuickInputService;
    protected readonly _labelService: ILabelService;
    protected readonly _logService: ILogService;
    protected readonly _paneCompositePartService: IPaneCompositePartService;
    protected readonly _extensionWorkbenchService: IExtensionsWorkbenchService;
    protected readonly _extensionService: IExtensionService;
    protected readonly _commandService: ICommandService;
    constructor(_notebookKernelService: INotebookKernelService, _editorService: IEditorService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _paneCompositePartService: IPaneCompositePartService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService);
    showQuickPick(context?: KernelQuickPickContext): Promise<boolean>;
    protected abstract _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _handleQuickPick(notebook: NotebookTextModel, pick: KernelQuickPickItem, context?: KernelQuickPickContext): Promise<boolean>;
    private _showKernelExtension;
    private _showInstallKernelExtensionRecommendation;
    private _getKernelRecommendationsQuickPickItems;
    /**
     * Examine the most common language in the notebook
     * @param notebookTextModel The notebook text model
     * @returns What the suggested language is for the notebook. Used for kernal installing
     */
    private getSuggestedLanguage;
    /**
     * Given a language and notebook view type suggest a kernel for installation
     * @param language The language to find a suggested kernel extension for
     * @returns A recommednation object for the recommended extension, else undefined
     */
    private getSuggestedKernelFromLanguage;
}
export declare class KernelPickerFlatStrategy extends KernelPickerStrategyBase {
    constructor(_notebookKernelService: INotebookKernelService, _editorService: IEditorService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _paneCompositePartService: IPaneCompositePartService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService);
    protected _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    private _fillInSuggestions;
    static updateKernelStatusAction(notebook: NotebookTextModel, action: IAction, notebookKernelService: INotebookKernelService, scopedContextKeyService?: IContextKeyService): void;
}
export declare class KernelPickerMRUStrategy extends KernelPickerStrategyBase {
    constructor(_notebookKernelService: INotebookKernelService, _editorService: IEditorService, _productService: IProductService, _quickInputService: IQuickInputService, _labelService: ILabelService, _logService: ILogService, _paneCompositePartService: IPaneCompositePartService, _extensionWorkbenchService: IExtensionsWorkbenchService, _extensionService: IExtensionService, _commandService: ICommandService);
    protected _getKernelPickerQuickPickItems(notebookTextModel: NotebookTextModel, matchResult: INotebookKernelMatchResult, notebookKernelService: INotebookKernelService, scopedContextKeyService: IContextKeyService): QuickPickInput<KernelQuickPickItem>[];
    protected _handleQuickPick(notebook: NotebookTextModel, pick: KernelQuickPickItem, context?: KernelQuickPickContext): Promise<boolean>;
    private displaySelectAnotherQuickPick;
    private _executeCommand;
    static updateKernelStatusAction(notebook: NotebookTextModel, action: IAction, notebookKernelService: INotebookKernelService): void;
}
export {};
