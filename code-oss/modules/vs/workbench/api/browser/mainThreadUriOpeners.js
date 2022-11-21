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
import { Action } from 'vs/base/common/actions';
import { isCancellationError } from 'vs/base/common/errors';
import { Disposable } from 'vs/base/common/lifecycle';
import { Schemas } from 'vs/base/common/network';
import { localize } from 'vs/nls';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ExtHostContext, MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { defaultExternalUriOpenerId } from 'vs/workbench/contrib/externalUriOpener/common/configuration';
import { ContributedExternalUriOpenersStore } from 'vs/workbench/contrib/externalUriOpener/common/contributedOpeners';
import { IExternalUriOpenerService } from 'vs/workbench/contrib/externalUriOpener/common/externalUriOpenerService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers';
let MainThreadUriOpeners = class MainThreadUriOpeners extends Disposable {
    extensionService;
    openerService;
    notificationService;
    proxy;
    _registeredOpeners = new Map();
    _contributedExternalUriOpenersStore;
    constructor(context, storageService, externalUriOpenerService, extensionService, openerService, notificationService) {
        super();
        this.extensionService = extensionService;
        this.openerService = openerService;
        this.notificationService = notificationService;
        this.proxy = context.getProxy(ExtHostContext.ExtHostUriOpeners);
        this._register(externalUriOpenerService.registerExternalOpenerProvider(this));
        this._contributedExternalUriOpenersStore = this._register(new ContributedExternalUriOpenersStore(storageService, extensionService));
    }
    async *getOpeners(targetUri) {
        // Currently we only allow openers for http and https urls
        if (targetUri.scheme !== Schemas.http && targetUri.scheme !== Schemas.https) {
            return;
        }
        await this.extensionService.activateByEvent(`onOpenExternalUri:${targetUri.scheme}`);
        for (const [id, openerMetadata] of this._registeredOpeners) {
            if (openerMetadata.schemes.has(targetUri.scheme)) {
                yield this.createOpener(id, openerMetadata);
            }
        }
    }
    createOpener(id, metadata) {
        return {
            id: id,
            label: metadata.label,
            canOpen: (uri, token) => {
                return this.proxy.$canOpenUri(id, uri, token);
            },
            openExternalUri: async (uri, ctx, token) => {
                try {
                    await this.proxy.$openUri(id, { resolvedUri: uri, sourceUri: ctx.sourceUri }, token);
                }
                catch (e) {
                    if (!isCancellationError(e)) {
                        const openDefaultAction = new Action('default', localize('openerFailedUseDefault', "Open using default opener"), undefined, undefined, async () => {
                            await this.openerService.open(uri, {
                                allowTunneling: false,
                                allowContributedOpeners: defaultExternalUriOpenerId,
                            });
                        });
                        openDefaultAction.tooltip = uri.toString();
                        this.notificationService.notify({
                            severity: Severity.Error,
                            message: localize({
                                key: 'openerFailedMessage',
                                comment: ['{0} is the id of the opener. {1} is the url being opened.'],
                            }, 'Could not open uri with \'{0}\': {1}', id, e.toString()),
                            actions: {
                                primary: [
                                    openDefaultAction
                                ]
                            }
                        });
                    }
                }
                return true;
            },
        };
    }
    async $registerUriOpener(id, schemes, extensionId, label) {
        if (this._registeredOpeners.has(id)) {
            throw new Error(`Opener with id '${id}' already registered`);
        }
        this._registeredOpeners.set(id, {
            schemes: new Set(schemes),
            label,
            extensionId,
        });
        this._contributedExternalUriOpenersStore.didRegisterOpener(id, extensionId.value);
    }
    async $unregisterUriOpener(id) {
        this._registeredOpeners.delete(id);
        this._contributedExternalUriOpenersStore.delete(id);
    }
    dispose() {
        super.dispose();
        this._registeredOpeners.clear();
    }
};
MainThreadUriOpeners = __decorate([
    extHostNamedCustomer(MainContext.MainThreadUriOpeners),
    __param(1, IStorageService),
    __param(2, IExternalUriOpenerService),
    __param(3, IExtensionService),
    __param(4, IOpenerService),
    __param(5, INotificationService)
], MainThreadUriOpeners);
export { MainThreadUriOpeners };
