import { Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { ProgressBar } from 'vs/base/browser/ui/progressbar/progressbar';
import { IProgressRunner, IProgressIndicator } from 'vs/platform/progress/common/progress';
import { IEditorGroupView } from 'vs/workbench/browser/parts/editor/editor';
export declare class EditorProgressIndicator extends Disposable implements IProgressIndicator {
    private readonly progressBar;
    private readonly group;
    constructor(progressBar: ProgressBar, group: IEditorGroupView);
    private registerListeners;
    show(infinite: true, delay?: number): IProgressRunner;
    show(total: number, delay?: number): IProgressRunner;
    private doShow;
    showWhile(promise: Promise<unknown>, delay?: number): Promise<void>;
    private doShowWhile;
}
export interface IProgressScope {
    /**
     * Fired whenever `isActive` value changed.
     */
    readonly onDidChangeActive: Event<void>;
    /**
     * Whether progress should be active or not.
     */
    readonly isActive: boolean;
}
export declare class ScopedProgressIndicator extends Disposable implements IProgressIndicator {
    private readonly progressBar;
    private readonly scope;
    private progressState;
    constructor(progressBar: ProgressBar, scope: IProgressScope);
    registerListeners(): void;
    private onDidScopeActivate;
    private onDidScopeDeactivate;
    show(infinite: true, delay?: number): IProgressRunner;
    show(total: number, delay?: number): IProgressRunner;
    showWhile(promise: Promise<unknown>, delay?: number): Promise<void>;
    private doShowWhile;
}
export declare abstract class AbstractProgressScope extends Disposable implements IProgressScope {
    private scopeId;
    private _isActive;
    private readonly _onDidChangeActive;
    readonly onDidChangeActive: Event<void>;
    get isActive(): boolean;
    constructor(scopeId: string, _isActive: boolean);
    protected onScopeOpened(scopeId: string): void;
    protected onScopeClosed(scopeId: string): void;
}
