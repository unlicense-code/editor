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
import { app } from 'electron';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { hash } from 'vs/base/common/hash';
import { Disposable } from 'vs/base/common/lifecycle';
import { generateUuid } from 'vs/base/common/uuid';
import { ICredentialsMainService } from 'vs/platform/credentials/common/credentials';
import { IEncryptionMainService } from 'vs/platform/encryption/common/encryptionService';
import { ILogService } from 'vs/platform/log/common/log';
import { IProductService } from 'vs/platform/product/common/productService';
import { IWindowsMainService } from 'vs/platform/windows/electron-main/windows';
var ProxyAuthState;
(function (ProxyAuthState) {
    /**
     * Initial state: we will try to use stored credentials
     * first to reply to the auth challenge.
     */
    ProxyAuthState[ProxyAuthState["Initial"] = 1] = "Initial";
    /**
     * We used stored credentials and are still challenged,
     * so we will show a login dialog next.
     */
    ProxyAuthState[ProxyAuthState["StoredCredentialsUsed"] = 2] = "StoredCredentialsUsed";
    /**
     * Finally, if we showed a login dialog already, we will
     * not show any more login dialogs until restart to reduce
     * the UI noise.
     */
    ProxyAuthState[ProxyAuthState["LoginDialogShown"] = 3] = "LoginDialogShown";
})(ProxyAuthState || (ProxyAuthState = {}));
let ProxyAuthHandler = class ProxyAuthHandler extends Disposable {
    logService;
    windowsMainService;
    credentialsService;
    encryptionMainService;
    productService;
    PROXY_CREDENTIALS_SERVICE_KEY = `${this.productService.urlProtocol}.proxy-credentials`;
    pendingProxyResolve = undefined;
    state = ProxyAuthState.Initial;
    sessionCredentials = undefined;
    constructor(logService, windowsMainService, credentialsService, encryptionMainService, productService) {
        super();
        this.logService = logService;
        this.windowsMainService = windowsMainService;
        this.credentialsService = credentialsService;
        this.encryptionMainService = encryptionMainService;
        this.productService = productService;
        this.registerListeners();
    }
    registerListeners() {
        const onLogin = Event.fromNodeEventEmitter(app, 'login', (event, webContents, req, authInfo, callback) => ({ event, webContents, req, authInfo, callback }));
        this._register(onLogin(this.onLogin, this));
    }
    async onLogin({ event, authInfo, req, callback }) {
        if (!authInfo.isProxy) {
            return; // only for proxy
        }
        if (!this.pendingProxyResolve && this.state === ProxyAuthState.LoginDialogShown && req.firstAuthAttempt) {
            this.logService.trace('auth#onLogin (proxy) - exit - proxy dialog already shown');
            return; // only one dialog per session at max (except when firstAuthAttempt: false which indicates a login problem)
        }
        // Signal we handle this event on our own, otherwise
        // Electron will ignore our provided credentials.
        event.preventDefault();
        let credentials = undefined;
        if (!this.pendingProxyResolve) {
            this.logService.trace('auth#onLogin (proxy) - no pending proxy handling found, starting new');
            this.pendingProxyResolve = this.resolveProxyCredentials(authInfo);
            try {
                credentials = await this.pendingProxyResolve;
            }
            finally {
                this.pendingProxyResolve = undefined;
            }
        }
        else {
            this.logService.trace('auth#onLogin (proxy) - pending proxy handling found');
            credentials = await this.pendingProxyResolve;
        }
        // According to Electron docs, it is fine to call back without
        // username or password to signal that the authentication was handled
        // by us, even though without having credentials received:
        //
        // > If `callback` is called without a username or password, the authentication
        // > request will be cancelled and the authentication error will be returned to the
        // > page.
        callback(credentials?.username, credentials?.password);
    }
    async resolveProxyCredentials(authInfo) {
        this.logService.trace('auth#resolveProxyCredentials (proxy) - enter');
        try {
            const credentials = await this.doResolveProxyCredentials(authInfo);
            if (credentials) {
                this.logService.trace('auth#resolveProxyCredentials (proxy) - got credentials');
                return credentials;
            }
            else {
                this.logService.trace('auth#resolveProxyCredentials (proxy) - did not get credentials');
            }
        }
        finally {
            this.logService.trace('auth#resolveProxyCredentials (proxy) - exit');
        }
        return undefined;
    }
    async doResolveProxyCredentials(authInfo) {
        this.logService.trace('auth#doResolveProxyCredentials - enter', authInfo);
        // Compute a hash over the authentication info to be used
        // with the credentials store to return the right credentials
        // given the properties of the auth request
        // (see https://github.com/microsoft/vscode/issues/109497)
        const authInfoHash = String(hash({ scheme: authInfo.scheme, host: authInfo.host, port: authInfo.port }));
        // Find any previously stored credentials
        let storedUsername = undefined;
        let storedPassword = undefined;
        try {
            const encryptedSerializedProxyCredentials = await this.credentialsService.getPassword(this.PROXY_CREDENTIALS_SERVICE_KEY, authInfoHash);
            if (encryptedSerializedProxyCredentials) {
                const credentials = JSON.parse(await this.encryptionMainService.decrypt(encryptedSerializedProxyCredentials));
                storedUsername = credentials.username;
                storedPassword = credentials.password;
            }
        }
        catch (error) {
            this.logService.error(error); // handle errors by asking user for login via dialog
        }
        // Reply with stored credentials unless we used them already.
        // In that case we need to show a login dialog again because
        // they seem invalid.
        if (this.state !== ProxyAuthState.StoredCredentialsUsed && typeof storedUsername === 'string' && typeof storedPassword === 'string') {
            this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - found stored credentials to use');
            this.state = ProxyAuthState.StoredCredentialsUsed;
            return { username: storedUsername, password: storedPassword };
        }
        // Find suitable window to show dialog: prefer to show it in the
        // active window because any other network request will wait on
        // the credentials and we want the user to present the dialog.
        const window = this.windowsMainService.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
        if (!window) {
            this.logService.trace('auth#doResolveProxyCredentials (proxy) - exit - no opened window found to show dialog in');
            return undefined; // unexpected
        }
        this.logService.trace(`auth#doResolveProxyCredentials (proxy) - asking window ${window.id} to handle proxy login`);
        // Open proxy dialog
        const payload = {
            authInfo,
            username: this.sessionCredentials?.username ?? storedUsername,
            password: this.sessionCredentials?.password ?? storedPassword,
            replyChannel: `vscode:proxyAuthResponse:${generateUuid()}`
        };
        window.sendWhenReady('vscode:openProxyAuthenticationDialog', CancellationToken.None, payload);
        this.state = ProxyAuthState.LoginDialogShown;
        // Handle reply
        const loginDialogCredentials = await new Promise(resolve => {
            const proxyAuthResponseHandler = async (event, channel, reply /* canceled */) => {
                if (channel === payload.replyChannel) {
                    this.logService.trace(`auth#doResolveProxyCredentials - exit - received credentials from window ${window.id}`);
                    window.win?.webContents.off('ipc-message', proxyAuthResponseHandler);
                    // We got credentials from the window
                    if (reply) {
                        const credentials = { username: reply.username, password: reply.password };
                        // Update stored credentials based on `remember` flag
                        try {
                            if (reply.remember) {
                                const encryptedSerializedCredentials = await this.encryptionMainService.encrypt(JSON.stringify(credentials));
                                await this.credentialsService.setPassword(this.PROXY_CREDENTIALS_SERVICE_KEY, authInfoHash, encryptedSerializedCredentials);
                            }
                            else {
                                await this.credentialsService.deletePassword(this.PROXY_CREDENTIALS_SERVICE_KEY, authInfoHash);
                            }
                        }
                        catch (error) {
                            this.logService.error(error); // handle gracefully
                        }
                        resolve({ username: credentials.username, password: credentials.password });
                    }
                    // We did not get any credentials from the window (e.g. cancelled)
                    else {
                        resolve(undefined);
                    }
                }
            };
            window.win?.webContents.on('ipc-message', proxyAuthResponseHandler);
        });
        // Remember credentials for the session in case
        // the credentials are wrong and we show the dialog
        // again
        this.sessionCredentials = loginDialogCredentials;
        return loginDialogCredentials;
    }
};
ProxyAuthHandler = __decorate([
    __param(0, ILogService),
    __param(1, IWindowsMainService),
    __param(2, ICredentialsMainService),
    __param(3, IEncryptionMainService),
    __param(4, IProductService)
], ProxyAuthHandler);
export { ProxyAuthHandler };
