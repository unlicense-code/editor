import { Disposable } from 'vs/base/common/lifecycle';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IActiveNotebookEditorDelegate } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { CodeCellRenderTemplate } from 'vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon';
import { CodeCellViewModel } from 'vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel';
import { INotebookCellStatusBarService } from 'vs/workbench/contrib/notebook/common/notebookCellStatusBarService';
import { INotebookExecutionStateService } from 'vs/workbench/contrib/notebook/common/notebookExecutionStateService';
export declare class CodeCell extends Disposable {
    private readonly notebookEditor;
    private readonly viewCell;
    private readonly templateData;
    private readonly instantiationService;
    readonly notebookCellStatusBarService: INotebookCellStatusBarService;
    readonly keybindingService: IKeybindingService;
    readonly openerService: IOpenerService;
    readonly languageService: ILanguageService;
    private configurationService;
    private _outputContainerRenderer;
    private _renderedInputCollapseState;
    private _renderedOutputCollapseState;
    private _isDisposed;
    private readonly cellParts;
    private _collapsedExecutionIcon;
    constructor(notebookEditor: IActiveNotebookEditorDelegate, viewCell: CodeCellViewModel, templateData: CodeCellRenderTemplate, instantiationService: IInstantiationService, notebookCellStatusBarService: INotebookCellStatusBarService, keybindingService: IKeybindingService, openerService: IOpenerService, languageService: ILanguageService, configurationService: IConfigurationService, notebookExecutionStateService: INotebookExecutionStateService);
    private _pendingLayout;
    private updateForLayout;
    private updateForOutputHover;
    private updateForOutputFocus;
    private calculateInitEditorHeight;
    private initializeEditor;
    private updateForOutputs;
    private updateEditorOptions;
    private registerViewCellLayoutChange;
    private registerCellEditorEventListeners;
    private registerDecorations;
    private registerMouseListener;
    private shouldUpdateDOMFocus;
    private updateEditorForFocusModeChange;
    private updateForCollapseState;
    private _collapseInput;
    private _showInput;
    private _getRichText;
    private _removeInputCollapsePreview;
    private _updateOutputInnerContainer;
    private _collapseOutput;
    private _showOutput;
    private initialViewUpdateExpanded;
    private layoutEditor;
    private onCellWidthChange;
    private onCellEditorHeightChange;
    relayoutCell(): void;
    dispose(): void;
}
