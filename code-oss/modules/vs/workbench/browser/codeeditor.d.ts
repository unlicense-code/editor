import { Widget } from 'vs/base/browser/ui/widget';
import { IOverlayWidget, ICodeEditor, IOverlayWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { Disposable } from 'vs/base/common/lifecycle';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { URI } from 'vs/base/common/uri';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IRange } from 'vs/editor/common/core/range';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export interface IRangeHighlightDecoration {
    resource: URI;
    range: IRange;
    isWholeLine?: boolean;
}
export declare class RangeHighlightDecorations extends Disposable {
    private readonly editorService;
    private readonly _onHighlightRemoved;
    readonly onHighlightRemoved: import("vs/base/common/event").Event<void>;
    private rangeHighlightDecorationId;
    private editor;
    private readonly editorDisposables;
    constructor(editorService: IEditorService);
    removeHighlightRange(): void;
    highlightRange(range: IRangeHighlightDecoration, editor?: any): void;
    private doHighlightRange;
    private getEditor;
    private setEditor;
    private static readonly _WHOLE_LINE_RANGE_HIGHLIGHT;
    private static readonly _RANGE_HIGHLIGHT;
    private createRangeHighlightDecoration;
    dispose(): void;
}
export declare class FloatingClickWidget extends Widget implements IOverlayWidget {
    private editor;
    private label;
    private readonly themeService;
    private readonly _onClick;
    readonly onClick: import("vs/base/common/event").Event<void>;
    private _domNode;
    constructor(editor: ICodeEditor, label: string, keyBindingAction: string | null, keybindingService: IKeybindingService, themeService: IThemeService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    render(): void;
    dispose(): void;
}
export declare class FloatingClickMenu extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.floatingClickMenu";
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, menuService: IMenuService, contextKeyService: IContextKeyService);
}
