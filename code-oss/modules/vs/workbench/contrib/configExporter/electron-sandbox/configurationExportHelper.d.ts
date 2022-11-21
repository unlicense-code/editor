import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IFileService } from 'vs/platform/files/common/files';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class DefaultConfigurationExportHelper {
    private readonly extensionService;
    private readonly commandService;
    private readonly fileService;
    private readonly productService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, extensionService: IExtensionService, commandService: ICommandService, fileService: IFileService, productService: IProductService);
    private writeConfigModelAndQuit;
    private writeConfigModel;
    private getConfigModel;
}
