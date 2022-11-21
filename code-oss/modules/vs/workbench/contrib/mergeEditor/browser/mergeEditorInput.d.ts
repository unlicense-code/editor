import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILabelService } from 'vs/platform/label/common/label';
import { EditorInputCapabilities, IResourceMergeEditorInput, IRevertOptions, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput, IEditorCloseHandler } from 'vs/workbench/common/editor/editorInput';
import { AbstractTextResourceEditorInput } from 'vs/workbench/common/editor/textResourceEditorInput';
import { IMergeEditorInputModel } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ILanguageSupport, ITextFileSaveOptions, ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export declare class MergeEditorInputData {
    readonly uri: URI;
    readonly title: string | undefined;
    readonly detail: string | undefined;
    readonly description: string | undefined;
    constructor(uri: URI, title: string | undefined, detail: string | undefined, description: string | undefined);
}
export declare class MergeEditorInput extends AbstractTextResourceEditorInput implements ILanguageSupport {
    readonly base: URI;
    readonly input1: MergeEditorInputData;
    readonly input2: MergeEditorInputData;
    readonly result: URI;
    private readonly _instaService;
    private readonly configurationService;
    static readonly ID = "mergeEditor.Input";
    private _inputModel?;
    closeHandler: IEditorCloseHandler;
    private get useWorkingCopy();
    constructor(base: URI, input1: MergeEditorInputData, input2: MergeEditorInputData, result: URI, _instaService: IInstantiationService, editorService: IEditorService, textFileService: ITextFileService, labelService: ILabelService, fileService: IFileService, configurationService: IConfigurationService);
    dispose(): void;
    get typeId(): string;
    get editorId(): string;
    get capabilities(): EditorInputCapabilities;
    getName(): string;
    private readonly mergeEditorModeFactory;
    resolve(): Promise<IMergeEditorInputModel>;
    accept(): Promise<void>;
    save(group: number, options?: ITextFileSaveOptions | undefined): Promise<IUntypedEditorInput | undefined>;
    toUntyped(): IResourceMergeEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    revert(group: number, options?: IRevertOptions): Promise<void>;
    isDirty(): boolean;
    setLanguageId(languageId: string, source?: string): void;
}
