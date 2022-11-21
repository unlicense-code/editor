import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { Disposable } from 'vs/base/common/lifecycle';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class EditorAutoSave extends Disposable implements IWorkbenchContribution {
    private readonly filesConfigurationService;
    private readonly hostService;
    private readonly editorService;
    private readonly editorGroupService;
    private readonly workingCopyService;
    private readonly logService;
    private autoSaveAfterDelay;
    private readonly pendingAutoSavesAfterDelay;
    private lastActiveEditor;
    private lastActiveGroupId;
    private lastActiveEditorControlDisposable;
    constructor(filesConfigurationService: IFilesConfigurationService, hostService: IHostService, editorService: IEditorService, editorGroupService: IEditorGroupsService, workingCopyService: IWorkingCopyService, logService: ILogService);
    private registerListeners;
    private onWindowFocusChange;
    private onDidActiveEditorChange;
    private maybeTriggerAutoSave;
    private onAutoSaveConfigurationChange;
    private saveAllDirty;
    private onDidRegister;
    private onDidUnregister;
    private onDidChangeDirty;
    private onDidChangeContent;
    private scheduleAutoSave;
    private discardAutoSave;
}