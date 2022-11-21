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
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
let WordContextKey = class WordContextKey {
    _editor;
    static AtEnd = new RawContextKey('atEndOfWord', false);
    _ckAtEnd;
    _configListener;
    _enabled = false;
    _selectionListener;
    constructor(_editor, contextKeyService) {
        this._editor = _editor;
        this._ckAtEnd = WordContextKey.AtEnd.bindTo(contextKeyService);
        this._configListener = this._editor.onDidChangeConfiguration(e => e.hasChanged(113 /* EditorOption.tabCompletion */) && this._update());
        this._update();
    }
    dispose() {
        this._configListener.dispose();
        this._selectionListener?.dispose();
        this._ckAtEnd.reset();
    }
    _update() {
        // only update this when tab completions are enabled
        const enabled = this._editor.getOption(113 /* EditorOption.tabCompletion */) === 'on';
        if (this._enabled === enabled) {
            return;
        }
        this._enabled = enabled;
        if (this._enabled) {
            const checkForWordEnd = () => {
                if (!this._editor.hasModel()) {
                    this._ckAtEnd.set(false);
                    return;
                }
                const model = this._editor.getModel();
                const selection = this._editor.getSelection();
                const word = model.getWordAtPosition(selection.getStartPosition());
                if (!word) {
                    this._ckAtEnd.set(false);
                    return;
                }
                this._ckAtEnd.set(word.endColumn === selection.getStartPosition().column);
            };
            this._selectionListener = this._editor.onDidChangeCursorSelection(checkForWordEnd);
            checkForWordEnd();
        }
        else if (this._selectionListener) {
            this._ckAtEnd.reset();
            this._selectionListener.dispose();
            this._selectionListener = undefined;
        }
    }
};
WordContextKey = __decorate([
    __param(1, IContextKeyService)
], WordContextKey);
export { WordContextKey };
