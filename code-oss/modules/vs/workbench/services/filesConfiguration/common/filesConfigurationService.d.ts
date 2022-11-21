import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { RawContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IFilesConfiguration } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
export declare const AutoSaveAfterShortDelayContext: RawContextKey<boolean>;
export interface IAutoSaveConfiguration {
    autoSaveDelay?: number;
    autoSaveFocusChange: boolean;
    autoSaveApplicationChange: boolean;
}
export declare const enum AutoSaveMode {
    OFF = 0,
    AFTER_SHORT_DELAY = 1,
    AFTER_LONG_DELAY = 2,
    ON_FOCUS_CHANGE = 3,
    ON_WINDOW_CHANGE = 4
}
export declare const IFilesConfigurationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IFilesConfigurationService>;
export interface IFilesConfigurationService {
    readonly _serviceBrand: undefined;
    readonly onAutoSaveConfigurationChange: Event<IAutoSaveConfiguration>;
    getAutoSaveConfiguration(): IAutoSaveConfiguration;
    getAutoSaveMode(): AutoSaveMode;
    toggleAutoSave(): Promise<void>;
    readonly onFilesAssociationChange: Event<void>;
    readonly isHotExitEnabled: boolean;
    readonly hotExitConfiguration: string | undefined;
    preventSaveConflicts(resource: URI, language?: string): boolean;
}
export declare class FilesConfigurationService extends Disposable implements IFilesConfigurationService {
    private readonly configurationService;
    private readonly contextService;
    readonly _serviceBrand: undefined;
    private static DEFAULT_AUTO_SAVE_MODE;
    private readonly _onAutoSaveConfigurationChange;
    readonly onAutoSaveConfigurationChange: Event<IAutoSaveConfiguration>;
    private readonly _onFilesAssociationChange;
    readonly onFilesAssociationChange: Event<void>;
    private configuredAutoSaveDelay?;
    private configuredAutoSaveOnFocusChange;
    private configuredAutoSaveOnWindowChange;
    private autoSaveAfterShortDelayContext;
    private currentFilesAssociationConfig;
    private currentHotExitConfig;
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, contextService: IWorkspaceContextService);
    private registerListeners;
    protected onFilesConfigurationChange(configuration: IFilesConfiguration): void;
    getAutoSaveMode(): AutoSaveMode;
    getAutoSaveConfiguration(): IAutoSaveConfiguration;
    toggleAutoSave(): Promise<void>;
    get isHotExitEnabled(): boolean;
    get hotExitConfiguration(): string;
    preventSaveConflicts(resource: URI, language?: string): boolean;
}
