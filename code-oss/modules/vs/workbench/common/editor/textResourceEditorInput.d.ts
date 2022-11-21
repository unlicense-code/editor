import { GroupIdentifier, IRevertOptions, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { AbstractResourceEditorInput } from 'vs/workbench/common/editor/resourceEditorInput';
import { URI } from 'vs/base/common/uri';
import { ITextFileService, ITextFileSaveOptions, ILanguageSupport } from 'vs/workbench/services/textfile/common/textfiles';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
import { ITextEditorModel, ITextModelService } from 'vs/editor/common/services/resolverService';
/**
 * The base class for all editor inputs that open in text editors.
 */
export declare abstract class AbstractTextResourceEditorInput extends AbstractResourceEditorInput {
    protected readonly editorService: IEditorService;
    protected readonly textFileService: ITextFileService;
    constructor(resource: URI, preferredResource: URI | undefined, editorService: IEditorService, textFileService: ITextFileService, labelService: ILabelService, fileService: IFileService);
    save(group: GroupIdentifier, options?: ITextFileSaveOptions): Promise<IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ITextFileSaveOptions): Promise<IUntypedEditorInput | undefined>;
    private doSave;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
}
/**
 * A read-only text editor input whos contents are made of the provided resource that points to an existing
 * code editor model.
 */
export declare class TextResourceEditorInput extends AbstractTextResourceEditorInput implements ILanguageSupport {
    private name;
    private description;
    private preferredLanguageId;
    private preferredContents;
    private readonly textModelResolverService;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    private cachedModel;
    private modelReference;
    constructor(resource: URI, name: string | undefined, description: string | undefined, preferredLanguageId: string | undefined, preferredContents: string | undefined, textModelResolverService: ITextModelService, textFileService: ITextFileService, editorService: IEditorService, fileService: IFileService, labelService: ILabelService);
    getName(): string;
    setName(name: string): void;
    getDescription(): string | undefined;
    setDescription(description: string): void;
    setLanguageId(languageId: string, source?: string): void;
    setPreferredLanguageId(languageId: string): void;
    setPreferredContents(contents: string): void;
    resolve(): Promise<ITextEditorModel>;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
