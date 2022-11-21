import { URI } from 'vs/base/common/uri';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IOpenerService, OpenOptions } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IAuthenticationService } from 'vs/workbench/services/authentication/common/authentication';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class OpenerValidatorContributions implements IWorkbenchContribution {
    private readonly _openerService;
    private readonly _storageService;
    private readonly _dialogService;
    private readonly _productService;
    private readonly _quickInputService;
    private readonly _editorService;
    private readonly _clipboardService;
    private readonly _telemetryService;
    private readonly _instantiationService;
    private readonly _authenticationService;
    private readonly _workspaceContextService;
    private readonly _configurationService;
    private readonly _workspaceTrustService;
    private _readWorkspaceTrustedDomainsResult;
    private _readAuthenticationTrustedDomainsResult;
    constructor(_openerService: IOpenerService, _storageService: IStorageService, _dialogService: IDialogService, _productService: IProductService, _quickInputService: IQuickInputService, _editorService: IEditorService, _clipboardService: IClipboardService, _telemetryService: ITelemetryService, _instantiationService: IInstantiationService, _authenticationService: IAuthenticationService, _workspaceContextService: IWorkspaceContextService, _configurationService: IConfigurationService, _workspaceTrustService: IWorkspaceTrustManagementService);
    validateLink(resource: URI | string, openOptions?: OpenOptions): Promise<boolean>;
}
/**
 * Check whether a domain like https://www.microsoft.com matches
 * the list of trusted domains.
 *
 * - Schemes must match
 * - There's no subdomain matching. For example https://microsoft.com doesn't match https://www.microsoft.com
 * - Star matches all subdomains. For example https://*.microsoft.com matches https://www.microsoft.com and https://foo.bar.microsoft.com
 */
export declare function isURLDomainTrusted(url: URI, trustedDomains: string[]): boolean;
