import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
export declare class SuggestWidgetStatus {
    private _menuService;
    private _contextKeyService;
    readonly element: HTMLElement;
    private readonly _leftActions;
    private readonly _rightActions;
    private readonly _menuDisposables;
    constructor(container: HTMLElement, instantiationService: IInstantiationService, _menuService: IMenuService, _contextKeyService: IContextKeyService);
    dispose(): void;
    show(): void;
    hide(): void;
}
