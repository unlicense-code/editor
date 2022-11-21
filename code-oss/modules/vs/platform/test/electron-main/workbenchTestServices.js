/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Promises } from 'vs/base/common/async';
import { Event, Emitter } from 'vs/base/common/event';
export class TestLifecycleMainService {
    _serviceBrand;
    onBeforeShutdown = Event.None;
    _onWillShutdown = new Emitter();
    onWillShutdown = this._onWillShutdown.event;
    async fireOnWillShutdown() {
        const joiners = [];
        this._onWillShutdown.fire({
            reason: 1 /* ShutdownReason.QUIT */,
            join(promise) {
                joiners.push(promise);
            }
        });
        await Promises.settled(joiners);
    }
    onWillLoadWindow = Event.None;
    onBeforeCloseWindow = Event.None;
    wasRestarted = false;
    quitRequested = false;
    phase = 2 /* LifecycleMainPhase.Ready */;
    registerWindow(window) { }
    async reload(window, cli) { }
    async unload(window, reason) { return true; }
    async relaunch(options) { }
    async quit(willRestart) { return true; }
    async kill(code) { }
    async when(phase) { }
}
export class InMemoryTestStateMainService {
    _serviceBrand;
    data = new Map();
    setItem(key, data) {
        this.data.set(key, data);
    }
    setItems(items) {
        for (const { key, data } of items) {
            this.data.set(key, data);
        }
    }
    getItem(key) {
        return this.data.get(key);
    }
    removeItem(key) {
        this.data.delete(key);
    }
    async close() { }
}
