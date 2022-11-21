import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { ResourceLabels, IResourceLabel } from 'vs/workbench/browser/labels';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { ResourceMarkers, Marker, RelatedInformation, MarkerElement, MarkerTableItem } from 'vs/workbench/contrib/markers/browser/markersModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { QuickFixAction } from 'vs/workbench/contrib/markers/browser/markersViewActions';
import { ILabelService } from 'vs/platform/label/common/label';
import { IListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { ITreeFilter, TreeVisibility, TreeFilterResult, ITreeRenderer, ITreeNode } from 'vs/base/browser/ui/tree/tree';
import { FilterOptions } from 'vs/workbench/contrib/markers/browser/markersFilterOptions';
import { IMatch } from 'vs/base/common/filters';
import { Event } from 'vs/base/common/event';
import { IListAccessibilityProvider } from 'vs/base/browser/ui/list/listWidget';
import { URI } from 'vs/base/common/uri';
import { IModelService } from 'vs/editor/common/services/model';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IFileService } from 'vs/platform/files/common/files';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { MarkersViewMode } from 'vs/workbench/contrib/markers/common/markers';
interface IResourceMarkersTemplateData {
    resourceLabel: IResourceLabel;
    count: CountBadge;
    styler: IDisposable;
}
interface IMarkerTemplateData {
    markerWidget: MarkerWidget;
}
interface IRelatedInformationTemplateData {
    resourceLabel: HighlightedLabel;
    lnCol: HTMLElement;
    description: HighlightedLabel;
}
export declare class MarkersWidgetAccessibilityProvider implements IListAccessibilityProvider<MarkerElement | MarkerTableItem> {
    private readonly labelService;
    constructor(labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: MarkerElement | MarkerTableItem): string | null;
}
declare const enum TemplateId {
    ResourceMarkers = "rm",
    Marker = "m",
    RelatedInformation = "ri"
}
export declare class VirtualDelegate implements IListVirtualDelegate<MarkerElement> {
    private readonly markersViewState;
    static LINE_HEIGHT: number;
    constructor(markersViewState: MarkersViewModel);
    getHeight(element: MarkerElement): number;
    getTemplateId(element: MarkerElement): string;
}
declare const enum FilterDataType {
    ResourceMarkers = 0,
    Marker = 1,
    RelatedInformation = 2
}
interface ResourceMarkersFilterData {
    type: FilterDataType.ResourceMarkers;
    uriMatches: IMatch[];
}
interface MarkerFilterData {
    type: FilterDataType.Marker;
    lineMatches: IMatch[][];
    sourceMatches: IMatch[];
    codeMatches: IMatch[];
}
interface RelatedInformationFilterData {
    type: FilterDataType.RelatedInformation;
    uriMatches: IMatch[];
    messageMatches: IMatch[];
}
export declare type FilterData = ResourceMarkersFilterData | MarkerFilterData | RelatedInformationFilterData;
export declare class ResourceMarkersRenderer implements ITreeRenderer<ResourceMarkers, ResourceMarkersFilterData, IResourceMarkersTemplateData> {
    private labels;
    private readonly themeService;
    private readonly labelService;
    private readonly fileService;
    private renderedNodes;
    private readonly disposables;
    constructor(labels: ResourceLabels, onDidChangeRenderNodeCount: Event<ITreeNode<ResourceMarkers, ResourceMarkersFilterData>>, themeService: IThemeService, labelService: ILabelService, fileService: IFileService);
    templateId: TemplateId;
    renderTemplate(container: HTMLElement): IResourceMarkersTemplateData;
    renderElement(node: ITreeNode<ResourceMarkers, ResourceMarkersFilterData>, _: number, templateData: IResourceMarkersTemplateData): void;
    disposeElement(node: ITreeNode<ResourceMarkers, ResourceMarkersFilterData>): void;
    disposeTemplate(templateData: IResourceMarkersTemplateData): void;
    private onDidChangeRenderNodeCount;
    private updateCount;
    dispose(): void;
}
export declare class FileResourceMarkersRenderer extends ResourceMarkersRenderer {
}
export declare class MarkerRenderer implements ITreeRenderer<Marker, MarkerFilterData, IMarkerTemplateData> {
    private readonly markersViewState;
    protected instantiationService: IInstantiationService;
    protected openerService: IOpenerService;
    constructor(markersViewState: MarkersViewModel, instantiationService: IInstantiationService, openerService: IOpenerService);
    templateId: TemplateId;
    renderTemplate(container: HTMLElement): IMarkerTemplateData;
    renderElement(node: ITreeNode<Marker, MarkerFilterData>, _: number, templateData: IMarkerTemplateData): void;
    disposeTemplate(templateData: IMarkerTemplateData): void;
}
declare class MarkerWidget extends Disposable {
    private parent;
    private readonly markersViewModel;
    private readonly _openerService;
    private readonly actionBar;
    private readonly icon;
    private readonly messageAndDetailsContainer;
    private readonly disposables;
    constructor(parent: HTMLElement, markersViewModel: MarkersViewModel, _openerService: IOpenerService, _instantiationService: IInstantiationService);
    render(element: Marker, filterData: MarkerFilterData | undefined): void;
    private renderQuickfixActionbar;
    private renderMultilineActionbar;
    private renderMessageAndDetails;
    private renderDetails;
}
export declare class RelatedInformationRenderer implements ITreeRenderer<RelatedInformation, RelatedInformationFilterData, IRelatedInformationTemplateData> {
    private readonly labelService;
    constructor(labelService: ILabelService);
    templateId: TemplateId;
    renderTemplate(container: HTMLElement): IRelatedInformationTemplateData;
    renderElement(node: ITreeNode<RelatedInformation, RelatedInformationFilterData>, _: number, templateData: IRelatedInformationTemplateData): void;
    disposeTemplate(templateData: IRelatedInformationTemplateData): void;
}
export declare class Filter implements ITreeFilter<MarkerElement, FilterData> {
    options: FilterOptions;
    constructor(options: FilterOptions);
    filter(element: MarkerElement, parentVisibility: TreeVisibility): TreeFilterResult<FilterData>;
    private filterResourceMarkers;
    private filterMarker;
    private filterRelatedInformation;
}
export declare class MarkerViewModel extends Disposable {
    private readonly marker;
    private modelService;
    private instantiationService;
    private readonly editorService;
    private readonly languageFeaturesService;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private modelPromise;
    private codeActionsPromise;
    constructor(marker: Marker, modelService: IModelService, instantiationService: IInstantiationService, editorService: IEditorService, languageFeaturesService: ILanguageFeaturesService);
    private _multiline;
    get multiline(): boolean;
    set multiline(value: boolean);
    private _quickFixAction;
    get quickFixAction(): QuickFixAction;
    showLightBulb(): void;
    private setQuickFixes;
    private getCodeActions;
    private toActions;
    private openFileAtMarker;
    private getModel;
}
export declare class MarkersViewModel extends Disposable {
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly _onDidChange;
    readonly onDidChange: Event<Marker | undefined>;
    private readonly _onDidChangeViewMode;
    readonly onDidChangeViewMode: Event<MarkersViewMode>;
    private readonly markersViewStates;
    private readonly markersPerResource;
    private bulkUpdate;
    private hoveredMarker;
    private hoverDelayer;
    private viewModeContextKey;
    constructor(multiline: boolean | undefined, viewMode: MarkersViewMode | undefined, contextKeyService: IContextKeyService, instantiationService: IInstantiationService);
    add(marker: Marker): void;
    remove(resource: URI): void;
    getViewModel(marker: Marker): MarkerViewModel | null;
    onMarkerMouseHover(marker: Marker): void;
    onMarkerMouseLeave(marker: Marker): void;
    private _multiline;
    get multiline(): boolean;
    set multiline(value: boolean);
    private _viewMode;
    get viewMode(): MarkersViewMode;
    set viewMode(value: MarkersViewMode);
    dispose(): void;
}
export {};
