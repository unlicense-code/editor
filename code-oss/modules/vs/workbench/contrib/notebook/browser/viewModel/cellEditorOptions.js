/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { deepClone } from 'vs/base/common/objects';
export class BaseCellEditorOptions extends Disposable {
    notebookEditor;
    notebookOptions;
    configurationService;
    language;
    static fixedEditorOptions = {
        scrollBeyondLastLine: false,
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
        },
        renderLineHighlightOnlyWhenFocus: true,
        overviewRulerLanes: 0,
        lineNumbers: 'off',
        lineDecorationsWidth: 0,
        folding: true,
        fixedOverflowWidgets: true,
        minimap: { enabled: false },
        renderValidationDecorations: 'on',
        lineNumbersMinChars: 3
    };
    _localDisposableStore = this._register(new DisposableStore());
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    _value;
    get value() {
        return this._value;
    }
    constructor(notebookEditor, notebookOptions, configurationService, language) {
        super();
        this.notebookEditor = notebookEditor;
        this.notebookOptions = notebookOptions;
        this.configurationService = configurationService;
        this.language = language;
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                this._recomputeOptions();
            }
        }));
        this._register(notebookOptions.onDidChangeOptions(e => {
            if (e.cellStatusBarVisibility || e.editorTopPadding || e.editorOptionsCustomizations) {
                this._recomputeOptions();
            }
        }));
        this._register(this.notebookEditor.onDidChangeModel(() => {
            this._localDisposableStore.clear();
            if (this.notebookEditor.hasModel()) {
                this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
                    this._recomputeOptions();
                }));
                this._recomputeOptions();
            }
        }));
        if (this.notebookEditor.hasModel()) {
            this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
                this._recomputeOptions();
            }));
        }
        this._value = this._computeEditorOptions();
    }
    _recomputeOptions() {
        this._value = this._computeEditorOptions();
        this._onDidChange.fire();
    }
    _computeEditorOptions() {
        const editorOptions = deepClone(this.configurationService.getValue('editor', { overrideIdentifier: this.language }));
        const layoutConfig = this.notebookOptions.getLayoutConfiguration();
        const editorOptionsOverrideRaw = layoutConfig.editorOptionsCustomizations ?? {};
        const editorOptionsOverride = {};
        for (const key in editorOptionsOverrideRaw) {
            if (key.indexOf('editor.') === 0) {
                editorOptionsOverride[key.substring(7)] = editorOptionsOverrideRaw[key];
            }
        }
        const computed = Object.freeze({
            ...editorOptions,
            ...BaseCellEditorOptions.fixedEditorOptions,
            ...editorOptionsOverride,
            ...{ padding: { top: 12, bottom: 12 } },
            readOnly: this.notebookEditor.isReadOnly
        });
        return computed;
    }
}
