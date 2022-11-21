/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { compareBy, numberComparator } from 'vs/base/common/arrays';
import { BugIndicatingError } from 'vs/base/common/errors';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { DetailedLineRangeMapping } from 'vs/workbench/contrib/mergeEditor/browser/model/mapping';
import { LineRangeEdit } from 'vs/workbench/contrib/mergeEditor/browser/model/editing';
import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';
import { ReentrancyBarrier } from 'vs/workbench/contrib/mergeEditor/browser/utils';
import { autorun, observableSignal, observableValue, transaction } from 'vs/base/common/observable';
export class TextModelDiffs extends Disposable {
    baseTextModel;
    textModel;
    diffComputer;
    recomputeCount = 0;
    _state = observableValue('LiveDiffState', 1 /* TextModelDiffState.initializing */);
    _diffs = observableValue('LiveDiffs', []);
    barrier = new ReentrancyBarrier();
    isDisposed = false;
    get isApplyingChange() {
        return this.barrier.isActive;
    }
    constructor(baseTextModel, textModel, diffComputer) {
        super();
        this.baseTextModel = baseTextModel;
        this.textModel = textModel;
        this.diffComputer = diffComputer;
        const recomputeSignal = observableSignal('recompute');
        this._register(autorun('Update diff state', reader => {
            recomputeSignal.read(reader);
            this.recompute(reader);
        }));
        this._register(baseTextModel.onDidChangeContent(this.barrier.makeExclusive(() => {
            recomputeSignal.trigger(undefined);
        })));
        this._register(textModel.onDidChangeContent(this.barrier.makeExclusive(() => {
            recomputeSignal.trigger(undefined);
        })));
        this._register(toDisposable(() => {
            this.isDisposed = true;
        }));
    }
    get state() {
        return this._state;
    }
    /**
     * Diffs from base to input.
    */
    get diffs() {
        return this._diffs;
    }
    isInitializing = true;
    recompute(reader) {
        this.recomputeCount++;
        const currentRecomputeIdx = this.recomputeCount;
        if (this._state.get() === 1 /* TextModelDiffState.initializing */) {
            this.isInitializing = true;
        }
        transaction(tx => {
            /** @description Starting Diff Computation. */
            this._state.set(this.isInitializing ? 1 /* TextModelDiffState.initializing */ : 3 /* TextModelDiffState.updating */, tx, 0 /* TextModelDiffChangeReason.other */);
        });
        const result = this.diffComputer.computeDiff(this.baseTextModel, this.textModel, reader);
        result.then((result) => {
            if (this.isDisposed) {
                return;
            }
            if (currentRecomputeIdx !== this.recomputeCount) {
                // There is a newer recompute call
                return;
            }
            transaction(tx => {
                /** @description Completed Diff Computation */
                if (result.diffs) {
                    this._state.set(2 /* TextModelDiffState.upToDate */, tx, 1 /* TextModelDiffChangeReason.textChange */);
                    this._diffs.set(result.diffs, tx, 1 /* TextModelDiffChangeReason.textChange */);
                }
                else {
                    this._state.set(4 /* TextModelDiffState.error */, tx, 1 /* TextModelDiffChangeReason.textChange */);
                }
                this.isInitializing = false;
            });
        });
    }
    ensureUpToDate() {
        if (this.state.get() !== 2 /* TextModelDiffState.upToDate */) {
            throw new BugIndicatingError('Cannot remove diffs when the model is not up to date');
        }
    }
    removeDiffs(diffToRemoves, transaction) {
        this.ensureUpToDate();
        diffToRemoves.sort(compareBy((d) => d.inputRange.startLineNumber, numberComparator));
        diffToRemoves.reverse();
        let diffs = this._diffs.get();
        for (const diffToRemove of diffToRemoves) {
            // TODO improve performance
            const len = diffs.length;
            diffs = diffs.filter((d) => d !== diffToRemove);
            if (len === diffs.length) {
                throw new BugIndicatingError();
            }
            this.barrier.runExclusivelyOrThrow(() => {
                diffToRemove.getReverseLineEdit().apply(this.textModel);
            });
            diffs = diffs.map((d) => d.outputRange.isAfter(diffToRemove.outputRange)
                ? d.addOutputLineDelta(diffToRemove.inputRange.lineCount - diffToRemove.outputRange.lineCount)
                : d);
        }
        this._diffs.set(diffs, transaction, 0 /* TextModelDiffChangeReason.other */);
    }
    /**
     * Edit must be conflict free.
     */
    applyEditRelativeToOriginal(edit, transaction) {
        this.ensureUpToDate();
        const editMapping = new DetailedLineRangeMapping(edit.range, this.baseTextModel, new LineRange(edit.range.startLineNumber, edit.newLines.length), this.textModel);
        let firstAfter = false;
        let delta = 0;
        const newDiffs = new Array();
        for (const diff of this.diffs.get()) {
            if (diff.inputRange.touches(edit.range)) {
                throw new BugIndicatingError('Edit must be conflict free.');
            }
            else if (diff.inputRange.isAfter(edit.range)) {
                if (!firstAfter) {
                    firstAfter = true;
                    newDiffs.push(editMapping.addOutputLineDelta(delta));
                }
                newDiffs.push(diff.addOutputLineDelta(edit.newLines.length - edit.range.lineCount));
            }
            else {
                newDiffs.push(diff);
            }
            if (!firstAfter) {
                delta += diff.outputRange.lineCount - diff.inputRange.lineCount;
            }
        }
        if (!firstAfter) {
            firstAfter = true;
            newDiffs.push(editMapping.addOutputLineDelta(delta));
        }
        this.barrier.runExclusivelyOrThrow(() => {
            new LineRangeEdit(edit.range.delta(delta), edit.newLines).apply(this.textModel);
        });
        this._diffs.set(newDiffs, transaction, 0 /* TextModelDiffChangeReason.other */);
    }
    findTouchingDiffs(baseRange) {
        return this.diffs.get().filter(d => d.inputRange.touches(baseRange));
    }
    getResultLine(lineNumber, reader) {
        let offset = 0;
        const diffs = reader ? this.diffs.read(reader) : this.diffs.get();
        for (const diff of diffs) {
            if (diff.inputRange.contains(lineNumber) || diff.inputRange.endLineNumberExclusive === lineNumber) {
                return diff;
            }
            else if (diff.inputRange.endLineNumberExclusive < lineNumber) {
                offset = diff.resultingDeltaFromOriginalToModified;
            }
            else {
                break;
            }
        }
        return lineNumber + offset;
    }
    getResultLineRange(baseRange, reader) {
        let start = this.getResultLine(baseRange.startLineNumber, reader);
        if (typeof start !== 'number') {
            start = start.outputRange.startLineNumber;
        }
        let endExclusive = this.getResultLine(baseRange.endLineNumberExclusive, reader);
        if (typeof endExclusive !== 'number') {
            endExclusive = endExclusive.outputRange.endLineNumberExclusive;
        }
        return LineRange.fromLineNumbers(start, endExclusive);
    }
}
export var TextModelDiffChangeReason;
(function (TextModelDiffChangeReason) {
    TextModelDiffChangeReason[TextModelDiffChangeReason["other"] = 0] = "other";
    TextModelDiffChangeReason[TextModelDiffChangeReason["textChange"] = 1] = "textChange";
})(TextModelDiffChangeReason || (TextModelDiffChangeReason = {}));
export var TextModelDiffState;
(function (TextModelDiffState) {
    TextModelDiffState[TextModelDiffState["initializing"] = 1] = "initializing";
    TextModelDiffState[TextModelDiffState["upToDate"] = 2] = "upToDate";
    TextModelDiffState[TextModelDiffState["updating"] = 3] = "updating";
    TextModelDiffState[TextModelDiffState["error"] = 4] = "error";
})(TextModelDiffState || (TextModelDiffState = {}));
