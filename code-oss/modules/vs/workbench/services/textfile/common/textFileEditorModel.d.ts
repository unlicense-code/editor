import { URI } from 'vs/base/common/uri';
import { EncodingMode, ITextFileService, TextFileEditorModelState, ITextFileEditorModel, ITextFileResolveOptions, IResolvedTextFileEditorModel, ITextFileSaveOptions, TextFileResolveReason, ITextFileEditorModelSaveEvent } from 'vs/workbench/services/textfile/common/textfiles';
import { IRevertOptions } from 'vs/workbench/common/editor';
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { IFileService, IFileStatWithMetadata } from 'vs/platform/files/common/files';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModel } from 'vs/editor/common/model';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IWorkingCopyBackup, WorkingCopyCapabilities } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { ILabelService } from 'vs/platform/label/common/label';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
/**
 * The text file editor model listens to changes to its underlying code editor model and saves these changes through the file service back to the disk.
 */
export declare class TextFileEditorModel extends BaseTextEditorModel implements ITextFileEditorModel {
    readonly resource: URI;
    private preferredEncoding;
    private preferredLanguageId;
    private readonly fileService;
    private readonly textFileService;
    private readonly workingCopyBackupService;
    private readonly logService;
    private readonly workingCopyService;
    private readonly filesConfigurationService;
    private readonly labelService;
    private readonly pathService;
    private readonly extensionService;
    private static readonly TEXTFILE_SAVE_ENCODING_SOURCE;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: import("vs/base/common/event").Event<void>;
    private readonly _onDidResolve;
    readonly onDidResolve: import("vs/base/common/event").Event<TextFileResolveReason>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: import("vs/base/common/event").Event<void>;
    private readonly _onDidSaveError;
    readonly onDidSaveError: import("vs/base/common/event").Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: import("vs/base/common/event").Event<ITextFileEditorModelSaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: import("vs/base/common/event").Event<void>;
    private readonly _onDidChangeEncoding;
    readonly onDidChangeEncoding: import("vs/base/common/event").Event<void>;
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: import("vs/base/common/event").Event<void>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: import("vs/base/common/event").Event<void>;
    readonly typeId = "";
    readonly capabilities: WorkingCopyCapabilities;
    readonly name: string;
    private resourceHasExtension;
    private contentEncoding;
    private versionId;
    private bufferSavedVersionId;
    private ignoreDirtyOnModelContentChange;
    private ignoreSaveFromSaveParticipants;
    private static readonly UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD;
    private lastModelContentChangeFromUndoRedo;
    lastResolvedFileStat: IFileStatWithMetadata | undefined;
    private readonly saveSequentializer;
    private dirty;
    private inConflictMode;
    private inOrphanMode;
    private inErrorMode;
    constructor(resource: URI, preferredEncoding: string | undefined, // encoding as chosen by the user
    preferredLanguageId: string | undefined, // language id as chosen by the user
    languageService: ILanguageService, modelService: IModelService, fileService: IFileService, textFileService: ITextFileService, workingCopyBackupService: IWorkingCopyBackupService, logService: ILogService, workingCopyService: IWorkingCopyService, filesConfigurationService: IFilesConfigurationService, labelService: ILabelService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService, pathService: IPathService, extensionService: IExtensionService);
    private registerListeners;
    private onDidFilesChange;
    private setOrphaned;
    private onFilesAssociationChange;
    setLanguageId(languageId: string, source?: string): void;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    revert(options?: IRevertOptions): Promise<void>;
    resolve(options?: ITextFileResolveOptions): Promise<void>;
    private doResolve;
    private resolveFromBuffer;
    private resolveFromBackup;
    private doResolveFromBackup;
    private resolveFromFile;
    private resolveFromContent;
    private doCreateTextModel;
    private doUpdateTextModel;
    protected installModelListeners(model: ITextModel): void;
    private onModelContentChanged;
    protected autoDetectLanguage(): Promise<void>;
    private forceResolveFromFile;
    isDirty(): this is IResolvedTextFileEditorModel;
    setDirty(dirty: boolean): void;
    private doSetDirty;
    save(options?: ITextFileSaveOptions): Promise<boolean>;
    private doSave;
    private handleSaveSuccess;
    private handleSaveError;
    private updateSavedVersionId;
    private updateLastResolvedFileStat;
    hasState(state: TextFileEditorModelState): boolean;
    joinState(state: TextFileEditorModelState.PENDING_SAVE): Promise<void>;
    getLanguageId(this: IResolvedTextFileEditorModel): string;
    getLanguageId(): string | undefined;
    private onMaybeShouldChangeEncoding;
    private hasEncodingSetExplicitly;
    setEncoding(encoding: string, mode: EncodingMode): Promise<void>;
    private setEncodingInternal;
    updatePreferredEncoding(encoding: string | undefined): void;
    private isNewEncoding;
    getEncoding(): string | undefined;
    private trace;
    isResolved(): this is IResolvedTextFileEditorModel;
    isReadonly(): boolean;
    dispose(): void;
}