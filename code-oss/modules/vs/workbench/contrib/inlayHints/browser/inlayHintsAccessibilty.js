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
import * as dom from 'vs/base/browser/dom';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { EditorAction2, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { asCommandLink } from 'vs/editor/contrib/inlayHints/browser/inlayHints';
import { InlayHintsController } from 'vs/editor/contrib/inlayHints/browser/inlayHintsController';
import { localize } from 'vs/nls';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { AudioCue, IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Link } from 'vs/platform/opener/browser/link';
let InlayHintsAccessibility = class InlayHintsAccessibility {
    _editor;
    _audioCueService;
    _instaService;
    static IsReading = new RawContextKey('isReadingLineWithInlayHints', false, { type: 'boolean', description: localize('isReadingLineWithInlayHints', "Whether the current line and its inlay hints are currently focused") });
    static ID = 'editor.contrib.InlayHintsAccessibility';
    static get(editor) {
        return editor.getContribution(InlayHintsAccessibility.ID) ?? undefined;
    }
    _ariaElement;
    _ctxIsReading;
    _sessionDispoosables = new DisposableStore();
    constructor(_editor, contextKeyService, _audioCueService, _instaService) {
        this._editor = _editor;
        this._audioCueService = _audioCueService;
        this._instaService = _instaService;
        this._ariaElement = document.createElement('span');
        this._ariaElement.style.position = 'fixed';
        this._ariaElement.className = 'inlayhint-accessibility-element';
        this._ariaElement.tabIndex = 0;
        this._ariaElement.setAttribute('aria-description', localize('description', "Code with Inlay Hint Information"));
        this._ctxIsReading = InlayHintsAccessibility.IsReading.bindTo(contextKeyService);
    }
    dispose() {
        this._sessionDispoosables.dispose();
        this._ctxIsReading.reset();
        this._ariaElement.remove();
    }
    _reset() {
        dom.clearNode(this._ariaElement);
        this._sessionDispoosables.clear();
        this._ctxIsReading.reset();
    }
    async _read(line, hints) {
        this._sessionDispoosables.clear();
        if (!this._ariaElement.isConnected) {
            this._editor.getDomNode()?.appendChild(this._ariaElement);
        }
        if (!this._editor.hasModel() || !this._ariaElement.isConnected) {
            this._ctxIsReading.set(false);
            return;
        }
        const cts = new CancellationTokenSource();
        this._sessionDispoosables.add(cts);
        for (const hint of hints) {
            await hint.resolve(cts.token);
        }
        if (cts.token.isCancellationRequested) {
            return;
        }
        const model = this._editor.getModel();
        // const text = this._editor.getModel().getLineContent(line);
        const newChildren = [];
        let start = 0;
        let tooLongToRead = false;
        for (const item of hints) {
            // text
            const part = model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: item.hint.position.column });
            if (part.length > 0) {
                newChildren.push(part);
                start = item.hint.position.column - 1;
            }
            // check length
            if (start > 750) {
                newChildren.push('…');
                tooLongToRead = true;
                break;
            }
            // hint
            const em = document.createElement('em');
            const { label } = item.hint;
            if (typeof label === 'string') {
                em.innerText = label;
            }
            else {
                for (const part of label) {
                    if (part.command) {
                        const link = this._instaService.createInstance(Link, em, { href: asCommandLink(part.command), label: part.label, title: part.command.title }, undefined);
                        this._sessionDispoosables.add(link);
                    }
                    else {
                        em.innerText += part.label;
                    }
                }
            }
            newChildren.push(em);
        }
        // trailing text
        if (!tooLongToRead) {
            newChildren.push(model.getValueInRange({ startLineNumber: line, startColumn: start + 1, endLineNumber: line, endColumn: Number.MAX_SAFE_INTEGER }));
        }
        dom.reset(this._ariaElement, ...newChildren);
        this._ariaElement.focus();
        this._ctxIsReading.set(true);
        // reset on blur
        this._sessionDispoosables.add(dom.addDisposableListener(this._ariaElement, 'focusout', () => {
            this._reset();
        }));
    }
    startInlayHintsReading() {
        if (!this._editor.hasModel()) {
            return;
        }
        const line = this._editor.getPosition().lineNumber;
        const hints = InlayHintsController.get(this._editor)?.getInlayHintsForLine(line);
        if (!hints || hints.length === 0) {
            this._audioCueService.playAudioCue(AudioCue.noInlayHints);
        }
        else {
            this._read(line, hints);
        }
    }
    stopInlayHintsReading() {
        this._reset();
        this._editor.focus();
    }
};
InlayHintsAccessibility = __decorate([
    __param(1, IContextKeyService),
    __param(2, IAudioCueService),
    __param(3, IInstantiationService)
], InlayHintsAccessibility);
export { InlayHintsAccessibility };
registerAction2(class StartReadHints extends EditorAction2 {
    constructor() {
        super({
            id: 'inlayHints.startReadingLineWithHint',
            title: {
                value: localize('read.title', 'Read Line With Inline Hints'),
                original: 'Read Line With Inline Hints'
            },
            precondition: EditorContextKeys.hasInlayHintsProvider,
            f1: true
        });
    }
    runEditorCommand(_accessor, editor) {
        const ctrl = InlayHintsAccessibility.get(editor);
        ctrl?.startInlayHintsReading();
    }
});
registerAction2(class StopReadHints extends EditorAction2 {
    constructor() {
        super({
            id: 'inlayHints.stopReadingLineWithHint',
            title: {
                value: localize('stop.title', 'Stop Inlay Hints Reading'),
                original: 'Stop Inlay Hints Reading'
            },
            precondition: InlayHintsAccessibility.IsReading,
            f1: true,
            keybinding: {
                weight: 100 /* KeybindingWeight.EditorContrib */,
                primary: 9 /* KeyCode.Escape */
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        const ctrl = InlayHintsAccessibility.get(editor);
        ctrl?.stopInlayHintsReading();
    }
});
registerEditorContribution(InlayHintsAccessibility.ID, InlayHintsAccessibility);
