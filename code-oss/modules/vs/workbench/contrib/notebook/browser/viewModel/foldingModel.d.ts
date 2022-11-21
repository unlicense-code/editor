import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { FoldingRegion, FoldingRegions } from 'vs/editor/contrib/folding/browser/foldingRanges';
import { INotebookViewModel } from 'vs/workbench/contrib/notebook/browser/notebookBrowser';
import { ICellRange } from 'vs/workbench/contrib/notebook/common/notebookRange';
declare type RegionFilter = (r: FoldingRegion) => boolean;
declare type RegionFilterWithLevel = (r: FoldingRegion, level: number) => boolean;
export declare class FoldingModel implements IDisposable {
    private _viewModel;
    private readonly _viewModelStore;
    private _regions;
    get regions(): FoldingRegions;
    private readonly _onDidFoldingRegionChanges;
    readonly onDidFoldingRegionChanged: Event<void>;
    private _foldingRangeDecorationIds;
    constructor();
    dispose(): void;
    detachViewModel(): void;
    attachViewModel(model: INotebookViewModel): void;
    getRegionAtLine(lineNumber: number): FoldingRegion | null;
    getRegionsInside(region: FoldingRegion | null, filter?: RegionFilter | RegionFilterWithLevel): FoldingRegion[];
    getAllRegionsAtLine(lineNumber: number, filter?: (r: FoldingRegion, level: number) => boolean): FoldingRegion[];
    setCollapsed(index: number, newState: boolean): void;
    recompute(): void;
    getMemento(): ICellRange[];
    applyMemento(state: ICellRange[]): boolean;
}
export declare function updateFoldingStateAtIndex(foldingModel: FoldingModel, index: number, collapsed: boolean): void;
export {};
