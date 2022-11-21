import { AsyncIterableObject } from 'vs/base/common/async';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { Range } from 'vs/editor/common/core/range';
import { IModelDecoration } from 'vs/editor/common/model';
import { DocumentColorProvider } from 'vs/editor/common/languages';
import { ColorPickerModel } from 'vs/editor/contrib/colorPicker/browser/colorPickerModel';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart } from 'vs/editor/contrib/hover/browser/hoverTypes';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare class ColorHover implements IHoverPart {
    readonly owner: IEditorHoverParticipant<ColorHover>;
    readonly range: Range;
    readonly model: ColorPickerModel;
    readonly provider: DocumentColorProvider;
    /**
     * Force the hover to always be rendered at this specific range,
     * even in the case of multiple hover parts.
     */
    readonly forceShowAtRange: boolean;
    constructor(owner: IEditorHoverParticipant<ColorHover>, range: Range, model: ColorPickerModel, provider: DocumentColorProvider);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
export declare class ColorHoverParticipant implements IEditorHoverParticipant<ColorHover> {
    private readonly _editor;
    private readonly _themeService;
    readonly hoverOrdinal: number;
    constructor(_editor: ICodeEditor, _themeService: IThemeService);
    computeSync(anchor: HoverAnchor, lineDecorations: IModelDecoration[]): ColorHover[];
    computeAsync(anchor: HoverAnchor, lineDecorations: IModelDecoration[], token: CancellationToken): AsyncIterableObject<ColorHover>;
    private _computeAsync;
    private _createColorHover;
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: ColorHover[]): IDisposable;
}
