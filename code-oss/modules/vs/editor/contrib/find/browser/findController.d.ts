import { Delayer } from 'vs/base/common/async';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, MultiEditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { FindReplaceState, INewFindReplaceState } from 'vs/editor/contrib/find/browser/findState';
import { IFindController } from 'vs/editor/contrib/find/browser/findWidget';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare function getSelectionSearchString(editor: ICodeEditor, seedSearchStringFromSelection?: 'single' | 'multiple', seedSearchStringFromNonEmptySelection?: boolean): string | null;
export declare const enum FindStartFocusAction {
    NoFocusChange = 0,
    FocusFindInput = 1,
    FocusReplaceInput = 2
}
export interface IFindStartOptions {
    forceRevealReplace: boolean;
    seedSearchStringFromSelection: 'none' | 'single' | 'multiple';
    seedSearchStringFromNonEmptySelection: boolean;
    seedSearchStringFromGlobalClipboard: boolean;
    shouldFocus: FindStartFocusAction;
    shouldAnimate: boolean;
    updateSearchScope: boolean;
    loop: boolean;
}
export interface IFindStartArguments {
    searchString?: string;
    replaceString?: string;
    isRegex?: boolean;
    matchWholeWord?: boolean;
    isCaseSensitive?: boolean;
    preserveCase?: boolean;
    findInSelection?: boolean;
}
export declare class CommonFindController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.findController";
    protected _editor: ICodeEditor;
    private readonly _findWidgetVisible;
    protected _state: FindReplaceState;
    protected _updateHistoryDelayer: Delayer<void>;
    private _model;
    protected readonly _storageService: IStorageService;
    private readonly _clipboardService;
    protected readonly _contextKeyService: IContextKeyService;
    get editor(): ICodeEditor;
    static get(editor: ICodeEditor): CommonFindController | null;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, storageService: IStorageService, clipboardService: IClipboardService);
    dispose(): void;
    private disposeModel;
    private _onStateChanged;
    private saveQueryState;
    private loadQueryState;
    isFindInputFocused(): boolean;
    getState(): FindReplaceState;
    closeFindWidget(): void;
    toggleCaseSensitive(): void;
    toggleWholeWords(): void;
    toggleRegex(): void;
    togglePreserveCase(): void;
    toggleSearchScope(): void;
    setSearchString(searchString: string): void;
    highlightFindOptions(ignoreWhenVisible?: boolean): void;
    protected _start(opts: IFindStartOptions, newState?: INewFindReplaceState): Promise<void>;
    start(opts: IFindStartOptions, newState?: INewFindReplaceState): Promise<void>;
    moveToNextMatch(): boolean;
    moveToPrevMatch(): boolean;
    replace(): boolean;
    replaceAll(): boolean;
    selectAllMatches(): boolean;
    getGlobalBufferTerm(): Promise<string>;
    setGlobalBufferTerm(text: string): void;
}
export declare class FindController extends CommonFindController implements IFindController {
    private readonly _contextViewService;
    private readonly _keybindingService;
    private readonly _themeService;
    private readonly _notificationService;
    private _widget;
    private _findOptionsWidget;
    constructor(editor: ICodeEditor, _contextViewService: IContextViewService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _themeService: IThemeService, _notificationService: INotificationService, _storageService: IStorageService, clipboardService: IClipboardService);
    protected _start(opts: IFindStartOptions, newState?: INewFindReplaceState): Promise<void>;
    highlightFindOptions(ignoreWhenVisible?: boolean): void;
    private _createFindWidget;
    saveViewState(): any;
    restoreViewState(state: any): void;
}
export declare const StartFindAction: MultiEditorAction;
export declare class StartFindWithArgsAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | null, editor: ICodeEditor, args?: IFindStartArguments): Promise<void>;
}
export declare class StartFindWithSelectionAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | null, editor: ICodeEditor): Promise<void>;
}
export declare abstract class MatchFindAction extends EditorAction {
    run(accessor: ServicesAccessor | null, editor: ICodeEditor): Promise<void>;
    protected abstract _run(controller: CommonFindController): boolean;
}
export declare class NextMatchFindAction extends MatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare class PreviousMatchFindAction extends MatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare abstract class SelectionMatchFindAction extends EditorAction {
    run(accessor: ServicesAccessor | null, editor: ICodeEditor): Promise<void>;
    protected abstract _run(controller: CommonFindController): boolean;
}
export declare class NextSelectionMatchFindAction extends SelectionMatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare class PreviousSelectionMatchFindAction extends SelectionMatchFindAction {
    constructor();
    protected _run(controller: CommonFindController): boolean;
}
export declare const StartFindReplaceAction: MultiEditorAction;
