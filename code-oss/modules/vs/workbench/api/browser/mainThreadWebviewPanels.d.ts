import { Disposable } from 'vs/base/common/lifecycle';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { MainThreadWebviews } from 'vs/workbench/api/browser/mainThreadWebviews';
import * as extHostProtocol from 'vs/workbench/api/common/extHost.protocol';
import { WebviewInput } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditorInput';
import { IWebviewWorkbenchService } from 'vs/workbench/contrib/webviewPanel/browser/webviewWorkbenchService';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
export declare class MainThreadWebviewPanels extends Disposable implements extHostProtocol.MainThreadWebviewPanelsShape {
    private readonly _mainThreadWebviews;
    private readonly _configurationService;
    private readonly _editorGroupService;
    private readonly _editorService;
    private readonly _telemetryService;
    private readonly _webviewWorkbenchService;
    private readonly webviewPanelViewType;
    private readonly _proxy;
    private readonly _webviewInputs;
    private readonly _revivers;
    private readonly webviewOriginStore;
    constructor(context: IExtHostContext, _mainThreadWebviews: MainThreadWebviews, _configurationService: IConfigurationService, _editorGroupService: IEditorGroupsService, _editorService: IEditorService, extensionService: IExtensionService, storageService: IStorageService, _telemetryService: ITelemetryService, _webviewWorkbenchService: IWebviewWorkbenchService);
    get webviewInputs(): Iterable<WebviewInput>;
    addWebviewInput(handle: extHostProtocol.WebviewHandle, input: WebviewInput, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $createWebviewPanel(extensionData: extHostProtocol.WebviewExtensionDescription, handle: extHostProtocol.WebviewHandle, viewType: string, initData: extHostProtocol.IWebviewInitData, showOptions: extHostProtocol.WebviewPanelShowOptions): void;
    $disposeWebview(handle: extHostProtocol.WebviewHandle): void;
    $setTitle(handle: extHostProtocol.WebviewHandle, value: string): void;
    $setIconPath(handle: extHostProtocol.WebviewHandle, value: extHostProtocol.IWebviewIconPath | undefined): void;
    $reveal(handle: extHostProtocol.WebviewHandle, showOptions: extHostProtocol.WebviewPanelShowOptions): void;
    private getTargetGroupFromShowOptions;
    $registerSerializer(viewType: string, options: {
        serializeBuffersForPostMessage: boolean;
    }): void;
    $unregisterSerializer(viewType: string): void;
    private updateWebviewViewStates;
    private getWebviewInput;
    private tryGetWebviewInput;
}
