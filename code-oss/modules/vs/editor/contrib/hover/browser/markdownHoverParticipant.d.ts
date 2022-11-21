import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecoration } from 'vs/editor/common/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class MarkdownHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkdownHover>;
    readonly range: Range;
    readonly contents: IMarkdownString[];
    readonly isBeforeContent: boolean;
    readonly ordinal: number;
    constructor(owner: IEditorHoverParticipant<MarkdownHover>, range: Range, contents: IMarkdownString[], isBeforeContent: boolean, ordinal: number);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    protected readonly _editor: ICodeEditor;
    private readonly _languageService;
    private readonly _openerService;
    private readonly _configurationService;
    protected readonly _languageFeaturesService: ILanguageFeaturesService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService, _configurationService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService);
    createLoadingMessage(anchor: HoverAnchor): MarkdownHover | null;
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<MarkdownHover>;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IDisposable;
}
export declare function renderMarkdownHovers(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[], editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService): IDisposable;
