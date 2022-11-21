import { IMouseEvent } from 'vs/base/browser/mouseEvent';
import { Event } from 'vs/base/common/event';
import 'vs/css!./referencesWidget';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IRange } from 'vs/editor/common/core/range';
import { Location } from 'vs/editor/common/languages';
import { ILanguageConfigurationService } from 'vs/editor/common/languages/languageConfigurationRegistry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import * as peekView from 'vs/editor/contrib/peekView/browser/peekView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILabelService } from 'vs/platform/label/common/label';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { OneReference, ReferencesModel } from '../referencesModel';
export declare class LayoutData {
    ratio: number;
    heightInLines: number;
    static fromJSON(raw: string): LayoutData;
}
export interface SelectionEvent {
    readonly kind: 'goto' | 'show' | 'side' | 'open';
    readonly source: 'editor' | 'tree' | 'title';
    readonly element?: Location;
}
/**
 * ZoneWidget that is shown inside the editor
 */
export declare class ReferenceWidget extends peekView.PeekViewWidget {
    private _defaultTreeKeyboardSupport;
    layoutData: LayoutData;
    private readonly _textModelResolverService;
    private readonly _instantiationService;
    private readonly _peekViewService;
    private readonly _uriLabel;
    private readonly _undoRedoService;
    private readonly _keybindingService;
    private readonly _languageService;
    private readonly _languageConfigurationService;
    private _model?;
    private _decorationsManager?;
    private readonly _disposeOnNewModel;
    private readonly _callOnDispose;
    private readonly _onDidSelectReference;
    readonly onDidSelectReference: Event<SelectionEvent>;
    private _tree;
    private _treeContainer;
    private _splitView;
    private _preview;
    private _previewModelReference;
    private _previewNotAvailableMessage;
    private _previewContainer;
    private _messageContainer;
    private _dim;
    constructor(editor: ICodeEditor, _defaultTreeKeyboardSupport: boolean, layoutData: LayoutData, themeService: IThemeService, _textModelResolverService: ITextModelService, _instantiationService: IInstantiationService, _peekViewService: peekView.IPeekViewService, _uriLabel: ILabelService, _undoRedoService: IUndoRedoService, _keybindingService: IKeybindingService, _languageService: ILanguageService, _languageConfigurationService: ILanguageConfigurationService);
    dispose(): void;
    private _applyTheme;
    show(where: IRange): void;
    focusOnReferenceTree(): void;
    focusOnPreviewEditor(): void;
    isPreviewEditorFocused(): boolean;
    protected _onTitleClick(e: IMouseEvent): void;
    protected _fillBody(containerElement: HTMLElement): void;
    protected _onWidth(width: number): void;
    protected _doLayoutBody(heightInPixel: number, widthInPixel: number): void;
    setSelection(selection: OneReference): Promise<any>;
    setModel(newModel: ReferencesModel | undefined): Promise<any>;
    private _onNewModel;
    private _getFocusedReference;
    revealReference(reference: OneReference): Promise<void>;
    private _revealedReference?;
    private _revealReference;
}
