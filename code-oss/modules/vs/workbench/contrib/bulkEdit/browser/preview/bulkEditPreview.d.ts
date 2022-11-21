import { ITextModelContentProvider, ITextModelService } from 'vs/editor/common/services/resolverService';
import { URI } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { WorkspaceEditMetadata } from 'vs/editor/common/languages';
import { ISingleEditOperation } from 'vs/editor/common/core/editOperation';
import { ServicesAccessor, IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IFileService } from 'vs/platform/files/common/files';
import { Event } from 'vs/base/common/event';
import { ConflictDetector } from 'vs/workbench/contrib/bulkEdit/browser/conflicts';
import { ResourceEdit, ResourceFileEdit, ResourceTextEdit } from 'vs/editor/browser/services/bulkEditService';
export declare class CheckedStates<T extends object> {
    private readonly _states;
    private _checkedCount;
    private readonly _onDidChange;
    readonly onDidChange: Event<T>;
    dispose(): void;
    get checkedCount(): number;
    isChecked(obj: T): boolean;
    updateChecked(obj: T, value: boolean): void;
}
export declare class BulkTextEdit {
    readonly parent: BulkFileOperation;
    readonly textEdit: ResourceTextEdit;
    constructor(parent: BulkFileOperation, textEdit: ResourceTextEdit);
}
export declare const enum BulkFileOperationType {
    TextEdit = 1,
    Create = 2,
    Delete = 4,
    Rename = 8
}
export declare class BulkFileOperation {
    readonly uri: URI;
    readonly parent: BulkFileOperations;
    type: BulkFileOperationType;
    textEdits: BulkTextEdit[];
    originalEdits: Map<number, ResourceTextEdit | ResourceFileEdit>;
    newUri?: URI;
    constructor(uri: URI, parent: BulkFileOperations);
    addEdit(index: number, type: BulkFileOperationType, edit: ResourceTextEdit | ResourceFileEdit): void;
    needsConfirmation(): boolean;
}
export declare class BulkCategory {
    readonly metadata: WorkspaceEditMetadata;
    private static readonly _defaultMetadata;
    static keyOf(metadata?: WorkspaceEditMetadata): string;
    readonly operationByResource: Map<string, BulkFileOperation>;
    constructor(metadata?: WorkspaceEditMetadata);
    get fileOperations(): IterableIterator<BulkFileOperation>;
}
export declare class BulkFileOperations {
    private readonly _bulkEdit;
    private readonly _fileService;
    static create(accessor: ServicesAccessor, bulkEdit: ResourceEdit[]): Promise<BulkFileOperations>;
    readonly checked: CheckedStates<ResourceEdit>;
    readonly fileOperations: BulkFileOperation[];
    readonly categories: BulkCategory[];
    readonly conflicts: ConflictDetector;
    constructor(_bulkEdit: ResourceEdit[], _fileService: IFileService, instaService: IInstantiationService);
    dispose(): void;
    _init(): Promise<this>;
    getWorkspaceEdit(): ResourceEdit[];
    getFileEdits(uri: URI): ISingleEditOperation[];
    getUriOfEdit(edit: ResourceEdit): URI;
}
export declare class BulkEditPreviewProvider implements ITextModelContentProvider {
    private readonly _operations;
    private readonly _languageService;
    private readonly _modelService;
    private readonly _textModelResolverService;
    static readonly Schema = "vscode-bulkeditpreview";
    static emptyPreview: URI;
    static fromPreviewUri(uri: URI): URI;
    private readonly _disposables;
    private readonly _ready;
    private readonly _modelPreviewEdits;
    private readonly _instanceId;
    constructor(_operations: BulkFileOperations, _languageService: ILanguageService, _modelService: IModelService, _textModelResolverService: ITextModelService);
    dispose(): void;
    asPreviewUri(uri: URI): URI;
    private _init;
    private _applyTextEditsToPreviewModel;
    private _getOrCreatePreviewModel;
    provideTextContent(previewUri: URI): Promise<import("../../../../../editor/common/model").ITextModel | null>;
}
