import { AbstractTextFileService } from 'vs/workbench/services/textfile/browser/textFileService';
import { ITextFileStreamContent, ITextFileContent, IReadTextFileOptions } from 'vs/workbench/services/textfile/common/textfiles';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IModelService } from 'vs/editor/common/services/model';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IWorkingCopyFileService } from 'vs/workbench/services/workingCopy/common/workingCopyFileService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
import { ILogService } from 'vs/platform/log/common/log';
import { IDecorationsService } from 'vs/workbench/services/decorations/common/decorations';
export declare class NativeTextFileService extends AbstractTextFileService {
    protected readonly environmentService: INativeWorkbenchEnvironmentService;
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: INativeWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, elevatedFileService: IElevatedFileService, logService: ILogService, decorationsService: IDecorationsService);
    private registerListeners;
    private onWillShutdown;
    read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent>;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    private ensureLimits;
}
