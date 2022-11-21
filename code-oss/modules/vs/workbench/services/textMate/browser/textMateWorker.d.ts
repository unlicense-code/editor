import { IWorkerContext } from 'vs/editor/common/services/editorSimpleWorker';
import { UriComponents, URI } from 'vs/base/common/uri';
import { LanguageId } from 'vs/editor/common/encodedTokenAttributes';
import { IValidEmbeddedLanguagesMap, IValidTokenTypeMap } from 'vs/workbench/services/textMate/common/TMScopeRegistry';
import { ICreateGrammarResult } from 'vs/workbench/services/textMate/common/TMGrammarFactory';
import { IModelChangedEvent } from 'vs/editor/common/model/mirrorTextModel';
import { TextMateWorkerHost } from 'vs/workbench/services/textMate/browser/nativeTextMateService';
import type { IRawTheme } from 'vscode-textmate';
export interface IValidGrammarDefinitionDTO {
    location: UriComponents;
    language?: string;
    scopeName: string;
    embeddedLanguages: IValidEmbeddedLanguagesMap;
    tokenTypes: IValidTokenTypeMap;
    injectTo?: string[];
    balancedBracketSelectors: string[];
    unbalancedBracketSelectors: string[];
}
export interface ICreateData {
    grammarDefinitions: IValidGrammarDefinitionDTO[];
}
export interface IRawModelData {
    uri: UriComponents;
    versionId: number;
    lines: string[];
    EOL: string;
    languageId: string;
    encodedLanguageId: LanguageId;
}
export declare class TextMateWorker {
    private readonly _host;
    private readonly _models;
    private readonly _grammarCache;
    private readonly _grammarFactory;
    constructor(ctx: IWorkerContext<TextMateWorkerHost>, createData: ICreateData);
    private _loadTMGrammarFactory;
    acceptNewModel(data: IRawModelData): void;
    acceptModelChanged(strURL: string, e: IModelChangedEvent): void;
    acceptModelLanguageChanged(strURL: string, newLanguageId: string, newEncodedLanguageId: LanguageId): void;
    acceptRemovedModel(strURL: string): void;
    getOrCreateGrammar(languageId: string, encodedLanguageId: LanguageId): Promise<ICreateGrammarResult | null>;
    acceptTheme(theme: IRawTheme, colorMap: string[]): Promise<void>;
    _setTokens(resource: URI, versionId: number, tokens: Uint8Array): void;
}
export declare function create(ctx: IWorkerContext<TextMateWorkerHost>, createData: ICreateData): TextMateWorker;
