import { IActionViewItemOptions } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { IHoverDelegate } from 'vs/base/browser/ui/iconLabel/iconHoverDelegate';
import { IAction, IActionRunner, IRunEvent } from 'vs/base/common/actions';
import { KeyCode } from 'vs/base/common/keyCodes';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import 'vs/css!./actionbar';
export interface IActionViewItem extends IDisposable {
    action: IAction;
    actionRunner: IActionRunner;
    setActionContext(context: unknown): void;
    render(element: HTMLElement): void;
    isEnabled(): boolean;
    focus(fromRight?: boolean): void;
    blur(): void;
}
export interface IActionViewItemProvider {
    (action: IAction): IActionViewItem | undefined;
}
export declare const enum ActionsOrientation {
    HORIZONTAL = 0,
    VERTICAL = 1
}
export interface ActionTrigger {
    keys?: KeyCode[];
    keyDown: boolean;
}
export interface IActionBarOptions {
    readonly orientation?: ActionsOrientation;
    readonly context?: unknown;
    readonly actionViewItemProvider?: IActionViewItemProvider;
    readonly actionRunner?: IActionRunner;
    readonly ariaLabel?: string;
    readonly ariaRole?: string;
    readonly animated?: boolean;
    readonly triggerKeys?: ActionTrigger;
    readonly allowContextMenu?: boolean;
    readonly preventLoopNavigation?: boolean;
    readonly focusOnlyEnabledItems?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
}
export interface IActionOptions extends IActionViewItemOptions {
    index?: number;
}
export declare class ActionBar extends Disposable implements IActionRunner {
    private readonly options;
    private _actionRunner;
    private readonly _actionRunnerDisposables;
    private _context;
    private readonly _orientation;
    private readonly _triggerKeys;
    viewItems: IActionViewItem[];
    private readonly viewItemDisposables;
    private previouslyFocusedItem?;
    protected focusedItem?: number;
    private focusTracker;
    private triggerKeyDown;
    private focusable;
    domNode: HTMLElement;
    protected readonly actionsList: HTMLElement;
    private readonly _onDidBlur;
    readonly onDidBlur: import("vs/base/common/event").Event<void>;
    private readonly _onDidCancel;
    readonly onDidCancel: import("vs/base/common/event").Event<void>;
    private cancelHasListener;
    private readonly _onDidRun;
    readonly onDidRun: import("vs/base/common/event").Event<IRunEvent>;
    private readonly _onWillRun;
    readonly onWillRun: import("vs/base/common/event").Event<IRunEvent>;
    constructor(container: HTMLElement, options?: IActionBarOptions);
    private refreshRole;
    setAriaLabel(label: string): void;
    setFocusable(focusable: boolean): void;
    private isTriggerKeyEvent;
    private updateFocusedItem;
    get context(): unknown;
    set context(context: unknown);
    get actionRunner(): IActionRunner;
    set actionRunner(actionRunner: IActionRunner);
    getContainer(): HTMLElement;
    hasAction(action: IAction): boolean;
    getAction(indexOrElement: number | HTMLElement): IAction | undefined;
    push(arg: IAction | ReadonlyArray<IAction>, options?: IActionOptions): void;
    getWidth(index: number): number;
    getHeight(index: number): number;
    pull(index: number): void;
    clear(): void;
    length(): number;
    isEmpty(): boolean;
    focus(index?: number): void;
    focus(selectFirst?: boolean): void;
    private focusFirst;
    private focusLast;
    protected focusNext(forceLoop?: boolean): boolean;
    protected focusPrevious(forceLoop?: boolean): boolean;
    protected updateFocus(fromRight?: boolean, preventScroll?: boolean, forceFocus?: boolean): void;
    private doTrigger;
    run(action: IAction, context?: unknown): Promise<void>;
    dispose(): void;
}
export declare function prepareActions(actions: IAction[]): IAction[];
