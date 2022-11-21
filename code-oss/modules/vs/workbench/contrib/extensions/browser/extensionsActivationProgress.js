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
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { localize } from 'vs/nls';
import { DeferredPromise, timeout } from 'vs/base/common/async';
import { ILogService } from 'vs/platform/log/common/log';
let ExtensionActivationProgress = class ExtensionActivationProgress {
    _listener;
    constructor(extensionService, progressService, logService) {
        const options = {
            location: 10 /* ProgressLocation.Window */,
            title: localize('activation', "Activating Extensions...")
        };
        let deferred;
        let count = 0;
        this._listener = extensionService.onWillActivateByEvent(e => {
            logService.trace('onWillActivateByEvent: ', e.event);
            if (!deferred) {
                deferred = new DeferredPromise();
                progressService.withProgress(options, _ => deferred.p);
            }
            count++;
            Promise.race([e.activation, timeout(5000)]).finally(() => {
                if (--count === 0) {
                    deferred.complete(undefined);
                    deferred = undefined;
                }
            });
        });
    }
    dispose() {
        this._listener.dispose();
    }
};
ExtensionActivationProgress = __decorate([
    __param(0, IExtensionService),
    __param(1, IProgressService),
    __param(2, ILogService)
], ExtensionActivationProgress);
export { ExtensionActivationProgress };
