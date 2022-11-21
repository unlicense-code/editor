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
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { TERMINAL_VIEW_ID } from 'vs/workbench/contrib/terminal/common/terminal';
import { isSafari } from 'vs/base/browser/browser';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { MarkNavigationAddon } from 'vs/workbench/contrib/terminal/browser/xterm/markNavigationAddon';
import { localize } from 'vs/nls';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { editorBackground } from 'vs/platform/theme/common/colorRegistry';
import { PANEL_BACKGROUND, SIDE_BAR_BACKGROUND } from 'vs/workbench/common/theme';
import { TERMINAL_FOREGROUND_COLOR, TERMINAL_BACKGROUND_COLOR, TERMINAL_CURSOR_FOREGROUND_COLOR, TERMINAL_CURSOR_BACKGROUND_COLOR, ansiColorIdentifiers, TERMINAL_SELECTION_BACKGROUND_COLOR, TERMINAL_FIND_MATCH_BACKGROUND_COLOR, TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR, TERMINAL_FIND_MATCH_BORDER_COLOR, TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR, TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR, TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR, TERMINAL_SELECTION_FOREGROUND_COLOR, TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR } from 'vs/workbench/contrib/terminal/common/terminalColorRegistry';
import { ShellIntegrationAddon } from 'vs/platform/terminal/common/xterm/shellIntegrationAddon';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { DecorationAddon } from 'vs/workbench/contrib/terminal/browser/xterm/decorationAddon';
import { Emitter } from 'vs/base/common/event';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
// How long in milliseconds should an average frame take to render for a notification to appear
// which suggests the fallback DOM-based renderer
const SLOW_CANVAS_RENDER_THRESHOLD = 50;
const NUMBER_OF_FRAMES_TO_MEASURE = 20;
const SMOOTH_SCROLL_DURATION = 125;
let CanvasAddon;
let SearchAddon;
let SerializeAddon;
let Unicode11Addon;
let WebglAddon;
function getFullBufferLineAsString(lineIndex, buffer) {
    let line = buffer.getLine(lineIndex);
    if (!line) {
        return { lineData: undefined, lineIndex };
    }
    let lineData = line.translateToString(true);
    while (lineIndex > 0 && line.isWrapped) {
        line = buffer.getLine(--lineIndex);
        if (!line) {
            break;
        }
        lineData = line.translateToString(false) + lineData;
    }
    return { lineData, lineIndex };
}
// DEBUG: This helper can be used to draw image data to the console, it's commented out as we don't
//        want to ship it, but this is very useful for investigating texture atlas issues.
// (console as any).image = (source: ImageData | HTMLCanvasElement, scale: number = 1) => {
// 	function getBox(width: number, height: number) {
// 		return {
// 			string: '+',
// 			style: 'font-size: 1px; padding: ' + Math.floor(height/2) + 'px ' + Math.floor(width/2) + 'px; line-height: ' + height + 'px;'
// 		};
// 	}
// 	if (source instanceof HTMLCanvasElement) {
// 		source = source.getContext('2d')?.getImageData(0, 0, source.width, source.height)!;
// 	}
// 	const canvas = document.createElement('canvas');
// 	canvas.width = source.width;
// 	canvas.height = source.height;
// 	const ctx = canvas.getContext('2d')!;
// 	ctx.putImageData(source, 0, 0);
// 	const sw = source.width * scale;
// 	const sh = source.height * scale;
// 	const dim = getBox(sw, sh);
// 	console.log(
// 		`Image: ${source.width} x ${source.height}\n%c${dim.string}`,
// 		`${dim.style}background: url(${canvas.toDataURL()}); background-size: ${sw}px ${sh}px; background-repeat: no-repeat; color: transparent;`
// 	);
// 	console.groupCollapsed('Zoomed');
// 	console.log(
// 		`%c${dim.string}`,
// 		`${getBox(sw * 10, sh * 10).style}background: url(${canvas.toDataURL()}); background-size: ${sw * 10}px ${sh * 10}px; background-repeat: no-repeat; color: transparent; image-rendering: pixelated;-ms-interpolation-mode: nearest-neighbor;`
// 	);
// 	console.groupEnd();
// };
/**
 * Wraps the xterm object with additional functionality. Interaction with the backing process is out
 * of the scope of this class.
 */
