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
import { Schemas } from 'vs/base/common/network';
import Severity from 'vs/base/common/severity';
import { URI } from 'vs/base/common/uri';
import { localize } from 'vs/nls';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IOpenerService, matchesScheme } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { configureOpenerTrustedDomainsHandler, readAuthenticationTrustedDomains, readStaticTrustedDomains, readWorkspaceTrustedDomains } from 'vs/workbench/contrib/url/browser/trustedDomains';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IdleValue } from 'vs/base/common/async';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { testUrlMatchesGlob } from 'vs/workbench/contrib/url/common/urlGlob';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
let OpenerValidatorContributions = class OpenerValidatorContributions {
    _openerService;
    _storageService;
    _dialogService;
    _productService;
    _quickInputService;
    _editorService;
    _clipboardService;
    _telemetryService;
    _instantiationService;
    _authenticationService;
    _workspaceContextService;
    _configurationService;
    _workspaceTrustService;
    _readWorkspaceTrustedDomainsResult;
    _readAuthenticationTrustedDomainsResult;
    constructor(_openerService, _storageService, _dialogService, _productService, _quickInputService, _editorService, _clipboardService, _telemetryService, _instantiationService, _authenticationService, _workspaceContextService, _configurationService, _workspaceTrustService) {
        this._openerService = _openerService;
        this._storageService = _storageService;
        this._dialogService = _dialogService;
        this._productService = _productService;
        this._quickInputService = _quickInputService;
        this._editorService = _editorService;
        this._clipboardService = _clipboardService;
        this._telemetryService = _telemetryService;
        this._instantiationService = _instantiationService;
        this._authenticationService = _authenticationService;
        this._workspaceContextService = _workspaceContextService;
        this._configurationService = _configurationService;
        this._workspaceTrustService = _workspaceTrustService;
        this._openerService.registerValidator({ shouldOpen: (uri, options) => this.validateLink(uri, options) });
        this._readAuthenticationTrustedDomainsResult = new IdleValue(() => this._instantiationService.invokeFunction(readAuthenticationTrustedDomains));
        this._authenticationService.onDidRegisterAuthenticationProvider(() => {
            this._readAuthenticationTrustedDomainsResult?.dispose();
            this._readAuthenticationTrustedDomainsResult = new IdleValue(() => this._instantiationService.invokeFunction(readAuthenticationTrustedDomains));
        });
        this._readWorkspaceTrustedDomainsResult = new IdleValue(() => this._instantiationService.invokeFunction(readWorkspaceTrustedDomains));
        this._workspaceContextService.onDidChangeWorkspaceFolders(() => {
            this._readWorkspaceTrustedDomainsResult?.dispose();
            this._readWorkspaceTrustedDomainsResult = new IdleValue(() => this._instantiationService.invokeFunction(readWorkspaceTrustedDomains));
        });
    }
    async validateLink(resource, openOptions) {
        if (!matchesScheme(resource, Schemas.http) && !matchesScheme(resource, Schemas.https)) {
            return true;
        }
        if (openOptions?.fromWorkspace && this._workspaceTrustService.isWorkspaceTrusted() && !this._configurationService.getValue('workbench.trustedDomains.promptInTrustedWorkspace')) {
            return true;
        }
        const originalResource = resource;
        if (typeof resource === 'string') {
            resource = URI.parse(resource);
        }
        const { scheme, authority, path, query, fragment } = resource;
        const domainToOpen = `${scheme}://${authority}`;
        const [workspaceDomains, userDomains] = await Promise.all([this._readWorkspaceTrustedDomainsResult.value, this._readAuthenticationTrustedDomainsResult.value]);
        const { defaultTrustedDomains, trustedDomains, } = this._instantiationService.invokeFunction(readStaticTrustedDomains);
        const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains, ...userDomains, ...workspaceDomains];
        if (isURLDomainTrusted(resource, allTrustedDomains)) {
            return true;
        }
        else {
            let formattedLink = `${scheme}://${authority}${path}`;
            const linkTail = `${query ? '?' + query : ''}${fragment ? '#' + fragment : ''}`;
            const remainingLength = Math.max(0, 60 - formattedLink.length);
            const linkTailLengthToKeep = Math.min(Math.max(5, remainingLength), linkTail.length);
            if (linkTailLengthToKeep === linkTail.length) {
                formattedLink += linkTail;
            }
            else {
                // keep the first char ? or #
                // add ... and keep the tail end as much as possible
                formattedLink += linkTail.charAt(0) + '...' + linkTail.substring(linkTail.length - linkTailLengthToKeep + 1);
            }
            const { choice } = await this._dialogService.show(Severity.Info, localize('openExternalLinkAt', 'Do you want {0} to open the external website?', this._productService.nameShort), [
                localize('open', 'Open'),
                localize('copy', 'Copy'),
                localize('cancel', 'Cancel'),
                localize('configureTrustedDomains', 'Configure Trusted Domains')
            ], {
                detail: typeof originalResource === 'string' ? originalResource : formattedLink,
                cancelId: 2
            });
            // Open Link
            if (choice === 0) {
                return true;
            }
            // Copy Link
            else if (choice === 1) {
                this._clipboardService.writeText(typeof originalResource === 'string' ? originalResource : resource.toString(true));
            }
            // Configure Trusted Domains
            else if (choice === 3) {
                const pickedDomains = await configureOpenerTrustedDomainsHandler(trustedDomains, domainToOpen, resource, this._quickInputService, this._storageService, this._editorService, this._telemetryService);
                // Trust all domains
                if (pickedDomains.indexOf('*') !== -1) {
                    return true;
                }
                // Trust current domain
                if (isURLDomainTrusted(resource, pickedDomains)) {
                    return true;
                }
                return false;
            }
            return false;
        }
    }
};
OpenerValidatorContributions = __decorate([
    __param(0, IOpenerService),
    __param(1, IStorageService),
    __param(2, IDialogService),
    __param(3, IProductService),
    __param(4, IQuickInputService),
    __param(5, IEditorService),
    __param(6, IClipboardService),
    __param(7, ITelemetryService),
    __param(8, IInstantiationService),
    __param(9, IAuthenticationService),
    __param(10, IWorkspaceContextService),
    __param(11, IConfigurationService),
    __param(12, IWorkspaceTrustManagementService)
], OpenerValidatorContributions);
export { OpenerValidatorContributions };
const rLocalhost = /^localhost(:\d+)?$/i;
const r127 = /^127.0.0.1(:\d+)?$/;
function isLocalhostAuthority(authority) {
    return rLocalhost.test(authority) || r127.test(authority);
}
/**
 * Case-normalize some case-insensitive URLs, such as github.
 */
