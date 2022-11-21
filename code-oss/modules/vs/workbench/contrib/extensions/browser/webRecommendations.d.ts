import { ExtensionRecommendations, ExtensionRecommendation } from 'vs/workbench/contrib/extensions/browser/extensionRecommendations';
import { IProductService } from 'vs/platform/product/common/productService';
import { IExtensionManagementServerService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
export declare class WebRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private readonly extensionManagementServerService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(productService: IProductService, extensionManagementServerService: IExtensionManagementServerService);
    protected doActivate(): Promise<void>;
}
