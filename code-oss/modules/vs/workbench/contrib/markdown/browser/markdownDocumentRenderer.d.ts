import { CancellationToken } from 'vs/base/common/cancellation';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare const DEFAULT_MARKDOWN_STYLES = "\nbody {\n\tpadding: 10px 20px;\n\tline-height: 22px;\n\tmax-width: 882px;\n\tmargin: 0 auto;\n}\n\nbody *:last-child {\n\tmargin-bottom: 0;\n}\n\nimg {\n\tmax-width: 100%;\n\tmax-height: 100%;\n}\n\na {\n\ttext-decoration: none;\n}\n\na:hover {\n\ttext-decoration: underline;\n}\n\na:focus,\ninput:focus,\nselect:focus,\ntextarea:focus {\n\toutline: 1px solid -webkit-focus-ring-color;\n\toutline-offset: -1px;\n}\n\nhr {\n\tborder: 0;\n\theight: 2px;\n\tborder-bottom: 2px solid;\n}\n\nh1 {\n\tpadding-bottom: 0.3em;\n\tline-height: 1.2;\n\tborder-bottom-width: 1px;\n\tborder-bottom-style: solid;\n}\n\nh1, h2, h3 {\n\tfont-weight: normal;\n}\n\ntable {\n\tborder-collapse: collapse;\n}\n\ntable > thead > tr > th {\n\ttext-align: left;\n\tborder-bottom: 1px solid;\n}\n\ntable > thead > tr > th,\ntable > thead > tr > td,\ntable > tbody > tr > th,\ntable > tbody > tr > td {\n\tpadding: 5px 10px;\n}\n\ntable > tbody > tr + tr > td {\n\tborder-top-width: 1px;\n\tborder-top-style: solid;\n}\n\nblockquote {\n\tmargin: 0 7px 0 5px;\n\tpadding: 0 16px 0 10px;\n\tborder-left-width: 5px;\n\tborder-left-style: solid;\n}\n\ncode {\n\tfont-family: \"SF Mono\", Monaco, Menlo, Consolas, \"Ubuntu Mono\", \"Liberation Mono\", \"DejaVu Sans Mono\", \"Courier New\", monospace;\n}\n\npre code {\n\tfont-family: var(--vscode-editor-font-family);\n\tfont-weight: var(--vscode-editor-font-weight);\n\tfont-size: var(--vscode-editor-font-size);\n\tline-height: 1.5;\n}\n\ncode > div {\n\tpadding: 16px;\n\tborder-radius: 3px;\n\toverflow: auto;\n}\n\n.monaco-tokenized-source {\n\twhite-space: pre;\n}\n\n/** Theming */\n\n.vscode-light code > div {\n\tbackground-color: rgba(220, 220, 220, 0.4);\n}\n\n.vscode-dark code > div {\n\tbackground-color: rgba(10, 10, 10, 0.4);\n}\n\n.vscode-high-contrast code > div {\n\tbackground-color: var(--vscode-textCodeBlock-background);\n}\n\n.vscode-high-contrast h1 {\n\tborder-color: rgb(0, 0, 0);\n}\n\n.vscode-light table > thead > tr > th {\n\tborder-color: rgba(0, 0, 0, 0.69);\n}\n\n.vscode-dark table > thead > tr > th {\n\tborder-color: rgba(255, 255, 255, 0.69);\n}\n\n.vscode-light h1,\n.vscode-light hr,\n.vscode-light table > tbody > tr + tr > td {\n\tborder-color: rgba(0, 0, 0, 0.18);\n}\n\n.vscode-dark h1,\n.vscode-dark hr,\n.vscode-dark table > tbody > tr + tr > td {\n\tborder-color: rgba(255, 255, 255, 0.18);\n}\n\n";
/**
 * Renders a string of markdown as a document.
 *
 * Uses VS Code's syntax highlighting code blocks.
 */
export declare function renderMarkdownDocument(text: string, extensionService: IExtensionService, languageService: ILanguageService, shouldSanitize?: boolean, allowUnknownProtocols?: boolean, token?: CancellationToken): Promise<string>;
