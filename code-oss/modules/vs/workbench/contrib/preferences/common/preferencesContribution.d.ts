import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { ITextEditorService } from 'vs/workbench/services/textfile/common/textEditorService';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import { IUserDataProfileService } from 'vs/workbench/services/userDataProfile/common/userDataProfile';
export declare class PreferencesContribution implements IWorkbenchContribution {
    private readonly modelService;
    private readonly textModelResolverService;
    private readonly preferencesService;
    private readonly languageService;
    private readonly userDataProfileService;
    private readonly workspaceService;
    private readonly configurationService;
    private readonly editorResolverService;
    private readonly textEditorService;
    private editorOpeningListener;
    private settingsListener;
    constructor(modelService: IModelService, textModelResolverService: ITextModelService, preferencesService: IPreferencesService, languageService: ILanguageService, userDataProfileService: IUserDataProfileService, workspaceService: IWorkspaceContextService, configurationService: IConfigurationService, editorResolverService: IEditorResolverService, textEditorService: ITextEditorService);
    private handleSettingsEditorRegistration;
    private start;
    private getSchemaModel;
    dispose(): void;
}
