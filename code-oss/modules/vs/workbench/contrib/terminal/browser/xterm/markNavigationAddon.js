/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { coalesce } from 'vs/base/common/arrays';
import { Disposable, dispose } from 'vs/base/common/lifecycle';
import { timeout } from 'vs/base/common/async';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR } from 'vs/workbench/contrib/terminal/common/terminalColorRegistry';
var Boundary;
(function (Boundary) {
    Boundary[Boundary["Top"] = 0] = "Top";
    Boundary[Boundary["Bottom"] = 1] = "Bottom";
})(Boundary || (Boundary = {}));
export var ScrollPosition;
(function (ScrollPosition) {
    ScrollPosition[ScrollPosition["Top"] = 0] = "Top";
    ScrollPosition[ScrollPosition["Middle"] = 1] = "Middle";
})(ScrollPosition || (ScrollPosition = {}));
let MarkNavigationAddon = class MarkNavigationAddon extends Disposable {
    _capabilities;
    _themeService;
    _currentMarker = Boundary.Bottom;
    _selectionStart = null;
    _isDisposable = false;
    _terminal;
    _navigationDecorations;
    activate(terminal) {
        this._terminal = terminal;
        this._register(this._terminal.onData(() => {
            this._currentMarker = Boundary.Bottom;
        }));
    }
    constructor(_capabilities, _themeService) {
        super();
        this._capabilities = _capabilities;
        this._themeService = _themeService;
    }
    _getMarkers(skipEmptyCommands) {
        const commandCapability = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
        const partialCommandCapability = this._capabilities.get(3 /* TerminalCapability.PartialCommandDetection */);
        const markCapability = this._capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
        let markers = [];
        if (commandCapability) {
            markers = coalesce(commandCapability.commands.map(e => e.marker));
        }
        else if (partialCommandCapability) {
            markers.push(...partialCommandCapability.commands);
        }
        if (markCapability && !skipEmptyCommands) {
            let next = markCapability.markers().next()?.value;
            const arr = [];
            while (next) {
                arr.push(next);
                next = markCapability.markers().next()?.value;
            }
            markers = arr;
        }
        return markers;
    }
    clearMarker() {
        // Clear the current marker so successive focus/selection actions are performed from the
        // bottom of the buffer
        this._currentMarker = Boundary.Bottom;
        this._resetNavigationDecorations();
        this._selectionStart = null;
    }
    _resetNavigationDecorations() {
        if (this._navigationDecorations) {
            dispose(this._navigationDecorations);
        }
        this._navigationDecorations = [];
    }
    _isEmptyCommand(marker) {
        if (marker === Boundary.Bottom) {
            return true;
        }
        if (marker === Boundary.Top) {
            return this._getMarkers(true).map(e => e.line).indexOf(0) === -1;
        }
        return this._getMarkers(true).indexOf(marker) === -1;
    }
    scrollToPreviousMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands) {
        if (!this._terminal) {
            return;
        }
        if (!retainSelection) {
            this._selectionStart = null;
        }
        let markerIndex;
        const currentLineY = typeof this._currentMarker === 'object'
            ? this._getTargetScrollLine(this._terminal, this._currentMarker, scrollPosition)
            : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
        const viewportY = this._terminal.buffer.active.viewportY;
        if (typeof this._currentMarker === 'object' ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
            // The user has scrolled, find the line based on the current scroll position. This only
            // works when not retaining selection
            const markersBelowViewport = this._getMarkers(skipEmptyCommands).filter(e => e.line >= viewportY).length;
            // -1 will scroll to the top
            markerIndex = this._getMarkers(skipEmptyCommands).length - markersBelowViewport - 1;
        }
        else if (this._currentMarker === Boundary.Bottom) {
            markerIndex = this._getMarkers(skipEmptyCommands).length - 1;
        }
        else if (this._currentMarker === Boundary.Top) {
            markerIndex = -1;
        }
        else if (this._isDisposable) {
            markerIndex = this._findPreviousMarker(this._terminal, skipEmptyCommands);
            this._currentMarker.dispose();
            this._isDisposable = false;
        }
        else {
            if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
                markerIndex = this._findPreviousMarker(this._terminal, true);
            }
            else {
                markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) - 1;
            }
        }
        if (markerIndex < 0) {
            this._currentMarker = Boundary.Top;
            this._terminal.scrollToTop();
            this._resetNavigationDecorations();
            return;
        }
        this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
        this._scrollToMarker(this._currentMarker, scrollPosition);
    }
    scrollToNextMark(scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false, skipEmptyCommands = true) {
        if (!this._terminal) {
            return;
        }
        if (!retainSelection) {
            this._selectionStart = null;
        }
        let markerIndex;
        const currentLineY = typeof this._currentMarker === 'object'
            ? this._getTargetScrollLine(this._terminal, this._currentMarker, scrollPosition)
            : Math.min(getLine(this._terminal, this._currentMarker), this._terminal.buffer.active.baseY);
        const viewportY = this._terminal.buffer.active.viewportY;
        if (typeof this._currentMarker === 'object' ? !this._isMarkerInViewport(this._terminal, this._currentMarker) : currentLineY !== viewportY) {
            // The user has scrolled, find the line based on the current scroll position. This only
            // works when not retaining selection
            const markersAboveViewport = this._getMarkers(skipEmptyCommands).filter(e => e.line <= viewportY).length;
            // markers.length will scroll to the bottom
            markerIndex = markersAboveViewport;
        }
        else if (this._currentMarker === Boundary.Bottom) {
            markerIndex = this._getMarkers(skipEmptyCommands).length;
        }
        else if (this._currentMarker === Boundary.Top) {
            markerIndex = 0;
        }
        else if (this._isDisposable) {
            markerIndex = this._findNextMarker(this._terminal, skipEmptyCommands);
            this._currentMarker.dispose();
            this._isDisposable = false;
        }
        else {
            if (skipEmptyCommands && this._isEmptyCommand(this._currentMarker)) {
                markerIndex = this._findNextMarker(this._terminal, true);
            }
            else {
                markerIndex = this._getMarkers(skipEmptyCommands).indexOf(this._currentMarker) + 1;
            }
        }
        if (markerIndex >= this._getMarkers(skipEmptyCommands).length) {
            this._currentMarker = Boundary.Bottom;
            this._terminal.scrollToBottom();
            this._resetNavigationDecorations();
            return;
        }
        this._currentMarker = this._getMarkers(skipEmptyCommands)[markerIndex];
        this._scrollToMarker(this._currentMarker, scrollPosition);
    }
    _scrollToMarker(marker, position, endMarker, hideDecoration) {
        if (!this._terminal) {
            return;
        }
        if (!this._isMarkerInViewport(this._terminal, marker)) {
            const line = this._getTargetScrollLine(this._terminal, marker, position);
            this._terminal.scrollToLine(line);
        }
        if (!hideDecoration) {
            this._registerTemporaryDecoration(marker, endMarker);
        }
    }
    _createMarkerForOffset(marker, offset) {
        if (offset === 0) {
            return marker;
        }
        else {
            const offsetMarker = this._terminal?.registerMarker(-this._terminal.buffer.active.cursorY + marker.line - this._terminal.buffer.active.baseY + offset);
            if (offsetMarker) {
                return offsetMarker;
            }
            else {
                throw new Error(`Could not register marker with offset ${marker.line}, ${offset}`);
            }
        }
    }
    _registerTemporaryDecoration(marker, endMarker) {
        if (!this._terminal) {
            return;
        }
        this._resetNavigationDecorations();
        const color = this._themeService.getColorTheme().getColor(TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
        const startLine = marker.line;
        const decorationCount = endMarker ? endMarker.line - startLine + 1 : 1;
        for (let i = 0; i < decorationCount; i++) {
            const decoration = this._terminal.registerDecoration({
                marker: this._createMarkerForOffset(marker, i),
                width: this._terminal.cols,
                overviewRulerOptions: {
                    color: color?.toString() || '#a0a0a0cc'
                }
            });
            if (decoration) {
                this._navigationDecorations?.push(decoration);
                let renderedElement;
                decoration.onRender(element => {
                    if (!renderedElement) {
                        renderedElement = element;
                        if (decorationCount > 1) {
                            element.classList.add('terminal-scroll-highlight');
                        }
                        else {
                            element.classList.add('terminal-scroll-highlight', 'terminal-scroll-highlight-outline');
                        }
                        if (this._terminal?.element) {
                            element.style.marginLeft = `-${getComputedStyle(this._terminal.element).paddingLeft}`;
                        }
                    }
                });
                decoration.onDispose(() => { this._navigationDecorations = this._navigationDecorations?.filter(d => d !== decoration); });
                // Number picked to align with symbol highlight in the editor
                timeout(350).then(() => {
                    if (renderedElement) {
                        renderedElement.classList.remove('terminal-scroll-highlight-outline');
                    }
                });
            }
        }
    }
    _getTargetScrollLine(terminal, marker, position) {
        // Middle is treated at 1/4 of the viewport's size because context below is almost always
        // more important than context above in the terminal.
        if (position === 1 /* ScrollPosition.Middle */) {
            return Math.max(marker.line - Math.floor(terminal.rows / 4), 0);
        }
        return marker.line;
    }
    _isMarkerInViewport(terminal, marker) {
        const viewportY = terminal.buffer.active.viewportY;
        return marker.line >= viewportY && marker.line < viewportY + terminal.rows;
    }
    scrollToClosestMarker(startMarkerId, endMarkerId, highlight) {
        const detectionCapability = this._capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
        if (!detectionCapability) {
            return;
        }
        const startMarker = detectionCapability.getMark(startMarkerId);
        if (!startMarker) {
            return;
        }
        const endMarker = endMarkerId ? detectionCapability.getMark(endMarkerId) : startMarker;
        this._scrollToMarker(startMarker, 0 /* ScrollPosition.Top */, endMarker, !highlight);
    }
    selectToPreviousMark() {
        if (!this._terminal) {
            return;
        }
        if (this._selectionStart === null) {
            this._selectionStart = this._currentMarker;
        }
        if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, true);
        }
        else {
            this.scrollToPreviousMark(1 /* ScrollPosition.Middle */, true, false);
        }
        selectLines(this._terminal, this._currentMarker, this._selectionStart);
    }
    selectToNextMark() {
        if (!this._terminal) {
            return;
        }
        if (this._selectionStart === null) {
            this._selectionStart = this._currentMarker;
        }
        if (this._capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, true);
        }
        else {
            this.scrollToNextMark(1 /* ScrollPosition.Middle */, true, false);
        }
        selectLines(this._terminal, this._currentMarker, this._selectionStart);
    }
    selectToPreviousLine() {
        if (!this._terminal) {
            return;
        }
        if (this._selectionStart === null) {
            this._selectionStart = this._currentMarker;
        }
        this.scrollToPreviousLine(this._terminal, 1 /* ScrollPosition.Middle */, true);
        selectLines(this._terminal, this._currentMarker, this._selectionStart);
    }
    selectToNextLine() {
        if (!this._terminal) {
            return;
        }
        if (this._selectionStart === null) {
            this._selectionStart = this._currentMarker;
        }
        this.scrollToNextLine(this._terminal, 1 /* ScrollPosition.Middle */, true);
        selectLines(this._terminal, this._currentMarker, this._selectionStart);
    }
    scrollToPreviousLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
        if (!retainSelection) {
            this._selectionStart = null;
        }
        if (this._currentMarker === Boundary.Top) {
            xterm.scrollToTop();
            return;
        }
        if (this._currentMarker === Boundary.Bottom) {
            this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) - 1);
        }
        else {
            const offset = this._getOffset(xterm);
            if (this._isDisposable) {
                this._currentMarker.dispose();
            }
            this._currentMarker = this._registerMarkerOrThrow(xterm, offset - 1);
        }
        this._isDisposable = true;
        this._scrollToMarker(this._currentMarker, scrollPosition);
    }
    scrollToNextLine(xterm, scrollPosition = 1 /* ScrollPosition.Middle */, retainSelection = false) {
        if (!retainSelection) {
            this._selectionStart = null;
        }
        if (this._currentMarker === Boundary.Bottom) {
            xterm.scrollToBottom();
            return;
        }
        if (this._currentMarker === Boundary.Top) {
            this._currentMarker = this._registerMarkerOrThrow(xterm, this._getOffset(xterm) + 1);
        }
        else {
            const offset = this._getOffset(xterm);
            if (this._isDisposable) {
                this._currentMarker.dispose();
            }
            this._currentMarker = this._registerMarkerOrThrow(xterm, offset + 1);
        }
        this._isDisposable = true;
        this._scrollToMarker(this._currentMarker, scrollPosition);
    }
    _registerMarkerOrThrow(xterm, cursorYOffset) {
        const marker = xterm.registerMarker(cursorYOffset);
        if (!marker) {
            throw new Error(`Could not create marker for ${cursorYOffset}`);
        }
        return marker;
    }
    _getOffset(xterm) {
        if (this._currentMarker === Boundary.Bottom) {
            return 0;
        }
        else if (this._currentMarker === Boundary.Top) {
            return 0 - (xterm.buffer.active.baseY + xterm.buffer.active.cursorY);
        }
        else {
            let offset = getLine(xterm, this._currentMarker);
            offset -= xterm.buffer.active.baseY + xterm.buffer.active.cursorY;
            return offset;
        }
    }
    _findPreviousMarker(xterm, skipEmptyCommands = false) {
        if (this._currentMarker === Boundary.Top) {
            return 0;
        }
        else if (this._currentMarker === Boundary.Bottom) {
            return this._getMarkers(skipEmptyCommands).length - 1;
        }
        let i;
        for (i = this._getMarkers(skipEmptyCommands).length - 1; i >= 0; i--) {
            if (this._getMarkers(skipEmptyCommands)[i].line < this._currentMarker.line) {
                return i;
            }
        }
        return -1;
    }
    _findNextMarker(xterm, skipEmptyCommands = false) {
        if (this._currentMarker === Boundary.Top) {
            return 0;
        }
        else if (this._currentMarker === Boundary.Bottom) {
            return this._getMarkers(skipEmptyCommands).length - 1;
        }
        let i;
        for (i = 0; i < this._getMarkers(skipEmptyCommands).length; i++) {
            if (this._getMarkers(skipEmptyCommands)[i].line > this._currentMarker.line) {
                return i;
            }
        }
        return this._getMarkers(skipEmptyCommands).length;
    }
};
MarkNavigationAddon = __decorate([
    __param(1, IThemeService)
], MarkNavigationAddon);
export { MarkNavigationAddon };
export function getLine(xterm, marker) {
    // Use the _second last_ row as the last row is likely the prompt
    if (marker === Boundary.Bottom) {
        return xterm.buffer.active.baseY + xterm.rows - 1;
    }
    if (marker === Boundary.Top) {
        return 0;
    }
    return marker.line;
}
export function selectLines(xterm, start, end) {
    if (end === null) {
        end = Boundary.Bottom;
    }
    let startLine = getLine(xterm, start);
    let endLine = getLine(xterm, end);
    if (startLine > endLine) {
        const temp = startLine;
        startLine = endLine;
        endLine = temp;
    }
    // Subtract a line as the marker is on the line the command run, we do not want the next
    // command in the selection for the current command
    endLine -= 1;
    xterm.selectLines(startLine, endLine);
}
