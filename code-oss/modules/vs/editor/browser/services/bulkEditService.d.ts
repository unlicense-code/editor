import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { TextEdit, WorkspaceEdit, WorkspaceEditMetadata, IWorkspaceFileEdit, WorkspaceFileEditOptions, IWorkspaceTextEdit } from 'vs/editor/common/languages';
import { IProgress, IProgressStep } from 'vs/platform/progress/common/progress';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { UndoRedoSource } from 'vs/platform/undoRedo/common/undoRedo';
import { CancellationToken } from 'vs/base/common/cancellation';
export declare const IBulkEditService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IBulkEditService>;
export declare class ResourceEdit {
    readonly metadata?: WorkspaceEditMetadata | undefined;
    protected constructor(metadata?: WorkspaceEditMetadata | undefined);
    static convert(edit: WorkspaceEdit): ResourceEdit[];
}
export declare class ResourceTextEdit extends ResourceEdit implements IWorkspaceTextEdit {
    readonly resource: URI;
    readonly textEdit: TextEdit & {
        insertAsSnippet?: boolean;
    };
    readonly versionId: number | undefined;
    static is(candidate: any): candidate is IWorkspaceTextEdit;
    static lift(edit: IWorkspaceTextEdit): ResourceTextEdit;
    constructor(resource: URI, textEdit: TextEdit & {
        insertAsSnippet?: boolean;
    }, versionId?: number | undefined, metadata?: WorkspaceEditMetadata);
}
export declare class ResourceFileEdit extends ResourceEdit implements IWorkspaceFileEdit {
    readonly oldResource: URI | undefined;
    readonly newResource: URI | undefined;
    readonly options: WorkspaceFileEditOptions;
    static is(candidate: any): candidate is IWorkspaceFileEdit;
    static lift(edit: IWorkspaceFileEdit): ResourceFileEdit;
    constructor(oldResource: URI | undefined, newResource: URI | undefined, options?: WorkspaceFileEditOptions, metadata?: WorkspaceEditMetadata);
}
export interface IBulkEditOptions {
    editor?: ICodeEditor;
    progress?: IProgress<IProgressStep>;
    token?: CancellationToken;
    showPreview?: boolean;
    label?: string;
    code?: string;
    quotableLabel?: string;
    undoRedoSource?: UndoRedoSource;
    undoRedoGroupId?: number;
    confirmBeforeUndo?: boolean;
    respectAutoSaveConfig?: boolean;
}
export interface IBulkEditResult {
    ariaSummary: string;
    isApplied: boolean;
}
export declare type IBulkEditPreviewHandler = (edits: ResourceEdit[], options?: IBulkEditOptions) => Promise<ResourceEdit[]>;
export interface IBulkEditService {
    readonly _serviceBrand: undefined;
    hasPreviewHandler(): boolean;
    setPreviewHandler(handler: IBulkEditPreviewHandler): IDisposable;
    apply(edit: ResourceEdit[] | WorkspaceEdit, options?: IBulkEditOptions): Promise<IBulkEditResult>;
}
