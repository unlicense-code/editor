/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IExtHostOutputService, ExtHostOutputService } from 'vs/workbench/api/common/extHostOutput';
import { IExtHostWorkspace, ExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { IExtHostDecorations, ExtHostDecorations } from 'vs/workbench/api/common/extHostDecorations';
import { IExtHostConfiguration, ExtHostConfiguration } from 'vs/workbench/api/common/extHostConfiguration';
import { IExtHostCommands, ExtHostCommands } from 'vs/workbench/api/common/extHostCommands';
import { IExtHostDocumentsAndEditors, ExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { IExtHostTerminalService, WorkerExtHostTerminalService } from 'vs/workbench/api/common/extHostTerminalService';
import { IExtHostTask, WorkerExtHostTask } from 'vs/workbench/api/common/extHostTask';
import { IExtHostDebugService, WorkerExtHostDebugService } from 'vs/workbench/api/common/extHostDebugService';
import { IExtHostSearch, ExtHostSearch } from 'vs/workbench/api/common/extHostSearch';
import { IExtHostStorage, ExtHostStorage } from 'vs/workbench/api/common/extHostStorage';
import { IExtHostTunnelService, ExtHostTunnelService } from 'vs/workbench/api/common/extHostTunnelService';
import { IExtHostApiDeprecationService, ExtHostApiDeprecationService, } from 'vs/workbench/api/common/extHostApiDeprecationService';
import { IExtHostWindow, ExtHostWindow } from 'vs/workbench/api/common/extHostWindow';
import { IExtHostConsumerFileSystem, ExtHostConsumerFileSystem } from 'vs/workbench/api/common/extHostFileSystemConsumer';
import { IExtHostFileSystemInfo, ExtHostFileSystemInfo } from 'vs/workbench/api/common/extHostFileSystemInfo';
import { IExtHostSecretState, ExtHostSecretState } from 'vs/workbench/api/common/extHostSecretState';
import { ExtHostTelemetry, IExtHostTelemetry } from 'vs/workbench/api/common/extHostTelemetry';
import { ExtHostEditorTabs, IExtHostEditorTabs } from 'vs/workbench/api/common/extHostEditorTabs';
import { ExtHostLoggerService } from 'vs/workbench/api/common/extHostLoggerService';
import { ILoggerService, ILogService } from 'vs/platform/log/common/log';
import { ExtHostLogService } from 'vs/workbench/api/common/extHostLogService';
import { ExtHostVariableResolverProviderService, IExtHostVariableResolverProvider } from 'vs/workbench/api/common/extHostVariableResolverService';
import { ExtHostLocalizationService, IExtHostLocalizationService } from 'vs/workbench/api/common/extHostLocalizationService';
registerSingleton(IExtHostLocalizationService, ExtHostLocalizationService, 1 /* InstantiationType.Delayed */);
registerSingleton(ILoggerService, ExtHostLoggerService, 1 /* InstantiationType.Delayed */);
registerSingleton(ILogService, ExtHostLogService, 1 /* InstantiationType.Delayed */);
registerSingleton(IExtHostApiDeprecationService, ExtHostApiDeprecationService, 1 /* InstantiationType.Delayed */);
registerSingleton(IExtHostCommands, ExtHostCommands, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostConfiguration, ExtHostConfiguration, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostConsumerFileSystem, ExtHostConsumerFileSystem, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostDebugService, WorkerExtHostDebugService, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostDecorations, ExtHostDecorations, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostDocumentsAndEditors, ExtHostDocumentsAndEditors, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostFileSystemInfo, ExtHostFileSystemInfo, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostOutputService, ExtHostOutputService, 1 /* InstantiationType.Delayed */);
registerSingleton(IExtHostSearch, ExtHostSearch, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostStorage, ExtHostStorage, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostTask, WorkerExtHostTask, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostTerminalService, WorkerExtHostTerminalService, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostTunnelService, ExtHostTunnelService, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostWindow, ExtHostWindow, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostWorkspace, ExtHostWorkspace, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostSecretState, ExtHostSecretState, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostTelemetry, ExtHostTelemetry, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostEditorTabs, ExtHostEditorTabs, 0 /* InstantiationType.Eager */);
registerSingleton(IExtHostVariableResolverProvider, ExtHostVariableResolverProviderService, 0 /* InstantiationType.Eager */);
