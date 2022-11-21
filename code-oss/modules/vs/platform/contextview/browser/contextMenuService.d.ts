import { IContextMenuDelegate } from 'vs/base/browser/contextmenu';
import { Disposable } from 'vs/base/common/lifecycle';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IContextMenuHandlerOptions } from './contextMenuHandler';
import { IContextMenuMenuDelegate, IContextMenuService, IContextViewService } from './contextView';
export declare class ContextMenuService extends Disposable implements IContextMenuService {
    private readonly telemetryService;
    private readonly notificationService;
    private readonly contextViewService;
    private readonly keybindingService;
    private readonly themeService;
    private readonly menuService;
    private readonly contextKeyService;
    readonly _serviceBrand: undefined;
    private _contextMenuHandler;
    private get contextMenuHandler();
    private readonly _onDidShowContextMenu;
    readonly onDidShowContextMenu: import("vs/base/common/event").Event<void>;
    private readonly _onDidHideContextMenu;
    readonly onDidHideContextMenu: import("vs/base/common/event").Event<void>;
    constructor(telemetryService: ITelemetryService, notificationService: INotificationService, contextViewService: IContextViewService, keybindingService: IKeybindingService, themeService: IThemeService, menuService: IMenuService, contextKeyService: IContextKeyService);
    configure(options: IContextMenuHandlerOptions): void;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
export declare namespace ContextMenuMenuDelegate {
    function transform(delegate: IContextMenuDelegate | IContextMenuMenuDelegate, menuService: IMenuService, globalContextKeyService: IContextKeyService): IContextMenuDelegate;
}
