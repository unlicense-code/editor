import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorModel } from 'vs/platform/editor/common/editor';
/**
 * The editor model is the heavyweight counterpart of editor input. Depending on the editor input, it
 * resolves from a file system retrieve content and may allow for saving it back or reverting it.
 * Editor models are typically cached for some while because they are expensive to construct.
 */
export declare class EditorModel extends Disposable implements IEditorModel {
    private readonly _onWillDispose;
    readonly onWillDispose: import("vs/base/common/event").Event<void>;
    private disposed;
    private resolved;
    /**
     * Causes this model to resolve returning a promise when loading is completed.
     */
    resolve(): Promise<void>;
    /**
     * Returns whether this model was loaded or not.
     */
    isResolved(): boolean;
    /**
     * Find out if this model has been disposed.
     */
    isDisposed(): boolean;
    /**
     * Subclasses should implement to free resources that have been claimed through loading.
     */
    dispose(): void;
}
