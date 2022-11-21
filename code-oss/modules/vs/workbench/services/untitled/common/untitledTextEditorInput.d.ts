import { GroupIdentifier, IUntitledTextResourceEditorInput, IUntypedEditorInput, Verbosity } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { AbstractTextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { IUntitledTextEditorModel } from 'vs/workbench/services/untitled/common/untitledTextEditorModel';
import { EncodingMode, IEncodingSupport, ILanguageSupport, ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ILabelService } from 'vs/platform/label/common/label';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
/**
 * An editor input to be used for untitled text buffers.
 */
export declare class UntitledTextEditorInput extends AbstractTextResourceEditorInput implements IEncodingSupport, ILanguageSupport {
    readonly model: IUntitledTextEditorModel;
    private readonly environmentService;
    private readonly pathService;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    private modelResolve;
    constructor(model: IUntitledTextEditorModel, textFileService: ITextFileService, labelService: ILabelService, editorService: IEditorService, fileService: IFileService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService);
    private registerModelListeners;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    getTitle(verbosity: Verbosity): string;
    isDirty(): boolean;
    getEncoding(): string | undefined;
    setEncoding(encoding: string, mode: EncodingMode): Promise<void>;
    setLanguageId(languageId: string, source?: string): void;
    getLanguageId(): string | undefined;
    resolve(): Promise<IUntitledTextEditorModel>;
    toUntyped(options?: {
        preserveViewState: GroupIdentifier;
    }): IUntitledTextResourceEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
