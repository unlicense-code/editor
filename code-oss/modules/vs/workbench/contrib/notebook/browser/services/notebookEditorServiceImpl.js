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
import { ResourceMap } from 'vs/base/common/map';
import { getDefaultNotebookCreationOptions, NotebookEditorWidget } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { isCompositeNotebookEditorInput, NotebookEditorInput } from 'vs/workbench/contrib/notebook/common/notebookEditorInput';
import { Emitter } from 'vs/base/common/event';
let NotebookEditorWidgetService = class NotebookEditorWidgetService {
    _serviceBrand;
    _tokenPool = 1;
    _disposables = new DisposableStore();
    _notebookEditors = new Map();
    _onNotebookEditorAdd = new Emitter();
    _onNotebookEditorsRemove = new Emitter();
    onDidAddNotebookEditor = this._onNotebookEditorAdd.event;
    onDidRemoveNotebookEditor = this._onNotebookEditorsRemove.event;
    _borrowableEditors = new Map();
    constructor(editorGroupService) {
        const groupListener = new Map();
        const onNewGroup = (group) => {
            const { id } = group;
            const listeners = [];
            listeners.push(group.onDidCloseEditor(e => {
                const widgets = this._borrowableEditors.get(group.id);
                if (!widgets) {
                    return;
                }
                const inputs = e.editor instanceof NotebookEditorInput ? [e.editor] : (isCompositeNotebookEditorInput(e.editor) ? e.editor.editorInputs : []);
                inputs.forEach(input => {
                    const value = widgets.get(input.resource);
                    if (!value) {
                        return;
                    }
                    value.token = undefined;
                    this._disposeWidget(value.widget);
                    widgets.delete(input.resource);
                    value.widget = undefined; // unset the widget so that others that still hold a reference don't harm us
                });
            }));
            listeners.push(group.onWillMoveEditor(e => {
                if (e.editor instanceof NotebookEditorInput) {
                    this._allowWidgetMove(e.editor, e.groupId, e.target);
                }
                if (isCompositeNotebookEditorInput(e.editor)) {
                    e.editor.editorInputs.forEach(input => {
                        this._allowWidgetMove(input, e.groupId, e.target);
                    });
                }
            }));
            groupListener.set(id, listeners);
        };
        this._disposables.add(editorGroupService.onDidAddGroup(onNewGroup));
        editorGroupService.whenReady.then(() => editorGroupService.groups.forEach(onNewGroup));
        // group removed -> clean up listeners, clean up widgets
        this._disposables.add(editorGroupService.onDidRemoveGroup(group => {
            const listeners = groupListener.get(group.id);
            if (listeners) {
                listeners.forEach(listener => listener.dispose());
                groupListener.delete(group.id);
            }
            const widgets = this._borrowableEditors.get(group.id);
            this._borrowableEditors.delete(group.id);
            if (widgets) {
                for (const value of widgets.values()) {
                    value.token = undefined;
                    this._disposeWidget(value.widget);
                }
            }
        }));
    }
    dispose() {
        this._disposables.dispose();
        this._onNotebookEditorAdd.dispose();
        this._onNotebookEditorsRemove.dispose();
    }
    // --- group-based editor borrowing...
    _disposeWidget(widget) {
        widget.onWillHide();
        const domNode = widget.getDomNode();
        widget.dispose();
        domNode.remove();
    }
    _allowWidgetMove(input, sourceID, targetID) {
        const targetWidget = this._borrowableEditors.get(targetID)?.get(input.resource);
        if (targetWidget) {
            // not needed
            return;
        }
        const widget = this._borrowableEditors.get(sourceID)?.get(input.resource);
        if (!widget) {
            throw new Error('no widget at source group');
        }
        // don't allow the widget to be retrieved at its previous location any more
        this._borrowableEditors.get(sourceID)?.delete(input.resource);
        // allow the widget to be retrieved at its new location
        let targetMap = this._borrowableEditors.get(targetID);
        if (!targetMap) {
            targetMap = new ResourceMap();
            this._borrowableEditors.set(targetID, targetMap);
        }
        targetMap.set(input.resource, widget);
    }
    retrieveWidget(accessor, group, input, creationOptions, initialDimension) {
        let value = this._borrowableEditors.get(group.id)?.get(input.resource);
        if (!value) {
            // NEW widget
            const instantiationService = accessor.get(IInstantiationService);
            const widget = instantiationService.createInstance(NotebookEditorWidget, creationOptions ?? getDefaultNotebookCreationOptions(), initialDimension);
            const token = this._tokenPool++;
            value = { widget, token };
            let map = this._borrowableEditors.get(group.id);
            if (!map) {
                map = new ResourceMap();
                this._borrowableEditors.set(group.id, map);
            }
            map.set(input.resource, value);
        }
        else {
            // reuse a widget which was either free'ed before or which
            // is simply being reused...
            value.token = this._tokenPool++;
        }
        return this._createBorrowValue(value.token, value);
    }
    _createBorrowValue(myToken, widget) {
        return {
            get value() {
                return widget.token === myToken ? widget.widget : undefined;
            }
        };
    }
    // --- editor management
    addNotebookEditor(editor) {
        this._notebookEditors.set(editor.getId(), editor);
        this._onNotebookEditorAdd.fire(editor);
    }
    removeNotebookEditor(editor) {
        if (this._notebookEditors.has(editor.getId())) {
            this._notebookEditors.delete(editor.getId());
            this._onNotebookEditorsRemove.fire(editor);
        }
    }
    getNotebookEditor(editorId) {
        return this._notebookEditors.get(editorId);
    }
    listNotebookEditors() {
        return [...this._notebookEditors].map(e => e[1]);
    }
};
NotebookEditorWidgetService = __decorate([
    __param(0, IEditorGroupsService)
], NotebookEditorWidgetService);
export { NotebookEditorWidgetService };
