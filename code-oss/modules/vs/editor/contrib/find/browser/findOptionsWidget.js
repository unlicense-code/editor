/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import 'vs/css!./findOptionsWidget';
import { CaseSensitiveToggle, RegexToggle, WholeWordsToggle } from 'vs/base/browser/ui/findinput/findInputToggles';
import { Widget } from 'vs/base/browser/ui/widget';
import { RunOnceScheduler } from 'vs/base/common/async';
import { FIND_IDS } from 'vs/editor/contrib/find/browser/findModel';
import { inputActiveOptionBackground, inputActiveOptionBorder, inputActiveOptionForeground } from 'vs/platform/theme/common/colorRegistry';
export class FindOptionsWidget extends Widget {
    static ID = 'editor.contrib.findOptionsWidget';
    _editor;
    _state;
    _keybindingService;
    _domNode;
    regex;
    wholeWords;
    caseSensitive;
    constructor(editor, state, keybindingService, themeService) {
        super();
        this._editor = editor;
        this._state = state;
        this._keybindingService = keybindingService;
        this._domNode = document.createElement('div');
        this._domNode.className = 'findOptionsWidget';
        this._domNode.style.display = 'none';
        this._domNode.style.top = '10px';
        this._domNode.style.zIndex = '12';
        this._domNode.setAttribute('role', 'presentation');
        this._domNode.setAttribute('aria-hidden', 'true');
        const inputActiveOptionBorderColor = themeService.getColorTheme().getColor(inputActiveOptionBorder);
        const inputActiveOptionForegroundColor = themeService.getColorTheme().getColor(inputActiveOptionForeground);
        const inputActiveOptionBackgroundColor = themeService.getColorTheme().getColor(inputActiveOptionBackground);
        this.caseSensitive = this._register(new CaseSensitiveToggle({
            appendTitle: this._keybindingLabelFor(FIND_IDS.ToggleCaseSensitiveCommand),
            isChecked: this._state.matchCase,
            inputActiveOptionBorder: inputActiveOptionBorderColor,
            inputActiveOptionForeground: inputActiveOptionForegroundColor,
            inputActiveOptionBackground: inputActiveOptionBackgroundColor
        }));
        this._domNode.appendChild(this.caseSensitive.domNode);
        this._register(this.caseSensitive.onChange(() => {
            this._state.change({
                matchCase: this.caseSensitive.checked
            }, false);
        }));
        this.wholeWords = this._register(new WholeWordsToggle({
            appendTitle: this._keybindingLabelFor(FIND_IDS.ToggleWholeWordCommand),
            isChecked: this._state.wholeWord,
            inputActiveOptionBorder: inputActiveOptionBorderColor,
            inputActiveOptionForeground: inputActiveOptionForegroundColor,
            inputActiveOptionBackground: inputActiveOptionBackgroundColor
        }));
        this._domNode.appendChild(this.wholeWords.domNode);
        this._register(this.wholeWords.onChange(() => {
            this._state.change({
                wholeWord: this.wholeWords.checked
            }, false);
        }));
        this.regex = this._register(new RegexToggle({
            appendTitle: this._keybindingLabelFor(FIND_IDS.ToggleRegexCommand),
            isChecked: this._state.isRegex,
            inputActiveOptionBorder: inputActiveOptionBorderColor,
            inputActiveOptionForeground: inputActiveOptionForegroundColor,
            inputActiveOptionBackground: inputActiveOptionBackgroundColor
        }));
        this._domNode.appendChild(this.regex.domNode);
        this._register(this.regex.onChange(() => {
            this._state.change({
                isRegex: this.regex.checked
            }, false);
        }));
        this._editor.addOverlayWidget(this);
        this._register(this._state.onFindReplaceStateChange((e) => {
            let somethingChanged = false;
            if (e.isRegex) {
                this.regex.checked = this._state.isRegex;
                somethingChanged = true;
            }
            if (e.wholeWord) {
                this.wholeWords.checked = this._state.wholeWord;
                somethingChanged = true;
            }
            if (e.matchCase) {
                this.caseSensitive.checked = this._state.matchCase;
                somethingChanged = true;
            }
            if (!this._state.isRevealed && somethingChanged) {
                this._revealTemporarily();
            }
        }));
        this._register(dom.addDisposableListener(this._domNode, dom.EventType.MOUSE_LEAVE, (e) => this._onMouseLeave()));
        this._register(dom.addDisposableListener(this._domNode, 'mouseover', (e) => this._onMouseOver()));
        this._applyTheme(themeService.getColorTheme());
        this._register(themeService.onDidColorThemeChange(this._applyTheme.bind(this)));
    }
    _keybindingLabelFor(actionId) {
        const kb = this._keybindingService.lookupKeybinding(actionId);
        if (!kb) {
            return '';
        }
        return ` (${kb.getLabel()})`;
    }
    dispose() {
        this._editor.removeOverlayWidget(this);
        super.dispose();
    }
    // ----- IOverlayWidget API
    getId() {
        return FindOptionsWidget.ID;
    }
    getDomNode() {
        return this._domNode;
    }
    getPosition() {
        return {
            preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
        };
    }
    highlightFindOptions() {
        this._revealTemporarily();
    }
    _hideSoon = this._register(new RunOnceScheduler(() => this._hide(), 2000));
    _revealTemporarily() {
        this._show();
        this._hideSoon.schedule();
    }
    _onMouseLeave() {
        this._hideSoon.schedule();
    }
    _onMouseOver() {
        this._hideSoon.cancel();
    }
    _isVisible = false;
    _show() {
        if (this._isVisible) {
            return;
        }
        this._isVisible = true;
        this._domNode.style.display = 'block';
    }
    _hide() {
        if (!this._isVisible) {
            return;
        }
        this._isVisible = false;
        this._domNode.style.display = 'none';
    }
    _applyTheme(theme) {
        const inputStyles = {
            inputActiveOptionBorder: theme.getColor(inputActiveOptionBorder),
            inputActiveOptionForeground: theme.getColor(inputActiveOptionForeground),
            inputActiveOptionBackground: theme.getColor(inputActiveOptionBackground)
        };
        this.caseSensitive.style(inputStyles);
        this.wholeWords.style(inputStyles);
        this.regex.style(inputStyles);
    }
}
