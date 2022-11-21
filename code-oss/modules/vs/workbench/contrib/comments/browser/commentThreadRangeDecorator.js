/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { CommentThreadCollapsibleState } from 'vs/editor/common/languages';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
class CommentThreadRangeDecoration {
    range;
    options;
    _decorationId;
    get id() {
        return this._decorationId;
    }
    set id(id) {
        this._decorationId = id;
    }
    constructor(range, options) {
        this.range = range;
        this.options = options;
    }
}
export class CommentThreadRangeDecorator extends Disposable {
    static description = 'comment-thread-range-decorator';
    decorationOptions;
    activeDecorationOptions;
    decorationIds = [];
    activeDecorationIds = [];
    editor;
    threadCollapseStateListeners = [];
    currentThreadCollapseStateListener;
    constructor(commentService) {
        super();
        const decorationOptions = {
            description: CommentThreadRangeDecorator.description,
            isWholeLine: false,
            zIndex: 20,
            className: 'comment-thread-range'
        };
        this.decorationOptions = ModelDecorationOptions.createDynamic(decorationOptions);
        const activeDecorationOptions = {
            description: CommentThreadRangeDecorator.description,
            isWholeLine: false,
            zIndex: 20,
            className: 'comment-thread-range-current'
        };
        this.activeDecorationOptions = ModelDecorationOptions.createDynamic(activeDecorationOptions);
        this._register(commentService.onDidChangeCurrentCommentThread(thread => {
            this.updateCurrent(thread);
        }));
        this._register(commentService.onDidUpdateCommentThreads(() => {
            this.updateCurrent(undefined);
        }));
    }
    updateCurrent(thread) {
        if (!this.editor) {
            return;
        }
        this.currentThreadCollapseStateListener?.dispose();
        const newDecoration = [];
        if (thread) {
            const range = thread.range;
            if (!((range.startLineNumber === range.endLineNumber) && (range.startColumn === range.endColumn))) {
                if (thread.collapsibleState === CommentThreadCollapsibleState.Expanded) {
                    this.currentThreadCollapseStateListener = thread.onDidChangeCollapsibleState(state => {
                        if (state === CommentThreadCollapsibleState.Collapsed) {
                            this.updateCurrent(undefined);
                        }
                    });
                    newDecoration.push(new CommentThreadRangeDecoration(range, this.activeDecorationOptions));
                }
            }
        }
        this.editor.changeDecorations((changeAccessor) => {
            this.activeDecorationIds = changeAccessor.deltaDecorations(this.activeDecorationIds, newDecoration);
            newDecoration.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
        });
    }
    update(editor, commentInfos) {
        const model = editor?.getModel();
        if (!editor || !model) {
            return;
        }
        dispose(this.threadCollapseStateListeners);
        this.editor = editor;
        const commentThreadRangeDecorations = [];
        for (const info of commentInfos) {
            info.threads.forEach(thread => {
                if (thread.isDisposed) {
                    return;
                }
                const range = thread.range;
                // We only want to show a range decoration when there's the range spans either multiple lines
                // or, when is spans multiple characters on the sample line
                if ((range.startLineNumber === range.endLineNumber) && (range.startColumn === range.endColumn)) {
                    return;
                }
                this.threadCollapseStateListeners.push(thread.onDidChangeCollapsibleState(() => {
                    this.update(editor, commentInfos);
                }));
                if (thread.collapsibleState === CommentThreadCollapsibleState.Collapsed) {
                    return;
                }
                commentThreadRangeDecorations.push(new CommentThreadRangeDecoration(range, this.decorationOptions));
            });
        }
        editor.changeDecorations((changeAccessor) => {
            this.decorationIds = changeAccessor.deltaDecorations(this.decorationIds, commentThreadRangeDecorations);
            commentThreadRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
        });
    }
    dispose() {
        dispose(this.threadCollapseStateListeners);
        this.currentThreadCollapseStateListener?.dispose();
        super.dispose();
    }
}
