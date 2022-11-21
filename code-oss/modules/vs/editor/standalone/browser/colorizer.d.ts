import { IViewLineTokens } from 'vs/editor/common/tokens/lineTokens';
import { ITextModel } from 'vs/editor/common/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IStandaloneThemeService } from 'vs/editor/standalone/common/standaloneTheme';
export interface IColorizerOptions {
    tabSize?: number;
}
export interface IColorizerElementOptions extends IColorizerOptions {
    theme?: string;
    mimeType?: string;
}
export declare class Colorizer {
    static colorizeElement(themeService: IStandaloneThemeService, languageService: ILanguageService, domNode: HTMLElement, options: IColorizerElementOptions): Promise<void>;
    static colorize(languageService: ILanguageService, text: string, languageId: string, options: IColorizerOptions | null | undefined): Promise<string>;
    static colorizeLine(line: string, mightContainNonBasicASCII: boolean, mightContainRTL: boolean, tokens: IViewLineTokens, tabSize?: number): string;
    static colorizeModelLine(model: ITextModel, lineNumber: number, tabSize?: number): string;
}
