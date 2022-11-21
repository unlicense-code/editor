/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { isWindows, isMacintosh } from 'vs/base/common/platform';
import { Schemas } from 'vs/base/common/network';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { KeyChord } from 'vs/base/common/keyCodes';
import { getMultiSelectedResources, IExplorerService } from 'vs/workbench/contrib/files/browser/files';
import { IListService } from 'vs/platform/list/browser/listService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { revealResourcesInOS } from 'vs/workbench/contrib/files/electron-sandbox/fileCommands';
import { MenuRegistry, MenuId } from 'vs/platform/actions/common/actions';
import { ResourceContextKey } from 'vs/workbench/common/contextkeys';
import { appendToCommandPalette, appendEditorTitleContextMenuItem } from 'vs/workbench/contrib/files/browser/fileActions.contribution';
import { SideBySideEditor, EditorResourceAccessor } from 'vs/workbench/common/editor';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
const REVEAL_IN_OS_COMMAND_ID = 'revealFileInOS';
const REVEAL_IN_OS_LABEL = isWindows ? nls.localize('revealInWindows', "Reveal in File Explorer") : isMacintosh ? nls.localize('revealInMac', "Reveal in Finder") : nls.localize('openContainer', "Open Containing Folder");
const REVEAL_IN_OS_WHEN_CONTEXT = ContextKeyExpr.or(ResourceContextKey.Scheme.isEqualTo(Schemas.file), ResourceContextKey.Scheme.isEqualTo(Schemas.vscodeUserData));
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: REVEAL_IN_OS_COMMAND_ID,
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: EditorContextKeys.focus.toNegated(),
    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
    win: {
        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */
    },
    handler: (accessor, resource) => {
        const resources = getMultiSelectedResources(resource, accessor.get(IListService), accessor.get(IEditorService), accessor.get(IExplorerService));
        revealResourcesInOS(resources, accessor.get(INativeHostService), accessor.get(IWorkspaceContextService));
    }
});
const REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID = 'workbench.action.files.revealActiveFileInWindows';
KeybindingsRegistry.registerCommandAndKeybindingRule({
    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
    when: undefined,
    primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 48 /* KeyCode.KeyR */),
    id: REVEAL_ACTIVE_FILE_IN_OS_COMMAND_ID,
    handler: (accessor) => {
        const editorService = accessor.get(IEditorService);
        const activeInput = editorService.activeEditor;
        const resource = EditorResourceAccessor.getOriginalUri(activeInput, { filterByScheme: Schemas.file, supportSideBySide: SideBySideEditor.PRIMARY });
        const resources = resource ? [resource] : [];
        revealResourcesInOS(resources, accessor.get(INativeHostService), accessor.get(IWorkspaceContextService));
    }
});
appendEditorTitleContextMenuItem(REVEAL_IN_OS_COMMAND_ID, REVEAL_IN_OS_LABEL, REVEAL_IN_OS_WHEN_CONTEXT, '2_files', 0);
// Menu registration - open editors
const revealInOsCommand = {
    id: REVEAL_IN_OS_COMMAND_ID,
    title: REVEAL_IN_OS_LABEL
};
MenuRegistry.appendMenuItem(MenuId.OpenEditorsContext, {
    group: 'navigation',
    order: 20,
    command: revealInOsCommand,
    when: REVEAL_IN_OS_WHEN_CONTEXT
});
// Menu registration - explorer
MenuRegistry.appendMenuItem(MenuId.ExplorerContext, {
    group: 'navigation',
    order: 20,
    command: revealInOsCommand,
    when: REVEAL_IN_OS_WHEN_CONTEXT
});
// Command Palette
const category = { value: nls.localize('filesCategory', "File"), original: 'File' };
appendToCommandPalette(REVEAL_IN_OS_COMMAND_ID, { value: REVEAL_IN_OS_LABEL, original: isWindows ? 'Reveal in File Explorer' : isMacintosh ? 'Reveal in Finder' : 'Open Containing Folder' }, category, REVEAL_IN_OS_WHEN_CONTEXT);
