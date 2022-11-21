/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { StickyScrollWidget, StickyScrollWidgetState } from './stickyScrollWidget';
import { StickyLineCandidateProvider, StickyRange } from './stickyScrollProvider';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import * as dom from 'vs/base/browser/dom';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { MenuId } from 'vs/platform/actions/common/actions';
let StickyScrollController = class StickyScrollController extends Disposable {
    _contextMenuService;
    static ID = 'store.contrib.stickyScrollController';
    _editor;
    _stickyScrollWidget;
    _stickyLineCandidateProvider;
    _sessionStore = new DisposableStore();
    _widgetState;
    constructor(_editor, _languageFeaturesService, _instaService, _contextMenuService) {
        super();
        this._contextMenuService = _contextMenuService;
        this._editor = _editor;
        this._stickyScrollWidget = new StickyScrollWidget(this._editor, _languageFeaturesService, _instaService);
        this._stickyLineCandidateProvider = new StickyLineCandidateProvider(this._editor, _languageFeaturesService);
        this._widgetState = new StickyScrollWidgetState([], 0);
        this._register(this._stickyScrollWidget);
        this._register(this._stickyLineCandidateProvider);
        this._register(this._editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(105 /* EditorOption.stickyScroll */)) {
                this.readConfiguration();
            }
        }));
        this.readConfiguration();
        this._register(dom.addDisposableListener(this._stickyScrollWidget.getDomNode(), dom.EventType.CONTEXT_MENU, async (event) => {
            this.onContextMenu(event);
        }));
    }
    get stickyScrollCandidateProvider() {
        return this._stickyLineCandidateProvider;
    }
    get stickyScrollWidgetState() {
        return this._widgetState;
    }
    onContextMenu(event) {
        this._contextMenuService.showContextMenu({
            menuId: MenuId.StickyScrollContext,
            getAnchor: () => event,
        });
    }
    readConfiguration() {
        const options = this._editor.getOption(105 /* EditorOption.stickyScroll */);
        if (options.enabled === false) {
            this._editor.removeOverlayWidget(this._stickyScrollWidget);
            this._sessionStore.clear();
            return;
        }
        else {
            this._editor.addOverlayWidget(this._stickyScrollWidget);
            this._sessionStore.add(this._editor.onDidScrollChange(() => this.renderStickyScroll()));
            this._sessionStore.add(this._editor.onDidLayoutChange(() => this.onDidResize()));
            this._sessionStore.add(this._editor.onDidChangeModelTokens((e) => this.onTokensChange(e)));
            this._sessionStore.add(this._stickyLineCandidateProvider.onDidChangeStickyScroll(() => this.renderStickyScroll()));
            const lineNumberOption = this._editor.getOption(61 /* EditorOption.lineNumbers */);
            if (lineNumberOption.renderType === 2 /* RenderLineNumbersType.Relative */) {
                this._sessionStore.add(this._editor.onDidChangeCursorPosition(() => this.renderStickyScroll()));
            }
        }
    }
    needsUpdate(event) {
        const stickyLineNumbers = this._stickyScrollWidget.getCurrentLines();
        for (const stickyLineNumber of stickyLineNumbers) {
            for (const range of event.ranges) {
                if (stickyLineNumber >= range.fromLineNumber && stickyLineNumber <= range.toLineNumber) {
                    return true;
                }
            }
        }
        return false;
    }
    onTokensChange(event) {
        if (this.needsUpdate(event)) {
            this.renderStickyScroll();
        }
    }
    onDidResize() {
        const width = this._editor.getLayoutInfo().width - this._editor.getLayoutInfo().minimap.minimapCanvasOuterWidth - this._editor.getLayoutInfo().verticalScrollbarWidth;
        this._stickyScrollWidget.getDomNode().style.width = `${width}px`;
    }
    renderStickyScroll() {
        if (!(this._editor.hasModel())) {
            return;
        }
        const model = this._editor.getModel();
        if (this._stickyLineCandidateProvider.getVersionId() !== model.getVersionId()) {
            // Old _ranges not updated yet
            return;
        }
        this._widgetState = this.getScrollWidgetState();
        this._stickyScrollWidget.setState(this._widgetState);
    }
    getScrollWidgetState() {
        const lineHeight = this._editor.getOption(60 /* EditorOption.lineHeight */);
        const maxNumberStickyLines = this._editor.getOption(105 /* EditorOption.stickyScroll */).maxLineCount;
        const scrollTop = this._editor.getScrollTop();
        let lastLineRelativePosition = 0;
        const lineNumbers = [];
        const arrayVisibleRanges = this._editor.getVisibleRanges();
        if (arrayVisibleRanges.length !== 0) {
            const fullVisibleRange = new StickyRange(arrayVisibleRanges[0].startLineNumber, arrayVisibleRanges[arrayVisibleRanges.length - 1].endLineNumber);
            const candidateRanges = this._stickyLineCandidateProvider.getCandidateStickyLinesIntersecting(fullVisibleRange);
            for (const range of candidateRanges) {
                const start = range.startLineNumber;
                const end = range.endLineNumber;
                const depth = range.nestingDepth;
                if (end - start > 0) {
                    const topOfElementAtDepth = (depth - 1) * lineHeight;
                    const bottomOfElementAtDepth = depth * lineHeight;
                    const bottomOfBeginningLine = this._editor.getBottomForLineNumber(start) - scrollTop;
                    const topOfEndLine = this._editor.getTopForLineNumber(end) - scrollTop;
                    const bottomOfEndLine = this._editor.getBottomForLineNumber(end) - scrollTop;
                    if (topOfElementAtDepth > topOfEndLine && topOfElementAtDepth <= bottomOfEndLine) {
                        lineNumbers.push(start);
                        lastLineRelativePosition = bottomOfEndLine - bottomOfElementAtDepth;
                        break;
                    }
                    else if (bottomOfElementAtDepth > bottomOfBeginningLine && bottomOfElementAtDepth <= bottomOfEndLine) {
                        lineNumbers.push(start);
                    }
                    if (lineNumbers.length === maxNumberStickyLines) {
                        break;
                    }
                }
            }
        }
        return new StickyScrollWidgetState(lineNumbers, lastLineRelativePosition);
    }
    dispose() {
        super.dispose();
        this._sessionStore.dispose();
    }
};
StickyScrollController = __decorate([
    __param(1, ILanguageFeaturesService),
    __param(2, IInstantiationService),
    __param(3, IContextMenuService)
], StickyScrollController);
export { StickyScrollController };
