import { Event } from 'vs/base/common/event';
import { ITableContextMenuEvent, ITableEvent } from 'vs/base/browser/ui/table/table';
import { Disposable } from 'vs/base/common/lifecycle';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenEvent, IWorkbenchTableOptions } from 'vs/platform/list/browser/listService';
import { Marker, MarkerTableItem, ResourceMarkers } from 'vs/workbench/contrib/markers/browser/markersModel';
import { ILabelService } from 'vs/platform/label/common/label';
import { FilterOptions } from 'vs/workbench/contrib/markers/browser/markersFilterOptions';
import { MarkersViewModel } from 'vs/workbench/contrib/markers/browser/markersTreeViewer';
import { IProblemsWidget } from 'vs/workbench/contrib/markers/browser/markersView';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
export declare class MarkersTable extends Disposable implements IProblemsWidget {
    private readonly container;
    private readonly markersViewModel;
    private resourceMarkers;
    private filterOptions;
    private readonly instantiationService;
    private readonly labelService;
    private _itemCount;
    private readonly table;
    constructor(container: HTMLElement, markersViewModel: MarkersViewModel, resourceMarkers: ResourceMarkers[], filterOptions: FilterOptions, options: IWorkbenchTableOptions<MarkerTableItem>, instantiationService: IInstantiationService, labelService: ILabelService);
    get contextKeyService(): IContextKeyService;
    get onContextMenu(): Event<ITableContextMenuEvent<MarkerTableItem>>;
    get onDidOpen(): Event<IOpenEvent<MarkerTableItem | undefined>>;
    get onDidChangeFocus(): Event<ITableEvent<MarkerTableItem>>;
    get onDidChangeSelection(): Event<ITableEvent<MarkerTableItem>>;
    collapseMarkers(): void;
    domFocus(): void;
    filterMarkers(resourceMarkers: ResourceMarkers[], filterOptions: FilterOptions): void;
    getFocus(): (MarkerTableItem | null)[];
    getHTMLElement(): HTMLElement;
    getRelativeTop(marker: MarkerTableItem | null): number | null;
    getSelection(): (MarkerTableItem | null)[];
    getVisibleItemCount(): number;
    isVisible(): boolean;
    layout(height: number, width: number): void;
    reset(resourceMarkers: ResourceMarkers[]): void;
    revealMarkers(activeResource: ResourceMarkers | null, focus: boolean, lastSelectedRelativeTop: number): void;
    setAriaLabel(label: string): void;
    setMarkerSelection(selection?: Marker[], focus?: Marker[]): void;
    toggleVisibility(hide: boolean): void;
    update(resourceMarkers: ResourceMarkers[]): void;
    updateMarker(marker: Marker): void;
    private findMarkerIndex;
    private hasSelectedMarkerFor;
}
