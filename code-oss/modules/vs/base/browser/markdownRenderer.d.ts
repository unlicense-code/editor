import { FormattedTextRenderOptions } from 'vs/base/browser/formattedTextRenderer';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { marked } from 'vs/base/common/marked/marked';
export interface MarkedOptions extends marked.MarkedOptions {
    baseUrl?: never;
}
export interface MarkdownRenderOptions extends FormattedTextRenderOptions {
    readonly codeBlockRenderer?: (languageId: string, value: string) => Promise<HTMLElement>;
    readonly asyncRenderCallback?: () => void;
}
/**
 * Low-level way create a html element from a markdown string.
 *
 * **Note** that for most cases you should be using [`MarkdownRenderer`](./src/vs/editor/contrib/markdownRenderer/browser/markdownRenderer.ts)
 * which comes with support for pretty code block rendering and which uses the default way of handling links.
 */
export declare function renderMarkdown(markdown: IMarkdownString, options?: MarkdownRenderOptions, markedOptions?: MarkedOptions): {
    element: HTMLElement;
    dispose: () => void;
};
export declare const allowedMarkdownAttr: string[];
/**
 * Strips all markdown from `string`, if it's an IMarkdownString. For example
 * `# Header` would be output as `Header`. If it's not, the string is returned.
 */
export declare function renderStringAsPlaintext(string: IMarkdownString | string): string;
/**
 * Strips all markdown from `markdown`. For example `# Header` would be output as `Header`.
 */
export declare function renderMarkdownAsPlaintext(markdown: IMarkdownString): string;
