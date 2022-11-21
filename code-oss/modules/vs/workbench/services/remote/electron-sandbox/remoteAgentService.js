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
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IRemoteAuthorityResolverService, RemoteAuthorityResolverError } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { IProductService } from 'vs/platform/product/common/productService';
import { BrowserSocketFactory } from 'vs/platform/remote/browser/browserSocketFactory';
import { AbstractRemoteAgentService } from 'vs/workbench/services/remote/common/abstractRemoteAgentService';
import { ISignService } from 'vs/platform/sign/common/sign';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions } from 'vs/workbench/common/contributions';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { URI } from 'vs/base/common/uri';
import { IOpenerService } from 'vs/platform/opener/common/opener';
let RemoteAgentService = class RemoteAgentService extends AbstractRemoteAgentService {
    constructor(environmentService, productService, remoteAuthorityResolverService, signService, logService) {
        super(new BrowserSocketFactory(null), environmentService, productService, remoteAuthorityResolverService, signService, logService);
    }
};
RemoteAgentService = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IProductService),
    __param(2, IRemoteAuthorityResolverService),
    __param(3, ISignService),
    __param(4, ILogService)
], RemoteAgentService);
export { RemoteAgentService };
let RemoteConnectionFailureNotificationContribution = class RemoteConnectionFailureNotificationContribution {
    _remoteAgentService;
    _remoteAuthorityResolverService;
    constructor(_remoteAgentService, notificationService, environmentService, telemetryService, nativeHostService, _remoteAuthorityResolverService, openerService) {
        this._remoteAgentService = _remoteAgentService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        // Let's cover the case where connecting to fetch the remote extension info fails
        this._remoteAgentService.getRawEnvironment()
            .then(undefined, err => {
            if (!RemoteAuthorityResolverError.isHandled(err)) {
                const choices = [
                    {
                        label: nls.localize('devTools', "Open Developer Tools"),
                        run: () => nativeHostService.openDevTools()
                    }
                ];
                const troubleshootingURL = this._getTroubleshootingURL();
                if (troubleshootingURL) {
                    choices.push({
                        label: nls.localize('directUrl', "Open in browser"),
                        run: () => openerService.open(troubleshootingURL, { openExternal: true })
                    });
                }
                notificationService.prompt(Severity.Error, nls.localize('connectionError', "Failed to connect to the remote extension host server (Error: {0})", err ? err.message : ''), choices);
            }
        });
    }
    _getTroubleshootingURL() {
        const remoteAgentConnection = this._remoteAgentService.getConnection();
        if (!remoteAgentConnection) {
            return null;
        }
        const connectionData = this._remoteAuthorityResolverService.getConnectionData(remoteAgentConnection.remoteAuthority);
        if (!connectionData) {
            return null;
        }
        return URI.from({
            scheme: 'http',
            authority: `${connectionData.host}:${connectionData.port}`,
            path: `/version`
        });
    }
};
RemoteConnectionFailureNotificationContribution = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, INotificationService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ITelemetryService),
    __param(4, INativeHostService),
    __param(5, IRemoteAuthorityResolverService),
    __param(6, IOpenerService)
], RemoteConnectionFailureNotificationContribution);
const workbenchRegistry = Registry.as(Extensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(RemoteConnectionFailureNotificationContribution, 2 /* LifecyclePhase.Ready */);
