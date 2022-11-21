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
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Codicon } from 'vs/base/common/codicons';
import { isCancellationError } from 'vs/base/common/errors';
import { Event } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { EditorAction2, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Range } from 'vs/editor/common/core/range';
import { PeekContext } from 'vs/editor/contrib/peekView/browser/peekView';
import { localize } from 'vs/nls';
import { MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { TypeHierarchyTreePeekWidget } from 'vs/workbench/contrib/typeHierarchy/browser/typeHierarchyPeek';
import { TypeHierarchyModel, TypeHierarchyProviderRegistry } from 'vs/workbench/contrib/typeHierarchy/common/typeHierarchy';
const _ctxHasTypeHierarchyProvider = new RawContextKey('editorHasTypeHierarchyProvider', false, localize('editorHasTypeHierarchyProvider', 'Whether a type hierarchy provider is available'));
const _ctxTypeHierarchyVisible = new RawContextKey('typeHierarchyVisible', false, localize('typeHierarchyVisible', 'Whether type hierarchy peek is currently showing'));
const _ctxTypeHierarchyDirection = new RawContextKey('typeHierarchyDirection', undefined, { type: 'string', description: localize('typeHierarchyDirection', 'whether type hierarchy shows super types or subtypes') });
function sanitizedDirection(candidate) {
    return candidate === "subtypes" /* TypeHierarchyDirection.Subtypes */ || candidate === "supertypes" /* TypeHierarchyDirection.Supertypes */
        ? candidate
        : "subtypes" /* TypeHierarchyDirection.Subtypes */;
}
let TypeHierarchyController = class TypeHierarchyController {
    _editor;
    _contextKeyService;
    _storageService;
    _editorService;
    _instantiationService;
    static Id = 'typeHierarchy';
    static get(editor) {
        return editor.getContribution(TypeHierarchyController.Id);
    }
    static _storageDirectionKey = 'typeHierarchy/defaultDirection';
    _ctxHasProvider;
    _ctxIsVisible;
    _ctxDirection;
    _disposables = new DisposableStore();
    _sessionDisposables = new DisposableStore();
    _widget;
    constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
        this._editor = _editor;
        this._contextKeyService = _contextKeyService;
        this._storageService = _storageService;
        this._editorService = _editorService;
        this._instantiationService = _instantiationService;
        this._ctxHasProvider = _ctxHasTypeHierarchyProvider.bindTo(this._contextKeyService);
        this._ctxIsVisible = _ctxTypeHierarchyVisible.bindTo(this._contextKeyService);
        this._ctxDirection = _ctxTypeHierarchyDirection.bindTo(this._contextKeyService);
        this._disposables.add(Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, TypeHierarchyProviderRegistry.onDidChange)(() => {
            this._ctxHasProvider.set(_editor.hasModel() && TypeHierarchyProviderRegistry.has(_editor.getModel()));
        }));
        this._disposables.add(this._sessionDisposables);
    }
    dispose() {
        this._disposables.dispose();
    }
    // Peek
    async startTypeHierarchyFromEditor() {
        this._sessionDisposables.clear();
        if (!this._editor.hasModel()) {
            return;
        }
        const document = this._editor.getModel();
        const position = this._editor.getPosition();
        if (!TypeHierarchyProviderRegistry.has(document)) {
            return;
        }
        const cts = new CancellationTokenSource();
        const model = TypeHierarchyModel.create(document, position, cts.token);
        const direction = sanitizedDirection(this._storageService.get(TypeHierarchyController._storageDirectionKey, 0 /* StorageScope.PROFILE */, "subtypes" /* TypeHierarchyDirection.Subtypes */));
        this._showTypeHierarchyWidget(position, direction, model, cts);
    }
    _showTypeHierarchyWidget(position, direction, model, cts) {
        this._ctxIsVisible.set(true);
        this._ctxDirection.set(direction);
        Event.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endTypeHierarchy, this, this._sessionDisposables);
        this._widget = this._instantiationService.createInstance(TypeHierarchyTreePeekWidget, this._editor, position, direction);
        this._widget.showLoading();
        this._sessionDisposables.add(this._widget.onDidClose(() => {
            this.endTypeHierarchy();
            this._storageService.store(TypeHierarchyController._storageDirectionKey, this._widget.direction, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }));
        this._sessionDisposables.add({ dispose() { cts.dispose(true); } });
        this._sessionDisposables.add(this._widget);
        model.then(model => {
            if (cts.token.isCancellationRequested) {
                return; // nothing
            }
            if (model) {
                this._sessionDisposables.add(model);
                this._widget.showModel(model);
            }
            else {
                this._widget.showMessage(localize('no.item', "No results"));
            }
        }).catch(err => {
            if (isCancellationError(err)) {
                this.endTypeHierarchy();
                return;
            }
            this._widget.showMessage(localize('error', "Failed to show type hierarchy"));
        });
    }
    async startTypeHierarchyFromTypeHierarchy() {
        if (!this._widget) {
            return;
        }
        const model = this._widget.getModel();
        const typeItem = this._widget.getFocused();
        if (!typeItem || !model) {
            return;
        }
        const newEditor = await this._editorService.openCodeEditor({ resource: typeItem.item.uri }, this._editor);
        if (!newEditor) {
            return;
        }
        const newModel = model.fork(typeItem.item);
        this._sessionDisposables.clear();
        TypeHierarchyController.get(newEditor)?._showTypeHierarchyWidget(Range.lift(newModel.root.selectionRange).getStartPosition(), this._widget.direction, Promise.resolve(newModel), new CancellationTokenSource());
    }
    showSupertypes() {
        this._widget?.updateDirection("supertypes" /* TypeHierarchyDirection.Supertypes */);
        this._ctxDirection.set("supertypes" /* TypeHierarchyDirection.Supertypes */);
    }
    showSubtypes() {
        this._widget?.updateDirection("subtypes" /* TypeHierarchyDirection.Subtypes */);
        this._ctxDirection.set("subtypes" /* TypeHierarchyDirection.Subtypes */);
    }
    endTypeHierarchy() {
        this._sessionDisposables.clear();
        this._ctxIsVisible.set(false);
        this._editor.focus();
    }
};
TypeHierarchyController = __decorate([
    __param(1, IContextKeyService),
    __param(2, IStorageService),
    __param(3, ICodeEditorService),
    __param(4, IInstantiationService)
], TypeHierarchyController);
registerEditorContribution(TypeHierarchyController.Id, TypeHierarchyController);
// Peek
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.showTypeHierarchy',
            title: { value: localize('title', "Peek Type Hierarchy"), original: 'Peek Type Hierarchy' },
            menu: {
                id: MenuId.EditorContextPeek,
                group: 'navigation',
                order: 1000,
                when: ContextKeyExpr.and(_ctxHasTypeHierarchyProvider, PeekContext.notInPeekEditor),
            },
            precondition: ContextKeyExpr.and(_ctxHasTypeHierarchyProvider, PeekContext.notInPeekEditor)
        });
    }
    async runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.startTypeHierarchyFromEditor();
    }
});
// actions for peek widget
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.showSupertypes',
            title: { value: localize('title.supertypes', "Show Supertypes"), original: 'Show Supertypes' },
            icon: Codicon.typeHierarchySuper,
            precondition: ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* TypeHierarchyDirection.Subtypes */)),
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
            },
            menu: {
                id: TypeHierarchyTreePeekWidget.TitleMenu,
                when: _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* TypeHierarchyDirection.Subtypes */),
                order: 1,
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.showSupertypes();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.showSubtypes',
            title: { value: localize('title.subtypes', "Show Subtypes"), original: 'Show Subtypes' },
            icon: Codicon.typeHierarchySub,
            precondition: ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* TypeHierarchyDirection.Supertypes */)),
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 1024 /* KeyMod.Shift */ + 512 /* KeyMod.Alt */ + 38 /* KeyCode.KeyH */,
            },
            menu: {
                id: TypeHierarchyTreePeekWidget.TitleMenu,
                when: _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* TypeHierarchyDirection.Supertypes */),
                order: 1,
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.showSubtypes();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.refocusTypeHierarchy',
            title: { value: localize('title.refocusTypeHierarchy', "Refocus Type Hierarchy"), original: 'Refocus Type Hierarchy' },
            precondition: _ctxTypeHierarchyVisible,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 1024 /* KeyMod.Shift */ + 3 /* KeyCode.Enter */
            }
        });
    }
    async runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.startTypeHierarchyFromTypeHierarchy();
    }
});
registerAction2(class extends EditorAction2 {
    constructor() {
        super({
            id: 'editor.closeTypeHierarchy',
            title: localize('close', 'Close'),
            icon: Codicon.close,
            precondition: _ctxTypeHierarchyVisible,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 10,
                primary: 9 /* KeyCode.Escape */,
                when: ContextKeyExpr.not('config.editor.stablePeek')
            },
            menu: {
                id: TypeHierarchyTreePeekWidget.TitleMenu,
                order: 1000
            }
        });
    }
    runEditorCommand(_accessor, editor) {
        return TypeHierarchyController.get(editor)?.endTypeHierarchy();
    }
});
