import 'vs/css!./media/interactive';
import * as DOM from 'vs/base/browser/dom';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { ICodeEditorViewState } from 'vs/editor/common/editorCommon';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IEditorOpenContext, IEditorPaneSelectionChangeEvent } from 'vs/workbench/common/editor';
import { InteractiveEditorInput } from 'vs/workbench/contrib/interactive/browser/interactiveEditorInput';
import { INotebookEditorOptions, INotebookEditorViewState } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { INotebookEditorService } from 'vs/workbench/contrib/notebook/browser/services/notebookEditorService';
import { NotebookEditorWidget } from 'vs/workbench/contrib/notebook/browser/notebookEditorWidget';
import { IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { INotebookKernelService } from 'vs/workbench/contrib/notebook/common/notebookKernelService';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ITextResourceConfigurationService } from 'vs/editor/common/services/textResourceConfiguration';
import { ITextEditorOptions } from 'vs/platform/editor/common/editor';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import 'vs/css!./interactiveEditor';
export interface InteractiveEditorViewState {
    readonly notebook?: INotebookEditorViewState;
    readonly input?: ICodeEditorViewState | null;
}
export interface InteractiveEditorOptions extends ITextEditorOptions {
    readonly viewState?: InteractiveEditorViewState;
}
export declare class InteractiveEditor extends EditorPane {
    #private;
    private configurationService;
    get onDidFocus(): Event<void>;
    readonly onDidChangeSelection: Event<IEditorPaneSelectionChangeEvent>;
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, instantiationService: IInstantiationService, notebookWidgetService: INotebookEditorService, contextKeyService: IContextKeyService, codeEditorService: ICodeEditorService, notebookKernelService: INotebookKernelService, languageService: ILanguageService, keybindingService: IKeybindingService, configurationService: IConfigurationService, menuService: IMenuService, contextMenuService: IContextMenuService, editorGroupService: IEditorGroupsService, textResourceConfigurationService: ITextResourceConfigurationService, notebookExecutionStateService: INotebookExecutionStateService, extensionService: IExtensionService);
    protected createEditor(parent: HTMLElement): void;
    protected saveState(): void;
    getViewState(): InteractiveEditorViewState | undefined;
    setInput(input: InteractiveEditorInput, options: InteractiveEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    setOptions(options: INotebookEditorOptions | undefined): void;
    layout(dimension: DOM.Dimension): void;
    focus(): void;
    focusHistory(): void;
    setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    clearInput(): void;
    getControl(): {
        notebookEditor: NotebookEditorWidget | undefined;
        codeEditor: CodeEditorWidget;
    };
}
