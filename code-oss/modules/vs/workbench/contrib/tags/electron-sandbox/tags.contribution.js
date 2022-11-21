/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { WorkspaceTags } from 'vs/workbench/contrib/tags/electron-sandbox/workspaceTags';
// Register Workspace Tags Contribution
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(WorkspaceTags, 4 /* LifecyclePhase.Eventually */);
