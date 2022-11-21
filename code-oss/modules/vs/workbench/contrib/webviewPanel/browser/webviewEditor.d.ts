import * as DOM from 'vs/base/browser/dom';
import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IEditorOpenContext } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IEditorDropService } from 'vs/workbench/services/editor/browser/editorDropService';
import { IEditorGroup, IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
/**
 * Tracks the id of the actively focused webview.
 */
export declare const CONTEXT_ACTIVE_WEBVIEW_PANEL_ID: RawContextKey<string>;
export declare class WebviewEditor extends EditorPane {
    private readonly _editorService;
    private readonly _workbenchLayoutService;
    private readonly _editorDropService;
    private readonly _hostService;
    private readonly _contextKeyService;
    static readonly ID = "WebviewEditor";
    private _element?;
    private _dimension?;
    private _visible;
    private _isDisposed;
    private readonly _webviewVisibleDisposables;
    private readonly _onFocusWindowHandler;
    private readonly _onDidFocusWebview;
    get onDidFocus(): Event<any>;
    private readonly _scopedContextKeyService;
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, editorGroupsService: IEditorGroupsService, _editorService: IEditorService, _workbenchLayoutService: IWorkbenchLayoutService, _editorDropService: IEditorDropService, _hostService: IHostService, _contextKeyService: IContextKeyService);
    private get webview();
    get scopedContextKeyService(): IContextKeyService | undefined;
    protected createEditor(parent: HTMLElement): void;
    dispose(): void;
    layout(dimension: DOM.Dimension): void;
    focus(): void;
    protected setEditorVisible(visible: boolean, group: IEditorGroup | undefined): void;
    clearInput(): void;
    setInput(input: EditorInput, options: IEditorOptions, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private claimWebview;
    private synchronizeWebviewContainerDimensions;
    private trackFocus;
}
