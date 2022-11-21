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
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { IMenuService, MenuItemAction } from 'vs/platform/actions/common/actions';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { CodiconActionViewItem } from 'vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView';
let ListTopCellToolbar = class ListTopCellToolbar extends Disposable {
    notebookEditor;
    instantiationService;
    contextMenuService;
    menuService;
    topCellToolbar;
    toolbar;
    _modelDisposables = this._register(new DisposableStore());
    constructor(notebookEditor, contextKeyService, insertionIndicatorContainer, instantiationService, contextMenuService, menuService) {
        super();
        this.notebookEditor = notebookEditor;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.menuService = menuService;
        this.topCellToolbar = DOM.append(insertionIndicatorContainer, DOM.$('.cell-list-top-cell-toolbar-container'));
        this.toolbar = this._register(instantiationService.createInstance(MenuWorkbenchToolBar, this.topCellToolbar, this.notebookEditor.creationOptions.menuIds.cellTopInsertToolbar, {
            actionViewItemProvider: action => {
                if (action instanceof MenuItemAction) {
                    const item = this.instantiationService.createInstance(CodiconActionViewItem, action, undefined);
                    return item;
                }
                return undefined;
            },
            menuOptions: {
                shouldForwardArgs: true
            },
            toolbarOptions: {
                primaryGroup: g => /^inline/.test(g),
            },
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
        }));
        this.toolbar.context = {
            notebookEditor
        };
        // update toolbar container css based on cell list length
        this._register(this.notebookEditor.onDidChangeModel(() => {
            this._modelDisposables.clear();
            if (this.notebookEditor.hasModel()) {
                this._modelDisposables.add(this.notebookEditor.onDidChangeViewCells(() => {
                    this.updateClass();
                }));
                this.updateClass();
            }
        }));
        this.updateClass();
    }
    updateClass() {
        if (this.notebookEditor.hasModel() && this.notebookEditor.getLength() === 0) {
            this.topCellToolbar.classList.add('emptyNotebook');
        }
        else {
            this.topCellToolbar.classList.remove('emptyNotebook');
        }
    }
};
ListTopCellToolbar = __decorate([
    __param(3, IInstantiationService),
    __param(4, IContextMenuService),
    __param(5, IMenuService)
], ListTopCellToolbar);
export { ListTopCellToolbar };
