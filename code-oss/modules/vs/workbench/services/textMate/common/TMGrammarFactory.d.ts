import { URI } from 'vs/base/common/uri';
import type { IGrammar, StackElement, IRawTheme, IOnigLib } from 'vscode-textmate';
import { Disposable } from 'vs/base/common/lifecycle';
import { IValidGrammarDefinition } from 'vs/workbench/services/textMate/common/TMScopeRegistry';
interface ITMGrammarFactoryHost {
    logTrace(msg: string): void;
    logError(msg: string, err: any): void;
    readFile(resource: URI): Promise<string>;
}
export interface ICreateGrammarResult {
    languageId: string;
    grammar: IGrammar | null;
    initialState: StackElement;
    containsEmbeddedLanguages: boolean;
}
export declare const missingTMGrammarErrorMessage = "No TM Grammar registered for this language.";
export declare class TMGrammarFactory extends Disposable {
    private readonly _host;
    private readonly _initialState;
    private readonly _scopeRegistry;
    private readonly _injections;
    private readonly _injectedEmbeddedLanguages;
    private readonly _languageToScope;
    private readonly _grammarRegistry;
    constructor(host: ITMGrammarFactoryHost, grammarDefinitions: IValidGrammarDefinition[], vscodeTextmate: typeof import('vscode-textmate'), onigLib: Promise<IOnigLib>);
    has(languageId: string): boolean;
    setTheme(theme: IRawTheme, colorMap: string[]): void;
    getColorMap(): string[];
    createGrammar(languageId: string, encodedLanguageId: number): Promise<ICreateGrammarResult>;
}
export {};
