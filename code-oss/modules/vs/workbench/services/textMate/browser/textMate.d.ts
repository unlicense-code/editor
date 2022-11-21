import { Event } from 'vs/base/common/event';
import type { IGrammar } from 'vscode-textmate';
export declare const ITextMateService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<ITextMateService>;
export interface ITextMateService {
    readonly _serviceBrand: undefined;
    onDidEncounterLanguage: Event<string>;
    createGrammar(languageId: string): Promise<IGrammar | null>;
    startDebugMode(printFn: (str: string) => void, onStop: () => void): void;
}
