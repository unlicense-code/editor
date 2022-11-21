/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { Selection } from 'vs/editor/common/core/selection';
import { createScopedLineTokens } from 'vs/editor/common/languages/supports';
import { CursorColumns } from 'vs/editor/common/core/cursorColumns';
import { normalizeIndentation } from 'vs/editor/common/core/indentation';
/**
 * This is an operation type that will be recorded for undo/redo purposes.
 * The goal is to introduce an undo stop when the controller switches between different operation types.
 */
export var EditOperationType;
(function (EditOperationType) {
    EditOperationType[EditOperationType["Other"] = 0] = "Other";
    EditOperationType[EditOperationType["DeletingLeft"] = 2] = "DeletingLeft";
    EditOperationType[EditOperationType["DeletingRight"] = 3] = "DeletingRight";
    EditOperationType[EditOperationType["TypingOther"] = 4] = "TypingOther";
    EditOperationType[EditOperationType["TypingFirstSpace"] = 5] = "TypingFirstSpace";
    EditOperationType[EditOperationType["TypingConsecutiveSpace"] = 6] = "TypingConsecutiveSpace";
})(EditOperationType || (EditOperationType = {}));
const autoCloseAlways = () => true;
const autoCloseNever = () => false;
const autoCloseBeforeWhitespace = (chr) => (chr === ' ' || chr === '\t');
export class CursorConfiguration {
    languageConfigurationService;
    _cursorMoveConfigurationBrand = undefined;
    readOnly;
    tabSize;
    indentSize;
    insertSpaces;
    stickyTabStops;
    pageSize;
    lineHeight;
    typicalHalfwidthCharacterWidth;
    useTabStops;
    wordSeparators;
    emptySelectionClipboard;
    copyWithSyntaxHighlighting;
    multiCursorMergeOverlapping;
    multiCursorPaste;
    autoClosingBrackets;
    autoClosingQuotes;
    autoClosingDelete;
    autoClosingOvertype;
    autoSurround;
    autoIndent;
    autoClosingPairs;
    surroundingPairs;
    shouldAutoCloseBefore;
    _languageId;
    _electricChars;
    static shouldRecreate(e) {
        return (e.hasChanged(133 /* EditorOption.layoutInfo */)
            || e.hasChanged(119 /* EditorOption.wordSeparators */)
            || e.hasChanged(33 /* EditorOption.emptySelectionClipboard */)
            || e.hasChanged(70 /* EditorOption.multiCursorMergeOverlapping */)
            || e.hasChanged(72 /* EditorOption.multiCursorPaste */)
            || e.hasChanged(5 /* EditorOption.autoClosingBrackets */)
            || e.hasChanged(8 /* EditorOption.autoClosingQuotes */)
            || e.hasChanged(6 /* EditorOption.autoClosingDelete */)
            || e.hasChanged(7 /* EditorOption.autoClosingOvertype */)
            || e.hasChanged(11 /* EditorOption.autoSurround */)
            || e.hasChanged(118 /* EditorOption.useTabStops */)
            || e.hasChanged(45 /* EditorOption.fontInfo */)
            || e.hasChanged(82 /* EditorOption.readOnly */));
    }
    constructor(languageId, modelOptions, configuration, languageConfigurationService) {
        this.languageConfigurationService = languageConfigurationService;
        this._languageId = languageId;
        const options = configuration.options;
        const layoutInfo = options.get(133 /* EditorOption.layoutInfo */);
        const fontInfo = options.get(45 /* EditorOption.fontInfo */);
        this.readOnly = options.get(82 /* EditorOption.readOnly */);
        this.tabSize = modelOptions.tabSize;
        this.indentSize = modelOptions.indentSize;
        this.insertSpaces = modelOptions.insertSpaces;
        this.stickyTabStops = options.get(106 /* EditorOption.stickyTabStops */);
        this.lineHeight = fontInfo.lineHeight;
        this.typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
        this.pageSize = Math.max(1, Math.floor(layoutInfo.height / this.lineHeight) - 2);
        this.useTabStops = options.get(118 /* EditorOption.useTabStops */);
        this.wordSeparators = options.get(119 /* EditorOption.wordSeparators */);
        this.emptySelectionClipboard = options.get(33 /* EditorOption.emptySelectionClipboard */);
        this.copyWithSyntaxHighlighting = options.get(21 /* EditorOption.copyWithSyntaxHighlighting */);
        this.multiCursorMergeOverlapping = options.get(70 /* EditorOption.multiCursorMergeOverlapping */);
        this.multiCursorPaste = options.get(72 /* EditorOption.multiCursorPaste */);
        this.autoClosingBrackets = options.get(5 /* EditorOption.autoClosingBrackets */);
        this.autoClosingQuotes = options.get(8 /* EditorOption.autoClosingQuotes */);
        this.autoClosingDelete = options.get(6 /* EditorOption.autoClosingDelete */);
        this.autoClosingOvertype = options.get(7 /* EditorOption.autoClosingOvertype */);
        this.autoSurround = options.get(11 /* EditorOption.autoSurround */);
        this.autoIndent = options.get(9 /* EditorOption.autoIndent */);
        this.surroundingPairs = {};
        this._electricChars = null;
        this.shouldAutoCloseBefore = {
            quote: this._getShouldAutoClose(languageId, this.autoClosingQuotes),
            bracket: this._getShouldAutoClose(languageId, this.autoClosingBrackets)
        };
        this.autoClosingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoClosingPairs();
        const surroundingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getSurroundingPairs();
        if (surroundingPairs) {
            for (const pair of surroundingPairs) {
                this.surroundingPairs[pair.open] = pair.close;
            }
        }
    }
    get electricChars() {
        if (!this._electricChars) {
            this._electricChars = {};
            const electricChars = this.languageConfigurationService.getLanguageConfiguration(this._languageId).electricCharacter?.getElectricCharacters();
            if (electricChars) {
                for (const char of electricChars) {
                    this._electricChars[char] = true;
                }
            }
        }
        return this._electricChars;
    }
    /**
     * Should return opening bracket type to match indentation with
     */
    onElectricCharacter(character, context, column) {
        const scopedLineTokens = createScopedLineTokens(context, column - 1);
        const electricCharacterSupport = this.languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).electricCharacter;
        if (!electricCharacterSupport) {
            return null;
        }
        return electricCharacterSupport.onElectricCharacter(character, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
    }
    normalizeIndentation(str) {
        return normalizeIndentation(str, this.indentSize, this.insertSpaces);
    }
    _getShouldAutoClose(languageId, autoCloseConfig) {
        switch (autoCloseConfig) {
            case 'beforeWhitespace':
                return autoCloseBeforeWhitespace;
            case 'languageDefined':
                return this._getLanguageDefinedShouldAutoClose(languageId);
            case 'always':
                return autoCloseAlways;
            case 'never':
                return autoCloseNever;
        }
    }
    _getLanguageDefinedShouldAutoClose(languageId) {
        const autoCloseBeforeSet = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoCloseBeforeSet();
        return c => autoCloseBeforeSet.indexOf(c) !== -1;
    }
    /**
     * Returns a visible column from a column.
     * @see {@link CursorColumns}
     */
    visibleColumnFromColumn(model, position) {
        return CursorColumns.visibleColumnFromColumn(model.getLineContent(position.lineNumber), position.column, this.tabSize);
    }
    /**
     * Returns a visible column from a column.
     * @see {@link CursorColumns}
     */
    columnFromVisibleColumn(model, lineNumber, visibleColumn) {
        const result = CursorColumns.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, this.tabSize);
        const minColumn = model.getLineMinColumn(lineNumber);
        if (result < minColumn) {
            return minColumn;
        }
        const maxColumn = model.getLineMaxColumn(lineNumber);
        if (result > maxColumn) {
            return maxColumn;
        }
        return result;
    }
}
export class CursorState {
    _cursorStateBrand = undefined;
    static fromModelState(modelState) {
        return new PartialModelCursorState(modelState);
    }
    static fromViewState(viewState) {
        return new PartialViewCursorState(viewState);
    }
    static fromModelSelection(modelSelection) {
        const selection = Selection.liftSelection(modelSelection);
        const modelState = new SingleCursorState(Range.fromPositions(selection.getSelectionStart()), 0, selection.getPosition(), 0);
        return CursorState.fromModelState(modelState);
    }
    static fromModelSelections(modelSelections) {
        const states = [];
        for (let i = 0, len = modelSelections.length; i < len; i++) {
            states[i] = this.fromModelSelection(modelSelections[i]);
        }
        return states;
    }
    modelState;
    viewState;
    constructor(modelState, viewState) {
        this.modelState = modelState;
        this.viewState = viewState;
    }
    equals(other) {
        return (this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState));
    }
}
export class PartialModelCursorState {
    modelState;
    viewState;
    constructor(modelState) {
        this.modelState = modelState;
        this.viewState = null;
    }
}
export class PartialViewCursorState {
    modelState;
    viewState;
    constructor(viewState) {
        this.modelState = null;
        this.viewState = viewState;
    }
}
/**
 * Represents the cursor state on either the model or on the view model.
 */
