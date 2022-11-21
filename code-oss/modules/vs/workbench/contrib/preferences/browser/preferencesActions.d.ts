import { Action } from 'vs/base/common/actions';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
export declare class ConfigureLanguageBasedSettingsAction extends Action {
    private readonly modelService;
    private readonly languageService;
    private readonly quickInputService;
    private readonly preferencesService;
    static readonly ID = "workbench.action.configureLanguageBasedSettings";
    static readonly LABEL: {
        value: string;
        original: string;
    };
    constructor(id: string, label: string, modelService: IModelService, languageService: ILanguageService, quickInputService: IQuickInputService, preferencesService: IPreferencesService);
    run(): Promise<void>;
}
