import { IMarkerService, IMarker } from 'vs/platform/markers/common/markers';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ITextModel, IModelDecoration } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { Range } from 'vs/editor/common/core/range';
import { IMarkerDecorationsService } from 'vs/editor/common/services/markerDecorations';
import { Event } from 'vs/base/common/event';
export declare class MarkerDecorationsService extends Disposable implements IMarkerDecorationsService {
    private readonly _markerService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeMarker;
    readonly onDidChangeMarker: Event<ITextModel>;
    private readonly _markerDecorations;
    constructor(modelService: IModelService, _markerService: IMarkerService);
    dispose(): void;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
    private _handleMarkerChange;
    private _onModelAdded;
    private _onModelRemoved;
    private _updateDecorations;
    private _createDecorationRange;
    private _createDecorationOption;
    private _hasMarkerTag;
}
