import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IContextViewDelegate, IContextViewService } from './contextView';
export declare class ContextViewService extends Disposable implements IContextViewService {
    readonly layoutService: ILayoutService;
    readonly _serviceBrand: undefined;
    private currentViewDisposable;
    private contextView;
    private container;
    private shadowRoot;
    constructor(layoutService: ILayoutService);
    private setContainer;
    showContextView(delegate: IContextViewDelegate, container?: HTMLElement, shadowRoot?: boolean): IDisposable;
    getContextViewElement(): HTMLElement;
    layout(): void;
    hideContextView(data?: any): void;
}
