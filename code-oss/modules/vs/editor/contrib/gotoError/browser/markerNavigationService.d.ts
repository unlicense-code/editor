import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { Position } from 'vs/editor/common/core/position';
import { ITextModel } from 'vs/editor/common/model';
import { IMarker, IMarkerService } from 'vs/platform/markers/common/markers';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class MarkerCoordinate {
    readonly marker: IMarker;
    readonly index: number;
    readonly total: number;
    constructor(marker: IMarker, index: number, total: number);
}
export declare class MarkerList {
    private readonly _markerService;
    private readonly _configService;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private readonly _resourceFilter?;
    private readonly _dispoables;
    private _markers;
    private _nextIdx;
    constructor(resourceFilter: URI | ((uri: URI) => boolean) | undefined, _markerService: IMarkerService, _configService: IConfigurationService);
    dispose(): void;
    matches(uri: URI | undefined): boolean;
    get selected(): MarkerCoordinate | undefined;
    private _initIdx;
    resetIndex(): void;
    move(fwd: boolean, model: ITextModel, position: Position): boolean;
    find(uri: URI, position: Position): MarkerCoordinate | undefined;
}
export declare const IMarkerNavigationService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IMarkerNavigationService>;
export interface IMarkerNavigationService {
    readonly _serviceBrand: undefined;
    registerProvider(provider: IMarkerListProvider): IDisposable;
    getMarkerList(resource: URI | undefined): MarkerList;
}
export interface IMarkerListProvider {
    getMarkerList(resource: URI | undefined): MarkerList | undefined;
}
