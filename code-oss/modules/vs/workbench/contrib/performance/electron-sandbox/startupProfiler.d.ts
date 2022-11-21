import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IProductService } from 'vs/platform/product/common/productService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
export declare class StartupProfiler implements IWorkbenchContribution {
    private readonly _dialogService;
    private readonly _environmentService;
    private readonly _textModelResolverService;
    private readonly _clipboardService;
    private readonly _openerService;
    private readonly _nativeHostService;
    private readonly _productService;
    private readonly _fileService;
    private readonly _labelService;
    constructor(_dialogService: IDialogService, _environmentService: INativeWorkbenchEnvironmentService, _textModelResolverService: ITextModelService, _clipboardService: IClipboardService, lifecycleService: ILifecycleService, extensionService: IExtensionService, _openerService: IOpenerService, _nativeHostService: INativeHostService, _productService: IProductService, _fileService: IFileService, _labelService: ILabelService);
    private _stopProfiling;
    private _createPerfIssue;
}
