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
import { findLast } from 'vs/base/common/arrays';
import { Disposable } from 'vs/base/common/lifecycle';
import { derived, derivedObservableWithWritableCache, observableFromEvent, observableValue, transaction } from 'vs/base/common/observable';
import { Range } from 'vs/editor/common/core/range';
import { localize } from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { LineRange } from 'vs/workbench/contrib/mergeEditor/browser/model/lineRange';
let MergeEditorViewModel = class MergeEditorViewModel extends Disposable {
    model;
    inputCodeEditorView1;
    inputCodeEditorView2;
    resultCodeEditorView;
    baseCodeEditorView;
    showNonConflictingChanges;
    configurationService;
    notificationService;
    manuallySetActiveModifiedBaseRange = observableValue('manuallySetActiveModifiedBaseRange', { range: undefined, counter: 0 });
    constructor(model, inputCodeEditorView1, inputCodeEditorView2, resultCodeEditorView, baseCodeEditorView, showNonConflictingChanges, configurationService, notificationService) {
        super();
        this.model = model;
        this.inputCodeEditorView1 = inputCodeEditorView1;
        this.inputCodeEditorView2 = inputCodeEditorView2;
        this.resultCodeEditorView = resultCodeEditorView;
        this.baseCodeEditorView = baseCodeEditorView;
        this.showNonConflictingChanges = showNonConflictingChanges;
        this.configurationService = configurationService;
        this.notificationService = notificationService;
        this._register(resultCodeEditorView.editor.onDidChangeModelContent(e => {
            if (this.model.isApplyingEditInResult) {
                return;
            }
            transaction(tx => {
                /** @description Mark conflicts touched by manual edits as handled */
                for (const change of e.changes) {
                    const rangeInBase = this.model.translateResultRangeToBase(Range.lift(change.range));
                    const baseRanges = this.model.findModifiedBaseRangesInRange(new LineRange(rangeInBase.startLineNumber, rangeInBase.endLineNumber - rangeInBase.startLineNumber));
                    if (baseRanges.length === 1) {
                        this.model.setHandled(baseRanges[0], true, tx);
                    }
                }
            });
        }));
    }
    shouldUseAppendInsteadOfAccept = observableFromEvent(this.configurationService.onDidChangeConfiguration, () => /** @description appendVsAccept */ this.configurationService.getValue('mergeEditor.shouldUseAppendInsteadOfAccept') ?? false);
    counter = 0;
    lastFocusedEditor = derivedObservableWithWritableCache('lastFocusedEditor', (reader, lastValue) => {
        const editors = [
            this.inputCodeEditorView1,
            this.inputCodeEditorView2,
            this.resultCodeEditorView,
            this.baseCodeEditorView.read(reader),
        ];
        const view = editors.find((e) => e && e.isFocused.read(reader));
        return view ? { view, counter: this.counter++ } : lastValue || { view: undefined, counter: this.counter++ };
    });
    baseShowDiffAgainst = derived('baseShowDiffAgainst', reader => {
        const lastFocusedEditor = this.lastFocusedEditor.read(reader);
        if (lastFocusedEditor.view === this.inputCodeEditorView1) {
            return 1;
        }
        else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
            return 2;
        }
        return undefined;
    });
    selectionInBase = derived('selectionInBase', (reader) => {
        const sourceEditor = this.lastFocusedEditor.read(reader).view;
        if (!sourceEditor) {
            return undefined;
        }
        const selections = sourceEditor.selection.read(reader) || [];
        const rangesInBase = selections.map((selection) => {
            if (sourceEditor === this.inputCodeEditorView1) {
                return this.model.translateInputRangeToBase(1, selection);
            }
            else if (sourceEditor === this.inputCodeEditorView2) {
                return this.model.translateInputRangeToBase(2, selection);
            }
            else if (sourceEditor === this.resultCodeEditorView) {
                return this.model.translateResultRangeToBase(selection);
            }
            else if (sourceEditor === this.baseCodeEditorView.read(reader)) {
                return selection;
            }
            else {
                return selection;
            }
        });
        return {
            rangesInBase,
            sourceEditor
        };
    });
    getRangeOfModifiedBaseRange(editor, modifiedBaseRange, reader) {
        if (editor === this.resultCodeEditorView) {
            return this.model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
        }
        else if (editor === this.baseCodeEditorView.get()) {
            return modifiedBaseRange.baseRange;
        }
        else {
            const input = editor === this.inputCodeEditorView1 ? 1 : 2;
            return modifiedBaseRange.getInputRange(input);
        }
    }
    activeModifiedBaseRange = derived('activeModifiedBaseRange', (reader) => {
        const focusedEditor = this.lastFocusedEditor.read(reader);
        const manualRange = this.manuallySetActiveModifiedBaseRange.read(reader);
        if (manualRange.counter > focusedEditor.counter) {
            return manualRange.range;
        }
        if (!focusedEditor.view) {
            return;
        }
        const cursorLineNumber = focusedEditor.view.cursorLineNumber.read(reader);
        if (!cursorLineNumber) {
            return undefined;
        }
        const modifiedBaseRanges = this.model.modifiedBaseRanges.read(reader);
        return modifiedBaseRanges.find((r) => {
            const range = this.getRangeOfModifiedBaseRange(focusedEditor.view, r, reader);
            return range.isEmpty
                ? range.startLineNumber === cursorLineNumber
                : range.contains(cursorLineNumber);
        });
    });
    setActiveModifiedBaseRange(range, tx) {
        this.manuallySetActiveModifiedBaseRange.set({ range, counter: this.counter++ }, tx);
    }
    setState(baseRange, state, tx, inputNumber) {
        this.manuallySetActiveModifiedBaseRange.set({ range: baseRange, counter: this.counter++ }, tx);
        this.model.setState(baseRange, state, inputNumber, tx);
    }
    goToConflict(getModifiedBaseRange) {
        let editor = this.lastFocusedEditor.get().view;
        if (!editor) {
            editor = this.resultCodeEditorView;
        }
        const curLineNumber = editor.editor.getPosition()?.lineNumber;
        if (curLineNumber === undefined) {
            return;
        }
        const modifiedBaseRange = getModifiedBaseRange(editor, curLineNumber);
        if (modifiedBaseRange) {
            const range = this.getRangeOfModifiedBaseRange(editor, modifiedBaseRange, undefined);
            editor.editor.focus();
            let startLineNumber = range.startLineNumber;
            let endLineNumberExclusive = range.endLineNumberExclusive;
            if (range.startLineNumber > editor.editor.getModel().getLineCount()) {
                transaction(tx => {
                    this.setActiveModifiedBaseRange(modifiedBaseRange, tx);
                });
                startLineNumber = endLineNumberExclusive = editor.editor.getModel().getLineCount();
            }
            editor.editor.setPosition({
                lineNumber: startLineNumber,
                column: editor.editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber),
            });
            editor.editor.revealLinesNearTop(startLineNumber, endLineNumberExclusive, 0 /* ScrollType.Smooth */);
        }
    }
    goToNextModifiedBaseRange(predicate) {
        this.goToConflict((e, l) => this.model.modifiedBaseRanges
            .get()
            .find((r) => predicate(r) &&
            this.getRangeOfModifiedBaseRange(e, r, undefined).startLineNumber > l) ||
            this.model.modifiedBaseRanges
                .get()
                .find((r) => predicate(r)));
    }
    goToPreviousModifiedBaseRange(predicate) {
        this.goToConflict((e, l) => findLast(this.model.modifiedBaseRanges.get(), (r) => predicate(r) &&
            this.getRangeOfModifiedBaseRange(e, r, undefined).endLineNumberExclusive < l) ||
            findLast(this.model.modifiedBaseRanges.get(), (r) => predicate(r)));
    }
    toggleActiveConflict(inputNumber) {
        const activeModifiedBaseRange = this.activeModifiedBaseRange.get();
        if (!activeModifiedBaseRange) {
            this.notificationService.error(localize('noConflictMessage', "There is currently no conflict focused that can be toggled."));
            return;
        }
        transaction(tx => {
            /** @description Toggle Active Conflict */
            this.setState(activeModifiedBaseRange, this.model.getState(activeModifiedBaseRange).get().toggle(inputNumber), tx, inputNumber);
        });
    }
    acceptAll(inputNumber) {
        transaction(tx => {
            /** @description Toggle Active Conflict */
            for (const range of this.model.modifiedBaseRanges.get()) {
                this.setState(range, this.model.getState(range).get().withInputValue(inputNumber, true), tx, inputNumber);
            }
        });
    }
};
MergeEditorViewModel = __decorate([
    __param(6, IConfigurationService),
    __param(7, INotificationService)
], MergeEditorViewModel);
export { MergeEditorViewModel };
