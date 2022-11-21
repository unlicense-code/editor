/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { localize } from 'vs/nls';
import { Action } from 'vs/base/common/actions';
import { firstOrDefault } from 'vs/base/common/arrays';
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor } from 'vs/workbench/common/editor';
import { SideBySideEditorInput } from 'vs/workbench/common/editor/sideBySideEditorInput';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { CLOSE_EDITOR_COMMAND_ID, MOVE_ACTIVE_EDITOR_COMMAND_ID, SPLIT_EDITOR_LEFT, SPLIT_EDITOR_RIGHT, SPLIT_EDITOR_UP, SPLIT_EDITOR_DOWN, splitEditor, LAYOUT_EDITOR_GROUPS_COMMAND_ID, UNPIN_EDITOR_COMMAND_ID, COPY_ACTIVE_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { IEditorGroupsService, preferredSideBySideGroupDirection } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ItemActivation, IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { AllEditorsByMostRecentlyUsedQuickAccess, ActiveGroupEditorsByMostRecentlyUsedQuickAccess, AllEditorsByAppearanceQuickAccess } from 'vs/workbench/browser/parts/editor/editorQuickAccess';
import { Codicon } from 'vs/base/common/codicons';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { isLinux, isNative, isWindows } from 'vs/base/common/platform';
import { Action2, MenuId } from 'vs/platform/actions/common/actions';
import { ContextKeyExpr } from 'vs/platform/contextkey/common/contextkey';
import { ILogService } from 'vs/platform/log/common/log';
export class ExecuteCommandAction extends Action {
    commandId;
    commandService;
    commandArgs;
    constructor(id, label, commandId, commandService, commandArgs) {
        super(id, label);
        this.commandId = commandId;
        this.commandService = commandService;
        this.commandArgs = commandArgs;
    }
    run() {
        return this.commandService.executeCommand(this.commandId, this.commandArgs);
    }
}
class AbstractSplitEditorAction extends Action {
    editorGroupService;
    configurationService;
    toDispose = this._register(new DisposableStore());
    direction;
    constructor(id, label, editorGroupService, configurationService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
        this.configurationService = configurationService;
        this.direction = this.getDirection();
        this.registerListeners();
    }
    getDirection() {
        return preferredSideBySideGroupDirection(this.configurationService);
    }
    registerListeners() {
        this.toDispose.add(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('workbench.editor.openSideBySideDirection')) {
                this.direction = preferredSideBySideGroupDirection(this.configurationService);
            }
        }));
    }
    async run(context) {
        splitEditor(this.editorGroupService, this.direction, context);
    }
}
let SplitEditorAction = class SplitEditorAction extends AbstractSplitEditorAction {
    static ID = 'workbench.action.splitEditor';
    static LABEL = localize('splitEditor', "Split Editor");
    constructor(id, label, editorGroupService, configurationService) {
        super(id, label, editorGroupService, configurationService);
    }
};
SplitEditorAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IConfigurationService)
], SplitEditorAction);
export { SplitEditorAction };
let SplitEditorOrthogonalAction = class SplitEditorOrthogonalAction extends AbstractSplitEditorAction {
    static ID = 'workbench.action.splitEditorOrthogonal';
    static LABEL = localize('splitEditorOrthogonal', "Split Editor Orthogonal");
    constructor(id, label, editorGroupService, configurationService) {
        super(id, label, editorGroupService, configurationService);
    }
    getDirection() {
        const direction = preferredSideBySideGroupDirection(this.configurationService);
        return direction === 3 /* GroupDirection.RIGHT */ ? 1 /* GroupDirection.DOWN */ : 3 /* GroupDirection.RIGHT */;
    }
};
SplitEditorOrthogonalAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IConfigurationService)
], SplitEditorOrthogonalAction);
export { SplitEditorOrthogonalAction };
let SplitEditorLeftAction = class SplitEditorLeftAction extends ExecuteCommandAction {
    static ID = SPLIT_EDITOR_LEFT;
    static LABEL = localize('splitEditorGroupLeft', "Split Editor Left");
    constructor(id, label, commandService) {
        super(id, label, SPLIT_EDITOR_LEFT, commandService);
    }
};
SplitEditorLeftAction = __decorate([
    __param(2, ICommandService)
], SplitEditorLeftAction);
export { SplitEditorLeftAction };
let SplitEditorRightAction = class SplitEditorRightAction extends ExecuteCommandAction {
    static ID = SPLIT_EDITOR_RIGHT;
    static LABEL = localize('splitEditorGroupRight', "Split Editor Right");
    constructor(id, label, commandService) {
        super(id, label, SPLIT_EDITOR_RIGHT, commandService);
    }
};
SplitEditorRightAction = __decorate([
    __param(2, ICommandService)
], SplitEditorRightAction);
export { SplitEditorRightAction };
let SplitEditorUpAction = class SplitEditorUpAction extends ExecuteCommandAction {
    static ID = SPLIT_EDITOR_UP;
    static LABEL = localize('splitEditorGroupUp', "Split Editor Up");
    constructor(id, label, commandService) {
        super(id, label, SPLIT_EDITOR_UP, commandService);
    }
};
SplitEditorUpAction = __decorate([
    __param(2, ICommandService)
], SplitEditorUpAction);
export { SplitEditorUpAction };
let SplitEditorDownAction = class SplitEditorDownAction extends ExecuteCommandAction {
    static ID = SPLIT_EDITOR_DOWN;
    static LABEL = localize('splitEditorGroupDown', "Split Editor Down");
    constructor(id, label, commandService) {
        super(id, label, SPLIT_EDITOR_DOWN, commandService);
    }
};
SplitEditorDownAction = __decorate([
    __param(2, ICommandService)
], SplitEditorDownAction);
export { SplitEditorDownAction };
let JoinTwoGroupsAction = class JoinTwoGroupsAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.joinTwoGroups';
    static LABEL = localize('joinTwoGroups', "Join Editor Group with Next Group");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run(context) {
        let sourceGroup;
        if (context && typeof context.groupId === 'number') {
            sourceGroup = this.editorGroupService.getGroup(context.groupId);
        }
        else {
            sourceGroup = this.editorGroupService.activeGroup;
        }
        if (sourceGroup) {
            const targetGroupDirections = [3 /* GroupDirection.RIGHT */, 1 /* GroupDirection.DOWN */, 2 /* GroupDirection.LEFT */, 0 /* GroupDirection.UP */];
            for (const targetGroupDirection of targetGroupDirections) {
                const targetGroup = this.editorGroupService.findGroup({ direction: targetGroupDirection }, sourceGroup);
                if (targetGroup && sourceGroup !== targetGroup) {
                    this.editorGroupService.mergeGroup(sourceGroup, targetGroup);
                    break;
                }
            }
        }
    }
};
JoinTwoGroupsAction = __decorate([
    __param(2, IEditorGroupsService)
], JoinTwoGroupsAction);
export { JoinTwoGroupsAction };
let JoinAllGroupsAction = class JoinAllGroupsAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.joinAllGroups';
    static LABEL = localize('joinAllGroups', "Join All Editor Groups");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run() {
        this.editorGroupService.mergeAllGroups();
    }
};
JoinAllGroupsAction = __decorate([
    __param(2, IEditorGroupsService)
], JoinAllGroupsAction);
export { JoinAllGroupsAction };
let NavigateBetweenGroupsAction = class NavigateBetweenGroupsAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.navigateEditorGroups';
    static LABEL = localize('navigateEditorGroups', "Navigate Between Editor Groups");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run() {
        const nextGroup = this.editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, this.editorGroupService.activeGroup, true);
        nextGroup?.focus();
    }
};
NavigateBetweenGroupsAction = __decorate([
    __param(2, IEditorGroupsService)
], NavigateBetweenGroupsAction);
export { NavigateBetweenGroupsAction };
let FocusActiveGroupAction = class FocusActiveGroupAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.focusActiveEditorGroup';
    static LABEL = localize('focusActiveEditorGroup', "Focus Active Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run() {
        this.editorGroupService.activeGroup.focus();
    }
};
FocusActiveGroupAction = __decorate([
    __param(2, IEditorGroupsService)
], FocusActiveGroupAction);
export { FocusActiveGroupAction };
let AbstractFocusGroupAction = class AbstractFocusGroupAction extends Action {
    scope;
    editorGroupService;
    constructor(id, label, scope, editorGroupService) {
        super(id, label);
        this.scope = scope;
        this.editorGroupService = editorGroupService;
    }
    async run() {
        const group = this.editorGroupService.findGroup(this.scope, this.editorGroupService.activeGroup, true);
        group?.focus();
    }
};
AbstractFocusGroupAction = __decorate([
    __param(3, IEditorGroupsService)
], AbstractFocusGroupAction);
let FocusFirstGroupAction = class FocusFirstGroupAction extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusFirstEditorGroup';
    static LABEL = localize('focusFirstEditorGroup', "Focus First Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label, { location: 0 /* GroupLocation.FIRST */ }, editorGroupService);
    }
};
FocusFirstGroupAction = __decorate([
    __param(2, IEditorGroupsService)
], FocusFirstGroupAction);
export { FocusFirstGroupAction };
let FocusLastGroupAction = class FocusLastGroupAction extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusLastEditorGroup';
    static LABEL = localize('focusLastEditorGroup', "Focus Last Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label, { location: 1 /* GroupLocation.LAST */ }, editorGroupService);
    }
};
FocusLastGroupAction = __decorate([
    __param(2, IEditorGroupsService)
], FocusLastGroupAction);
export { FocusLastGroupAction };
let FocusNextGroup = class FocusNextGroup extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusNextGroup';
    static LABEL = localize('focusNextGroup', "Focus Next Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label, { location: 2 /* GroupLocation.NEXT */ }, editorGroupService);
    }
};
FocusNextGroup = __decorate([
    __param(2, IEditorGroupsService)
], FocusNextGroup);
export { FocusNextGroup };
let FocusPreviousGroup = class FocusPreviousGroup extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusPreviousGroup';
    static LABEL = localize('focusPreviousGroup', "Focus Previous Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label, { location: 3 /* GroupLocation.PREVIOUS */ }, editorGroupService);
    }
};
FocusPreviousGroup = __decorate([
    __param(2, IEditorGroupsService)
], FocusPreviousGroup);
export { FocusPreviousGroup };
let FocusLeftGroup = class FocusLeftGroup extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusLeftGroup';
    static LABEL = localize('focusLeftGroup', "Focus Left Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label, { direction: 2 /* GroupDirection.LEFT */ }, editorGroupService);
    }
};
FocusLeftGroup = __decorate([
    __param(2, IEditorGroupsService)
], FocusLeftGroup);
export { FocusLeftGroup };
let FocusRightGroup = class FocusRightGroup extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusRightGroup';
    static LABEL = localize('focusRightGroup', "Focus Right Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label, { direction: 3 /* GroupDirection.RIGHT */ }, editorGroupService);
    }
};
FocusRightGroup = __decorate([
    __param(2, IEditorGroupsService)
], FocusRightGroup);
export { FocusRightGroup };
let FocusAboveGroup = class FocusAboveGroup extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusAboveGroup';
    static LABEL = localize('focusAboveGroup', "Focus Editor Group Above");
    constructor(id, label, editorGroupService) {
        super(id, label, { direction: 0 /* GroupDirection.UP */ }, editorGroupService);
    }
};
FocusAboveGroup = __decorate([
    __param(2, IEditorGroupsService)
], FocusAboveGroup);
export { FocusAboveGroup };
let FocusBelowGroup = class FocusBelowGroup extends AbstractFocusGroupAction {
    static ID = 'workbench.action.focusBelowGroup';
    static LABEL = localize('focusBelowGroup', "Focus Editor Group Below");
    constructor(id, label, editorGroupService) {
        super(id, label, { direction: 1 /* GroupDirection.DOWN */ }, editorGroupService);
    }
};
FocusBelowGroup = __decorate([
    __param(2, IEditorGroupsService)
], FocusBelowGroup);
export { FocusBelowGroup };
let CloseEditorAction = class CloseEditorAction extends Action {
    commandService;
    static ID = 'workbench.action.closeActiveEditor';
    static LABEL = localize('closeEditor', "Close Editor");
    constructor(id, label, commandService) {
        super(id, label, Codicon.close.classNames);
        this.commandService = commandService;
    }
    run(context) {
        return this.commandService.executeCommand(CLOSE_EDITOR_COMMAND_ID, undefined, context);
    }
};
CloseEditorAction = __decorate([
    __param(2, ICommandService)
], CloseEditorAction);
export { CloseEditorAction };
let UnpinEditorAction = class UnpinEditorAction extends Action {
    commandService;
    static ID = 'workbench.action.unpinActiveEditor';
    static LABEL = localize('unpinEditor', "Unpin Editor");
    constructor(id, label, commandService) {
        super(id, label, Codicon.pinned.classNames);
        this.commandService = commandService;
    }
    run(context) {
        return this.commandService.executeCommand(UNPIN_EDITOR_COMMAND_ID, undefined, context);
    }
};
UnpinEditorAction = __decorate([
    __param(2, ICommandService)
], UnpinEditorAction);
export { UnpinEditorAction };
let CloseOneEditorAction = class CloseOneEditorAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.closeActiveEditor';
    static LABEL = localize('closeOneEditor', "Close");
    constructor(id, label, editorGroupService) {
        super(id, label, Codicon.close.classNames);
        this.editorGroupService = editorGroupService;
    }
    async run(context) {
        let group;
        let editorIndex;
        if (context) {
            group = this.editorGroupService.getGroup(context.groupId);
            if (group) {
                editorIndex = context.editorIndex; // only allow editor at index if group is valid
            }
        }
        if (!group) {
            group = this.editorGroupService.activeGroup;
        }
        // Close specific editor in group
        if (typeof editorIndex === 'number') {
            const editorAtIndex = group.getEditorByIndex(editorIndex);
            if (editorAtIndex) {
                await group.closeEditor(editorAtIndex, { preserveFocus: context?.preserveFocus });
                return;
            }
        }
        // Otherwise close active editor in group
        if (group.activeEditor) {
            await group.closeEditor(group.activeEditor, { preserveFocus: context?.preserveFocus });
            return;
        }
    }
};
CloseOneEditorAction = __decorate([
    __param(2, IEditorGroupsService)
], CloseOneEditorAction);
export { CloseOneEditorAction };
let RevertAndCloseEditorAction = class RevertAndCloseEditorAction extends Action {
    editorService;
    logService;
    static ID = 'workbench.action.revertAndCloseActiveEditor';
    static LABEL = localize('revertAndCloseActiveEditor', "Revert and Close Editor");
    constructor(id, label, editorService, logService) {
        super(id, label);
        this.editorService = editorService;
        this.logService = logService;
    }
    async run() {
        const activeEditorPane = this.editorService.activeEditorPane;
        if (activeEditorPane) {
            const editor = activeEditorPane.input;
            const group = activeEditorPane.group;
            // first try a normal revert where the contents of the editor are restored
            try {
                await this.editorService.revert({ editor, groupId: group.id });
            }
            catch (error) {
                this.logService.error(error);
                // if that fails, since we are about to close the editor, we accept that
                // the editor cannot be reverted and instead do a soft revert that just
                // enables us to close the editor. With this, a user can always close a
                // dirty editor even when reverting fails.
                await this.editorService.revert({ editor, groupId: group.id }, { soft: true });
            }
            await group.closeEditor(editor);
        }
    }
};
RevertAndCloseEditorAction = __decorate([
    __param(2, IEditorService),
    __param(3, ILogService)
], RevertAndCloseEditorAction);
export { RevertAndCloseEditorAction };
let CloseLeftEditorsInGroupAction = class CloseLeftEditorsInGroupAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.closeEditorsToTheLeft';
    static LABEL = localize('closeEditorsToTheLeft', "Close Editors to the Left in Group");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run(context) {
        const { group, editor } = this.getTarget(context);
        if (group && editor) {
            await group.closeEditors({ direction: 0 /* CloseDirection.LEFT */, except: editor, excludeSticky: true });
        }
    }
    getTarget(context) {
        if (context) {
            return { editor: context.editor, group: this.editorGroupService.getGroup(context.groupId) };
        }
        // Fallback to active group
        return { group: this.editorGroupService.activeGroup, editor: this.editorGroupService.activeGroup.activeEditor };
    }
};
CloseLeftEditorsInGroupAction = __decorate([
    __param(2, IEditorGroupsService)
], CloseLeftEditorsInGroupAction);
export { CloseLeftEditorsInGroupAction };
class AbstractCloseAllAction extends Action {
    fileDialogService;
    editorGroupService;
    editorService;
    filesConfigurationService;
    constructor(id, label, clazz, fileDialogService, editorGroupService, editorService, filesConfigurationService) {
        super(id, label, clazz);
        this.fileDialogService = fileDialogService;
        this.editorGroupService = editorGroupService;
        this.editorService = editorService;
        this.filesConfigurationService = filesConfigurationService;
    }
    get groupsToClose() {
        const groupsToClose = [];
        // Close editors in reverse order of their grid appearance so that the editor
        // group that is the first (top-left) remains. This helps to keep view state
        // for editors around that have been opened in this visually first group.
        const groups = this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
        for (let i = groups.length - 1; i >= 0; i--) {
            groupsToClose.push(groups[i]);
        }
        return groupsToClose;
    }
    async run() {
        // Depending on the editor and auto save configuration,
        // split editors into buckets for handling confirmation
        const dirtyEditorsWithDefaultConfirm = new Set();
        const dirtyAutoSaveOnFocusChangeEditors = new Set();
        const dirtyAutoSaveOnWindowChangeEditors = new Set();
        const editorsWithCustomConfirm = new Map();
        for (const { editor, groupId } of this.editorService.getEditors(1 /* EditorsOrder.SEQUENTIAL */, { excludeSticky: this.excludeSticky })) {
            let confirmClose = false;
            if (editor.closeHandler) {
                confirmClose = editor.closeHandler.showConfirm(); // custom handling of confirmation on close
            }
            else {
                confirmClose = editor.isDirty() && !editor.isSaving(); // default confirm only when dirty and not saving
            }
            if (!confirmClose) {
                continue;
            }
            // Editor has custom confirm implementation
            if (typeof editor.closeHandler?.confirm === 'function') {
                let customEditorsToConfirm = editorsWithCustomConfirm.get(editor.typeId);
                if (!customEditorsToConfirm) {
                    customEditorsToConfirm = new Set();
                    editorsWithCustomConfirm.set(editor.typeId, customEditorsToConfirm);
                }
                customEditorsToConfirm.add({ editor, groupId });
            }
            // Editor will be saved on focus change when a
            // dialog appears, so just track that separate
            else if (this.filesConfigurationService.getAutoSaveMode() === 3 /* AutoSaveMode.ON_FOCUS_CHANGE */ && !editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                dirtyAutoSaveOnFocusChangeEditors.add({ editor, groupId });
            }
            // Windows, Linux: editor will be saved on window change
            // when a native dialog appears, so just track that separate
            // (see https://github.com/microsoft/vscode/issues/134250)
            else if ((isNative && (isWindows || isLinux)) && this.filesConfigurationService.getAutoSaveMode() === 4 /* AutoSaveMode.ON_WINDOW_CHANGE */ && !editor.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                dirtyAutoSaveOnWindowChangeEditors.add({ editor, groupId });
            }
            // Editor will show in generic file based dialog
            else {
                dirtyEditorsWithDefaultConfirm.add({ editor, groupId });
            }
        }
        // 1.) Show default file based dialog
        if (dirtyEditorsWithDefaultConfirm.size > 0) {
            const editors = Array.from(dirtyEditorsWithDefaultConfirm.values());
            await this.revealEditorsToConfirm(editors); // help user make a decision by revealing editors
            const confirmation = await this.fileDialogService.showSaveConfirm(editors.map(({ editor }) => {
                if (editor instanceof SideBySideEditorInput) {
                    return editor.primary.getName(); // prefer shorter names by using primary's name in this case
                }
                return editor.getName();
            }));
            switch (confirmation) {
                case 2 /* ConfirmResult.CANCEL */:
                    return;
                case 1 /* ConfirmResult.DONT_SAVE */:
                    await this.editorService.revert(editors, { soft: true });
                    break;
                case 0 /* ConfirmResult.SAVE */:
                    await this.editorService.save(editors, { reason: 1 /* SaveReason.EXPLICIT */ });
                    break;
            }
        }
        // 2.) Show custom confirm based dialog
        for (const [, editorIdentifiers] of editorsWithCustomConfirm) {
            const editors = Array.from(editorIdentifiers.values());
            await this.revealEditorsToConfirm(editors); // help user make a decision by revealing editors
            const confirmation = await firstOrDefault(editors)?.editor.closeHandler?.confirm?.(editors);
            if (typeof confirmation === 'number') {
                switch (confirmation) {
                    case 2 /* ConfirmResult.CANCEL */:
                        return;
                    case 1 /* ConfirmResult.DONT_SAVE */:
                        await this.editorService.revert(editors, { soft: true });
                        break;
                    case 0 /* ConfirmResult.SAVE */:
                        await this.editorService.save(editors, { reason: 1 /* SaveReason.EXPLICIT */ });
                        break;
                }
            }
        }
        // 3.) Save autosaveable editors (focus change)
        if (dirtyAutoSaveOnFocusChangeEditors.size > 0) {
            const editors = Array.from(dirtyAutoSaveOnFocusChangeEditors.values());
            await this.editorService.save(editors, { reason: 3 /* SaveReason.FOCUS_CHANGE */ });
        }
        // 4.) Save autosaveable editors (window change)
        if (dirtyAutoSaveOnWindowChangeEditors.size > 0) {
            const editors = Array.from(dirtyAutoSaveOnWindowChangeEditors.values());
            await this.editorService.save(editors, { reason: 4 /* SaveReason.WINDOW_CHANGE */ });
        }
        // 5.) Finally close all editors: even if an editor failed to
        // save or revert and still reports dirty, the editor part makes
        // sure to bring up another confirm dialog for those editors
        // specifically.
        return this.doCloseAll();
    }
    async revealEditorsToConfirm(editors) {
        try {
            const handledGroups = new Set();
            for (const { editor, groupId } of editors) {
                if (handledGroups.has(groupId)) {
                    continue;
                }
                handledGroups.add(groupId);
                const group = this.editorGroupService.getGroup(groupId);
                await group?.openEditor(editor);
            }
        }
        catch (error) {
            // ignore any error as the revealing is just convinience
        }
    }
    async doCloseAll() {
        await Promise.all(this.groupsToClose.map(group => group.closeAllEditors({ excludeSticky: this.excludeSticky })));
    }
}
let CloseAllEditorsAction = class CloseAllEditorsAction extends AbstractCloseAllAction {
    static ID = 'workbench.action.closeAllEditors';
    static LABEL = localize('closeAllEditors', "Close All Editors");
    constructor(id, label, fileDialogService, editorGroupService, editorService, filesConfigurationService) {
        super(id, label, Codicon.closeAll.classNames, fileDialogService, editorGroupService, editorService, filesConfigurationService);
    }
    get excludeSticky() {
        return true; // exclude sticky from this mass-closing operation
    }
};
CloseAllEditorsAction = __decorate([
    __param(2, IFileDialogService),
    __param(3, IEditorGroupsService),
    __param(4, IEditorService),
    __param(5, IFilesConfigurationService)
], CloseAllEditorsAction);
export { CloseAllEditorsAction };
let CloseAllEditorGroupsAction = class CloseAllEditorGroupsAction extends AbstractCloseAllAction {
    static ID = 'workbench.action.closeAllGroups';
    static LABEL = localize('closeAllGroups', "Close All Editor Groups");
    constructor(id, label, fileDialogService, editorGroupService, editorService, filesConfigurationService) {
        super(id, label, undefined, fileDialogService, editorGroupService, editorService, filesConfigurationService);
    }
    get excludeSticky() {
        return false; // the intent to close groups means, even sticky are included
    }
    async doCloseAll() {
        await super.doCloseAll();
        for (const groupToClose of this.groupsToClose) {
            this.editorGroupService.removeGroup(groupToClose);
        }
    }
};
CloseAllEditorGroupsAction = __decorate([
    __param(2, IFileDialogService),
    __param(3, IEditorGroupsService),
    __param(4, IEditorService),
    __param(5, IFilesConfigurationService)
], CloseAllEditorGroupsAction);
export { CloseAllEditorGroupsAction };
let CloseEditorsInOtherGroupsAction = class CloseEditorsInOtherGroupsAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.closeEditorsInOtherGroups';
    static LABEL = localize('closeEditorsInOtherGroups', "Close Editors in Other Groups");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run(context) {
        const groupToSkip = context ? this.editorGroupService.getGroup(context.groupId) : this.editorGroupService.activeGroup;
        await Promise.all(this.editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).map(async (group) => {
            if (groupToSkip && group.id === groupToSkip.id) {
                return;
            }
            return group.closeAllEditors({ excludeSticky: true });
        }));
    }
};
CloseEditorsInOtherGroupsAction = __decorate([
    __param(2, IEditorGroupsService)
], CloseEditorsInOtherGroupsAction);
export { CloseEditorsInOtherGroupsAction };
let CloseEditorInAllGroupsAction = class CloseEditorInAllGroupsAction extends Action {
    editorGroupService;
    editorService;
    static ID = 'workbench.action.closeEditorInAllGroups';
    static LABEL = localize('closeEditorInAllGroups', "Close Editor in All Groups");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
        this.editorService = editorService;
    }
    async run() {
        const activeEditor = this.editorService.activeEditor;
        if (activeEditor) {
            await Promise.all(this.editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */).map(group => group.closeEditor(activeEditor)));
        }
    }
};
CloseEditorInAllGroupsAction = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], CloseEditorInAllGroupsAction);
export { CloseEditorInAllGroupsAction };
class AbstractMoveCopyGroupAction extends Action {
    direction;
    isMove;
    editorGroupService;
    constructor(id, label, direction, isMove, editorGroupService) {
        super(id, label);
        this.direction = direction;
        this.isMove = isMove;
        this.editorGroupService = editorGroupService;
    }
    async run(context) {
        let sourceGroup;
        if (context && typeof context.groupId === 'number') {
            sourceGroup = this.editorGroupService.getGroup(context.groupId);
        }
        else {
            sourceGroup = this.editorGroupService.activeGroup;
        }
        if (sourceGroup) {
            let resultGroup = undefined;
            if (this.isMove) {
                const targetGroup = this.findTargetGroup(sourceGroup);
                if (targetGroup) {
                    resultGroup = this.editorGroupService.moveGroup(sourceGroup, targetGroup, this.direction);
                }
            }
            else {
                resultGroup = this.editorGroupService.copyGroup(sourceGroup, sourceGroup, this.direction);
            }
            if (resultGroup) {
                this.editorGroupService.activateGroup(resultGroup);
            }
        }
    }
    findTargetGroup(sourceGroup) {
        const targetNeighbours = [this.direction];
        // Allow the target group to be in alternative locations to support more
        // scenarios of moving the group to the taret location.
        // Helps for https://github.com/microsoft/vscode/issues/50741
        switch (this.direction) {
            case 2 /* GroupDirection.LEFT */:
            case 3 /* GroupDirection.RIGHT */:
                targetNeighbours.push(0 /* GroupDirection.UP */, 1 /* GroupDirection.DOWN */);
                break;
            case 0 /* GroupDirection.UP */:
            case 1 /* GroupDirection.DOWN */:
                targetNeighbours.push(2 /* GroupDirection.LEFT */, 3 /* GroupDirection.RIGHT */);
                break;
        }
        for (const targetNeighbour of targetNeighbours) {
            const targetNeighbourGroup = this.editorGroupService.findGroup({ direction: targetNeighbour }, sourceGroup);
            if (targetNeighbourGroup) {
                return targetNeighbourGroup;
            }
        }
        return undefined;
    }
}
class AbstractMoveGroupAction extends AbstractMoveCopyGroupAction {
    constructor(id, label, direction, editorGroupService) {
        super(id, label, direction, true, editorGroupService);
    }
}
let MoveGroupLeftAction = class MoveGroupLeftAction extends AbstractMoveGroupAction {
    static ID = 'workbench.action.moveActiveEditorGroupLeft';
    static LABEL = localize('moveActiveGroupLeft', "Move Editor Group Left");
    constructor(id, label, editorGroupService) {
        super(id, label, 2 /* GroupDirection.LEFT */, editorGroupService);
    }
};
MoveGroupLeftAction = __decorate([
    __param(2, IEditorGroupsService)
], MoveGroupLeftAction);
export { MoveGroupLeftAction };
let MoveGroupRightAction = class MoveGroupRightAction extends AbstractMoveGroupAction {
    static ID = 'workbench.action.moveActiveEditorGroupRight';
    static LABEL = localize('moveActiveGroupRight', "Move Editor Group Right");
    constructor(id, label, editorGroupService) {
        super(id, label, 3 /* GroupDirection.RIGHT */, editorGroupService);
    }
};
MoveGroupRightAction = __decorate([
    __param(2, IEditorGroupsService)
], MoveGroupRightAction);
export { MoveGroupRightAction };
let MoveGroupUpAction = class MoveGroupUpAction extends AbstractMoveGroupAction {
    static ID = 'workbench.action.moveActiveEditorGroupUp';
    static LABEL = localize('moveActiveGroupUp', "Move Editor Group Up");
    constructor(id, label, editorGroupService) {
        super(id, label, 0 /* GroupDirection.UP */, editorGroupService);
    }
};
MoveGroupUpAction = __decorate([
    __param(2, IEditorGroupsService)
], MoveGroupUpAction);
export { MoveGroupUpAction };
let MoveGroupDownAction = class MoveGroupDownAction extends AbstractMoveGroupAction {
    static ID = 'workbench.action.moveActiveEditorGroupDown';
    static LABEL = localize('moveActiveGroupDown', "Move Editor Group Down");
    constructor(id, label, editorGroupService) {
        super(id, label, 1 /* GroupDirection.DOWN */, editorGroupService);
    }
};
MoveGroupDownAction = __decorate([
    __param(2, IEditorGroupsService)
], MoveGroupDownAction);
export { MoveGroupDownAction };
class AbstractDuplicateGroupAction extends AbstractMoveCopyGroupAction {
    constructor(id, label, direction, editorGroupService) {
        super(id, label, direction, false, editorGroupService);
    }
}
let DuplicateGroupLeftAction = class DuplicateGroupLeftAction extends AbstractDuplicateGroupAction {
    static ID = 'workbench.action.duplicateActiveEditorGroupLeft';
    static LABEL = localize('duplicateActiveGroupLeft', "Duplicate Editor Group Left");
    constructor(id, label, editorGroupService) {
        super(id, label, 2 /* GroupDirection.LEFT */, editorGroupService);
    }
};
DuplicateGroupLeftAction = __decorate([
    __param(2, IEditorGroupsService)
], DuplicateGroupLeftAction);
export { DuplicateGroupLeftAction };
let DuplicateGroupRightAction = class DuplicateGroupRightAction extends AbstractDuplicateGroupAction {
    static ID = 'workbench.action.duplicateActiveEditorGroupRight';
    static LABEL = localize('duplicateActiveGroupRight', "Duplicate Editor Group Right");
    constructor(id, label, editorGroupService) {
        super(id, label, 3 /* GroupDirection.RIGHT */, editorGroupService);
    }
};
DuplicateGroupRightAction = __decorate([
    __param(2, IEditorGroupsService)
], DuplicateGroupRightAction);
export { DuplicateGroupRightAction };
let DuplicateGroupUpAction = class DuplicateGroupUpAction extends AbstractDuplicateGroupAction {
    static ID = 'workbench.action.duplicateActiveEditorGroupUp';
    static LABEL = localize('duplicateActiveGroupUp', "Duplicate Editor Group Up");
    constructor(id, label, editorGroupService) {
        super(id, label, 0 /* GroupDirection.UP */, editorGroupService);
    }
};
DuplicateGroupUpAction = __decorate([
    __param(2, IEditorGroupsService)
], DuplicateGroupUpAction);
export { DuplicateGroupUpAction };
let DuplicateGroupDownAction = class DuplicateGroupDownAction extends AbstractDuplicateGroupAction {
    static ID = 'workbench.action.duplicateActiveEditorGroupDown';
    static LABEL = localize('duplicateActiveGroupDown', "Duplicate Editor Group Down");
    constructor(id, label, editorGroupService) {
        super(id, label, 1 /* GroupDirection.DOWN */, editorGroupService);
    }
};
DuplicateGroupDownAction = __decorate([
    __param(2, IEditorGroupsService)
], DuplicateGroupDownAction);
export { DuplicateGroupDownAction };
let MinimizeOtherGroupsAction = class MinimizeOtherGroupsAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.minimizeOtherEditors';
    static LABEL = localize('minimizeOtherEditorGroups', "Maximize Editor Group");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run() {
        this.editorGroupService.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
    }
};
MinimizeOtherGroupsAction = __decorate([
    __param(2, IEditorGroupsService)
], MinimizeOtherGroupsAction);
export { MinimizeOtherGroupsAction };
let ResetGroupSizesAction = class ResetGroupSizesAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.evenEditorWidths';
    static LABEL = localize('evenEditorGroups', "Reset Editor Group Sizes");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run() {
        this.editorGroupService.arrangeGroups(1 /* GroupsArrangement.EVEN */);
    }
};
ResetGroupSizesAction = __decorate([
    __param(2, IEditorGroupsService)
], ResetGroupSizesAction);
export { ResetGroupSizesAction };
let ToggleGroupSizesAction = class ToggleGroupSizesAction extends Action {
    editorGroupService;
    static ID = 'workbench.action.toggleEditorWidths';
    static LABEL = localize('toggleEditorWidths', "Toggle Editor Group Sizes");
    constructor(id, label, editorGroupService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
    }
    async run() {
        this.editorGroupService.arrangeGroups(2 /* GroupsArrangement.TOGGLE */);
    }
};
ToggleGroupSizesAction = __decorate([
    __param(2, IEditorGroupsService)
], ToggleGroupSizesAction);
export { ToggleGroupSizesAction };
let MaximizeGroupAction = class MaximizeGroupAction extends Action {
    editorService;
    editorGroupService;
    layoutService;
    static ID = 'workbench.action.maximizeEditor';
    static LABEL = localize('maximizeEditor', "Maximize Editor Group and Hide Side Bars");
    constructor(id, label, editorService, editorGroupService, layoutService) {
        super(id, label);
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.layoutService = layoutService;
    }
    async run() {
        if (this.editorService.activeEditor) {
            this.layoutService.setPartHidden(true, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
            this.layoutService.setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            this.editorGroupService.arrangeGroups(0 /* GroupsArrangement.MAXIMIZE */);
        }
    }
};
MaximizeGroupAction = __decorate([
    __param(2, IEditorService),
    __param(3, IEditorGroupsService),
    __param(4, IWorkbenchLayoutService)
], MaximizeGroupAction);
export { MaximizeGroupAction };
class AbstractNavigateEditorAction extends Action {
    editorGroupService;
    editorService;
    constructor(id, label, editorGroupService, editorService) {
        super(id, label);
        this.editorGroupService = editorGroupService;
        this.editorService = editorService;
    }
    async run() {
        const result = this.navigate();
        if (!result) {
            return;
        }
        const { groupId, editor } = result;
        if (!editor) {
            return;
        }
        const group = this.editorGroupService.getGroup(groupId);
        if (group) {
            await group.openEditor(editor);
        }
    }
}
let OpenNextEditor = class OpenNextEditor extends AbstractNavigateEditorAction {
    static ID = 'workbench.action.nextEditor';
    static LABEL = localize('openNextEditor', "Open Next Editor");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label, editorGroupService, editorService);
    }
    navigate() {
        // Navigate in active group if possible
        const activeGroup = this.editorGroupService.activeGroup;
        const activeGroupEditors = activeGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
        if (activeEditorIndex + 1 < activeGroupEditors.length) {
            return { editor: activeGroupEditors[activeEditorIndex + 1], groupId: activeGroup.id };
        }
        // Otherwise try in next group that has editors
        const handledGroups = new Set();
        let currentGroup = this.editorGroupService.activeGroup;
        while (currentGroup && !handledGroups.has(currentGroup.id)) {
            currentGroup = this.editorGroupService.findGroup({ location: 2 /* GroupLocation.NEXT */ }, currentGroup, true);
            if (currentGroup) {
                handledGroups.add(currentGroup.id);
                const groupEditors = currentGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
                if (groupEditors.length > 0) {
                    return { editor: groupEditors[0], groupId: currentGroup.id };
                }
            }
        }
        return undefined;
    }
};
OpenNextEditor = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], OpenNextEditor);
export { OpenNextEditor };
let OpenPreviousEditor = class OpenPreviousEditor extends AbstractNavigateEditorAction {
    static ID = 'workbench.action.previousEditor';
    static LABEL = localize('openPreviousEditor', "Open Previous Editor");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label, editorGroupService, editorService);
    }
    navigate() {
        // Navigate in active group if possible
        const activeGroup = this.editorGroupService.activeGroup;
        const activeGroupEditors = activeGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        const activeEditorIndex = activeGroup.activeEditor ? activeGroupEditors.indexOf(activeGroup.activeEditor) : -1;
        if (activeEditorIndex > 0) {
            return { editor: activeGroupEditors[activeEditorIndex - 1], groupId: activeGroup.id };
        }
        // Otherwise try in previous group that has editors
        const handledGroups = new Set();
        let currentGroup = this.editorGroupService.activeGroup;
        while (currentGroup && !handledGroups.has(currentGroup.id)) {
            currentGroup = this.editorGroupService.findGroup({ location: 3 /* GroupLocation.PREVIOUS */ }, currentGroup, true);
            if (currentGroup) {
                handledGroups.add(currentGroup.id);
                const groupEditors = currentGroup.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
                if (groupEditors.length > 0) {
                    return { editor: groupEditors[groupEditors.length - 1], groupId: currentGroup.id };
                }
            }
        }
        return undefined;
    }
};
OpenPreviousEditor = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], OpenPreviousEditor);
export { OpenPreviousEditor };
let OpenNextEditorInGroup = class OpenNextEditorInGroup extends AbstractNavigateEditorAction {
    static ID = 'workbench.action.nextEditorInGroup';
    static LABEL = localize('nextEditorInGroup', "Open Next Editor in Group");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label, editorGroupService, editorService);
    }
    navigate() {
        const group = this.editorGroupService.activeGroup;
        const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
        return { editor: index + 1 < editors.length ? editors[index + 1] : editors[0], groupId: group.id };
    }
};
OpenNextEditorInGroup = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], OpenNextEditorInGroup);
export { OpenNextEditorInGroup };
let OpenPreviousEditorInGroup = class OpenPreviousEditorInGroup extends AbstractNavigateEditorAction {
    static ID = 'workbench.action.previousEditorInGroup';
    static LABEL = localize('openPreviousEditorInGroup', "Open Previous Editor in Group");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label, editorGroupService, editorService);
    }
    navigate() {
        const group = this.editorGroupService.activeGroup;
        const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        const index = group.activeEditor ? editors.indexOf(group.activeEditor) : -1;
        return { editor: index > 0 ? editors[index - 1] : editors[editors.length - 1], groupId: group.id };
    }
};
OpenPreviousEditorInGroup = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], OpenPreviousEditorInGroup);
export { OpenPreviousEditorInGroup };
let OpenFirstEditorInGroup = class OpenFirstEditorInGroup extends AbstractNavigateEditorAction {
    static ID = 'workbench.action.firstEditorInGroup';
    static LABEL = localize('firstEditorInGroup', "Open First Editor in Group");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label, editorGroupService, editorService);
    }
    navigate() {
        const group = this.editorGroupService.activeGroup;
        const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        return { editor: editors[0], groupId: group.id };
    }
};
OpenFirstEditorInGroup = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], OpenFirstEditorInGroup);
export { OpenFirstEditorInGroup };
let OpenLastEditorInGroup = class OpenLastEditorInGroup extends AbstractNavigateEditorAction {
    static ID = 'workbench.action.lastEditorInGroup';
    static LABEL = localize('lastEditorInGroup', "Open Last Editor in Group");
    constructor(id, label, editorGroupService, editorService) {
        super(id, label, editorGroupService, editorService);
    }
    navigate() {
        const group = this.editorGroupService.activeGroup;
        const editors = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */);
        return { editor: editors[editors.length - 1], groupId: group.id };
    }
};
OpenLastEditorInGroup = __decorate([
    __param(2, IEditorGroupsService),
    __param(3, IEditorService)
], OpenLastEditorInGroup);
export { OpenLastEditorInGroup };
export class NavigateForwardAction extends Action2 {
    static ID = 'workbench.action.navigateForward';
    static LABEL = localize('navigateForward', "Go Forward");
    constructor() {
        super({
            id: NavigateForwardAction.ID,
            title: { value: localize('navigateForward', "Go Forward"), original: 'Go Forward', mnemonicTitle: localize({ key: 'miForward', comment: ['&& denotes a mnemonic'] }, "&&Forward") },
            f1: true,
            icon: Codicon.arrowRight,
            precondition: ContextKeyExpr.has('canNavigateForward'),
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                win: { primary: 512 /* KeyMod.Alt */ | 17 /* KeyCode.RightArrow */ },
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 83 /* KeyCode.Minus */ },
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 83 /* KeyCode.Minus */ }
            },
            menu: [
                { id: MenuId.MenubarGoMenu, group: '1_history_nav', order: 2 },
                { id: MenuId.CommandCenter, order: 2 }
            ]
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goForward(0 /* GoFilter.NONE */);
    }
}
export class NavigateBackwardsAction extends Action2 {
    static ID = 'workbench.action.navigateBack';
    static LABEL = localize('navigateBack', "Go Back");
    constructor() {
        super({
            id: NavigateBackwardsAction.ID,
            title: { value: localize('navigateBack', "Go Back"), original: 'Go Back', mnemonicTitle: localize({ key: 'miBack', comment: ['&& denotes a mnemonic'] }, "&&Back") },
            f1: true,
            precondition: ContextKeyExpr.has('canNavigateBack'),
            icon: Codicon.arrowLeft,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                win: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 83 /* KeyCode.Minus */ },
                linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 83 /* KeyCode.Minus */ }
            },
            menu: [
                { id: MenuId.MenubarGoMenu, group: '1_history_nav', order: 1 },
                { id: MenuId.CommandCenter, order: 1 }
            ]
        });
    }
    async run(accessor) {
        const historyService = accessor.get(IHistoryService);
        await historyService.goBack(0 /* GoFilter.NONE */);
    }
}
let NavigatePreviousAction = class NavigatePreviousAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateLast';
    static LABEL = localize('navigatePrevious', "Go Previous");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goPrevious(0 /* GoFilter.NONE */);
    }
};
NavigatePreviousAction = __decorate([
    __param(2, IHistoryService)
], NavigatePreviousAction);
export { NavigatePreviousAction };
let NavigateForwardInEditsAction = class NavigateForwardInEditsAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateForwardInEditLocations';
    static LABEL = localize('navigateForwardInEdits', "Go Forward in Edit Locations");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goForward(1 /* GoFilter.EDITS */);
    }
};
NavigateForwardInEditsAction = __decorate([
    __param(2, IHistoryService)
], NavigateForwardInEditsAction);
export { NavigateForwardInEditsAction };
let NavigateBackwardsInEditsAction = class NavigateBackwardsInEditsAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateBackInEditLocations';
    static LABEL = localize('navigateBackInEdits', "Go Back in Edit Locations");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goBack(1 /* GoFilter.EDITS */);
    }
};
NavigateBackwardsInEditsAction = __decorate([
    __param(2, IHistoryService)
], NavigateBackwardsInEditsAction);
export { NavigateBackwardsInEditsAction };
let NavigatePreviousInEditsAction = class NavigatePreviousInEditsAction extends Action {
    historyService;
    static ID = 'workbench.action.navigatePreviousInEditLocations';
    static LABEL = localize('navigatePreviousInEdits', "Go Previous in Edit Locations");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goPrevious(1 /* GoFilter.EDITS */);
    }
};
NavigatePreviousInEditsAction = __decorate([
    __param(2, IHistoryService)
], NavigatePreviousInEditsAction);
export { NavigatePreviousInEditsAction };
let NavigateToLastEditLocationAction = class NavigateToLastEditLocationAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateToLastEditLocation';
    static LABEL = localize('navigateToLastEditLocation', "Go to Last Edit Location");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goLast(1 /* GoFilter.EDITS */);
    }
};
NavigateToLastEditLocationAction = __decorate([
    __param(2, IHistoryService)
], NavigateToLastEditLocationAction);
export { NavigateToLastEditLocationAction };
let NavigateForwardInNavigationsAction = class NavigateForwardInNavigationsAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateForwardInNavigationLocations';
    static LABEL = localize('navigateForwardInNavigations', "Go Forward in Navigation Locations");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goForward(2 /* GoFilter.NAVIGATION */);
    }
};
NavigateForwardInNavigationsAction = __decorate([
    __param(2, IHistoryService)
], NavigateForwardInNavigationsAction);
export { NavigateForwardInNavigationsAction };
let NavigateBackwardsInNavigationsAction = class NavigateBackwardsInNavigationsAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateBackInNavigationLocations';
    static LABEL = localize('navigateBackInNavigations', "Go Back in Navigation Locations");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goBack(2 /* GoFilter.NAVIGATION */);
    }
};
NavigateBackwardsInNavigationsAction = __decorate([
    __param(2, IHistoryService)
], NavigateBackwardsInNavigationsAction);
export { NavigateBackwardsInNavigationsAction };
let NavigatePreviousInNavigationsAction = class NavigatePreviousInNavigationsAction extends Action {
    historyService;
    static ID = 'workbench.action.navigatePreviousInNavigationLocations';
    static LABEL = localize('navigatePreviousInNavigationLocations', "Go Previous in Navigation Locations");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goPrevious(2 /* GoFilter.NAVIGATION */);
    }
};
NavigatePreviousInNavigationsAction = __decorate([
    __param(2, IHistoryService)
], NavigatePreviousInNavigationsAction);
export { NavigatePreviousInNavigationsAction };
let NavigateToLastNavigationLocationAction = class NavigateToLastNavigationLocationAction extends Action {
    historyService;
    static ID = 'workbench.action.navigateToLastNavigationLocation';
    static LABEL = localize('navigateToLastNavigationLocation', "Go to Last Navigation Location");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.goLast(2 /* GoFilter.NAVIGATION */);
    }
};
NavigateToLastNavigationLocationAction = __decorate([
    __param(2, IHistoryService)
], NavigateToLastNavigationLocationAction);
export { NavigateToLastNavigationLocationAction };
let ReopenClosedEditorAction = class ReopenClosedEditorAction extends Action {
    historyService;
    static ID = 'workbench.action.reopenClosedEditor';
    static LABEL = localize('reopenClosedEditor', "Reopen Closed Editor");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        await this.historyService.reopenLastClosedEditor();
    }
};
ReopenClosedEditorAction = __decorate([
    __param(2, IHistoryService)
], ReopenClosedEditorAction);
export { ReopenClosedEditorAction };
let ClearRecentFilesAction = class ClearRecentFilesAction extends Action {
    workspacesService;
    historyService;
    dialogService;
    static ID = 'workbench.action.clearRecentFiles';
    static LABEL = localize('clearRecentFiles', "Clear Recently Opened");
    constructor(id, label, workspacesService, historyService, dialogService) {
        super(id, label);
        this.workspacesService = workspacesService;
        this.historyService = historyService;
        this.dialogService = dialogService;
    }
    async run() {
        // Ask for confirmation
        const { confirmed } = await this.dialogService.confirm({
            message: localize('confirmClearRecentsMessage', "Do you want to clear all recently opened files and workspaces?"),
            detail: localize('confirmClearDetail', "This action is irreversible!"),
            primaryButton: localize({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear"),
            type: 'warning'
        });
        if (!confirmed) {
            return;
        }
        // Clear global recently opened
        this.workspacesService.clearRecentlyOpened();
        // Clear workspace specific recently opened
        this.historyService.clearRecentlyOpened();
    }
};
ClearRecentFilesAction = __decorate([
    __param(2, IWorkspacesService),
    __param(3, IHistoryService),
    __param(4, IDialogService)
], ClearRecentFilesAction);
export { ClearRecentFilesAction };
let ShowEditorsInActiveGroupByMostRecentlyUsedAction = class ShowEditorsInActiveGroupByMostRecentlyUsedAction extends Action {
    quickInputService;
    static ID = 'workbench.action.showEditorsInActiveGroup';
    static LABEL = localize('showEditorsInActiveGroup', "Show Editors in Active Group By Most Recently Used");
    constructor(id, label, quickInputService) {
        super(id, label);
        this.quickInputService = quickInputService;
    }
    async run() {
        this.quickInputService.quickAccess.show(ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX);
    }
};
ShowEditorsInActiveGroupByMostRecentlyUsedAction = __decorate([
    __param(2, IQuickInputService)
], ShowEditorsInActiveGroupByMostRecentlyUsedAction);
export { ShowEditorsInActiveGroupByMostRecentlyUsedAction };
let ShowAllEditorsByAppearanceAction = class ShowAllEditorsByAppearanceAction extends Action {
    quickInputService;
    static ID = 'workbench.action.showAllEditors';
    static LABEL = localize('showAllEditors', "Show All Editors By Appearance");
    constructor(id, label, quickInputService) {
        super(id, label);
        this.quickInputService = quickInputService;
    }
    async run() {
        this.quickInputService.quickAccess.show(AllEditorsByAppearanceQuickAccess.PREFIX);
    }
};
ShowAllEditorsByAppearanceAction = __decorate([
    __param(2, IQuickInputService)
], ShowAllEditorsByAppearanceAction);
export { ShowAllEditorsByAppearanceAction };
let ShowAllEditorsByMostRecentlyUsedAction = class ShowAllEditorsByMostRecentlyUsedAction extends Action {
    quickInputService;
    static ID = 'workbench.action.showAllEditorsByMostRecentlyUsed';
    static LABEL = localize('showAllEditorsByMostRecentlyUsed', "Show All Editors By Most Recently Used");
    constructor(id, label, quickInputService) {
        super(id, label);
        this.quickInputService = quickInputService;
    }
    async run() {
        this.quickInputService.quickAccess.show(AllEditorsByMostRecentlyUsedQuickAccess.PREFIX);
    }
};
ShowAllEditorsByMostRecentlyUsedAction = __decorate([
    __param(2, IQuickInputService)
], ShowAllEditorsByMostRecentlyUsedAction);
export { ShowAllEditorsByMostRecentlyUsedAction };
let AbstractQuickAccessEditorAction = class AbstractQuickAccessEditorAction extends Action {
    prefix;
    itemActivation;
    quickInputService;
    keybindingService;
    constructor(id, label, prefix, itemActivation, quickInputService, keybindingService) {
        super(id, label);
        this.prefix = prefix;
        this.itemActivation = itemActivation;
        this.quickInputService = quickInputService;
        this.keybindingService = keybindingService;
    }
    async run() {
        const keybindings = this.keybindingService.lookupKeybindings(this.id);
        this.quickInputService.quickAccess.show(this.prefix, {
            quickNavigateConfiguration: { keybindings },
            itemActivation: this.itemActivation
        });
    }
};
AbstractQuickAccessEditorAction = __decorate([
    __param(4, IQuickInputService),
    __param(5, IKeybindingService)
], AbstractQuickAccessEditorAction);
let QuickAccessPreviousRecentlyUsedEditorAction = class QuickAccessPreviousRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    static ID = 'workbench.action.quickOpenPreviousRecentlyUsedEditor';
    static LABEL = localize('quickOpenPreviousRecentlyUsedEditor', "Quick Open Previous Recently Used Editor");
    constructor(id, label, quickInputService, keybindingService) {
        super(id, label, AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined, quickInputService, keybindingService);
    }
};
QuickAccessPreviousRecentlyUsedEditorAction = __decorate([
    __param(2, IQuickInputService),
    __param(3, IKeybindingService)
], QuickAccessPreviousRecentlyUsedEditorAction);
export { QuickAccessPreviousRecentlyUsedEditorAction };
let QuickAccessLeastRecentlyUsedEditorAction = class QuickAccessLeastRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    static ID = 'workbench.action.quickOpenLeastRecentlyUsedEditor';
    static LABEL = localize('quickOpenLeastRecentlyUsedEditor', "Quick Open Least Recently Used Editor");
    constructor(id, label, quickInputService, keybindingService) {
        super(id, label, AllEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined, quickInputService, keybindingService);
    }
};
QuickAccessLeastRecentlyUsedEditorAction = __decorate([
    __param(2, IQuickInputService),
    __param(3, IKeybindingService)
], QuickAccessLeastRecentlyUsedEditorAction);
export { QuickAccessLeastRecentlyUsedEditorAction };
let QuickAccessPreviousRecentlyUsedEditorInGroupAction = class QuickAccessPreviousRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    static ID = 'workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup';
    static LABEL = localize('quickOpenPreviousRecentlyUsedEditorInGroup', "Quick Open Previous Recently Used Editor in Group");
    constructor(id, label, quickInputService, keybindingService) {
        super(id, label, ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, undefined, quickInputService, keybindingService);
    }
};
QuickAccessPreviousRecentlyUsedEditorInGroupAction = __decorate([
    __param(2, IQuickInputService),
    __param(3, IKeybindingService)
], QuickAccessPreviousRecentlyUsedEditorInGroupAction);
export { QuickAccessPreviousRecentlyUsedEditorInGroupAction };
let QuickAccessLeastRecentlyUsedEditorInGroupAction = class QuickAccessLeastRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    static ID = 'workbench.action.quickOpenLeastRecentlyUsedEditorInGroup';
    static LABEL = localize('quickOpenLeastRecentlyUsedEditorInGroup', "Quick Open Least Recently Used Editor in Group");
    constructor(id, label, quickInputService, keybindingService) {
        super(id, label, ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX, ItemActivation.LAST, quickInputService, keybindingService);
    }
};
QuickAccessLeastRecentlyUsedEditorInGroupAction = __decorate([
    __param(2, IQuickInputService),
    __param(3, IKeybindingService)
], QuickAccessLeastRecentlyUsedEditorInGroupAction);
export { QuickAccessLeastRecentlyUsedEditorInGroupAction };
let QuickAccessPreviousEditorFromHistoryAction = class QuickAccessPreviousEditorFromHistoryAction extends Action {
    quickInputService;
    keybindingService;
    editorGroupService;
    static ID = 'workbench.action.openPreviousEditorFromHistory';
    static LABEL = localize('navigateEditorHistoryByInput', "Quick Open Previous Editor from History");
    constructor(id, label, quickInputService, keybindingService, editorGroupService) {
        super(id, label);
        this.quickInputService = quickInputService;
        this.keybindingService = keybindingService;
        this.editorGroupService = editorGroupService;
    }
    async run() {
        const keybindings = this.keybindingService.lookupKeybindings(this.id);
        // Enforce to activate the first item in quick access if
        // the currently active editor group has n editor opened
        let itemActivation = undefined;
        if (this.editorGroupService.activeGroup.count === 0) {
            itemActivation = ItemActivation.FIRST;
        }
        this.quickInputService.quickAccess.show('', { quickNavigateConfiguration: { keybindings }, itemActivation });
    }
};
QuickAccessPreviousEditorFromHistoryAction = __decorate([
    __param(2, IQuickInputService),
    __param(3, IKeybindingService),
    __param(4, IEditorGroupsService)
], QuickAccessPreviousEditorFromHistoryAction);
export { QuickAccessPreviousEditorFromHistoryAction };
let OpenNextRecentlyUsedEditorAction = class OpenNextRecentlyUsedEditorAction extends Action {
    historyService;
    static ID = 'workbench.action.openNextRecentlyUsedEditor';
    static LABEL = localize('openNextRecentlyUsedEditor', "Open Next Recently Used Editor");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        this.historyService.openNextRecentlyUsedEditor();
    }
};
OpenNextRecentlyUsedEditorAction = __decorate([
    __param(2, IHistoryService)
], OpenNextRecentlyUsedEditorAction);
export { OpenNextRecentlyUsedEditorAction };
let OpenPreviousRecentlyUsedEditorAction = class OpenPreviousRecentlyUsedEditorAction extends Action {
    historyService;
    static ID = 'workbench.action.openPreviousRecentlyUsedEditor';
    static LABEL = localize('openPreviousRecentlyUsedEditor', "Open Previous Recently Used Editor");
    constructor(id, label, historyService) {
        super(id, label);
        this.historyService = historyService;
    }
    async run() {
        this.historyService.openPreviouslyUsedEditor();
    }
};
OpenPreviousRecentlyUsedEditorAction = __decorate([
    __param(2, IHistoryService)
], OpenPreviousRecentlyUsedEditorAction);
export { OpenPreviousRecentlyUsedEditorAction };
let OpenNextRecentlyUsedEditorInGroupAction = class OpenNextRecentlyUsedEditorInGroupAction extends Action {
    historyService;
    editorGroupsService;
    static ID = 'workbench.action.openNextRecentlyUsedEditorInGroup';
    static LABEL = localize('openNextRecentlyUsedEditorInGroup', "Open Next Recently Used Editor In Group");
    constructor(id, label, historyService, editorGroupsService) {
        super(id, label);
        this.historyService = historyService;
        this.editorGroupsService = editorGroupsService;
    }
    async run() {
        this.historyService.openNextRecentlyUsedEditor(this.editorGroupsService.activeGroup.id);
    }
};
OpenNextRecentlyUsedEditorInGroupAction = __decorate([
    __param(2, IHistoryService),
    __param(3, IEditorGroupsService)
], OpenNextRecentlyUsedEditorInGroupAction);
export { OpenNextRecentlyUsedEditorInGroupAction };
let OpenPreviousRecentlyUsedEditorInGroupAction = class OpenPreviousRecentlyUsedEditorInGroupAction extends Action {
    historyService;
    editorGroupsService;
    static ID = 'workbench.action.openPreviousRecentlyUsedEditorInGroup';
    static LABEL = localize('openPreviousRecentlyUsedEditorInGroup', "Open Previous Recently Used Editor In Group");
    constructor(id, label, historyService, editorGroupsService) {
        super(id, label);
        this.historyService = historyService;
        this.editorGroupsService = editorGroupsService;
    }
    async run() {
        this.historyService.openPreviouslyUsedEditor(this.editorGroupsService.activeGroup.id);
    }
};
OpenPreviousRecentlyUsedEditorInGroupAction = __decorate([
    __param(2, IHistoryService),
    __param(3, IEditorGroupsService)
], OpenPreviousRecentlyUsedEditorInGroupAction);
export { OpenPreviousRecentlyUsedEditorInGroupAction };
let ClearEditorHistoryAction = class ClearEditorHistoryAction extends Action {
    historyService;
    dialogService;
    static ID = 'workbench.action.clearEditorHistory';
    static LABEL = localize('clearEditorHistory', "Clear Editor History");
    constructor(id, label, historyService, dialogService) {
        super(id, label);
        this.historyService = historyService;
        this.dialogService = dialogService;
    }
    async run() {
        // Ask for confirmation
        const { confirmed } = await this.dialogService.confirm({
            message: localize('confirmClearEditorHistoryMessage', "Do you want to clear the history of recently opened editors?"),
            detail: localize('confirmClearDetail', "This action is irreversible!"),
            primaryButton: localize({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear"),
            type: 'warning'
        });
        if (!confirmed) {
            return;
        }
        // Clear editor history
        this.historyService.clear();
    }
};
ClearEditorHistoryAction = __decorate([
    __param(2, IHistoryService),
    __param(3, IDialogService)
], ClearEditorHistoryAction);
export { ClearEditorHistoryAction };
let MoveEditorLeftInGroupAction = class MoveEditorLeftInGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorLeftInGroup';
    static LABEL = localize('moveEditorLeft', "Move Editor Left");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'left' });
    }
};
MoveEditorLeftInGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorLeftInGroupAction);
export { MoveEditorLeftInGroupAction };
let MoveEditorRightInGroupAction = class MoveEditorRightInGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorRightInGroup';
    static LABEL = localize('moveEditorRight', "Move Editor Right");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'right' });
    }
};
MoveEditorRightInGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorRightInGroupAction);
export { MoveEditorRightInGroupAction };
let MoveEditorToPreviousGroupAction = class MoveEditorToPreviousGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToPreviousGroup';
    static LABEL = localize('moveEditorToPreviousGroup', "Move Editor into Previous Group");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'previous', by: 'group' });
    }
};
MoveEditorToPreviousGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToPreviousGroupAction);
export { MoveEditorToPreviousGroupAction };
let MoveEditorToNextGroupAction = class MoveEditorToNextGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToNextGroup';
    static LABEL = localize('moveEditorToNextGroup', "Move Editor into Next Group");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'next', by: 'group' });
    }
};
MoveEditorToNextGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToNextGroupAction);
export { MoveEditorToNextGroupAction };
let MoveEditorToAboveGroupAction = class MoveEditorToAboveGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToAboveGroup';
    static LABEL = localize('moveEditorToAboveGroup', "Move Editor into Group Above");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'up', by: 'group' });
    }
};
MoveEditorToAboveGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToAboveGroupAction);
export { MoveEditorToAboveGroupAction };
let MoveEditorToBelowGroupAction = class MoveEditorToBelowGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToBelowGroup';
    static LABEL = localize('moveEditorToBelowGroup', "Move Editor into Group Below");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'down', by: 'group' });
    }
};
MoveEditorToBelowGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToBelowGroupAction);
export { MoveEditorToBelowGroupAction };
let MoveEditorToLeftGroupAction = class MoveEditorToLeftGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToLeftGroup';
    static LABEL = localize('moveEditorToLeftGroup', "Move Editor into Left Group");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'left', by: 'group' });
    }
};
MoveEditorToLeftGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToLeftGroupAction);
export { MoveEditorToLeftGroupAction };
let MoveEditorToRightGroupAction = class MoveEditorToRightGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToRightGroup';
    static LABEL = localize('moveEditorToRightGroup', "Move Editor into Right Group");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'right', by: 'group' });
    }
};
MoveEditorToRightGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToRightGroupAction);
export { MoveEditorToRightGroupAction };
let MoveEditorToFirstGroupAction = class MoveEditorToFirstGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToFirstGroup';
    static LABEL = localize('moveEditorToFirstGroup', "Move Editor into First Group");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'first', by: 'group' });
    }
};
MoveEditorToFirstGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToFirstGroupAction);
export { MoveEditorToFirstGroupAction };
let MoveEditorToLastGroupAction = class MoveEditorToLastGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.moveEditorToLastGroup';
    static LABEL = localize('moveEditorToLastGroup', "Move Editor into Last Group");
    constructor(id, label, commandService) {
        super(id, label, MOVE_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'last', by: 'group' });
    }
};
MoveEditorToLastGroupAction = __decorate([
    __param(2, ICommandService)
], MoveEditorToLastGroupAction);
export { MoveEditorToLastGroupAction };
let SplitEditorToPreviousGroupAction = class SplitEditorToPreviousGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToPreviousGroup';
    static LABEL = localize('splitEditorToPreviousGroup', "Split Editor into Previous Group");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'previous', by: 'group' });
    }
};
SplitEditorToPreviousGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToPreviousGroupAction);
export { SplitEditorToPreviousGroupAction };
let SplitEditorToNextGroupAction = class SplitEditorToNextGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToNextGroup';
    static LABEL = localize('splitEditorToNextGroup', "Split Editor into Next Group");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'next', by: 'group' });
    }
};
SplitEditorToNextGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToNextGroupAction);
export { SplitEditorToNextGroupAction };
let SplitEditorToAboveGroupAction = class SplitEditorToAboveGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToAboveGroup';
    static LABEL = localize('splitEditorToAboveGroup', "Split Editor into Group Above");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'up', by: 'group' });
    }
};
SplitEditorToAboveGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToAboveGroupAction);
export { SplitEditorToAboveGroupAction };
let SplitEditorToBelowGroupAction = class SplitEditorToBelowGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToBelowGroup';
    static LABEL = localize('splitEditorToBelowGroup', "Split Editor into Group Below");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'down', by: 'group' });
    }
};
SplitEditorToBelowGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToBelowGroupAction);
export { SplitEditorToBelowGroupAction };
let SplitEditorToLeftGroupAction = class SplitEditorToLeftGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToLeftGroup';
    static LABEL = localize('splitEditorToLeftGroup', "Split Editor into Left Group");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'left', by: 'group' });
    }
};
SplitEditorToLeftGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToLeftGroupAction);
export { SplitEditorToLeftGroupAction };
let SplitEditorToRightGroupAction = class SplitEditorToRightGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToRightGroup';
    static LABEL = localize('splitEditorToRightGroup', "Split Editor into Right Group");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'right', by: 'group' });
    }
};
SplitEditorToRightGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToRightGroupAction);
export { SplitEditorToRightGroupAction };
let SplitEditorToFirstGroupAction = class SplitEditorToFirstGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToFirstGroup';
    static LABEL = localize('splitEditorToFirstGroup', "Split Editor into First Group");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'first', by: 'group' });
    }
};
SplitEditorToFirstGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToFirstGroupAction);
export { SplitEditorToFirstGroupAction };
let SplitEditorToLastGroupAction = class SplitEditorToLastGroupAction extends ExecuteCommandAction {
    static ID = 'workbench.action.splitEditorToLastGroup';
    static LABEL = localize('splitEditorToLastGroup', "Split Editor into Last Group");
    constructor(id, label, commandService) {
        super(id, label, COPY_ACTIVE_EDITOR_COMMAND_ID, commandService, { to: 'last', by: 'group' });
    }
};
SplitEditorToLastGroupAction = __decorate([
    __param(2, ICommandService)
], SplitEditorToLastGroupAction);
export { SplitEditorToLastGroupAction };
let EditorLayoutSingleAction = class EditorLayoutSingleAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutSingle';
    static LABEL = localize('editorLayoutSingle', "Single Column Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}] });
    }
};
EditorLayoutSingleAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutSingleAction);
export { EditorLayoutSingleAction };
let EditorLayoutTwoColumnsAction = class EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutTwoColumns';
    static LABEL = localize('editorLayoutTwoColumns', "Two Columns Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
    }
};
EditorLayoutTwoColumnsAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutTwoColumnsAction);
export { EditorLayoutTwoColumnsAction };
let EditorLayoutThreeColumnsAction = class EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutThreeColumns';
    static LABEL = localize('editorLayoutThreeColumns', "Three Columns Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}, {}], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
    }
};
EditorLayoutThreeColumnsAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutThreeColumnsAction);
export { EditorLayoutThreeColumnsAction };
let EditorLayoutTwoRowsAction = class EditorLayoutTwoRowsAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutTwoRows';
    static LABEL = localize('editorLayoutTwoRows', "Two Rows Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
    }
};
EditorLayoutTwoRowsAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutTwoRowsAction);
export { EditorLayoutTwoRowsAction };
let EditorLayoutThreeRowsAction = class EditorLayoutThreeRowsAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutThreeRows';
    static LABEL = localize('editorLayoutThreeRows', "Three Rows Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, {}, {}], orientation: 1 /* GroupOrientation.VERTICAL */ });
    }
};
EditorLayoutThreeRowsAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutThreeRowsAction);
export { EditorLayoutThreeRowsAction };
let EditorLayoutTwoByTwoGridAction = class EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutTwoByTwoGrid';
    static LABEL = localize('editorLayoutTwoByTwoGrid', "Grid Editor Layout (2x2)");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{ groups: [{}, {}] }, { groups: [{}, {}] }] });
    }
};
EditorLayoutTwoByTwoGridAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutTwoByTwoGridAction);
export { EditorLayoutTwoByTwoGridAction };
let EditorLayoutTwoColumnsBottomAction = class EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutTwoColumnsBottom';
    static LABEL = localize('editorLayoutTwoColumnsBottom', "Two Columns Bottom Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, { groups: [{}, {}] }], orientation: 1 /* GroupOrientation.VERTICAL */ });
    }
};
EditorLayoutTwoColumnsBottomAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutTwoColumnsBottomAction);
export { EditorLayoutTwoColumnsBottomAction };
let EditorLayoutTwoRowsRightAction = class EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
    static ID = 'workbench.action.editorLayoutTwoRowsRight';
    static LABEL = localize('editorLayoutTwoRowsRight', "Two Rows Right Editor Layout");
    constructor(id, label, commandService) {
        super(id, label, LAYOUT_EDITOR_GROUPS_COMMAND_ID, commandService, { groups: [{}, { groups: [{}, {}] }], orientation: 0 /* GroupOrientation.HORIZONTAL */ });
    }
};
EditorLayoutTwoRowsRightAction = __decorate([
    __param(2, ICommandService)
], EditorLayoutTwoRowsRightAction);
export { EditorLayoutTwoRowsRightAction };
class AbstractCreateEditorGroupAction extends Action {
    direction;
    editorGroupService;
    constructor(id, label, direction, editorGroupService) {
        super(id, label);
        this.direction = direction;
        this.editorGroupService = editorGroupService;
    }
    async run() {
        this.editorGroupService.addGroup(this.editorGroupService.activeGroup, this.direction, { activate: true });
    }
}
let NewEditorGroupLeftAction = class NewEditorGroupLeftAction extends AbstractCreateEditorGroupAction {
    static ID = 'workbench.action.newGroupLeft';
    static LABEL = localize('newEditorLeft', "New Editor Group to the Left");
    constructor(id, label, editorGroupService) {
        super(id, label, 2 /* GroupDirection.LEFT */, editorGroupService);
    }
};
NewEditorGroupLeftAction = __decorate([
    __param(2, IEditorGroupsService)
], NewEditorGroupLeftAction);
export { NewEditorGroupLeftAction };
let NewEditorGroupRightAction = class NewEditorGroupRightAction extends AbstractCreateEditorGroupAction {
    static ID = 'workbench.action.newGroupRight';
    static LABEL = localize('newEditorRight', "New Editor Group to the Right");
    constructor(id, label, editorGroupService) {
        super(id, label, 3 /* GroupDirection.RIGHT */, editorGroupService);
    }
};
NewEditorGroupRightAction = __decorate([
    __param(2, IEditorGroupsService)
], NewEditorGroupRightAction);
export { NewEditorGroupRightAction };
let NewEditorGroupAboveAction = class NewEditorGroupAboveAction extends AbstractCreateEditorGroupAction {
    static ID = 'workbench.action.newGroupAbove';
    static LABEL = localize('newEditorAbove', "New Editor Group Above");
    constructor(id, label, editorGroupService) {
        super(id, label, 0 /* GroupDirection.UP */, editorGroupService);
    }
};
NewEditorGroupAboveAction = __decorate([
    __param(2, IEditorGroupsService)
], NewEditorGroupAboveAction);
export { NewEditorGroupAboveAction };
let NewEditorGroupBelowAction = class NewEditorGroupBelowAction extends AbstractCreateEditorGroupAction {
    static ID = 'workbench.action.newGroupBelow';
    static LABEL = localize('newEditorBelow', "New Editor Group Below");
    constructor(id, label, editorGroupService) {
        super(id, label, 1 /* GroupDirection.DOWN */, editorGroupService);
    }
};
NewEditorGroupBelowAction = __decorate([
    __param(2, IEditorGroupsService)
], NewEditorGroupBelowAction);
export { NewEditorGroupBelowAction };
let ToggleEditorTypeAction = class ToggleEditorTypeAction extends Action {
    editorService;
    editorResolverService;
    static ID = 'workbench.action.toggleEditorType';
    static LABEL = localize('workbench.action.toggleEditorType', "Toggle Editor Type");
    constructor(id, label, editorService, editorResolverService) {
        super(id, label);
        this.editorService = editorService;
        this.editorResolverService = editorResolverService;
    }
    async run() {
        const activeEditorPane = this.editorService.activeEditorPane;
        if (!activeEditorPane) {
            return;
        }
        const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
        if (!activeEditorResource) {
            return;
        }
        const editorIds = this.editorResolverService.getEditors(activeEditorResource).map(editor => editor.id).filter(id => id !== activeEditorPane.input.editorId);
        if (editorIds.length === 0) {
            return;
        }
        // Replace the current editor with the next avaiable editor type
        await this.editorService.replaceEditors([
            {
                editor: activeEditorPane.input,
                replacement: {
                    resource: activeEditorResource,
                    options: {
                        override: editorIds[0]
                    }
                }
            }
        ], activeEditorPane.group);
    }
};
ToggleEditorTypeAction = __decorate([
    __param(2, IEditorService),
    __param(3, IEditorResolverService)
], ToggleEditorTypeAction);
export { ToggleEditorTypeAction };
let ReOpenInTextEditorAction = class ReOpenInTextEditorAction extends Action {
    editorService;
    static ID = 'workbench.action.reopenTextEditor';
    static LABEL = localize('workbench.action.reopenTextEditor', "Reopen Editor With Text Editor");
    constructor(id, label, editorService) {
        super(id, label);
        this.editorService = editorService;
    }
    async run() {
        const activeEditorPane = this.editorService.activeEditorPane;
        if (!activeEditorPane) {
            return;
        }
        const activeEditorResource = EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
        if (!activeEditorResource) {
            return;
        }
        // Replace the current editor with the text editor
        await this.editorService.replaceEditors([
            {
                editor: activeEditorPane.input,
                replacement: {
                    resource: activeEditorResource,
                    options: {
                        override: DEFAULT_EDITOR_ASSOCIATION.id
                    }
                }
            }
        ], activeEditorPane.group);
    }
};
ReOpenInTextEditorAction = __decorate([
    __param(2, IEditorService)
], ReOpenInTextEditorAction);
export { ReOpenInTextEditorAction };
