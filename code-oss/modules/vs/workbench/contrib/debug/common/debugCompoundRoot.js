/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
export class DebugCompoundRoot {
    stopped = false;
    stopEmitter = new Emitter();
    onDidSessionStop = this.stopEmitter.event;
    sessionStopped() {
        if (!this.stopped) { // avoid sending extranous terminate events
            this.stopped = true;
            this.stopEmitter.fire();
        }
    }
}
