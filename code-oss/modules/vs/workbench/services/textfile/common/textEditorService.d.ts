import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileEditorInput, IUntypedEditorInput, IUntypedFileEditorInput } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { IFileService } from 'vs/platform/files/common/files';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { Disposable } from 'vs/base/common/lifecycle';
export declare const ITextEditorService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITextEditorService>;
export interface ITextEditorService {
    readonly _serviceBrand: undefined;
    /**
     * @deprecated this method should not be used, rather consider using
     * `IEditorResolverService` instead with `DEFAULT_EDITOR_ASSOCIATION.id`.
     */
    createTextEditor(input: IUntypedEditorInput): EditorInput;
    /**
     * @deprecated this method should not be used, rather consider using
     * `IEditorResolverService` instead with `DEFAULT_EDITOR_ASSOCIATION.id`.
     */
    createTextEditor(input: IUntypedFileEditorInput): IFileEditorInput;
    /**
     * A way to create text editor inputs from an untyped editor input. Depending
     * on the passed in input this will be:
     * - a `IFileEditorInput` for file resources
     * - a `UntitledEditorInput` for untitled resources
     * - a `TextResourceEditorInput` for virtual resources
     *
     * @param input the untyped editor input to create a typed input from
     */
    resolveTextEditor(input: IUntypedEditorInput): Promise<EditorInput>;
    resolveTextEditor(input: IUntypedFileEditorInput): Promise<IFileEditorInput>;
}
export declare class TextEditorService extends Disposable implements ITextEditorService {
    private readonly untitledTextEditorService;
    private readonly instantiationService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly editorResolverService;
    readonly _serviceBrand: undefined;
    private readonly editorInputCache;
    private readonly fileEditorFactory;
    constructor(untitledTextEditorService: IUntitledTextEditorService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService, fileService: IFileService, editorResolverService: IEditorResolverService);
    private registerDefaultEditor;
    resolveTextEditor(input: IUntypedEditorInput): Promise<EditorInput>;
    resolveTextEditor(input: IUntypedFileEditorInput): Promise<IFileEditorInput>;
    createTextEditor(input: IUntypedEditorInput): EditorInput;
    createTextEditor(input: IUntypedFileEditorInput): IFileEditorInput;
    private createOrGetCached;
}
