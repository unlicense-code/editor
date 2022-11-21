import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ITerminalConfiguration, ITerminalFont } from 'vs/workbench/contrib/terminal/common/terminal';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IBrowserTerminalConfigHelper, LinuxDistro } from 'vs/workbench/contrib/terminal/browser/terminal';
import { Event } from 'vs/base/common/event';
import { IExtensionManagementService } from 'vs/platform/extensionManagement/common/extensionManagement';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IProductService } from 'vs/platform/product/common/productService';
import { IXtermCore } from 'vs/workbench/contrib/terminal/browser/xterm-private';
import { IShellLaunchConfig } from 'vs/platform/terminal/common/terminal';
/**
 * Encapsulates terminal configuration logic, the primary purpose of this file is so that platform
 * specific test cases can be written.
 */
export declare class TerminalConfigHelper implements IBrowserTerminalConfigHelper {
    private readonly _configurationService;
    private readonly _extensionManagementService;
    private readonly _notificationService;
    private readonly _instantiationService;
    private readonly _productService;
    panelContainer: HTMLElement | undefined;
    private _charMeasureElement;
    private _lastFontMeasurement;
    protected _linuxDistro: LinuxDistro;
    config: ITerminalConfiguration;
    private readonly _onConfigChanged;
    get onConfigChanged(): Event<void>;
    constructor(_configurationService: IConfigurationService, _extensionManagementService: IExtensionManagementService, _notificationService: INotificationService, _instantiationService: IInstantiationService, _productService: IProductService);
    private _updateConfig;
    configFontIsMonospace(): boolean;
    private _createCharMeasureElementIfNecessary;
    private _getBoundingRectFor;
    private _measureFont;
    /**
     * Gets the font information based on the terminal.integrated.fontFamily
     * terminal.integrated.fontSize, terminal.integrated.lineHeight configuration properties
     */
    getFont(xtermCore?: IXtermCore, excludeDimensions?: boolean): ITerminalFont;
    private _clampInt;
    private _recommendationsShown;
    showRecommendations(shellLaunchConfig: IShellLaunchConfig): Promise<void>;
    private _isExtensionInstalled;
    private _normalizeFontWeight;
}
