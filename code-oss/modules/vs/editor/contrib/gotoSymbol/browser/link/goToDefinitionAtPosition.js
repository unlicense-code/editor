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
import { createCancelablePromise } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { MarkdownString } from 'vs/base/common/htmlContent';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { withNullAsUndefined } from 'vs/base/common/types';
import 'vs/css!./goToDefinitionAtPosition';
import { EditorState } from 'vs/editor/contrib/editorState/browser/editorState';
import { registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { ClickLinkGesture } from 'vs/editor/contrib/gotoSymbol/browser/link/clickLinkGesture';
import { PeekContext } from 'vs/editor/contrib/peekView/browser/peekView';
import * as nls from 'vs/nls';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { DefinitionAction } from '../goToCommands';
import { getDefinitionsAtPosition } from '../goToSymbol';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
let GotoDefinitionAtPositionEditorContribution = class GotoDefinitionAtPositionEditorContribution {
    textModelResolverService;
    languageService;
    languageFeaturesService;
    static ID = 'editor.contrib.gotodefinitionatposition';
    static MAX_SOURCE_PREVIEW_LINES = 8;
    editor;
    toUnhook = new DisposableStore();
    toUnhookForKeyboard = new DisposableStore();
    linkDecorations;
    currentWordAtPosition = null;
    previousPromise = null;
    constructor(editor, textModelResolverService, languageService, languageFeaturesService) {
        this.textModelResolverService = textModelResolverService;
        this.languageService = languageService;
        this.languageFeaturesService = languageFeaturesService;
        this.editor = editor;
        this.linkDecorations = this.editor.createDecorationsCollection();
        const linkGesture = new ClickLinkGesture(editor);
        this.toUnhook.add(linkGesture);
        this.toUnhook.add(linkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
            this.startFindDefinitionFromMouse(mouseEvent, withNullAsUndefined(keyboardEvent));
        }));
        this.toUnhook.add(linkGesture.onExecute((mouseEvent) => {
            if (this.isEnabled(mouseEvent)) {
                this.gotoDefinition(mouseEvent.target.position, mouseEvent.hasSideBySideModifier).then(() => {
                    this.removeLinkDecorations();
                }, (error) => {
                    this.removeLinkDecorations();
                    onUnexpectedError(error);
                });
            }
        }));
        this.toUnhook.add(linkGesture.onCancel(() => {
            this.removeLinkDecorations();
            this.currentWordAtPosition = null;
        }));
    }
    static get(editor) {
        return editor.getContribution(GotoDefinitionAtPositionEditorContribution.ID);
    }
    startFindDefinitionFromCursor(position) {
        // For issue: https://github.com/microsoft/vscode/issues/46257
        // equivalent to mouse move with meta/ctrl key
        // First find the definition and add decorations
        // to the editor to be shown with the content hover widget
        return this.startFindDefinition(position).then(() => {
            // Add listeners for editor cursor move and key down events
            // Dismiss the "extended" editor decorations when the user hides
            // the hover widget. There is no event for the widget itself so these
            // serve as a best effort. After removing the link decorations, the hover
            // widget is clean and will only show declarations per next request.
            this.toUnhookForKeyboard.add(this.editor.onDidChangeCursorPosition(() => {
                this.currentWordAtPosition = null;
                this.removeLinkDecorations();
                this.toUnhookForKeyboard.clear();
            }));
            this.toUnhookForKeyboard.add(this.editor.onKeyDown((e) => {
                if (e) {
                    this.currentWordAtPosition = null;
                    this.removeLinkDecorations();
                    this.toUnhookForKeyboard.clear();
                }
            }));
        });
    }
    startFindDefinitionFromMouse(mouseEvent, withKey) {
        // check if we are active and on a content widget
        if (mouseEvent.target.type === 9 /* MouseTargetType.CONTENT_WIDGET */ && this.linkDecorations.length > 0) {
            return;
        }
        if (!this.editor.hasModel() || !this.isEnabled(mouseEvent, withKey)) {
            this.currentWordAtPosition = null;
            this.removeLinkDecorations();
            return;
        }
        const position = mouseEvent.target.position;
        this.startFindDefinition(position);
    }
    startFindDefinition(position) {
        // Dispose listeners for updating decorations when using keyboard to show definition hover
        this.toUnhookForKeyboard.clear();
        // Find word at mouse position
        const word = position ? this.editor.getModel()?.getWordAtPosition(position) : null;
        if (!word) {
            this.currentWordAtPosition = null;
            this.removeLinkDecorations();
            return Promise.resolve(0);
        }
        // Return early if word at position is still the same
        if (this.currentWordAtPosition && this.currentWordAtPosition.startColumn === word.startColumn && this.currentWordAtPosition.endColumn === word.endColumn && this.currentWordAtPosition.word === word.word) {
            return Promise.resolve(0);
        }
        this.currentWordAtPosition = word;
        // Find definition and decorate word if found
        const state = new EditorState(this.editor, 4 /* CodeEditorStateFlag.Position */ | 1 /* CodeEditorStateFlag.Value */ | 2 /* CodeEditorStateFlag.Selection */ | 8 /* CodeEditorStateFlag.Scroll */);
        if (this.previousPromise) {
            this.previousPromise.cancel();
            this.previousPromise = null;
        }
        this.previousPromise = createCancelablePromise(token => this.findDefinition(position, token));
        return this.previousPromise.then(results => {
            if (!results || !results.length || !state.validate(this.editor)) {
                this.removeLinkDecorations();
                return;
            }
            const linkRange = results[0].originSelectionRange
                ? Range.lift(results[0].originSelectionRange)
                : new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
            // Multiple results
            if (results.length > 1) {
                let combinedRange = linkRange;
                for (const { originSelectionRange } of results) {
                    if (originSelectionRange) {
                        combinedRange = Range.plusRange(combinedRange, originSelectionRange);
                    }
                }
                this.addDecoration(combinedRange, new MarkdownString().appendText(nls.localize('multipleResults', "Click to show {0} definitions.", results.length)));
            }
            // Single result
            else {
                const result = results[0];
                if (!result.uri) {
                    return;
                }
                this.textModelResolverService.createModelReference(result.uri).then(ref => {
                    if (!ref.object || !ref.object.textEditorModel) {
                        ref.dispose();
                        return;
                    }
                    const { object: { textEditorModel } } = ref;
                    const { startLineNumber } = result.range;
                    if (startLineNumber < 1 || startLineNumber > textEditorModel.getLineCount()) {
                        // invalid range
                        ref.dispose();
                        return;
                    }
                    const previewValue = this.getPreviewValue(textEditorModel, startLineNumber, result);
                    const languageId = this.languageService.guessLanguageIdByFilepathOrFirstLine(textEditorModel.uri);
                    this.addDecoration(linkRange, new MarkdownString().appendCodeblock(languageId ? languageId : '', previewValue));
                    ref.dispose();
                });
            }
        }).then(undefined, onUnexpectedError);
    }
    getPreviewValue(textEditorModel, startLineNumber, result) {
        let rangeToUse = result.range;
        const numberOfLinesInRange = rangeToUse.endLineNumber - rangeToUse.startLineNumber;
        if (numberOfLinesInRange >= GotoDefinitionAtPositionEditorContribution.MAX_SOURCE_PREVIEW_LINES) {
            rangeToUse = this.getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber);
        }
        const previewValue = this.stripIndentationFromPreviewRange(textEditorModel, startLineNumber, rangeToUse);
        return previewValue;
    }
    stripIndentationFromPreviewRange(textEditorModel, startLineNumber, previewRange) {
        const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
        let minIndent = startIndent;
        for (let endLineNumber = startLineNumber + 1; endLineNumber < previewRange.endLineNumber; endLineNumber++) {
            const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
            minIndent = Math.min(minIndent, endIndent);
        }
        const previewValue = textEditorModel.getValueInRange(previewRange).replace(new RegExp(`^\\s{${minIndent - 1}}`, 'gm'), '').trim();
        return previewValue;
    }
    getPreviewRangeBasedOnIndentation(textEditorModel, startLineNumber) {
        const startIndent = textEditorModel.getLineFirstNonWhitespaceColumn(startLineNumber);
        const maxLineNumber = Math.min(textEditorModel.getLineCount(), startLineNumber + GotoDefinitionAtPositionEditorContribution.MAX_SOURCE_PREVIEW_LINES);
        let endLineNumber = startLineNumber + 1;
        for (; endLineNumber < maxLineNumber; endLineNumber++) {
            const endIndent = textEditorModel.getLineFirstNonWhitespaceColumn(endLineNumber);
            if (startIndent === endIndent) {
                break;
            }
        }
        return new Range(startLineNumber, 1, endLineNumber + 1, 1);
    }
    addDecoration(range, hoverMessage) {
        const newDecorations = {
            range: range,
            options: {
                description: 'goto-definition-link',
                inlineClassName: 'goto-definition-link',
                hoverMessage
            }
        };
        this.linkDecorations.set([newDecorations]);
    }
    removeLinkDecorations() {
        this.linkDecorations.clear();
    }
    isEnabled(mouseEvent, withKey) {
        return this.editor.hasModel()
            && mouseEvent.isLeftClick
            && mouseEvent.isNoneOrSingleMouseDown
            && mouseEvent.target.type === 6 /* MouseTargetType.CONTENT_TEXT */
            && (mouseEvent.hasTriggerModifier || (withKey ? withKey.keyCodeIsTriggerKey : false))
            && this.languageFeaturesService.definitionProvider.has(this.editor.getModel());
    }
    findDefinition(position, token) {
        const model = this.editor.getModel();
        if (!model) {
            return Promise.resolve(null);
        }
        return getDefinitionsAtPosition(this.languageFeaturesService.definitionProvider, model, position, token);
    }
    gotoDefinition(position, openToSide) {
        this.editor.setPosition(position);
        return this.editor.invokeWithinContext((accessor) => {
            const canPeek = !openToSide && this.editor.getOption(79 /* EditorOption.definitionLinkOpensInPeek */) && !this.isInPeekEditor(accessor);
            const action = new DefinitionAction({ openToSide, openInPeek: canPeek, muteMessage: true }, { title: { value: '', original: '' }, id: '', precondition: undefined });
            return action.run(accessor, this.editor);
        });
    }
    isInPeekEditor(accessor) {
        const contextKeyService = accessor.get(IContextKeyService);
        return PeekContext.inPeekEditor.getValue(contextKeyService);
    }
    dispose() {
        this.toUnhook.dispose();
    }
};
GotoDefinitionAtPositionEditorContribution = __decorate([
    __param(1, ITextModelService),
    __param(2, ILanguageService),
    __param(3, ILanguageFeaturesService)
], GotoDefinitionAtPositionEditorContribution);
export { GotoDefinitionAtPositionEditorContribution };
registerEditorContribution(GotoDefinitionAtPositionEditorContribution.ID, GotoDefinitionAtPositionEditorContribution);
