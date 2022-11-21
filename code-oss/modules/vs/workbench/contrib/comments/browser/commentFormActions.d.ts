import { IAction } from 'vs/base/common/actions';
import { IDisposable } from 'vs/base/common/lifecycle';
import { IMenu } from 'vs/platform/actions/common/actions';
export declare class CommentFormActions implements IDisposable {
    private container;
    private actionHandler;
    private _buttonElements;
    private readonly _toDispose;
    private _actions;
    constructor(container: HTMLElement, actionHandler: (action: IAction) => void);
    setActions(menu: IMenu): void;
    triggerDefaultAction(): void;
    dispose(): void;
}
