import { MainThreadLocalizationShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { Disposable } from 'vs/base/common/lifecycle';
import { ILanguagePackService } from 'vs/platform/languagePacks/common/languagePacks';
export declare class MainThreadLocalization extends Disposable implements MainThreadLocalizationShape {
    private readonly fileService;
    private readonly languagePackService;
    constructor(extHostContext: IExtHostContext, fileService: IFileService, languagePackService: ILanguagePackService);
    $fetchBuiltInBundleUri(id: string): Promise<URI | undefined>;
    $fetchBundleContents(uriComponents: UriComponents): Promise<string>;
}
