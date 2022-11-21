import { ISaveOptions } from 'vs/workbench/common/editor';
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { URI } from 'vs/base/common/uri';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { Event } from 'vs/base/common/event';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { ITextModel } from 'vs/editor/common/model';
import { ITextEditorModel } from 'vs/editor/common/services/resolverService';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IWorkingCopy, WorkingCopyCapabilities, IWorkingCopyBackup, IWorkingCopySaveEvent } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { IEncodingSupport, ILanguageSupport, ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ILabelService } from 'vs/platform/label/common/label';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
export interface IUntitledTextEditorModel extends ITextEditorModel, ILanguageSupport, IEncodingSupport, IWorkingCopy {
    /**
     * Emits an event when the encoding of this untitled model changes.
     */
    readonly onDidChangeEncoding: Event<void>;
    /**
     * Emits an event when the name of this untitled model changes.
     */
    readonly onDidChangeName: Event<void>;
    /**
     * Emits an event when this untitled model is reverted.
     */
    readonly onDidRevert: Event<void>;
    /**
     * Whether this untitled text model has an associated file path.
     */
    readonly hasAssociatedFilePath: boolean;
    /**
     * Whether this model has an explicit language or not.
     */
    readonly hasLanguageSetExplicitly: boolean;
    /**
     * Sets the encoding to use for this untitled model.
     */
    setEncoding(encoding: string): Promise<void>;
    /**
     * Resolves the untitled model.
     */
    resolve(): Promise<void>;
}
export declare class UntitledTextEditorModel extends BaseTextEditorModel implements IUntitledTextEditorModel {
    readonly resource: URI;
    readonly hasAssociatedFilePath: boolean;
    private readonly initialValue;
    private preferredLanguageId;
    private preferredEncoding;
    private readonly workingCopyBackupService;
    private readonly textResourceConfigurationService;
    private readonly workingCopyService;
    private readonly textFileService;
    private readonly labelService;
    private readonly editorService;
    private static readonly FIRST_LINE_NAME_MAX_LENGTH;
    private static readonly FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH;
    private static readonly ACTIVE_EDITOR_LANGUAGE_ID;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidChangeName;
    readonly onDidChangeName: Event<void>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidChangeEncoding;
    readonly onDidChangeEncoding: Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<void>;
    readonly typeId = "";
    readonly capabilities: WorkingCopyCapabilities;
    private configuredLabelFormat;
    private cachedModelFirstLineWords;
    get name(): string;
    constructor(resource: URI, hasAssociatedFilePath: boolean, initialValue: string | undefined, preferredLanguageId: string | undefined, preferredEncoding: string | undefined, languageService: ILanguageService, modelService: IModelService, workingCopyBackupService: IWorkingCopyBackupService, textResourceConfigurationService: ITextResourceConfigurationService, workingCopyService: IWorkingCopyService, textFileService: ITextFileService, labelService: ILabelService, editorService: IEditorService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService);
    private registerListeners;
    private onConfigurationChange;
    setLanguageId(languageId: string, source?: string): void;
    getLanguageId(): string | undefined;
    private configuredEncoding;
    getEncoding(): string | undefined;
    setEncoding(encoding: string): Promise<void>;
    private dirty;
    isDirty(): boolean;
    private setDirty;
    save(options?: ISaveOptions): Promise<boolean>;
    revert(): Promise<void>;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    resolve(): Promise<void>;
    protected installModelListeners(model: ITextModel): void;
    private onModelContentChanged;
    private updateNameFromFirstLine;
    isReadonly(): boolean;
}
