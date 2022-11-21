/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/workbench/contrib/localHistory/browser/localHistoryCommands';
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { LocalHistoryTimeline } from 'vs/workbench/contrib/localHistory/browser/localHistoryTimeline';
// Register Local History Timeline
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LocalHistoryTimeline, 2 /* LifecyclePhase.Ready */);
