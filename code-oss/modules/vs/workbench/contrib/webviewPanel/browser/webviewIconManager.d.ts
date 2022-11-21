import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
export interface WebviewIcons {
    readonly light: URI;
    readonly dark: URI;
}
export declare class WebviewIconManager implements IDisposable {
    private readonly _lifecycleService;
    private readonly _configService;
    private readonly _icons;
    private _styleElement;
    constructor(_lifecycleService: ILifecycleService, _configService: IConfigurationService);
    dispose(): void;
    private get styleElement();
    setIcons(webviewId: string, iconPath: WebviewIcons | undefined): void;
    private updateStyleSheet;
}
