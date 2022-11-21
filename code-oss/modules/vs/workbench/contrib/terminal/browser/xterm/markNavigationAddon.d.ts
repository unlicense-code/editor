import { Disposable } from 'vs/base/common/lifecycle';
import { IMarkTracker } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ITerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/capabilities';
import type { Terminal, IMarker, ITerminalAddon } from 'xterm';
import { IThemeService } from 'vs/platform/theme/common/themeService';
declare enum Boundary {
    Top = 0,
    Bottom = 1
}
export declare const enum ScrollPosition {
    Top = 0,
    Middle = 1
}
export declare class MarkNavigationAddon extends Disposable implements IMarkTracker, ITerminalAddon {
    private readonly _capabilities;
    private readonly _themeService;
    private _currentMarker;
    private _selectionStart;
    private _isDisposable;
    protected _terminal: Terminal | undefined;
    private _navigationDecorations;
    activate(terminal: Terminal): void;
    constructor(_capabilities: ITerminalCapabilityStore, _themeService: IThemeService);
    private _getMarkers;
    clearMarker(): void;
    private _resetNavigationDecorations;
    private _isEmptyCommand;
    scrollToPreviousMark(scrollPosition?: ScrollPosition, retainSelection?: boolean, skipEmptyCommands?: boolean): void;
    scrollToNextMark(scrollPosition?: ScrollPosition, retainSelection?: boolean, skipEmptyCommands?: boolean): void;
    private _scrollToMarker;
    private _createMarkerForOffset;
    private _registerTemporaryDecoration;
    private _getTargetScrollLine;
    private _isMarkerInViewport;
    scrollToClosestMarker(startMarkerId: string, endMarkerId?: string, highlight?: boolean | undefined): void;
    selectToPreviousMark(): void;
    selectToNextMark(): void;
    selectToPreviousLine(): void;
    selectToNextLine(): void;
    scrollToPreviousLine(xterm: Terminal, scrollPosition?: ScrollPosition, retainSelection?: boolean): void;
    scrollToNextLine(xterm: Terminal, scrollPosition?: ScrollPosition, retainSelection?: boolean): void;
    private _registerMarkerOrThrow;
    private _getOffset;
    private _findPreviousMarker;
    private _findNextMarker;
}
export declare function getLine(xterm: Terminal, marker: IMarker | Boundary): number;
export declare function selectLines(xterm: Terminal, start: IMarker | Boundary, end: IMarker | Boundary | null): void;
export {};
