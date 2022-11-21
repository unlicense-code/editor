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
import { inputLatency } from 'vs/base/browser/performance';
import { RunOnceScheduler } from 'vs/base/common/async';
import { Event } from 'vs/base/common/event';
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
let InputLatencyContrib = class InputLatencyContrib extends Disposable {
    _editorService;
    _telemetryService;
    _listener = this._register(new MutableDisposable());
    _scheduler;
    constructor(_editorService, _telemetryService) {
        super();
        this._editorService = _editorService;
        this._telemetryService = _telemetryService;
        // The current sampling strategy is when the active editor changes, start sampling and
        // report the results after 60 seconds. It's done this way as we don't want to sample
        // everything, just somewhat randomly, and using an interval would utilize CPU when the
        // application is inactive.
        this._scheduler = this._register(new RunOnceScheduler(() => {
            this._logSamples();
            this._setupListener();
        }, 60000));
        this._setupListener();
    }
    _setupListener() {
        this._listener.value = Event.once(this._editorService.onDidActiveEditorChange)(() => this._scheduler.schedule());
    }
    _logSamples() {
        const measurements = inputLatency.getAndClearMeasurements();
        if (!measurements) {
            return;
        }
        this._telemetryService.publicLog2('performance.inputLatency', measurements);
    }
};
InputLatencyContrib = __decorate([
    __param(0, IEditorService),
    __param(1, ITelemetryService)
], InputLatencyContrib);
export { InputLatencyContrib };
