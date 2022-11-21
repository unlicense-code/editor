import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { AbstractCodeEditorService } from 'vs/editor/browser/services/abstractCodeEditorService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare class StandaloneCodeEditorService extends AbstractCodeEditorService {
    private readonly _editorIsOpen;
    private _activeCodeEditor;
    constructor(contextKeyService: IContextKeyService, themeService: IThemeService);
    private _checkContextKey;
    setActiveCodeEditor(activeCodeEditor: ICodeEditor | null): void;
    getActiveCodeEditor(): ICodeEditor | null;
    private doOpenEditor;
    private findModel;
}
