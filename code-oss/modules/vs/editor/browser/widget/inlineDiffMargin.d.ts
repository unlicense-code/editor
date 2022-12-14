import { Disposable } from 'vs/base/common/lifecycle';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { ITextModel } from 'vs/editor/common/model';
export interface IDiffLinesChange {
    readonly originalStartLineNumber: number;
    readonly originalEndLineNumber: number;
    readonly modifiedStartLineNumber: number;
    readonly modifiedEndLineNumber: number;
    readonly originalModel: ITextModel;
    viewLineCounts: number[] | null;
}
export declare class InlineDiffMargin extends Disposable {
    private readonly _viewZoneId;
    private readonly _marginDomNode;
    readonly editor: CodeEditorWidget;
    readonly diff: IDiffLinesChange;
    private readonly _contextMenuService;
    private readonly _clipboardService;
    private readonly _diffActions;
    private _visibility;
    get visibility(): boolean;
    set visibility(_visibility: boolean);
    constructor(_viewZoneId: string, _marginDomNode: HTMLElement, editor: CodeEditorWidget, diff: IDiffLinesChange, _contextMenuService: IContextMenuService, _clipboardService: IClipboardService);
    private _updateLightBulbPosition;
}
