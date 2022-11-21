import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { OperatingSystem } from 'vs/base/common/platform';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IProductService } from 'vs/platform/product/common/productService';
import { IRequestService } from 'vs/platform/request/common/request';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceTagsService } from 'vs/workbench/contrib/tags/common/workspaceTags';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
export declare const enum ExperimentState {
    Evaluating = 0,
    NoRun = 1,
    Run = 2,
    Complete = 3
}
export interface IExperimentAction {
    type: ExperimentActionType;
    properties: any;
}
export declare enum ExperimentActionType {
    Custom = "Custom",
    Prompt = "Prompt",
    AddToRecommendations = "AddToRecommendations",
    ExtensionSearchResults = "ExtensionSearchResults"
}
export declare type LocalizedPromptText = {
    [locale: string]: string;
};
export interface IExperimentActionPromptProperties {
    promptText: string | LocalizedPromptText;
    commands: IExperimentActionPromptCommand[];
}
export interface IExperimentActionPromptCommand {
    text: string | {
        [key: string]: string;
    };
    externalLink?: string;
    curatedExtensionsKey?: string;
    curatedExtensionsList?: string[];
    codeCommand?: {
        id: string;
        arguments: unknown[];
    };
}
export interface IExperiment {
    id: string;
    enabled: boolean;
    raw: IRawExperiment | undefined;
    state: ExperimentState;
    action?: IExperimentAction;
}
export interface IExperimentService {
    readonly _serviceBrand: undefined;
    getExperimentById(id: string): Promise<IExperiment>;
    getExperimentsByType(type: ExperimentActionType): Promise<IExperiment[]>;
    getCuratedExtensionsList(curatedExtensionsKey: string): Promise<string[]>;
    markAsCompleted(experimentId: string): void;
    onExperimentEnabled: Event<IExperiment>;
}
export declare const IExperimentService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExperimentService>;
/**
 * Current version of the experiment schema in this VS Code build. This *must*
 * be incremented when adding a condition, otherwise experiments might activate
 * on older versions of VS Code where not intended.
 */
export declare const currentSchemaVersion = 5;
interface IRawExperiment {
    id: string;
    schemaVersion: number;
    enabled?: boolean;
    condition?: {
        insidersOnly?: boolean;
        newUser?: boolean;
        displayLanguage?: string;
        userSetting?: {
            [key: string]: unknown;
        };
        activationEvent?: {
            event: string | string[];
            uniqueDays?: number;
            minEvents: number;
        };
        os: OperatingSystem[];
        installedExtensions?: {
            excludes?: string[];
            includes?: string[];
        };
        fileEdits?: {
            filePathPattern?: string;
            workspaceIncludes?: string[];
            workspaceExcludes?: string[];
            minEditCount: number;
        };
        experimentsPreviouslyRun?: {
            excludes?: string[];
            includes?: string[];
        };
        userProbability?: number;
    };
    action?: IExperimentAction;
    action2?: IExperimentAction;
}
interface IActivationEventRecord {
    count: number[];
    mostRecentBucket: number;
}
/**
 * Updates the activation record to shift off days outside the window
 * we're interested in.
 */
export declare const getCurrentActivationRecord: (previous?: IActivationEventRecord, dayWindow?: number) => IActivationEventRecord;
export declare class ExperimentService extends Disposable implements IExperimentService {
    private readonly storageService;
    private readonly extensionManagementService;
    private readonly textFileService;
    private readonly telemetryService;
    private readonly lifecycleService;
    private readonly requestService;
    private readonly configurationService;
    private readonly productService;
    private readonly workspaceTagsService;
    private readonly extensionService;
    private readonly environmentService;
    readonly _serviceBrand: undefined;
    private _experiments;
    private _loadExperimentsPromise;
    private _curatedMapping;
    private readonly _onExperimentEnabled;
    onExperimentEnabled: Event<IExperiment>;
    constructor(storageService: IStorageService, extensionManagementService: IExtensionManagementService, textFileService: ITextFileService, telemetryService: ITelemetryService, lifecycleService: ILifecycleService, requestService: IRequestService, configurationService: IConfigurationService, productService: IProductService, workspaceTagsService: IWorkspaceTagsService, extensionService: IExtensionService, environmentService: IWorkbenchEnvironmentService);
    getExperimentById(id: string): Promise<IExperiment>;
    getExperimentsByType(type: ExperimentActionType): Promise<IExperiment[]>;
    getCuratedExtensionsList(curatedExtensionsKey: string): Promise<string[]>;
    markAsCompleted(experimentId: string): void;
    protected getExperiments(): Promise<IRawExperiment[] | null>;
    private loadExperiments;
    private evaluateExperiment;
    private fireRunExperiment;
    private checkExperimentDependencies;
    private recordActivatedEvent;
    private checkActivationEventFrequency;
    private shouldRunExperiment;
}
export {};
