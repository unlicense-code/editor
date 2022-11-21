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
import * as nls from 'vs/nls';
import { IProductService } from 'vs/platform/product/common/productService';
import { Action } from 'vs/base/common/actions';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { randomPort } from 'vs/base/common/ports';
let DebugExtensionHostAction = class DebugExtensionHostAction extends Action {
    _debugService;
    _nativeHostService;
    _dialogService;
    _extensionService;
    productService;
    static ID = 'workbench.extensions.action.debugExtensionHost';
    static LABEL = nls.localize('debugExtensionHost', "Start Debugging Extension Host");
    static CSS_CLASS = 'debug-extension-host';
    constructor(_debugService, _nativeHostService, _dialogService, _extensionService, productService) {
        super(DebugExtensionHostAction.ID, DebugExtensionHostAction.LABEL, DebugExtensionHostAction.CSS_CLASS);
        this._debugService = _debugService;
        this._nativeHostService = _nativeHostService;
        this._dialogService = _dialogService;
        this._extensionService = _extensionService;
        this.productService = productService;
    }
    async run() {
        const inspectPorts = await this._extensionService.getInspectPorts(1 /* ExtensionHostKind.LocalProcess */, false);
        if (inspectPorts.length === 0) {
            const res = await this._dialogService.confirm({
                type: 'info',
                message: nls.localize('restart1', "Profile Extensions"),
                detail: nls.localize('restart2', "In order to profile extensions a restart is required. Do you want to restart '{0}' now?", this.productService.nameLong),
                primaryButton: nls.localize('restart3', "&&Restart"),
                secondaryButton: nls.localize('cancel', "&&Cancel")
            });
            if (res.confirmed) {
                await this._nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${randomPort()}`] });
            }
            return;
        }
        if (inspectPorts.length > 1) {
            // TODO
            console.warn(`There are multiple extension hosts available for debugging. Picking the first one...`);
        }
        return this._debugService.startDebugging(undefined, {
            type: 'node',
            name: nls.localize('debugExtensionHost.launch.name', "Attach Extension Host"),
            request: 'attach',
            port: inspectPorts[0]
        });
    }
};
DebugExtensionHostAction = __decorate([
    __param(0, IDebugService),
    __param(1, INativeHostService),
    __param(2, IDialogService),
    __param(3, IExtensionService),
    __param(4, IProductService)
], DebugExtensionHostAction);
export { DebugExtensionHostAction };
