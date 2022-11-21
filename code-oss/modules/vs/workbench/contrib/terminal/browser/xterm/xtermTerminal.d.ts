import type { Terminal as RawXtermTerminal } from 'xterm';
import type { CanvasAddon as CanvasAddonType } from 'xterm-addon-canvas';
import type { ISearchOptions, SearchAddon as SearchAddonType } from 'xterm-addon-search';
import type { Unicode11Addon as Unicode11AddonType } from 'xterm-addon-unicode11';
import type { WebglAddon as WebglAddonType } from 'xterm-addon-webgl';
import type { SerializeAddon as SerializeAddonType } from 'xterm-addon-serialize';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { TerminalConfigHelper } from 'vs/workbench/contrib/terminal/browser/terminalConfigHelper';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IShellIntegration, TerminalLocation } from 'vs/platform/terminal/common/terminal';
import { ITerminalFont } from 'vs/workbench/contrib/terminal/common/terminal';
import { IMarkTracker, IInternalXtermTerminal, IXtermTerminal } from 'vs/workbench/contrib/terminal/browser/terminal';
import { ILogService } from 'vs/platform/log/common/log';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ITerminalCapabilityStore, ITerminalCommand } from 'vs/platform/terminal/common/capabilities/capabilities';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
/**
 * Wraps the xterm object with additional functionality. Interaction with the backing process is out
 * of the scope of this class.
 */
export declare class XtermTerminal extends DisposableStore implements IXtermTerminal, IInternalXtermTerminal {
    private readonly _configHelper;
    private readonly _capabilities;
    private readonly _configurationService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _notificationService;
    private readonly _storageService;
    private readonly _themeService;
    private readonly _viewDescriptorService;
    private readonly _telemetryService;
    /** The raw xterm.js instance */
    readonly raw: RawXtermTerminal;
    getBufferReverseIterator(): IterableIterator<string>;
    private _core;
    private static _suggestedRendererType;
    private _container?;
    private _markNavigationAddon;
    private _shellIntegrationAddon;
    private _decorationAddon;
    private _canvasAddon?;
    private _searchAddon?;
    private _unicode11Addon?;
    private _webglAddon?;
    private _serializeAddon?;
    private _lastFindResult;
    get findResult(): {
        resultIndex: number;
        resultCount: number;
    } | undefined;
    private readonly _onDidRequestRunCommand;
    readonly onDidRequestRunCommand: import("vs/base/common/event").Event<{
        command: ITerminalCommand;
        copyAsHtml?: boolean | undefined;
        noNewLine?: boolean | undefined;
    }>;
    private readonly _onDidRequestFreePort;
    readonly onDidRequestFreePort: import("vs/base/common/event").Event<string>;
    private readonly _onDidChangeFindResults;
    readonly onDidChangeFindResults: import("vs/base/common/event").Event<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: import("vs/base/common/event").Event<void>;
    get markTracker(): IMarkTracker;
    get shellIntegration(): IShellIntegration;
    private _target;
    set target(location: TerminalLocation | undefined);
    get target(): TerminalLocation | undefined;
    get textureAtlas(): Promise<ImageBitmap> | undefined;
    /**
     * @param xtermCtor The xterm.js constructor, this is passed in so it can be fetched lazily
     * outside of this class such that {@link raw} is not nullable.
     */
    constructor(xtermCtor: typeof RawXtermTerminal, _configHelper: TerminalConfigHelper, cols: number, rows: number, location: TerminalLocation, _capabilities: ITerminalCapabilityStore, disableShellIntegrationReporting: boolean, _configurationService: IConfigurationService, _instantiationService: IInstantiationService, _logService: ILogService, _notificationService: INotificationService, _storageService: IStorageService, _themeService: IThemeService, _viewDescriptorService: IViewDescriptorService, _telemetryService: ITelemetryService);
    getSelectionAsHtml(command?: ITerminalCommand): Promise<string>;
    attachToElement(container: HTMLElement): HTMLElement;
    updateConfig(): void;
    private _shouldLoadWebgl;
    private _shouldLoadCanvas;
    forceRedraw(): void;
    clearDecorations(): void;
    forceRefresh(): void;
    forceUnpause(): void;
    findNext(term: string, searchOptions: ISearchOptions): Promise<boolean>;
    findPrevious(term: string, searchOptions: ISearchOptions): Promise<boolean>;
    private _updateFindColors;
    private _getSearchAddon;
    clearSearchDecorations(): void;
    clearActiveSearchDecoration(): void;
    getFont(): ITerminalFont;
    getLongestViewportWrappedLineLength(): number;
    private _getWrappedLineCount;
    scrollDownLine(): void;
    scrollDownPage(): void;
    scrollToBottom(): void;
    scrollUpLine(): void;
    scrollUpPage(): void;
    scrollToTop(): void;
    clearBuffer(): void;
    private _setCursorBlink;
    private _setCursorStyle;
    private _setCursorWidth;
    private _enableWebglRenderer;
    private _enableCanvasRenderer;
    protected _getCanvasAddonConstructor(): Promise<typeof CanvasAddonType>;
    protected _getSearchAddonConstructor(): Promise<typeof SearchAddonType>;
    protected _getUnicode11Constructor(): Promise<typeof Unicode11AddonType>;
    protected _getWebglAddonConstructor(): Promise<typeof WebglAddonType>;
    protected _getSerializeAddonConstructor(): Promise<typeof SerializeAddonType>;
    private _disposeOfCanvasRenderer;
    private _disposeOfWebglRenderer;
    private _measureRenderTime;
    private _getXtermTheme;
    private _updateTheme;
    private _updateUnicodeVersion;
    _writeText(data: string): void;
}
