/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { registerSharedProcessRemoteService } from 'vs/platform/ipc/electron-sandbox/services';
import { Registry } from 'vs/platform/registry/common/platform';
import { TerminalIpcChannels } from 'vs/platform/terminal/common/terminal';
import { ILocalPtyService } from 'vs/platform/terminal/electron-sandbox/terminal';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { ITerminalProfileResolverService } from 'vs/workbench/contrib/terminal/common/terminal';
import { TerminalNativeContribution } from 'vs/workbench/contrib/terminal/electron-sandbox/terminalNativeContribution';
import { ElectronTerminalProfileResolverService } from 'vs/workbench/contrib/terminal/electron-sandbox/terminalProfileResolverService';
import { LocalTerminalBackendContribution } from 'vs/workbench/contrib/terminal/electron-sandbox/localTerminalBackend';
// Register services
registerSharedProcessRemoteService(ILocalPtyService, TerminalIpcChannels.LocalPty);
registerSingleton(ITerminalProfileResolverService, ElectronTerminalProfileResolverService, 1 /* InstantiationType.Delayed */);
// Register workbench contributions
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
// This contribution needs to be active during the Startup phase to be available when a remote resolver tries to open a local
// terminal while connecting to the remote.
workbenchRegistry.registerWorkbenchContribution(LocalTerminalBackendContribution, 1 /* LifecyclePhase.Starting */);
workbenchRegistry.registerWorkbenchContribution(TerminalNativeContribution, 3 /* LifecyclePhase.Restored */);
