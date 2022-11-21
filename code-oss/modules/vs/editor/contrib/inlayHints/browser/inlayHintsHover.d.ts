import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { ICodeEditor, IEditorMouseEvent } from 'vs/editor/browser/editorBrowser';
import { IModelDecoration } from 'vs/editor/common/model';
import { HoverAnchor, IEditorHoverParticipant } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { MarkdownHover, MarkdownHoverParticipant } from 'vs/editor/contrib/hover/browser/markdownHoverParticipant';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class InlayHintsHover extends MarkdownHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _resolverService;
    readonly hoverOrdinal: number;
    constructor(editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService, configurationService: IConfigurationService, _resolverService: ITextModelService, languageFeaturesService: ILanguageFeaturesService);
    suggestHoverAnchor(mouseEvent: IEditorMouseEvent): HoverAnchor | null;
    computeSync(): MarkdownHover[];
    computeAsync(anchor: HoverAnchor, _lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<MarkdownHover>;
    private _resolveInlayHintLabelPartHover;
}
