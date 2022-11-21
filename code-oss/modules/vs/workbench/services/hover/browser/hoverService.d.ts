import 'vs/css!./media/hover';
import { IHoverService, IHoverOptions, IHoverWidget } from 'vs/workbench/services/hover/browser/hover';
import { IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
export declare class HoverService implements IHoverService {
    private readonly _instantiationService;
    private readonly _contextViewService;
    private readonly _keybindingService;
    readonly _serviceBrand: undefined;
    private _currentHoverOptions;
    private _currentHover;
    constructor(_instantiationService: IInstantiationService, _contextViewService: IContextViewService, contextMenuService: IContextMenuService, _keybindingService: IKeybindingService);
    showHover(options: IHoverOptions, focus?: boolean): IHoverWidget | undefined;
    hideHover(): void;
    private _intersectionChange;
    private _keyDown;
    private _keyUp;
}
