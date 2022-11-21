import { IDisposable } from 'vs/base/common/lifecycle';
import { IEditorDropTargetDelegate } from 'vs/workbench/browser/parts/editor/editorDropTarget';
export declare const IEditorDropService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IEditorDropService>;
export interface IEditorDropService {
    readonly _serviceBrand: undefined;
    /**
     * Allows to register a drag and drop target for editors.
     */
    createEditorDropTarget(container: HTMLElement, delegate: IEditorDropTargetDelegate): IDisposable;
}
