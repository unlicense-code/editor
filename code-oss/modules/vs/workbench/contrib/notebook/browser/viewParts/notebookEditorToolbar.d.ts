import * as DOM from 'vs/base/browser/dom';
import { IAction } from 'vs/base/common/actions';
import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchAssignmentService } from 'vs/workbench/services/assignment/common/assignmentService';
import { NotebookOptions } from 'vs/workbench/contrib/notebook/common/notebookOptions';
interface IActionModel {
    action: IAction;
    size: number;
    visible: boolean;
    renderLabel: boolean;
}
export declare class NotebookEditorToolbar extends Disposable {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly contextKeyService: IContextKeyService;
    readonly notebookOptions: NotebookOptions;
    readonly domNode: HTMLElement;
    readonly instantiationService: IInstantiationService;
    readonly configurationService: IConfigurationService;
    readonly contextMenuService: IContextMenuService;
    readonly menuService: IMenuService;
    private readonly editorService;
    private readonly keybindingService;
    private readonly experimentService;
    private _leftToolbarScrollable;
    private _notebookTopLeftToolbarContainer;
    private _notebookTopRightToolbarContainer;
    private _notebookGlobalActionsMenu;
    private _notebookLeftToolbar;
    private _primaryActions;
    get primaryActions(): IActionModel[];
    private _secondaryActions;
    get secondaryActions(): IAction[];
    private _notebookRightToolbar;
    private _useGlobalToolbar;
    private _strategy;
    private _renderLabel;
    private readonly _onDidChangeState;
    onDidChangeState: Event<void>;
    get useGlobalToolbar(): boolean;
    private _dimension;
    constructor(notebookEditor: INotebookEditorDelegate, contextKeyService: IContextKeyService, notebookOptions: NotebookOptions, domNode: HTMLElement, instantiationService: IInstantiationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, menuService: IMenuService, editorService: IEditorService, keybindingService: IKeybindingService, experimentService: IWorkbenchAssignmentService);
    private _buildBody;
    private _updatePerEditorChange;
    private _registerNotebookActionsToolbar;
    private _updateStrategy;
    private _convertConfiguration;
    private _showNotebookActionsinEditorToolbar;
    private _setNotebookActions;
    private _cacheItemSizes;
    private _canBeVisible;
    private _computeSizes;
    layout(dimension: DOM.Dimension): void;
    dispose(): void;
}
export {};
