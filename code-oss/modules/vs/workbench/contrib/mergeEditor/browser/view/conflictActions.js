/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { $, createStyleSheet, h, isInShadowDOM, reset } from 'vs/base/browser/dom';
import { renderLabelWithIcons } from 'vs/base/browser/ui/iconLabel/iconLabels';
import { hash } from 'vs/base/common/hash';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { autorun, derived, transaction } from 'vs/base/common/observable';
import { EDITOR_FONT_DEFAULTS } from 'vs/editor/common/config/editorOptions';
import { localize } from 'vs/nls';
import { ModifiedBaseRangeState, ModifiedBaseRangeStateKind } from 'vs/workbench/contrib/mergeEditor/browser/model/modifiedBaseRange';
import { FixedZoneWidget } from 'vs/workbench/contrib/mergeEditor/browser/view/fixedZoneWidget';
export class ConflictActionsFactory extends Disposable {
    _editor;
    _styleClassName;
    _styleElement;
    constructor(_editor) {
        super();
        this._editor = _editor;
        this._register(this._editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(45 /* EditorOption.fontInfo */) || e.hasChanged(16 /* EditorOption.codeLensFontSize */) || e.hasChanged(15 /* EditorOption.codeLensFontFamily */)) {
                this._updateLensStyle();
            }
        }));
        this._styleClassName = '_conflictActionsFactory_' + hash(this._editor.getId()).toString(16);
        this._styleElement = createStyleSheet(isInShadowDOM(this._editor.getContainerDomNode())
            ? this._editor.getContainerDomNode()
            : undefined);
        this._register(toDisposable(() => {
            this._styleElement.remove();
        }));
        this._updateLensStyle();
    }
    _updateLensStyle() {
        const { codeLensHeight, fontSize } = this._getLayoutInfo();
        const fontFamily = this._editor.getOption(15 /* EditorOption.codeLensFontFamily */);
        const editorFontInfo = this._editor.getOption(45 /* EditorOption.fontInfo */);
        const fontFamilyVar = `--codelens-font-family${this._styleClassName}`;
        const fontFeaturesVar = `--codelens-font-features${this._styleClassName}`;
        let newStyle = `
		.${this._styleClassName} { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; padding-right: ${Math.round(fontSize * 0.5)}px; font-feature-settings: var(${fontFeaturesVar}) }
		.monaco-workbench .${this._styleClassName} span.codicon { line-height: ${codeLensHeight}px; font-size: ${fontSize}px; }
		`;
        if (fontFamily) {
            newStyle += `${this._styleClassName} { font-family: var(${fontFamilyVar}), ${EDITOR_FONT_DEFAULTS.fontFamily}}`;
        }
        this._styleElement.textContent = newStyle;
        this._editor.getContainerDomNode().style.setProperty(fontFamilyVar, fontFamily ?? 'inherit');
        this._editor.getContainerDomNode().style.setProperty(fontFeaturesVar, editorFontInfo.fontFeatureSettings);
    }
    _getLayoutInfo() {
        const lineHeightFactor = Math.max(1.3, this._editor.getOption(60 /* EditorOption.lineHeight */) / this._editor.getOption(47 /* EditorOption.fontSize */));
        let fontSize = this._editor.getOption(16 /* EditorOption.codeLensFontSize */);
        if (!fontSize || fontSize < 5) {
            fontSize = (this._editor.getOption(47 /* EditorOption.fontSize */) * .9) | 0;
        }
        return {
            fontSize,
            codeLensHeight: (fontSize * lineHeightFactor) | 0,
        };
    }
    createWidget(viewZoneChangeAccessor, lineNumber, items, viewZoneIdsToCleanUp) {
        const layoutInfo = this._getLayoutInfo();
        return new ActionsContentWidget(this._editor, viewZoneChangeAccessor, lineNumber, layoutInfo.codeLensHeight + 2, this._styleClassName, items, viewZoneIdsToCleanUp);
    }
}
export class ActionsSource {
    viewModel;
    modifiedBaseRange;
    constructor(viewModel, modifiedBaseRange) {
        this.viewModel = viewModel;
        this.modifiedBaseRange = modifiedBaseRange;
    }
    getItemsInput(inputNumber) {
        return derived('items', reader => {
            const viewModel = this.viewModel;
            const modifiedBaseRange = this.modifiedBaseRange;
            if (!viewModel.model.hasBaseRange(modifiedBaseRange)) {
                return [];
            }
            const state = viewModel.model.getState(modifiedBaseRange).read(reader);
            const handled = viewModel.model.isHandled(modifiedBaseRange).read(reader);
            const model = viewModel.model;
            const result = [];
            const inputData = inputNumber === 1 ? viewModel.model.input1 : viewModel.model.input2;
            const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
            if (!modifiedBaseRange.isConflicting && handled && !showNonConflictingChanges) {
                return [];
            }
            const otherInputNumber = inputNumber === 1 ? 2 : 1;
            if (state.kind !== ModifiedBaseRangeStateKind.unrecognized && !state.isInputIncluded(inputNumber)) {
                if (!state.isInputIncluded(otherInputNumber) || !this.viewModel.shouldUseAppendInsteadOfAccept.read(reader)) {
                    result.push(command(localize('accept', "Accept {0}", inputData.title), async () => {
                        transaction((tx) => {
                            model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, false), inputNumber, tx);
                            model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
                        });
                    }, localize('acceptTooltip', "Accept {0} in the result document.", inputData.title)));
                    if (modifiedBaseRange.canBeCombined) {
                        result.push(command(localize('acceptBoth', "Accept Combination"), async () => {
                            transaction((tx) => {
                                model.setState(modifiedBaseRange, ModifiedBaseRangeState.base
                                    .withInputValue(inputNumber, true)
                                    .withInputValue(otherInputNumber, true, true), true, tx);
                                model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                            });
                        }, localize('acceptBothTooltip', "Accept an automatic combination of both sides in the result document.")));
                    }
                }
                else {
                    result.push(command(localize('append', "Append {0}", inputData.title), async () => {
                        transaction((tx) => {
                            model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, false), inputNumber, tx);
                            model.telemetry.reportAcceptInvoked(inputNumber, state.includesInput(otherInputNumber));
                        });
                    }, localize('appendTooltip', "Append {0} to the result document.", inputData.title)));
                    if (modifiedBaseRange.canBeCombined) {
                        result.push(command(localize('combine', "Accept Combination", inputData.title), async () => {
                            transaction((tx) => {
                                model.setState(modifiedBaseRange, state.withInputValue(inputNumber, true, true), inputNumber, tx);
                                model.telemetry.reportSmartCombinationInvoked(state.includesInput(otherInputNumber));
                            });
                        }, localize('acceptBothTooltip', "Accept an automatic combination of both sides in the result document.")));
                    }
                }
                if (!model.isInputHandled(modifiedBaseRange, inputNumber).read(reader)) {
                    result.push(command(localize('ignore', 'Ignore'), async () => {
                        transaction((tx) => {
                            model.setInputHandled(modifiedBaseRange, inputNumber, true, tx);
                        });
                    }, localize('markAsHandledTooltip', "Don't take this side of the conflict.")));
                }
            }
            return result;
        });
    }
    itemsInput1 = this.getItemsInput(1);
    itemsInput2 = this.getItemsInput(2);
    resultItems = derived('items', reader => {
        const viewModel = this.viewModel;
        const modifiedBaseRange = this.modifiedBaseRange;
        const state = viewModel.model.getState(modifiedBaseRange).read(reader);
        const model = viewModel.model;
        const result = [];
        if (state.kind === ModifiedBaseRangeStateKind.unrecognized) {
            result.push({
                text: localize('manualResolution', "Manual Resolution"),
                tooltip: localize('manualResolutionTooltip', "This conflict has been resolved manually."),
            });
        }
        else if (state.kind === ModifiedBaseRangeStateKind.base) {
            result.push({
                text: localize('noChangesAccepted', 'No Changes Accepted'),
                tooltip: localize('noChangesAcceptedTooltip', 'The current resolution of this conflict equals the common ancestor of both the right and left changes.'),
            });
        }
        else {
            const labels = [];
            if (state.includesInput1) {
                labels.push(model.input1.title);
            }
            if (state.includesInput2) {
                labels.push(model.input2.title);
            }
            if (state.kind === ModifiedBaseRangeStateKind.both && state.firstInput === 2) {
                labels.reverse();
            }
            result.push({
                text: `${labels.join(' + ')}`
            });
        }
        const stateToggles = [];
        if (state.includesInput1) {
            stateToggles.push(command(localize('remove', 'Remove {0}', model.input1.title), async () => {
                transaction((tx) => {
                    model.setState(modifiedBaseRange, state.withInputValue(1, false), true, tx);
                    model.telemetry.reportRemoveInvoked(1, state.includesInput(2));
                });
            }, localize('removeTooltip', 'Remove {0} from the result document.', model.input1.title)));
        }
        if (state.includesInput2) {
            stateToggles.push(command(localize('remove', 'Remove {0}', model.input2.title), async () => {
                transaction((tx) => {
                    model.setState(modifiedBaseRange, state.withInputValue(2, false), true, tx);
                    model.telemetry.reportRemoveInvoked(2, state.includesInput(1));
                });
            }, localize('removeTooltip', 'Remove {0} from the result document.', model.input2.title)));
        }
        if (state.kind === ModifiedBaseRangeStateKind.both &&
            state.firstInput === 2) {
            stateToggles.reverse();
        }
        result.push(...stateToggles);
        if (state.kind === ModifiedBaseRangeStateKind.unrecognized) {
            result.push(command(localize('resetToBase', 'Reset to base'), async () => {
                transaction((tx) => {
                    model.setState(modifiedBaseRange, ModifiedBaseRangeState.base, true, tx);
                    model.telemetry.reportResetToBaseInvoked();
                });
            }, localize('resetToBaseTooltip', 'Reset this conflict to the common ancestor of both the right and left changes.')));
        }
        return result;
    });
    isEmpty = derived('isEmpty', reader => {
        return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length + this.resultItems.read(reader).length === 0;
    });
    inputIsEmpty = derived('inputIsEmpty', reader => {
        return this.itemsInput1.read(reader).length + this.itemsInput2.read(reader).length === 0;
    });
}
function command(title, action, tooltip) {
    return {
        text: title,
        action,
        tooltip,
    };
}
class ActionsContentWidget extends FixedZoneWidget {
    _domNode = h('div.merge-editor-conflict-actions').root;
    constructor(editor, viewZoneAccessor, afterLineNumber, height, className, items, viewZoneIdsToCleanUp) {
        super(editor, viewZoneAccessor, afterLineNumber, height, viewZoneIdsToCleanUp);
        this.widgetDomNode.appendChild(this._domNode);
        this._domNode.classList.add(className);
        this._register(autorun('update commands', (reader) => {
            const i = items.read(reader);
            this.setState(i);
        }));
    }
    setState(items) {
        const children = [];
        let isFirst = true;
        for (const item of items) {
            if (isFirst) {
                isFirst = false;
            }
            else {
                children.push($('span', undefined, '\u00a0|\u00a0'));
            }
            const title = renderLabelWithIcons(item.text);
            if (item.action) {
                children.push($('a', { title: item.tooltip, role: 'button', onclick: () => item.action() }, ...title));
            }
            else {
                children.push($('span', { title: item.tooltip }, ...title));
            }
        }
        reset(this._domNode, ...children);
    }
}
