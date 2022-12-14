import 'vs/css!./media/diffReview';
import { FastDomNode } from 'vs/base/browser/fastDomNode';
import { Disposable } from 'vs/base/common/lifecycle';
import { DiffEditorWidget } from 'vs/editor/browser/widget/diffEditorWidget';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
export declare class DiffReview extends Disposable {
    private readonly _languageService;
    private readonly _audioCueService;
    private static _ttPolicy;
    private readonly _diffEditor;
    private _isVisible;
    readonly shadow: FastDomNode<HTMLElement>;
    private readonly _actionBar;
    readonly actionBarContainer: FastDomNode<HTMLElement>;
    readonly domNode: FastDomNode<HTMLElement>;
    private readonly _content;
    private readonly scrollbar;
    private _diffs;
    private _currentDiff;
    constructor(diffEditor: DiffEditorWidget, _languageService: ILanguageService, _audioCueService: IAudioCueService);
    prev(): void;
    next(): void;
    private accept;
    private hide;
    private _getPrevRow;
    private _getNextRow;
    private _getFirstRow;
    private _getCurrentFocusedRow;
    private _goToRow;
    isVisible(): boolean;
    private _width;
    layout(top: number, width: number, height: number): void;
    private _compute;
    private static _mergeAdjacent;
    private _findDiffIndex;
    private _render;
    private static _renderSection;
    private static _renderLine;
}
