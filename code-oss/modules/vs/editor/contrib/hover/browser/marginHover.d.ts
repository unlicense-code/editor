import { IMarkdownString } from 'vs/base/common/htmlContent';
import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { IOpenerService } from 'vs/platform/opener/common/opener';
export interface IHoverMessage {
    value: IMarkdownString;
}
export declare class MarginHoverWidget extends Disposable implements IOverlayWidget {
    static readonly ID = "editor.contrib.modesGlyphHoverWidget";
    private readonly _editor;
    private readonly _hover;
    private _isVisible;
    private _messages;
    private readonly _markdownRenderer;
    private readonly _computer;
    private readonly _hoverOperation;
    private readonly _renderDisposeables;
    constructor(editor: ICodeEditor, languageService: ILanguageService, openerService: IOpenerService);
    dispose(): void;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    private _updateFont;
    private _onModelDecorationsChanged;
    startShowingAt(lineNumber: number): void;
    hide(): void;
    private _withResult;
    private _renderMessages;
    private _updateContents;
    private _showAt;
}
