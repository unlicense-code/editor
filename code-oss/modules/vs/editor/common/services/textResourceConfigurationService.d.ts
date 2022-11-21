import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IPosition } from 'vs/editor/common/core/position';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextResourceConfigurationService, ITextResourceConfigurationChangeEvent } from 'vs/editor/common/services/textResourceConfiguration';
import { IConfigurationService, ConfigurationTarget } from 'vs/platform/configuration/common/configuration';
export declare class TextResourceConfigurationService extends Disposable implements ITextResourceConfigurationService {
    private readonly configurationService;
    private readonly modelService;
    private readonly languageService;
    _serviceBrand: undefined;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<ITextResourceConfigurationChangeEvent>;
    constructor(configurationService: IConfigurationService, modelService: IModelService, languageService: ILanguageService);
    getValue<T>(resource: URI | undefined, section?: string): T;
    getValue<T>(resource: URI | undefined, at?: IPosition, section?: string): T;
    updateValue(resource: URI, key: string, value: any, configurationTarget?: ConfigurationTarget): Promise<void>;
    private _updateValue;
    private deriveConfigurationTarget;
    private _getValue;
    private getLanguage;
    private toResourceConfigurationChangeEvent;
}
