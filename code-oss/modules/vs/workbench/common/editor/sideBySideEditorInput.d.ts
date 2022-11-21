import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditorInputCapabilities, GroupIdentifier, ISaveOptions, IRevertOptions, IEditorSerializer, ISideBySideEditorInput, IUntypedEditorInput, IResourceSideBySideEditorInput, IMoveResult, Verbosity } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
/**
 * Side by side editor inputs that have a primary and secondary side.
 */
export declare class SideBySideEditorInput extends EditorInput implements ISideBySideEditorInput {
    protected readonly preferredName: string | undefined;
    protected readonly preferredDescription: string | undefined;
    readonly secondary: EditorInput;
    readonly primary: EditorInput;
    private readonly editorService;
    static readonly ID: string;
    get typeId(): string;
    get capabilities(): EditorInputCapabilities;
    get resource(): URI | undefined;
    private hasIdenticalSides;
    constructor(preferredName: string | undefined, preferredDescription: string | undefined, secondary: EditorInput, primary: EditorInput, editorService: IEditorService);
    private registerListeners;
    getName(): string;
    getPreferredName(): string | undefined;
    getDescription(verbosity?: Verbosity): string | undefined;
    getPreferredDescription(): string | undefined;
    getTitle(verbosity?: Verbosity): string;
    getLabelExtraClasses(): string[];
    getAriaLabel(): string;
    getTelemetryDescriptor(): {
        [key: string]: unknown;
    };
    isDirty(): boolean;
    isSaving(): boolean;
    save(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    private saveResultToEditor;
    revert(group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    rename(group: GroupIdentifier, target: URI): Promise<IMoveResult | undefined>;
    toUntyped(options?: {
        preserveViewState: GroupIdentifier;
    }): IResourceSideBySideEditorInput | undefined;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
}
export declare abstract class AbstractSideBySideEditorInputSerializer implements IEditorSerializer {
    canSerialize(editorInput: EditorInput): boolean;
    serialize(editorInput: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput | undefined;
    private getSerializers;
    protected abstract createEditorInput(instantiationService: IInstantiationService, name: string | undefined, description: string | undefined, secondaryInput: EditorInput, primaryInput: EditorInput): EditorInput;
}
export declare class SideBySideEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
    protected createEditorInput(instantiationService: IInstantiationService, name: string | undefined, description: string | undefined, secondaryInput: EditorInput, primaryInput: EditorInput): EditorInput;
}
