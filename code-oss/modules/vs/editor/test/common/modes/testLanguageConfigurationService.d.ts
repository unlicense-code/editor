import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { LanguageConfiguration } from 'vs/editor/common/languages/languageConfiguration';
import { ILanguageConfigurationService, LanguageConfigurationServiceChangeEvent, ResolvedLanguageConfiguration } from 'vs/editor/common/languages/languageConfigurationRegistry';
export declare class TestLanguageConfigurationService extends Disposable implements ILanguageConfigurationService {
    _serviceBrand: undefined;
    private readonly _registry;
    private readonly _onDidChange;
    readonly onDidChange: import("vs/base/common/event").Event<LanguageConfigurationServiceChangeEvent>;
    constructor();
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}
