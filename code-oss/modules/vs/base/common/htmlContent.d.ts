import { URI, UriComponents } from 'vs/base/common/uri';
export interface MarkdownStringTrustedOptions {
    readonly enabledCommands: readonly string[];
}
export interface IMarkdownString {
    readonly value: string;
    readonly isTrusted?: boolean | MarkdownStringTrustedOptions;
    readonly supportThemeIcons?: boolean;
    readonly supportHtml?: boolean;
    readonly baseUri?: UriComponents;
    uris?: {
        [href: string]: UriComponents;
    };
}
export declare const enum MarkdownStringTextNewlineStyle {
    Paragraph = 0,
    Break = 1
}
export declare class MarkdownString implements IMarkdownString {
    value: string;
    isTrusted?: boolean | MarkdownStringTrustedOptions;
    supportThemeIcons?: boolean;
    supportHtml?: boolean;
    baseUri?: URI;
    constructor(value?: string, isTrustedOrOptions?: boolean | {
        isTrusted?: boolean | MarkdownStringTrustedOptions;
        supportThemeIcons?: boolean;
        supportHtml?: boolean;
    });
    appendText(value: string, newlineStyle?: MarkdownStringTextNewlineStyle): MarkdownString;
    appendMarkdown(value: string): MarkdownString;
    appendCodeblock(langId: string, code: string): MarkdownString;
    appendLink(target: URI | string, label: string, title?: string): MarkdownString;
    private _escape;
}
export declare function isEmptyMarkdownString(oneOrMany: IMarkdownString | IMarkdownString[] | null | undefined): boolean;
export declare function isMarkdownString(thing: any): thing is IMarkdownString;
export declare function markdownStringEqual(a: IMarkdownString, b: IMarkdownString): boolean;
export declare function escapeMarkdownSyntaxTokens(text: string): string;
export declare function escapeDoubleQuotes(input: string): string;
export declare function removeMarkdownEscapes(text: string): string;
export declare function parseHrefAndDimensions(href: string): {
    href: string;
    dimensions: string[];
};
