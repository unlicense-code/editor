import 'vs/css!./outlinePane';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { OutlineViewState } from './outlineViewState';
import { IOutlineService } from 'vs/workbench/services/outline/browser/outline';
import { IOutlinePane } from 'vs/workbench/contrib/outline/browser/outline';
export declare class OutlinePane extends ViewPane implements IOutlinePane {
    private readonly _outlineService;
    private readonly _instantiationService;
    private readonly _storageService;
    private readonly _editorService;
    static readonly Id = "outline";
    private readonly _disposables;
    private readonly _editorControlDisposables;
    private readonly _editorPaneDisposables;
    private readonly _outlineViewState;
    private readonly _editorListener;
    private _domNode;
    private _message;
    private _progressBar;
    private _treeContainer;
    private _tree?;
    private _treeDimensions?;
    private _treeStates;
    private _ctxFollowsCursor;
    private _ctxFilterOnType;
    private _ctxSortMode;
    private _ctxAllCollapsed;
    constructor(options: IViewletViewOptions, _outlineService: IOutlineService, _instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, _storageService: IStorageService, _editorService: IEditorService, configurationService: IConfigurationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService);
    dispose(): void;
    focus(): void;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    collapseAll(): void;
    expandAll(): void;
    get outlineViewState(): OutlineViewState;
    private _showMessage;
    private _captureViewState;
    private _handleEditorChanged;
    private _handleEditorControlChanged;
}