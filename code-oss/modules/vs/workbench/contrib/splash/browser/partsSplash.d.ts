import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ISplashStorageService } from 'vs/workbench/contrib/splash/browser/splash';
export declare class PartsSplash {
    private readonly _themeService;
    private readonly _layoutService;
    private readonly _environmentService;
    private readonly _partSplashService;
    private static readonly _splashElementId;
    private readonly _disposables;
    private _didChangeTitleBarStyle?;
    constructor(_themeService: IThemeService, _layoutService: IWorkbenchLayoutService, _environmentService: IWorkbenchEnvironmentService, lifecycleService: ILifecycleService, editorGroupsService: IEditorGroupsService, configService: IConfigurationService, _partSplashService: ISplashStorageService);
    dispose(): void;
    private _savePartsSplash;
    private _shouldSaveLayoutInfo;
    private _removePartsSplash;
}
