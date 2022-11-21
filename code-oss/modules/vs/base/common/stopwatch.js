/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { globals } from 'vs/base/common/platform';
const hasPerformanceNow = (globals.performance && typeof globals.performance.now === 'function');
export class StopWatch {
    _highResolution;
    _startTime;
    _stopTime;
    static create(highResolution = true) {
        return new StopWatch(highResolution);
    }
    constructor(highResolution) {
        this._highResolution = hasPerformanceNow && highResolution;
        this._startTime = this._now();
        this._stopTime = -1;
    }
    stop() {
        this._stopTime = this._now();
    }
    reset() {
        this._startTime = this._now();
        this._stopTime = -1;
    }
    elapsed() {
        if (this._stopTime !== -1) {
            return this._stopTime - this._startTime;
        }
        return this._now() - this._startTime;
    }
    _now() {
        return this._highResolution ? globals.performance.now() : Date.now();
    }
}
