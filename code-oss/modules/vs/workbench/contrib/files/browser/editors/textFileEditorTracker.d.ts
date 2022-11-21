import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { Disposable } from 'vs/base/common/lifecycle';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IWorkingCopyEditorService } from 'vs/workbench/services/workingCopy/common/workingCopyEditorService';
export declare class TextFileEditorTracker extends Disposable implements IWorkbenchContribution {
    private readonly editorService;
    private readonly textFileService;
    private readonly lifecycleService;
    private readonly hostService;
    private readonly codeEditorService;
    private readonly filesConfigurationService;
    private readonly workingCopyEditorService;
    constructor(editorService: IEditorService, textFileService: ITextFileService, lifecycleService: ILifecycleService, hostService: IHostService, codeEditorService: ICodeEditorService, filesConfigurationService: IFilesConfigurationService, workingCopyEditorService: IWorkingCopyEditorService);
    private registerListeners;
    private readonly ensureDirtyFilesAreOpenedWorker;
    protected getDirtyTextFileTrackerDelay(): number;
    private ensureDirtyTextFilesAreOpened;
    private doEnsureDirtyTextFilesAreOpened;
    private reloadVisibleTextFileEditors;
}
