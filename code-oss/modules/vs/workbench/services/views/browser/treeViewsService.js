/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { TreeviewsService } from 'vs/workbench/services/views/common/treeViewsService';
export const ITreeViewsService = createDecorator('treeViewsService');
registerSingleton(ITreeViewsService, TreeviewsService, 1 /* InstantiationType.Delayed */);
