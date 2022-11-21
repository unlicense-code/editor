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
import { timeout } from 'vs/base/common/async';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { Emitter } from 'vs/base/common/event';
import { Disposable, dispose, toDisposable } from 'vs/base/common/lifecycle';
import { ILogService } from 'vs/platform/log/common/log';
/**
 * A helper class to track requests that have replies. Using this it's easy to implement an event
 * that accepts a reply.
 */
let RequestStore = class RequestStore extends Disposable {
    _logService;
    _lastRequestId = 0;
    _timeout;
    _pendingRequests = new Map();
    _pendingRequestDisposables = new Map();
    _onCreateRequest = this._register(new Emitter());
    onCreateRequest = this._onCreateRequest.event;
    /**
     * @param timeout How long in ms to allow requests to go unanswered for, undefined will use the
     * default (15 seconds).
     */
    constructor(timeout, _logService) {
        super();
        this._logService = _logService;
        this._timeout = timeout === undefined ? 15000 : timeout;
    }
    /**
     * Creates a request.
     * @param args The arguments to pass to the onCreateRequest event.
     */
    createRequest(args) {
        return new Promise((resolve, reject) => {
            const requestId = ++this._lastRequestId;
            this._pendingRequests.set(requestId, resolve);
            this._onCreateRequest.fire({ requestId, ...args });
            const tokenSource = new CancellationTokenSource();
            timeout(this._timeout, tokenSource.token).then(() => reject(`Request ${requestId} timed out (${this._timeout}ms)`));
            this._pendingRequestDisposables.set(requestId, [toDisposable(() => tokenSource.cancel())]);
        });
    }
    /**
     * Accept a reply to a request.
     * @param requestId The request ID originating from the onCreateRequest event.
     * @param data The reply data.
     */
    acceptReply(requestId, data) {
        const resolveRequest = this._pendingRequests.get(requestId);
        if (resolveRequest) {
            this._pendingRequests.delete(requestId);
            dispose(this._pendingRequestDisposables.get(requestId) || []);
            this._pendingRequestDisposables.delete(requestId);
            resolveRequest(data);
        }
        else {
            this._logService.warn(`RequestStore#acceptReply was called without receiving a matching request ${requestId}`);
        }
    }
};
RequestStore = __decorate([
    __param(1, ILogService)
], RequestStore);
export { RequestStore };
