import { IExtHostWorkspaceProvider } from 'vs/workbench/api/common/extHostWorkspace';
import { ExtHostConfigProvider } from 'vs/workbench/api/common/extHostConfiguration';
import { MainThreadTelemetryShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtensionHostInitData } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtHostExtensionService } from 'vs/workbench/api/node/extHostExtensionService';
import { ILogService } from 'vs/platform/log/common/log';
export declare function connectProxyResolver(extHostWorkspace: IExtHostWorkspaceProvider, configProvider: ExtHostConfigProvider, extensionService: ExtHostExtensionService, extHostLogService: ILogService, mainThreadTelemetry: MainThreadTelemetryShape, initData: IExtensionHostInitData): Promise<void>;
