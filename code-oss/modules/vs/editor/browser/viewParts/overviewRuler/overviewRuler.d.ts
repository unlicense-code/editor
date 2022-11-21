import { IOverviewRuler } from 'vs/editor/browser/editorBrowser';
import { OverviewRulerPosition } from 'vs/editor/common/config/editorOptions';
import { OverviewRulerZone } from 'vs/editor/common/viewModel/overviewZoneManager';
import { ViewContext } from 'vs/editor/common/viewModel/viewContext';
import * as viewEvents from 'vs/editor/common/viewEvents';
import { ViewEventHandler } from 'vs/editor/common/viewEventHandler';
export declare class OverviewRuler extends ViewEventHandler implements IOverviewRuler {
    private readonly _context;
    private readonly _domNode;
    private readonly _zoneManager;
    constructor(context: ViewContext, cssClassName: string);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    getDomNode(): HTMLElement;
    setLayout(position: OverviewRulerPosition): void;
    setZones(zones: OverviewRulerZone[]): void;
    private _render;
    private _renderOneLane;
}
