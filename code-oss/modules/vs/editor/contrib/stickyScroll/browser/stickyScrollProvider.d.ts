import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { OutlineModel, OutlineElement } from 'vs/editor/contrib/documentSymbols/browser/outlineModel';
import { FoldingModel } from 'vs/editor/contrib/folding/browser/foldingModel';
export declare class StickyRange {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    constructor(startLineNumber: number, endLineNumber: number);
}
export declare class StickyLineCandidate {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly nestingDepth: number;
    constructor(startLineNumber: number, endLineNumber: number, nestingDepth: number);
}
export declare class StickyLineCandidateProvider extends Disposable {
    static readonly ID = "store.contrib.stickyScrollController";
    private readonly _onDidChangeStickyScroll;
    readonly onDidChangeStickyScroll: import("vs/base/common/event").Event<void>;
    private readonly _editor;
    private readonly _languageFeaturesService;
    private readonly _updateSoon;
    private readonly _sessionStore;
    private _cts;
    private _model;
    constructor(editor: ICodeEditor, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    private readConfiguration;
    getVersionId(): number;
    update(): Promise<void>;
    private updateOutlineModel;
    private updateIndex;
    getCandidateStickyLinesIntersectingFromOutline(range: StickyRange, outlineModel: StickyOutlineElement, result: StickyLineCandidate[], depth: number, lastStartLineNumber: number): void;
    getCandidateStickyLinesIntersecting(range: StickyRange): StickyLineCandidate[];
}
declare class StickyOutlineElement {
    /**
     * Range of line numbers spanned by the current scope
     */
    readonly range: StickyRange | undefined;
    /**
     * Must be sorted by start line number
    */
    readonly children: StickyOutlineElement[];
    /**
     * Parent sticky outline element
     */
    readonly parent: StickyOutlineElement | undefined;
    private static comparator;
    static fromOutlineElement(outlineElement: OutlineElement, previousStartLine: number): StickyOutlineElement;
    static fromOutlineModel(outlineModel: OutlineModel, preferredProvider: string | undefined): {
        stickyOutlineElement: StickyOutlineElement;
        providerID: string | undefined;
    };
    private static findSumOfRangesOfGroup;
    static fromFoldingModel(foldingModel: FoldingModel): StickyOutlineElement;
    constructor(
    /**
     * Range of line numbers spanned by the current scope
     */
    range: StickyRange | undefined, 
    /**
     * Must be sorted by start line number
    */
    children: StickyOutlineElement[], 
    /**
     * Parent sticky outline element
     */
    parent: StickyOutlineElement | undefined);
}
export {};
