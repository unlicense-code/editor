/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const ID_NOTEBOOK_EDITOR_WORKER_SERVICE = 'notebookEditorWorkerService';
export const INotebookEditorWorkerService = createDecorator(ID_NOTEBOOK_EDITOR_WORKER_SERVICE);
