import { CancellationToken } from 'vs/base/common/cancellation';
import 'vs/css!./renameInputField';
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { IRange } from 'vs/editor/common/core/range';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare const CONTEXT_RENAME_INPUT_VISIBLE: RawContextKey<boolean>;
export interface RenameInputFieldResult {
    newName: string;
    wantsPreview?: boolean;
}
export declare class RenameInputField implements IContentWidget {
    private readonly _editor;
    private readonly _acceptKeybindings;
    private readonly _themeService;
    private readonly _keybindingService;
    private _position?;
    private _domNode?;
    private _input?;
    private _label?;
    private _visible?;
    private readonly _visibleContextKey;
    private readonly _disposables;
    readonly allowEditorOverflow: boolean;
    constructor(_editor: ICodeEditor, _acceptKeybindings: [string, string], _themeService: IThemeService, _keybindingService: IKeybindingService, contextKeyService: IContextKeyService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    private _updateStyles;
    private _updateFont;
    getPosition(): IContentWidgetPosition | null;
    afterRender(position: ContentWidgetPositionPreference | null): void;
    private _currentAcceptInput?;
    private _currentCancelInput?;
    acceptInput(wantsPreview: boolean): void;
    cancelInput(focusEditor: boolean): void;
    getInput(where: IRange, value: string, selectionStart: number, selectionEnd: number, supportPreview: boolean, token: CancellationToken): Promise<RenameInputFieldResult | boolean>;
    private _show;
    private _hide;
}
