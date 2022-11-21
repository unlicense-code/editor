/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { registerAction2 } from 'vs/platform/actions/common/actions';
import { Extensions } from 'vs/platform/configuration/common/configurationRegistry';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { AcceptAllInput1, AcceptAllInput2, AcceptMerge, CompareInput1WithBaseCommand, CompareInput2WithBaseCommand, GoToNextUnhandledConflict, GoToPreviousUnhandledConflict, OpenBaseFile, OpenMergeEditor, OpenResultResource, ResetToBaseAndAutoMergeCommand, SetColumnLayout, SetMixedLayout, ShowHideTopBase, ShowHideCenterBase, ShowHideBase, ShowNonConflictingChanges, ToggleActiveConflictInput1, ToggleActiveConflictInput2 } from 'vs/workbench/contrib/mergeEditor/browser/commands/commands';
import { MergeEditorCopyContentsToJSON, MergeEditorLoadContentsFromFolder, MergeEditorSaveContentsToFolder } from 'vs/workbench/contrib/mergeEditor/browser/commands/devCommands';
import { MergeEditorInput } from 'vs/workbench/contrib/mergeEditor/browser/mergeEditorInput';
import { MergeEditor, MergeEditorOpenHandlerContribution, MergeEditorResolverContribution } from 'vs/workbench/contrib/mergeEditor/browser/view/mergeEditor';
import { MergeEditorSerializer } from './mergeEditorSerializer';
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(MergeEditor, MergeEditor.ID, localize('name', "Merge Editor")), [
    new SyncDescriptor(MergeEditorInput)
]);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(MergeEditorInput.ID, MergeEditorSerializer);
Registry.as(Extensions.Configuration).registerConfiguration({
    properties: {
        'mergeEditor.diffAlgorithm': {
            type: 'string',
            enum: ['smart', 'experimental'],
            default: 'experimental',
            markdownEnumDescriptions: [
                localize('diffAlgorithm.smart', "Uses the default diffing algorithm."),
                localize('diffAlgorithm.experimental', "Uses an experimental diffing algorithm."),
            ]
        },
        'mergeEditor.showDeletionMarkers': {
            type: 'boolean',
            default: true,
            description: 'Controls if deletions in base or one of the inputs should be indicated by a vertical bar.',
        },
    }
});
registerAction2(OpenResultResource);
registerAction2(SetMixedLayout);
registerAction2(SetColumnLayout);
registerAction2(OpenMergeEditor);
registerAction2(OpenBaseFile);
registerAction2(ShowNonConflictingChanges);
registerAction2(ShowHideBase);
registerAction2(ShowHideTopBase);
registerAction2(ShowHideCenterBase);
registerAction2(GoToNextUnhandledConflict);
registerAction2(GoToPreviousUnhandledConflict);
registerAction2(ToggleActiveConflictInput1);
registerAction2(ToggleActiveConflictInput2);
registerAction2(CompareInput1WithBaseCommand);
registerAction2(CompareInput2WithBaseCommand);
registerAction2(AcceptAllInput1);
registerAction2(AcceptAllInput2);
registerAction2(ResetToBaseAndAutoMergeCommand);
registerAction2(AcceptMerge);
// Dev Commands
registerAction2(MergeEditorCopyContentsToJSON);
registerAction2(MergeEditorSaveContentsToFolder);
registerAction2(MergeEditorLoadContentsFromFolder);
Registry
    .as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(MergeEditorOpenHandlerContribution, 3 /* LifecyclePhase.Restored */);
Registry
    .as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(MergeEditorResolverContribution, 1 /* LifecyclePhase.Starting */);