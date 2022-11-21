/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { $, addDisposableListener, append, EventHelper, EventType } from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { EventType as GestureEventType, Gesture } from 'vs/base/browser/touch';
import { ActionRunner } from 'vs/base/common/actions';
import { Emitter } from 'vs/base/common/event';
import 'vs/css!./dropdown';
export class BaseDropdown extends ActionRunner {
    _element;
    boxContainer;
    _label;
    contents;
    visible;
    _onDidChangeVisibility = this._register(new Emitter());
    onDidChangeVisibility = this._onDidChangeVisibility.event;
    constructor(container, options) {
        super();
        this._element = append(container, $('.monaco-dropdown'));
        this._label = append(this._element, $('.dropdown-label'));
        let labelRenderer = options.labelRenderer;
        if (!labelRenderer) {
            labelRenderer = (container) => {
                container.textContent = options.label || '';
                return null;
            };
        }
        for (const event of [EventType.CLICK, EventType.MOUSE_DOWN, GestureEventType.Tap]) {
            this._register(addDisposableListener(this.element, event, e => EventHelper.stop(e, true))); // prevent default click behaviour to trigger
        }
        for (const event of [EventType.MOUSE_DOWN, GestureEventType.Tap]) {
            this._register(addDisposableListener(this._label, event, e => {
                if (e instanceof MouseEvent && (e.detail > 1 || e.button !== 0)) {
                    // prevent right click trigger to allow separate context menu (https://github.com/microsoft/vscode/issues/151064)
                    // prevent multiple clicks to open multiple context menus (https://github.com/microsoft/vscode/issues/41363)
                    return;
                }
                if (this.visible) {
                    this.hide();
                }
                else {
                    this.show();
                }
            }));
        }
        this._register(addDisposableListener(this._label, EventType.KEY_UP, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(3 /* KeyCode.Enter */) || event.equals(10 /* KeyCode.Space */)) {
                EventHelper.stop(e, true); // https://github.com/microsoft/vscode/issues/57997
                if (this.visible) {
                    this.hide();
                }
                else {
                    this.show();
                }
            }
        }));
        const cleanupFn = labelRenderer(this._label);
        if (cleanupFn) {
            this._register(cleanupFn);
        }
        this._register(Gesture.addTarget(this._label));
    }
    get element() {
        return this._element;
    }
    get label() {
        return this._label;
    }
    set tooltip(tooltip) {
        if (this._label) {
            this._label.title = tooltip;
        }
    }
    show() {
        if (!this.visible) {
            this.visible = true;
            this._onDidChangeVisibility.fire(true);
        }
    }
    hide() {
        if (this.visible) {
            this.visible = false;
            this._onDidChangeVisibility.fire(false);
        }
    }
    isVisible() {
        return !!this.visible;
    }
    onEvent(_e, activeElement) {
        this.hide();
    }
    dispose() {
        super.dispose();
        this.hide();
        if (this.boxContainer) {
            this.boxContainer.remove();
            this.boxContainer = undefined;
        }
        if (this.contents) {
            this.contents.remove();
            this.contents = undefined;
        }
        if (this._label) {
            this._label.remove();
            this._label = undefined;
        }
    }
}
export class Dropdown extends BaseDropdown {
    contextViewProvider;
    constructor(container, options) {
        super(container, options);
        this.contextViewProvider = options.contextViewProvider;
    }
    show() {
        super.show();
        this.element.classList.add('active');
        this.contextViewProvider.showContextView({
            getAnchor: () => this.getAnchor(),
            render: (container) => {
                return this.renderContents(container);
            },
            onDOMEvent: (e, activeElement) => {
                this.onEvent(e, activeElement);
            },
            onHide: () => this.onHide()
        });
    }
    getAnchor() {
        return this.element;
    }
    onHide() {
        this.element.classList.remove('active');
    }
    hide() {
        super.hide();
        this.contextViewProvider?.hideContextView();
    }
    renderContents(container) {
        return null;
    }
}
export class DropdownMenu extends BaseDropdown {
    _contextMenuProvider;
    _menuOptions;
    _actions = [];
    actionProvider;
    menuClassName;
    menuAsChild;
    constructor(container, options) {
        super(container, options);
        this._contextMenuProvider = options.contextMenuProvider;
        this.actions = options.actions || [];
        this.actionProvider = options.actionProvider;
        this.menuClassName = options.menuClassName || '';
        this.menuAsChild = !!options.menuAsChild;
    }
    set menuOptions(options) {
        this._menuOptions = options;
    }
    get menuOptions() {
        return this._menuOptions;
    }
    get actions() {
        if (this.actionProvider) {
            return this.actionProvider.getActions();
        }
        return this._actions;
    }
    set actions(actions) {
        this._actions = actions;
    }
    show() {
        super.show();
        this.element.classList.add('active');
        this._contextMenuProvider.showContextMenu({
            getAnchor: () => this.element,
            getActions: () => this.actions,
            getActionsContext: () => this.menuOptions ? this.menuOptions.context : null,
            getActionViewItem: action => this.menuOptions && this.menuOptions.actionViewItemProvider ? this.menuOptions.actionViewItemProvider(action) : undefined,
            getKeyBinding: action => this.menuOptions && this.menuOptions.getKeyBinding ? this.menuOptions.getKeyBinding(action) : undefined,
            getMenuClassName: () => this.menuClassName,
            onHide: () => this.onHide(),
            actionRunner: this.menuOptions ? this.menuOptions.actionRunner : undefined,
            anchorAlignment: this.menuOptions ? this.menuOptions.anchorAlignment : 0 /* AnchorAlignment.LEFT */,
            domForShadowRoot: this.menuAsChild ? this.element : undefined
        });
    }
    hide() {
        super.hide();
    }
    onHide() {
        this.hide();
        this.element.classList.remove('active');
    }
}
