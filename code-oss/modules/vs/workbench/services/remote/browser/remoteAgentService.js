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
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { AbstractRemoteAgentService } from 'vs/workbench/services/remote/common/abstractRemoteAgentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { BrowserSocketFactory } from 'vs/platform/remote/browser/browserSocketFactory';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ILogService } from 'vs/platform/log/common/log';
import { Severity } from 'vs/platform/notification/common/notification';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { IHostService } from 'vs/workbench/services/host/browser/host';
let RemoteAgentService = class RemoteAgentService extends AbstractRemoteAgentService {
    constructor(webSocketFactory, environmentService, productService, remoteAuthorityResolverService, signService, logService) {
        super(new BrowserSocketFactory(webSocketFactory), environmentService, productService, remoteAuthorityResolverService, signService, logService);
    }
};
RemoteAgentService = __decorate([
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IProductService),
    __param(3, IRemoteAuthorityResolverService),
    __param(4, ISignService),
    __param(5, ILogService)
], RemoteAgentService);
export { RemoteAgentService };
let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution {
    _dialogService;
    _hostService;
    constructor(remoteAgentService, _dialogService, _hostService) {
        this._dialogService = _dialogService;
        this._hostService = _hostService;
        // Let's cover the case where connecting to fetch the remote extension info fails
        remoteAgentService.getRawEnvironment()
            .then(undefined, (err) => {
            if (!RemoteAuthorityResolverError.isHandled(err)) {
                this._presentConnectionError(err);
            }
        });
    }
    async _presentConnectionError(err) {
        const res = await this._dialogService.show(Severity.Error, nls.localize('connectionError', "An unexpected error occurred that requires a reload of this page."), [
            nls.localize('reload', "Reload")
        ], {
            detail: nls.localize('connectionErrorDetail', "The workbench failed to connect to the server (Error: {0})", err ? err.message : '')
        });
        if (res.choice === 0) {
            this._hostService.reload();
        }
    }
};
RemoteConnectionFailureNotificationContribution = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IDialogService),
    __param(2, IHostService)
], RemoteConnectionFailureNotificationContribution);
const workbenchRegistry = Registry.as(Extensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(RemoteConnectionFailureNotificationContribution, 2 /* LifecyclePhase.Ready */);
