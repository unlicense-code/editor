import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProgressService } from 'vs/platform/progress/common/progress';
export declare class CopyPasteController extends Disposable implements IEditorContribution {
    private readonly _bulkEditService;
    private readonly _clipboardService;
    private readonly _configurationService;
    private readonly _languageFeaturesService;
    private readonly _progressService;
    static readonly ID = "editor.contrib.copyPasteActionController";
    static get(editor: ICodeEditor): CopyPasteController;
    private readonly _editor;
    private _currentClipboardItem?;
    constructor(editor: ICodeEditor, _bulkEditService: IBulkEditService, _clipboardService: IClipboardService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _progressService: IProgressService);
    private arePasteActionsEnabled;
    private handleCopy;
    private setCopyMetadata;
    private handlePaste;
    private getProviderPasteEdit;
    private applyDefaultPasteHandler;
}
