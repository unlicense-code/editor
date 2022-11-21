/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Registry } from 'vs/platform/registry/common/platform';
import { FeedbackStatusbarConribution } from 'vs/workbench/contrib/feedback/browser/feedbackStatusbarItem';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(FeedbackStatusbarConribution, 1 /* LifecyclePhase.Starting */);
