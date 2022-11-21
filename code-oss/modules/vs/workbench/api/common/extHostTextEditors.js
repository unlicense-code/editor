/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as arrays from 'vs/base/common/arrays';
import { Emitter } from 'vs/base/common/event';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { TextEditorDecorationType } from 'vs/workbench/api/common/extHostTextEditor';
import * as TypeConverters from 'vs/workbench/api/common/extHostTypeConverters';
import { TextEditorSelectionChangeKind } from 'vs/workbench/api/common/extHostTypes';
export class ExtHostEditors {
    _extHostDocumentsAndEditors;
    _onDidChangeTextEditorSelection = new Emitter();
    _onDidChangeTextEditorOptions = new Emitter();
    _onDidChangeTextEditorVisibleRanges = new Emitter();
    _onDidChangeTextEditorViewColumn = new Emitter();
    _onDidChangeActiveTextEditor = new Emitter();
    _onDidChangeVisibleTextEditors = new Emitter();
    onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
    onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
    onDidChangeTextEditorVisibleRanges = this._onDidChangeTextEditorVisibleRanges.event;
    onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
    onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
    onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
    _proxy;
    constructor(mainContext, _extHostDocumentsAndEditors) {
        this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
        this._proxy = mainContext.getProxy(MainContext.MainThreadTextEditors);
        this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors(e => this._onDidChangeVisibleTextEditors.fire(e));
        this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(e => this._onDidChangeActiveTextEditor.fire(e));
    }
    getActiveTextEditor() {
        return this._extHostDocumentsAndEditors.activeEditor();
    }
    getVisibleTextEditors(internal) {
        const editors = this._extHostDocumentsAndEditors.allEditors();
        return internal
            ? editors
            : editors.map(editor => editor.value);
    }
    async showTextDocument(document, columnOrOptions, preserveFocus) {
        let options;
        if (typeof columnOrOptions === 'number') {
            options = {
                position: TypeConverters.ViewColumn.from(columnOrOptions),
                preserveFocus
            };
        }
        else if (typeof columnOrOptions === 'object') {
            options = {
                position: TypeConverters.ViewColumn.from(columnOrOptions.viewColumn),
                preserveFocus: columnOrOptions.preserveFocus,
                selection: typeof columnOrOptions.selection === 'object' ? TypeConverters.Range.from(columnOrOptions.selection) : undefined,
                pinned: typeof columnOrOptions.preview === 'boolean' ? !columnOrOptions.preview : undefined
            };
        }
        else {
            options = {
                preserveFocus: false
            };
        }
        const editorId = await this._proxy.$tryShowTextDocument(document.uri, options);
        const editor = editorId && this._extHostDocumentsAndEditors.getEditor(editorId);
        if (editor) {
            return editor.value;
        }
        // we have no editor... having an id means that we had an editor
        // on the main side and that it isn't the current editor anymore...
        if (editorId) {
            throw new Error(`Could NOT open editor for "${document.uri.toString()}" because another editor opened in the meantime.`);
        }
        else {
            throw new Error(`Could NOT open editor for "${document.uri.toString()}".`);
        }
    }
    createTextEditorDecorationType(extension, options) {
        return new TextEditorDecorationType(this._proxy, extension, options).value;
    }
    // --- called from main thread
    $acceptEditorPropertiesChanged(id, data) {
        const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
        if (!textEditor) {
            throw new Error('unknown text editor');
        }
        // (1) set all properties
        if (data.options) {
            textEditor._acceptOptions(data.options);
        }
        if (data.selections) {
            const selections = data.selections.selections.map(TypeConverters.Selection.to);
            textEditor._acceptSelections(selections);
        }
        if (data.visibleRanges) {
            const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
            textEditor._acceptVisibleRanges(visibleRanges);
        }
        // (2) fire change events
        if (data.options) {
            this._onDidChangeTextEditorOptions.fire({
                textEditor: textEditor.value,
                options: { ...data.options, lineNumbers: TypeConverters.TextEditorLineNumbersStyle.to(data.options.lineNumbers) }
            });
        }
        if (data.selections) {
            const kind = TextEditorSelectionChangeKind.fromValue(data.selections.source);
            const selections = data.selections.selections.map(TypeConverters.Selection.to);
            this._onDidChangeTextEditorSelection.fire({
                textEditor: textEditor.value,
                selections,
                kind
            });
        }
        if (data.visibleRanges) {
            const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
            this._onDidChangeTextEditorVisibleRanges.fire({
                textEditor: textEditor.value,
                visibleRanges
            });
        }
    }
    $acceptEditorPositionData(data) {
        for (const id in data) {
            const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
            if (!textEditor) {
                throw new Error('Unknown text editor');
            }
            const viewColumn = TypeConverters.ViewColumn.to(data[id]);
            if (textEditor.value.viewColumn !== viewColumn) {
                textEditor._acceptViewColumn(viewColumn);
                this._onDidChangeTextEditorViewColumn.fire({ textEditor: textEditor.value, viewColumn });
            }
        }
    }
    getDiffInformation(id) {
        return Promise.resolve(this._proxy.$getDiffInformation(id));
    }
}
