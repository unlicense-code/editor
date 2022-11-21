/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { ComplexCustomWorkingCopyEditorHandler as ComplexCustomWorkingCopyEditorHandler, CustomEditorInputSerializer } from 'vs/workbench/contrib/customEditor/browser/customEditorInputFactory';
import { ICustomEditorService } from 'vs/workbench/contrib/customEditor/common/customEditor';
import { WebviewEditor } from 'vs/workbench/contrib/webviewPanel/browser/webviewEditor';
import { CustomEditorInput } from './customEditorInput';
import { CustomEditorService } from './customEditors';
registerSingleton(ICustomEditorService, CustomEditorService, 1 /* InstantiationType.Delayed */);
Registry.as(EditorExtensions.EditorPane)
    .registerEditorPane(EditorPaneDescriptor.create(WebviewEditor, WebviewEditor.ID, 'Webview Editor'), [
    new SyncDescriptor(CustomEditorInput)
]);
Registry.as(EditorExtensions.EditorFactory)
    .registerEditorSerializer(CustomEditorInputSerializer.ID, CustomEditorInputSerializer);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(ComplexCustomWorkingCopyEditorHandler, 1 /* LifecyclePhase.Starting */);