let XtermTerminal = class XtermTerminal extends DisposableStore {
    _configHelper;
    _capabilities;
    _configurationService;
    _instantiationService;
    _logService;
    _notificationService;
    _storageService;
    _themeService;
    _viewDescriptorService;
    _telemetryService;
    /** The raw xterm.js instance */
    raw;
    *getBufferReverseIterator() {
        for (let i = this.raw.buffer.active.length; i >= 0; i--) {
            const { lineData, lineIndex } = getFullBufferLineAsString(i, this.raw.buffer.active);
            if (lineData) {
                i = lineIndex;
                yield lineData;
            }
        }
    }
    _core;
    static _suggestedRendererType = undefined;
    _container;
    // Always on addons
    _markNavigationAddon;
    _shellIntegrationAddon;
    _decorationAddon;
    // Optional addons
    _canvasAddon;
    _searchAddon;
    _unicode11Addon;
    _webglAddon;
    _serializeAddon;
    _lastFindResult;
    get findResult() { return this._lastFindResult; }
    _onDidRequestRunCommand = new Emitter();
    onDidRequestRunCommand = this._onDidRequestRunCommand.event;
    _onDidRequestFreePort = new Emitter();
    onDidRequestFreePort = this._onDidRequestFreePort.event;
    _onDidChangeFindResults = new Emitter();
    onDidChangeFindResults = this._onDidChangeFindResults.event;
    _onDidChangeSelection = new Emitter();
    onDidChangeSelection = this._onDidChangeSelection.event;
    get markTracker() { return this._markNavigationAddon; }
    get shellIntegration() { return this._shellIntegrationAddon; }
    _target;
    set target(location) {
        this._target = location;
    }
    get target() { return this._target; }
    get textureAtlas() {
        const canvas = this._webglAddon?.textureAtlas || this._canvasAddon?.textureAtlas;
        if (!canvas) {
            return undefined;
        }
        return createImageBitmap(canvas);
    }
    /**
     * @param xtermCtor The xterm.js constructor, this is passed in so it can be fetched lazily
     * outside of this class such that {@link raw} is not nullable.
     */
    constructor(xtermCtor, _configHelper, cols, rows, location, _capabilities, disableShellIntegrationReporting, _configurationService, _instantiationService, _logService, _notificationService, _storageService, _themeService, _viewDescriptorService, _telemetryService) {
        super();
        this._configHelper = _configHelper;
        this._capabilities = _capabilities;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._notificationService = _notificationService;
        this._storageService = _storageService;
        this._themeService = _themeService;
        this._viewDescriptorService = _viewDescriptorService;
        this._telemetryService = _telemetryService;
        this.target = location;
        const font = this._configHelper.getFont(undefined, true);
        const config = this._configHelper.config;
        const editorOptions = this._configurationService.getValue('editor');
        this.raw = this.add(new xtermCtor({
            allowProposedApi: true,
            cols,
            rows,
            altClickMovesCursor: config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt',
            scrollback: config.scrollback,
            theme: this._getXtermTheme(),
            drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
            fontFamily: font.fontFamily,
            fontWeight: config.fontWeight,
            fontWeightBold: config.fontWeightBold,
            fontSize: font.fontSize,
            letterSpacing: font.letterSpacing,
            lineHeight: font.lineHeight,
            minimumContrastRatio: config.minimumContrastRatio,
            cursorBlink: config.cursorBlinking,
            cursorStyle: config.cursorStyle === 'line' ? 'bar' : config.cursorStyle,
            cursorWidth: config.cursorWidth,
            macOptionIsMeta: config.macOptionIsMeta,
            macOptionClickForcesSelection: config.macOptionClickForcesSelection,
            rightClickSelectsWord: config.rightClickBehavior === 'selectWord',
            fastScrollModifier: 'alt',
            fastScrollSensitivity: config.fastScrollSensitivity,
            scrollSensitivity: config.mouseWheelScrollSensitivity,
            wordSeparator: config.wordSeparators,
            overviewRulerWidth: 10,
            smoothScrollDuration: config.smoothScrolling ? SMOOTH_SCROLL_DURATION : 0
        }));
        this._core = this.raw._core;
        this.add(this._configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */)) {
                XtermTerminal._suggestedRendererType = undefined;
            }
            if (e.affectsConfiguration('terminal.integrated') || e.affectsConfiguration('editor.fastScrollSensitivity') || e.affectsConfiguration('editor.mouseWheelScrollSensitivity') || e.affectsConfiguration('editor.multiCursorModifier')) {
                this.updateConfig();
            }
            if (e.affectsConfiguration("terminal.integrated.unicodeVersion" /* TerminalSettingId.UnicodeVersion */)) {
                this._updateUnicodeVersion();
            }
        }));
        this.add(this._themeService.onDidColorThemeChange(theme => this._updateTheme(theme)));
        this.add(this._viewDescriptorService.onDidChangeLocation(({ views }) => {
            if (views.some(v => v.id === TERMINAL_VIEW_ID)) {
                this._updateTheme();
                this._decorationAddon.refreshLayouts();
            }
        }));
        // Refire events
        this.add(this.raw.onSelectionChange(() => this._onDidChangeSelection.fire()));
        // Load addons
        this._updateUnicodeVersion();
        this._markNavigationAddon = this._instantiationService.createInstance(MarkNavigationAddon, _capabilities);
        this.raw.loadAddon(this._markNavigationAddon);
        this._decorationAddon = this._instantiationService.createInstance(DecorationAddon, this._capabilities);
        this._decorationAddon.onDidRequestRunCommand(e => this._onDidRequestRunCommand.fire(e));
        this.raw.loadAddon(this._decorationAddon);
        this._shellIntegrationAddon = this._instantiationService.createInstance(ShellIntegrationAddon, disableShellIntegrationReporting, this._telemetryService);
        this.raw.loadAddon(this._shellIntegrationAddon);
    }
    async getSelectionAsHtml(command) {
        if (!this._serializeAddon) {
            const Addon = await this._getSerializeAddonConstructor();
            this._serializeAddon = new Addon();
            this.raw.loadAddon(this._serializeAddon);
        }
        if (command) {
            const length = command.getOutput()?.length;
            const row = command.marker?.line;
            if (!length || !row) {
                throw new Error(`No row ${row} or output length ${length} for command ${command}`);
            }
            await this.raw.select(0, row + 1, length - Math.floor(length / this.raw.cols));
        }
        const result = this._serializeAddon.serializeAsHTML({ onlySelection: true });
        if (command) {
            this.raw.clearSelection();
        }
        return result;
    }
    attachToElement(container) {
        // Update the theme when attaching as the terminal location could have changed
        this._updateTheme();
        if (!this._container) {
            this.raw.open(container);
        }
        // TODO: Move before open to the DOM renderer doesn't initialize
        if (this._shouldLoadWebgl()) {
            this._enableWebglRenderer();
        }
        else if (this._shouldLoadCanvas()) {
            this._enableCanvasRenderer();
        }
        this._container = container;
        // Screen must be created at this point as xterm.open is called
        return this._container.querySelector('.xterm-screen');
    }
    updateConfig() {
        const config = this._configHelper.config;
        this.raw.options.altClickMovesCursor = config.altClickMovesCursor;
        this._setCursorBlink(config.cursorBlinking);
        this._setCursorStyle(config.cursorStyle);
        this._setCursorWidth(config.cursorWidth);
        this.raw.options.scrollback = config.scrollback;
        this.raw.options.drawBoldTextInBrightColors = config.drawBoldTextInBrightColors;
        this.raw.options.minimumContrastRatio = config.minimumContrastRatio;
        this.raw.options.fastScrollSensitivity = config.fastScrollSensitivity;
        this.raw.options.scrollSensitivity = config.mouseWheelScrollSensitivity;
        this.raw.options.macOptionIsMeta = config.macOptionIsMeta;
        const editorOptions = this._configurationService.getValue('editor');
        this.raw.options.altClickMovesCursor = config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt';
        this.raw.options.macOptionClickForcesSelection = config.macOptionClickForcesSelection;
        this.raw.options.rightClickSelectsWord = config.rightClickBehavior === 'selectWord';
        this.raw.options.wordSeparator = config.wordSeparators;
        this.raw.options.customGlyphs = config.customGlyphs;
        this.raw.options.smoothScrollDuration = config.smoothScrolling ? SMOOTH_SCROLL_DURATION : 0;
        if (this._shouldLoadWebgl()) {
            this._enableWebglRenderer();
        }
        else {
            this._disposeOfWebglRenderer();
            if (this._shouldLoadCanvas()) {
                this._enableCanvasRenderer();
            }
            else {
                this._disposeOfCanvasRenderer();
            }
        }
    }
    _shouldLoadWebgl() {
        return !isSafari && (this._configHelper.config.gpuAcceleration === 'auto' && XtermTerminal._suggestedRendererType === undefined) || this._configHelper.config.gpuAcceleration === 'on';
    }
    _shouldLoadCanvas() {
        return (this._configHelper.config.gpuAcceleration === 'auto' && (XtermTerminal._suggestedRendererType === undefined || XtermTerminal._suggestedRendererType === 'canvas')) || this._configHelper.config.gpuAcceleration === 'canvas';
    }
    forceRedraw() {
        this.raw.clearTextureAtlas();
    }
    clearDecorations() {
        this._decorationAddon?.clearDecorations();
    }
    forceRefresh() {
        this._core.viewport?._innerRefresh();
    }
    forceUnpause() {
        // HACK: Force the renderer to unpause by simulating an IntersectionObserver event.
        // This is to fix an issue where dragging the windpow to the top of the screen to
        // maximize on Windows/Linux would fire an event saying that the terminal was not
        // visible.
        if (!!this._canvasAddon) {
            this._core._renderService?._handleIntersectionChange({ intersectionRatio: 1 });
            // HACK: Force a refresh of the screen to ensure links are refresh corrected.
            // This can probably be removed when the above hack is fixed in Chromium.
            this.raw.refresh(0, this.raw.rows - 1);
        }
    }
    async findNext(term, searchOptions) {
        this._updateFindColors(searchOptions);
        return (await this._getSearchAddon()).findNext(term, searchOptions);
    }
    async findPrevious(term, searchOptions) {
        this._updateFindColors(searchOptions);
        return (await this._getSearchAddon()).findPrevious(term, searchOptions);
    }
    _updateFindColors(searchOptions) {
        const theme = this._themeService.getColorTheme();
        // Theme color names align with monaco/vscode whereas xterm.js has some different naming.
        // The mapping is as follows:
        // - findMatch -> activeMatch
        // - findMatchHighlight -> match
        const terminalBackground = theme.getColor(TERMINAL_BACKGROUND_COLOR) || theme.getColor(PANEL_BACKGROUND);
        const findMatchBackground = theme.getColor(TERMINAL_FIND_MATCH_BACKGROUND_COLOR);
        const findMatchBorder = theme.getColor(TERMINAL_FIND_MATCH_BORDER_COLOR);
        const findMatchOverviewRuler = theme.getColor(TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR);
        const findMatchHighlightBackground = theme.getColor(TERMINAL_FIND_MATCH_HIGHLIGHT_BACKGROUND_COLOR);
        const findMatchHighlightBorder = theme.getColor(TERMINAL_FIND_MATCH_HIGHLIGHT_BORDER_COLOR);
        const findMatchHighlightOverviewRuler = theme.getColor(TERMINAL_OVERVIEW_RULER_FIND_MATCH_FOREGROUND_COLOR);
        searchOptions.decorations = {
            activeMatchBackground: findMatchBackground?.toString(),
            activeMatchBorder: findMatchBorder?.toString() || 'transparent',
            activeMatchColorOverviewRuler: findMatchOverviewRuler?.toString() || 'transparent',
            // decoration bgs don't support the alpha channel so blend it with the regular bg
            matchBackground: terminalBackground ? findMatchHighlightBackground?.blend(terminalBackground).toString() : undefined,
            matchBorder: findMatchHighlightBorder?.toString() || 'transparent',
            matchOverviewRuler: findMatchHighlightOverviewRuler?.toString() || 'transparent'
        };
    }
    async _getSearchAddon() {
        if (this._searchAddon) {
            return this._searchAddon;
        }
        const AddonCtor = await this._getSearchAddonConstructor();
        this._searchAddon = new AddonCtor();
        this.raw.loadAddon(this._searchAddon);
        this._searchAddon.onDidChangeResults((results) => {
            this._lastFindResult = results;
            this._onDidChangeFindResults.fire(results);
        });
        return this._searchAddon;
    }
    clearSearchDecorations() {
        this._searchAddon?.clearDecorations();
    }
    clearActiveSearchDecoration() {
        this._searchAddon?.clearActiveDecoration();
    }
    getFont() {
        return this._configHelper.getFont(this._core);
    }
    getLongestViewportWrappedLineLength() {
        let maxLineLength = 0;
        for (let i = this.raw.buffer.active.length - 1; i >= this.raw.buffer.active.viewportY; i--) {
            const lineInfo = this._getWrappedLineCount(i, this.raw.buffer.active);
            maxLineLength = Math.max(maxLineLength, ((lineInfo.lineCount * this.raw.cols) - lineInfo.endSpaces) || 0);
            i = lineInfo.currentIndex;
        }
        return maxLineLength;
    }
    _getWrappedLineCount(index, buffer) {
        let line = buffer.getLine(index);
        if (!line) {
            throw new Error('Could not get line');
        }
        let currentIndex = index;
        let endSpaces = 0;
        // line.length may exceed cols as it doesn't necessarily trim the backing array on resize
        for (let i = Math.min(line.length, this.raw.cols) - 1; i >= 0; i--) {
            if (!line?.getCell(i)?.getChars()) {
                endSpaces++;
            }
            else {
                break;
            }
        }
        while (line?.isWrapped && currentIndex > 0) {
            currentIndex--;
            line = buffer.getLine(currentIndex);
        }
        return { lineCount: index - currentIndex + 1, currentIndex, endSpaces };
    }
    scrollDownLine() {
        this.raw.scrollLines(1);
    }
    scrollDownPage() {
        this.raw.scrollPages(1);
    }
    scrollToBottom() {
        this.raw.scrollToBottom();
    }
    scrollUpLine() {
        this.raw.scrollLines(-1);
    }
    scrollUpPage() {
        this.raw.scrollPages(-1);
    }
    scrollToTop() {
        this.raw.scrollToTop();
    }
    clearBuffer() {
        this.raw.clear();
        // xterm.js does not clear the first prompt, so trigger these to simulate
        // the prompt being written
        this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.handlePromptStart();
        this._capabilities.get(2 /* TerminalCapability.CommandDetection */)?.handleCommandStart();
    }
    _setCursorBlink(blink) {
        if (this.raw.options.cursorBlink !== blink) {
            this.raw.options.cursorBlink = blink;
            this.raw.refresh(0, this.raw.rows - 1);
        }
    }
    _setCursorStyle(style) {
        if (this.raw.options.cursorStyle !== style) {
            // 'line' is used instead of bar in VS Code to be consistent with editor.cursorStyle
            this.raw.options.cursorStyle = (style === 'line') ? 'bar' : style;
        }
    }
    _setCursorWidth(width) {
        if (this.raw.options.cursorWidth !== width) {
            this.raw.options.cursorWidth = width;
        }
    }
    async _enableWebglRenderer() {
        if (!this.raw.element || this._webglAddon) {
            return;
        }
        const Addon = await this._getWebglAddonConstructor();
        this._webglAddon = new Addon();
        this._disposeOfCanvasRenderer();
        try {
            this.raw.loadAddon(this._webglAddon);
            this._logService.trace('Webgl was loaded');
            this._webglAddon.onContextLoss(() => {
                this._logService.info(`Webgl lost context, disposing of webgl renderer`);
                this._disposeOfWebglRenderer();
            });
            // Uncomment to add the texture atlas to the DOM
            // setTimeout(() => {
            // 	if (this._webglAddon?.textureAtlas) {
            // 		document.body.appendChild(this._webglAddon?.textureAtlas);
            // 	}
            // }, 5000);
        }
        catch (e) {
            this._logService.warn(`Webgl could not be loaded. Falling back to the canvas renderer type.`, e);
            const neverMeasureRenderTime = this._storageService.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
            // if it's already set to dom, no need to measure render time
            if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                this._measureRenderTime();
            }
            XtermTerminal._suggestedRendererType = 'canvas';
            this._disposeOfWebglRenderer();
            this._enableCanvasRenderer();
        }
    }
    async _enableCanvasRenderer() {
        if (!this.raw.element || this._canvasAddon) {
            return;
        }
        const Addon = await this._getCanvasAddonConstructor();
        this._canvasAddon = new Addon();
        this._disposeOfWebglRenderer();
        try {
            this.raw.loadAddon(this._canvasAddon);
            this._logService.trace('Canvas was loaded');
        }
        catch (e) {
            this._logService.warn(`Canvas could not be loaded. Falling back to the dom renderer type.`, e);
            const neverMeasureRenderTime = this._storageService.getBoolean("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, -1 /* StorageScope.APPLICATION */, false);
            // if it's already set to dom, no need to measure render time
            if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                this._measureRenderTime();
            }
            XtermTerminal._suggestedRendererType = 'dom';
            this._disposeOfCanvasRenderer();
        }
    }
    async _getCanvasAddonConstructor() {
        if (!CanvasAddon) {
            CanvasAddon = (await import('xterm-addon-canvas')).CanvasAddon;
        }
        return CanvasAddon;
    }
    async _getSearchAddonConstructor() {
        if (!SearchAddon) {
            SearchAddon = (await import('xterm-addon-search')).SearchAddon;
        }
        return SearchAddon;
    }
    async _getUnicode11Constructor() {
        if (!Unicode11Addon) {
            Unicode11Addon = (await import('xterm-addon-unicode11')).Unicode11Addon;
        }
        return Unicode11Addon;
    }
    async _getWebglAddonConstructor() {
        if (!WebglAddon) {
            WebglAddon = (await import('xterm-addon-webgl')).WebglAddon;
        }
        return WebglAddon;
    }
    async _getSerializeAddonConstructor() {
        if (!SerializeAddon) {
            SerializeAddon = (await import('xterm-addon-serialize')).SerializeAddon;
        }
        return SerializeAddon;
    }
    _disposeOfCanvasRenderer() {
        try {
            this._canvasAddon?.dispose();
        }
        catch {
            // ignore
        }
        this._canvasAddon = undefined;
    }
    _disposeOfWebglRenderer() {
        try {
            this._webglAddon?.dispose();
        }
        catch {
            // ignore
        }
        this._webglAddon = undefined;
    }
    async _measureRenderTime() {
        const frameTimes = [];
        if (!this._core._renderService?._renderer._renderLayers) {
            return;
        }
        const textRenderLayer = this._core._renderService._renderer._renderLayers[0];
        const originalOnGridChanged = textRenderLayer?.onGridChanged;
        const evaluateCanvasRenderer = () => {
            // Discard first frame time as it's normal to take longer
            frameTimes.shift();
            const medianTime = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length / 2)];
            if (medianTime > SLOW_CANVAS_RENDER_THRESHOLD) {
                if (this._configHelper.config.gpuAcceleration === 'auto') {
                    XtermTerminal._suggestedRendererType = 'dom';
                    this.updateConfig();
                }
                else {
                    const promptChoices = [
                        {
                            label: localize('yes', "Yes"),
                            run: () => this._configurationService.updateValue("terminal.integrated.gpuAcceleration" /* TerminalSettingId.GpuAcceleration */, 'off', 2 /* ConfigurationTarget.USER */)
                        },
                        {
                            label: localize('no', "No"),
                            run: () => { }
                        },
                        {
                            label: localize('dontShowAgain', "Don't Show Again"),
                            isSecondary: true,
                            run: () => this._storageService.store("terminal.integrated.neverMeasureRenderTime" /* TerminalStorageKeys.NeverMeasureRenderTime */, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */)
                        }
                    ];
                    this._notificationService.prompt(Severity.Warning, localize('terminal.slowRendering', 'Terminal GPU acceleration appears to be slow on your computer. Would you like to switch to disable it which may improve performance? [Read more about terminal settings](https://code.visualstudio.com/docs/editor/integrated-terminal#_changing-how-the-terminal-is-rendered).'), promptChoices);
                }
            }
        };
        textRenderLayer.onGridChanged = (terminal, firstRow, lastRow) => {
            const startTime = performance.now();
            originalOnGridChanged.call(textRenderLayer, terminal, firstRow, lastRow);
            frameTimes.push(performance.now() - startTime);
            if (frameTimes.length === NUMBER_OF_FRAMES_TO_MEASURE) {
                evaluateCanvasRenderer();
                // Restore original function
                textRenderLayer.onGridChanged = originalOnGridChanged;
            }
        };
    }
    _getXtermTheme(theme) {
        if (!theme) {
            theme = this._themeService.getColorTheme();
        }
        const location = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID);
        const foregroundColor = theme.getColor(TERMINAL_FOREGROUND_COLOR);
        let backgroundColor;
        if (this.target === TerminalLocation.Editor) {
            backgroundColor = theme.getColor(TERMINAL_BACKGROUND_COLOR) || theme.getColor(editorBackground);
        }
        else {
            backgroundColor = theme.getColor(TERMINAL_BACKGROUND_COLOR) || (location === 1 /* ViewContainerLocation.Panel */ ? theme.getColor(PANEL_BACKGROUND) : theme.getColor(SIDE_BAR_BACKGROUND));
        }
        const cursorColor = theme.getColor(TERMINAL_CURSOR_FOREGROUND_COLOR) || foregroundColor;
        const cursorAccentColor = theme.getColor(TERMINAL_CURSOR_BACKGROUND_COLOR) || backgroundColor;
        const selectionBackgroundColor = theme.getColor(TERMINAL_SELECTION_BACKGROUND_COLOR);
        const selectionInactiveBackgroundColor = theme.getColor(TERMINAL_INACTIVE_SELECTION_BACKGROUND_COLOR);
        const selectionForegroundColor = theme.getColor(TERMINAL_SELECTION_FOREGROUND_COLOR) || undefined;
        return {
            background: backgroundColor?.toString(),
            foreground: foregroundColor?.toString(),
            cursor: cursorColor?.toString(),
            cursorAccent: cursorAccentColor?.toString(),
            selectionBackground: selectionBackgroundColor?.toString(),
            selectionInactiveBackground: selectionInactiveBackgroundColor?.toString(),
            selectionForeground: selectionForegroundColor?.toString(),
            black: theme.getColor(ansiColorIdentifiers[0])?.toString(),
            red: theme.getColor(ansiColorIdentifiers[1])?.toString(),
            green: theme.getColor(ansiColorIdentifiers[2])?.toString(),
            yellow: theme.getColor(ansiColorIdentifiers[3])?.toString(),
            blue: theme.getColor(ansiColorIdentifiers[4])?.toString(),
            magenta: theme.getColor(ansiColorIdentifiers[5])?.toString(),
            cyan: theme.getColor(ansiColorIdentifiers[6])?.toString(),
            white: theme.getColor(ansiColorIdentifiers[7])?.toString(),
            brightBlack: theme.getColor(ansiColorIdentifiers[8])?.toString(),
            brightRed: theme.getColor(ansiColorIdentifiers[9])?.toString(),
            brightGreen: theme.getColor(ansiColorIdentifiers[10])?.toString(),
            brightYellow: theme.getColor(ansiColorIdentifiers[11])?.toString(),
            brightBlue: theme.getColor(ansiColorIdentifiers[12])?.toString(),
            brightMagenta: theme.getColor(ansiColorIdentifiers[13])?.toString(),
            brightCyan: theme.getColor(ansiColorIdentifiers[14])?.toString(),
            brightWhite: theme.getColor(ansiColorIdentifiers[15])?.toString()
        };
    }
    _updateTheme(theme) {
        this.raw.options.theme = this._getXtermTheme(theme);
    }
    async _updateUnicodeVersion() {
        if (!this._unicode11Addon && this._configHelper.config.unicodeVersion === '11') {
            const Addon = await this._getUnicode11Constructor();
            this._unicode11Addon = new Addon();
            this.raw.loadAddon(this._unicode11Addon);
        }
        if (this.raw.unicode.activeVersion !== this._configHelper.config.unicodeVersion) {
            this.raw.unicode.activeVersion = this._configHelper.config.unicodeVersion;
        }
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _writeText(data) {
        this.raw.write(data);
    }
};
XtermTerminal = __decorate([
    __param(7, IConfigurationService),
    __param(8, IInstantiationService),
    __param(9, ILogService),
    __param(10, INotificationService),
    __param(11, IStorageService),
    __param(12, IThemeService),
    __param(13, IViewDescriptorService),
    __param(14, ITelemetryService)
], XtermTerminal);
export { XtermTerminal };
