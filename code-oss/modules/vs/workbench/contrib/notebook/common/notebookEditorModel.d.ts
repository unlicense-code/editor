import { IRevertOptions, ISaveOptions, IUntypedEditorInput } from 'vs/workbench/common/editor';
import { EditorModel } from 'vs/workbench/common/editor/editorModel';
import { Event } from 'vs/base/common/event';
import { INotebookEditorModel, INotebookLoadOptions, IResolvedNotebookEditorModel } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { NotebookTextModel } from 'vs/workbench/contrib/notebook/common/model/notebookTextModel';
import { INotebookContentProvider, INotebookSerializer, INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { URI } from 'vs/base/common/uri';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IWorkingCopyBackup, IWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IFileService } from 'vs/platform/files/common/files';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelContentChangedEvent, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/storedFileWorkingCopy';
import { Disposable } from 'vs/base/common/lifecycle';
import { IFileWorkingCopyManager } from 'vs/workbench/services/workingCopy/common/fileWorkingCopyManager';
import { IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelContentChangedEvent, IUntitledFileWorkingCopyModelFactory } from 'vs/workbench/services/workingCopy/common/untitledFileWorkingCopy';
export declare class ComplexNotebookEditorModel extends EditorModel implements INotebookEditorModel {
    readonly resource: URI;
    readonly viewType: string;
    private readonly _contentProvider;
    private readonly _notebookService;
    private readonly _workingCopyService;
    private readonly _workingCopyBackupService;
    private readonly _fileService;
    private readonly _notificationService;
    private readonly _logService;
    private readonly untitledTextEditorService;
    private readonly _onDidSave;
    private readonly _onDidChangeDirty;
    private readonly _onDidChangeContent;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    readonly onDidChangeDirty: Event<void>;
    readonly onDidChangeOrphaned: Event<any>;
    readonly onDidChangeReadonly: Event<any>;
    private _lastResolvedFileStat?;
    private readonly _name;
    private readonly _workingCopyIdentifier;
    private readonly _saveSequentializer;
    private _dirty;
    constructor(resource: URI, viewType: string, _contentProvider: INotebookContentProvider, _notebookService: INotebookService, _workingCopyService: IWorkingCopyService, _workingCopyBackupService: IWorkingCopyBackupService, _fileService: IFileService, _notificationService: INotificationService, _logService: ILogService, untitledTextEditorService: IUntitledTextEditorService, labelService: ILabelService);
    isResolved(): this is IResolvedNotebookEditorModel;
    isDirty(): boolean;
    isReadonly(): boolean;
    isOrphaned(): boolean;
    hasAssociatedFilePath(): boolean;
    private _isUntitled;
    get notebook(): NotebookTextModel | undefined;
    setDirty(newState: boolean): void;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    revert(options?: IRevertOptions | undefined): Promise<void>;
    load(options?: INotebookLoadOptions): Promise<IResolvedNotebookEditorModel>;
    /**
     * @description Uses the textmodel resolver service to acquire the untitled file's content
     * @param resource The resource that is the untitled file
     * @returns The bytes
     */
    private getUntitledDocumentData;
    private _loadFromProvider;
    private _assertStat;
    save(): Promise<boolean>;
    saveAs(targetResource: URI): Promise<IUntypedEditorInput | undefined>;
    private _resolveStats;
}
export declare class SimpleNotebookEditorModel extends EditorModel implements INotebookEditorModel {
    readonly resource: URI;
    private readonly _hasAssociatedFilePath;
    readonly viewType: string;
    private readonly _workingCopyManager;
    private readonly _fileService;
    private readonly _onDidChangeDirty;
    private readonly _onDidSave;
    private readonly _onDidChangeOrphaned;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeDirty: Event<void>;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    readonly onDidChangeOrphaned: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    private _workingCopy?;
    private readonly _workingCopyListeners;
    constructor(resource: URI, _hasAssociatedFilePath: boolean, viewType: string, _workingCopyManager: IFileWorkingCopyManager<NotebookFileWorkingCopyModel, NotebookFileWorkingCopyModel>, _fileService: IFileService);
    dispose(): void;
    get notebook(): NotebookTextModel | undefined;
    isResolved(): this is IResolvedNotebookEditorModel;
    isDirty(): boolean;
    isOrphaned(): boolean;
    hasAssociatedFilePath(): boolean;
    isReadonly(): boolean;
    revert(options?: IRevertOptions): Promise<void>;
    save(options?: ISaveOptions): Promise<boolean>;
    load(options?: INotebookLoadOptions): Promise<IResolvedNotebookEditorModel>;
    saveAs(target: URI): Promise<IUntypedEditorInput | undefined>;
    private static _isStoredFileWorkingCopy;
}
export declare class NotebookFileWorkingCopyModel extends Disposable implements IStoredFileWorkingCopyModel, IUntitledFileWorkingCopyModel {
    private readonly _notebookModel;
    private readonly _notebookSerializer;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<IStoredFileWorkingCopyModelContentChangedEvent & IUntitledFileWorkingCopyModelContentChangedEvent>;
    readonly onWillDispose: Event<void>;
    constructor(_notebookModel: NotebookTextModel, _notebookSerializer: INotebookSerializer);
    dispose(): void;
    get notebookModel(): NotebookTextModel;
    snapshot(token: CancellationToken): Promise<VSBufferReadableStream>;
    update(stream: VSBufferReadableStream, token: CancellationToken): Promise<void>;
    get versionId(): string;
    pushStackElement(): void;
}
export declare class NotebookFileWorkingCopyModelFactory implements IStoredFileWorkingCopyModelFactory<NotebookFileWorkingCopyModel>, IUntitledFileWorkingCopyModelFactory<NotebookFileWorkingCopyModel> {
    private readonly _viewType;
    private readonly _notebookService;
    constructor(_viewType: string, _notebookService: INotebookService);
    createModel(resource: URI, stream: VSBufferReadableStream, token: CancellationToken): Promise<NotebookFileWorkingCopyModel>;
}
