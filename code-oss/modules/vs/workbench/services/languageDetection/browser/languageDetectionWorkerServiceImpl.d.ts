import { Disposable } from 'vs/base/common/lifecycle';
import { ILanguageDetectionService } from 'vs/workbench/services/languageDetection/common/languageDetectionWorkerService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { URI } from 'vs/base/common/uri';
import { LanguageDetectionSimpleWorker } from 'vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker';
import { IModelService } from 'vs/editor/common/services/model';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { EditorWorkerClient } from 'vs/editor/browser/services/editorWorkerService';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { IDiagnosticsService } from 'vs/platform/diagnostics/common/diagnostics';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ILogService } from 'vs/platform/log/common/log';
export declare class LanguageDetectionService extends Disposable implements ILanguageDetectionService {
    private readonly _environmentService;
    private readonly _configurationService;
    private readonly _diagnosticsService;
    private readonly _workspaceContextService;
    private readonly _editorService;
    private readonly _logService;
    static readonly enablementSettingKey = "workbench.editor.languageDetection";
    static readonly historyBasedEnablementConfig = "workbench.editor.historyBasedLanguageDetection";
    static readonly preferHistoryConfig = "workbench.editor.preferHistoryBasedLanguageDetection";
    static readonly workspaceOpenedLanguagesStorageKey = "workbench.editor.languageDetectionOpenedLanguages.workspace";
    static readonly globalOpenedLanguagesStorageKey = "workbench.editor.languageDetectionOpenedLanguages.global";
    _serviceBrand: undefined;
    private _languageDetectionWorkerClient;
    private hasResolvedWorkspaceLanguageIds;
    private workspaceLanguageIds;
    private sessionOpenedLanguageIds;
    private historicalGlobalOpenedLanguageIds;
    private historicalWorkspaceOpenedLanguageIds;
    private dirtyBiases;
    private langBiases;
    constructor(_environmentService: IWorkbenchEnvironmentService, languageService: ILanguageService, _configurationService: IConfigurationService, _diagnosticsService: IDiagnosticsService, _workspaceContextService: IWorkspaceContextService, modelService: IModelService, _editorService: IEditorService, telemetryService: ITelemetryService, storageService: IStorageService, _logService: ILogService, languageConfigurationService: ILanguageConfigurationService);
    private resolveWorkspaceLanguageIds;
    isEnabledForLanguage(languageId: string): boolean;
    private getLanguageBiases;
    detectLanguage(resource: URI, supportedLangs?: string[]): Promise<string | undefined>;
    private initEditorOpenedListeners;
}
export interface IWorkerClient<W> {
    getProxyObject(): Promise<W>;
    dispose(): void;
}
export declare class LanguageDetectionWorkerHost {
    private _indexJsUri;
    private _modelJsonUri;
    private _weightsUri;
    private _telemetryService;
    constructor(_indexJsUri: string, _modelJsonUri: string, _weightsUri: string, _telemetryService: ITelemetryService);
    getIndexJsUri(): Promise<string>;
    getModelJsonUri(): Promise<string>;
    getWeightsUri(): Promise<string>;
    sendTelemetryEvent(languages: string[], confidences: number[], timeSpent: number): Promise<void>;
}
export declare class LanguageDetectionWorkerClient extends EditorWorkerClient {
    private readonly _languageService;
    private readonly _telemetryService;
    private readonly _indexJsUri;
    private readonly _modelJsonUri;
    private readonly _weightsUri;
    private readonly _regexpModelUri;
    private workerPromise;
    constructor(modelService: IModelService, _languageService: ILanguageService, _telemetryService: ITelemetryService, _indexJsUri: string, _modelJsonUri: string, _weightsUri: string, _regexpModelUri: string, languageConfigurationService: ILanguageConfigurationService);
    private _getOrCreateLanguageDetectionWorker;
    private _guessLanguageIdByUri;
    protected _getProxy(): Promise<LanguageDetectionSimpleWorker>;
    fhr(method: string, args: any[]): Promise<any>;
    getIndexJsUri(): Promise<string>;
    getLanguageId(languageIdOrExt: string | undefined): string | undefined;
    getModelJsonUri(): Promise<string>;
    getWeightsUri(): Promise<string>;
    getRegexpModelUri(): Promise<string>;
    sendTelemetryEvent(languages: string[], confidences: number[], timeSpent: number): Promise<void>;
    detectLanguage(resource: URI, langBiases: Record<string, number> | undefined, preferHistory: boolean, supportedLangs?: string[]): Promise<string | undefined>;
}
