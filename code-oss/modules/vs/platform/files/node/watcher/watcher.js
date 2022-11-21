/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { ParcelWatcher } from 'vs/platform/files/node/watcher/parcel/parcelWatcher';
import { NodeJSWatcher } from 'vs/platform/files/node/watcher/nodejs/nodejsWatcher';
import { Promises } from 'vs/base/common/async';
export class UniversalWatcher extends Disposable {
    recursiveWatcher = this._register(new ParcelWatcher());
    nonRecursiveWatcher = this._register(new NodeJSWatcher());
    onDidChangeFile = Event.any(this.recursiveWatcher.onDidChangeFile, this.nonRecursiveWatcher.onDidChangeFile);
    onDidLogMessage = Event.any(this.recursiveWatcher.onDidLogMessage, this.nonRecursiveWatcher.onDidLogMessage);
    onDidError = Event.any(this.recursiveWatcher.onDidError, this.nonRecursiveWatcher.onDidError);
    async watch(requests) {
        const recursiveWatchRequests = [];
        const nonRecursiveWatchRequests = [];
        for (const request of requests) {
            if (request.recursive) {
                recursiveWatchRequests.push(request);
            }
            else {
                nonRecursiveWatchRequests.push(request);
            }
        }
        await Promises.settled([
            this.recursiveWatcher.watch(recursiveWatchRequests),
            this.nonRecursiveWatcher.watch(nonRecursiveWatchRequests)
        ]);
    }
    async setVerboseLogging(enabled) {
        await Promises.settled([
            this.recursiveWatcher.setVerboseLogging(enabled),
            this.nonRecursiveWatcher.setVerboseLogging(enabled)
        ]);
    }
    async stop() {
        await Promises.settled([
            this.recursiveWatcher.stop(),
            this.nonRecursiveWatcher.stop()
        ]);
    }
}
