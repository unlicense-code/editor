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
import { Disposable } from 'vs/base/common/lifecycle';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
let NotebookRendererMessagingService = class NotebookRendererMessagingService extends Disposable {
    extensionService;
    /**
     * Activation promises. Maps renderer IDs to a queue of messages that should
     * be sent once activation finishes, or undefined if activation is complete.
     */
    activations = new Map();
    scopedMessaging = new Map();
    postMessageEmitter = this._register(new Emitter());
    onShouldPostMessage = this.postMessageEmitter.event;
    constructor(extensionService) {
        super();
        this.extensionService = extensionService;
    }
    /** @inheritdoc */
    receiveMessage(editorId, rendererId, message) {
        if (editorId === undefined) {
            const sends = [...this.scopedMessaging.values()].map(e => e.receiveMessageHandler?.(rendererId, message));
            return Promise.all(sends).then(s => s.some(s => !!s));
        }
        return this.scopedMessaging.get(editorId)?.receiveMessageHandler?.(rendererId, message) ?? Promise.resolve(false);
    }
    /** @inheritdoc */
    prepare(rendererId) {
        if (this.activations.has(rendererId)) {
            return;
        }
        const queue = [];
        this.activations.set(rendererId, queue);
        this.extensionService.activateByEvent(`onRenderer:${rendererId}`).then(() => {
            for (const message of queue) {
                this.postMessageEmitter.fire(message);
            }
            this.activations.set(rendererId, undefined);
        });
    }
    /** @inheritdoc */
    getScoped(editorId) {
        const existing = this.scopedMessaging.get(editorId);
        if (existing) {
            return existing;
        }
        const messaging = {
            postMessage: (rendererId, message) => this.postMessage(editorId, rendererId, message),
            dispose: () => this.scopedMessaging.delete(editorId),
        };
        this.scopedMessaging.set(editorId, messaging);
        return messaging;
    }
    postMessage(editorId, rendererId, message) {
        if (!this.activations.has(rendererId)) {
            this.prepare(rendererId);
        }
        const activation = this.activations.get(rendererId);
        const toSend = { rendererId, editorId, message };
        if (activation === undefined) {
            this.postMessageEmitter.fire(toSend);
        }
        else {
            activation.push(toSend);
        }
    }
};
NotebookRendererMessagingService = __decorate([
    __param(0, IExtensionService)
], NotebookRendererMessagingService);
export { NotebookRendererMessagingService };
