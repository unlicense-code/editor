import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecoration } from 'vs/editor/common/model';
import { IMarkerDecorationsService } from 'vs/editor/common/services/markerDecorations';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { IMarker } from 'vs/platform/markers/common/markers';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
export declare class MarkerHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<MarkerHover>;
    readonly range: Range;
    readonly marker: IMarker;
    constructor(owner: IEditorHoverParticipant<MarkerHover>, range: Range, marker: IMarker);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class MarkerHoverParticipant implements IEditorHoverParticipant<MarkerHover> {
    private readonly _editor;
    private readonly _markerDecorationsService;
    private readonly _openerService;
    private readonly _languageFeaturesService;
    readonly hoverOrdinal: number;
    private recentMarkerCodeActionsInfo;
    constructor(_editor: ICodeEditor, _markerDecorationsService: IMarkerDecorationsService, _openerService: IOpenerService, _languageFeaturesService: ILanguageFeaturesService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): MarkerHover[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: MarkerHover[]): IDisposable;
    private renderMarkerHover;
    private renderMarkerStatusbar;
    private getCodeActions;
}
