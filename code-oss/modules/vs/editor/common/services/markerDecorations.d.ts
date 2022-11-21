import { ITextModel, IModelDecoration } from 'vs/editor/common/model';
import { IMarker } from 'vs/platform/markers/common/markers';
import { Event } from 'vs/base/common/event';
import { Range } from 'vs/editor/common/core/range';
import { URI } from 'vs/base/common/uri';
export declare const IMarkerDecorationsService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IMarkerDecorationsService>;
export interface IMarkerDecorationsService {
    readonly _serviceBrand: undefined;
    onDidChangeMarker: Event<ITextModel>;
    getMarker(uri: URI, decoration: IModelDecoration): IMarker | null;
    getLiveMarkers(uri: URI): [Range, IMarker][];
}
