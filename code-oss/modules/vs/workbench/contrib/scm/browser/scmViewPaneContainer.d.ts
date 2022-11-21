import 'vs/css!./media/scm';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
export declare class SCMViewPaneContainer extends ViewPaneContainer {
    constructor(layoutService: IWorkbenchLayoutService, telemetryService: ITelemetryService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, extensionService: IExtensionService, contextService: IWorkspaceContextService, viewDescriptorService: IViewDescriptorService);
    create(parent: HTMLElement): void;
    getOptimalWidth(): number;
    getTitle(): string;
}
