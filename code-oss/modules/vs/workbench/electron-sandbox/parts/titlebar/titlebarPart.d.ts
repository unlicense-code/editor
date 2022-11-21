import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService, IConfigurationChangeEvent } from 'vs/platform/configuration/common/configuration';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { TitlebarPart as BrowserTitleBarPart } from 'vs/workbench/browser/parts/titlebar/titlebarPart';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IHoverService } from 'vs/workbench/services/hover/browser/hover';
export declare class TitlebarPart extends BrowserTitleBarPart {
    private readonly nativeHostService;
    private maxRestoreControl;
    private resizer;
    private cachedWindowControlStyles;
    private cachedWindowControlHeight;
    private isBigSurOrNewer;
    private getMacTitlebarSize;
    get minimumHeight(): number;
    get maximumHeight(): number;
    protected readonly environmentService: INativeWorkbenchEnvironmentService;
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: INativeWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, nativeHostService: INativeHostService, hoverService: IHoverService);
    private onUpdateAppIconDragBehavior;
    private onDidChangeWindowMaximized;
    private onMenubarFocusChanged;
    protected onMenubarVisibilityChanged(visible: boolean): void;
    protected onConfigurationChanged(event: IConfigurationChangeEvent): void;
    protected installMenubar(): void;
    createContentArea(parent: HTMLElement): HTMLElement;
    updateStyles(): void;
    layout(width: number, height: number): void;
}