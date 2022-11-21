import { Disposable } from 'vs/base/common/lifecycle';
import { ICodeEditor } from 'vs/editor/browser/editorBrowser';
import { IEditorContribution } from 'vs/editor/common/editorCommon';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { StickyScrollWidgetState } from './stickyScrollWidget';
import { StickyLineCandidateProvider } from './stickyScrollProvider';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
export declare class StickyScrollController extends Disposable implements IEditorContribution {
    private readonly _contextMenuService;
    static readonly ID = "store.contrib.stickyScrollController";
    private readonly _editor;
    private readonly _stickyScrollWidget;
    private readonly _stickyLineCandidateProvider;
    private readonly _sessionStore;
    private _widgetState;
    constructor(_editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _instaService: IInstantiationService, _contextMenuService: IContextMenuService);
    get stickyScrollCandidateProvider(): StickyLineCandidateProvider;
    get stickyScrollWidgetState(): StickyScrollWidgetState;
    private onContextMenu;
    private readConfiguration;
    private needsUpdate;
    private onTokensChange;
    private onDidResize;
    private renderStickyScroll;
    getScrollWidgetState(): StickyScrollWidgetState;
    dispose(): void;
}
