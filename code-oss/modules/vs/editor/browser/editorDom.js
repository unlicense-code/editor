/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as dom from 'vs/base/browser/dom';
import { GlobalPointerMoveMonitor } from 'vs/base/browser/globalPointerMoveMonitor';
import { StandardMouseEvent } from 'vs/base/browser/mouseEvent';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { asCssValue } from 'vs/platform/theme/common/colorRegistry';
/**
 * Coordinates relative to the whole document (e.g. mouse event's pageX and pageY)
 */
export class PageCoordinates {
    x;
    y;
    _pageCoordinatesBrand = undefined;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toClientCoordinates() {
        return new ClientCoordinates(this.x - window.scrollX, this.y - window.scrollY);
    }
}
/**
 * Coordinates within the application's client area (i.e. origin is document's scroll position).
 *
 * For example, clicking in the top-left corner of the client area will
 * always result in a mouse event with a client.x value of 0, regardless
 * of whether the page is scrolled horizontally.
 */
export class ClientCoordinates {
    clientX;
    clientY;
    _clientCoordinatesBrand = undefined;
    constructor(clientX, clientY) {
        this.clientX = clientX;
        this.clientY = clientY;
    }
    toPageCoordinates() {
        return new PageCoordinates(this.clientX + window.scrollX, this.clientY + window.scrollY);
    }
}
/**
 * The position of the editor in the page.
 */
export class EditorPagePosition {
    x;
    y;
    width;
    height;
    _editorPagePositionBrand = undefined;
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}
/**
 * Coordinates relative to the the (top;left) of the editor that can be used safely with other internal editor metrics.
 * **NOTE**: This position is obtained by taking page coordinates and transforming them relative to the
 * editor's (top;left) position in a way in which scale transformations are taken into account.
 * **NOTE**: These coordinates could be negative if the mouse position is outside the editor.
 */
