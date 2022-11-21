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
import { createCancelablePromise, Delayer } from 'vs/base/common/async';
import { CellEditState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { Range } from 'vs/editor/common/core/range';
import { FindDecorations } from 'vs/editor/contrib/find/browser/findDecorations';
import { PrefixSumComputer } from 'vs/editor/common/model/prefixSumComputer';
import { CellKind, NotebookCellsChangeType } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { findFirstInSorted } from 'vs/base/common/arrays';
import { overviewRulerFindMatchForeground, overviewRulerSelectionHighlightForeground } from 'vs/platform/theme/common/colorRegistry';
let FindModel = class FindModel extends Disposable {
    _notebookEditor;
    _state;
    _configurationService;
    _findMatches = [];
    _findMatchesStarts = null;
    _currentMatch = -1;
    _allMatchesDecorations = [];
    _currentMatchCellDecorations = [];
    _allMatchesCellDecorations = [];
    _currentMatchDecorations = null;
    _throttledDelayer;
    _computePromise = null;
    _modelDisposable = this._register(new DisposableStore());
    get findMatches() {
        return this._findMatches;
    }
    get currentMatch() {
        return this._currentMatch;
    }
    constructor(_notebookEditor, _state, _configurationService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._state = _state;
        this._configurationService = _configurationService;
        this._throttledDelayer = new Delayer(20);
        this._computePromise = null;
        this._register(_state.onFindReplaceStateChange(e => {
            if (e.searchString || e.isRegex || e.matchCase || e.searchScope || e.wholeWord || (e.isRevealed && this._state.isRevealed) || e.filters) {
                this.research();
            }
            if (e.isRevealed && !this._state.isRevealed) {
                this.clear();
            }
        }));
        this._register(this._notebookEditor.onDidChangeModel(e => {
            this._registerModelListener(e);
        }));
        if (this._notebookEditor.hasModel()) {
            this._registerModelListener(this._notebookEditor.textModel);
        }
    }
    ensureFindMatches() {
        if (!this._findMatchesStarts) {
            this.set(this._findMatches, true);
        }
    }
    getCurrentMatch() {
        const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        const cell = this._findMatches[nextIndex.index].cell;
        const match = this._findMatches[nextIndex.index].matches[nextIndex.remainder];
        return {
            cell,
            match,
            isModelMatch: nextIndex.remainder < this._findMatches[nextIndex.index].modelMatchCount
        };
    }
    refreshCurrentMatch(focus) {
        const findMatchIndex = this.findMatches.findIndex(match => match.cell === focus.cell);
        if (findMatchIndex === -1) {
            return;
        }
        const findMatch = this.findMatches[findMatchIndex];
        const index = findMatch.matches.slice(0, findMatch.modelMatchCount).findIndex(match => match.range.intersectRanges(focus.range) !== null);
        if (index === undefined) {
            return;
        }
        const matchesBefore = findMatchIndex === 0 ? 0 : (this._findMatchesStarts?.getPrefixSum(findMatchIndex - 1) ?? 0);
        this._currentMatch = matchesBefore + index;
        this.highlightCurrentFindMatchDecoration(findMatchIndex, index).then(offset => {
            this.revealCellRange(findMatchIndex, index, offset);
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
        });
    }
    find(option) {
        if (!this.findMatches.length) {
            return;
        }
        // let currCell;
        if (!this._findMatchesStarts) {
            this.set(this._findMatches, true);
            if ('index' in option) {
                this._currentMatch = option.index;
            }
        }
        else {
            // const currIndex = this._findMatchesStarts!.getIndexOf(this._currentMatch);
            // currCell = this._findMatches[currIndex.index].cell;
            const totalVal = this._findMatchesStarts.getTotalSum();
            if ('index' in option) {
                this._currentMatch = option.index;
            }
            else if (this._currentMatch === -1) {
                this._currentMatch = option.previous ? totalVal - 1 : 0;
            }
            else {
                const nextVal = (this._currentMatch + (option.previous ? -1 : 1) + totalVal) % totalVal;
                this._currentMatch = nextVal;
            }
        }
        const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        // const newFocusedCell = this._findMatches[nextIndex.index].cell;
        this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder).then(offset => {
            this.revealCellRange(nextIndex.index, nextIndex.remainder, offset);
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
        });
    }
    revealCellRange(cellIndex, matchIndex, outputOffset) {
        const findMatch = this._findMatches[cellIndex];
        if (matchIndex >= findMatch.modelMatchCount) {
            // reveal output range
            this._notebookEditor.focusElement(findMatch.cell);
            const index = this._notebookEditor.getCellIndex(findMatch.cell);
            if (index !== undefined) {
                // const range: ICellRange = { start: index, end: index + 1 };
                this._notebookEditor.revealCellOffsetInCenterAsync(findMatch.cell, outputOffset ?? 0);
            }
        }
        else {
            const match = findMatch.matches[matchIndex];
            findMatch.cell.updateEditState(CellEditState.Editing, 'find');
            findMatch.cell.isInputCollapsed = false;
            this._notebookEditor.focusElement(findMatch.cell);
            this._notebookEditor.setCellEditorSelection(findMatch.cell, match.range);
            this._notebookEditor.revealRangeInCenterIfOutsideViewportAsync(findMatch.cell, match.range);
        }
    }
    _registerModelListener(notebookTextModel) {
        this._modelDisposable.clear();
        if (notebookTextModel) {
            this._modelDisposable.add(notebookTextModel.onDidChangeContent((e) => {
                if (!e.rawEvents.some(event => event.kind === NotebookCellsChangeType.ChangeCellContent || event.kind === NotebookCellsChangeType.ModelChange)) {
                    return;
                }
                this.research();
            }));
        }
        this.research();
    }
    async research() {
        return this._throttledDelayer.trigger(() => {
            return this._research();
        });
    }
    async _research() {
        this._computePromise?.cancel();
        if (!this._state.isRevealed || !this._notebookEditor.hasModel()) {
            this.set([], false);
            return;
        }
        this._computePromise = createCancelablePromise(token => this._compute(token));
        const findMatches = await this._computePromise;
        if (!findMatches) {
            this.set([], false);
            return;
        }
        if (findMatches.length === 0) {
            this.set([], false);
            return;
        }
        const findFirstMatchAfterCellIndex = (cellIndex) => {
            const matchAfterSelection = findFirstInSorted(findMatches.map(match => match.index), index => index >= cellIndex);
            this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
        };
        if (this._currentMatch === -1) {
            // no active current match
            if (this._notebookEditor.getLength() === 0) {
                this.set(findMatches, false);
                return;
            }
            else {
                const focus = this._notebookEditor.getFocus().start;
                findFirstMatchAfterCellIndex(focus);
                this.set(findMatches, false);
                return;
            }
        }
        const oldCurrIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        const oldCurrCell = this._findMatches[oldCurrIndex.index].cell;
        const oldCurrMatchCellIndex = this._notebookEditor.getCellIndex(oldCurrCell);
        if (oldCurrMatchCellIndex < 0) {
            // the cell containing the active match is deleted
            if (this._notebookEditor.getLength() === 0) {
                this.set(findMatches, false);
                return;
            }
            findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
            return;
        }
        // the cell still exist
        const cell = this._notebookEditor.cellAt(oldCurrMatchCellIndex);
        // we will try restore the active find match in this cell, if it contains any find match
        if (cell.cellKind === CellKind.Markup && cell.getEditState() === CellEditState.Preview) {
            // find first match in this cell or below
            findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
            return;
        }
        // the cell is a markup cell in editing mode or a code cell, both should have monaco editor rendered
        if (!this._currentMatchDecorations) {
            // no current highlight decoration
            findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
            return;
        }
        // check if there is monaco editor selection and find the first match, otherwise find the first match above current cell
        // this._findMatches[cellIndex].matches[matchIndex].range
        if (this._currentMatchDecorations.kind === 'input') {
            const currentMatchDecorationId = this._currentMatchDecorations.decorations.find(decoration => decoration.ownerId === cell.handle);
            if (!currentMatchDecorationId) {
                // current match decoration is no longer valid
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            const matchAfterSelection = findFirstInSorted(findMatches, match => match.index >= oldCurrMatchCellIndex) % findMatches.length;
            if (findMatches[matchAfterSelection].index > oldCurrMatchCellIndex) {
                // there is no search result in curr cell anymore, find the nearest one (from top to bottom)
                this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
                return;
            }
            else {
                // there are still some search results in current cell
                let currMatchRangeInEditor = cell.editorAttached && currentMatchDecorationId.decorations[0] ? cell.getCellDecorationRange(currentMatchDecorationId.decorations[0]) : null;
                if (currMatchRangeInEditor === null && oldCurrIndex.remainder < this._findMatches[oldCurrIndex.index].modelMatchCount) {
                    currMatchRangeInEditor = this._findMatches[oldCurrIndex.index].matches[oldCurrIndex.remainder].range;
                }
                if (currMatchRangeInEditor !== null) {
                    // we find a range for the previous current match, let's find the nearest one after it (can overlap)
                    const cellMatch = findMatches[matchAfterSelection];
                    const matchAfterOldSelection = findFirstInSorted(cellMatch.matches.slice(0, cellMatch.modelMatchCount), match => Range.compareRangesUsingStarts(match.range, currMatchRangeInEditor) >= 0);
                    this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection) + matchAfterOldSelection);
                }
                else {
                    // no range found, let's fall back to finding the nearest match
                    this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
                    return;
                }
            }
        }
        else {
            // output now has the highlight
            const matchAfterSelection = findFirstInSorted(findMatches.map(match => match.index), index => index >= oldCurrMatchCellIndex) % findMatches.length;
            this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
        }
    }
    set(cellFindMatches, autoStart) {
        if (!cellFindMatches || !cellFindMatches.length) {
            this._findMatches = [];
            this.setAllFindMatchesDecorations([]);
            this.constructFindMatchesStarts();
            this._currentMatch = -1;
            this.clearCurrentFindMatchDecoration();
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
            return;
        }
        // all matches
        this._findMatches = cellFindMatches;
        this.setAllFindMatchesDecorations(cellFindMatches || []);
        // current match
        this.constructFindMatchesStarts();
        if (autoStart) {
            this._currentMatch = 0;
            this.highlightCurrentFindMatchDecoration(0, 0);
        }
        this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
    }
    async _compute(token) {
        this._state.change({ isSearching: true }, false);
        let ret = null;
        const val = this._state.searchString;
        const wordSeparators = this._configurationService.inspect('editor.wordSeparators').value;
        const options = {
            regex: this._state.isRegex,
            wholeWord: this._state.wholeWord,
            caseSensitive: this._state.matchCase,
            wordSeparators: wordSeparators,
            includeMarkupInput: this._state.filters?.markupInput ?? true,
            includeCodeInput: this._state.filters?.codeInput ?? true,
            includeMarkupPreview: !!this._state.filters?.markupPreview,
            includeOutput: !!this._state.filters?.codeOutput
        };
        if (!val) {
            ret = null;
        }
        else if (!this._notebookEditor.hasModel()) {
            ret = null;
        }
        else {
            ret = await this._notebookEditor.find(val, options, token);
        }
        this._state.change({ isSearching: false }, false);
        return ret;
    }
    _updateCurrentMatch(findMatches, currentMatchesPosition) {
        this.set(findMatches, false);
        this._currentMatch = currentMatchesPosition % findMatches.length;
        const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder);
        this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.matches.length, 0), undefined);
    }
    _matchesCountBeforeIndex(findMatches, index) {
        let prevMatchesCount = 0;
        for (let i = 0; i < index; i++) {
            prevMatchesCount += findMatches[i].matches.length;
        }
        return prevMatchesCount;
    }
    constructFindMatchesStarts() {
        if (this._findMatches && this._findMatches.length) {
            const values = new Uint32Array(this._findMatches.length);
            for (let i = 0; i < this._findMatches.length; i++) {
                values[i] = this._findMatches[i].matches.length;
            }
            this._findMatchesStarts = new PrefixSumComputer(values);
        }
        else {
            this._findMatchesStarts = null;
        }
    }
    async highlightCurrentFindMatchDecoration(cellIndex, matchIndex) {
        const cell = this._findMatches[cellIndex].cell;
        if (matchIndex < this._findMatches[cellIndex].modelMatchCount) {
            this.clearCurrentFindMatchDecoration();
            const match = this._findMatches[cellIndex].matches[matchIndex];
            // match is an editor FindMatch, we update find match decoration in the editor
            // we will highlight the match in the webview
            this._notebookEditor.changeModelDecorations(accessor => {
                const findMatchesOptions = FindDecorations._CURRENT_FIND_MATCH_DECORATION;
                const decorations = [
                    { range: match.range, options: findMatchesOptions }
                ];
                const deltaDecoration = {
                    ownerId: cell.handle,
                    decorations: decorations
                };
                this._currentMatchDecorations = {
                    kind: 'input',
                    decorations: accessor.deltaDecorations(this._currentMatchDecorations?.kind === 'input' ? this._currentMatchDecorations.decorations : [], [deltaDecoration])
                };
            });
            this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, [{
                    ownerId: cell.handle,
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: overviewRulerSelectionHighlightForeground,
                            modelRanges: [match.range],
                            includeOutput: false
                        }
                    }
                }]);
            return null;
        }
        else {
            this.clearCurrentFindMatchDecoration();
            const match = this._findMatches[cellIndex].matches[matchIndex];
            const offset = await this._notebookEditor.highlightFind(cell, match.index);
            this._currentMatchDecorations = { kind: 'output', index: match.index };
            this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, [{
                    ownerId: cell.handle,
                    handle: cell.handle,
                    options: {
                        overviewRuler: {
                            color: overviewRulerSelectionHighlightForeground,
                            modelRanges: [],
                            includeOutput: true
                        }
                    }
                }]);
            return offset;
        }
    }
    clearCurrentFindMatchDecoration() {
        if (this._currentMatchDecorations?.kind === 'input') {
            this._notebookEditor.changeModelDecorations(accessor => {
                accessor.deltaDecorations(this._currentMatchDecorations?.kind === 'input' ? this._currentMatchDecorations.decorations : [], []);
                this._currentMatchDecorations = null;
            });
        }
        else if (this._currentMatchDecorations?.kind === 'output') {
            this._notebookEditor.unHighlightFind(this._currentMatchDecorations.index);
        }
        this._currentMatchCellDecorations = this._notebookEditor.deltaCellDecorations(this._currentMatchCellDecorations, []);
    }
    setAllFindMatchesDecorations(cellFindMatches) {
        this._notebookEditor.changeModelDecorations((accessor) => {
            const findMatchesOptions = FindDecorations._FIND_MATCH_DECORATION;
            const deltaDecorations = cellFindMatches.map(cellFindMatch => {
                const findMatches = cellFindMatch.matches;
                // Find matches
                const newFindMatchesDecorations = new Array(findMatches.length);
                for (let i = 0, len = Math.min(findMatches.length, cellFindMatch.modelMatchCount); i < len; i++) {
                    newFindMatchesDecorations[i] = {
                        range: findMatches[i].range,
                        options: findMatchesOptions
                    };
                }
                return { ownerId: cellFindMatch.cell.handle, decorations: newFindMatchesDecorations };
            });
            this._allMatchesDecorations = accessor.deltaDecorations(this._allMatchesDecorations, deltaDecorations);
        });
        this._allMatchesCellDecorations = this._notebookEditor.deltaCellDecorations(this._allMatchesCellDecorations, cellFindMatches.map(cellFindMatch => {
            return {
                ownerId: cellFindMatch.cell.handle,
                handle: cellFindMatch.cell.handle,
                options: {
                    overviewRuler: {
                        color: overviewRulerFindMatchForeground,
                        modelRanges: cellFindMatch.matches.slice(0, cellFindMatch.modelMatchCount).map(match => match.range),
                        includeOutput: cellFindMatch.modelMatchCount < cellFindMatch.matches.length
                    }
                }
            };
        }));
    }
    clear() {
        this._computePromise?.cancel();
        this._throttledDelayer.cancel();
        this.set([], false);
    }
};
FindModel = __decorate([
    __param(2, IConfigurationService)
], FindModel);
export { FindModel };
