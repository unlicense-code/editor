import { IMouseWheelEvent } from 'vs/base/browser/mouseEvent';
import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
import { WebviewThemeDataProvider } from 'vs/workbench/contrib/webview/browser/themeing';
import { IWebview, WebviewContentOptions, WebviewExtensionDescription, WebviewInitInfo, WebviewMessageReceivedEvent } from 'vs/workbench/contrib/webview/browser/webview';
import { WebviewFindDelegate, WebviewFindWidget } from 'vs/workbench/contrib/webview/browser/webviewFindWidget';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
export declare class WebviewElement extends Disposable implements IWebview, WebviewFindDelegate {
    protected readonly webviewThemeDataProvider: WebviewThemeDataProvider;
    private readonly _environmentService;
    private readonly _fileService;
    private readonly _logService;
    private readonly _remoteAuthorityResolverService;
    private readonly _telemetryService;
    private readonly _tunnelService;
    private readonly _accessibilityService;
    /**
     * External identifier of this webview.
     */
    readonly id: string;
    /**
     * The provided identifier of this webview.
     */
    readonly providedViewType?: string;
    /**
     * The origin this webview itself is loaded from. May not be unique
     */
    readonly origin: string;
    /**
     * Unique internal identifier of this webview's iframe element.
     */
    private readonly _iframeId;
    private readonly _encodedWebviewOriginPromise;
    private _encodedWebviewOrigin;
    protected get platform(): string;
    private readonly _expectedServiceWorkerVersion;
    private _element;
    protected get element(): HTMLIFrameElement | undefined;
    private _focused;
    get isFocused(): boolean;
    private _state;
    private _content;
    private readonly _portMappingManager;
    private readonly _resourceLoadingCts;
    private _contextKeyService;
    private _confirmBeforeClose;
    private readonly _focusDelayer;
    private readonly _onDidHtmlChange;
    protected readonly onDidHtmlChange: Event<string>;
    private _messagePort?;
    private readonly _messageHandlers;
    protected readonly _webviewFindWidget: WebviewFindWidget | undefined;
    readonly checkImeCompletionState = true;
    private _disposed;
    extension: WebviewExtensionDescription | undefined;
    private readonly _options;
    constructor(initInfo: WebviewInitInfo, webviewThemeDataProvider: WebviewThemeDataProvider, configurationService: IConfigurationService, contextMenuService: IContextMenuService, menuService: IMenuService, notificationService: INotificationService, _environmentService: IWorkbenchEnvironmentService, _fileService: IFileService, _logService: ILogService, _remoteAuthorityResolverService: IRemoteAuthorityResolverService, _telemetryService: ITelemetryService, _tunnelService: ITunnelService, instantiationService: IInstantiationService, _accessibilityService: IAccessibilityService);
    dispose(): void;
    setContextKeyService(contextKeyService: IContextKeyService): void;
    private readonly _onMissingCsp;
    readonly onMissingCsp: Event<ExtensionIdentifier>;
    private readonly _onDidClickLink;
    readonly onDidClickLink: Event<string>;
    private readonly _onDidReload;
    readonly onDidReload: Event<void>;
    private readonly _onMessage;
    readonly onMessage: Event<WebviewMessageReceivedEvent>;
    private readonly _onDidScroll;
    readonly onDidScroll: Event<{
        readonly scrollYPercentage: number;
    }>;
    private readonly _onDidWheel;
    readonly onDidWheel: Event<IMouseWheelEvent>;
    private readonly _onDidUpdateState;
    readonly onDidUpdateState: Event<string | undefined>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    postMessage(message: any, transfer?: ArrayBuffer[]): Promise<boolean>;
    private _send;
    private _createElement;
    private _initElement;
    mountTo(_stopBlockingIframeDragEvents: HTMLElement): void;
    private _startBlockingIframeDragEvents;
    private _stopBlockingIframeDragEvents;
    protected webviewContentEndpoint(encodedWebviewOrigin: string): string;
    private _webviewContentOrigin;
    private doPostMessage;
    private on;
    private _hasAlertedAboutMissingCsp;
    private handleNoCspFound;
    reload(): void;
    set html(value: string);
    set contentOptions(options: WebviewContentOptions);
    set localResourcesRoot(resources: readonly URI[]);
    set state(state: string | undefined);
    set initialScrollProgress(value: number);
    private doUpdateContent;
    protected style(): void;
    private styledFindWidget;
    protected handleFocusChange(isFocused: boolean): void;
    private handleKeyEvent;
    windowDidDragStart(): void;
    windowDidDragEnd(): void;
    selectAll(): void;
    copy(): void;
    paste(): void;
    cut(): void;
    undo(): void;
    redo(): void;
    private execCommand;
    private loadResource;
    protected streamToBuffer(stream: VSBufferReadableStream): Promise<ArrayBufferLike>;
    private localLocalhost;
    focus(): void;
    private _doFocus;
    protected readonly _hasFindResult: Emitter<boolean>;
    readonly hasFindResult: Event<boolean>;
    protected readonly _onDidStopFind: Emitter<void>;
    readonly onDidStopFind: Event<void>;
    /**
     * Webviews expose a stateful find API.
     * Successive calls to find will move forward or backward through onFindResults
     * depending on the supplied options.
     *
     * @param value The string to search for. Empty strings are ignored.
     */
    find(value: string, previous: boolean): void;
    updateFind(value: string): void;
    stopFind(keepSelection?: boolean): void;
    showFind(animated?: boolean): void;
    hideFind(animated?: boolean): void;
    runFindAction(previous: boolean): void;
}
