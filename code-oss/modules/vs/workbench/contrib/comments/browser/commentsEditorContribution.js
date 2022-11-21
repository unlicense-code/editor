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
import { $ } from 'vs/base/browser/dom';
import { Action } from 'vs/base/common/actions';
import { coalesce, findFirstInSorted } from 'vs/base/common/arrays';
import { createCancelablePromise, Delayer } from 'vs/base/common/async';
import { onUnexpectedError } from 'vs/base/common/errors';
import { DisposableStore, dispose } from 'vs/base/common/lifecycle';
import 'vs/css!./media/review';
import { isCodeEditor, isDiffEditor } from 'vs/editor/browser/editorBrowser';
import { EditorAction, registerEditorAction, registerEditorContribution } from 'vs/editor/browser/editorExtensions';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { Range } from 'vs/editor/common/core/range';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
import * as languages from 'vs/editor/common/languages';
import { peekViewResultsBackground, peekViewResultsSelectionBackground, peekViewTitleBackground } from 'vs/editor/contrib/peekView/browser/peekView';
import * as nls from 'vs/nls';
import { CommandsRegistry } from 'vs/platform/commands/common/commands';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { editorForeground } from 'vs/platform/theme/common/colorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { STATUS_BAR_ITEM_ACTIVE_BACKGROUND, STATUS_BAR_ITEM_HOVER_BACKGROUND } from 'vs/workbench/common/theme';
import { CommentGlyphWidget, overviewRulerCommentingRangeForeground } from 'vs/workbench/contrib/comments/browser/commentGlyphWidget';
import { ICommentService } from 'vs/workbench/contrib/comments/browser/commentService';
import { isMouseUpEventDragFromMouseDown, parseMouseDownInfoFromEvent, ReviewZoneWidget } from 'vs/workbench/contrib/comments/browser/commentThreadZoneWidget';
import { ctxCommentEditorFocused, SimpleCommentEditor } from 'vs/workbench/contrib/comments/browser/simpleCommentEditor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { EmbeddedCodeEditorWidget } from 'vs/editor/browser/widget/embeddedCodeEditorWidget';
import { IViewsService } from 'vs/workbench/common/views';
import { COMMENTS_VIEW_ID } from 'vs/workbench/contrib/comments/browser/commentsTreeViewer';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { COMMENTS_SECTION } from 'vs/workbench/contrib/comments/common/commentsConfiguration';
import { COMMENTEDITOR_DECORATION_KEY } from 'vs/workbench/contrib/comments/browser/commentReply';
import { Emitter } from 'vs/base/common/event';
import { MenuId, MenuRegistry } from 'vs/platform/actions/common/actions';
import { IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { CommentThreadRangeDecorator } from 'vs/workbench/contrib/comments/browser/commentThreadRangeDecorator';
import { commentThreadRangeActiveBackground, commentThreadRangeActiveBorder, commentThreadRangeBackground, commentThreadRangeBorder } from 'vs/workbench/contrib/comments/browser/commentColors';
import { withNullAsUndefined, withUndefinedAsNull } from 'vs/base/common/types';
import { DiffEditorInput } from 'vs/workbench/common/editor/diffEditorInput';
export const ID = 'editor.contrib.review';
export class ReviewViewZone {
    afterLineNumber;
    domNode;
    callback;
    constructor(afterLineNumber, onDomNodeTop) {
        this.afterLineNumber = afterLineNumber;
        this.callback = onDomNodeTop;
        this.domNode = $('.review-viewzone');
    }
    onDomNodeTop(top) {
        this.callback(top);
    }
}
class CommentingRangeDecoration {
    _editor;
    _ownerId;
    _extensionId;
    _label;
    _range;
    options;
    commentingRangesInfo;
    isHover;
    _decorationId;
    _startLineNumber;
    _endLineNumber;
    get id() {
        return this._decorationId;
    }
    set id(id) {
        this._decorationId = id;
    }
    get range() {
        return {
            startLineNumber: this._startLineNumber, startColumn: 1,
            endLineNumber: this._endLineNumber, endColumn: 1
        };
    }
    constructor(_editor, _ownerId, _extensionId, _label, _range, options, commentingRangesInfo, isHover = false) {
        this._editor = _editor;
        this._ownerId = _ownerId;
        this._extensionId = _extensionId;
        this._label = _label;
        this._range = _range;
        this.options = options;
        this.commentingRangesInfo = commentingRangesInfo;
        this.isHover = isHover;
        this._startLineNumber = _range.startLineNumber;
        this._endLineNumber = _range.endLineNumber;
    }
    getCommentAction() {
        return {
            extensionId: this._extensionId,
            label: this._label,
            ownerId: this._ownerId,
            commentingRangesInfo: this.commentingRangesInfo
        };
    }
    getOriginalRange() {
        return this._range;
    }
    getActiveRange() {
        return this.id ? this._editor.getModel().getDecorationRange(this.id) : undefined;
    }
}
class CommentingRangeDecorator {
    static description = 'commenting-range-decorator';
    decorationOptions;
    hoverDecorationOptions;
    multilineDecorationOptions;
    commentingRangeDecorations = [];
    decorationIds = [];
    _editor;
    _infos;
    _lastHover = -1;
    _lastSelection;
    _lastSelectionCursor;
    _onDidChangeDecorationsCount = new Emitter();
    onDidChangeDecorationsCount = this._onDidChangeDecorationsCount.event;
    constructor() {
        const decorationOptions = {
            description: CommentingRangeDecorator.description,
            isWholeLine: true,
            linesDecorationsClassName: 'comment-range-glyph comment-diff-added'
        };
        this.decorationOptions = ModelDecorationOptions.createDynamic(decorationOptions);
        const hoverDecorationOptions = {
            description: CommentingRangeDecorator.description,
            isWholeLine: true,
            linesDecorationsClassName: `comment-range-glyph line-hover`
        };
        this.hoverDecorationOptions = ModelDecorationOptions.createDynamic(hoverDecorationOptions);
        const multilineDecorationOptions = {
            description: CommentingRangeDecorator.description,
            isWholeLine: true,
            linesDecorationsClassName: `comment-range-glyph multiline-add`
        };
        this.multilineDecorationOptions = ModelDecorationOptions.createDynamic(multilineDecorationOptions);
    }
    updateHover(hoverLine) {
        if (this._editor && this._infos && (hoverLine !== this._lastHover)) {
            this._doUpdate(this._editor, this._infos, hoverLine);
        }
        this._lastHover = hoverLine ?? -1;
    }
    updateSelection(cursorLine, range = new Range(0, 0, 0, 0)) {
        this._lastSelection = range.isEmpty() ? undefined : range;
        this._lastSelectionCursor = range.isEmpty() ? undefined : cursorLine;
        // Some scenarios:
        // Selection is made. Emphasis should show on the drag/selection end location.
        // Selection is made, then user clicks elsewhere. We should still show the decoration.
        if (this._editor && this._infos) {
            this._doUpdate(this._editor, this._infos, cursorLine, range);
        }
    }
    update(editor, commentInfos, cursorLine, range) {
        if (editor) {
            this._editor = editor;
            this._infos = commentInfos;
            this._doUpdate(editor, commentInfos, cursorLine, range);
        }
    }
    _lineHasThread(editor, lineRange) {
        return editor.getDecorationsInRange(lineRange)?.find(decoration => decoration.options.description === CommentGlyphWidget.description);
    }
    _doUpdate(editor, commentInfos, emphasisLine = -1, selectionRange = this._lastSelection) {
        const model = editor.getModel();
        if (!model) {
            return;
        }
        // If there's still a selection, use that.
        emphasisLine = this._lastSelectionCursor ?? emphasisLine;
        const commentingRangeDecorations = [];
        for (const info of commentInfos) {
            info.commentingRanges.ranges.forEach(range => {
                const rangeObject = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                let intersectingSelectionRange = selectionRange ? rangeObject.intersectRanges(selectionRange) : undefined;
                if ((selectionRange && (emphasisLine >= 0) && intersectingSelectionRange)
                    // If there's only one selection line, then just drop into the else if and show an emphasis line.
                    && !((intersectingSelectionRange.startLineNumber === intersectingSelectionRange.endLineNumber)
                        && (emphasisLine === intersectingSelectionRange.startLineNumber))) {
                    // The emphasisLine should be within the commenting range, even if the selection range stretches
                    // outside of the commenting range.
                    // Clip the emphasis and selection ranges to the commenting range
                    let intersectingEmphasisRange;
                    if (emphasisLine <= intersectingSelectionRange.startLineNumber) {
                        intersectingEmphasisRange = intersectingSelectionRange.collapseToStart();
                        intersectingSelectionRange = new Range(intersectingSelectionRange.startLineNumber + 1, 1, intersectingSelectionRange.endLineNumber, 1);
                    }
                    else {
                        intersectingEmphasisRange = new Range(intersectingSelectionRange.endLineNumber, 1, intersectingSelectionRange.endLineNumber, 1);
                        intersectingSelectionRange = new Range(intersectingSelectionRange.startLineNumber, 1, intersectingSelectionRange.endLineNumber - 1, 1);
                    }
                    commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingSelectionRange, this.multilineDecorationOptions, info.commentingRanges, true));
                    if (!this._lineHasThread(editor, intersectingEmphasisRange)) {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, intersectingEmphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                    }
                    const beforeRangeEndLine = Math.min(intersectingEmphasisRange.startLineNumber, intersectingSelectionRange.startLineNumber) - 1;
                    const hasBeforeRange = rangeObject.startLineNumber <= beforeRangeEndLine;
                    const afterRangeStartLine = Math.max(intersectingEmphasisRange.endLineNumber, intersectingSelectionRange.endLineNumber) + 1;
                    const hasAfterRange = rangeObject.endLineNumber >= afterRangeStartLine;
                    if (hasBeforeRange) {
                        const beforeRange = new Range(range.startLineNumber, 1, beforeRangeEndLine, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                    }
                    if (hasAfterRange) {
                        const afterRange = new Range(afterRangeStartLine, 1, range.endLineNumber, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                    }
                }
                else if ((rangeObject.startLineNumber <= emphasisLine) && (emphasisLine <= rangeObject.endLineNumber)) {
                    if (rangeObject.startLineNumber < emphasisLine) {
                        const beforeRange = new Range(range.startLineNumber, 1, emphasisLine - 1, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                    }
                    const emphasisRange = new Range(emphasisLine, 1, emphasisLine, 1);
                    if (!this._lineHasThread(editor, emphasisRange)) {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, emphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                    }
                    if (emphasisLine < rangeObject.endLineNumber) {
                        const afterRange = new Range(emphasisLine + 1, 1, range.endLineNumber, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                    }
                }
                else {
                    commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.owner, info.extensionId, info.label, range, this.decorationOptions, info.commentingRanges));
                }
            });
        }
        editor.changeDecorations((accessor) => {
            this.decorationIds = accessor.deltaDecorations(this.decorationIds, commentingRangeDecorations);
            commentingRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
        });
        const rangesDifference = this.commentingRangeDecorations.length - commentingRangeDecorations.length;
        this.commentingRangeDecorations = commentingRangeDecorations;
        if (rangesDifference) {
            this._onDidChangeDecorationsCount.fire(this.commentingRangeDecorations.length);
        }
    }
    getMatchedCommentAction(commentRange) {
        // keys is ownerId
        const foundHoverActions = new Map();
        for (const decoration of this.commentingRangeDecorations) {
            const range = decoration.getActiveRange();
            if (range && ((range.startLineNumber <= commentRange.startLineNumber) || (commentRange.endLineNumber <= range.endLineNumber))) {
                // We can have several commenting ranges that match from the same owner because of how
                // the line hover and selection decoration is done.
                // The ranges must be merged so that we can see if the new commentRange fits within them.
                const action = decoration.getCommentAction();
                const alreadyFoundInfo = foundHoverActions.get(action.ownerId);
                if (alreadyFoundInfo?.action.commentingRangesInfo === action.commentingRangesInfo) {
                    // Merge ranges.
                    const newRange = new Range(range.startLineNumber < alreadyFoundInfo.range.startLineNumber ? range.startLineNumber : alreadyFoundInfo.range.startLineNumber, range.startColumn < alreadyFoundInfo.range.startColumn ? range.startColumn : alreadyFoundInfo.range.startColumn, range.endLineNumber > alreadyFoundInfo.range.endLineNumber ? range.endLineNumber : alreadyFoundInfo.range.endLineNumber, range.endColumn > alreadyFoundInfo.range.endColumn ? range.endColumn : alreadyFoundInfo.range.endColumn);
                    foundHoverActions.set(action.ownerId, { range: newRange, action });
                }
                else {
                    foundHoverActions.set(action.ownerId, { range, action });
                }
            }
        }
        return Array.from(foundHoverActions.values()).filter(action => {
            return (action.range.startLineNumber <= commentRange.startLineNumber) && (commentRange.endLineNumber <= action.range.endLineNumber);
        }).map(actions => actions.action);
    }
    dispose() {
        this.commentingRangeDecorations = [];
    }
}
const ActiveCursorHasCommentingRange = new RawContextKey('activeCursorHasCommentingRange', false, {
    description: nls.localize('hasCommentingRange', "Whether the position at the active cursor has a commenting range"),
    type: 'boolean'
});
const WorkspaceHasCommenting = new RawContextKey('workspaceHasCommenting', false, {
    description: nls.localize('hasCommentingProvider', "Whether the open workspace has either comments or commenting ranges."),
    type: 'boolean'
});
let CommentController = class CommentController {
    commentService;
    instantiationService;
    codeEditorService;
    contextMenuService;
    quickInputService;
    viewsService;
    configurationService;
    contextKeyService;
    editorService;
    globalToDispose = new DisposableStore();
    localToDispose = new DisposableStore();
    editor;
    _commentWidgets;
    _commentInfos;
    _commentingRangeDecorator;
    _commentThreadRangeDecorator;
    mouseDownInfo = null;
    _commentingRangeSpaceReserved = false;
    _computePromise;
    _addInProgress;
    _emptyThreadsToAddQueue = [];
    _computeCommentingRangePromise;
    _computeCommentingRangeScheduler;
    _pendingCommentCache;
    _editorDisposables = [];
    _activeCursorHasCommentingRange;
    _workspaceHasCommenting;
    constructor(editor, commentService, instantiationService, codeEditorService, contextMenuService, quickInputService, viewsService, configurationService, contextKeyService, editorService) {
        this.commentService = commentService;
        this.instantiationService = instantiationService;
        this.codeEditorService = codeEditorService;
        this.contextMenuService = contextMenuService;
        this.quickInputService = quickInputService;
        this.viewsService = viewsService;
        this.configurationService = configurationService;
        this.contextKeyService = contextKeyService;
        this.editorService = editorService;
        this._commentInfos = [];
        this._commentWidgets = [];
        this._pendingCommentCache = {};
        this._computePromise = null;
        this._activeCursorHasCommentingRange = ActiveCursorHasCommentingRange.bindTo(contextKeyService);
        this._workspaceHasCommenting = WorkspaceHasCommenting.bindTo(contextKeyService);
        if (editor instanceof EmbeddedCodeEditorWidget) {
            return;
        }
        this.editor = editor;
        this._commentingRangeDecorator = new CommentingRangeDecorator();
        this.globalToDispose.add(this._commentingRangeDecorator.onDidChangeDecorationsCount(count => {
            if (count === 0) {
                this.clearEditorListeners();
            }
            else if (this._editorDisposables.length === 0) {
                this.registerEditorListeners();
            }
        }));
        this.globalToDispose.add(this._commentThreadRangeDecorator = new CommentThreadRangeDecorator(this.commentService));
        this.globalToDispose.add(this.commentService.onDidDeleteDataProvider(ownerId => {
            delete this._pendingCommentCache[ownerId];
            this.beginCompute();
        }));
        this.globalToDispose.add(this.commentService.onDidSetDataProvider(_ => this.beginCompute()));
        this.globalToDispose.add(this.commentService.onDidUpdateCommentingRanges(_ => this.beginCompute()));
        this.globalToDispose.add(this.commentService.onDidSetResourceCommentInfos(e => {
            const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
            if (editorURI && editorURI.toString() === e.resource.toString()) {
                this.setComments(e.commentInfos.filter(commentInfo => commentInfo !== null));
            }
        }));
        this.globalToDispose.add(this.commentService.onDidSetAllCommentThreads(e => {
            if (e.commentThreads.length > 0) {
                this._workspaceHasCommenting.set(true);
            }
        }));
        this.globalToDispose.add(this.commentService.onDidChangeCommentingEnabled(e => {
            if (e) {
                this.registerEditorListeners();
                this.beginCompute();
            }
            else {
                this.clearEditorListeners();
                this._commentingRangeDecorator.update(this.editor, []);
                this._commentThreadRangeDecorator.update(this.editor, []);
                dispose(this._commentWidgets);
                this._commentWidgets = [];
            }
        }));
        this.globalToDispose.add(this.editor.onDidChangeModel(e => this.onModelChanged(e)));
        this.codeEditorService.registerDecorationType('comment-controller', COMMENTEDITOR_DECORATION_KEY, {});
        this.beginCompute();
    }
    registerEditorListeners() {
        this._editorDisposables = [];
        if (!this.editor) {
            return;
        }
        this._editorDisposables.push(this.editor.onMouseMove(e => this.onEditorMouseMove(e)));
        this._editorDisposables.push(this.editor.onDidChangeCursorPosition(e => this.onEditorChangeCursorPosition(e.position)));
        this._editorDisposables.push(this.editor.onDidFocusEditorWidget(() => this.onEditorChangeCursorPosition(withUndefinedAsNull(this.editor?.getPosition()))));
        this._editorDisposables.push(this.editor.onDidChangeCursorSelection(e => this.onEditorChangeCursorSelection(e)));
        this._editorDisposables.push(this.editor.onDidBlurEditorWidget(() => this.onEditorChangeCursorSelection()));
    }
    clearEditorListeners() {
        dispose(this._editorDisposables);
        this._editorDisposables = [];
    }
    onEditorMouseMove(e) {
        const position = e.target.position?.lineNumber;
        if (e.event.leftButton.valueOf() && position && this.mouseDownInfo) {
            this._commentingRangeDecorator.updateSelection(position, new Range(this.mouseDownInfo.lineNumber, 1, position, 1));
        }
        else {
            this._commentingRangeDecorator.updateHover(position);
        }
    }
    onEditorChangeCursorSelection(e) {
        const position = this.editor?.getPosition()?.lineNumber;
        if (position) {
            this._commentingRangeDecorator.updateSelection(position, e?.selection);
        }
    }
    onEditorChangeCursorPosition(e) {
        const decorations = e ? this.editor?.getDecorationsInRange(Range.fromPositions(e, { column: -1, lineNumber: e.lineNumber })) : undefined;
        let hasCommentingRange = false;
        if (decorations) {
            for (const decoration of decorations) {
                if (decoration.options.description === CommentGlyphWidget.description) {
                    // We don't allow multiple comments on the same line.
                    hasCommentingRange = false;
                    break;
                }
                else if (decoration.options.description === CommentingRangeDecorator.description) {
                    hasCommentingRange = true;
                }
            }
        }
        this._activeCursorHasCommentingRange.set(hasCommentingRange);
    }
    isEditorInlineOriginal(editorURI, activeEditor) {
        if (editorURI && activeEditor instanceof DiffEditorInput && !this.configurationService.getValue('diffEditor.renderSideBySide')) {
            return activeEditor.original.resource?.toString() === editorURI.toString();
        }
        return false;
    }
    beginCompute() {
        this._computePromise = createCancelablePromise(token => {
            const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
            if (editorURI) {
                return this.commentService.getDocumentComments(editorURI);
            }
            return Promise.resolve([]);
        });
        return this._computePromise.then(commentInfos => {
            this.setComments(coalesce(commentInfos));
            this._computePromise = null;
        }, error => console.log(error));
    }
    beginComputeCommentingRanges() {
        if (this._computeCommentingRangeScheduler) {
            if (this._computeCommentingRangePromise) {
                this._computeCommentingRangePromise.cancel();
                this._computeCommentingRangePromise = null;
            }
            this._computeCommentingRangeScheduler.trigger(() => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (editorURI) {
                    return this.commentService.getDocumentComments(editorURI);
                }
                return Promise.resolve([]);
            }).then(commentInfos => {
                if (this.commentService.isCommentingEnabled) {
                    const meaningfulCommentInfos = coalesce(commentInfos);
                    this._commentingRangeDecorator.update(this.editor, meaningfulCommentInfos, this.editor?.getPosition()?.lineNumber, withNullAsUndefined(this.editor?.getSelection()));
                }
            }, (err) => {
                onUnexpectedError(err);
                return null;
            });
        }
    }
    static get(editor) {
        return editor.getContribution(ID);
    }
    revealCommentThread(threadId, commentUniqueId, fetchOnceIfNotExist) {
        const commentThreadWidget = this._commentWidgets.filter(widget => widget.commentThread.threadId === threadId);
        if (commentThreadWidget.length === 1) {
            commentThreadWidget[0].reveal(commentUniqueId);
        }
        else if (fetchOnceIfNotExist) {
            if (this._computePromise) {
                this._computePromise.then(_ => {
                    this.revealCommentThread(threadId, commentUniqueId, false);
                });
            }
            else {
                this.beginCompute().then(_ => {
                    this.revealCommentThread(threadId, commentUniqueId, false);
                });
            }
        }
    }
    collapseAll() {
        for (const widget of this._commentWidgets) {
            widget.collapse();
        }
    }
    expandAll() {
        for (const widget of this._commentWidgets) {
            widget.expand();
        }
    }
    nextCommentThread() {
        this._findNearestCommentThread();
    }
    _findNearestCommentThread(reverse) {
        if (!this._commentWidgets.length || !this.editor?.hasModel()) {
            return;
        }
        const after = this.editor.getSelection().getEndPosition();
        const sortedWidgets = this._commentWidgets.sort((a, b) => {
            if (reverse) {
                const temp = a;
                a = b;
                b = temp;
            }
            if (a.commentThread.range.startLineNumber < b.commentThread.range.startLineNumber) {
                return -1;
            }
            if (a.commentThread.range.startLineNumber > b.commentThread.range.startLineNumber) {
                return 1;
            }
            if (a.commentThread.range.startColumn < b.commentThread.range.startColumn) {
                return -1;
            }
            if (a.commentThread.range.startColumn > b.commentThread.range.startColumn) {
                return 1;
            }
            return 0;
        });
        const idx = findFirstInSorted(sortedWidgets, widget => {
            const lineValueOne = reverse ? after.lineNumber : widget.commentThread.range.startLineNumber;
            const lineValueTwo = reverse ? widget.commentThread.range.startLineNumber : after.lineNumber;
            const columnValueOne = reverse ? after.column : widget.commentThread.range.startColumn;
            const columnValueTwo = reverse ? widget.commentThread.range.startColumn : after.column;
            if (lineValueOne > lineValueTwo) {
                return true;
            }
            if (lineValueOne < lineValueTwo) {
                return false;
            }
            if (columnValueOne > columnValueTwo) {
                return true;
            }
            return false;
        });
        let nextWidget;
        if (idx === this._commentWidgets.length) {
            nextWidget = this._commentWidgets[0];
        }
        else {
            nextWidget = sortedWidgets[idx];
        }
        this.editor.setSelection(nextWidget.commentThread.range);
        nextWidget.reveal(undefined, true);
    }
    previousCommentThread() {
        this._findNearestCommentThread(true);
    }
    dispose() {
        this.globalToDispose.dispose();
        this.localToDispose.dispose();
        dispose(this._editorDisposables);
        dispose(this._commentWidgets);
        this.editor = null; // Strict null override - nulling out in dispose
    }
    onModelChanged(e) {
        this.localToDispose.clear();
        this.removeCommentWidgetsAndStoreCache();
        if (!this.editor) {
            return;
        }
        this.localToDispose.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
        this.localToDispose.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
        if (this._editorDisposables.length) {
            this.clearEditorListeners();
            this.registerEditorListeners();
        }
        this._computeCommentingRangeScheduler = new Delayer(200);
        this.localToDispose.add({
            dispose: () => {
                this._computeCommentingRangeScheduler?.cancel();
                this._computeCommentingRangeScheduler = null;
            }
        });
        this.localToDispose.add(this.editor.onDidChangeModelContent(async () => {
            this.beginComputeCommentingRanges();
        }));
        this.localToDispose.add(this.commentService.onDidUpdateCommentThreads(async (e) => {
            const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
            if (!editorURI || !this.commentService.isCommentingEnabled) {
                return;
            }
            if (this._computePromise) {
                await this._computePromise;
            }
            const commentInfo = this._commentInfos.filter(info => info.owner === e.owner);
            if (!commentInfo || !commentInfo.length) {
                return;
            }
            const added = e.added.filter(thread => thread.resource && thread.resource.toString() === editorURI.toString());
            const removed = e.removed.filter(thread => thread.resource && thread.resource.toString() === editorURI.toString());
            const changed = e.changed.filter(thread => thread.resource && thread.resource.toString() === editorURI.toString());
            removed.forEach(thread => {
                const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== '');
                if (matchedZones.length) {
                    const matchedZone = matchedZones[0];
                    const index = this._commentWidgets.indexOf(matchedZone);
                    this._commentWidgets.splice(index, 1);
                    matchedZone.dispose();
                }
                const infosThreads = this._commentInfos.filter(info => info.owner === e.owner)[0].threads;
                for (let i = 0; i < infosThreads.length; i++) {
                    if (infosThreads[i] === thread) {
                        infosThreads.splice(i, 1);
                        i--;
                    }
                }
            });
            changed.forEach(thread => {
                const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                if (matchedZones.length) {
                    const matchedZone = matchedZones[0];
                    matchedZone.update(thread);
                    this.openCommentsView(thread);
                }
            });
            added.forEach(thread => {
                const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.threadId === thread.threadId);
                if (matchedZones.length) {
                    return;
                }
                const matchedNewCommentThreadZones = this._commentWidgets.filter(zoneWidget => zoneWidget.owner === e.owner && zoneWidget.commentThread.commentThreadHandle === -1 && Range.equalsRange(zoneWidget.commentThread.range, thread.range));
                if (matchedNewCommentThreadZones.length) {
                    matchedNewCommentThreadZones[0].update(thread);
                    return;
                }
                const pendingCommentText = this._pendingCommentCache[e.owner] && this._pendingCommentCache[e.owner][thread.threadId];
                this.displayCommentThread(e.owner, thread, pendingCommentText);
                this._commentInfos.filter(info => info.owner === e.owner)[0].threads.push(thread);
                this.tryUpdateReservedSpace();
            });
            this._commentThreadRangeDecorator.update(this.editor, commentInfo);
        }));
        this.beginCompute();
    }
    async openCommentsView(thread) {
        if (thread.comments && (thread.comments.length > 0)) {
            if (this.configurationService.getValue(COMMENTS_SECTION).openView === 'file') {
                return this.viewsService.openView(COMMENTS_VIEW_ID);
            }
            else if (this.configurationService.getValue(COMMENTS_SECTION).openView === 'firstFile') {
                const hasShownView = this.viewsService.getViewWithId(COMMENTS_VIEW_ID)?.hasRendered;
                if (!hasShownView) {
                    return this.viewsService.openView(COMMENTS_VIEW_ID);
                }
            }
        }
        return undefined;
    }
    displayCommentThread(owner, thread, pendingComment) {
        if (!this.editor) {
            return;
        }
        const activeEditor = this.editorService.activeEditor;
        if (this.isEditorInlineOriginal(this.editor.getModel()?.uri, activeEditor)) {
            return;
        }
        const zoneWidget = this.instantiationService.createInstance(ReviewZoneWidget, this.editor, owner, thread, pendingComment);
        zoneWidget.display(thread.range.endLineNumber);
        this._commentWidgets.push(zoneWidget);
        this.openCommentsView(thread);
    }
    onEditorMouseDown(e) {
        this.mouseDownInfo = parseMouseDownInfoFromEvent(e);
    }
    onEditorMouseUp(e) {
        const matchedLineNumber = isMouseUpEventDragFromMouseDown(this.mouseDownInfo, e);
        this.mouseDownInfo = null;
        if (!this.editor || matchedLineNumber === null || !e.target.element) {
            return;
        }
        const mouseUpIsOnDecorator = (e.target.element.className.indexOf('comment-range-glyph') >= 0);
        const lineNumber = e.target.position.lineNumber;
        let range;
        let selection;
        // Check for drag along gutter decoration
        if ((matchedLineNumber !== lineNumber)) {
            if (matchedLineNumber > lineNumber) {
                selection = new Range(matchedLineNumber, this.editor.getModel().getLineLength(matchedLineNumber) + 1, lineNumber, 1);
            }
            else {
                selection = new Range(matchedLineNumber, 1, lineNumber, this.editor.getModel().getLineLength(lineNumber) + 1);
            }
        }
        else if (mouseUpIsOnDecorator) {
            selection = this.editor.getSelection();
        }
        // Check for selection at line number.
        if (selection && (selection.startLineNumber <= lineNumber) && (lineNumber <= selection.endLineNumber)) {
            range = selection;
            this.editor.setSelection(new Range(selection.endLineNumber, 1, selection.endLineNumber, 1));
        }
        else if (mouseUpIsOnDecorator) {
            range = new Range(lineNumber, 1, lineNumber, 1);
        }
        if (range) {
            this.addOrToggleCommentAtLine(range, e);
        }
    }
    async addOrToggleCommentAtLine(commentRange, e) {
        // If an add is already in progress, queue the next add and process it after the current one finishes to
        // prevent empty comment threads from being added to the same line.
        if (!this._addInProgress) {
            this._addInProgress = true;
            // The widget's position is undefined until the widget has been displayed, so rely on the glyph position instead
            const existingCommentsAtLine = this._commentWidgets.filter(widget => widget.getGlyphPosition() === commentRange.endLineNumber);
            if (existingCommentsAtLine.length) {
                existingCommentsAtLine.forEach(widget => widget.toggleExpand(commentRange.endLineNumber));
                this.processNextThreadToAdd();
                return;
            }
            else {
                this.addCommentAtLine(commentRange, e);
            }
        }
        else {
            this._emptyThreadsToAddQueue.push([commentRange, e]);
        }
    }
    processNextThreadToAdd() {
        this._addInProgress = false;
        const info = this._emptyThreadsToAddQueue.shift();
        if (info) {
            this.addOrToggleCommentAtLine(info[0], info[1]);
        }
    }
    addCommentAtLine(range, e) {
        const newCommentInfos = this._commentingRangeDecorator.getMatchedCommentAction(range);
        if (!newCommentInfos.length || !this.editor?.hasModel()) {
            return Promise.resolve();
        }
        if (newCommentInfos.length > 1) {
            if (e) {
                const anchor = { x: e.event.posx, y: e.event.posy };
                this.contextMenuService.showContextMenu({
                    getAnchor: () => anchor,
                    getActions: () => this.getContextMenuActions(newCommentInfos, range),
                    getActionsContext: () => newCommentInfos.length ? newCommentInfos[0] : undefined,
                    onHide: () => { this._addInProgress = false; }
                });
                return Promise.resolve();
            }
            else {
                const picks = this.getCommentProvidersQuickPicks(newCommentInfos);
                return this.quickInputService.pick(picks, { placeHolder: nls.localize('pickCommentService', "Select Comment Provider"), matchOnDescription: true }).then(pick => {
                    if (!pick) {
                        return;
                    }
                    const commentInfos = newCommentInfos.filter(info => info.ownerId === pick.id);
                    if (commentInfos.length) {
                        const { ownerId } = commentInfos[0];
                        this.addCommentAtLine2(range, ownerId);
                    }
                }).then(() => {
                    this._addInProgress = false;
                });
            }
        }
        else {
            const { ownerId } = newCommentInfos[0];
            this.addCommentAtLine2(range, ownerId);
        }
        return Promise.resolve();
    }
    getCommentProvidersQuickPicks(commentInfos) {
        const picks = commentInfos.map((commentInfo) => {
            const { ownerId, extensionId, label } = commentInfo;
            return {
                label: label || extensionId,
                id: ownerId
            };
        });
        return picks;
    }
    getContextMenuActions(commentInfos, commentRange) {
        const actions = [];
        commentInfos.forEach(commentInfo => {
            const { ownerId, extensionId, label } = commentInfo;
            actions.push(new Action('addCommentThread', `${label || extensionId}`, undefined, true, () => {
                this.addCommentAtLine2(commentRange, ownerId);
                return Promise.resolve();
            }));
        });
        return actions;
    }
    addCommentAtLine2(range, ownerId) {
        if (!this.editor) {
            return;
        }
        this.commentService.createCommentThreadTemplate(ownerId, this.editor.getModel().uri, range);
        this.processNextThreadToAdd();
        return;
    }
    tryUpdateReservedSpace() {
        if (!this.editor) {
            return;
        }
        let lineDecorationsWidth = this.editor.getLayoutInfo().decorationsWidth;
        const hasCommentsOrRanges = this._commentInfos.some(info => {
            const hasRanges = Boolean(info.commentingRanges && (Array.isArray(info.commentingRanges) ? info.commentingRanges : info.commentingRanges.ranges).length);
            return hasRanges || (info.threads.length > 0);
        });
        if (hasCommentsOrRanges) {
            this._workspaceHasCommenting.set(true);
            if (!this._commentingRangeSpaceReserved) {
                this._commentingRangeSpaceReserved = true;
                let extraEditorClassName = [];
                const configuredExtraClassName = this.editor.getRawOptions().extraEditorClassName;
                if (configuredExtraClassName) {
                    extraEditorClassName = configuredExtraClassName.split(' ');
                }
                const options = this.editor.getOptions();
                if (options.get(38 /* EditorOption.folding */) && options.get(100 /* EditorOption.showFoldingControls */) !== 'never') {
                    lineDecorationsWidth -= 27;
                }
                lineDecorationsWidth += 24;
                extraEditorClassName.push('inline-comment');
                this.editor.updateOptions({
                    extraEditorClassName: extraEditorClassName.join(' '),
                    lineDecorationsWidth: lineDecorationsWidth
                });
                // we only update the lineDecorationsWidth property but keep the width of the whole editor.
                const originalLayoutInfo = this.editor.getLayoutInfo();
                this.editor.layout({
                    width: originalLayoutInfo.width,
                    height: originalLayoutInfo.height
                });
            }
        }
    }
    setComments(commentInfos) {
        if (!this.editor || !this.commentService.isCommentingEnabled) {
            return;
        }
        this._commentInfos = commentInfos;
        this.tryUpdateReservedSpace();
        // create viewzones
        this.removeCommentWidgetsAndStoreCache();
        this._commentInfos.forEach(info => {
            if (info.threads.length > 0) {
                this._workspaceHasCommenting.set(true);
            }
            const providerCacheStore = this._pendingCommentCache[info.owner];
            info.threads = info.threads.filter(thread => !thread.isDisposed);
            info.threads.forEach(thread => {
                let pendingComment = null;
                if (providerCacheStore) {
                    pendingComment = providerCacheStore[thread.threadId];
                }
                if (pendingComment) {
                    thread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
                }
                this.displayCommentThread(info.owner, thread, pendingComment);
            });
        });
        this._commentingRangeDecorator.update(this.editor, this._commentInfos);
        this._commentThreadRangeDecorator.update(this.editor, this._commentInfos);
    }
    closeWidget() {
        this._commentWidgets?.forEach(widget => widget.hide());
        if (this.editor) {
            this.editor.focus();
            this.editor.revealRangeInCenter(this.editor.getSelection());
        }
    }
    removeCommentWidgetsAndStoreCache() {
        if (this._commentWidgets) {
            this._commentWidgets.forEach(zone => {
                const pendingComment = zone.getPendingComment();
                const providerCacheStore = this._pendingCommentCache[zone.owner];
                let lastCommentBody;
                if (zone.commentThread.comments && zone.commentThread.comments.length) {
                    const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                    if (typeof lastComment.body === 'string') {
                        lastCommentBody = lastComment.body;
                    }
                    else {
                        lastCommentBody = lastComment.body.value;
                    }
                }
                if (pendingComment && (pendingComment !== lastCommentBody)) {
                    if (!providerCacheStore) {
                        this._pendingCommentCache[zone.owner] = {};
                    }
                    this._pendingCommentCache[zone.owner][zone.commentThread.threadId] = pendingComment;
                }
                else {
                    if (providerCacheStore) {
                        delete providerCacheStore[zone.commentThread.threadId];
                    }
                }
                zone.dispose();
            });
        }
        this._commentWidgets = [];
    }
};
CommentController = __decorate([
    __param(1, ICommentService),
    __param(2, IInstantiationService),
    __param(3, ICodeEditorService),
    __param(4, IContextMenuService),
    __param(5, IQuickInputService),
    __param(6, IViewsService),
    __param(7, IConfigurationService),
    __param(8, IContextKeyService),
    __param(9, IEditorService)
], CommentController);
export { CommentController };
export class NextCommentThreadAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.nextCommentThreadAction',
            label: nls.localize('nextCommentThreadAction', "Go to Next Comment Thread"),
            alias: 'Go to Next Comment Thread',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.focus,
                primary: 512 /* KeyMod.Alt */ | 67 /* KeyCode.F9 */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor, editor) {
        const controller = CommentController.get(editor);
        controller?.nextCommentThread();
    }
}
export class PreviousCommentThreadAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.previousCommentThreadAction',
            label: nls.localize('previousCommentThreadAction', "Go to Previous Comment Thread"),
            alias: 'Go to Previous Comment Thread',
            precondition: undefined,
            kbOpts: {
                kbExpr: EditorContextKeys.focus,
                primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 67 /* KeyCode.F9 */,
                weight: 100 /* KeybindingWeight.EditorContrib */
            }
        });
    }
    run(accessor, editor) {
        const controller = CommentController.get(editor);
        controller?.previousCommentThread();
    }
}
registerEditorContribution(ID, CommentController);
registerEditorAction(NextCommentThreadAction);
registerEditorAction(PreviousCommentThreadAction);
const TOGGLE_COMMENTING_COMMAND = 'workbench.action.toggleCommenting';
CommandsRegistry.registerCommand({
    id: TOGGLE_COMMENTING_COMMAND,
    handler: (accessor) => {
        const commentService = accessor.get(ICommentService);
        const enable = commentService.isCommentingEnabled;
        commentService.enableCommenting(!enable);
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: TOGGLE_COMMENTING_COMMAND,
        title: nls.localize('comments.toggleCommenting', "Toggle Editor Commenting"),
        category: 'Comments',
    },
    when: WorkspaceHasCommenting
});
const ADD_COMMENT_COMMAND = 'workbench.action.addComment';
CommandsRegistry.registerCommand({
    id: ADD_COMMENT_COMMAND,
    handler: (accessor) => {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return Promise.resolve();
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return Promise.resolve();
        }
        const position = activeEditor.getSelection();
        return controller.addOrToggleCommentAtLine(position, undefined);
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: ADD_COMMENT_COMMAND,
        title: nls.localize('comments.addCommand', "Add Comment on Current Selection"),
        category: 'Comments'
    },
    when: ActiveCursorHasCommentingRange
});
const COLLAPSE_ALL_COMMENT_COMMAND = 'workbench.action.collapseAllComments';
CommandsRegistry.registerCommand({
    id: COLLAPSE_ALL_COMMENT_COMMAND,
    handler: (accessor) => {
        return getActiveController(accessor)?.collapseAll();
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: COLLAPSE_ALL_COMMENT_COMMAND,
        title: nls.localize('comments.collapseAll', "Collapse All Comments"),
        category: 'Comments'
    },
    when: WorkspaceHasCommenting
});
const EXPAND_ALL_COMMENT_COMMAND = 'workbench.action.expandAllComments';
CommandsRegistry.registerCommand({
    id: EXPAND_ALL_COMMENT_COMMAND,
    handler: (accessor) => {
        return getActiveController(accessor)?.expandAll();
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: EXPAND_ALL_COMMENT_COMMAND,
        title: nls.localize('comments.expandAll', "Expand All Comments"),
        category: 'Comments'
    },
    when: WorkspaceHasCommenting
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.submitComment',
    weight: 100 /* KeybindingWeight.EditorContrib */,
    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
    when: ctxCommentEditorFocused,
    handler: (accessor, args) => {
        const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (activeCodeEditor instanceof SimpleCommentEditor) {
            activeCodeEditor.getParentThread().submitComment();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: 'workbench.action.hideComment',
    weight: 100 /* KeybindingWeight.EditorContrib */,
    primary: 9 /* KeyCode.Escape */,
    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
    when: ctxCommentEditorFocused,
    handler: (accessor, args) => {
        const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (activeCodeEditor instanceof SimpleCommentEditor) {
            activeCodeEditor.getParentThread().collapse();
        }
    }
});
export function getActiveEditor(accessor) {
    let activeTextEditorControl = accessor.get(IEditorService).activeTextEditorControl;
    if (isDiffEditor(activeTextEditorControl)) {
        if (activeTextEditorControl.getOriginalEditor().hasTextFocus()) {
            activeTextEditorControl = activeTextEditorControl.getOriginalEditor();
        }
        else {
            activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
        }
    }
    if (!isCodeEditor(activeTextEditorControl) || !activeTextEditorControl.hasModel()) {
        return null;
    }
    return activeTextEditorControl;
}
function getActiveController(accessor) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
        return undefined;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
        return undefined;
    }
    return controller;
}
registerThemingParticipant((theme, collector) => {
    const peekViewBackground = theme.getColor(peekViewResultsBackground);
    if (peekViewBackground) {
        collector.addRule(`.monaco-editor .review-widget,` +
            `.monaco-editor .review-widget {` +
            `	background-color: ${peekViewBackground};` +
            `}`);
    }
    const monacoEditorBackground = theme.getColor(peekViewTitleBackground);
    if (monacoEditorBackground) {
        collector.addRule(`.review-widget .body .comment-form .review-thread-reply-button {` +
            `	background-color: ${monacoEditorBackground}` +
            `}`);
    }
    const monacoEditorForeground = theme.getColor(editorForeground);
    if (monacoEditorForeground) {
        collector.addRule(`.review-widget .body .monaco-editor {` +
            `	color: ${monacoEditorForeground}` +
            `}` +
            `.review-widget .body .comment-form .review-thread-reply-button {` +
            `	color: ${monacoEditorForeground};` +
            `	font-size: inherit` +
            `}`);
    }
    const selectionBackground = theme.getColor(peekViewResultsSelectionBackground);
    if (selectionBackground) {
        collector.addRule(`@keyframes monaco-review-widget-focus {` +
            `	0% { background: ${selectionBackground}; }` +
            `	100% { background: transparent; }` +
            `}` +
            `.review-widget .body .review-comment.focus {` +
            `	animation: monaco-review-widget-focus 3s ease 0s;` +
            `}`);
    }
    const commentingRangeForeground = theme.getColor(overviewRulerCommentingRangeForeground);
    if (commentingRangeForeground) {
        collector.addRule(`
			.monaco-editor .comment-diff-added,
			.monaco-editor .comment-range-glyph.multiline-add {
				border-left-color: ${commentingRangeForeground};
			}
			.monaco-editor .comment-diff-added:before,
			.monaco-editor .comment-range-glyph.line-hover:before {
				background: ${commentingRangeForeground};
			}
			.monaco-editor .comment-thread:before {
				background: ${commentingRangeForeground};
			}
		`);
    }
    const statusBarItemHoverBackground = theme.getColor(STATUS_BAR_ITEM_HOVER_BACKGROUND);
    if (statusBarItemHoverBackground) {
        collector.addRule(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label.active:hover { background-color: ${statusBarItemHoverBackground};}`);
    }
    const statusBarItemActiveBackground = theme.getColor(STATUS_BAR_ITEM_ACTIVE_BACKGROUND);
    if (statusBarItemActiveBackground) {
        collector.addRule(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label:active { background-color: ${statusBarItemActiveBackground}; border: 1px solid transparent;}`);
    }
    const commentThreadRangeBackgroundColor = theme.getColor(commentThreadRangeBackground);
    if (commentThreadRangeBackgroundColor) {
        collector.addRule(`.monaco-editor .comment-thread-range { background-color: ${commentThreadRangeBackgroundColor};}`);
    }
    const commentThreadRangeBorderColor = theme.getColor(commentThreadRangeBorder);
    if (commentThreadRangeBorderColor) {
        collector.addRule(`.monaco-editor .comment-thread-range {
		border-color: ${commentThreadRangeBorderColor};
		border-width: 1px;
		border-style: solid;
		box-sizing: border-box; }`);
    }
    const commentThreadRangeActiveBackgroundColor = theme.getColor(commentThreadRangeActiveBackground);
    if (commentThreadRangeActiveBackgroundColor) {
        collector.addRule(`.monaco-editor .comment-thread-range-current { background-color: ${commentThreadRangeActiveBackgroundColor};}`);
    }
    const commentThreadRangeActiveBorderColor = theme.getColor(commentThreadRangeActiveBorder);
    if (commentThreadRangeActiveBorderColor) {
        collector.addRule(`.monaco-editor .comment-thread-range-current {
		border-color: ${commentThreadRangeActiveBorderColor};
		border-width: 1px;
		border-style: solid;
		box-sizing: border-box; }`);
    }
});
