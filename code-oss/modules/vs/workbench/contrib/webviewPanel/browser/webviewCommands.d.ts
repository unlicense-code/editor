import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class ShowWebViewEditorFindWidgetAction extends Action2 {
    static readonly ID = "editor.action.webvieweditor.showFind";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class HideWebViewEditorFindCommand extends Action2 {
    static readonly ID = "editor.action.webvieweditor.hideFind";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class WebViewEditorFindNextCommand extends Action2 {
    static readonly ID = "editor.action.webvieweditor.findNext";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class WebViewEditorFindPreviousCommand extends Action2 {
    static readonly ID = "editor.action.webvieweditor.findPrevious";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class ReloadWebviewAction extends Action2 {
    static readonly ID = "workbench.action.webview.reloadWebviewAction";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
