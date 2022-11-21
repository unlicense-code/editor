import { URI } from 'vs/base/common/uri';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
export declare const TRUSTED_DOMAINS_STORAGE_KEY = "http.linkProtectionTrustedDomains";
export declare const TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = "http.linkProtectionTrustedDomainsContent";
export declare const manageTrustedDomainSettingsCommand: {
    id: string;
    description: {
        description: string;
        args: never[];
    };
    handler: (accessor: ServicesAccessor) => Promise<void>;
};
export declare function configureOpenerTrustedDomainsHandler(trustedDomains: string[], domainToConfigure: string, resource: URI, quickInputService: IQuickInputService, storageService: IStorageService, editorService: IEditorService, telemetryService: ITelemetryService): Promise<string[]>;
export declare function extractGitHubRemotesFromGitConfig(gitConfig: string): string[];
export interface IStaticTrustedDomains {
    readonly defaultTrustedDomains: string[];
    readonly trustedDomains: string[];
}
export interface ITrustedDomains extends IStaticTrustedDomains {
    readonly userDomains: string[];
    readonly workspaceDomains: string[];
}
export declare function readTrustedDomains(accessor: ServicesAccessor): Promise<ITrustedDomains>;
export declare function readWorkspaceTrustedDomains(accessor: ServicesAccessor): Promise<string[]>;
export declare function readAuthenticationTrustedDomains(accessor: ServicesAccessor): Promise<string[]>;
export declare function readStaticTrustedDomains(accessor: ServicesAccessor): IStaticTrustedDomains;
