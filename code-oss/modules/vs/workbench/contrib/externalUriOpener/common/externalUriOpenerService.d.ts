import { CancellationToken } from 'vs/base/common/cancellation';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import * as languages from 'vs/editor/common/languages';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILogService } from 'vs/platform/log/common/log';
import { IExternalOpener, IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
export declare const IExternalUriOpenerService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExternalUriOpenerService>;
export interface IExternalOpenerProvider {
    getOpeners(targetUri: URI): AsyncIterable<IExternalUriOpener>;
}
export interface IExternalUriOpener {
    readonly id: string;
    readonly label: string;
    canOpen(uri: URI, token: CancellationToken): Promise<languages.ExternalUriOpenerPriority>;
    openExternalUri(uri: URI, ctx: {
        sourceUri: URI;
    }, token: CancellationToken): Promise<boolean>;
}
export interface IExternalUriOpenerService {
    readonly _serviceBrand: undefined;
    /**
     * Registers a provider for external resources openers.
     */
    registerExternalOpenerProvider(provider: IExternalOpenerProvider): IDisposable;
    /**
     * Get the configured IExternalUriOpener for the the uri.
     * If there is no opener configured, then returns the first opener that can handle the uri.
     */
    getOpener(uri: URI, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<IExternalUriOpener | undefined>;
}
export declare class ExternalUriOpenerService extends Disposable implements IExternalUriOpenerService, IExternalOpener {
    private readonly configurationService;
    private readonly logService;
    private readonly preferencesService;
    private readonly quickInputService;
    readonly _serviceBrand: undefined;
    private readonly _providers;
    constructor(openerService: IOpenerService, configurationService: IConfigurationService, logService: ILogService, preferencesService: IPreferencesService, quickInputService: IQuickInputService);
    registerExternalOpenerProvider(provider: IExternalOpenerProvider): IDisposable;
    private getOpeners;
    openExternal(href: string, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<boolean>;
    getOpener(targetUri: URI, ctx: {
        sourceUri: URI;
        preferredOpenerId?: string;
    }, token: CancellationToken): Promise<IExternalUriOpener | undefined>;
    private getAllOpenersForUri;
    private getConfiguredOpenerForUri;
    private showOpenerPrompt;
}
