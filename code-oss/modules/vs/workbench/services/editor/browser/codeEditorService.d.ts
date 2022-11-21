import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { AbstractCodeEditorService } from 'vs/editor/browser/services/abstractCodeEditorService';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class CodeEditorService extends AbstractCodeEditorService {
    private readonly editorService;
    private readonly configurationService;
    constructor(editorService: IEditorService, themeService: IThemeService, configurationService: IConfigurationService);
    getActiveCodeEditor(): ICodeEditor | null;
    private doOpenCodeEditorFromDiff;
    private doOpenCodeEditor;
}
