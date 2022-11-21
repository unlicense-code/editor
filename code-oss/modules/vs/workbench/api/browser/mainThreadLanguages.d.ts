import { UriComponents } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { MainThreadLanguagesShape } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IPosition } from 'vs/editor/common/core/position';
import { IRange } from 'vs/editor/common/core/range';
import { StandardTokenType } from 'vs/editor/common/encodedTokenAttributes';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ILanguageStatus, ILanguageStatusService } from 'vs/workbench/services/languageStatus/common/languageStatusService';
export declare class MainThreadLanguages implements MainThreadLanguagesShape {
    private readonly _languageService;
    private readonly _modelService;
    private _resolverService;
    private readonly _languageStatusService;
    private readonly _disposables;
    private readonly _proxy;
    private readonly _status;
    constructor(_extHostContext: IExtHostContext, _languageService: ILanguageService, _modelService: IModelService, _resolverService: ITextModelService, _languageStatusService: ILanguageStatusService);
    dispose(): void;
    $changeLanguage(resource: UriComponents, languageId: string): Promise<void>;
    $tokensAtPosition(resource: UriComponents, position: IPosition): Promise<undefined | {
        type: StandardTokenType;
        range: IRange;
    }>;
    $setLanguageStatus(handle: number, status: ILanguageStatus): void;
    $removeLanguageStatus(handle: number): void;
}
