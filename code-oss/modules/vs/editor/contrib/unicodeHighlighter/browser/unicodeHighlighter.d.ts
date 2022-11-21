import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./unicodeHighlighter';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, ServicesAccessor } from 'vs/editor/browser/editorExtensions';
import { Range } from 'vs/editor/common/core/range';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { IModelDecoration } from 'vs/editor/common/model';
import { UnicodeHighlighterReason } from 'vs/editor/common/services/unicodeTextModelHighlighter';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { MarkdownHover } from 'vs/editor/contrib/hover/browser/markdownHoverParticipant';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
export declare const warningIcon: import("../../../../platform/theme/common/themeService").ThemeIcon;
export declare class UnicodeHighlighter extends Disposable implements IEditorContribution {
    private readonly _editor;
    private readonly _editorWorkerService;
    private readonly _workspaceTrustService;
    static readonly ID = "editor.contrib.unicodeHighlighter";
    private _highlighter;
    private _options;
    private readonly _bannerController;
    private _bannerClosed;
    constructor(_editor: ICodeEditor, _editorWorkerService: IEditorWorkerService, _workspaceTrustService: IWorkspaceTrustManagementService, instantiationService: IInstantiationService);
    dispose(): void;
    private readonly _updateState;
    private _updateHighlighter;
    getDecorationInfo(decoration: IModelDecoration): UnicodeHighlighterDecorationInfo | null;
}
export interface UnicodeHighlighterDecorationInfo {
    reason: UnicodeHighlighterReason;
    inComment: boolean;
    inString: boolean;
}
export declare class UnicodeHighlighterHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<UnicodeHighlighterHover>;
    readonly range: Range;
    readonly decoration: IModelDecoration;
    constructor(owner: IEditorHoverParticipant<UnicodeHighlighterHover>, range: Range, decoration: IModelDecoration);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class UnicodeHighlighterHoverParticipant implements IEditorHoverParticipant<MarkdownHover> {
    private readonly _editor;
    private readonly _languageService;
    private readonly _openerService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _languageService: ILanguageService, _openerService: IOpenerService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkdownHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkdownHover[]): IDisposable;
}
interface IDisableUnicodeHighlightAction {
    shortLabel: string;
}
export declare class DisableHighlightingInCommentsAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingInStringsAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfAmbiguousCharactersAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfInvisibleCharactersAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class DisableHighlightingOfNonBasicAsciiCharactersAction extends EditorAction implements IDisableUnicodeHighlightAction {
    static ID: string;
    readonly shortLabel: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
    runAction(configurationService: IConfigurationService): Promise<void>;
}
export declare class ShowExcludeOptions extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor, args: any): Promise<void>;
}
export {};
