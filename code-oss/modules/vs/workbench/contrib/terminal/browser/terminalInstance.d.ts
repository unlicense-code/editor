import * as dom from 'vs/base/browser/dom';
import { Event } from 'vs/base/common/event';
import { Lazy } from 'vs/base/common/lazy';
import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { OperatingSystem } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IProductService } from 'vs/platform/product/common/productService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IMarkProperties, ITerminalCommand } from 'vs/platform/terminal/common/capabilities/capabilities';
import { TerminalCapabilityStoreMultiplexer } from 'vs/platform/terminal/common/capabilities/terminalCapabilityStore';
import { IReconnectionProperties, IShellLaunchConfig, ITerminalDimensionsOverride, ITerminalLaunchError, TerminalExitReason, TerminalIcon, TerminalLocation, TerminalShellType, TitleEventSource } from 'vs/platform/terminal/common/terminal';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IWorkspaceTrustRequestService } from 'vs/platform/workspace/common/workspaceTrust';
import { IViewsService } from 'vs/workbench/common/views';
import { IRequestAddInstanceToGroupEvent, ITerminalQuickFixOptions, ITerminalExternalLinkProvider, ITerminalInstance } from 'vs/workbench/contrib/terminal/browser/terminal';
import { TerminalConfigHelper } from 'vs/workbench/contrib/terminal/browser/terminalConfigHelper';
import { TerminalFindWidget } from 'vs/workbench/contrib/terminal/browser/terminalFindWidget';
import { TerminalProcessManager } from 'vs/workbench/contrib/terminal/browser/terminalProcessManager';
import { ITerminalStatusList } from 'vs/workbench/contrib/terminal/browser/terminalStatusList';
import { ITerminalQuickFix } from 'vs/workbench/contrib/terminal/browser/xterm/quickFixAddon';
import { XtermTerminal } from 'vs/workbench/contrib/terminal/browser/xterm/xtermTerminal';
import { INavigationMode, ITerminalProcessManager, ITerminalProfileResolverService, ProcessState } from 'vs/workbench/contrib/terminal/common/terminal';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IPreferencesService } from 'vs/workbench/services/preferences/common/preferences';
import type { IMarker } from 'xterm';
import { IAudioCueService } from 'vs/platform/audioCues/browser/audioCueService';
export declare class TerminalInstance extends Disposable implements ITerminalInstance {
    private readonly _terminalShellTypeContextKey;
    private readonly _terminalInRunCommandPicker;
    private readonly _configHelper;
    private _shellLaunchConfig;
    readonly contextKeyService: IContextKeyService;
    readonly instantiationService: IInstantiationService;
    private readonly _terminalProfileResolverService;
    private readonly _pathService;
    private readonly _keybindingService;
    private readonly _notificationService;
    private readonly _preferencesService;
    private readonly _viewsService;
    private readonly _clipboardService;
    private readonly _themeService;
    private readonly _configurationService;
    private readonly _logService;
    private readonly _dialogService;
    private readonly _storageService;
    private readonly _accessibilityService;
    private readonly _productService;
    private readonly _quickInputService;
    private readonly _workspaceContextService;
    private readonly _editorService;
    private readonly _workspaceTrustRequestService;
    private readonly _historyService;
    private readonly _telemetryService;
    private readonly _openerService;
    private readonly _commandService;
    private readonly _audioCueService;
    private static _lastKnownCanvasDimensions;
    private static _lastKnownGridDimensions;
    private static _instanceIdCounter;
    private readonly _scopedInstantiationService;
    readonly _processManager: ITerminalProcessManager;
    private readonly _resource;
    private _shutdownPersistentProcessId;
    private _xtermOnKey;
    private _xtermReadyPromise;
    private _xtermTypeAheadAddon;
    private _pressAnyKeyToCloseListener;
    private _instanceId;
    private _latestXtermWriteData;
    private _latestXtermParseData;
    private _isExiting;
    private _hadFocusOnExit;
    private _isVisible;
    private _isDisposed;
    private _exitCode;
    private _exitReason;
    private _skipTerminalCommands;
    private _shellType;
    private _title;
    private _titleSource;
    private _container;
    private _wrapperElement;
    private _horizontalScrollbar;
    private _terminalFocusContextKey;
    private _terminalHasFixedWidth;
    private _terminalHasTextContextKey;
    private _terminalAltBufferActiveContextKey;
    private _terminalShellIntegrationEnabledContextKey;
    private _terminalA11yTreeFocusContextKey;
    private _navigationModeActiveContextKey;
    private _cols;
    private _rows;
    private _fixedCols;
    private _fixedRows;
    private _cwd;
    private _initialCwd;
    private _layoutSettingsChanged;
    private _dimensionsOverride;
    private _areLinksReady;
    private _initialDataEvents;
    private _containerReadyBarrier;
    private _attachBarrier;
    private _icon;
    private _messageTitleDisposable;
    private _widgetManager;
    private _linkManager;
    private _environmentInfo;
    private _navigationModeAddon;
    private _dndObserver;
    private _terminalLinkQuickpick;
    private _lastLayoutDimensions;
    private _hasHadInput;
    private _description?;
    private _processName;
    private _sequence?;
    private _staticTitle?;
    private _workspaceFolder?;
    private _labelComputer?;
    private _userHome?;
    private _hasScrollBar?;
    private _target?;
    private _disableShellIntegrationReporting;
    private _usedShellIntegrationInjection;
    get usedShellIntegrationInjection(): boolean;
    private _quickFixAddon;
    readonly capabilities: TerminalCapabilityStoreMultiplexer;
    readonly statusList: ITerminalStatusList;
    /**
     * Enables opening the contextual actions, if any, that are available
     * and registering of command finished listeners
     */
    get quickFix(): ITerminalQuickFix | undefined;
    readonly findWidget: Lazy<TerminalFindWidget>;
    xterm?: XtermTerminal;
    disableLayout: boolean;
    get waitOnExit(): ITerminalInstance['waitOnExit'];
    set waitOnExit(value: ITerminalInstance['waitOnExit']);
    get target(): TerminalLocation | undefined;
    set target(value: TerminalLocation | undefined);
    get disableShellIntegrationReporting(): boolean;
    get instanceId(): number;
    get resource(): URI;
    get cols(): number;
    get rows(): number;
    get isDisposed(): boolean;
    get fixedCols(): number | undefined;
    get fixedRows(): number | undefined;
    get maxCols(): number;
    get maxRows(): number;
    get processId(): number | undefined;
    get processReady(): Promise<void>;
    get hasChildProcesses(): boolean;
    get reconnectionProperties(): IReconnectionProperties | undefined;
    get areLinksReady(): boolean;
    get initialDataEvents(): string[] | undefined;
    get exitCode(): number | undefined;
    get exitReason(): TerminalExitReason | undefined;
    get hadFocusOnExit(): boolean;
    get isTitleSetByProcess(): boolean;
    get shellLaunchConfig(): IShellLaunchConfig;
    get shellType(): TerminalShellType;
    get os(): OperatingSystem | undefined;
    get navigationMode(): INavigationMode | undefined;
    get isRemote(): boolean;
    get remoteAuthority(): string | undefined;
    get hasFocus(): boolean;
    get title(): string;
    get titleSource(): TitleEventSource;
    get icon(): TerminalIcon | undefined;
    get color(): string | undefined;
    get processName(): string;
    get sequence(): string | undefined;
    get staticTitle(): string | undefined;
    get workspaceFolder(): IWorkspaceFolder | undefined;
    get cwd(): string | undefined;
    get initialCwd(): string | undefined;
    get description(): string | undefined;
    get userHome(): string | undefined;
    private readonly _onExit;
    readonly onExit: Event<number | ITerminalLaunchError | undefined>;
    private readonly _onDisposed;
    readonly onDisposed: Event<ITerminalInstance>;
    private readonly _onProcessIdReady;
    readonly onProcessIdReady: Event<ITerminalInstance>;
    private readonly _onLinksReady;
    readonly onLinksReady: Event<ITerminalInstance>;
    private readonly _onTitleChanged;
    readonly onTitleChanged: Event<ITerminalInstance>;
    private readonly _onIconChanged;
    readonly onIconChanged: Event<{
        instance: ITerminalInstance;
        userInitiated: boolean;
    }>;
    private readonly _onData;
    readonly onData: Event<string>;
    private readonly _onBinary;
    readonly onBinary: Event<string>;
    private readonly _onLineData;
    readonly onLineData: Event<string>;
    private readonly _onRequestExtHostProcess;
    readonly onRequestExtHostProcess: Event<ITerminalInstance>;
    private readonly _onDimensionsChanged;
    readonly onDimensionsChanged: Event<void>;
    private readonly _onMaximumDimensionsChanged;
    readonly onMaximumDimensionsChanged: Event<void>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<ITerminalInstance>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<ITerminalInstance>;
    private readonly _onDidInputData;
    readonly onDidInputData: Event<ITerminalInstance>;
    private readonly _onRequestAddInstanceToGroup;
    readonly onRequestAddInstanceToGroup: Event<IRequestAddInstanceToGroupEvent>;
    private readonly _onDidChangeHasChildProcesses;
    readonly onDidChangeHasChildProcesses: Event<boolean>;
    private readonly _onDidChangeFindResults;
    readonly onDidChangeFindResults: Event<{
        resultIndex: number;
        resultCount: number;
    } | undefined>;
    private readonly _onDidFocusFindWidget;
    readonly onDidFocusFindWidget: Event<void>;
    constructor(_terminalShellTypeContextKey: IContextKey<string>, _terminalInRunCommandPicker: IContextKey<boolean>, _configHelper: TerminalConfigHelper, _shellLaunchConfig: IShellLaunchConfig, resource: URI | undefined, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, _terminalProfileResolverService: ITerminalProfileResolverService, _pathService: IPathService, _keybindingService: IKeybindingService, _notificationService: INotificationService, _preferencesService: IPreferencesService, _viewsService: IViewsService, _clipboardService: IClipboardService, _themeService: IThemeService, _configurationService: IConfigurationService, _logService: ILogService, _dialogService: IDialogService, _storageService: IStorageService, _accessibilityService: IAccessibilityService, _productService: IProductService, _quickInputService: IQuickInputService, workbenchEnvironmentService: IWorkbenchEnvironmentService, _workspaceContextService: IWorkspaceContextService, _editorService: IEditorService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _historyService: IHistoryService, _telemetryService: ITelemetryService, _openerService: IOpenerService, _commandService: ICommandService, _audioCueService: IAudioCueService);
    private _getIcon;
    private _getColor;
    registerQuickFixProvider(...options: ITerminalQuickFixOptions[]): void;
    private _initDimensions;
    /**
     * Evaluates and sets the cols and rows of the terminal if possible.
     * @param width The width of the container.
     * @param height The height of the container.
     * @return The terminal's width if it requires a layout.
     */
    private _evaluateColsAndRows;
    private _setLastKnownColsAndRows;
    private _fireMaximumDimensionsChanged;
    private _getDimension;
    set shutdownPersistentProcessId(shutdownPersistentProcessId: number | undefined);
    get persistentProcessId(): number | undefined;
    get shouldPersist(): boolean;
    /**
     * Create xterm.js instance and attach data listeners.
     */
    protected _createXterm(): Promise<XtermTerminal>;
    runCommand(commandLine: string, addNewLine: boolean): Promise<void>;
    private _loadTypeAheadAddon;
    showLinkQuickpick(extended?: boolean): Promise<void>;
    private _getLinks;
    openRecentLink(type: 'localFile' | 'url'): Promise<void>;
    runRecent(type: 'command' | 'cwd', filterMode?: 'fuzzy' | 'contiguous', value?: string): Promise<void>;
    detachFromElement(): void;
    attachToElement(container: HTMLElement): void;
    /**
     * Opens the the terminal instance inside the parent DOM element previously set with
     * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
     * invoking this function as it performs some DOM calculations internally
     */
    private _open;
    private _setFocus;
    private _setShellIntegrationContextKey;
    resetFocusContextKey(): void;
    private _initDragAndDrop;
    hasSelection(): boolean;
    copySelection(asHtml?: boolean, command?: ITerminalCommand): Promise<void>;
    get selection(): string | undefined;
    clearSelection(): void;
    selectAll(): void;
    private _refreshAltBufferContextKey;
    private _shouldPasteText;
    dispose(reason?: TerminalExitReason): void;
    detachProcessAndDispose(reason: TerminalExitReason): Promise<void>;
    focus(force?: boolean): void;
    focusWhenReady(force?: boolean): Promise<void>;
    paste(): Promise<void>;
    pasteSelection(): Promise<void>;
    sendText(text: string, addNewLine: boolean, bracketedPasteMode?: boolean): Promise<void>;
    sendPath(originalPath: string, addNewLine: boolean): Promise<void>;
    preparePathForShell(originalPath: string): Promise<string>;
    setVisible(visible: boolean): void;
    scrollDownLine(): void;
    scrollDownPage(): void;
    scrollToBottom(): void;
    scrollUpLine(): void;
    scrollUpPage(): void;
    scrollToTop(): void;
    clearBuffer(): void;
    private _refreshSelectionContextKey;
    protected _createProcessManager(): TerminalProcessManager;
    private _createProcess;
    registerMarker(): IMarker | undefined;
    addBufferMarker(properties: IMarkProperties): void;
    scrollToMark(startMarkId: string, endMarkId?: string, highlight?: boolean): void;
    freePortKillProcess(port: string, command: string): Promise<void>;
    private _onProcessData;
    /**
     * Called when either a process tied to a terminal has exited or when a terminal renderer
     * simulates a process exiting (e.g. custom execution task).
     * @param exitCode The exit code of the process, this is undefined when the terminal was exited
     * through user action.
     */
    private _onProcessExit;
    private _relaunchWithShellIntegrationDisabled;
    /**
     * Ensure write calls to xterm.js have finished before resolving.
     */
    private _flushXtermData;
    private _attachPressAnyKeyToCloseListener;
    private _writeInitialText;
    reuseTerminal(shell: IShellLaunchConfig, reset?: boolean): Promise<void>;
    setEscapeSequenceLogging(enable: boolean): Promise<void>;
    relaunch(): void;
    private _onTitleChange;
    private _trust;
    private _onKey;
    private _onSelectionChange;
    private _updateProcessCwd;
    updateConfig(): void;
    private _updateUnicodeVersion;
    updateAccessibilitySupport(): void;
    private _setCommandsToSkipShell;
    layout(dimension: dom.Dimension): void;
    private _resize;
    private _resizeNow;
    setShellType(shellType: TerminalShellType): void;
    private _setAriaLabel;
    private _updateTitleProperties;
    setOverrideDimensions(dimensions: ITerminalDimensionsOverride | undefined, immediate?: boolean): void;
    setFixedDimensions(): Promise<void>;
    private _parseFixedDimension;
    toggleSizeToContentWidth(): Promise<void>;
    private _refreshScrollbar;
    private _addScrollbar;
    private _removeScrollbar;
    private _setResolvedShellLaunchConfig;
    showEnvironmentInfoHover(): void;
    private _onEnvironmentVariableInfoChanged;
    private _refreshEnvironmentVariableInfoWidgetState;
    toggleEscapeSequenceLogging(): Promise<boolean>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    private _refreshProperty;
    private _updateProperty;
    registerLinkProvider(provider: ITerminalExternalLinkProvider): IDisposable;
    rename(title?: string): Promise<void>;
    private _setTitle;
    changeIcon(): Promise<void>;
    changeColor(): Promise<void>;
}
declare const enum TerminalLabelType {
    Title = "title",
    Description = "description"
}
export declare class TerminalLabelComputer extends Disposable {
    private readonly _configHelper;
    private readonly _instance;
    private readonly _workspaceContextService;
    private _title;
    private _description;
    get title(): string | undefined;
    get description(): string;
    private readonly _onDidChangeLabel;
    readonly onDidChangeLabel: Event<{
        title: string;
        description: string;
    }>;
    constructor(_configHelper: TerminalConfigHelper, _instance: Pick<ITerminalInstance, 'shellLaunchConfig' | 'cwd' | 'fixedCols' | 'fixedRows' | 'initialCwd' | 'processName' | 'sequence' | 'userHome' | 'workspaceFolder' | 'staticTitle' | 'capabilities' | 'title' | 'description'>, _workspaceContextService: IWorkspaceContextService);
    refreshLabel(reset?: boolean): void;
    computeLabel(labelTemplate: string, labelType: TerminalLabelType, reset?: boolean): string;
}
export declare function parseExitResult(exitCodeOrError: ITerminalLaunchError | number | undefined, shellLaunchConfig: IShellLaunchConfig, processState: ProcessState, initialCwd: string | undefined): {
    code: number | undefined;
    message: string | undefined;
} | undefined;
export {};
