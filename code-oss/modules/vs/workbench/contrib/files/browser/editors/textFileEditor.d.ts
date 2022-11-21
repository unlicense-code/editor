import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { AbstractTextCodeEditor } from 'vs/workbench/browser/parts/editor/textCodeEditor';
import { IEditorOpenContext } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { FileEditorInput } from 'vs/workbench/contrib/files/browser/editors/fileEditorInput';
import { IFileService } from 'vs/platform/files/common/files';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ICodeEditorViewState } from 'vs/editor/common/editorCommon';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IPaneCompositePartService } from 'vs/workbench/services/panecomposite/browser/panecomposite';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
/**
 * An implementation of editor for file system resources.
 */
export declare class TextFileEditor extends AbstractTextCodeEditor<ICodeEditorViewState> {
    private readonly paneCompositeService;
    private readonly contextService;
    private readonly textFileService;
    private readonly explorerService;
    private readonly uriIdentityService;
    private readonly pathService;
    private readonly configurationService;
    static readonly ID = "workbench.editors.files.textFileEditor";
    constructor(telemetryService: ITelemetryService, fileService: IFileService, paneCompositeService: IPaneCompositePartService, instantiationService: IInstantiationService, contextService: IWorkspaceContextService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, themeService: IThemeService, editorGroupService: IEditorGroupsService, textFileService: ITextFileService, explorerService: IExplorerService, uriIdentityService: IUriIdentityService, pathService: IPathService, configurationService: IConfigurationService);
    private onDidFilesChange;
    private onDidRunOperation;
    getTitle(): string;
    get input(): FileEditorInput | undefined;
    setInput(input: FileEditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    protected handleSetInputError(error: Error, input: FileEditorInput, options: ITextEditorOptions | undefined): Promise<void>;
    private openAsBinary;
    private doOpenAsBinaryInDifferentEditor;
    private doOpenAsBinaryInSameEditor;
    clearInput(): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
    protected tracksDisposedEditorViewState(): boolean;
}
