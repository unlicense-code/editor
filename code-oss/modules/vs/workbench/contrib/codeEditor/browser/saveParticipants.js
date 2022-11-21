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
import * as strings from 'vs/base/common/strings';
import { isCodeEditor } from 'vs/editor/browser/editorBrowser';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { trimTrailingWhitespace } from 'vs/editor/common/commands/trimTrailingWhitespaceCommand';
import { EditOperation } from 'vs/editor/common/core/editOperation';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { applyCodeAction, ApplyCodeActionReason, getCodeActions } from 'vs/editor/contrib/codeAction/browser/codeAction';
import { CodeActionKind, CodeActionTriggerSource } from 'vs/editor/contrib/codeAction/common/types';
import { formatDocumentRangesWithSelectedProvider, formatDocumentWithSelectedProvider } from 'vs/editor/contrib/format/browser/format';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Progress } from 'vs/platform/progress/common/progress';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { Disposable } from 'vs/base/common/lifecycle';
import { Extensions as WorkbenchContributionsExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { getModifiedRanges } from 'vs/workbench/contrib/format/browser/formatModified';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
let TrimWhitespaceParticipant = class TrimWhitespaceParticipant {
    configurationService;
    codeEditorService;
    constructor(configurationService, codeEditorService) {
        this.configurationService = configurationService;
        this.codeEditorService = codeEditorService;
        // Nothing
    }
    async participate(model, env) {
        if (!model.textEditorModel) {
            return;
        }
        if (this.configurationService.getValue('files.trimTrailingWhitespace', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
            this.doTrimTrailingWhitespace(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
        }
    }
    doTrimTrailingWhitespace(model, isAutoSaved) {
        let prevSelection = [];
        let cursors = [];
        const editor = findEditor(model, this.codeEditorService);
        if (editor) {
            // Find `prevSelection` in any case do ensure a good undo stack when pushing the edit
            // Collect active cursors in `cursors` only if `isAutoSaved` to avoid having the cursors jump
            prevSelection = editor.getSelections();
            if (isAutoSaved) {
                cursors = prevSelection.map(s => s.getPosition());
                const snippetsRange = SnippetController2.get(editor)?.getSessionEnclosingRange();
                if (snippetsRange) {
                    for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
                        cursors.push(new Position(lineNumber, model.getLineMaxColumn(lineNumber)));
                    }
                }
            }
        }
        const ops = trimTrailingWhitespace(model, cursors);
        if (!ops.length) {
            return; // Nothing to do
        }
        model.pushEditOperations(prevSelection, ops, (_edits) => prevSelection);
    }
};
TrimWhitespaceParticipant = __decorate([
    __param(0, IConfigurationService),
    __param(1, ICodeEditorService)
], TrimWhitespaceParticipant);
export { TrimWhitespaceParticipant };
function findEditor(model, codeEditorService) {
    let candidate = null;
    if (model.isAttachedToEditor()) {
        for (const editor of codeEditorService.listCodeEditors()) {
            if (editor.hasModel() && editor.getModel() === model) {
                if (editor.hasTextFocus()) {
                    return editor; // favour focused editor if there are multiple
                }
                candidate = editor;
            }
        }
    }
    return candidate;
}
let FinalNewLineParticipant = class FinalNewLineParticipant {
    configurationService;
    codeEditorService;
    constructor(configurationService, codeEditorService) {
        this.configurationService = configurationService;
        this.codeEditorService = codeEditorService;
        // Nothing
    }
    async participate(model, _env) {
        if (!model.textEditorModel) {
            return;
        }
        if (this.configurationService.getValue('files.insertFinalNewline', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
            this.doInsertFinalNewLine(model.textEditorModel);
        }
    }
    doInsertFinalNewLine(model) {
        const lineCount = model.getLineCount();
        const lastLine = model.getLineContent(lineCount);
        const lastLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(lastLine) === -1;
        if (!lineCount || lastLineIsEmptyOrWhitespace) {
            return;
        }
        const edits = [EditOperation.insert(new Position(lineCount, model.getLineMaxColumn(lineCount)), model.getEOL())];
        const editor = findEditor(model, this.codeEditorService);
        if (editor) {
            editor.executeEdits('insertFinalNewLine', edits, editor.getSelections());
        }
        else {
            model.pushEditOperations([], edits, () => null);
        }
    }
};
FinalNewLineParticipant = __decorate([
    __param(0, IConfigurationService),
    __param(1, ICodeEditorService)
], FinalNewLineParticipant);
export { FinalNewLineParticipant };
let TrimFinalNewLinesParticipant = class TrimFinalNewLinesParticipant {
    configurationService;
    codeEditorService;
    constructor(configurationService, codeEditorService) {
        this.configurationService = configurationService;
        this.codeEditorService = codeEditorService;
        // Nothing
    }
    async participate(model, env) {
        if (!model.textEditorModel) {
            return;
        }
        if (this.configurationService.getValue('files.trimFinalNewlines', { overrideIdentifier: model.textEditorModel.getLanguageId(), resource: model.resource })) {
            this.doTrimFinalNewLines(model.textEditorModel, env.reason === 2 /* SaveReason.AUTO */);
        }
    }
    /**
     * returns 0 if the entire file is empty
     */
    findLastNonEmptyLine(model) {
        for (let lineNumber = model.getLineCount(); lineNumber >= 1; lineNumber--) {
            const lineContent = model.getLineContent(lineNumber);
            if (lineContent.length > 0) {
                // this line has content
                return lineNumber;
            }
        }
        // no line has content
        return 0;
    }
    doTrimFinalNewLines(model, isAutoSaved) {
        const lineCount = model.getLineCount();
        // Do not insert new line if file does not end with new line
        if (lineCount === 1) {
            return;
        }
        let prevSelection = [];
        let cannotTouchLineNumber = 0;
        const editor = findEditor(model, this.codeEditorService);
        if (editor) {
            prevSelection = editor.getSelections();
            if (isAutoSaved) {
                for (let i = 0, len = prevSelection.length; i < len; i++) {
                    const positionLineNumber = prevSelection[i].positionLineNumber;
                    if (positionLineNumber > cannotTouchLineNumber) {
                        cannotTouchLineNumber = positionLineNumber;
                    }
                }
            }
        }
        const lastNonEmptyLine = this.findLastNonEmptyLine(model);
        const deleteFromLineNumber = Math.max(lastNonEmptyLine + 1, cannotTouchLineNumber + 1);
        const deletionRange = model.validateRange(new Range(deleteFromLineNumber, 1, lineCount, model.getLineMaxColumn(lineCount)));
        if (deletionRange.isEmpty()) {
            return;
        }
        model.pushEditOperations(prevSelection, [EditOperation.delete(deletionRange)], _edits => prevSelection);
        editor?.setSelections(prevSelection);
    }
};
TrimFinalNewLinesParticipant = __decorate([
    __param(0, IConfigurationService),
    __param(1, ICodeEditorService)
], TrimFinalNewLinesParticipant);
export { TrimFinalNewLinesParticipant };
let FormatOnSaveParticipant = class FormatOnSaveParticipant {
    configurationService;
    codeEditorService;
    instantiationService;
    constructor(configurationService, codeEditorService, instantiationService) {
        this.configurationService = configurationService;
        this.codeEditorService = codeEditorService;
        this.instantiationService = instantiationService;
        // Nothing
    }
    async participate(model, env, progress, token) {
        if (!model.textEditorModel) {
            return;
        }
        if (env.reason === 2 /* SaveReason.AUTO */) {
            return undefined;
        }
        const textEditorModel = model.textEditorModel;
        const overrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: textEditorModel.uri };
        const nestedProgress = new Progress(provider => {
            progress.report({
                message: localize({ key: 'formatting2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Running '{0}' Formatter ([configure]({1})).", provider.displayName || provider.extensionId && provider.extensionId.value || '???', 'command:workbench.action.openSettings?%5B%22editor.formatOnSave%22%5D')
            });
        });
        const enabled = this.configurationService.getValue('editor.formatOnSave', overrides);
        if (!enabled) {
            return undefined;
        }
        const editorOrModel = findEditor(textEditorModel, this.codeEditorService) || textEditorModel;
        const mode = this.configurationService.getValue('editor.formatOnSaveMode', overrides);
        if (mode === 'file') {
            await this.instantiationService.invokeFunction(formatDocumentWithSelectedProvider, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
        }
        else {
            const ranges = await this.instantiationService.invokeFunction(getModifiedRanges, isCodeEditor(editorOrModel) ? editorOrModel.getModel() : editorOrModel);
            if (ranges === null && mode === 'modificationsIfAvailable') {
                // no SCM, fallback to formatting the whole file iff wanted
                await this.instantiationService.invokeFunction(formatDocumentWithSelectedProvider, editorOrModel, 2 /* FormattingMode.Silent */, nestedProgress, token);
            }
            else if (ranges) {
                // formatted modified ranges
                await this.instantiationService.invokeFunction(formatDocumentRangesWithSelectedProvider, editorOrModel, ranges, 2 /* FormattingMode.Silent */, nestedProgress, token);
            }
        }
    }
};
FormatOnSaveParticipant = __decorate([
    __param(0, IConfigurationService),
    __param(1, ICodeEditorService),
    __param(2, IInstantiationService)
], FormatOnSaveParticipant);
let CodeActionOnSaveParticipant = class CodeActionOnSaveParticipant {
    configurationService;
    instantiationService;
    languageFeaturesService;
    constructor(configurationService, instantiationService, languageFeaturesService) {
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.languageFeaturesService = languageFeaturesService;
    }
    async participate(model, env, progress, token) {
        if (!model.textEditorModel) {
            return;
        }
        // Do not run code actions on auto save
        if (env.reason !== 1 /* SaveReason.EXPLICIT */) {
            return undefined;
        }
        const textEditorModel = model.textEditorModel;
        const settingsOverrides = { overrideIdentifier: textEditorModel.getLanguageId(), resource: model.resource };
        const setting = this.configurationService.getValue('editor.codeActionsOnSave', settingsOverrides);
        if (!setting) {
            return undefined;
        }
        const settingItems = Array.isArray(setting)
            ? setting
            : Object.keys(setting).filter(x => setting[x]);
        const codeActionsOnSave = this.createCodeActionsOnSave(settingItems);
        if (!Array.isArray(setting)) {
            codeActionsOnSave.sort((a, b) => {
                if (CodeActionKind.SourceFixAll.contains(a)) {
                    if (CodeActionKind.SourceFixAll.contains(b)) {
                        return 0;
                    }
                    return -1;
                }
                if (CodeActionKind.SourceFixAll.contains(b)) {
                    return 1;
                }
                return 0;
            });
        }
        if (!codeActionsOnSave.length) {
            return undefined;
        }
        const excludedActions = Array.isArray(setting)
            ? []
            : Object.keys(setting)
                .filter(x => setting[x] === false)
                .map(x => new CodeActionKind(x));
        progress.report({ message: localize('codeaction', "Quick Fixes") });
        await this.applyOnSaveActions(textEditorModel, codeActionsOnSave, excludedActions, progress, token);
    }
    createCodeActionsOnSave(settingItems) {
        const kinds = settingItems.map(x => new CodeActionKind(x));
        // Remove subsets
        return kinds.filter(kind => {
            return kinds.every(otherKind => otherKind.equals(kind) || !otherKind.contains(kind));
        });
    }
    async applyOnSaveActions(model, codeActionsOnSave, excludes, progress, token) {
        const getActionProgress = new class {
            _names = new Set();
            _report() {
                progress.report({
                    message: localize({ key: 'codeaction.get2', comment: ['[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}'] }, "Getting code actions from '{0}' ([configure]({1})).", [...this._names].map(name => `'${name}'`).join(', '), 'command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D')
                });
            }
            report(provider) {
                if (provider.displayName && !this._names.has(provider.displayName)) {
                    this._names.add(provider.displayName);
                    this._report();
                }
            }
        };
        for (const codeActionKind of codeActionsOnSave) {
            const actionsToRun = await this.getActionsToRun(model, codeActionKind, excludes, getActionProgress, token);
            try {
                for (const action of actionsToRun.validActions) {
                    progress.report({ message: localize('codeAction.apply', "Applying code action '{0}'.", action.action.title) });
                    await this.instantiationService.invokeFunction(applyCodeAction, action, ApplyCodeActionReason.OnSave);
                }
            }
            catch {
                // Failure to apply a code action should not block other on save actions
            }
            finally {
                actionsToRun.dispose();
            }
        }
    }
    getActionsToRun(model, codeActionKind, excludes, progress, token) {
        return getCodeActions(this.languageFeaturesService.codeActionProvider, model, model.getFullModelRange(), {
            type: 2 /* CodeActionTriggerType.Auto */,
            triggerAction: CodeActionTriggerSource.OnSave,
            filter: { include: codeActionKind, excludes: excludes, includeSourceActions: true },
        }, progress, token);
    }
};
CodeActionOnSaveParticipant = __decorate([
    __param(0, IConfigurationService),
    __param(1, IInstantiationService),
    __param(2, ILanguageFeaturesService)
], CodeActionOnSaveParticipant);
let SaveParticipantsContribution = class SaveParticipantsContribution extends Disposable {
    instantiationService;
    textFileService;
    constructor(instantiationService, textFileService) {
        super();
        this.instantiationService = instantiationService;
        this.textFileService = textFileService;
        this.registerSaveParticipants();
    }
    registerSaveParticipants() {
        this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimWhitespaceParticipant)));
        this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(CodeActionOnSaveParticipant)));
        this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FormatOnSaveParticipant)));
        this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(FinalNewLineParticipant)));
        this._register(this.textFileService.files.addSaveParticipant(this.instantiationService.createInstance(TrimFinalNewLinesParticipant)));
    }
};
SaveParticipantsContribution = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITextFileService)
], SaveParticipantsContribution);
export { SaveParticipantsContribution };
const workbenchContributionsRegistry = Registry.as(WorkbenchContributionsExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(SaveParticipantsContribution, 3 /* LifecyclePhase.Restored */);
