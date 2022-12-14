import 'vs/css!./media/openeditors';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorGroupsService, IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { OpenEditor } from 'vs/workbench/contrib/files/common/files';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { WorkbenchList } from 'vs/platform/list/browser/listService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ViewPane } from 'vs/workbench/browser/parts/views/viewPane';
import { IViewletViewOptions } from 'vs/workbench/browser/parts/views/viewsViewlet';
import { IWorkingCopyService } from 'vs/workbench/services/workingCopy/common/workingCopyService';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IOpenerService } from 'vs/platform/opener/common/opener';
export declare class OpenEditorsView extends ViewPane {
    private readonly editorGroupService;
    private readonly workingCopyService;
    private readonly filesConfigurationService;
    private static readonly DEFAULT_VISIBLE_OPEN_EDITORS;
    private static readonly DEFAULT_MIN_VISIBLE_OPEN_EDITORS;
    static readonly ID = "workbench.explorer.openEditorsView";
    static readonly NAME: string;
    private dirtyCountElement;
    private listRefreshScheduler;
    private structuralRefreshDelay;
    private list;
    private listLabels;
    private needsRefresh;
    private elements;
    private sortOrder;
    private resourceContext;
    private groupFocusedContext;
    private dirtyEditorFocusedContext;
    private readonlyEditorFocusedContext;
    constructor(options: IViewletViewOptions, instantiationService: IInstantiationService, viewDescriptorService: IViewDescriptorService, contextMenuService: IContextMenuService, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, themeService: IThemeService, telemetryService: ITelemetryService, workingCopyService: IWorkingCopyService, filesConfigurationService: IFilesConfigurationService, openerService: IOpenerService);
    private registerUpdateEvents;
    protected renderHeaderTitle(container: HTMLElement): void;
    renderBody(container: HTMLElement): void;
    focus(): void;
    getList(): WorkbenchList<OpenEditor | IEditorGroup>;
    protected layoutBody(height: number, width: number): void;
    private get showGroups();
    private getElements;
    private getIndex;
    private openEditor;
    private onListContextMenu;
    private focusActiveEditor;
    private onConfigurationChange;
    private updateSize;
    private updateDirtyIndicator;
    private get elementCount();
    private getMaxExpandedBodySize;
    private getMinExpandedBodySize;
    private computeMinExpandedBodySize;
    setStructuralRefreshDelay(delay: number): void;
    getOptimalWidth(): number;
}
