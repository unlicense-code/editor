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
import { Color } from 'vs/base/common/color';
import { Emitter } from 'vs/base/common/event';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { withNullAsUndefined } from 'vs/base/common/types';
import { Range } from 'vs/editor/common/core/range';
import * as languages from 'vs/editor/common/languages';
import { ZoneWidget } from 'vs/editor/contrib/zoneWidget/browser/zoneWidget';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { CommentGlyphWidget } from 'vs/workbench/contrib/comments/browser/commentGlyphWidget';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { CommentThreadWidget } from 'vs/workbench/contrib/comments/browser/commentThreadWidget';
import { commentThreadStateBackgroundColorVar, commentThreadStateColorVar, getCommentThreadStateColor } from 'vs/workbench/contrib/comments/browser/commentColors';
import { peekViewBorder } from 'vs/editor/contrib/peekView/browser/peekView';
function getCommentThreadWidgetStateColor(thread, theme) {
    return getCommentThreadStateColor(thread, theme) ?? theme.getColor(peekViewBorder);
}
export function parseMouseDownInfoFromEvent(e) {
    const range = e.target.range;
    if (!range) {
        return null;
    }
    if (!e.event.leftButton) {
        return null;
    }
    if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
        return null;
    }
    const data = e.target.detail;
    const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;
    // don't collide with folding and git decorations
    if (gutterOffsetX > 20) {
        return null;
    }
    return { lineNumber: range.startLineNumber };
}
export function isMouseUpEventDragFromMouseDown(mouseDownInfo, e) {
    if (!mouseDownInfo) {
        return null;
    }
    const { lineNumber } = mouseDownInfo;
    const range = e.target.range;
    if (!range) {
        return null;
    }
    return lineNumber;
}
export function isMouseUpEventMatchMouseDown(mouseDownInfo, e) {
    if (!mouseDownInfo) {
        return null;
    }
    const { lineNumber } = mouseDownInfo;
    const range = e.target.range;
    if (!range || range.startLineNumber !== lineNumber) {
        return null;
    }
    if (e.target.type !== 4 /* MouseTargetType.GUTTER_LINE_DECORATIONS */) {
        return null;
    }
    return lineNumber;
}
let ReviewZoneWidget = class ReviewZoneWidget extends ZoneWidget {
    _owner;
    _commentThread;
    _pendingComment;
    themeService;
    commentService;
    _commentThreadWidget;
    _onDidClose = new Emitter();
    _onDidCreateThread = new Emitter();
    _isExpanded;
    _initialCollapsibleState;
    _commentGlyph;
    _globalToDispose = new DisposableStore();
    _commentThreadDisposables = [];
    _contextKeyService;
    _scopedInstantiationService;
    get owner() {
        return this._owner;
    }
    get commentThread() {
        return this._commentThread;
    }
    _commentOptions;
    constructor(editor, _owner, _commentThread, _pendingComment, instantiationService, themeService, commentService, contextKeyService) {
        super(editor, { keepEditorSelection: true });
        this._owner = _owner;
        this._commentThread = _commentThread;
        this._pendingComment = _pendingComment;
        this.themeService = themeService;
        this.commentService = commentService;
        this._contextKeyService = contextKeyService.createScoped(this.domNode);
        this._scopedInstantiationService = instantiationService.createChild(new ServiceCollection([IContextKeyService, this._contextKeyService]));
        const controller = this.commentService.getCommentController(this._owner);
        if (controller) {
            this._commentOptions = controller.options;
        }
        this._initialCollapsibleState = _commentThread.initialCollapsibleState;
        this._isExpanded = _commentThread.initialCollapsibleState === languages.CommentThreadCollapsibleState.Expanded;
        this._commentThreadDisposables = [];
        this.create();
        this._globalToDispose.add(this.themeService.onDidColorThemeChange(this._applyTheme, this));
        this._globalToDispose.add(this.editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(45 /* EditorOption.fontInfo */)) {
                this._applyTheme(this.themeService.getColorTheme());
            }
        }));
        this._applyTheme(this.themeService.getColorTheme());
    }
    get onDidClose() {
        return this._onDidClose.event;
    }
    get onDidCreateThread() {
        return this._onDidCreateThread.event;
    }
    getPosition() {
        if (this.position) {
            return this.position;
        }
        if (this._commentGlyph) {
            return withNullAsUndefined(this._commentGlyph.getPosition().position);
        }
        return undefined;
    }
    revealLine(lineNumber) {
        // we don't do anything here as we always do the reveal ourselves.
    }
    reveal(commentUniqueId, focus = false) {
        if (!this._isExpanded) {
            this.show({ lineNumber: this._commentThread.range.endLineNumber, column: 1 }, 2);
        }
        if (commentUniqueId !== undefined) {
            const height = this.editor.getLayoutInfo().height;
            const coords = this._commentThreadWidget.getCommentCoords(commentUniqueId);
            if (coords) {
                const commentThreadCoords = coords.thread;
                const commentCoords = coords.comment;
                this.editor.setScrollTop(this.editor.getTopForLineNumber(this._commentThread.range.startLineNumber) - height / 2 + commentCoords.top - commentThreadCoords.top);
                return;
            }
        }
        this.editor.revealRangeInCenter(this._commentThread.range);
        if (focus) {
            this._commentThreadWidget.focus();
        }
    }
    getPendingComment() {
        return this._commentThreadWidget.getPendingComment();
    }
    _fillContainer(container) {
        this.setCssClass('review-widget');
        this._commentThreadWidget = this._scopedInstantiationService.createInstance(CommentThreadWidget, container, this._owner, this.editor.getModel().uri, this._contextKeyService, this._scopedInstantiationService, this._commentThread, this._pendingComment, { editor: this.editor, codeBlockFontSize: '' }, this._commentOptions, {
            actionRunner: () => {
                if (!this._commentThread.comments || !this._commentThread.comments.length) {
                    const newPosition = this.getPosition();
                    if (newPosition) {
                        let range;
                        const originalRange = this._commentThread.range;
                        if (newPosition.lineNumber !== originalRange.endLineNumber) {
                            // The widget could have moved as a result of editor changes.
                            // We need to try to calculate the new, more correct, range for the comment.
                            const distance = newPosition.lineNumber - this._commentThread.range.endLineNumber;
                            range = new Range(originalRange.startLineNumber + distance, originalRange.startColumn, originalRange.endLineNumber + distance, originalRange.endColumn);
                        }
                        else {
                            range = new Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.endColumn);
                        }
                        this.commentService.updateCommentThreadTemplate(this.owner, this._commentThread.commentThreadHandle, range);
                    }
                }
            },
            collapse: () => {
                this.collapse();
            }
        });
        this._disposables.add(this._commentThreadWidget);
    }
    deleteCommentThread() {
        this.dispose();
        this.commentService.disposeCommentThread(this.owner, this._commentThread.threadId);
    }
    collapse() {
        this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
        if (this._commentThread.comments && this._commentThread.comments.length === 0) {
            this.deleteCommentThread();
            return Promise.resolve();
        }
        this.hide();
        return Promise.resolve();
    }
    expand() {
        this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
        const lineNumber = this._commentThread.range.endLineNumber;
        this.show({ lineNumber, column: 1 }, 2);
        return Promise.resolve();
    }
    getGlyphPosition() {
        if (this._commentGlyph) {
            return this._commentGlyph.getPosition().position.lineNumber;
        }
        return 0;
    }
    toggleExpand(lineNumber) {
        if (this._isExpanded) {
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
            this.hide();
            if (!this._commentThread.comments || !this._commentThread.comments.length) {
                this.deleteCommentThread();
            }
        }
        else {
            this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
            this.show({ lineNumber: lineNumber, column: 1 }, 2);
        }
    }
    async update(commentThread) {
        if (this._commentThread !== commentThread) {
            this._commentThreadDisposables.forEach(disposable => disposable.dispose());
            this._commentThread = commentThread;
            this._commentThreadDisposables = [];
            this.bindCommentThreadListeners();
        }
        this._commentThreadWidget.updateCommentThread(commentThread);
        // Move comment glyph widget and show position if the line has changed.
        const lineNumber = this._commentThread.range.endLineNumber;
        let shouldMoveWidget = false;
        if (this._commentGlyph) {
            if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
                shouldMoveWidget = true;
                this._commentGlyph.setLineNumber(lineNumber);
            }
        }
        if (shouldMoveWidget && this._isExpanded) {
            this.show({ lineNumber, column: 1 }, 2);
        }
        if (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) {
            this.show({ lineNumber, column: 1 }, 2);
        }
        else {
            this.hide();
        }
    }
    _onWidth(widthInPixel) {
        this._commentThreadWidget.layout(widthInPixel);
    }
    _doLayout(heightInPixel, widthInPixel) {
        this._commentThreadWidget.layout(widthInPixel);
    }
    display(lineNumber) {
        this._commentGlyph = new CommentGlyphWidget(this.editor, lineNumber);
        this._commentThreadWidget.display(this.editor.getOption(60 /* EditorOption.lineHeight */));
        this._disposables.add(this._commentThreadWidget.onDidResize(dimension => {
            this._refresh(dimension);
        }));
        if (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) {
            this.show({ lineNumber: lineNumber, column: 1 }, 2);
        }
        // If this is a new comment thread awaiting user input then we need to reveal it.
        if (this._commentThread.canReply && this._commentThread.isTemplate && (!this._commentThread.comments || (this._commentThread.comments.length === 0))) {
            this.reveal();
        }
        this.bindCommentThreadListeners();
    }
    bindCommentThreadListeners() {
        this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
            await this.update(this._commentThread);
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeRange(range => {
            // Move comment glyph widget and show position if the line has changed.
            const lineNumber = this._commentThread.range.startLineNumber;
            let shouldMoveWidget = false;
            if (this._commentGlyph) {
                if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
                    shouldMoveWidget = true;
                    this._commentGlyph.setLineNumber(lineNumber);
                }
            }
            if (shouldMoveWidget && this._isExpanded) {
                this.show({ lineNumber, column: 1 }, 2);
            }
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeCollapsibleState(state => {
            if (state === languages.CommentThreadCollapsibleState.Expanded && !this._isExpanded) {
                const lineNumber = this._commentThread.range.startLineNumber;
                this.show({ lineNumber, column: 1 }, 2);
                return;
            }
            if (state === languages.CommentThreadCollapsibleState.Collapsed && this._isExpanded) {
                this.hide();
                return;
            }
        }));
        if (this._initialCollapsibleState === undefined) {
            const onDidChangeInitialCollapsibleState = this._commentThread.onDidChangeInitialCollapsibleState(state => {
                this._initialCollapsibleState = state;
                this._commentThread.collapsibleState = state;
                onDidChangeInitialCollapsibleState.dispose();
            });
            this._commentThreadDisposables.push(onDidChangeInitialCollapsibleState);
        }
        this._commentThreadDisposables.push(this._commentThread.onDidChangeState(() => {
            const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || Color.transparent;
            this.style({
                frameColor: borderColor,
                arrowColor: borderColor,
            });
            this.container?.style.setProperty(commentThreadStateColorVar, `${borderColor}`);
            this.container?.style.setProperty(commentThreadStateBackgroundColorVar, `${borderColor.transparent(.1)}`);
        }));
    }
    async submitComment() {
        this._commentThreadWidget.submitComment();
    }
    _refresh(dimensions) {
        if (this._isExpanded && dimensions) {
            this._commentThreadWidget.layout();
            const headHeight = Math.ceil(this.editor.getOption(60 /* EditorOption.lineHeight */) * 1.2);
            const lineHeight = this.editor.getOption(60 /* EditorOption.lineHeight */);
            const arrowHeight = Math.round(lineHeight / 3);
            const frameThickness = Math.round(lineHeight / 9) * 2;
            const computedLinesNumber = Math.ceil((headHeight + dimensions.height + arrowHeight + frameThickness + 8 /** margin bottom to avoid margin collapse */) / lineHeight);
            if (this._viewZone?.heightInLines === computedLinesNumber) {
                return;
            }
            const currentPosition = this.getPosition();
            if (this._viewZone && currentPosition && currentPosition.lineNumber !== this._viewZone.afterLineNumber) {
                this._viewZone.afterLineNumber = currentPosition.lineNumber;
            }
            if (!this._commentThread.comments || !this._commentThread.comments.length) {
                this._commentThreadWidget.focusCommentEditor();
            }
            this._relayout(computedLinesNumber);
        }
    }
    _applyTheme(theme) {
        const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || Color.transparent;
        this.style({
            arrowColor: borderColor,
            frameColor: borderColor
        });
        const fontInfo = this.editor.getOption(45 /* EditorOption.fontInfo */);
        // Editor decorations should also be responsive to theme changes
        this._commentThreadWidget.applyTheme(theme, fontInfo);
    }
    show(rangeOrPos, heightInLines) {
        this._isExpanded = true;
        super.show(rangeOrPos, heightInLines);
        this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
        this._refresh(this._commentThreadWidget.getDimensions());
    }
    hide() {
        if (this._isExpanded) {
            this._isExpanded = false;
            // Focus the container so that the comment editor will be blurred before it is hidden
            if (this.editor.hasWidgetFocus()) {
                this.editor.focus();
            }
        }
        super.hide();
    }
    dispose() {
        super.dispose();
        if (this._commentGlyph) {
            this._commentGlyph.dispose();
            this._commentGlyph = undefined;
        }
        this._globalToDispose.dispose();
        this._commentThreadDisposables.forEach(global => global.dispose());
        this._onDidClose.fire(undefined);
    }
};
ReviewZoneWidget = __decorate([
    __param(4, IInstantiationService),
    __param(5, IThemeService),
    __param(6, ICommentService),
    __param(7, IContextKeyService)
], ReviewZoneWidget);
export { ReviewZoneWidget };
