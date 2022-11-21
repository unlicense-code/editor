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
import { Emitter } from 'vs/base/common/event';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Disposable, toDisposable } from 'vs/base/common/lifecycle';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
export const IWorkingCopyEditorService = createDecorator('workingCopyEditorService');
let WorkingCopyEditorService = class WorkingCopyEditorService extends Disposable {
    editorService;
    _onDidRegisterHandler = this._register(new Emitter());
    onDidRegisterHandler = this._onDidRegisterHandler.event;
    handlers = new Set();
    constructor(editorService) {
        super();
        this.editorService = editorService;
    }
    registerHandler(handler) {
        // Add to registry and emit as event
        this.handlers.add(handler);
        this._onDidRegisterHandler.fire(handler);
        return toDisposable(() => this.handlers.delete(handler));
    }
    findEditor(workingCopy) {
        for (const editorIdentifier of this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
            if (this.isOpen(workingCopy, editorIdentifier.editor)) {
                return editorIdentifier;
            }
        }
        return undefined;
    }
    isOpen(workingCopy, editor) {
        for (const handler of this.handlers) {
            if (handler.handles(workingCopy) && handler.isOpen(workingCopy, editor)) {
                return true;
            }
        }
        return false;
    }
};
WorkingCopyEditorService = __decorate([
    __param(0, IEditorService)
], WorkingCopyEditorService);
export { WorkingCopyEditorService };
// Register Service
registerSingleton(IWorkingCopyEditorService, WorkingCopyEditorService, 1 /* InstantiationType.Delayed */);
