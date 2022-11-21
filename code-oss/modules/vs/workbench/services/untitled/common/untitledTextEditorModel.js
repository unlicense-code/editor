/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BaseTextEditorModel } from 'vs/workbench/common/editor/textEditorModel';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IModelService } from 'vs/editor/common/services/model';
import { Emitter } from 'vs/base/common/event';
import { IWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/common/workingCopyBackup';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { createTextBufferFactoryFromStream } from 'vs/editor/common/model/textModel';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { NO_TYPE_ID } from 'vs/workbench/services/workingCopy/common/workingCopy';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { withNullAsUndefined, assertIsDefined } from 'vs/base/common/types';
import { ILabelService } from 'vs/platform/label/common/label';
import { ensureValidWordDefinition } from 'vs/editor/common/core/wordHelper';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { getCharContainingOffset } from 'vs/base/common/strings';
import { UTF8 } from 'vs/workbench/services/textfile/common/encoding';
import { bufferToReadable, bufferToStream, VSBuffer } from 'vs/base/common/buffer';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
let UntitledTextEditorModel = class UntitledTextEditorModel extends BaseTextEditorModel {
    resource;
    hasAssociatedFilePath;
    initialValue;
    preferredLanguageId;
    preferredEncoding;
    workingCopyBackupService;
    textResourceConfigurationService;
    workingCopyService;
    textFileService;
    labelService;
    editorService;
    static FIRST_LINE_NAME_MAX_LENGTH = 40;
    static FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH = UntitledTextEditorModel.FIRST_LINE_NAME_MAX_LENGTH * 10;
    // Support the special '${activeEditorLanguage}' language by
    // looking up the language id from the editor that is active
    // before the untitled editor opens. This special id is only
    // used for the initial language and can be changed after the
    // fact (either manually or through auto-detection).
    static ACTIVE_EDITOR_LANGUAGE_ID = '${activeEditorLanguage}';
    //#region Events
    _onDidChangeContent = this._register(new Emitter());
    onDidChangeContent = this._onDidChangeContent.event;
    _onDidChangeName = this._register(new Emitter());
    onDidChangeName = this._onDidChangeName.event;
    _onDidChangeDirty = this._register(new Emitter());
    onDidChangeDirty = this._onDidChangeDirty.event;
    _onDidChangeEncoding = this._register(new Emitter());
    onDidChangeEncoding = this._onDidChangeEncoding.event;
    _onDidSave = this._register(new Emitter());
    onDidSave = this._onDidSave.event;
    _onDidRevert = this._register(new Emitter());
    onDidRevert = this._onDidRevert.event;
    //#endregion
    typeId = NO_TYPE_ID; // IMPORTANT: never change this to not break existing assumptions (e.g. backups)
    capabilities = 2 /* WorkingCopyCapabilities.Untitled */;
    //#region Name
    configuredLabelFormat = 'content';
    cachedModelFirstLineWords = undefined;
    get name() {
        // Take name from first line if present and only if
        // we have no associated file path. In that case we
        // prefer the file name as title.
        if (this.configuredLabelFormat === 'content' && !this.hasAssociatedFilePath && this.cachedModelFirstLineWords) {
            return this.cachedModelFirstLineWords;
        }
        // Otherwise fallback to resource
        return this.labelService.getUriBasenameLabel(this.resource);
    }
    //#endregion
    constructor(resource, hasAssociatedFilePath, initialValue, preferredLanguageId, preferredEncoding, languageService, modelService, workingCopyBackupService, textResourceConfigurationService, workingCopyService, textFileService, labelService, editorService, languageDetectionService, accessibilityService) {
        super(modelService, languageService, languageDetectionService, accessibilityService);
        this.resource = resource;
        this.hasAssociatedFilePath = hasAssociatedFilePath;
        this.initialValue = initialValue;
        this.preferredLanguageId = preferredLanguageId;
        this.preferredEncoding = preferredEncoding;
        this.workingCopyBackupService = workingCopyBackupService;
        this.textResourceConfigurationService = textResourceConfigurationService;
        this.workingCopyService = workingCopyService;
        this.textFileService = textFileService;
        this.labelService = labelService;
        this.editorService = editorService;
        // Make known to working copy service
        this._register(this.workingCopyService.registerWorkingCopy(this));
        // This is typically controlled by the setting `files.defaultLanguage`.
        // If that setting is set, we should not detect the language.
        if (preferredLanguageId) {
            this.setLanguageId(preferredLanguageId);
        }
        // Fetch config
        this.onConfigurationChange(false);
        this.registerListeners();
    }
    registerListeners() {
        // Config Changes
        this._register(this.textResourceConfigurationService.onDidChangeConfiguration(() => this.onConfigurationChange(true)));
    }
    onConfigurationChange(fromEvent) {
        // Encoding
        const configuredEncoding = this.textResourceConfigurationService.getValue(this.resource, 'files.encoding');
        if (this.configuredEncoding !== configuredEncoding && typeof configuredEncoding === 'string') {
            this.configuredEncoding = configuredEncoding;
            if (fromEvent && !this.preferredEncoding) {
                this._onDidChangeEncoding.fire(); // do not fire event if we have a preferred encoding set
            }
        }
        // Label Format
        const configuredLabelFormat = this.textResourceConfigurationService.getValue(this.resource, 'workbench.editor.untitled.labelFormat');
        if (this.configuredLabelFormat !== configuredLabelFormat && (configuredLabelFormat === 'content' || configuredLabelFormat === 'name')) {
            this.configuredLabelFormat = configuredLabelFormat;
            if (fromEvent) {
                this._onDidChangeName.fire();
            }
        }
    }
    //#region Language
    setLanguageId(languageId, source) {
        const actualLanguage = languageId === UntitledTextEditorModel.ACTIVE_EDITOR_LANGUAGE_ID
            ? this.editorService.activeTextEditorLanguageId
            : languageId;
        this.preferredLanguageId = actualLanguage;
        if (actualLanguage) {
            super.setLanguageId(actualLanguage, source);
        }
    }
    getLanguageId() {
        if (this.textEditorModel) {
            return this.textEditorModel.getLanguageId();
        }
        return this.preferredLanguageId;
    }
    //#endregion
    //#region Encoding
    configuredEncoding;
    getEncoding() {
        return this.preferredEncoding || this.configuredEncoding;
    }
    async setEncoding(encoding) {
        const oldEncoding = this.getEncoding();
        this.preferredEncoding = encoding;
        // Emit if it changed
        if (oldEncoding !== this.preferredEncoding) {
            this._onDidChangeEncoding.fire();
        }
    }
    //#endregion
    //#region Dirty
    dirty = this.hasAssociatedFilePath || !!this.initialValue;
    isDirty() {
        return this.dirty;
    }
    setDirty(dirty) {
        if (this.dirty === dirty) {
            return;
        }
        this.dirty = dirty;
        this._onDidChangeDirty.fire();
    }
    //#endregion
    //#region Save / Revert / Backup
    async save(options) {
        const target = await this.textFileService.save(this.resource, options);
        // Emit as event
        if (target) {
            this._onDidSave.fire({ reason: options?.reason, source: options?.source });
        }
        return !!target;
    }
    async revert() {
        this.setDirty(false);
        // Emit as event
        this._onDidRevert.fire();
        // A reverted untitled model is invalid because it has
        // no actual source on disk to revert to. As such we
        // dispose the model.
        this.dispose();
    }
    async backup(token) {
        let content = undefined;
        // Make sure to check whether this model has been resolved
        // or not and fallback to the initial value - if any - to
        // prevent backing up an unresolved model and loosing the
        // initial value.
        if (this.isResolved()) {
            // Fill in content the same way we would do when saving the file
            // via the text file service encoding support (hardcode UTF-8)
            content = await this.textFileService.getEncodedReadable(this.resource, withNullAsUndefined(this.createSnapshot()), { encoding: UTF8 });
        }
        else if (typeof this.initialValue === 'string') {
            content = bufferToReadable(VSBuffer.fromString(this.initialValue));
        }
        return { content };
    }
    //#endregion
    //#region Resolve
    async resolve() {
        // Create text editor model if not yet done
        let createdUntitledModel = false;
        let hasBackup = false;
        if (!this.textEditorModel) {
            let untitledContents;
            // Check for backups or use initial value or empty
            const backup = await this.workingCopyBackupService.resolve(this);
            if (backup) {
                untitledContents = backup.value;
                hasBackup = true;
            }
            else {
                untitledContents = bufferToStream(VSBuffer.fromString(this.initialValue || ''));
            }
            // Determine untitled contents based on backup
            // or initial value. We must use text file service
            // to create the text factory to respect encodings
            // accordingly.
            const untitledContentsFactory = await createTextBufferFactoryFromStream(await this.textFileService.getDecodedStream(this.resource, untitledContents, { encoding: UTF8 }));
            this.createTextEditorModel(untitledContentsFactory, this.resource, this.preferredLanguageId);
            createdUntitledModel = true;
        }
        // Otherwise: the untitled model already exists and we must assume
        // that the value of the model was changed by the user. As such we
        // do not update the contents, only the language if configured.
        else {
            this.updateTextEditorModel(undefined, this.preferredLanguageId);
        }
        // Listen to text model events
        const textEditorModel = assertIsDefined(this.textEditorModel);
        this.installModelListeners(textEditorModel);
        // Only adjust name and dirty state etc. if we
        // actually created the untitled model
        if (createdUntitledModel) {
            // Name
            if (hasBackup || this.initialValue) {
                this.updateNameFromFirstLine(textEditorModel);
            }
            // Untitled associated to file path are dirty right away as well as untitled with content
            this.setDirty(this.hasAssociatedFilePath || !!hasBackup || !!this.initialValue);
            // If we have initial contents, make sure to emit this
            // as the appropiate events to the outside.
            if (hasBackup || this.initialValue) {
                this._onDidChangeContent.fire();
            }
        }
        return super.resolve();
    }
    installModelListeners(model) {
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e)));
        this._register(model.onDidChangeLanguage(() => this.onConfigurationChange(true))); // language change can have impact on config
        super.installModelListeners(model);
    }
    onModelContentChanged(textEditorModel, e) {
        // mark the untitled text editor as non-dirty once its content becomes empty and we do
        // not have an associated path set. we never want dirty indicator in that case.
        if (!this.hasAssociatedFilePath && textEditorModel.getLineCount() === 1 && textEditorModel.getLineContent(1) === '') {
            this.setDirty(false);
        }
        // turn dirty otherwise
        else {
            this.setDirty(true);
        }
        // Check for name change if first line changed in the range of 0-FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH columns
        if (e.changes.some(change => (change.range.startLineNumber === 1 || change.range.endLineNumber === 1) && change.range.startColumn <= UntitledTextEditorModel.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH)) {
            this.updateNameFromFirstLine(textEditorModel);
        }
        // Emit as general content change event
        this._onDidChangeContent.fire();
        // Detect language from content
        this.autoDetectLanguage();
    }
    updateNameFromFirstLine(textEditorModel) {
        if (this.hasAssociatedFilePath) {
            return; // not in case of an associated file path
        }
        // Determine the first words of the model following these rules:
        // - cannot be only whitespace (so we trim())
        // - cannot be only non-alphanumeric characters (so we run word definition regex over it)
        // - cannot be longer than FIRST_LINE_MAX_TITLE_LENGTH
        // - normalize multiple whitespaces to a single whitespace
        let modelFirstWordsCandidate = undefined;
        let firstLineText = textEditorModel
            .getValueInRange({
            startLineNumber: 1,
            endLineNumber: 1,
            startColumn: 1,
            endColumn: UntitledTextEditorModel.FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH + 1 // first cap at FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH
        })
            .trim().replace(/\s+/g, ' '); // normalize whitespaces
        firstLineText = firstLineText.substr(0, getCharContainingOffset(// finally cap at FIRST_LINE_NAME_MAX_LENGTH (grapheme aware #111235)
        firstLineText, UntitledTextEditorModel.FIRST_LINE_NAME_MAX_LENGTH)[0]);
        if (firstLineText && ensureValidWordDefinition().exec(firstLineText)) {
            modelFirstWordsCandidate = firstLineText;
        }
        if (modelFirstWordsCandidate !== this.cachedModelFirstLineWords) {
            this.cachedModelFirstLineWords = modelFirstWordsCandidate;
            this._onDidChangeName.fire();
        }
    }
    //#endregion
    isReadonly() {
        return false;
    }
};
UntitledTextEditorModel = __decorate([
    __param(5, ILanguageService),
    __param(6, IModelService),
    __param(7, IWorkingCopyBackupService),
    __param(8, ITextResourceConfigurationService),
    __param(9, IWorkingCopyService),
    __param(10, ITextFileService),
    __param(11, ILabelService),
    __param(12, IEditorService),
    __param(13, ILanguageDetectionService),
    __param(14, IAccessibilityService)
], UntitledTextEditorModel);
export { UntitledTextEditorModel };
