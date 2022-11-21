import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from 'vs/editor/browser/editorBrowser';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import 'vs/css!./stickyScroll';
export declare class StickyScrollWidgetState {
    readonly lineNumbers: number[];
    readonly lastLineRelativePosition: number;
    constructor(lineNumbers: number[], lastLineRelativePosition: number);
}
export declare class StickyScrollWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly _languageFeatureService;
    private readonly _instaService;
    private readonly _layoutInfo;
    private readonly _rootDomNode;
    private readonly _disposableStore;
    private _lineHeight;
    private _lineNumbers;
    private _lastLineRelativePosition;
    private _hoverOnLine;
    private _hoverOnColumn;
    private _stickyRangeProjectedOnEditor;
    private _candidateDefinitionsLength;
    constructor(_editor: ICodeEditor, _languageFeatureService: ILanguageFeaturesService, _instaService: IInstantiationService);
    private updateLinkGesture;
    get lineNumbers(): number[];
    get codeLineCount(): number;
    getCurrentLines(): readonly number[];
    setState(state: StickyScrollWidgetState): void;
    private getChildNode;
    private renderRootNode;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    dispose(): void;
}