export class SingleCursorState {
    _singleCursorStateBrand = undefined;
    // --- selection can start as a range (think double click and drag)
    selectionStart;
    selectionStartLeftoverVisibleColumns;
    position;
    leftoverVisibleColumns;
    selection;
    constructor(selectionStart, selectionStartLeftoverVisibleColumns, position, leftoverVisibleColumns) {
        this.selectionStart = selectionStart;
        this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
        this.position = position;
        this.leftoverVisibleColumns = leftoverVisibleColumns;
        this.selection = SingleCursorState._computeSelection(this.selectionStart, this.position);
    }
    equals(other) {
        return (this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns
            && this.leftoverVisibleColumns === other.leftoverVisibleColumns
            && this.position.equals(other.position)
            && this.selectionStart.equalsRange(other.selectionStart));
    }
    hasSelection() {
        return (!this.selection.isEmpty() || !this.selectionStart.isEmpty());
    }
    move(inSelectionMode, lineNumber, column, leftoverVisibleColumns) {
        if (inSelectionMode) {
            // move just position
            return new SingleCursorState(this.selectionStart, this.selectionStartLeftoverVisibleColumns, new Position(lineNumber, column), leftoverVisibleColumns);
        }
        else {
            // move everything
            return new SingleCursorState(new Range(lineNumber, column, lineNumber, column), leftoverVisibleColumns, new Position(lineNumber, column), leftoverVisibleColumns);
        }
    }
    static _computeSelection(selectionStart, position) {
        if (selectionStart.isEmpty() || !position.isBeforeOrEqual(selectionStart.getStartPosition())) {
            return Selection.fromPositions(selectionStart.getStartPosition(), position);
        }
        else {
            return Selection.fromPositions(selectionStart.getEndPosition(), position);
        }
    }
}
export class EditOperationResult {
    _editOperationResultBrand = undefined;
    type;
    commands;
    shouldPushStackElementBefore;
    shouldPushStackElementAfter;
    constructor(type, commands, opts) {
        this.type = type;
        this.commands = commands;
        this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
        this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
    }
}
export function isQuote(ch) {
    return (ch === '\'' || ch === '"' || ch === '`');
}
