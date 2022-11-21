import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigBasedExtensionTip, IExecutableBasedExtensionTip, IExtensionTipsService, IWorkspaceTips } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
export declare class ExtensionTipsService extends Disposable implements IExtensionTipsService {
    protected readonly fileService: IFileService;
    private readonly productService;
    private readonly requestService;
    private readonly logService;
    _serviceBrand: any;
    private readonly allConfigBasedTips;
    constructor(fileService: IFileService, productService: IProductService, requestService: IRequestService, logService: ILogService);
    getConfigBasedTips(folder: URI): Promise<IConfigBasedExtensionTip[]>;
    getAllWorkspacesTips(): Promise<IWorkspaceTips[]>;
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    private getValidConfigBasedTips;
    private fetchWorkspacesTips;
}
