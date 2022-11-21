import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { IDiffEditor } from 'vs/editor/browser/editorBrowser';
import { ScrollType } from 'vs/editor/common/editorCommon';
export interface Options {
    followsCaret?: boolean;
    ignoreCharChanges?: boolean;
    alwaysRevealFirst?: boolean;
}
export interface IDiffNavigator {
    canNavigate(): boolean;
    next(): void;
    previous(): void;
    dispose(): void;
}
/**
 * Create a new diff navigator for the provided diff editor.
 */
export declare class DiffNavigator extends Disposable implements IDiffNavigator {
    private readonly _editor;
    private readonly _options;
    private readonly _onDidUpdate;
    readonly onDidUpdate: Event<this>;
    private disposed;
    private revealFirst;
    private nextIdx;
    private ranges;
    private ignoreSelectionChange;
    constructor(editor: IDiffEditor, options?: Options);
    private _init;
    private _onDiffUpdated;
    private _compute;
    private _initIdx;
    private _move;
    canNavigate(): boolean;
    next(scrollType?: ScrollType): void;
    previous(scrollType?: ScrollType): void;
    dispose(): void;
}
