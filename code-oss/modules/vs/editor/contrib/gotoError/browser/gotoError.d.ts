import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, IActionOptions, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IMarkerNavigationService } from 'vs/editor/contrib/gotoError/browser/markerNavigationService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMarker } from 'vs/platform/markers/common/markers';
export declare class MarkerController implements IEditorContribution {
    private readonly _markerNavigationService;
    private readonly _contextKeyService;
    private readonly _editorService;
    private readonly _instantiationService;
    static readonly ID = "editor.contrib.markerController";
    static get(editor: ICodeEditor): MarkerController | null;
    private readonly _editor;
    private readonly _widgetVisible;
    private readonly _sessionDispoables;
    private _model?;
    private _widget?;
    constructor(editor: ICodeEditor, _markerNavigationService: IMarkerNavigationService, _contextKeyService: IContextKeyService, _editorService: ICodeEditorService, _instantiationService: IInstantiationService);
    dispose(): void;
    private _cleanUp;
    private _getOrCreateModel;
    close(focusEditor?: boolean): void;
    showAtMarker(marker: IMarker): void;
    nagivate(next: boolean, multiFile: boolean): Promise<void>;
}
declare class MarkerNavigationAction extends EditorAction {
    private readonly _next;
    private readonly _multiFile;
    constructor(_next: boolean, _multiFile: boolean, opts: IActionOptions);
    run(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class NextMarkerAction extends MarkerNavigationAction {
    static ID: string;
    static LABEL: string;
    constructor();
}
export {};
