/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { MainContext } from 'vs/workbench/api/common/extHost.protocol';
import { Disposable } from 'vs/workbench/api/common/extHostTypes';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export class ExtHostAuthentication {
    _proxy;
    _authenticationProviders = new Map();
    _providers = [];
    _onDidChangeSessions = new Emitter();
    onDidChangeSessions = this._onDidChangeSessions.event;
    _inFlightRequests = new Map();
    constructor(mainContext) {
        this._proxy = mainContext.getProxy(MainContext.MainThreadAuthentication);
    }
    $setProviders(providers) {
        this._providers = providers;
        return Promise.resolve();
    }
    async getSession(requestingExtension, providerId, scopes, options = {}) {
        const extensionId = ExtensionIdentifier.toKey(requestingExtension.identifier);
        const inFlightRequests = this._inFlightRequests.get(extensionId) || [];
        const sortedScopes = [...scopes].sort().join(' ');
        let inFlightRequest = inFlightRequests.find(request => request.providerId === providerId && request.scopes === sortedScopes);
        if (inFlightRequest) {
            return inFlightRequest.result;
        }
        else {
            const session = this._getSession(requestingExtension, extensionId, providerId, scopes, options);
            inFlightRequest = {
                providerId,
                scopes: sortedScopes,
                result: session
            };
            inFlightRequests.push(inFlightRequest);
            this._inFlightRequests.set(extensionId, inFlightRequests);
            try {
                await session;
            }
            finally {
                const requestIndex = inFlightRequests.findIndex(request => request.providerId === providerId && request.scopes === sortedScopes);
                if (requestIndex > -1) {
                    inFlightRequests.splice(requestIndex);
                    this._inFlightRequests.set(extensionId, inFlightRequests);
                }
            }
            return session;
        }
    }
    async _getSession(requestingExtension, extensionId, providerId, scopes, options = {}) {
        await this._proxy.$ensureProvider(providerId);
        const extensionName = requestingExtension.displayName || requestingExtension.name;
        return this._proxy.$getSession(providerId, scopes, extensionId, extensionName, options);
    }
    async removeSession(providerId, sessionId) {
        const providerData = this._authenticationProviders.get(providerId);
        if (!providerData) {
            return this._proxy.$removeSession(providerId, sessionId);
        }
        return providerData.provider.removeSession(sessionId);
    }
    registerAuthenticationProvider(id, label, provider, options) {
        if (this._authenticationProviders.get(id)) {
            throw new Error(`An authentication provider with id '${id}' is already registered.`);
        }
        this._authenticationProviders.set(id, { label, provider, options: options ?? { supportsMultipleAccounts: false } });
        if (!this._providers.find(p => p.id === id)) {
            this._providers.push({
                id: id,
                label: label
            });
        }
        const listener = provider.onDidChangeSessions(e => {
            this._proxy.$sendDidChangeSessions(id, {
                added: e.added ?? [],
                changed: e.changed ?? [],
                removed: e.removed ?? []
            });
        });
        this._proxy.$registerAuthenticationProvider(id, label, options?.supportsMultipleAccounts ?? false);
        return new Disposable(() => {
            listener.dispose();
            this._authenticationProviders.delete(id);
            const i = this._providers.findIndex(p => p.id === id);
            if (i > -1) {
                this._providers.splice(i);
            }
            this._proxy.$unregisterAuthenticationProvider(id);
        });
    }
    $createSession(providerId, scopes) {
        const providerData = this._authenticationProviders.get(providerId);
        if (providerData) {
            return Promise.resolve(providerData.provider.createSession(scopes));
        }
        throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    }
    $removeSession(providerId, sessionId) {
        const providerData = this._authenticationProviders.get(providerId);
        if (providerData) {
            return Promise.resolve(providerData.provider.removeSession(sessionId));
        }
        throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    }
    $getSessions(providerId, scopes) {
        const providerData = this._authenticationProviders.get(providerId);
        if (providerData) {
            return Promise.resolve(providerData.provider.getSessions(scopes));
        }
        throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    }
    $onDidChangeAuthenticationSessions(id, label) {
        this._onDidChangeSessions.fire({ provider: { id, label } });
        return Promise.resolve();
    }
}
