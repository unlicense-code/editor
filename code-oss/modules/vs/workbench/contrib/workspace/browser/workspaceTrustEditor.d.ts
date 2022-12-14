import { Dimension } from 'vs/base/browser/dom';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IWorkspaceTrustManagementService } from 'vs/platform/workspace/common/workspaceTrust';
import { EditorPane } from 'vs/workbench/browser/parts/editor/editorPane';
import { IEditorOpenContext } from 'vs/workbench/common/editor';
import { IExtensionsWorkbenchService } from 'vs/workbench/contrib/extensions/common/extensions';
import { IWorkbenchConfigurationService } from 'vs/workbench/services/configuration/common/configuration';
import { IExtensionManifestPropertiesService } from 'vs/workbench/services/extensions/common/extensionManifestPropertiesService';
import { WorkspaceTrustEditorInput } from 'vs/workbench/services/workspaces/browser/workspaceTrustEditorInput';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IWorkbenchExtensionEnablementService } from 'vs/workbench/services/extensionManagement/common/extensionManagement';
import { IProductService } from 'vs/platform/product/common/productService';
export declare const shieldIcon: ThemeIcon;
export declare class WorkspaceTrustEditor extends EditorPane {
    private readonly workspaceService;
    private readonly extensionWorkbenchService;
    private readonly extensionManifestPropertiesService;
    private readonly instantiationService;
    private readonly contextMenuService;
    private readonly workspaceTrustManagementService;
    private readonly configurationService;
    private readonly extensionEnablementService;
    private readonly productService;
    static readonly ID: string;
    private rootElement;
    private headerContainer;
    private headerTitleContainer;
    private headerTitleIcon;
    private headerTitleText;
    private headerDescription;
    private bodyScrollBar;
    private affectedFeaturesContainer;
    private trustedContainer;
    private untrustedContainer;
    private configurationContainer;
    private workspaceTrustedUrisTable;
    constructor(telemetryService: ITelemetryService, themeService: IThemeService, storageService: IStorageService, workspaceService: IWorkspaceContextService, extensionWorkbenchService: IExtensionsWorkbenchService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, instantiationService: IInstantiationService, contextMenuService: IContextMenuService, workspaceTrustManagementService: IWorkspaceTrustManagementService, configurationService: IWorkbenchConfigurationService, extensionEnablementService: IWorkbenchExtensionEnablementService, productService: IProductService);
    protected createEditor(parent: HTMLElement): void;
    focus(): void;
    setInput(input: WorkspaceTrustEditorInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private registerListeners;
    private getHeaderContainerClass;
    private getHeaderTitleText;
    private getHeaderTitleIconClassNames;
    private getFeaturesHeaderText;
    private rendering;
    private rerenderDisposables;
    private render;
    private getExtensionCount;
    private createHeaderElement;
    private createConfigurationElement;
    private createAffectedFeaturesElement;
    private renderAffectedFeatures;
    private createButtonRow;
    private addTrustButtonToElement;
    private addDontTrustButtonToElement;
    private addTrustedTextToElement;
    private renderLimitationsHeaderElement;
    private renderLimitationsListElement;
    private layoutParticipants;
    layout(dimension: Dimension): void;
}
