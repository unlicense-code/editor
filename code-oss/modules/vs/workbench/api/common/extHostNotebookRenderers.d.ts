import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtHostNotebookRenderersShape, IMainContext } from 'vs/workbench/api/common/extHost.protocol';
import { ExtHostNotebookController } from 'vs/workbench/api/common/extHostNotebook';
import * as vscode from 'vscode';
export declare class ExtHostNotebookRenderers implements ExtHostNotebookRenderersShape {
    private readonly _extHostNotebook;
    private readonly _rendererMessageEmitters;
    private readonly proxy;
    constructor(mainContext: IMainContext, _extHostNotebook: ExtHostNotebookController);
    $postRendererMessage(editorId: string, rendererId: string, message: unknown): void;
    createRendererMessaging(manifest: IExtensionDescription, rendererId: string): vscode.NotebookRendererMessaging;
    private getOrCreateEmitterFor;
}
