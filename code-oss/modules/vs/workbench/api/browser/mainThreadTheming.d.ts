import { MainThreadThemingShape } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { IThemeService } from 'vs/platform/theme/common/themeService';
export declare class MainThreadTheming implements MainThreadThemingShape {
    private readonly _themeService;
    private readonly _proxy;
    private readonly _themeChangeListener;
    constructor(extHostContext: IExtHostContext, themeService: IThemeService);
    dispose(): void;
}
