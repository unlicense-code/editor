/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { WalkThroughInput } from 'vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughInput';
import { WalkThroughPart } from 'vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughPart';
import { WalkThroughArrowUp, WalkThroughArrowDown, WalkThroughPageUp, WalkThroughPageDown } from 'vs/workbench/contrib/welcomeWalkthrough/browser/walkThroughActions';
import { WalkThroughSnippetContentProvider } from 'vs/workbench/contrib/welcomeWalkthrough/common/walkThroughContentProvider';
import { EditorWalkThroughAction, EditorWalkThroughInputSerializer } from 'vs/workbench/contrib/welcomeWalkthrough/browser/editor/editorWalkThrough';
import { Registry } from 'vs/platform/registry/common/platform';
import { EditorExtensions } from 'vs/workbench/common/editor';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { MenuRegistry, MenuId, registerAction2 } from 'vs/platform/actions/common/actions';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { EditorPaneDescriptor } from 'vs/workbench/browser/editor';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
Registry.as(EditorExtensions.EditorPane)
    .registerEditorPane(EditorPaneDescriptor.create(WalkThroughPart, WalkThroughPart.ID, localize('walkThrough.editor.label', "Playground")), [new SyncDescriptor(WalkThroughInput)]);
registerAction2(EditorWalkThroughAction);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(EditorWalkThroughInputSerializer.ID, EditorWalkThroughInputSerializer);
Registry.as(WorkbenchExtensions.Workbench)
    .registerWorkbenchContribution(WalkThroughSnippetContentProvider, 1 /* LifecyclePhase.Starting */);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughArrowUp);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughArrowDown);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughPageUp);
KeybindingsRegistry.registerCommandAndKeybindingRule(WalkThroughPageDown);
MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
    group: '1_welcome',
    command: {
        id: 'workbench.action.showInteractivePlayground',
        title: localize({ key: 'miPlayground', comment: ['&& denotes a mnemonic'] }, "Editor Playgrou&&nd")
    },
    order: 3
});
