import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IPickAndOpenOptions, ISaveDialogOptions, IOpenDialogOptions, IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { AbstractFileDialogService } from 'vs/workbench/services/dialogs/browser/abstractFileDialogService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { ILabelService } from 'vs/platform/label/common/label';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILogService } from 'vs/platform/log/common/log';
export declare class FileDialogService extends AbstractFileDialogService implements IFileDialogService {
    private readonly nativeHostService;
    constructor(hostService: IHostService, contextService: IWorkspaceContextService, historyService: IHistoryService, environmentService: IWorkbenchEnvironmentService, instantiationService: IInstantiationService, configurationService: IConfigurationService, fileService: IFileService, openerService: IOpenerService, nativeHostService: INativeHostService, dialogService: IDialogService, languageService: ILanguageService, workspacesService: IWorkspacesService, labelService: ILabelService, pathService: IPathService, commandService: ICommandService, editorService: IEditorService, codeEditorService: ICodeEditorService, logService: ILogService);
    private toNativeOpenDialogOptions;
    private shouldUseSimplified;
    pickFileFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFileAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickWorkspaceAndOpen(options: IPickAndOpenOptions): Promise<void>;
    pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined>;
    private toNativeSaveDialogOptions;
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    showOpenDialog(options: IOpenDialogOptions): Promise<URI[] | undefined>;
}
