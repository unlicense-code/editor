import { IContextMenuMenuDelegate, IContextMenuService, IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IContextMenuDelegate } from 'vs/base/browser/contextmenu';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { Event } from 'vs/base/common/event';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export declare class ContextMenuService implements IContextMenuService {
    readonly _serviceBrand: undefined;
    private impl;
    get onDidShowContextMenu(): Event<void>;
    get onDidHideContextMenu(): Event<void>;
    constructor(notificationService: INotificationService, telemetryService: ITelemetryService, keybindingService: IKeybindingService, configurationService: IConfigurationService, contextViewService: IContextViewService, themeService: IThemeService, menuService: IMenuService, contextKeyService: IContextKeyService);
    dispose(): void;
    showContextMenu(delegate: IContextMenuDelegate | IContextMenuMenuDelegate): void;
}
