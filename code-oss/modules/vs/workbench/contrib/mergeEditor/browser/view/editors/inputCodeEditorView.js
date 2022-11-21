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
import { addDisposableListener, EventType, h, reset } from 'vs/base/browser/dom';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { Toggle } from 'vs/base/browser/ui/toggle/toggle';
import { Action, Separator } from 'vs/base/common/actions';
import { Codicon } from 'vs/base/common/codicons';
import { Disposable } from 'vs/base/common/lifecycle';
import { clamp } from 'vs/base/common/numbers';
import { autorun, autorunWithStore, derived, observableValue, transaction } from 'vs/base/common/observable';
import { noBreakWhitespace } from 'vs/base/common/strings';
import { isDefined } from 'vs/base/common/types';
import { EditorExtensionsRegistry } from 'vs/editor/browser/editorExtensions';
import { MinimapPosition, OverviewRulerLane } from 'vs/editor/common/model';
import { CodeLensContribution } from 'vs/editor/contrib/codelens/browser/codelensController';
import { localize } from 'vs/nls';
import { MenuId } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachToggleStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { applyObservableDecorations, setFields } from 'vs/workbench/contrib/mergeEditor/browser/utils';
import { handledConflictMinimapOverViewRulerColor, unhandledConflictMinimapOverViewRulerColor } from 'vs/workbench/contrib/mergeEditor/browser/view/colors';
import { EditorGutter } from '../editorGutter';
import { CodeEditorView, createSelectionsAutorun, TitleMenu } from './codeEditorView';
let InputCodeEditorView = class InputCodeEditorView extends CodeEditorView {
    inputNumber;
    otherInputNumber = this.inputNumber === 1 ? 2 : 1;
    constructor(inputNumber, viewModel, instantiationService, contextMenuService, themeService, configurationService) {
        super(instantiationService, viewModel, configurationService);
        this.inputNumber = inputNumber;
        this.htmlElements.root.classList.add(`input`);
        this._register(autorunWithStore((reader, store) => {
            if (this.checkboxesVisible.read(reader)) {
                store.add(new EditorGutter(this.editor, this.htmlElements.gutterDiv, {
                    getIntersectingGutterItems: (range, reader) => {
                        return this.modifiedBaseRangeGutterItemInfos.read(reader);
                    },
                    createView: (item, target) => new MergeConflictGutterItemView(item, target, contextMenuService, themeService),
                }));
            }
        }, 'update checkboxes'));
        this._register(createSelectionsAutorun(this, (baseRange, viewModel) => viewModel.model.translateBaseRangeToInput(this.inputNumber, baseRange)));
        this._register(instantiationService.createInstance(TitleMenu, inputNumber === 1 ? MenuId.MergeInput1Toolbar : MenuId.MergeInput2Toolbar, this.htmlElements.toolbar));
        this._register(autorun('input${this.inputNumber}: update labels & text model', reader => {
            const vm = this.viewModel.read(reader);
            if (!vm) {
                return;
            }
            this.editor.setModel(this.inputNumber === 1 ? vm.model.input1.textModel : vm.model.input2.textModel);
            const title = this.inputNumber === 1
                ? vm.model.input1.title || localize('input1', 'Input 1')
                : vm.model.input2.title || localize('input2', 'Input 2');
            const description = this.inputNumber === 1
                ? vm.model.input1.description
                : vm.model.input2.description;
            const detail = this.inputNumber === 1
                ? vm.model.input1.detail
                : vm.model.input2.detail;
            reset(this.htmlElements.title, ...renderLabelWithIcons(title));
            reset(this.htmlElements.description, ...(description ? renderLabelWithIcons(description) : []));
            reset(this.htmlElements.detail, ...(detail ? renderLabelWithIcons(detail) : []));
        }));
        this._register(applyObservableDecorations(this.editor, this.decorations));
    }
    modifiedBaseRangeGutterItemInfos = derived(`input${this.inputNumber}.modifiedBaseRangeGutterItemInfos`, reader => {
        const viewModel = this.viewModel.read(reader);
        if (!viewModel) {
            return [];
        }
        const model = viewModel.model;
        const inputNumber = this.inputNumber;
        const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
        return model.modifiedBaseRanges.read(reader)
            .filter((r) => r.getInputDiffs(this.inputNumber).length > 0 && (showNonConflictingChanges || r.isConflicting || !model.isHandled(r).read(reader)))
            .map((baseRange, idx) => new ModifiedBaseRangeGutterItemModel(idx.toString(), baseRange, inputNumber, viewModel));
    });
    decorations = derived(`input${this.inputNumber}.decorations`, reader => {
        const viewModel = this.viewModel.read(reader);
        if (!viewModel) {
            return [];
        }
        const model = viewModel.model;
        const textModel = (this.inputNumber === 1 ? model.input1 : model.input2).textModel;
        const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
        const result = new Array();
        const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
        const showDeletionMarkers = this.showDeletionMarkers.read(reader);
        const diffWithThis = viewModel.baseCodeEditorView.read(reader) !== undefined && viewModel.baseShowDiffAgainst.read(reader) === this.inputNumber;
        const useSimplifiedDecorations = !diffWithThis && this.useSimplifiedDecorations.read(reader);
        for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
            const range = modifiedBaseRange.getInputRange(this.inputNumber);
            if (!range) {
                continue;
            }
            const blockClassNames = ['merge-editor-block'];
            const isHandled = model.isInputHandled(modifiedBaseRange, this.inputNumber).read(reader);
            if (isHandled) {
                blockClassNames.push('handled');
            }
            if (modifiedBaseRange === activeModifiedBaseRange) {
                blockClassNames.push('focused');
            }
            if (modifiedBaseRange.isConflicting) {
                blockClassNames.push('conflicting');
            }
            const inputClassName = this.inputNumber === 1 ? 'input i1' : 'input i2';
            blockClassNames.push(inputClassName);
            if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
                continue;
            }
            if (useSimplifiedDecorations && !isHandled) {
                blockClassNames.push('use-simplified-decorations');
            }
            result.push({
                range: range.toInclusiveRangeOrEmpty(),
                options: {
                    showIfCollapsed: true,
                    blockClassName: blockClassNames.join(' '),
                    blockIsAfterEnd: range.startLineNumber > textModel.getLineCount(),
                    description: 'Merge Editor',
                    minimap: {
                        position: MinimapPosition.Gutter,
                        color: { id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor },
                    },
                    overviewRuler: modifiedBaseRange.isConflicting ? {
                        position: OverviewRulerLane.Center,
                        color: { id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor },
                    } : undefined
                }
            });
            if (!useSimplifiedDecorations && (modifiedBaseRange.isConflicting || !model.isHandled(modifiedBaseRange).read(reader))) {
                const inputDiffs = modifiedBaseRange.getInputDiffs(this.inputNumber);
                for (const diff of inputDiffs) {
                    const range = diff.outputRange.toInclusiveRange();
                    if (range) {
                        result.push({
                            range,
                            options: {
                                className: `merge-editor-diff ${inputClassName}`,
                                description: 'Merge Editor',
                                isWholeLine: true,
                            }
                        });
                    }
                    if (diff.rangeMappings) {
                        for (const d of diff.rangeMappings) {
                            if (showDeletionMarkers || !d.outputRange.isEmpty()) {
                                result.push({
                                    range: d.outputRange,
                                    options: {
                                        className: d.outputRange.isEmpty() ? `merge-editor-diff-empty-word ${inputClassName}` : `merge-editor-diff-word ${inputClassName}`,
                                        description: 'Merge Editor',
                                        showIfCollapsed: true,
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        return result;
    });
    getEditorContributions() {
        return EditorExtensionsRegistry.getEditorContributions().filter(c => c.id !== CodeLensContribution.ID);
    }
};
InputCodeEditorView = __decorate([
    __param(2, IInstantiationService),
    __param(3, IContextMenuService),
    __param(4, IThemeService),
    __param(5, IConfigurationService)
], InputCodeEditorView);
export { InputCodeEditorView };
export class ModifiedBaseRangeGutterItemModel {
    id;
    baseRange;
    inputNumber;
    viewModel;
    model = this.viewModel.model;
    range = this.baseRange.getInputRange(this.inputNumber);
    constructor(id, baseRange, inputNumber, viewModel) {
        this.id = id;
        this.baseRange = baseRange;
        this.inputNumber = inputNumber;
        this.viewModel = viewModel;
    }
    enabled = this.model.isUpToDate;
    toggleState = derived('checkbox is checked', (reader) => {
        const input = this.model
            .getState(this.baseRange)
            .read(reader)
            .getInput(this.inputNumber);
        return input === 2 /* InputState.second */ && !this.baseRange.isOrderRelevant
            ? 1 /* InputState.first */
            : input;
    });
    state = derived('checkbox state', (reader) => {
        const active = this.viewModel.activeModifiedBaseRange.read(reader);
        if (!this.model.hasBaseRange(this.baseRange)) {
            return { handled: false, focused: false }; // Invalid state, should only be observed temporarily
        }
        return {
            handled: this.model.isHandled(this.baseRange).read(reader),
            focused: this.baseRange === active,
        };
    });
    setState(value, tx) {
        this.viewModel.setState(this.baseRange, this.model
            .getState(this.baseRange)
            .get()
            .withInputValue(this.inputNumber, value), tx, this.inputNumber);
    }
    toggleBothSides() {
        transaction(tx => {
            /** @description Context Menu: toggle both sides */
            const state = this.model
                .getState(this.baseRange)
                .get();
            this.model.setState(this.baseRange, state
                .toggle(this.inputNumber)
                .toggle(this.inputNumber === 1 ? 2 : 1), true, tx);
        });
    }
    getContextMenuActions() {
        const state = this.model.getState(this.baseRange).get();
        const handled = this.model.isHandled(this.baseRange).get();
        const update = (newState) => {
            transaction(tx => {
                /** @description Context Menu: Update Base Range State */
                return this.viewModel.setState(this.baseRange, newState, tx, this.inputNumber);
            });
        };
        function action(id, label, targetState, checked) {
            const action = new Action(id, label, undefined, true, () => {
                update(targetState);
            });
            action.checked = checked;
            return action;
        }
        const both = state.includesInput1 && state.includesInput2;
        return [
            this.baseRange.input1Diffs.length > 0
                ? action('mergeEditor.acceptInput1', localize('mergeEditor.accept', 'Accept {0}', this.model.input1.title), state.toggle(1), state.includesInput1)
                : undefined,
            this.baseRange.input2Diffs.length > 0
                ? action('mergeEditor.acceptInput2', localize('mergeEditor.accept', 'Accept {0}', this.model.input2.title), state.toggle(2), state.includesInput2)
                : undefined,
            this.baseRange.isConflicting
                ? setFields(action('mergeEditor.acceptBoth', localize('mergeEditor.acceptBoth', 'Accept Both'), state.withInputValue(1, !both).withInputValue(2, !both), both), { enabled: this.baseRange.canBeCombined })
                : undefined,
            new Separator(),
            this.baseRange.isConflicting
                ? setFields(action('mergeEditor.swap', localize('mergeEditor.swap', 'Swap'), state.swap(), false), { enabled: !state.kind && (!both || this.baseRange.isOrderRelevant) })
                : undefined,
            setFields(new Action('mergeEditor.markAsHandled', localize('mergeEditor.markAsHandled', 'Mark as Handled'), undefined, true, () => {
                transaction((tx) => {
                    /** @description Context Menu: Mark as handled */
                    this.model.setHandled(this.baseRange, !handled, tx);
                });
            }), { checked: handled }),
        ].filter(isDefined);
    }
}
export class MergeConflictGutterItemView extends Disposable {
    item;
    checkboxDiv;
    isMultiLine = observableValue('isMultiLine', false);
    constructor(item, target, contextMenuService, themeService) {
        super();
        this.item = observableValue('item', item);
        const checkBox = new Toggle({
            isChecked: false,
            title: '',
            icon: Codicon.check
        });
        checkBox.domNode.classList.add('accept-conflict-group');
        this._register(attachToggleStyler(checkBox, themeService));
        this._register(addDisposableListener(checkBox.domNode, EventType.MOUSE_DOWN, (e) => {
            const item = this.item.get();
            if (!item) {
                return;
            }
            if (e.button === /* Right */ 2) {
                e.stopPropagation();
                e.preventDefault();
                contextMenuService.showContextMenu({
                    getAnchor: () => checkBox.domNode,
                    getActions: () => item.getContextMenuActions(),
                });
            }
            else if (e.button === /* Middle */ 1) {
                e.stopPropagation();
                e.preventDefault();
                item.toggleBothSides();
            }
        }));
        this._register(autorun('Update Checkbox', (reader) => {
            const item = this.item.read(reader);
            const value = item.toggleState.read(reader);
            const iconMap = {
                [0 /* InputState.excluded */]: { icon: undefined, checked: false, title: localize('accept.excluded', "Accept") },
                [3 /* InputState.unrecognized */]: { icon: Codicon.circleFilled, checked: false, title: localize('accept.conflicting', "Accept (result is dirty)") },
                [1 /* InputState.first */]: { icon: Codicon.check, checked: true, title: localize('accept.first', "Undo accept") },
                [2 /* InputState.second */]: { icon: Codicon.checkAll, checked: true, title: localize('accept.second', "Undo accept (currently second)") },
            };
            const state = iconMap[value];
            checkBox.setIcon(state.icon);
            checkBox.checked = state.checked;
            checkBox.setTitle(state.title);
            if (!item.enabled.read(reader)) {
                checkBox.disable();
            }
            else {
                checkBox.enable();
            }
        }));
        this._register(autorun('Update Checkbox CSS ClassNames', (reader) => {
            const state = this.item.read(reader).state.read(reader);
            const classNames = [
                'merge-accept-gutter-marker',
                state.handled && 'handled',
                state.focused && 'focused',
                this.isMultiLine.read(reader) ? 'multi-line' : 'single-line',
            ];
            target.className = classNames.filter(c => typeof c === 'string').join(' ');
        }));
        this._register(checkBox.onChange(() => {
            transaction(tx => {
                /** @description Handle Checkbox Change */
                this.item.get().setState(checkBox.checked, tx);
            });
        }));
        target.appendChild(h('div.background', [noBreakWhitespace]).root);
        target.appendChild(this.checkboxDiv = h('div.checkbox', [h('div.checkbox-background', [checkBox.domNode])]).root);
    }
    layout(top, height, viewTop, viewHeight) {
        const checkboxHeight = this.checkboxDiv.clientHeight;
        const middleHeight = height / 2 - checkboxHeight / 2;
        const margin = checkboxHeight;
        let effectiveCheckboxTop = top + middleHeight;
        const preferredViewPortRange = [
            margin,
            viewTop + viewHeight - margin - checkboxHeight
        ];
        const preferredParentRange = [
            top + margin,
            top + height - checkboxHeight - margin
        ];
        if (preferredParentRange[0] < preferredParentRange[1]) {
            effectiveCheckboxTop = clamp(effectiveCheckboxTop, preferredViewPortRange[0], preferredViewPortRange[1]);
            effectiveCheckboxTop = clamp(effectiveCheckboxTop, preferredParentRange[0], preferredParentRange[1]);
        }
        this.checkboxDiv.style.top = `${effectiveCheckboxTop - top}px`;
        transaction((tx) => {
            /** @description MergeConflictGutterItemView: Update Is Multi Line */
            this.isMultiLine.set(height > 30, tx);
        });
    }
    update(baseRange) {
        transaction(tx => {
            /** @description MergeConflictGutterItemView: Updating new base range */
            this.item.set(baseRange, tx);
        });
    }
}
