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
import { Emitter } from 'vs/base/common/event';
import * as dom from 'vs/base/browser/dom';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { EDITOR_FONT_DEFAULTS } from 'vs/editor/common/config/editorOptions';
import { HoverAction, HoverWidget as BaseHoverWidget } from 'vs/base/browser/ui/hover/hoverWidget';
import { Widget } from 'vs/base/browser/ui/widget';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MarkdownRenderer, openLinkFromMarkdown } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { isMarkdownString } from 'vs/base/common/htmlContent';
const $ = dom.$;
var Constants;
(function (Constants) {
    Constants[Constants["PointerSize"] = 3] = "PointerSize";
    Constants[Constants["HoverBorderWidth"] = 2] = "HoverBorderWidth";
    Constants[Constants["HoverWindowEdgeMargin"] = 2] = "HoverWindowEdgeMargin";
})(Constants || (Constants = {}));
let HoverWidget = class HoverWidget extends Widget {
    _keybindingService;
    _configurationService;
    _openerService;
    _instantiationService;
    _messageListeners = new DisposableStore();
    _lockMouseTracker;
    _hover;
    _hoverPointer;
    _hoverContainer;
    _target;
    _linkHandler;
    _isDisposed = false;
    _hoverPosition;
    _forcePosition = false;
    _x = 0;
    _y = 0;
    _isLocked = false;
    get isDisposed() { return this._isDisposed; }
    get isMouseIn() { return this._lockMouseTracker.isMouseIn; }
    get domNode() { return this._hover.containerDomNode; }
    _onDispose = this._register(new Emitter());
    get onDispose() { return this._onDispose.event; }
    _onRequestLayout = this._register(new Emitter());
    get onRequestLayout() { return this._onRequestLayout.event; }
    get anchor() { return this._hoverPosition === 2 /* HoverPosition.BELOW */ ? 0 /* AnchorPosition.BELOW */ : 1 /* AnchorPosition.ABOVE */; }
    get x() { return this._x; }
    get y() { return this._y; }
    /**
     * Whether the hover is "locked" by holding the alt/option key. When locked, the hover will not
     * hide and can be hovered regardless of whether the `hideOnHover` hover option is set.
     */
    get isLocked() { return this._isLocked; }
    set isLocked(value) {
        if (this._isLocked === value) {
            return;
        }
        this._isLocked = value;
        this._hoverContainer.classList.toggle('locked', this._isLocked);
    }
    constructor(options, _keybindingService, _configurationService, _openerService, _instantiationService) {
        super();
        this._keybindingService = _keybindingService;
        this._configurationService = _configurationService;
        this._openerService = _openerService;
        this._instantiationService = _instantiationService;
        this._linkHandler = options.linkHandler || (url => {
            return openLinkFromMarkdown(this._openerService, url, isMarkdownString(options.content) ? options.content.isTrusted : undefined);
        });
        this._target = 'targetElements' in options.target ? options.target : new ElementHoverTarget(options.target);
        this._hoverPointer = options.showPointer ? $('div.workbench-hover-pointer') : undefined;
        this._hover = this._register(new BaseHoverWidget());
        this._hover.containerDomNode.classList.add('workbench-hover', 'fadeIn');
        if (options.compact) {
            this._hover.containerDomNode.classList.add('workbench-hover', 'compact');
        }
        if (options.skipFadeInAnimation) {
            this._hover.containerDomNode.classList.add('skip-fade-in');
        }
        if (options.additionalClasses) {
            this._hover.containerDomNode.classList.add(...options.additionalClasses);
        }
        if (options.forcePosition) {
            this._forcePosition = true;
        }
        this._hoverPosition = options.hoverPosition ?? 3 /* HoverPosition.ABOVE */;
        // Don't allow mousedown out of the widget, otherwise preventDefault will call and text will
        // not be selected.
        this.onmousedown(this._hover.containerDomNode, e => e.stopPropagation());
        // Hide hover on escape
        this.onkeydown(this._hover.containerDomNode, e => {
            if (e.equals(9 /* KeyCode.Escape */)) {
                this.dispose();
            }
        });
        const rowElement = $('div.hover-row.markdown-hover');
        const contentsElement = $('div.hover-contents');
        if (typeof options.content === 'string') {
            contentsElement.textContent = options.content;
            contentsElement.style.whiteSpace = 'pre-wrap';
        }
        else if (options.content instanceof HTMLElement) {
            contentsElement.appendChild(options.content);
            contentsElement.classList.add('html-hover-contents');
        }
        else {
            const markdown = options.content;
            const mdRenderer = this._instantiationService.createInstance(MarkdownRenderer, { codeBlockFontFamily: this._configurationService.getValue('editor').fontFamily || EDITOR_FONT_DEFAULTS.fontFamily });
            const { element } = mdRenderer.render(markdown, {
                actionHandler: {
                    callback: (content) => this._linkHandler(content),
                    disposables: this._messageListeners
                },
                asyncRenderCallback: () => {
                    contentsElement.classList.add('code-hover-contents');
                    // This changes the dimensions of the hover so trigger a layout
                    this._onRequestLayout.fire();
                }
            });
            contentsElement.appendChild(element);
        }
        rowElement.appendChild(contentsElement);
        this._hover.contentsDomNode.appendChild(rowElement);
        if (options.actions && options.actions.length > 0) {
            const statusBarElement = $('div.hover-row.status-bar');
            const actionsElement = $('div.actions');
            options.actions.forEach(action => {
                const keybinding = this._keybindingService.lookupKeybinding(action.commandId);
                const keybindingLabel = keybinding ? keybinding.getLabel() : null;
                HoverAction.render(actionsElement, {
                    label: action.label,
                    commandId: action.commandId,
                    run: e => {
                        action.run(e);
                        this.dispose();
                    },
                    iconClass: action.iconClass
                }, keybindingLabel);
            });
            statusBarElement.appendChild(actionsElement);
            this._hover.containerDomNode.appendChild(statusBarElement);
        }
        this._hoverContainer = $('div.workbench-hover-container');
        if (this._hoverPointer) {
            this._hoverContainer.appendChild(this._hoverPointer);
        }
        this._hoverContainer.appendChild(this._hover.containerDomNode);
        let hideOnHover;
        if (options.actions && options.actions.length > 0) {
            // If there are actions, require hover so they can be accessed
            hideOnHover = false;
        }
        else {
            if (options.hideOnHover === undefined) {
                // Defaults to true when string, false when markdown as it may contain links
                hideOnHover = typeof options.content === 'string';
            }
            else {
                // It's set explicitly
                hideOnHover = options.hideOnHover;
            }
        }
        const mouseTrackerTargets = [...this._target.targetElements];
        if (!hideOnHover) {
            mouseTrackerTargets.push(this._hoverContainer);
        }
        const mouseTracker = this._register(new CompositeMouseTracker(mouseTrackerTargets));
        this._register(mouseTracker.onMouseOut(() => {
            if (!this._isLocked) {
                this.dispose();
            }
        }));
        // Setup another mouse tracker when hideOnHover is set in order to track the hover as well
        // when it is locked. This ensures the hover will hide on mouseout after alt has been
        // released to unlock the element.
        if (hideOnHover) {
            const mouseTracker2Targets = [...this._target.targetElements, this._hoverContainer];
            this._lockMouseTracker = this._register(new CompositeMouseTracker(mouseTracker2Targets));
            this._register(this._lockMouseTracker.onMouseOut(() => {
                if (!this._isLocked) {
                    this.dispose();
                }
            }));
        }
        else {
            this._lockMouseTracker = mouseTracker;
        }
    }
    render(container) {
        container.appendChild(this._hoverContainer);
        this.layout();
    }
    layout() {
        this._hover.containerDomNode.classList.remove('right-aligned');
        this._hover.contentsDomNode.style.maxHeight = '';
        const getZoomAccountedBoundingClientRect = (e) => {
            const zoom = dom.getDomNodeZoomLevel(e);
            const boundingRect = e.getBoundingClientRect();
            return {
                top: boundingRect.top * zoom,
                bottom: boundingRect.bottom * zoom,
                right: boundingRect.right * zoom,
                left: boundingRect.left * zoom,
            };
        };
        const targetBounds = this._target.targetElements.map(e => getZoomAccountedBoundingClientRect(e));
        const top = Math.min(...targetBounds.map(e => e.top));
        const right = Math.max(...targetBounds.map(e => e.right));
        const bottom = Math.max(...targetBounds.map(e => e.bottom));
        const left = Math.min(...targetBounds.map(e => e.left));
        const width = right - left;
        const height = bottom - top;
        const targetRect = {
            top, right, bottom, left, width, height,
            center: {
                x: left + (width / 2),
                y: top + (height / 2)
            }
        };
        // These calls adjust the position depending on spacing.
        this.adjustHorizontalHoverPosition(targetRect);
        this.adjustVerticalHoverPosition(targetRect);
        // This call limits the maximum height of the hover.
        this.adjustHoverMaxHeight(targetRect);
        // Offset the hover position if there is a pointer so it aligns with the target element
        this._hoverContainer.style.padding = '';
        this._hoverContainer.style.margin = '';
        if (this._hoverPointer) {
            switch (this._hoverPosition) {
                case 1 /* HoverPosition.RIGHT */:
                    targetRect.left += 3 /* Constants.PointerSize */;
                    targetRect.right += 3 /* Constants.PointerSize */;
                    this._hoverContainer.style.paddingLeft = `${3 /* Constants.PointerSize */}px`;
                    this._hoverContainer.style.marginLeft = `${-3 /* Constants.PointerSize */}px`;
                    break;
                case 0 /* HoverPosition.LEFT */:
                    targetRect.left -= 3 /* Constants.PointerSize */;
                    targetRect.right -= 3 /* Constants.PointerSize */;
                    this._hoverContainer.style.paddingRight = `${3 /* Constants.PointerSize */}px`;
                    this._hoverContainer.style.marginRight = `${-3 /* Constants.PointerSize */}px`;
                    break;
                case 2 /* HoverPosition.BELOW */:
                    targetRect.top += 3 /* Constants.PointerSize */;
                    targetRect.bottom += 3 /* Constants.PointerSize */;
                    this._hoverContainer.style.paddingTop = `${3 /* Constants.PointerSize */}px`;
                    this._hoverContainer.style.marginTop = `${-3 /* Constants.PointerSize */}px`;
                    break;
                case 3 /* HoverPosition.ABOVE */:
                    targetRect.top -= 3 /* Constants.PointerSize */;
                    targetRect.bottom -= 3 /* Constants.PointerSize */;
                    this._hoverContainer.style.paddingBottom = `${3 /* Constants.PointerSize */}px`;
                    this._hoverContainer.style.marginBottom = `${-3 /* Constants.PointerSize */}px`;
                    break;
            }
            targetRect.center.x = targetRect.left + (width / 2);
            targetRect.center.y = targetRect.top + (height / 2);
        }
        this.computeXCordinate(targetRect);
        this.computeYCordinate(targetRect);
        if (this._hoverPointer) {
            // reset
            this._hoverPointer.classList.remove('top');
            this._hoverPointer.classList.remove('left');
            this._hoverPointer.classList.remove('right');
            this._hoverPointer.classList.remove('bottom');
            this.setHoverPointerPosition(targetRect);
        }
        this._hover.onContentsChanged();
    }
    computeXCordinate(target) {
        const hoverWidth = this._hover.containerDomNode.clientWidth + 2 /* Constants.HoverBorderWidth */;
        if (this._target.x !== undefined) {
            this._x = this._target.x;
        }
        else if (this._hoverPosition === 1 /* HoverPosition.RIGHT */) {
            this._x = target.right;
        }
        else if (this._hoverPosition === 0 /* HoverPosition.LEFT */) {
            this._x = target.left - hoverWidth;
        }
        else {
            if (this._hoverPointer) {
                this._x = target.center.x - (this._hover.containerDomNode.clientWidth / 2);
            }
            else {
                this._x = target.left;
            }
            // Hover is going beyond window towards right end
            if (this._x + hoverWidth >= document.documentElement.clientWidth) {
                this._hover.containerDomNode.classList.add('right-aligned');
                this._x = Math.max(document.documentElement.clientWidth - hoverWidth - 2 /* Constants.HoverWindowEdgeMargin */, document.documentElement.clientLeft);
            }
        }
        // Hover is going beyond window towards left end
        if (this._x < document.documentElement.clientLeft) {
            this._x = target.left + 2 /* Constants.HoverWindowEdgeMargin */;
        }
    }
    computeYCordinate(target) {
        if (this._target.y !== undefined) {
            this._y = this._target.y;
        }
        else if (this._hoverPosition === 3 /* HoverPosition.ABOVE */) {
            this._y = target.top;
        }
        else if (this._hoverPosition === 2 /* HoverPosition.BELOW */) {
            this._y = target.bottom - 2;
        }
        else {
            if (this._hoverPointer) {
                this._y = target.center.y + (this._hover.containerDomNode.clientHeight / 2);
            }
            else {
                this._y = target.bottom;
            }
        }
        // Hover on bottom is going beyond window
        if (this._y > window.innerHeight) {
            this._y = target.bottom;
        }
    }
    adjustHorizontalHoverPosition(target) {
        // Do not adjust horizontal hover position if x cordiante is provided
        if (this._target.x !== undefined) {
            return;
        }
        // When force position is enabled, restrict max width
        if (this._forcePosition) {
            const padding = (this._hoverPointer ? 3 /* Constants.PointerSize */ : 0) + 2 /* Constants.HoverBorderWidth */;
            if (this._hoverPosition === 1 /* HoverPosition.RIGHT */) {
                this._hover.containerDomNode.style.maxWidth = `${document.documentElement.clientWidth - target.right - padding}px`;
            }
            else if (this._hoverPosition === 0 /* HoverPosition.LEFT */) {
                this._hover.containerDomNode.style.maxWidth = `${target.left - padding}px`;
            }
            return;
        }
        // Position hover on right to target
        if (this._hoverPosition === 1 /* HoverPosition.RIGHT */) {
            // Hover on the right is going beyond window.
            if (target.right + this._hover.containerDomNode.clientWidth >= document.documentElement.clientWidth) {
                this._hoverPosition = 0 /* HoverPosition.LEFT */;
            }
        }
        // Position hover on left to target
        if (this._hoverPosition === 0 /* HoverPosition.LEFT */) {
            // Hover on the left is going beyond window.
            if (target.left - this._hover.containerDomNode.clientWidth <= document.documentElement.clientLeft) {
                this._hoverPosition = 1 /* HoverPosition.RIGHT */;
            }
        }
    }
    adjustVerticalHoverPosition(target) {
        // Do not adjust vertical hover position if the y coordinate is provided
        // or the position is forced
        if (this._target.y !== undefined || this._forcePosition) {
            return;
        }
        // Position hover on top of the target
        if (this._hoverPosition === 3 /* HoverPosition.ABOVE */) {
            // Hover on top is going beyond window
            if (target.top - this._hover.containerDomNode.clientHeight < 0) {
                this._hoverPosition = 2 /* HoverPosition.BELOW */;
            }
        }
        // Position hover below the target
        else if (this._hoverPosition === 2 /* HoverPosition.BELOW */) {
            // Hover on bottom is going beyond window
            if (target.bottom + this._hover.containerDomNode.clientHeight > window.innerHeight) {
                this._hoverPosition = 3 /* HoverPosition.ABOVE */;
            }
        }
    }
    adjustHoverMaxHeight(target) {
        let maxHeight = window.innerHeight / 2;
        // When force position is enabled, restrict max height
        if (this._forcePosition) {
            const padding = (this._hoverPointer ? 3 /* Constants.PointerSize */ : 0) + 2 /* Constants.HoverBorderWidth */;
            if (this._hoverPosition === 3 /* HoverPosition.ABOVE */) {
                maxHeight = Math.min(maxHeight, target.top - padding);
            }
            else if (this._hoverPosition === 2 /* HoverPosition.BELOW */) {
                maxHeight = Math.min(maxHeight, window.innerHeight - target.bottom - padding);
            }
        }
        // Make sure not to accidentally enlarge the hover when setting a maxHeight for it
        maxHeight = Math.min(maxHeight, this._hover.containerDomNode.clientHeight);
        this._hover.containerDomNode.style.maxHeight = `${maxHeight}px`;
        if (this._hover.contentsDomNode.clientHeight > maxHeight) {
            this._hover.contentsDomNode.style.height = `${maxHeight}px`;
        }
        if (this._hover.contentsDomNode.clientHeight < this._hover.contentsDomNode.scrollHeight) {
            // Add padding for a vertical scrollbar
            const extraRightPadding = `${this._hover.scrollbar.options.verticalScrollbarSize}px`;
            if (this._hover.contentsDomNode.style.paddingRight !== extraRightPadding) {
                this._hover.contentsDomNode.style.paddingRight = extraRightPadding;
            }
        }
    }
    setHoverPointerPosition(target) {
        if (!this._hoverPointer) {
            return;
        }
        switch (this._hoverPosition) {
            case 0 /* HoverPosition.LEFT */:
            case 1 /* HoverPosition.RIGHT */: {
                this._hoverPointer.classList.add(this._hoverPosition === 0 /* HoverPosition.LEFT */ ? 'right' : 'left');
                const hoverHeight = this._hover.containerDomNode.clientHeight;
                // If hover is taller than target, then show the pointer at the center of target
                if (hoverHeight > target.height) {
                    this._hoverPointer.style.top = `${target.center.y - (this._y - hoverHeight) - 3 /* Constants.PointerSize */}px`;
                }
                // Otherwise show the pointer at the center of hover
                else {
                    this._hoverPointer.style.top = `${Math.round((hoverHeight / 2)) - 3 /* Constants.PointerSize */}px`;
                }
                break;
            }
            case 3 /* HoverPosition.ABOVE */:
            case 2 /* HoverPosition.BELOW */: {
                this._hoverPointer.classList.add(this._hoverPosition === 3 /* HoverPosition.ABOVE */ ? 'bottom' : 'top');
                const hoverWidth = this._hover.containerDomNode.clientWidth;
                // Position pointer at the center of the hover
                let pointerLeftPosition = Math.round((hoverWidth / 2)) - 3 /* Constants.PointerSize */;
                // If pointer goes beyond target then position it at the center of the target
                const pointerX = this._x + pointerLeftPosition;
                if (pointerX < target.left || pointerX > target.right) {
                    pointerLeftPosition = target.center.x - this._x - 3 /* Constants.PointerSize */;
                }
                this._hoverPointer.style.left = `${pointerLeftPosition}px`;
                break;
            }
        }
    }
    focus() {
        this._hover.containerDomNode.focus();
    }
    hide() {
        this.dispose();
    }
    dispose() {
        if (!this._isDisposed) {
            this._onDispose.fire();
            this._hoverContainer.remove();
            this._messageListeners.dispose();
            this._target.dispose();
            super.dispose();
        }
        this._isDisposed = true;
    }
};
HoverWidget = __decorate([
    __param(1, IKeybindingService),
    __param(2, IConfigurationService),
    __param(3, IOpenerService),
    __param(4, IInstantiationService)
], HoverWidget);
export { HoverWidget };
class CompositeMouseTracker extends Widget {
    _elements;
    _isMouseIn = true;
    _mouseTimeout;
    _onMouseOut = this._register(new Emitter());
    get onMouseOut() { return this._onMouseOut.event; }
    get isMouseIn() { return this._isMouseIn; }
    constructor(_elements) {
        super();
        this._elements = _elements;
        this._elements.forEach(n => this.onmouseover(n, () => this._onTargetMouseOver()));
        this._elements.forEach(n => this.onmouseleave(n, () => this._onTargetMouseLeave()));
    }
    _onTargetMouseOver() {
        this._isMouseIn = true;
        this._clearEvaluateMouseStateTimeout();
    }
    _onTargetMouseLeave() {
        this._isMouseIn = false;
        this._evaluateMouseState();
    }
    _evaluateMouseState() {
        this._clearEvaluateMouseStateTimeout();
        // Evaluate whether the mouse is still outside asynchronously such that other mouse targets
        // have the opportunity to first their mouse in event.
        this._mouseTimeout = window.setTimeout(() => this._fireIfMouseOutside(), 0);
    }
    _clearEvaluateMouseStateTimeout() {
        if (this._mouseTimeout) {
            clearTimeout(this._mouseTimeout);
            this._mouseTimeout = undefined;
        }
    }
    _fireIfMouseOutside() {
        if (!this._isMouseIn) {
            this._onMouseOut.fire();
        }
    }
}
class ElementHoverTarget {
    _element;
    targetElements;
    constructor(_element) {
        this._element = _element;
        this.targetElements = [this._element];
    }
    dispose() {
    }
}
