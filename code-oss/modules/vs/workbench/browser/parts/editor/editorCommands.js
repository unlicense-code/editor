/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from 'vs/nls';
import { isObject, isString, isUndefined, isNumber, withNullAsUndefined } from 'vs/base/common/types';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { KeybindingsRegistry } from 'vs/platform/keybinding/common/keybindingsRegistry';
import { isEditorIdentifier, isEditorInputWithOptionsAndGroup, isUntitledWithAssociatedResource } from 'vs/workbench/common/editor';
import { TextCompareEditorVisibleContext, ActiveEditorGroupEmptyContext, MultipleEditorGroupsContext, ActiveEditorStickyContext, ActiveEditorGroupLockedContext, ActiveEditorCanSplitInGroupContext, TextCompareEditorActiveContext, SideBySideEditorActiveContext } from 'vs/workbench/common/contextkeys';
import { columnToEditorGroup } from 'vs/workbench/services/editor/common/editorGroupColumn';
import { IEditorService, SIDE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { EditorContextKeys } from 'vs/editor/common/editorContextKeys';
import { TextDiffEditor } from 'vs/workbench/browser/parts/editor/textDiffEditor';
import { KeyChord } from 'vs/base/common/keyCodes';
import { URI } from 'vs/base/common/uri';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IListService } from 'vs/platform/list/browser/listService';
import { List } from 'vs/base/browser/ui/list/listWidget';
import { distinct, coalesce } from 'vs/base/common/arrays';
import { IEditorGroupsService, preferredSideBySideGroupDirection, isEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CommandsRegistry, ICommandService } from 'vs/platform/commands/common/commands';
import { MenuRegistry, MenuId, registerAction2, Action2 } from 'vs/platform/actions/common/actions';
import { Categories } from 'vs/platform/action/common/actionCommonCategories';
import { ActiveGroupEditorsByMostRecentlyUsedQuickAccess } from 'vs/workbench/browser/parts/editor/editorQuickAccess';
import { IOpenerService, matchesScheme } from 'vs/platform/opener/common/opener';
import { EditorResolution } from 'vs/platform/editor/common/editor';
import { Schemas } from 'vs/base/common/network';
import { SideBySideEditorInput } from 'vs/workbench/common/editor/sideBySideEditorInput';
import { SideBySideEditor } from 'vs/workbench/browser/parts/editor/sideBySideEditor';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { extname } from 'vs/base/common/resources';
export const CLOSE_SAVED_EDITORS_COMMAND_ID = 'workbench.action.closeUnmodifiedEditors';
export const CLOSE_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeEditorsInGroup';
export const CLOSE_EDITORS_AND_GROUP_COMMAND_ID = 'workbench.action.closeEditorsAndGroup';
export const CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID = 'workbench.action.closeEditorsToTheRight';
export const CLOSE_EDITOR_COMMAND_ID = 'workbench.action.closeActiveEditor';
export const CLOSE_PINNED_EDITOR_COMMAND_ID = 'workbench.action.closeActivePinnedEditor';
export const CLOSE_EDITOR_GROUP_COMMAND_ID = 'workbench.action.closeGroup';
export const CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID = 'workbench.action.closeOtherEditors';
export const MOVE_ACTIVE_EDITOR_COMMAND_ID = 'moveActiveEditor';
export const COPY_ACTIVE_EDITOR_COMMAND_ID = 'copyActiveEditor';
export const LAYOUT_EDITOR_GROUPS_COMMAND_ID = 'layoutEditorGroups';
export const KEEP_EDITOR_COMMAND_ID = 'workbench.action.keepEditor';
export const TOGGLE_KEEP_EDITORS_COMMAND_ID = 'workbench.action.toggleKeepEditors';
export const TOGGLE_LOCK_GROUP_COMMAND_ID = 'workbench.action.toggleEditorGroupLock';
export const LOCK_GROUP_COMMAND_ID = 'workbench.action.lockEditorGroup';
export const UNLOCK_GROUP_COMMAND_ID = 'workbench.action.unlockEditorGroup';
export const SHOW_EDITORS_IN_GROUP = 'workbench.action.showEditorsInGroup';
export const REOPEN_WITH_COMMAND_ID = 'workbench.action.reopenWithEditor';
export const PIN_EDITOR_COMMAND_ID = 'workbench.action.pinEditor';
export const UNPIN_EDITOR_COMMAND_ID = 'workbench.action.unpinEditor';
export const TOGGLE_DIFF_SIDE_BY_SIDE = 'toggle.diff.renderSideBySide';
export const GOTO_NEXT_CHANGE = 'workbench.action.compareEditor.nextChange';
export const GOTO_PREVIOUS_CHANGE = 'workbench.action.compareEditor.previousChange';
export const DIFF_FOCUS_PRIMARY_SIDE = 'workbench.action.compareEditor.focusPrimarySide';
export const DIFF_FOCUS_SECONDARY_SIDE = 'workbench.action.compareEditor.focusSecondarySide';
export const DIFF_FOCUS_OTHER_SIDE = 'workbench.action.compareEditor.focusOtherSide';
export const TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = 'toggle.diff.ignoreTrimWhitespace';
export const SPLIT_EDITOR_UP = 'workbench.action.splitEditorUp';
export const SPLIT_EDITOR_DOWN = 'workbench.action.splitEditorDown';
export const SPLIT_EDITOR_LEFT = 'workbench.action.splitEditorLeft';
export const SPLIT_EDITOR_RIGHT = 'workbench.action.splitEditorRight';
export const SPLIT_EDITOR_IN_GROUP = 'workbench.action.splitEditorInGroup';
export const TOGGLE_SPLIT_EDITOR_IN_GROUP = 'workbench.action.toggleSplitEditorInGroup';
export const JOIN_EDITOR_IN_GROUP = 'workbench.action.joinEditorInGroup';
export const TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT = 'workbench.action.toggleSplitEditorInGroupLayout';
export const FOCUS_FIRST_SIDE_EDITOR = 'workbench.action.focusFirstSideEditor';
export const FOCUS_SECOND_SIDE_EDITOR = 'workbench.action.focusSecondSideEditor';
export const FOCUS_OTHER_SIDE_EDITOR = 'workbench.action.focusOtherSideEditor';
export const FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusLeftGroupWithoutWrap';
export const FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusRightGroupWithoutWrap';
export const FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusAboveGroupWithoutWrap';
export const FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID = 'workbench.action.focusBelowGroupWithoutWrap';
export const OPEN_EDITOR_AT_INDEX_COMMAND_ID = 'workbench.action.openEditorAtIndex';
export const API_OPEN_EDITOR_COMMAND_ID = '_workbench.open';
export const API_OPEN_DIFF_EDITOR_COMMAND_ID = '_workbench.diff';
export const API_OPEN_WITH_EDITOR_COMMAND_ID = '_workbench.openWith';
const isActiveEditorMoveCopyArg = function (arg) {
    if (!isObject(arg)) {
        return false;
    }
    if (!isString(arg.to)) {
        return false;
    }
    if (!isUndefined(arg.by) && !isString(arg.by)) {
        return false;
    }
    if (!isUndefined(arg.value) && !isNumber(arg.value)) {
        return false;
    }
    return true;
};
function registerActiveEditorMoveCopyCommand() {
    const moveCopyJSONSchema = {
        'type': 'object',
        'required': ['to'],
        'properties': {
            'to': {
                'type': 'string',
                'enum': ['left', 'right']
            },
            'by': {
                'type': 'string',
                'enum': ['tab', 'group']
            },
            'value': {
                'type': 'number'
            }
        }
    };
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: MOVE_ACTIVE_EDITOR_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: 0,
        handler: (accessor, args) => moveCopyActiveEditor(true, args, accessor),
        description: {
            description: localize('editorCommand.activeEditorMove.description', "Move the active editor by tabs or groups"),
            args: [
                {
                    name: localize('editorCommand.activeEditorMove.arg.name', "Active editor move argument"),
                    description: localize('editorCommand.activeEditorMove.arg.description', "Argument Properties:\n\t* 'to': String value providing where to move.\n\t* 'by': String value providing the unit for move (by tab or by group).\n\t* 'value': Number value providing how many positions or an absolute position to move."),
                    constraint: isActiveEditorMoveCopyArg,
                    schema: moveCopyJSONSchema
                }
            ]
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: COPY_ACTIVE_EDITOR_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: EditorContextKeys.editorTextFocus,
        primary: 0,
        handler: (accessor, args) => moveCopyActiveEditor(false, args, accessor),
        description: {
            description: localize('editorCommand.activeEditorCopy.description', "Copy the active editor by groups"),
            args: [
                {
                    name: localize('editorCommand.activeEditorCopy.arg.name', "Active editor copy argument"),
                    description: localize('editorCommand.activeEditorCopy.arg.description', "Argument Properties:\n\t* 'to': String value providing where to copy.\n\t* 'value': Number value providing how many positions or an absolute position to copy."),
                    constraint: isActiveEditorMoveCopyArg,
                    schema: moveCopyJSONSchema
                }
            ]
        }
    });
    function moveCopyActiveEditor(isMove, args = Object.create(null), accessor) {
        args.to = args.to || 'right';
        args.by = args.by || 'tab';
        args.value = typeof args.value === 'number' ? args.value : 1;
        const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
        if (activeEditorPane) {
            switch (args.by) {
                case 'tab':
                    if (isMove) {
                        return moveActiveTab(args, activeEditorPane);
                    }
                    break;
                case 'group':
                    return moveCopyActiveEditorToGroup(isMove, args, activeEditorPane, accessor);
            }
        }
    }
    function moveActiveTab(args, control) {
        const group = control.group;
        let index = group.getIndexOfEditor(control.input);
        switch (args.to) {
            case 'first':
                index = 0;
                break;
            case 'last':
                index = group.count - 1;
                break;
            case 'left':
                index = index - args.value;
                break;
            case 'right':
                index = index + args.value;
                break;
            case 'center':
                index = Math.round(group.count / 2) - 1;
                break;
            case 'position':
                index = args.value - 1;
                break;
        }
        index = index < 0 ? 0 : index >= group.count ? group.count - 1 : index;
        group.moveEditor(control.input, group, { index });
    }
    function moveCopyActiveEditorToGroup(isMove, args, control, accessor) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const sourceGroup = control.group;
        let targetGroup;
        switch (args.to) {
            case 'left':
                targetGroup = editorGroupService.findGroup({ direction: 2 /* GroupDirection.LEFT */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 2 /* GroupDirection.LEFT */);
                }
                break;
            case 'right':
                targetGroup = editorGroupService.findGroup({ direction: 3 /* GroupDirection.RIGHT */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 3 /* GroupDirection.RIGHT */);
                }
                break;
            case 'up':
                targetGroup = editorGroupService.findGroup({ direction: 0 /* GroupDirection.UP */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 0 /* GroupDirection.UP */);
                }
                break;
            case 'down':
                targetGroup = editorGroupService.findGroup({ direction: 1 /* GroupDirection.DOWN */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, 1 /* GroupDirection.DOWN */);
                }
                break;
            case 'first':
                targetGroup = editorGroupService.findGroup({ location: 0 /* GroupLocation.FIRST */ }, sourceGroup);
                break;
            case 'last':
                targetGroup = editorGroupService.findGroup({ location: 1 /* GroupLocation.LAST */ }, sourceGroup);
                break;
            case 'previous':
                targetGroup = editorGroupService.findGroup({ location: 3 /* GroupLocation.PREVIOUS */ }, sourceGroup);
                break;
            case 'next':
                targetGroup = editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, sourceGroup);
                if (!targetGroup) {
                    targetGroup = editorGroupService.addGroup(sourceGroup, preferredSideBySideGroupDirection(configurationService));
                }
                break;
            case 'center':
                targetGroup = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[(editorGroupService.count / 2) - 1];
                break;
            case 'position':
                targetGroup = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[args.value - 1];
                break;
        }
        if (targetGroup) {
            if (isMove) {
                sourceGroup.moveEditor(control.input, targetGroup);
            }
            else if (sourceGroup.id !== targetGroup.id) {
                sourceGroup.copyEditor(control.input, targetGroup);
            }
            targetGroup.focus();
        }
    }
}
function registerEditorGroupsLayoutCommand() {
    function applyEditorLayout(accessor, layout) {
        if (!layout || typeof layout !== 'object') {
            return;
        }
        const editorGroupService = accessor.get(IEditorGroupsService);
        editorGroupService.applyLayout(layout);
    }
    CommandsRegistry.registerCommand(LAYOUT_EDITOR_GROUPS_COMMAND_ID, (accessor, args) => {
        applyEditorLayout(accessor, args);
    });
    // API Command
    CommandsRegistry.registerCommand({
        id: 'vscode.setEditorLayout',
        handler: (accessor, args) => applyEditorLayout(accessor, args),
        description: {
            description: 'Set Editor Layout',
            args: [{
                    name: 'args',
                    schema: {
                        'type': 'object',
                        'required': ['groups'],
                        'properties': {
                            'orientation': {
                                'type': 'number',
                                'default': 0,
                                'enum': [0, 1]
                            },
                            'groups': {
                                '$ref': '#/definitions/editorGroupsSchema',
                                'default': [{}, {}]
                            }
                        }
                    }
                }]
        }
    });
}
function registerDiffEditorCommands() {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: GOTO_NEXT_CHANGE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: TextCompareEditorVisibleContext,
        primary: 512 /* KeyMod.Alt */ | 63 /* KeyCode.F5 */,
        handler: accessor => navigateInDiffEditor(accessor, true)
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: GOTO_PREVIOUS_CHANGE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: TextCompareEditorVisibleContext,
        primary: 512 /* KeyMod.Alt */ | 1024 /* KeyMod.Shift */ | 63 /* KeyCode.F5 */,
        handler: accessor => navigateInDiffEditor(accessor, false)
    });
    function getActiveTextDiffEditor(accessor) {
        const editorService = accessor.get(IEditorService);
        for (const editor of [editorService.activeEditorPane, ...editorService.visibleEditorPanes]) {
            if (editor instanceof TextDiffEditor) {
                return editor;
            }
        }
        return undefined;
    }
    function navigateInDiffEditor(accessor, next) {
        const activeTextDiffEditor = getActiveTextDiffEditor(accessor);
        if (activeTextDiffEditor) {
            const navigator = activeTextDiffEditor.getDiffNavigator();
            if (navigator) {
                next ? navigator.next() : navigator.previous();
            }
        }
    }
    let FocusTextDiffEditorMode;
    (function (FocusTextDiffEditorMode) {
        FocusTextDiffEditorMode[FocusTextDiffEditorMode["Original"] = 0] = "Original";
        FocusTextDiffEditorMode[FocusTextDiffEditorMode["Modified"] = 1] = "Modified";
        FocusTextDiffEditorMode[FocusTextDiffEditorMode["Toggle"] = 2] = "Toggle";
    })(FocusTextDiffEditorMode || (FocusTextDiffEditorMode = {}));
    function focusInDiffEditor(accessor, mode) {
        const activeTextDiffEditor = getActiveTextDiffEditor(accessor);
        if (activeTextDiffEditor) {
            switch (mode) {
                case FocusTextDiffEditorMode.Original:
                    activeTextDiffEditor.getControl()?.getOriginalEditor().focus();
                    break;
                case FocusTextDiffEditorMode.Modified:
                    activeTextDiffEditor.getControl()?.getModifiedEditor().focus();
                    break;
                case FocusTextDiffEditorMode.Toggle:
                    if (activeTextDiffEditor.getControl()?.getModifiedEditor().hasWidgetFocus()) {
                        return focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original);
                    }
                    else {
                        return focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified);
                    }
            }
        }
    }
    function toggleDiffSideBySide(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const newValue = !configurationService.getValue('diffEditor.renderSideBySide');
        configurationService.updateValue('diffEditor.renderSideBySide', newValue);
    }
    function toggleDiffIgnoreTrimWhitespace(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        const newValue = !configurationService.getValue('diffEditor.ignoreTrimWhitespace');
        configurationService.updateValue('diffEditor.ignoreTrimWhitespace', newValue);
    }
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: TOGGLE_DIFF_SIDE_BY_SIDE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: accessor => toggleDiffSideBySide(accessor)
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DIFF_FOCUS_PRIMARY_SIDE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Modified)
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DIFF_FOCUS_SECONDARY_SIDE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Original)
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: DIFF_FOCUS_OTHER_SIDE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: accessor => focusInDiffEditor(accessor, FocusTextDiffEditorMode.Toggle)
    });
    MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
        command: {
            id: TOGGLE_DIFF_SIDE_BY_SIDE,
            title: {
                value: localize('toggleInlineView', "Toggle Inline View"),
                original: 'Compare: Toggle Inline View'
            },
            category: localize('compare', "Compare")
        },
        when: TextCompareEditorActiveContext
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: accessor => toggleDiffIgnoreTrimWhitespace(accessor)
    });
}
function registerOpenEditorAPICommands() {
    function mixinContext(context, options, column) {
        if (!context) {
            return [options, column];
        }
        return [
            { ...context.editorOptions, ...(options ?? Object.create(null)) },
            context.sideBySide ? SIDE_GROUP : column
        ];
    }
    // partial, renderer-side API command to open editor
    // complements https://github.com/microsoft/vscode/blob/2b164efb0e6a5de3826bff62683eaeafe032284f/src/vs/workbench/api/common/extHostApiCommands.ts#L373
    CommandsRegistry.registerCommand({
        id: 'vscode.open',
        handler: (accessor, arg) => {
            accessor.get(ICommandService).executeCommand(API_OPEN_EDITOR_COMMAND_ID, arg);
        },
        description: {
            description: 'Opens the provided resource in the editor.',
            args: [{ name: 'Uri' }]
        }
    });
    CommandsRegistry.registerCommand(API_OPEN_EDITOR_COMMAND_ID, async function (accessor, resourceArg, columnAndOptions, label, context) {
        const editorService = accessor.get(IEditorService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const openerService = accessor.get(IOpenerService);
        const pathService = accessor.get(IPathService);
        const configurationService = accessor.get(IConfigurationService);
        const resourceOrString = typeof resourceArg === 'string' ? resourceArg : URI.revive(resourceArg);
        const [columnArg, optionsArg] = columnAndOptions ?? [];
        // use editor options or editor view column or resource scheme
        // as a hint to use the editor service for opening directly
        if (optionsArg || typeof columnArg === 'number' || matchesScheme(resourceOrString, Schemas.untitled)) {
            const [options, column] = mixinContext(context, optionsArg, columnArg);
            const resource = URI.isUri(resourceOrString) ? resourceOrString : URI.parse(resourceOrString);
            let input;
            if (isUntitledWithAssociatedResource(resource)) {
                // special case for untitled: we are getting a resource with meaningful
                // path from an extension to use for the untitled editor. as such, we
                // have to assume it as an associated resource to use when saving. we
                // do so by setting the `forceUntitled: true` and changing the scheme
                // to a file based one. the untitled editor service takes care to
                // associate the path properly then.
                input = { resource: resource.with({ scheme: pathService.defaultUriScheme }), forceUntitled: true, options, label };
            }
            else {
                // use any other resource as is
                input = { resource, options, label };
            }
            await editorService.openEditor(input, columnToEditorGroup(editorGroupService, configurationService, column));
        }
        // do not allow to execute commands from here
        else if (matchesScheme(resourceOrString, Schemas.command)) {
            return;
        }
        // finally, delegate to opener service
        else {
            await openerService.open(resourceOrString, { openToSide: context?.sideBySide, editorOptions: context?.editorOptions });
        }
    });
    // partial, renderer-side API command to open diff editor
    // complements https://github.com/microsoft/vscode/blob/2b164efb0e6a5de3826bff62683eaeafe032284f/src/vs/workbench/api/common/extHostApiCommands.ts#L397
    CommandsRegistry.registerCommand({
        id: 'vscode.diff',
        handler: (accessor, left, right, label) => {
            accessor.get(ICommandService).executeCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, left, right, label);
        },
        description: {
            description: 'Opens the provided resources in the diff editor to compare their contents.',
            args: [
                { name: 'left', description: 'Left-hand side resource of the diff editor' },
                { name: 'right', description: 'Right-hand side resource of the diff editor' },
                { name: 'title', description: 'Human readable title for the diff editor' },
            ]
        }
    });
    CommandsRegistry.registerCommand(API_OPEN_DIFF_EDITOR_COMMAND_ID, async function (accessor, originalResource, modifiedResource, labelAndOrDescription, columnAndOptions, context) {
        const editorService = accessor.get(IEditorService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const [columnArg, optionsArg] = columnAndOptions ?? [];
        const [options, column] = mixinContext(context, optionsArg, columnArg);
        let label = undefined;
        let description = undefined;
        if (typeof labelAndOrDescription === 'string') {
            label = labelAndOrDescription;
        }
        else if (labelAndOrDescription) {
            label = labelAndOrDescription.label;
            description = labelAndOrDescription.description;
        }
        await editorService.openEditor({
            original: { resource: URI.revive(originalResource) },
            modified: { resource: URI.revive(modifiedResource) },
            label,
            description,
            options
        }, columnToEditorGroup(editorGroupService, configurationService, column));
    });
    CommandsRegistry.registerCommand(API_OPEN_WITH_EDITOR_COMMAND_ID, (accessor, resource, id, columnAndOptions) => {
        const editorService = accessor.get(IEditorService);
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const configurationService = accessor.get(IConfigurationService);
        const [columnArg, optionsArg] = columnAndOptions ?? [];
        return editorService.openEditor({ resource: URI.revive(resource), options: { ...optionsArg, pinned: true, override: id } }, columnToEditorGroup(editorGroupsService, configurationService, columnArg));
    });
}
function registerOpenEditorAtIndexCommands() {
    const openEditorAtIndex = (accessor, editorIndex) => {
        const editorService = accessor.get(IEditorService);
        const activeEditorPane = editorService.activeEditorPane;
        if (activeEditorPane) {
            const editor = activeEditorPane.group.getEditorByIndex(editorIndex);
            if (editor) {
                editorService.openEditor(editor);
            }
        }
    };
    // This command takes in the editor index number to open as an argument
    CommandsRegistry.registerCommand({
        id: OPEN_EDITOR_AT_INDEX_COMMAND_ID,
        handler: openEditorAtIndex
    });
    // Keybindings to focus a specific index in the tab folder if tabs are enabled
    for (let i = 0; i < 9; i++) {
        const editorIndex = i;
        const visibleIndex = i + 1;
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: OPEN_EDITOR_AT_INDEX_COMMAND_ID + visibleIndex,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: 512 /* KeyMod.Alt */ | toKeyCode(visibleIndex),
            mac: { primary: 256 /* KeyMod.WinCtrl */ | toKeyCode(visibleIndex) },
            handler: accessor => openEditorAtIndex(accessor, editorIndex)
        });
    }
    function toKeyCode(index) {
        switch (index) {
            case 0: return 21 /* KeyCode.Digit0 */;
            case 1: return 22 /* KeyCode.Digit1 */;
            case 2: return 23 /* KeyCode.Digit2 */;
            case 3: return 24 /* KeyCode.Digit3 */;
            case 4: return 25 /* KeyCode.Digit4 */;
            case 5: return 26 /* KeyCode.Digit5 */;
            case 6: return 27 /* KeyCode.Digit6 */;
            case 7: return 28 /* KeyCode.Digit7 */;
            case 8: return 29 /* KeyCode.Digit8 */;
            case 9: return 30 /* KeyCode.Digit9 */;
        }
        throw new Error('invalid index');
    }
}
function registerFocusEditorGroupAtIndexCommands() {
    // Keybindings to focus a specific group (2-8) in the editor area
    for (let groupIndex = 1; groupIndex < 8; groupIndex++) {
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: toCommandId(groupIndex),
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: undefined,
            primary: 2048 /* KeyMod.CtrlCmd */ | toKeyCode(groupIndex),
            handler: accessor => {
                const editorGroupService = accessor.get(IEditorGroupsService);
                const configurationService = accessor.get(IConfigurationService);
                // To keep backwards compatibility (pre-grid), allow to focus a group
                // that does not exist as long as it is the next group after the last
                // opened group. Otherwise we return.
                if (groupIndex > editorGroupService.count) {
                    return;
                }
                // Group exists: just focus
                const groups = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
                if (groups[groupIndex]) {
                    return groups[groupIndex].focus();
                }
                // Group does not exist: create new by splitting the active one of the last group
                const direction = preferredSideBySideGroupDirection(configurationService);
                const lastGroup = editorGroupService.findGroup({ location: 1 /* GroupLocation.LAST */ });
                if (!lastGroup) {
                    return;
                }
                const newGroup = editorGroupService.addGroup(lastGroup, direction);
                // Focus
                newGroup.focus();
            }
        });
    }
    function toCommandId(index) {
        switch (index) {
            case 1: return 'workbench.action.focusSecondEditorGroup';
            case 2: return 'workbench.action.focusThirdEditorGroup';
            case 3: return 'workbench.action.focusFourthEditorGroup';
            case 4: return 'workbench.action.focusFifthEditorGroup';
            case 5: return 'workbench.action.focusSixthEditorGroup';
            case 6: return 'workbench.action.focusSeventhEditorGroup';
            case 7: return 'workbench.action.focusEighthEditorGroup';
        }
        throw new Error('Invalid index');
    }
    function toKeyCode(index) {
        switch (index) {
            case 1: return 23 /* KeyCode.Digit2 */;
            case 2: return 24 /* KeyCode.Digit3 */;
            case 3: return 25 /* KeyCode.Digit4 */;
            case 4: return 26 /* KeyCode.Digit5 */;
            case 5: return 27 /* KeyCode.Digit6 */;
            case 6: return 28 /* KeyCode.Digit7 */;
            case 7: return 29 /* KeyCode.Digit8 */;
        }
        throw new Error('Invalid index');
    }
}
export function splitEditor(editorGroupService, direction, context) {
    let sourceGroup;
    if (context && typeof context.groupId === 'number') {
        sourceGroup = editorGroupService.getGroup(context.groupId);
    }
    else {
        sourceGroup = editorGroupService.activeGroup;
    }
    if (!sourceGroup) {
        return;
    }
    // Add group
    const newGroup = editorGroupService.addGroup(sourceGroup, direction);
    // Split editor (if it can be split)
    let editorToCopy;
    if (context && typeof context.editorIndex === 'number') {
        editorToCopy = sourceGroup.getEditorByIndex(context.editorIndex);
    }
    else {
        editorToCopy = withNullAsUndefined(sourceGroup.activeEditor);
    }
    // Copy the editor to the new group, else create an empty group
    if (editorToCopy && !editorToCopy.hasCapability(8 /* EditorInputCapabilities.Singleton */)) {
        sourceGroup.copyEditor(editorToCopy, newGroup, { preserveFocus: context?.preserveFocus });
    }
    // Focus
    newGroup.focus();
}
function registerSplitEditorCommands() {
    [
        { id: SPLIT_EDITOR_UP, direction: 0 /* GroupDirection.UP */ },
        { id: SPLIT_EDITOR_DOWN, direction: 1 /* GroupDirection.DOWN */ },
        { id: SPLIT_EDITOR_LEFT, direction: 2 /* GroupDirection.LEFT */ },
        { id: SPLIT_EDITOR_RIGHT, direction: 3 /* GroupDirection.RIGHT */ }
    ].forEach(({ id, direction }) => {
        CommandsRegistry.registerCommand(id, function (accessor, resourceOrContext, context) {
            splitEditor(accessor.get(IEditorGroupsService), direction, getCommandsContext(resourceOrContext, context));
        });
    });
}
function registerCloseEditorCommands() {
    // A special handler for "Close Editor" depending on context
    // - keybindining: do not close sticky editors, rather open the next non-sticky editor
    // - menu: always close editor, even sticky ones
    function closeEditorHandler(accessor, forceCloseStickyEditors, resourceOrContext, context) {
        const editorGroupsService = accessor.get(IEditorGroupsService);
        const editorService = accessor.get(IEditorService);
        let keepStickyEditors = true;
        if (forceCloseStickyEditors) {
            keepStickyEditors = false; // explicitly close sticky editors
        }
        else if (resourceOrContext || context) {
            keepStickyEditors = false; // we have a context, as such this command was used e.g. from the tab context menu
        }
        // Without context: skip over sticky editor and select next if active editor is sticky
        if (keepStickyEditors && !resourceOrContext && !context) {
            const activeGroup = editorGroupsService.activeGroup;
            const activeEditor = activeGroup.activeEditor;
            if (activeEditor && activeGroup.isSticky(activeEditor)) {
                // Open next recently active in same group
                const nextNonStickyEditorInGroup = activeGroup.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
                if (nextNonStickyEditorInGroup) {
                    return activeGroup.openEditor(nextNonStickyEditorInGroup);
                }
                // Open next recently active across all groups
                const nextNonStickyEditorInAllGroups = editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */, { excludeSticky: true })[0];
                if (nextNonStickyEditorInAllGroups) {
                    return Promise.resolve(editorGroupsService.getGroup(nextNonStickyEditorInAllGroups.groupId)?.openEditor(nextNonStickyEditorInAllGroups.editor));
                }
            }
        }
        // With context: proceed to close editors as instructed
        const { editors, groups } = getEditorsContext(accessor, resourceOrContext, context);
        return Promise.all(groups.map(async (group) => {
            if (group) {
                const editorsToClose = coalesce(editors
                    .filter(editor => editor.groupId === group.id)
                    .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor))
                    .filter(editor => !keepStickyEditors || !group.isSticky(editor));
                await group.closeEditors(editorsToClose, { preserveFocus: context?.preserveFocus });
            }
        }));
    }
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITOR_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
        handler: (accessor, resourceOrContext, context) => {
            return closeEditorHandler(accessor, false, resourceOrContext, context);
        }
    });
    CommandsRegistry.registerCommand(CLOSE_PINNED_EDITOR_COMMAND_ID, (accessor, resourceOrContext, context) => {
        return closeEditorHandler(accessor, true /* force close pinned editors */, resourceOrContext, context);
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITORS_IN_GROUP_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 53 /* KeyCode.KeyW */),
        handler: (accessor, resourceOrContext, context) => {
            return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                if (group) {
                    await group.closeAllEditors({ excludeSticky: true });
                    return;
                }
            }));
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITOR_GROUP_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ContextKeyExpr.and(ActiveEditorGroupEmptyContext, MultipleEditorGroupsContext),
        primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */,
        win: { primary: 2048 /* KeyMod.CtrlCmd */ | 62 /* KeyCode.F4 */, secondary: [2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */] },
        handler: (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const commandsContext = getCommandsContext(resourceOrContext, context);
            let group;
            if (commandsContext && typeof commandsContext.groupId === 'number') {
                group = editorGroupService.getGroup(commandsContext.groupId);
            }
            else {
                group = editorGroupService.activeGroup;
            }
            if (group) {
                editorGroupService.removeGroup(group);
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_SAVED_EDITORS_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 51 /* KeyCode.KeyU */),
        handler: (accessor, resourceOrContext, context) => {
            return Promise.all(getEditorsContext(accessor, resourceOrContext, context).groups.map(async (group) => {
                if (group) {
                    await group.closeEditors({ savedOnly: true, excludeSticky: true }, { preserveFocus: context?.preserveFocus });
                }
            }));
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_OTHER_EDITORS_IN_GROUP_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 50 /* KeyCode.KeyT */ },
        handler: (accessor, resourceOrContext, context) => {
            const { editors, groups } = getEditorsContext(accessor, resourceOrContext, context);
            return Promise.all(groups.map(async (group) => {
                if (group) {
                    const editorsToKeep = editors
                        .filter(editor => editor.groupId === group.id)
                        .map(editor => typeof editor.editorIndex === 'number' ? group.getEditorByIndex(editor.editorIndex) : group.activeEditor);
                    const editorsToClose = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: true }).filter(editor => !editorsToKeep.includes(editor));
                    for (const editorToKeep of editorsToKeep) {
                        if (editorToKeep) {
                            group.pinEditor(editorToKeep);
                        }
                    }
                    await group.closeEditors(editorsToClose, { preserveFocus: context?.preserveFocus });
                }
            }));
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: CLOSE_EDITORS_TO_THE_RIGHT_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (group && editor) {
                if (group.activeEditor) {
                    group.pinEditor(group.activeEditor);
                }
                await group.closeEditors({ direction: 1 /* CloseDirection.RIGHT */, except: editor, excludeSticky: true }, { preserveFocus: context?.preserveFocus });
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: REOPEN_WITH_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const editorService = accessor.get(IEditorService);
            const editorResolverService = accessor.get(IEditorResolverService);
            const telemetryService = accessor.get(ITelemetryService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (!editor) {
                return;
            }
            const untypedEditor = editor.toUntyped();
            // Resolver can only resolve untyped editors
            if (!untypedEditor) {
                return;
            }
            untypedEditor.options = { ...editorService.activeEditorPane?.options, override: EditorResolution.PICK };
            const resolvedEditor = await editorResolverService.resolveEditor(untypedEditor, group);
            if (!isEditorInputWithOptionsAndGroup(resolvedEditor)) {
                return;
            }
            // Replace editor with resolved one
            await resolvedEditor.group.replaceEditors([
                {
                    editor: editor,
                    replacement: resolvedEditor.editor,
                    forceReplaceDirty: editor.resource?.scheme === Schemas.untitled,
                    options: resolvedEditor.options
                }
            ]);
            telemetryService.publicLog2('workbenchEditorReopen', {
                scheme: editor.resource?.scheme ?? '',
                ext: editor.resource ? extname(editor.resource) : '',
                from: editor.editorId ?? '',
                to: resolvedEditor.editor.editorId ?? ''
            });
            // Make sure it becomes active too
            await resolvedEditor.group.openEditor(resolvedEditor.editor);
        }
    });
    CommandsRegistry.registerCommand(CLOSE_EDITORS_AND_GROUP_COMMAND_ID, async (accessor, resourceOrContext, context) => {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const { group } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
        if (group) {
            await group.closeAllEditors();
            if (group.count === 0 && editorGroupService.getGroup(group.id) /* could be gone by now */) {
                editorGroupService.removeGroup(group); // only remove group if it is now empty
            }
        }
    });
}
function registerFocusEditorGroupWihoutWrapCommands() {
    const commands = [
        {
            id: FOCUS_LEFT_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 2 /* GroupDirection.LEFT */
        },
        {
            id: FOCUS_RIGHT_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 3 /* GroupDirection.RIGHT */
        },
        {
            id: FOCUS_ABOVE_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 0 /* GroupDirection.UP */,
        },
        {
            id: FOCUS_BELOW_GROUP_WITHOUT_WRAP_COMMAND_ID,
            direction: 1 /* GroupDirection.DOWN */
        }
    ];
    for (const command of commands) {
        CommandsRegistry.registerCommand(command.id, async (accessor) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const group = editorGroupService.findGroup({ direction: command.direction }, editorGroupService.activeGroup, false);
            group?.focus();
        });
    }
}
function registerSplitEditorInGroupCommands() {
    async function splitEditorInGroup(accessor, resourceOrContext, context) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const instantiationService = accessor.get(IInstantiationService);
        const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
        if (!editor) {
            return;
        }
        await group.replaceEditors([{
                editor,
                replacement: instantiationService.createInstance(SideBySideEditorInput, undefined, undefined, editor, editor),
                forceReplaceDirty: true
            }]);
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: SPLIT_EDITOR_IN_GROUP,
                title: { value: localize('splitEditorInGroup', "Split Editor in Group"), original: 'Split Editor in Group' },
                category: Categories.View,
                precondition: ActiveEditorCanSplitInGroupContext,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: ActiveEditorCanSplitInGroupContext,
                    primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Backslash */)
                }
            });
        }
        run(accessor, resourceOrContext, context) {
            return splitEditorInGroup(accessor, resourceOrContext, context);
        }
    });
    async function joinEditorInGroup(accessor, resourceOrContext, context) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
        if (!(editor instanceof SideBySideEditorInput)) {
            return;
        }
        let options = undefined;
        const activeEditorPane = group.activeEditorPane;
        if (activeEditorPane instanceof SideBySideEditor && group.activeEditor === editor) {
            for (const pane of [activeEditorPane.getPrimaryEditorPane(), activeEditorPane.getSecondaryEditorPane()]) {
                if (pane?.hasFocus()) {
                    options = { viewState: pane.getViewState() };
                    break;
                }
            }
        }
        await group.replaceEditors([{
                editor,
                replacement: editor.primary,
                options
            }]);
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: JOIN_EDITOR_IN_GROUP,
                title: { value: localize('joinEditorInGroup', "Join Editor in Group"), original: 'Join Editor in Group' },
                category: Categories.View,
                precondition: SideBySideEditorActiveContext,
                f1: true,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: SideBySideEditorActiveContext,
                    primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 88 /* KeyCode.Backslash */)
                }
            });
        }
        run(accessor, resourceOrContext, context) {
            return joinEditorInGroup(accessor, resourceOrContext, context);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: TOGGLE_SPLIT_EDITOR_IN_GROUP,
                title: { value: localize('toggleJoinEditorInGroup', "Toggle Split Editor in Group"), original: 'Toggle Split Editor in Group' },
                category: Categories.View,
                precondition: ContextKeyExpr.or(ActiveEditorCanSplitInGroupContext, SideBySideEditorActiveContext),
                f1: true
            });
        }
        async run(accessor, resourceOrContext, context) {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const { editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (editor instanceof SideBySideEditorInput) {
                await joinEditorInGroup(accessor, resourceOrContext, context);
            }
            else if (editor) {
                await splitEditorInGroup(accessor, resourceOrContext, context);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: TOGGLE_SPLIT_EDITOR_IN_GROUP_LAYOUT,
                title: { value: localize('toggleSplitEditorInGroupLayout', "Toggle Layout of Split Editor in Group"), original: 'Toggle Layout of Split Editor in Group' },
                category: Categories.View,
                precondition: SideBySideEditorActiveContext,
                f1: true
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(IConfigurationService);
            const currentSetting = configurationService.getValue(SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING);
            let newSetting;
            if (currentSetting !== 'horizontal') {
                newSetting = 'horizontal';
            }
            else {
                newSetting = 'vertical';
            }
            return configurationService.updateValue(SideBySideEditor.SIDE_BY_SIDE_LAYOUT_SETTING, newSetting);
        }
    });
}
function registerFocusSideEditorsCommands() {
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: FOCUS_FIRST_SIDE_EDITOR,
                title: { value: localize('focusLeftSideEditor', "Focus First Side in Active Editor"), original: 'Focus First Side in Active Editor' },
                category: Categories.View,
                precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(IEditorService);
            const commandService = accessor.get(ICommandService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof SideBySideEditor) {
                activeEditorPane.getSecondaryEditorPane()?.focus();
            }
            else if (activeEditorPane instanceof TextDiffEditor) {
                await commandService.executeCommand(DIFF_FOCUS_SECONDARY_SIDE);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: FOCUS_SECOND_SIDE_EDITOR,
                title: { value: localize('focusRightSideEditor', "Focus Second Side in Active Editor"), original: 'Focus Second Side in Active Editor' },
                category: Categories.View,
                precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(IEditorService);
            const commandService = accessor.get(ICommandService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof SideBySideEditor) {
                activeEditorPane.getPrimaryEditorPane()?.focus();
            }
            else if (activeEditorPane instanceof TextDiffEditor) {
                await commandService.executeCommand(DIFF_FOCUS_PRIMARY_SIDE);
            }
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: FOCUS_OTHER_SIDE_EDITOR,
                title: { value: localize('focusOtherSideEditor', "Focus Other Side in Active Editor"), original: 'Focus Other Side in Active Editor' },
                category: Categories.View,
                precondition: ContextKeyExpr.or(SideBySideEditorActiveContext, TextCompareEditorActiveContext),
                f1: true
            });
        }
        async run(accessor) {
            const editorService = accessor.get(IEditorService);
            const commandService = accessor.get(ICommandService);
            const activeEditorPane = editorService.activeEditorPane;
            if (activeEditorPane instanceof SideBySideEditor) {
                if (activeEditorPane.getPrimaryEditorPane()?.hasFocus()) {
                    activeEditorPane.getSecondaryEditorPane()?.focus();
                }
                else {
                    activeEditorPane.getPrimaryEditorPane()?.focus();
                }
            }
            else if (activeEditorPane instanceof TextDiffEditor) {
                await commandService.executeCommand(DIFF_FOCUS_OTHER_SIDE);
            }
        }
    });
}
function registerOtherEditorCommands() {
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: KEEP_EDITOR_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 3 /* KeyCode.Enter */),
        handler: async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (group && editor) {
                return group.pinEditor(editor);
            }
        }
    });
    CommandsRegistry.registerCommand({
        id: TOGGLE_KEEP_EDITORS_COMMAND_ID,
        handler: accessor => {
            const configurationService = accessor.get(IConfigurationService);
            const currentSetting = configurationService.getValue('workbench.editor.enablePreview');
            const newSetting = currentSetting === true ? false : true;
            configurationService.updateValue('workbench.editor.enablePreview', newSetting);
        }
    });
    function setEditorGroupLock(accessor, resourceOrContext, context, locked) {
        const editorGroupService = accessor.get(IEditorGroupsService);
        const { group } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
        group?.lock(locked ?? !group.isLocked);
    }
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: TOGGLE_LOCK_GROUP_COMMAND_ID,
                title: { value: localize('toggleEditorGroupLock', "Toggle Editor Group Lock"), original: 'Toggle Editor Group Lock' },
                category: Categories.View,
                precondition: MultipleEditorGroupsContext,
                f1: true
            });
        }
        async run(accessor, resourceOrContext, context) {
            setEditorGroupLock(accessor, resourceOrContext, context);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: LOCK_GROUP_COMMAND_ID,
                title: { value: localize('lockEditorGroup', "Lock Editor Group"), original: 'Lock Editor Group' },
                category: Categories.View,
                precondition: ContextKeyExpr.and(MultipleEditorGroupsContext, ActiveEditorGroupLockedContext.toNegated()),
                f1: true
            });
        }
        async run(accessor, resourceOrContext, context) {
            setEditorGroupLock(accessor, resourceOrContext, context, true);
        }
    });
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: UNLOCK_GROUP_COMMAND_ID,
                title: { value: localize('unlockEditorGroup', "Unlock Editor Group"), original: 'Unlock Editor Group' },
                precondition: ContextKeyExpr.and(MultipleEditorGroupsContext, ActiveEditorGroupLockedContext),
                category: Categories.View,
                f1: true
            });
        }
        async run(accessor, resourceOrContext, context) {
            setEditorGroupLock(accessor, resourceOrContext, context, false);
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: PIN_EDITOR_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ActiveEditorStickyContext.toNegated(),
        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */),
        handler: async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (group && editor) {
                return group.stickEditor(editor);
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: UNPIN_EDITOR_COMMAND_ID,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: ActiveEditorStickyContext,
        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */),
        handler: async (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const { group, editor } = resolveCommandsContext(editorGroupService, getCommandsContext(resourceOrContext, context));
            if (group && editor) {
                return group.unstickEditor(editor);
            }
        }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: SHOW_EDITORS_IN_GROUP,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: undefined,
        primary: undefined,
        handler: (accessor, resourceOrContext, context) => {
            const editorGroupService = accessor.get(IEditorGroupsService);
            const quickInputService = accessor.get(IQuickInputService);
            const commandsContext = getCommandsContext(resourceOrContext, context);
            if (commandsContext && typeof commandsContext.groupId === 'number') {
                const group = editorGroupService.getGroup(commandsContext.groupId);
                if (group) {
                    editorGroupService.activateGroup(group); // we need the group to be active
                }
            }
            return quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
        }
    });
}
function getEditorsContext(accessor, resourceOrContext, context) {
    const editorGroupService = accessor.get(IEditorGroupsService);
    const listService = accessor.get(IListService);
    const editorContext = getMultiSelectedEditorContexts(getCommandsContext(resourceOrContext, context), listService, editorGroupService);
    const activeGroup = editorGroupService.activeGroup;
    if (editorContext.length === 0 && activeGroup.activeEditor) {
        // add the active editor as fallback
        editorContext.push({
            groupId: activeGroup.id,
            editorIndex: activeGroup.getIndexOfEditor(activeGroup.activeEditor)
        });
    }
    return {
        editors: editorContext,
        groups: distinct(editorContext.map(context => context.groupId)).map(groupId => editorGroupService.getGroup(groupId))
    };
}
function getCommandsContext(resourceOrContext, context) {
    if (URI.isUri(resourceOrContext)) {
        return context;
    }
    if (resourceOrContext && typeof resourceOrContext.groupId === 'number') {
        return resourceOrContext;
    }
    if (context && typeof context.groupId === 'number') {
        return context;
    }
    return undefined;
}
function resolveCommandsContext(editorGroupService, context) {
    // Resolve from context
    let group = context && typeof context.groupId === 'number' ? editorGroupService.getGroup(context.groupId) : undefined;
    let editor = group && context && typeof context.editorIndex === 'number' ? withNullAsUndefined(group.getEditorByIndex(context.editorIndex)) : undefined;
    // Fallback to active group as needed
    if (!group) {
        group = editorGroupService.activeGroup;
    }
    // Fallback to active editor as needed
    if (!editor) {
        editor = withNullAsUndefined(group.activeEditor);
    }
    return { group, editor };
}
export function getMultiSelectedEditorContexts(editorContext, listService, editorGroupService) {
    // First check for a focused list to return the selected items from
    const list = listService.lastFocusedList;
    if (list instanceof List && list.getHTMLElement() === document.activeElement) {
        const elementToContext = (element) => {
            if (isEditorGroup(element)) {
                return { groupId: element.id, editorIndex: undefined };
            }
            const group = editorGroupService.getGroup(element.groupId);
            return { groupId: element.groupId, editorIndex: group ? group.getIndexOfEditor(element.editor) : -1 };
        };
        const onlyEditorGroupAndEditor = (e) => isEditorGroup(e) || isEditorIdentifier(e);
        const focusedElements = list.getFocusedElements().filter(onlyEditorGroupAndEditor);
        const focus = editorContext ? editorContext : focusedElements.length ? focusedElements.map(elementToContext)[0] : undefined; // need to take into account when editor context is { group: group }
        if (focus) {
            const selection = list.getSelectedElements().filter(onlyEditorGroupAndEditor);
            // Only respect selection if it contains focused element
            if (selection?.some(s => {
                if (isEditorGroup(s)) {
                    return s.id === focus.groupId;
                }
                const group = editorGroupService.getGroup(s.groupId);
                return s.groupId === focus.groupId && (group ? group.getIndexOfEditor(s.editor) : -1) === focus.editorIndex;
            })) {
                return selection.map(elementToContext);
            }
            return [focus];
        }
    }
    // Otherwise go with passed in context
    return !!editorContext ? [editorContext] : [];
}
export function setup() {
    registerActiveEditorMoveCopyCommand();
    registerEditorGroupsLayoutCommand();
    registerDiffEditorCommands();
    registerOpenEditorAPICommands();
    registerOpenEditorAtIndexCommands();
    registerCloseEditorCommands();
    registerOtherEditorCommands();
    registerSplitEditorInGroupCommands();
    registerFocusSideEditorsCommands();
    registerFocusEditorGroupAtIndexCommands();
    registerSplitEditorCommands();
    registerFocusEditorGroupWihoutWrapCommands();
}
