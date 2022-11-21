import type * as webviewMessages from 'vs/workbench/contrib/notebook/browser/view/renderers/webviewMessages';
interface PreloadStyles {
    readonly outputNodePadding: number;
    readonly outputNodeLeftPadding: number;
}
export interface PreloadOptions {
    dragAndDropEnabled: boolean;
}
export declare function preloadsScriptStr(styleValues: PreloadStyles, options: PreloadOptions, renderers: readonly webviewMessages.RendererMetadata[], preloads: readonly webviewMessages.StaticPreloadMetadata[], isWorkspaceTrusted: boolean, lineLimit: number, nonce: string): string;
export {};
