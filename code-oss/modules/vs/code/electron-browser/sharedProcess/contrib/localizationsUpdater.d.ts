import { Disposable } from 'vs/base/common/lifecycle';
import { NativeLanguagePackService } from 'vs/platform/languagePacks/node/languagePacks';
export declare class LocalizationsUpdater extends Disposable {
    private readonly localizationsService;
    constructor(localizationsService: NativeLanguagePackService);
    private updateLocalizations;
}
