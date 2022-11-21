import { IEditorDescriptor as ICommonEditorDescriptor } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IInstantiationService, BrandedService, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
export interface IEditorPaneDescriptor extends ICommonEditorDescriptor<EditorPane> {
}
export interface IEditorPaneRegistry {
    /**
     * Registers an editor pane to the platform for the given editor type. The second parameter also supports an
     * array of input classes to be passed in. If the more than one editor is registered for the same editor
     * input, the input itself will be asked which editor it prefers if this method is provided. Otherwise
     * the first editor in the list will be returned.
     *
     * @param editorDescriptors A set of constructor functions that return an instance of `EditorInput` for which the
     * registered editor should be used for.
     */
    registerEditorPane(editorPaneDescriptor: IEditorPaneDescriptor, editorDescriptors: readonly SyncDescriptor<EditorInput>[]): IDisposable;
    /**
     * Returns the editor pane descriptor for the given editor or `undefined` if none.
     */
    getEditorPane(editor: EditorInput): IEditorPaneDescriptor | undefined;
}
/**
 * A lightweight descriptor of an editor pane. The descriptor is deferred so that heavy editor
 * panes can load lazily in the workbench.
 */
export declare class EditorPaneDescriptor implements IEditorPaneDescriptor {
    private readonly ctor;
    readonly typeId: string;
    readonly name: string;
    static create<Services extends BrandedService[]>(ctor: {
        new (...services: Services): EditorPane;
    }, typeId: string, name: string): EditorPaneDescriptor;
    private constructor();
    instantiate(instantiationService: IInstantiationService): EditorPane;
    describes(editorPane: EditorPane): boolean;
}
export declare class EditorPaneRegistry implements IEditorPaneRegistry {
    private readonly editorPanes;
    private readonly mapEditorPanesToEditors;
    registerEditorPane(editorPaneDescriptor: EditorPaneDescriptor, editorDescriptors: readonly SyncDescriptor<EditorInput>[]): IDisposable;
    getEditorPane(editor: EditorInput): EditorPaneDescriptor | undefined;
    private findEditorPaneDescriptors;
    getEditorPaneByType(typeId: string): EditorPaneDescriptor | undefined;
    getEditorPanes(): readonly EditorPaneDescriptor[];
    getEditors(): SyncDescriptor<EditorInput>[];
}
export declare function whenEditorClosed(accessor: ServicesAccessor, resources: URI[]): Promise<void>;
export declare function computeEditorAriaLabel(input: EditorInput, index: number | undefined, group: IEditorGroup | undefined, groupCount: number | undefined): string;