function normalizeURL(url) {
    const caseInsensitiveAuthorities = ['github.com'];
    try {
        const parsed = typeof url === 'string' ? URI.parse(url, true) : url;
        if (caseInsensitiveAuthorities.includes(parsed.authority)) {
            return parsed.with({ path: parsed.path.toLowerCase() }).toString(true);
        }
        else {
            return parsed.toString(true);
        }
    }
    catch {
        return url.toString();
    }
}
/**
 * Check whether a domain like https://www.microsoft.com matches
 * the list of trusted domains.
 *
 * - Schemes must match
 * - There's no subdomain matching. For example https://microsoft.com doesn't match https://www.microsoft.com
 * - Star matches all subdomains. For example https://*.microsoft.com matches https://www.microsoft.com and https://foo.bar.microsoft.com
 */
export function isURLDomainTrusted(url, trustedDomains) {
    url = URI.parse(normalizeURL(url));
    trustedDomains = trustedDomains.map(normalizeURL);
    if (isLocalhostAuthority(url.authority)) {
        return true;
    }
    for (let i = 0; i < trustedDomains.length; i++) {
        if (trustedDomains[i] === '*') {
            return true;
        }
        if (testUrlMatchesGlob(url, trustedDomains[i])) {
            return true;
        }
    }
    return false;
}
