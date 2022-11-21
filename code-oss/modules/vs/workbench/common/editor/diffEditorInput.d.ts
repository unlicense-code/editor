import { AbstractSideBySideEditorInputSerializer, SideBySideEditorInput } from 'vs/workbench/common/editor/sideBySideEditorInput';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { Verbosity, IEditorDescriptor, IEditorPane, GroupIdentifier, IResourceDiffEditorInput, IUntypedEditorInput, IDiffEditorInput, IResourceSideBySideEditorInput, EditorInputCapabilities } from 'vs/workbench/common/editor';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
/**
 * The base editor input for the diff editor. It is made up of two editor inputs, the original version
 * and the modified version.
 */
export declare class DiffEditorInput extends SideBySideEditorInput implements IDiffEditorInput {
    readonly original: EditorInput;
    readonly modified: EditorInput;
    private readonly forceOpenAsBinary;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    private cachedModel;
    private readonly labels;
    constructor(preferredName: string | undefined, preferredDescription: string | undefined, original: EditorInput, modified: EditorInput, forceOpenAsBinary: boolean | undefined, editorService: IEditorService);
    private computeLabels;
    private computeLabel;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    getTitle(verbosity?: Verbosity): string;
    resolve(): Promise<EditorModel>;
    prefersEditorPane<T extends IEditorDescriptor<IEditorPane>>(editorPanes: T[]): T | undefined;
    private createModel;
    toUntyped(options?: {
        preserveViewState: GroupIdentifier;
    }): (IResourceDiffEditorInput & IResourceSideBySideEditorInput) | undefined;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
}
export declare class DiffEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
    protected createEditorInput(instantiationService: IInstantiationService, name: string | undefined, description: string | undefined, secondaryInput: EditorInput, primaryInput: EditorInput): EditorInput;
}
