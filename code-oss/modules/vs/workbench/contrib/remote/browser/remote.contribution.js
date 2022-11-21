/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { ShowCandidateContribution } from 'vs/workbench/contrib/remote/browser/showCandidate';
import { TunnelFactoryContribution } from 'vs/workbench/contrib/remote/browser/tunnelFactory';
import { RemoteAgentConnectionStatusListener, RemoteMarkers } from 'vs/workbench/contrib/remote/browser/remote';
import { RemoteStatusIndicator } from 'vs/workbench/contrib/remote/browser/remoteIndicator';
import { AutomaticPortForwarding, ForwardedPortsView, PortRestore } from 'vs/workbench/contrib/remote/browser/remoteExplorer';
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(ShowCandidateContribution, 2 /* LifecyclePhase.Ready */);
workbenchContributionsRegistry.registerWorkbenchContribution(TunnelFactoryContribution, 2 /* LifecyclePhase.Ready */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteAgentConnectionStatusListener, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteStatusIndicator, 1 /* LifecyclePhase.Starting */);
workbenchContributionsRegistry.registerWorkbenchContribution(ForwardedPortsView, 3 /* LifecyclePhase.Restored */);
workbenchContributionsRegistry.registerWorkbenchContribution(PortRestore, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(AutomaticPortForwarding, 4 /* LifecyclePhase.Eventually */);
workbenchContributionsRegistry.registerWorkbenchContribution(RemoteMarkers, 4 /* LifecyclePhase.Eventually */);