export class CoordinatesRelativeToEditor {
    x;
    y;
    _positionRelativeToEditorBrand = undefined;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export function createEditorPagePosition(editorViewDomNode) {
    const editorPos = dom.getDomNodePagePosition(editorViewDomNode);
    return new EditorPagePosition(editorPos.left, editorPos.top, editorPos.width, editorPos.height);
}
export function createCoordinatesRelativeToEditor(editorViewDomNode, editorPagePosition, pos) {
    // The editor's page position is read from the DOM using getBoundingClientRect().
    //
    // getBoundingClientRect() returns the actual dimensions, while offsetWidth and offsetHeight
    // reflect the unscaled size. We can use this difference to detect a transform:scale()
    // and we will apply the transformation in inverse to get mouse coordinates that make sense inside the editor.
    //
    // This could be expanded to cover rotation as well maybe by walking the DOM up from `editorViewDomNode`
    // and computing the effective transformation matrix using getComputedStyle(element).transform.
    //
    const scaleX = editorPagePosition.width / editorViewDomNode.offsetWidth;
    const scaleY = editorPagePosition.height / editorViewDomNode.offsetHeight;
    // Adjust mouse offsets if editor appears to be scaled via transforms
    const relativeX = (pos.x - editorPagePosition.x) / scaleX;
    const relativeY = (pos.y - editorPagePosition.y) / scaleY;
    return new CoordinatesRelativeToEditor(relativeX, relativeY);
}
export class EditorMouseEvent extends StandardMouseEvent {
    _editorMouseEventBrand = undefined;
    /**
     * If the event is a result of using `setPointerCapture`, the `event.target`
     * does not necessarily reflect the position in the editor.
     */
    isFromPointerCapture;
    /**
     * Coordinates relative to the whole document.
     */
    pos;
    /**
     * Editor's coordinates relative to the whole document.
     */
    editorPos;
    /**
     * Coordinates relative to the (top;left) of the editor.
     * *NOTE*: These coordinates are preferred because they take into account transformations applied to the editor.
     * *NOTE*: These coordinates could be negative if the mouse position is outside the editor.
     */
    relativePos;
    constructor(e, isFromPointerCapture, editorViewDomNode) {
        super(e);
        this.isFromPointerCapture = isFromPointerCapture;
        this.pos = new PageCoordinates(this.posx, this.posy);
        this.editorPos = createEditorPagePosition(editorViewDomNode);
        this.relativePos = createCoordinatesRelativeToEditor(editorViewDomNode, this.editorPos, this.pos);
    }
}
export class EditorMouseEventFactory {
    _editorViewDomNode;
    constructor(editorViewDomNode) {
        this._editorViewDomNode = editorViewDomNode;
    }
    _create(e) {
        return new EditorMouseEvent(e, false, this._editorViewDomNode);
    }
    onContextMenu(target, callback) {
        return dom.addDisposableListener(target, 'contextmenu', (e) => {
            callback(this._create(e));
        });
    }
    onMouseUp(target, callback) {
        return dom.addDisposableListener(target, 'mouseup', (e) => {
            callback(this._create(e));
        });
    }
    onMouseDown(target, callback) {
        return dom.addDisposableListener(target, dom.EventType.MOUSE_DOWN, (e) => {
            callback(this._create(e));
        });
    }
    onPointerDown(target, callback) {
        return dom.addDisposableListener(target, dom.EventType.POINTER_DOWN, (e) => {
            callback(this._create(e), e.pointerId);
        });
    }
    onMouseLeave(target, callback) {
        return dom.addDisposableListener(target, dom.EventType.MOUSE_LEAVE, (e) => {
            callback(this._create(e));
        });
    }
    onMouseMove(target, callback) {
        return dom.addDisposableListener(target, 'mousemove', (e) => callback(this._create(e)));
    }
}
export class EditorPointerEventFactory {
    _editorViewDomNode;
    constructor(editorViewDomNode) {
        this._editorViewDomNode = editorViewDomNode;
    }
    _create(e) {
        return new EditorMouseEvent(e, false, this._editorViewDomNode);
    }
    onPointerUp(target, callback) {
        return dom.addDisposableListener(target, 'pointerup', (e) => {
            callback(this._create(e));
        });
    }
    onPointerDown(target, callback) {
        return dom.addDisposableListener(target, dom.EventType.POINTER_DOWN, (e) => {
            callback(this._create(e), e.pointerId);
        });
    }
    onPointerLeave(target, callback) {
        return dom.addDisposableListener(target, dom.EventType.POINTER_LEAVE, (e) => {
            callback(this._create(e));
        });
    }
    onPointerMove(target, callback) {
        return dom.addDisposableListener(target, 'pointermove', (e) => callback(this._create(e)));
    }
}
export class GlobalEditorPointerMoveMonitor extends Disposable {
    _editorViewDomNode;
    _globalPointerMoveMonitor;
    _keydownListener;
    constructor(editorViewDomNode) {
        super();
        this._editorViewDomNode = editorViewDomNode;
        this._globalPointerMoveMonitor = this._register(new GlobalPointerMoveMonitor());
        this._keydownListener = null;
    }
    startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
        // Add a <<capture>> keydown event listener that will cancel the monitoring
        // if something other than a modifier key is pressed
        this._keydownListener = dom.addStandardDisposableListener(document, 'keydown', (e) => {
            const kb = e.toKeybinding();
            if (kb.isModifierKey()) {
                // Allow modifier keys
                return;
            }
            this._globalPointerMoveMonitor.stopMonitoring(true, e.browserEvent);
        }, true);
        this._globalPointerMoveMonitor.startMonitoring(initialElement, pointerId, initialButtons, (e) => {
            pointerMoveCallback(new EditorMouseEvent(e, true, this._editorViewDomNode));
        }, (e) => {
            this._keydownListener.dispose();
            onStopCallback(e);
        });
    }
    stopMonitoring() {
        this._globalPointerMoveMonitor.stopMonitoring(true);
    }
}
/**
 * A helper to create dynamic css rules, bound to a class name.
 * Rules are reused.
 * Reference counting and delayed garbage collection ensure that no rules leak.
*/
export class DynamicCssRules {
    _editor;
    static _idPool = 0;
    _instanceId = ++DynamicCssRules._idPool;
    _counter = 0;
    _rules = new Map();
    // We delay garbage collection so that hanging rules can be reused.
    _garbageCollectionScheduler = new RunOnceScheduler(() => this.garbageCollect(), 1000);
    constructor(_editor) {
        this._editor = _editor;
    }
    createClassNameRef(options) {
        const rule = this.getOrCreateRule(options);
        rule.increaseRefCount();
        return {
            className: rule.className,
            dispose: () => {
                rule.decreaseRefCount();
                this._garbageCollectionScheduler.schedule();
            }
        };
    }
    getOrCreateRule(properties) {
        const key = this.computeUniqueKey(properties);
        let existingRule = this._rules.get(key);
        if (!existingRule) {
            const counter = this._counter++;
            existingRule = new RefCountedCssRule(key, `dyn-rule-${this._instanceId}-${counter}`, dom.isInShadowDOM(this._editor.getContainerDomNode())
                ? this._editor.getContainerDomNode()
                : undefined, properties);
            this._rules.set(key, existingRule);
        }
        return existingRule;
    }
    computeUniqueKey(properties) {
        return JSON.stringify(properties);
    }
    garbageCollect() {
        for (const rule of this._rules.values()) {
            if (!rule.hasReferences()) {
                this._rules.delete(rule.key);
                rule.dispose();
            }
        }
    }
}
class RefCountedCssRule {
    key;
    className;
    properties;
    _referenceCount = 0;
    _styleElement;
    constructor(key, className, _containerElement, properties) {
        this.key = key;
        this.className = className;
        this.properties = properties;
        this._styleElement = dom.createStyleSheet(_containerElement);
        this._styleElement.textContent = this.getCssText(this.className, this.properties);
    }
    getCssText(className, properties) {
        let str = `.${className} {`;
        for (const prop in properties) {
            const value = properties[prop];
            let cssValue;
            if (typeof value === 'object') {
                cssValue = asCssValue(value.id);
            }
            else {
                cssValue = value;
            }
            const cssPropName = camelToDashes(prop);
            str += `\n\t${cssPropName}: ${cssValue};`;
        }
        str += `\n}`;
        return str;
    }
    dispose() {
        this._styleElement.remove();
    }
    increaseRefCount() {
        this._referenceCount++;
    }
    decreaseRefCount() {
        this._referenceCount--;
    }
    hasReferences() {
        return this._referenceCount > 0;
    }
}
function camelToDashes(str) {
    return str.replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
        .replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
}
