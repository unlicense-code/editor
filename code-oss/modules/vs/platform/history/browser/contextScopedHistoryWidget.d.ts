import { IHistoryNavigationWidget } from 'vs/base/browser/history';
import { IContextViewProvider } from 'vs/base/browser/ui/contextview/contextview';
import { FindInput, IFindInputOptions } from 'vs/base/browser/ui/findinput/findInput';
import { IReplaceInputOptions, ReplaceInput } from 'vs/base/browser/ui/findinput/replaceInput';
import { HistoryInputBox, IHistoryInputOptions } from 'vs/base/browser/ui/inputbox/inputBox';
import { IContextKey, IContextKeyService, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { IDisposable } from 'vs/base/common/lifecycle';
export declare const historyNavigationVisible: RawContextKey<boolean>;
export interface IHistoryNavigationContext extends IDisposable {
    historyNavigationForwardsEnablement: IContextKey<boolean>;
    historyNavigationBackwardsEnablement: IContextKey<boolean>;
}
export declare function registerAndCreateHistoryNavigationContext(scopedContextKeyService: IContextKeyService, widget: IHistoryNavigationWidget): IHistoryNavigationContext;
export declare class ContextScopedHistoryInputBox extends HistoryInputBox {
    constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options: IHistoryInputOptions, contextKeyService: IContextKeyService);
}
export declare class ContextScopedFindInput extends FindInput {
    constructor(container: HTMLElement | null, contextViewProvider: IContextViewProvider, options: IFindInputOptions, contextKeyService: IContextKeyService);
}
export declare class ContextScopedReplaceInput extends ReplaceInput {
    constructor(container: HTMLElement | null, contextViewProvider: IContextViewProvider | undefined, options: IReplaceInputOptions, contextKeyService: IContextKeyService, showReplaceOptions?: boolean);
}
