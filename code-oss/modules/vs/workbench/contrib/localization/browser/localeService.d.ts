import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ILanguagePackItem } from 'vs/platform/languagePacks/common/languagePacks';
import { ILocaleService } from 'vs/workbench/contrib/localization/common/locale';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IProductService } from 'vs/platform/product/common/productService';
export declare class WebLocaleService implements ILocaleService {
    private readonly dialogService;
    private readonly hostService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(dialogService: IDialogService, hostService: IHostService, productService: IProductService);
    setLocale(languagePackItem: ILanguagePackItem): Promise<void>;
    clearLocalePreference(): Promise<void>;
}
