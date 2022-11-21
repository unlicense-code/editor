import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IActiveCodeEditor } from 'vs/editor/browser/editorBrowser';
export declare class GhostText {
    readonly lineNumber: number;
    readonly parts: GhostTextPart[];
    readonly additionalReservedLineCount: number;
    static equals(a: GhostText | undefined, b: GhostText | undefined): boolean;
    constructor(lineNumber: number, parts: GhostTextPart[], additionalReservedLineCount?: number);
    equals(other: GhostText): boolean;
    /**
     * Only used for testing/debugging.
    */
    render(documentText: string, debug?: boolean): string;
    renderForScreenReader(lineText: string): string;
    isEmpty(): boolean;
}
export declare class GhostTextPart {
    readonly column: number;
    readonly lines: readonly string[];
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    readonly preview: boolean;
    constructor(column: number, lines: readonly string[], 
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    preview: boolean);
    equals(other: GhostTextPart): boolean;
}
export declare class GhostTextReplacement {
    readonly lineNumber: number;
    readonly columnStart: number;
    readonly length: number;
    readonly newLines: readonly string[];
    readonly additionalReservedLineCount: number;
    constructor(lineNumber: number, columnStart: number, length: number, newLines: readonly string[], additionalReservedLineCount?: number);
    readonly parts: ReadonlyArray<GhostTextPart>;
    renderForScreenReader(_lineText: string): string;
    render(documentText: string, debug?: boolean): string;
}
export interface GhostTextWidgetModel {
    readonly onDidChange: Event<void>;
    readonly ghostText: GhostText | GhostTextReplacement | undefined;
    setExpanded(expanded: boolean): void;
    readonly expanded: boolean;
    readonly minReservedLineCount: number;
}
export declare abstract class BaseGhostTextWidgetModel extends Disposable implements GhostTextWidgetModel {
    protected readonly editor: IActiveCodeEditor;
    abstract readonly ghostText: GhostText | GhostTextReplacement | undefined;
    private _expanded;
    protected readonly onDidChangeEmitter: Emitter<void>;
    readonly onDidChange: Event<void>;
    abstract readonly minReservedLineCount: number;
    get expanded(): boolean;
    constructor(editor: IActiveCodeEditor);
    setExpanded(expanded: boolean): void;
}
