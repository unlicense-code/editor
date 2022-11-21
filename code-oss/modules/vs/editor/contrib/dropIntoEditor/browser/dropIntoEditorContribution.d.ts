import { VSDataTransfer } from 'vs/base/common/dataTransfer';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IBulkEditService } from 'vs/editor/browser/services/bulkEditService';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare class DropIntoEditorController extends Disposable implements IEditorContribution {
    private readonly _bulkEditService;
    private readonly _languageFeaturesService;
    private readonly _progressService;
    static readonly ID = "editor.contrib.dropIntoEditorController";
    constructor(editor: ICodeEditor, _bulkEditService: IBulkEditService, _languageFeaturesService: ILanguageFeaturesService, _progressService: IProgressService, workspaceContextService: IWorkspaceContextService);
    private onDropIntoEditor;
    extractDataTransferData(dragEvent: DragEvent): Promise<VSDataTransfer>;
}
