import { IProductService } from 'vs/platform/product/common/productService';
import { Action } from 'vs/base/common/actions';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
export declare class DebugExtensionHostAction extends Action {
    private readonly _debugService;
    private readonly _nativeHostService;
    private readonly _dialogService;
    private readonly _extensionService;
    private readonly productService;
    static readonly ID = "workbench.extensions.action.debugExtensionHost";
    static readonly LABEL: string;
    static readonly CSS_CLASS = "debug-extension-host";
    constructor(_debugService: IDebugService, _nativeHostService: INativeHostService, _dialogService: IDialogService, _extensionService: IExtensionService, productService: IProductService);
    run(): Promise<any>;
}
