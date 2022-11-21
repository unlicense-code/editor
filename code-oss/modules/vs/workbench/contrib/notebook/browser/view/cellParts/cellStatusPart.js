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
import * as DOM from 'vs/base/browser/dom';
import { StandardKeyboardEvent } from 'vs/base/browser/keyboardEvent';
import { SimpleIconLabel } from 'vs/base/browser/ui/iconLabel/simpleIconLabel';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { Emitter } from 'vs/base/common/event';
import { stripIcons } from 'vs/base/common/iconLabels';
import { Disposable, DisposableStore, dispose } from 'vs/base/common/lifecycle';
import { isThemeColor } from 'vs/editor/common/editorCommon';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CellFocusMode } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CellContentPart } from 'vs/workbench/contrib/notebook/browser/view/cellPart';
import { CodeCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel';
const $ = DOM.$;
let CellEditorStatusBar = class CellEditorStatusBar extends CellContentPart {
    _notebookEditor;
    _cellContainer;
    _editor;
    _instantiationService;
    _themeService;
    statusBarContainer;
    leftItemsContainer;
    rightItemsContainer;
    itemsDisposable;
    leftItems = [];
    rightItems = [];
    width = 0;
    currentContext;
    _onDidClick = this._register(new Emitter());
    onDidClick = this._onDidClick.event;
    constructor(_notebookEditor, _cellContainer, editorPart, _editor, _instantiationService, _themeService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._cellContainer = _cellContainer;
        this._editor = _editor;
        this._instantiationService = _instantiationService;
        this._themeService = _themeService;
        this.statusBarContainer = DOM.append(editorPart, $('.cell-statusbar-container'));
        this.statusBarContainer.tabIndex = -1;
        const leftItemsContainer = DOM.append(this.statusBarContainer, $('.cell-status-left'));
        const rightItemsContainer = DOM.append(this.statusBarContainer, $('.cell-status-right'));
        this.leftItemsContainer = DOM.append(leftItemsContainer, $('.cell-contributed-items.cell-contributed-items-left'));
        this.rightItemsContainer = DOM.append(rightItemsContainer, $('.cell-contributed-items.cell-contributed-items-right'));
        this.itemsDisposable = this._register(new DisposableStore());
        this._register(this._themeService.onDidColorThemeChange(() => this.currentContext && this.updateContext(this.currentContext)));
        this._register(DOM.addDisposableListener(this.statusBarContainer, DOM.EventType.CLICK, e => {
            if (e.target === leftItemsContainer || e.target === rightItemsContainer || e.target === this.statusBarContainer) {
                // hit on empty space
                this._onDidClick.fire({
                    type: 0 /* ClickTargetType.Container */,
                    event: e
                });
            }
            else {
                if (e.target.classList.contains('cell-status-item-has-command')) {
                    this._onDidClick.fire({
                        type: 2 /* ClickTargetType.ContributedCommandItem */,
                        event: e
                    });
                }
                else {
                    // text
                    this._onDidClick.fire({
                        type: 1 /* ClickTargetType.ContributedTextItem */,
                        event: e
                    });
                }
            }
        }));
    }
    didRenderCell(element) {
        this.updateContext({
            ui: true,
            cell: element,
            notebookEditor: this._notebookEditor,
            $mid: 12 /* MarshalledId.NotebookCellActionContext */
        });
        if (this._editor) {
            // Focus Mode
            const updateFocusModeForEditorEvent = () => {
                element.focusMode =
                    this._editor && (this._editor.hasWidgetFocus() || (document.activeElement && this.statusBarContainer.contains(document.activeElement)))
                        ? CellFocusMode.Editor
                        : CellFocusMode.Container;
            };
            this.cellDisposables.add(this._editor.onDidFocusEditorWidget(() => {
                updateFocusModeForEditorEvent();
            }));
            this.cellDisposables.add(this._editor.onDidBlurEditorWidget(() => {
                // this is for a special case:
                // users click the status bar empty space, which we will then focus the editor
                // so we don't want to update the focus state too eagerly, it will be updated with onDidFocusEditorWidget
                if (this._notebookEditor.hasEditorFocus() &&
                    !(document.activeElement && this.statusBarContainer.contains(document.activeElement))) {
                    updateFocusModeForEditorEvent();
                }
            }));
            // Mouse click handlers
            this.cellDisposables.add(this.onDidClick(e => {
                if (this.currentCell instanceof CodeCellViewModel && e.type !== 2 /* ClickTargetType.ContributedCommandItem */ && this._editor) {
                    const target = this._editor.getTargetAtClientPoint(e.event.clientX, e.event.clientY - this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(this.currentCell.internalMetadata, this.currentCell.uri));
                    if (target?.position) {
                        this._editor.setPosition(target.position);
                        this._editor.focus();
                    }
                }
            }));
        }
    }
    updateInternalLayoutNow(element) {
        // todo@rebornix layer breaker
        this._cellContainer.classList.toggle('cell-statusbar-hidden', this._notebookEditor.notebookOptions.computeEditorStatusbarHeight(element.internalMetadata, element.uri) === 0);
        const layoutInfo = element.layoutInfo;
        const width = layoutInfo.editorWidth;
        if (!width) {
            return;
        }
        this.width = width;
        this.statusBarContainer.style.width = `${width}px`;
        const maxItemWidth = this.getMaxItemWidth();
        this.leftItems.forEach(item => item.maxWidth = maxItemWidth);
        this.rightItems.forEach(item => item.maxWidth = maxItemWidth);
    }
    getMaxItemWidth() {
        return this.width / 2;
    }
    updateContext(context) {
        this.currentContext = context;
        this.itemsDisposable.clear();
        if (!this.currentContext) {
            return;
        }
        this.itemsDisposable.add(this.currentContext.cell.onDidChangeLayout(() => {
            if (this.currentContext) {
                this.updateInternalLayoutNow(this.currentContext.cell);
            }
        }));
        this.itemsDisposable.add(this.currentContext.cell.onDidChangeCellStatusBarItems(() => this.updateRenderedItems()));
        this.itemsDisposable.add(this.currentContext.notebookEditor.onDidChangeActiveCell(() => this.updateActiveCell()));
        this.updateInternalLayoutNow(this.currentContext.cell);
        this.updateActiveCell();
        this.updateRenderedItems();
    }
    updateActiveCell() {
        const isActiveCell = this.currentContext.notebookEditor.getActiveCell() === this.currentContext?.cell;
        this.statusBarContainer.classList.toggle('is-active-cell', isActiveCell);
    }
    updateRenderedItems() {
        const items = this.currentContext.cell.getCellStatusBarItems();
        items.sort((itemA, itemB) => {
            return (itemB.priority ?? 0) - (itemA.priority ?? 0);
        });
        const maxItemWidth = this.getMaxItemWidth();
        const newLeftItems = items.filter(item => item.alignment === 1 /* CellStatusbarAlignment.Left */);
        const newRightItems = items.filter(item => item.alignment === 2 /* CellStatusbarAlignment.Right */).reverse();
        const updateItems = (renderedItems, newItems, container) => {
            if (renderedItems.length > newItems.length) {
                const deleted = renderedItems.splice(newItems.length, renderedItems.length - newItems.length);
                for (const deletedItem of deleted) {
                    container.removeChild(deletedItem.container);
                    deletedItem.dispose();
                }
            }
            newItems.forEach((newLeftItem, i) => {
                const existingItem = renderedItems[i];
                if (existingItem) {
                    existingItem.updateItem(newLeftItem, maxItemWidth);
                }
                else {
                    const item = this._instantiationService.createInstance(CellStatusBarItem, this.currentContext, newLeftItem, maxItemWidth);
                    renderedItems.push(item);
                    container.appendChild(item.container);
                }
            });
        };
        updateItems(this.leftItems, newLeftItems, this.leftItemsContainer);
        updateItems(this.rightItems, newRightItems, this.rightItemsContainer);
    }
    dispose() {
        super.dispose();
        dispose(this.leftItems);
        dispose(this.rightItems);
    }
};
CellEditorStatusBar = __decorate([
    __param(4, IInstantiationService),
    __param(5, IThemeService)
], CellEditorStatusBar);
export { CellEditorStatusBar };
let CellStatusBarItem = class CellStatusBarItem extends Disposable {
    _context;
    _telemetryService;
    _commandService;
    _notificationService;
    _themeService;
    container = $('.cell-status-item');
    set maxWidth(v) {
        this.container.style.maxWidth = v + 'px';
    }
    _currentItem;
    _itemDisposables = this._register(new DisposableStore());
    constructor(_context, itemModel, maxWidth, _telemetryService, _commandService, _notificationService, _themeService) {
        super();
        this._context = _context;
        this._telemetryService = _telemetryService;
        this._commandService = _commandService;
        this._notificationService = _notificationService;
        this._themeService = _themeService;
        this.updateItem(itemModel, maxWidth);
    }
    updateItem(item, maxWidth) {
        this._itemDisposables.clear();
        if (!this._currentItem || this._currentItem.text !== item.text) {
            new SimpleIconLabel(this.container).text = item.text.replace(/\n/g, ' ');
        }
        const resolveColor = (color) => {
            return isThemeColor(color) ?
                (this._themeService.getColorTheme().getColor(color.id)?.toString() || '') :
                color;
        };
        this.container.style.color = item.color ? resolveColor(item.color) : '';
        this.container.style.backgroundColor = item.backgroundColor ? resolveColor(item.backgroundColor) : '';
        this.container.style.opacity = item.opacity ? item.opacity : '';
        this.container.classList.toggle('cell-status-item-show-when-active', !!item.onlyShowWhenActive);
        if (typeof maxWidth === 'number') {
            this.maxWidth = maxWidth;
        }
        let ariaLabel;
        let role;
        if (item.accessibilityInformation) {
            ariaLabel = item.accessibilityInformation.label;
            role = item.accessibilityInformation.role;
        }
        else {
            ariaLabel = item.text ? stripIcons(item.text).trim() : '';
        }
        this.container.setAttribute('aria-label', ariaLabel);
        this.container.setAttribute('role', role || '');
        this.container.title = item.tooltip ?? '';
        this.container.classList.toggle('cell-status-item-has-command', !!item.command);
        if (item.command) {
            this.container.tabIndex = 0;
            this._itemDisposables.add(DOM.addDisposableListener(this.container, DOM.EventType.CLICK, _e => {
                this.executeCommand();
            }));
            this._itemDisposables.add(DOM.addDisposableListener(this.container, DOM.EventType.KEY_DOWN, e => {
                const event = new StandardKeyboardEvent(e);
                if (event.equals(10 /* KeyCode.Space */) || event.equals(3 /* KeyCode.Enter */)) {
                    this.executeCommand();
                }
            }));
        }
        else {
            this.container.removeAttribute('tabIndex');
        }
        this._currentItem = item;
    }
    async executeCommand() {
        const command = this._currentItem.command;
        if (!command) {
            return;
        }
        const id = typeof command === 'string' ? command : command.id;
        const args = typeof command === 'string' ? [] : command.arguments ?? [];
        if (typeof command === 'string' || !command.arguments || !Array.isArray(command.arguments) || command.arguments.length === 0) {
            args.unshift(this._context);
        }
        this._telemetryService.publicLog2('workbenchActionExecuted', { id, from: 'cell status bar' });
        try {
            await this._commandService.executeCommand(id, ...args);
        }
        catch (error) {
            this._notificationService.error(toErrorMessage(error));
        }
    }
};
CellStatusBarItem = __decorate([
    __param(3, ITelemetryService),
    __param(4, ICommandService),
    __param(5, INotificationService),
    __param(6, IThemeService)
], CellStatusBarItem);
