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
import { DisposableStore } from 'vs/base/common/lifecycle';
import * as dom from 'vs/base/browser/dom';
import { RunOnceScheduler } from 'vs/base/common/async';
import { convertBufferRangeToViewport } from 'vs/workbench/contrib/terminal/browser/links/terminalLinkHelpers';
import { isMacintosh } from 'vs/base/common/platform';
import { localize } from 'vs/nls';
import { Emitter } from 'vs/base/common/event';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export const OPEN_FILE_LABEL = localize('openFile', 'Open file in editor');
export const FOLDER_IN_WORKSPACE_LABEL = localize('focusFolder', 'Focus folder in explorer');
export const FOLDER_NOT_IN_WORKSPACE_LABEL = localize('openFolder', 'Open folder in new window');
let TerminalLink = class TerminalLink extends DisposableStore {
    _xterm;
    range;
    text;
    actions;
    _viewportY;
    _activateCallback;
    _tooltipCallback;
    _isHighConfidenceLink;
    label;
    _type;
    _configurationService;
    decorations;
    asyncActivate;
    _tooltipScheduler;
    _hoverListeners;
    _onInvalidated = new Emitter();
    get onInvalidated() { return this._onInvalidated.event; }
    get type() { return this._type; }
    constructor(_xterm, range, text, actions, _viewportY, _activateCallback, _tooltipCallback, _isHighConfidenceLink, label, _type, _configurationService) {
        super();
        this._xterm = _xterm;
        this.range = range;
        this.text = text;
        this.actions = actions;
        this._viewportY = _viewportY;
        this._activateCallback = _activateCallback;
        this._tooltipCallback = _tooltipCallback;
        this._isHighConfidenceLink = _isHighConfidenceLink;
        this.label = label;
        this._type = _type;
        this._configurationService = _configurationService;
        this.decorations = {
            pointerCursor: false,
            underline: this._isHighConfidenceLink
        };
    }
    dispose() {
        super.dispose();
        this._hoverListeners?.dispose();
        this._hoverListeners = undefined;
        this._tooltipScheduler?.dispose();
        this._tooltipScheduler = undefined;
    }
    activate(event, text) {
        // Trigger the xterm.js callback synchronously but track the promise resolution so we can
        // use it in tests
        this.asyncActivate = this._activateCallback(event, text);
    }
    hover(event, text) {
        // Listen for modifier before handing it off to the hover to handle so it gets disposed correctly
        this._hoverListeners = new DisposableStore();
        this._hoverListeners.add(dom.addDisposableListener(document, 'keydown', e => {
            if (!e.repeat && this._isModifierDown(e)) {
                this._enableDecorations();
            }
        }));
        this._hoverListeners.add(dom.addDisposableListener(document, 'keyup', e => {
            if (!e.repeat && !this._isModifierDown(e)) {
                this._disableDecorations();
            }
        }));
        // Listen for when the terminal renders on the same line as the link
        this._hoverListeners.add(this._xterm.onRender(e => {
            const viewportRangeY = this.range.start.y - this._viewportY;
            if (viewportRangeY >= e.start && viewportRangeY <= e.end) {
                this._onInvalidated.fire();
            }
        }));
        // Only show the tooltip and highlight for high confidence links (not word/search workspace
        // links). Feedback was that this makes using the terminal overly noisy.
        if (this._isHighConfidenceLink) {
            this._tooltipScheduler = new RunOnceScheduler(() => {
                this._tooltipCallback(this, convertBufferRangeToViewport(this.range, this._viewportY), this._isHighConfidenceLink ? () => this._enableDecorations() : undefined, this._isHighConfidenceLink ? () => this._disableDecorations() : undefined);
                // Clear out scheduler until next hover event
                this._tooltipScheduler?.dispose();
                this._tooltipScheduler = undefined;
            }, this._configurationService.getValue('workbench.hover.delay'));
            this.add(this._tooltipScheduler);
            this._tooltipScheduler.schedule();
        }
        const origin = { x: event.pageX, y: event.pageY };
        this._hoverListeners.add(dom.addDisposableListener(document, dom.EventType.MOUSE_MOVE, e => {
            // Update decorations
            if (this._isModifierDown(e)) {
                this._enableDecorations();
            }
            else {
                this._disableDecorations();
            }
            // Reset the scheduler if the mouse moves too much
            if (Math.abs(e.pageX - origin.x) > window.devicePixelRatio * 2 || Math.abs(e.pageY - origin.y) > window.devicePixelRatio * 2) {
                origin.x = e.pageX;
                origin.y = e.pageY;
                this._tooltipScheduler?.schedule();
            }
        }));
    }
    leave() {
        this._hoverListeners?.dispose();
        this._hoverListeners = undefined;
        this._tooltipScheduler?.dispose();
        this._tooltipScheduler = undefined;
    }
    _enableDecorations() {
        if (!this.decorations.pointerCursor) {
            this.decorations.pointerCursor = true;
        }
        if (!this.decorations.underline) {
            this.decorations.underline = true;
        }
    }
    _disableDecorations() {
        if (this.decorations.pointerCursor) {
            this.decorations.pointerCursor = false;
        }
        if (this.decorations.underline !== this._isHighConfidenceLink) {
            this.decorations.underline = this._isHighConfidenceLink;
        }
    }
    _isModifierDown(event) {
        const multiCursorModifier = this._configurationService.getValue('editor.multiCursorModifier');
        if (multiCursorModifier === 'ctrlCmd') {
            return !!event.altKey;
        }
        return isMacintosh ? event.metaKey : event.ctrlKey;
    }
};
TerminalLink = __decorate([
    __param(10, IConfigurationService)
], TerminalLink);
export { TerminalLink };
