import { ICodeEditor, IContentWidgetPosition } from 'vs/editor/browser/editorBrowser';
export declare const overviewRulerCommentingRangeForeground: string;
export declare class CommentGlyphWidget {
    static description: string;
    private _lineNumber;
    private _editor;
    private readonly _commentsDecorations;
    private _commentsOptions;
    constructor(editor: ICodeEditor, lineNumber: number);
    private createDecorationOptions;
    setLineNumber(lineNumber: number): void;
    getPosition(): IContentWidgetPosition;
    dispose(): void;
}
