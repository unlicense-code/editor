import { ILayoutService } from 'vs/platform/layout/browser/layoutService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { QuickInputController } from 'vs/base/parts/quickinput/browser/quickInput';
import { QuickInputService as BaseQuickInputService } from 'vs/platform/quickinput/browser/quickInput';
export declare class QuickInputService extends BaseQuickInputService {
    private readonly configurationService;
    private readonly keybindingService;
    private readonly inQuickInputContext;
    constructor(configurationService: IConfigurationService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, themeService: IThemeService, accessibilityService: IAccessibilityService, layoutService: ILayoutService);
    private registerListeners;
    protected createController(): QuickInputController;
}
