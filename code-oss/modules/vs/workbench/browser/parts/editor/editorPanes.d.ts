import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorOpenContext, IVisibleEditorPane } from 'vs/workbench/common/editor';
import { EditorInput } from 'vs/workbench/common/editor/editorInput';
import { IDomNodePagePosition } from 'vs/base/browser/dom';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorProgressService } from 'vs/platform/progress/common/progress';
import { IEditorGroupView } from 'vs/workbench/browser/parts/editor/editor';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { ILogService } from 'vs/platform/log/common/log';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
export interface IOpenEditorResult {
    /**
     * The editor pane used for opening. This can be a generic
     * placeholder in certain cases, e.g. when workspace trust
     * is required, or an editor fails to restore.
     *
     * Will be `undefined` if an error occurred while trying to
     * open the editor and in cases where no placeholder is being
     * used.
     */
    readonly pane?: EditorPane;
    /**
     * Whether the editor changed as a result of opening.
     */
    readonly changed?: boolean;
    /**
     * This property is set when an editor fails to restore and
     * is shown with a generic place holder. It allows callers
     * to still present the error to the user in that case.
     */
    readonly error?: Error;
    /**
     * This property indicates whether the open editor operation was
     * cancelled or not. The operation may have been cancelled
     * in case another editor open operation was triggered right
     * after cancelling this one out.
     */
    readonly cancelled?: boolean;
}
export declare class EditorPanes extends Disposable {
    private parent;
    private groupView;
    private readonly layoutService;
    private readonly instantiationService;
    private readonly editorProgressService;
    private readonly workspaceTrustService;
    private readonly logService;
    private readonly dialogService;
    private readonly _onDidFocus;
    readonly onDidFocus: import("vs/base/common/event").Event<void>;
    private _onDidChangeSizeConstraints;
    readonly onDidChangeSizeConstraints: import("vs/base/common/event").Event<{
        width: number;
        height: number;
    } | undefined>;
    get minimumWidth(): number;
    get minimumHeight(): number;
    get maximumWidth(): number;
    get maximumHeight(): number;
    private _activeEditorPane;
    get activeEditorPane(): IVisibleEditorPane | null;
    private readonly editorPanes;
    private readonly activeEditorPaneDisposables;
    private pagePosition;
    private readonly editorOperation;
    private readonly editorPanesRegistry;
    constructor(parent: HTMLElement, groupView: IEditorGroupView, layoutService: IWorkbenchLayoutService, instantiationService: IInstantiationService, editorProgressService: IEditorProgressService, workspaceTrustService: IWorkspaceTrustManagementService, logService: ILogService, dialogService: IDialogService);
    private registerListeners;
    private onDidChangeWorkspaceTrust;
    openEditor(editor: EditorInput, options: IEditorOptions | undefined, context?: IEditorOpenContext): Promise<IOpenEditorResult>;
    private doShowError;
    private doOpenEditor;
    private getEditorPaneDescriptor;
    private doShowEditorPane;
    private doCreateEditorPane;
    private doInstantiateEditorPane;
    private doSetActiveEditorPane;
    private doSetInput;
    private doHideActiveEditorPane;
    closeEditor(editor: EditorInput): void;
    setVisible(visible: boolean): void;
    layout(pagePosition: IDomNodePagePosition): void;
}
