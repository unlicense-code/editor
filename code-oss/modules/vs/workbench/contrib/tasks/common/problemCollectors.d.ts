import { URI } from 'vs/base/common/uri';
import { Event, Emitter } from 'vs/base/common/event';
import { IDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { IModelService } from 'vs/editor/common/services/model';
import { ProblemMatcher, IProblemMatch, ApplyToKind } from 'vs/workbench/contrib/tasks/common/problemMatcher';
import { IMarkerService, IMarkerData, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { IFileService } from 'vs/platform/files/common/files';
export declare const enum ProblemCollectorEventKind {
    BackgroundProcessingBegins = "backgroundProcessingBegins",
    BackgroundProcessingEnds = "backgroundProcessingEnds"
}
export interface IProblemCollectorEvent {
    kind: ProblemCollectorEventKind;
}
export interface IProblemMatcher {
    processLine(line: string): void;
}
export declare abstract class AbstractProblemCollector implements IDisposable {
    readonly problemMatchers: ProblemMatcher[];
    protected markerService: IMarkerService;
    protected modelService: IModelService;
    private matchers;
    private activeMatcher;
    protected _numberOfMatches: number;
    private _maxMarkerSeverity?;
    private buffer;
    private bufferLength;
    private openModels;
    protected readonly modelListeners: DisposableStore;
    private tail;
    protected applyToByOwner: Map<string, ApplyToKind>;
    private resourcesToClean;
    private markers;
    private deliveredMarkers;
    protected _onDidStateChange: Emitter<IProblemCollectorEvent>;
    protected readonly _onDidFindFirstMatch: Emitter<void>;
    readonly onDidFindFirstMatch: Event<void>;
    protected readonly _onDidFindErrors: Emitter<void>;
    readonly onDidFindErrors: Event<void>;
    protected readonly _onDidRequestInvalidateLastMarker: Emitter<void>;
    readonly onDidRequestInvalidateLastMarker: Event<void>;
    constructor(problemMatchers: ProblemMatcher[], markerService: IMarkerService, modelService: IModelService, fileService?: IFileService);
    get onDidStateChange(): Event<IProblemCollectorEvent>;
    processLine(line: string): void;
    protected abstract processLineInternal(line: string): Promise<void>;
    dispose(): void;
    get numberOfMatches(): number;
    get maxMarkerSeverity(): MarkerSeverity | undefined;
    protected tryFindMarker(line: string): IProblemMatch | null;
    protected shouldApplyMatch(result: IProblemMatch): Promise<boolean>;
    private mergeApplyTo;
    private tryMatchers;
    private captureMatch;
    private clearBuffer;
    protected recordResourcesToClean(owner: string): void;
    protected recordResourceToClean(owner: string, resource: URI): void;
    protected removeResourceToClean(owner: string, resource: string): void;
    private getResourceSetToClean;
    protected cleanAllMarkers(): void;
    protected cleanMarkers(owner: string): void;
    private _cleanMarkers;
    protected recordMarker(marker: IMarkerData, owner: string, resourceAsString: string): void;
    protected reportMarkers(): void;
    protected deliverMarkersPerOwnerAndResource(owner: string, resource: string): void;
    private deliverMarkersPerOwnerAndResourceResolved;
    private getDeliveredMarkersPerOwner;
    protected cleanMarkerCaches(): void;
    done(): void;
}
export declare const enum ProblemHandlingStrategy {
    Clean = 0
}
export declare class StartStopProblemCollector extends AbstractProblemCollector implements IProblemMatcher {
    private owners;
    private currentOwner;
    private currentResource;
    constructor(problemMatchers: ProblemMatcher[], markerService: IMarkerService, modelService: IModelService, _strategy?: ProblemHandlingStrategy, fileService?: IFileService);
    protected processLineInternal(line: string): Promise<void>;
}
export declare class WatchingProblemCollector extends AbstractProblemCollector implements IProblemMatcher {
    private backgroundPatterns;
    private _activeBackgroundMatchers;
    private currentOwner;
    private currentResource;
    private lines;
    beginPatterns: RegExp[];
    constructor(problemMatchers: ProblemMatcher[], markerService: IMarkerService, modelService: IModelService, fileService?: IFileService);
    aboutToStart(): void;
    protected processLineInternal(line: string): Promise<void>;
    forceDelivery(): void;
    private tryBegin;
    private tryFinish;
    private resetCurrentResource;
    private reportMarkersForCurrentResource;
    done(): void;
    isWatching(): boolean;
}
