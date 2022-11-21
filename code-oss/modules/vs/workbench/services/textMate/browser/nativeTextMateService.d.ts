import { AbstractTextMateService } from 'vs/workbench/services/textMate/browser/abstractTextMateService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IWorkbenchThemeService } from 'vs/workbench/services/themes/common/workbenchThemeService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ILogService } from 'vs/platform/log/common/log';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IModelService } from 'vs/editor/common/services/model';
import type { IRawTheme } from 'vscode-textmate';
import { IValidGrammarDefinition } from 'vs/workbench/services/textMate/common/TMScopeRegistry';
import { UriComponents, URI } from 'vs/base/common/uri';
import { TMGrammarFactory } from 'vs/workbench/services/textMate/common/TMGrammarFactory';
import { IExtensionResourceLoaderService } from 'vs/platform/extensionResourceLoader/common/extensionResourceLoader';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
export declare class TextMateWorkerHost {
    private readonly textMateService;
    private readonly _extensionResourceLoaderService;
    constructor(textMateService: TextMateService, _extensionResourceLoaderService: IExtensionResourceLoaderService);
    readFile(_resource: UriComponents): Promise<string>;
    setTokens(_resource: UriComponents, versionId: number, tokens: Uint8Array): Promise<void>;
}
export declare class TextMateService extends AbstractTextMateService {
    private readonly _modelService;
    private readonly _environmentService;
    private readonly _languageConfigurationService;
    private _worker;
    private _workerProxy;
    private _tokenizers;
    constructor(languageService: ILanguageService, themeService: IWorkbenchThemeService, extensionResourceLoaderService: IExtensionResourceLoaderService, notificationService: INotificationService, logService: ILogService, configurationService: IConfigurationService, progressService: IProgressService, _modelService: IModelService, _environmentService: IWorkbenchEnvironmentService, _languageConfigurationService: ILanguageConfigurationService);
    private _onModelAdded;
    private _onModelRemoved;
    protected _loadVSCodeOnigurumWASM(): Promise<Response | ArrayBuffer>;
    protected _onDidCreateGrammarFactory(grammarDefinitions: IValidGrammarDefinition[]): void;
    protected _doUpdateTheme(grammarFactory: TMGrammarFactory | null, theme: IRawTheme, colorMap: string[]): void;
    protected _onDidDisposeGrammarFactory(): void;
    private _killWorker;
    setTokens(resource: URI, versionId: number, tokens: ArrayBuffer): void;
}
