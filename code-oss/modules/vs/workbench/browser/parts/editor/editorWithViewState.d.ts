import { URI } from 'vs/base/common/uri';
import { IEditorOpenContext } from 'vs/workbench/common/editor';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { IEditorGroupsService, IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtUri } from 'vs/base/common/resources';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
/**
 * Base class of editors that want to store and restore view state.
 */
export declare abstract class AbstractEditorWithViewState<T extends object> extends EditorPane {
    protected readonly instantiationService: IInstantiationService;
    protected readonly textResourceConfigurationService: ITextResourceConfigurationService;
    protected readonly editorService: IEditorService;
    protected readonly editorGroupService: IEditorGroupsService;
    private viewState;
    private readonly groupListener;
    private editorViewStateDisposables;
    constructor(id: string, viewStateStorageKey: string, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    private onWillCloseEditor;
    clearInput(): void;
    protected saveState(): void;
    private updateEditorViewState;
    private shouldRestoreEditorViewState;
    getViewState(): T | undefined;
    private saveEditorViewState;
    protected loadEditorViewState(input: EditorInput | undefined, context?: IEditorOpenContext): T | undefined;
    protected moveEditorViewState(source: URI, target: URI, comparer: IExtUri): void;
    protected clearEditorViewState(resource: URI, group?: IEditorGroup): void;
    dispose(): void;
    /**
     * The actual method to provide for gathering the view state
     * object for the control.
     *
     * @param resource the expected `URI` for the view state. This
     * should be used as a way to ensure the view state in the
     * editor control is matching the resource expected, for example
     * by comparing with the underlying model (this was a fix for
     * https://github.com/microsoft/vscode/issues/40114).
     */
    protected abstract computeEditorViewState(resource: URI): T | undefined;
    /**
     * Whether view state should be associated with the given input.
     * Subclasses need to ensure that the editor input is expected
     * for the editor.
     */
    protected abstract tracksEditorViewState(input: EditorInput): boolean;
    /**
     * Whether view state should be tracked even when the editor is
     * disposed.
     *
     * Subclasses should override this if the input can be restored
     * from the resource at a later point, e.g. if backed by files.
     */
    protected tracksDisposedEditorViewState(): boolean;
    /**
     * Asks to return the `URI` to associate with the view state.
     */
    protected abstract toEditorViewStateResource(input: EditorInput): URI | undefined;
}
