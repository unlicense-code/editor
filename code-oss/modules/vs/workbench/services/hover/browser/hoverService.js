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
import 'vs/css!./media/hover';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { editorHoverBackground, editorHoverBorder, textLinkForeground, editorHoverForeground, editorHoverStatusBarBackground, textCodeBlockBackground, widgetShadow, textLinkActiveForeground, focusBorder, toolbarHoverBackground } from 'vs/platform/theme/common/colorRegistry';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { HoverWidget } from 'vs/workbench/services/hover/browser/hoverWidget';
import { DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import { addDisposableListener, EventType } from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
let HoverService = class HoverService {
    _instantiationService;
    _contextViewService;
    _keybindingService;
    _currentHoverOptions;
    _currentHover;
    constructor(_instantiationService, _contextViewService, contextMenuService, _keybindingService) {
        this._instantiationService = _instantiationService;
        this._contextViewService = _contextViewService;
        this._keybindingService = _keybindingService;
        contextMenuService.onDidShowContextMenu(() => this.hideHover());
    }
    showHover(options, focus) {
        if (this._currentHoverOptions === options) {
            return undefined;
        }
        this._currentHoverOptions = options;
        const hoverDisposables = new DisposableStore();
        const hover = this._instantiationService.createInstance(HoverWidget, options);
        hover.onDispose(() => {
            // Only clear the current options if it's the current hover, the current options help
            // reduce flickering when the same hover is shown multiple times
            if (this._currentHoverOptions === options) {
                this._currentHoverOptions = undefined;
            }
            hoverDisposables.dispose();
        });
        const provider = this._contextViewService;
        provider.showContextView(new HoverContextViewDelegate(hover, focus));
        hover.onRequestLayout(() => provider.layout());
        if ('targetElements' in options.target) {
            for (const element of options.target.targetElements) {
                hoverDisposables.add(addDisposableListener(element, EventType.CLICK, () => this.hideHover()));
            }
        }
        else {
            hoverDisposables.add(addDisposableListener(options.target, EventType.CLICK, () => this.hideHover()));
        }
        const focusedElement = document.activeElement;
        if (focusedElement) {
            hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_DOWN, e => this._keyDown(e, hover)));
            hoverDisposables.add(addDisposableListener(document, EventType.KEY_DOWN, e => this._keyDown(e, hover)));
            hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_UP, e => this._keyUp(e, hover)));
            hoverDisposables.add(addDisposableListener(document, EventType.KEY_UP, e => this._keyUp(e, hover)));
        }
        if (options.hideOnKeyDown) {
            const focusedElement = document.activeElement;
            if (focusedElement) {
                hoverDisposables.add(addDisposableListener(focusedElement, EventType.KEY_DOWN, () => this.hideHover()));
            }
        }
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(e => this._intersectionChange(e, hover), { threshold: 0 });
            const firstTargetElement = 'targetElements' in options.target ? options.target.targetElements[0] : options.target;
            observer.observe(firstTargetElement);
            hoverDisposables.add(toDisposable(() => observer.disconnect()));
        }
        this._currentHover = hover;
        return hover;
    }
    hideHover() {
        if (this._currentHover?.isLocked || !this._currentHoverOptions) {
            return;
        }
        this._currentHover = undefined;
        this._currentHoverOptions = undefined;
        this._contextViewService.hideContextView();
    }
    _intersectionChange(entries, hover) {
        const entry = entries[entries.length - 1];
        if (!entry.isIntersecting) {
            hover.dispose();
        }
    }
    _keyDown(e, hover) {
        if (e.key === 'Alt') {
            hover.isLocked = true;
            return;
        }
        const event = new StandardKeyboardEvent(e);
        const keybinding = this._keybindingService.resolveKeyboardEvent(event);
        if (keybinding.getSingleModifierDispatchParts().some(value => !!value) || this._keybindingService.softDispatch(event, event.target)) {
            return;
        }
        this.hideHover();
    }
    _keyUp(e, hover) {
        if (e.key === 'Alt') {
            hover.isLocked = false;
            // Hide if alt is released while the mouse os not over hover/target
            if (!hover.isMouseIn) {
                this.hideHover();
            }
        }
    }
};
HoverService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IContextViewService),
    __param(2, IContextMenuService),
    __param(3, IKeybindingService)
], HoverService);
export { HoverService };
class HoverContextViewDelegate {
    _hover;
    _focus;
    get anchorPosition() {
        return this._hover.anchor;
    }
    constructor(_hover, _focus = false) {
        this._hover = _hover;
        this._focus = _focus;
    }
    render(container) {
        this._hover.render(container);
        if (this._focus) {
            this._hover.focus();
        }
        return this._hover;
    }
    getAnchor() {
        return {
            x: this._hover.x,
            y: this._hover.y
        };
    }
    layout() {
        this._hover.layout();
    }
}
registerSingleton(IHoverService, HoverService, 1 /* InstantiationType.Delayed */);
registerThemingParticipant((theme, collector) => {
    const hoverBackground = theme.getColor(editorHoverBackground);
    if (hoverBackground) {
        collector.addRule(`.monaco-workbench .workbench-hover { background-color: ${hoverBackground}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover-pointer:after { background-color: ${hoverBackground}; }`);
    }
    const hoverBorder = theme.getColor(editorHoverBorder);
    if (hoverBorder) {
        collector.addRule(`.monaco-workbench .workbench-hover { border: 1px solid ${hoverBorder}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover-container.locked .workbench-hover { outline: 1px solid ${hoverBorder}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover hr { border-bottom: 0px solid ${hoverBorder.transparent(0.5)}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover-pointer:after { border-right: 1px solid ${hoverBorder}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover-pointer:after { border-bottom: 1px solid ${hoverBorder}; }`);
    }
    const focus = theme.getColor(focusBorder);
    if (focus) {
        collector.addRule(`.monaco-workbench .workbench-hover-container.locked .workbench-hover:focus { outline-color: ${focus}; }`);
        collector.addRule(`.monaco-workbench .workbench-hover-lock:focus { outline: 1px solid ${focus}; }`);
    }
    const toolbarHoverBackgroundColor = theme.getColor(toolbarHoverBackground);
    if (toolbarHoverBackgroundColor) {
        collector.addRule(`.monaco-workbench .workbench-hover-container.locked .workbench-hover-lock:hover { background-color: ${toolbarHoverBackgroundColor}; }`);
    }
    const link = theme.getColor(textLinkForeground);
    if (link) {
        collector.addRule(`.monaco-workbench .workbench-hover a { color: ${link}; }`);
    }
    const linkHover = theme.getColor(textLinkActiveForeground);
    if (linkHover) {
        collector.addRule(`.monaco-workbench .workbench-hover a:hover { color: ${linkHover}; }`);
    }
    const hoverForeground = theme.getColor(editorHoverForeground);
    if (hoverForeground) {
        collector.addRule(`.monaco-workbench .workbench-hover { color: ${hoverForeground}; }`);
    }
    const actionsBackground = theme.getColor(editorHoverStatusBarBackground);
    if (actionsBackground) {
        collector.addRule(`.monaco-workbench .workbench-hover .hover-row .actions { background-color: ${actionsBackground}; }`);
    }
    const codeBackground = theme.getColor(textCodeBlockBackground);
    if (codeBackground) {
        collector.addRule(`.monaco-workbench .workbench-hover code { background-color: ${codeBackground}; }`);
    }
});
registerThemingParticipant((theme, collector) => {
    const widgetShadowColor = theme.getColor(widgetShadow);
    if (widgetShadowColor) {
        collector.addRule(`.monaco-workbench .workbench-hover { box-shadow: 0 2px 8px ${widgetShadowColor}; }`);
    }
});
