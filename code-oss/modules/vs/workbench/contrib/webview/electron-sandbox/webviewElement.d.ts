import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { IAccessibilityService } from 'vs/platform/accessibility/common/accessibility';
import { IMenuService } from 'vs/platform/actions/common/actions';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IMainProcessService } from 'vs/platform/ipc/electron-sandbox/services';
import { ILogService } from 'vs/platform/log/common/log';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IRemoteAuthorityResolverService } from 'vs/platform/remote/common/remoteAuthorityResolver';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
import { WebviewThemeDataProvider } from 'vs/workbench/contrib/webview/browser/themeing';
import { WebviewInitInfo } from 'vs/workbench/contrib/webview/browser/webview';
import { WebviewElement } from 'vs/workbench/contrib/webview/browser/webviewElement';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
/**
 * Webview backed by an iframe but that uses Electron APIs to power the webview.
 */
export declare class ElectronWebviewElement extends WebviewElement {
    private readonly _nativeHostService;
    private readonly _webviewKeyboardHandler;
    private _findStarted;
    private _cachedHtmlContent;
    private readonly _webviewMainService;
    private readonly _iframeDelayer;
    protected get platform(): string;
    constructor(initInfo: WebviewInitInfo, webviewThemeDataProvider: WebviewThemeDataProvider, contextMenuService: IContextMenuService, tunnelService: ITunnelService, fileService: IFileService, telemetryService: ITelemetryService, environmentService: IWorkbenchEnvironmentService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, menuService: IMenuService, logService: ILogService, configurationService: IConfigurationService, mainProcessService: IMainProcessService, notificationService: INotificationService, _nativeHostService: INativeHostService, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService);
    dispose(): void;
    protected webviewContentEndpoint(iframeId: string): string;
    protected streamToBuffer(stream: VSBufferReadableStream): Promise<ArrayBufferLike>;
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
    protected handleFocusChange(isFocused: boolean): void;
}
