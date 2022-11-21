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
import { h } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { autorun, derived, observableFromEvent } from 'vs/base/common/observable';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { Selection } from 'vs/editor/common/core/selection';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS } from 'vs/workbench/browser/parts/editor/editor';
import { setStyle } from 'vs/workbench/contrib/mergeEditor/browser/utils';
export class CodeEditorView extends Disposable {
    instantiationService;
    viewModel;
    configurationService;
    model = this.viewModel.map(m => /** @description model */ m?.model);
    htmlElements = h('div.code-view', [
        h('div.title@header', [
            h('span.title@title'),
            h('span.description@description'),
            h('span.detail@detail'),
            h('span.toolbar@toolbar'),
        ]),
        h('div.container', [
            h('div.gutter@gutterDiv'),
            h('div@editor'),
        ]),
    ]);
    _onDidViewChange = new Emitter();
    view = {
        element: this.htmlElements.root,
        minimumWidth: DEFAULT_EDITOR_MIN_DIMENSIONS.width,
        maximumWidth: DEFAULT_EDITOR_MAX_DIMENSIONS.width,
        minimumHeight: DEFAULT_EDITOR_MIN_DIMENSIONS.height,
        maximumHeight: DEFAULT_EDITOR_MAX_DIMENSIONS.height,
        onDidChange: this._onDidViewChange.event,
        layout: (width, height, top, left) => {
            setStyle(this.htmlElements.root, { width, height, top, left });
            this.editor.layout({
                width: width - this.htmlElements.gutterDiv.clientWidth,
                height: height - this.htmlElements.header.clientHeight,
            });
        }
        // preferredWidth?: number | undefined;
        // preferredHeight?: number | undefined;
        // priority?: LayoutPriority | undefined;
        // snap?: boolean | undefined;
    };
    checkboxesVisible = observableFromEvent(this.configurationService.onDidChangeConfiguration, () => /** @description checkboxesVisible */ this.configurationService.getValue('mergeEditor.showCheckboxes') ?? false);
    showDeletionMarkers = observableFromEvent(this.configurationService.onDidChangeConfiguration, () => /** @description showDeletionMarkers */ this.configurationService.getValue('mergeEditor.showDeletionMarkers') ?? true);
    useSimplifiedDecorations = observableFromEvent(this.configurationService.onDidChangeConfiguration, () => /** @description useSimplifiedDecorations */ this.configurationService.getValue('mergeEditor.useSimplifiedDecorations') ?? false);
    editor = this.instantiationService.createInstance(CodeEditorWidget, this.htmlElements.editor, {}, {
        contributions: this.getEditorContributions(),
    });
    updateOptions(newOptions) {
        this.editor.updateOptions(newOptions);
    }
    isFocused = observableFromEvent(Event.any(this.editor.onDidBlurEditorWidget, this.editor.onDidFocusEditorWidget), () => /** @description editor.hasWidgetFocus */ this.editor.hasWidgetFocus());
    cursorPosition = observableFromEvent(this.editor.onDidChangeCursorPosition, () => /** @description editor.getPosition */ this.editor.getPosition());
    selection = observableFromEvent(this.editor.onDidChangeCursorSelection, () => /** @description editor.getSelections */ this.editor.getSelections());
    cursorLineNumber = this.cursorPosition.map(p => /** @description cursorPosition.lineNumber */ p?.lineNumber);
    constructor(instantiationService, viewModel, configurationService) {
        super();
        this.instantiationService = instantiationService;
        this.viewModel = viewModel;
        this.configurationService = configurationService;
    }
    getEditorContributions() {
        return undefined;
    }
}
export function createSelectionsAutorun(codeEditorView, translateRange) {
    const selections = derived('selections', reader => {
        const viewModel = codeEditorView.viewModel.read(reader);
        if (!viewModel) {
            return [];
        }
        const baseRange = viewModel.selectionInBase.read(reader);
        if (!baseRange || baseRange.sourceEditor === codeEditorView) {
            return [];
        }
        return baseRange.rangesInBase.map(r => translateRange(r, viewModel));
    });
    return autorun('set selections', (reader) => {
        const ranges = selections.read(reader);
        if (ranges.length === 0) {
            return;
        }
        codeEditorView.editor.setSelections(ranges.map(r => new Selection(r.startLineNumber, r.startColumn, r.endLineNumber, r.endColumn)));
    });
}
let TitleMenu = class TitleMenu extends Disposable {
    constructor(menuId, targetHtmlElement, instantiationService) {
        super();
        const toolbar = instantiationService.createInstance(MenuWorkbenchToolBar, targetHtmlElement, menuId, {
            menuOptions: { renderShortTitle: true },
            toolbarOptions: { primaryGroup: () => false }
        });
        this._store.add(toolbar);
    }
};
TitleMenu = __decorate([
    __param(2, IInstantiationService)
], TitleMenu);
export { TitleMenu };
