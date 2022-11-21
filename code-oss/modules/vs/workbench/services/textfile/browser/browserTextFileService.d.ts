import { AbstractTextFileService } from 'vs/workbench/services/textfile/browser/textFileService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
export declare class BrowserTextFileService extends AbstractTextFileService {
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, elevatedFileService: IElevatedFileService, logService: ILogService, decorationsService: IDecorationsService);
    private registerListeners;
    private onBeforeShutdown;
}
