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
import { $, append, EventHelper, clearNode } from 'vs/base/browser/dom';
import { DomEmitter } from 'vs/base/browser/event';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { EventType as TouchEventType, Gesture } from 'vs/base/browser/touch';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { textLinkActiveForeground, textLinkForeground } from 'vs/platform/theme/common/colorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
let Link = class Link extends Disposable {
    _link;
    el;
    _enabled = true;
    get enabled() {
        return this._enabled;
    }
    set enabled(enabled) {
        if (enabled) {
            this.el.setAttribute('aria-disabled', 'false');
            this.el.tabIndex = 0;
            this.el.style.pointerEvents = 'auto';
            this.el.style.opacity = '1';
            this.el.style.cursor = 'pointer';
            this._enabled = false;
        }
        else {
            this.el.setAttribute('aria-disabled', 'true');
            this.el.tabIndex = -1;
            this.el.style.pointerEvents = 'none';
            this.el.style.opacity = '0.4';
            this.el.style.cursor = 'default';
            this._enabled = true;
        }
        this._enabled = enabled;
    }
    set link(link) {
        if (typeof link.label === 'string') {
            this.el.textContent = link.label;
        }
        else {
            clearNode(this.el);
            this.el.appendChild(link.label);
        }
        this.el.href = link.href;
        if (typeof link.tabIndex !== 'undefined') {
            this.el.tabIndex = link.tabIndex;
        }
        if (typeof link.title !== 'undefined') {
            this.el.title = link.title;
        }
        this._link = link;
    }
    constructor(container, _link, options = {}, openerService) {
        super();
        this._link = _link;
        this.el = append(container, $('a.monaco-link', {
            tabIndex: _link.tabIndex ?? 0,
            href: _link.href,
            title: _link.title
        }, _link.label));
        this.el.setAttribute('role', 'button');
        const onClickEmitter = this._register(new DomEmitter(this.el, 'click'));
        const onKeyPress = this._register(new DomEmitter(this.el, 'keypress'));
        const onEnterPress = Event.chain(onKeyPress.event)
            .map(e => new StandardKeyboardEvent(e))
            .filter(e => e.keyCode === 3 /* KeyCode.Enter */)
            .event;
        const onTap = this._register(new DomEmitter(this.el, TouchEventType.Tap)).event;
        this._register(Gesture.addTarget(this.el));
        const onOpen = Event.any(onClickEmitter.event, onEnterPress, onTap);
        this._register(onOpen(e => {
            if (!this.enabled) {
                return;
            }
            EventHelper.stop(e, true);
            if (options?.opener) {
                options.opener(this._link.href);
            }
            else {
                openerService.open(this._link.href, { allowCommands: true });
            }
        }));
        this.enabled = true;
    }
};
Link = __decorate([
    __param(3, IOpenerService)
], Link);
export { Link };
registerThemingParticipant((theme, collector) => {
    const textLinkForegroundColor = theme.getColor(textLinkForeground);
    if (textLinkForegroundColor) {
        collector.addRule(`.monaco-link { color: ${textLinkForegroundColor}; }`);
    }
    const textLinkActiveForegroundColor = theme.getColor(textLinkActiveForeground);
    if (textLinkActiveForegroundColor) {
        collector.addRule(`.monaco-link:hover { color: ${textLinkActiveForegroundColor}; }`);
    }
});
