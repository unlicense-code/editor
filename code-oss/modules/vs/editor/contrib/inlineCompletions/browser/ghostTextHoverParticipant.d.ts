import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IEditorMouseEvent } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecoration } from 'vs/editor/common/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { GhostTextController } from 'vs/editor/contrib/inlineCompletions/browser/ghostTextController';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { Command } from 'vs/editor/common/languages';
export declare class InlineCompletionsHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<InlineCompletionsHover>;
    readonly range: Range;
    readonly controller: GhostTextController;
    constructor(owner: IEditorHoverParticipant<InlineCompletionsHover>, range: Range, controller: GhostTextController);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
    hasMultipleSuggestions(): Promise<boolean>;
    get commands(): Command[];
}
export declare class InlineCompletionsHoverParticipant implements IEditorHoverParticipant<InlineCompletionsHover> {
    private readonly _editor;
    private readonly _commandService;
    private readonly _menuService;
    private readonly _contextKeyService;
    private readonly _languageService;
    private readonly _openerService;
    private readonly accessibilityService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _commandService: ICommandService, _menuService: IMenuService, _contextKeyService: IContextKeyService, _languageService: ILanguageService, _openerService: IOpenerService, accessibilityService: IAccessibilityService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): InlineCompletionsHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: InlineCompletionsHover[]): IDisposable;
    private renderScreenReaderText;
}
