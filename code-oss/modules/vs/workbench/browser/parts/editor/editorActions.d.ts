import { Action } from 'vs/base/common/actions';
import { IEditorIdentifier, IEditorCommandsContext } from 'vs/workbench/common/editor';
import { IWorkbenchLayoutService } from 'vs/workbench/services/layout/browser/layoutService';
import { IHistoryService } from 'vs/workbench/services/history/common/history';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IEditorGroupsService, IEditorGroup, GroupDirection, IFindGroupScope } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IWorkspacesService } from 'vs/platform/workspaces/common/workspaces';
import { IFileDialogService, IDialogService } from 'vs/platform/dialogs/common/dialogs';
import { ItemActivation, IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IFilesConfigurationService } from 'vs/workbench/services/filesConfiguration/common/filesConfigurationService';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
import { Action2 } from 'vs/platform/actions/common/actions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ILogService } from 'vs/platform/log/common/log';
export declare class ExecuteCommandAction extends Action {
    private commandId;
    private commandService;
    private commandArgs?;
    constructor(id: string, label: string, commandId: string, commandService: ICommandService, commandArgs?: unknown);
    run(): Promise<void>;
}
declare abstract class AbstractSplitEditorAction extends Action {
    protected editorGroupService: IEditorGroupsService;
    protected configurationService: IConfigurationService;
    private readonly toDispose;
    private direction;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService);
    protected getDirection(): GroupDirection;
    private registerListeners;
    run(context?: IEditorIdentifier): Promise<void>;
}
export declare class SplitEditorAction extends AbstractSplitEditorAction {
    static readonly ID = "workbench.action.splitEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService);
}
export declare class SplitEditorOrthogonalAction extends AbstractSplitEditorAction {
    static readonly ID = "workbench.action.splitEditorOrthogonal";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, configurationService: IConfigurationService);
    protected getDirection(): GroupDirection;
}
export declare class SplitEditorLeftAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorLeft";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorRightAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorRight";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorUpAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorUp";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorDownAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorDown";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class JoinTwoGroupsAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.joinTwoGroups";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(context?: IEditorIdentifier): Promise<void>;
}
export declare class JoinAllGroupsAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.joinAllGroups";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class NavigateBetweenGroupsAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.navigateEditorGroups";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class FocusActiveGroupAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.focusActiveEditorGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
declare abstract class AbstractFocusGroupAction extends Action {
    private scope;
    private readonly editorGroupService;
    constructor(id: string, label: string, scope: IFindGroupScope, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class FocusFirstGroupAction extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusFirstEditorGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusLastGroupAction extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusLastEditorGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusNextGroup extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusNextGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusPreviousGroup extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusPreviousGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusLeftGroup extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusLeftGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusRightGroup extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusRightGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusAboveGroup extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusAboveGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class FocusBelowGroup extends AbstractFocusGroupAction {
    static readonly ID = "workbench.action.focusBelowGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class CloseEditorAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.action.closeActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: IEditorCommandsContext): Promise<void>;
}
export declare class UnpinEditorAction extends Action {
    private readonly commandService;
    static readonly ID = "workbench.action.unpinActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
    run(context?: IEditorCommandsContext): Promise<void>;
}
export declare class CloseOneEditorAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.closeActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(context?: IEditorCommandsContext): Promise<void>;
}
export declare class RevertAndCloseEditorAction extends Action {
    private readonly editorService;
    private readonly logService;
    static readonly ID = "workbench.action.revertAndCloseActiveEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorService: IEditorService, logService: ILogService);
    run(): Promise<void>;
}
export declare class CloseLeftEditorsInGroupAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.closeEditorsToTheLeft";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(context?: IEditorIdentifier): Promise<void>;
    private getTarget;
}
declare abstract class AbstractCloseAllAction extends Action {
    private fileDialogService;
    protected editorGroupService: IEditorGroupsService;
    private editorService;
    private filesConfigurationService;
    constructor(id: string, label: string, clazz: string | undefined, fileDialogService: IFileDialogService, editorGroupService: IEditorGroupsService, editorService: IEditorService, filesConfigurationService: IFilesConfigurationService);
    protected get groupsToClose(): IEditorGroup[];
    run(): Promise<void>;
    private revealEditorsToConfirm;
    protected abstract get excludeSticky(): boolean;
    protected doCloseAll(): Promise<void>;
}
export declare class CloseAllEditorsAction extends AbstractCloseAllAction {
    static readonly ID = "workbench.action.closeAllEditors";
    static readonly LABEL: string;
    constructor(id: string, label: string, fileDialogService: IFileDialogService, editorGroupService: IEditorGroupsService, editorService: IEditorService, filesConfigurationService: IFilesConfigurationService);
    protected get excludeSticky(): boolean;
}
export declare class CloseAllEditorGroupsAction extends AbstractCloseAllAction {
    static readonly ID = "workbench.action.closeAllGroups";
    static readonly LABEL: string;
    constructor(id: string, label: string, fileDialogService: IFileDialogService, editorGroupService: IEditorGroupsService, editorService: IEditorService, filesConfigurationService: IFilesConfigurationService);
    protected get excludeSticky(): boolean;
    protected doCloseAll(): Promise<void>;
}
export declare class CloseEditorsInOtherGroupsAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.closeEditorsInOtherGroups";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(context?: IEditorIdentifier): Promise<void>;
}
export declare class CloseEditorInAllGroupsAction extends Action {
    private readonly editorGroupService;
    private readonly editorService;
    static readonly ID = "workbench.action.closeEditorInAllGroups";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    run(): Promise<void>;
}
declare abstract class AbstractMoveCopyGroupAction extends Action {
    private direction;
    private isMove;
    private editorGroupService;
    constructor(id: string, label: string, direction: GroupDirection, isMove: boolean, editorGroupService: IEditorGroupsService);
    run(context?: IEditorIdentifier): Promise<void>;
    private findTargetGroup;
}
declare abstract class AbstractMoveGroupAction extends AbstractMoveCopyGroupAction {
    constructor(id: string, label: string, direction: GroupDirection, editorGroupService: IEditorGroupsService);
}
export declare class MoveGroupLeftAction extends AbstractMoveGroupAction {
    static readonly ID = "workbench.action.moveActiveEditorGroupLeft";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class MoveGroupRightAction extends AbstractMoveGroupAction {
    static readonly ID = "workbench.action.moveActiveEditorGroupRight";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class MoveGroupUpAction extends AbstractMoveGroupAction {
    static readonly ID = "workbench.action.moveActiveEditorGroupUp";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class MoveGroupDownAction extends AbstractMoveGroupAction {
    static readonly ID = "workbench.action.moveActiveEditorGroupDown";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
declare abstract class AbstractDuplicateGroupAction extends AbstractMoveCopyGroupAction {
    constructor(id: string, label: string, direction: GroupDirection, editorGroupService: IEditorGroupsService);
}
export declare class DuplicateGroupLeftAction extends AbstractDuplicateGroupAction {
    static readonly ID = "workbench.action.duplicateActiveEditorGroupLeft";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class DuplicateGroupRightAction extends AbstractDuplicateGroupAction {
    static readonly ID = "workbench.action.duplicateActiveEditorGroupRight";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class DuplicateGroupUpAction extends AbstractDuplicateGroupAction {
    static readonly ID = "workbench.action.duplicateActiveEditorGroupUp";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class DuplicateGroupDownAction extends AbstractDuplicateGroupAction {
    static readonly ID = "workbench.action.duplicateActiveEditorGroupDown";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class MinimizeOtherGroupsAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.minimizeOtherEditors";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class ResetGroupSizesAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.evenEditorWidths";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class ToggleGroupSizesAction extends Action {
    private readonly editorGroupService;
    static readonly ID = "workbench.action.toggleEditorWidths";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class MaximizeGroupAction extends Action {
    private readonly editorService;
    private readonly editorGroupService;
    private readonly layoutService;
    static readonly ID = "workbench.action.maximizeEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorService: IEditorService, editorGroupService: IEditorGroupsService, layoutService: IWorkbenchLayoutService);
    run(): Promise<void>;
}
declare abstract class AbstractNavigateEditorAction extends Action {
    protected editorGroupService: IEditorGroupsService;
    protected editorService: IEditorService;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    run(): Promise<void>;
    protected abstract navigate(): IEditorIdentifier | undefined;
}
export declare class OpenNextEditor extends AbstractNavigateEditorAction {
    static readonly ID = "workbench.action.nextEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    protected navigate(): IEditorIdentifier | undefined;
}
export declare class OpenPreviousEditor extends AbstractNavigateEditorAction {
    static readonly ID = "workbench.action.previousEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    protected navigate(): IEditorIdentifier | undefined;
}
export declare class OpenNextEditorInGroup extends AbstractNavigateEditorAction {
    static readonly ID = "workbench.action.nextEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    protected navigate(): IEditorIdentifier;
}
export declare class OpenPreviousEditorInGroup extends AbstractNavigateEditorAction {
    static readonly ID = "workbench.action.previousEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    protected navigate(): IEditorIdentifier;
}
export declare class OpenFirstEditorInGroup extends AbstractNavigateEditorAction {
    static readonly ID = "workbench.action.firstEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    protected navigate(): IEditorIdentifier;
}
export declare class OpenLastEditorInGroup extends AbstractNavigateEditorAction {
    static readonly ID = "workbench.action.lastEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService, editorService: IEditorService);
    protected navigate(): IEditorIdentifier;
}
export declare class NavigateForwardAction extends Action2 {
    static readonly ID = "workbench.action.navigateForward";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigateBackwardsAction extends Action2 {
    static readonly ID = "workbench.action.navigateBack";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class NavigatePreviousAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateLast";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigateForwardInEditsAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateForwardInEditLocations";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigateBackwardsInEditsAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateBackInEditLocations";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigatePreviousInEditsAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigatePreviousInEditLocations";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigateToLastEditLocationAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateToLastEditLocation";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigateForwardInNavigationsAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateForwardInNavigationLocations";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigateBackwardsInNavigationsAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateBackInNavigationLocations";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigatePreviousInNavigationsAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigatePreviousInNavigationLocations";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class NavigateToLastNavigationLocationAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.navigateToLastNavigationLocation";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class ReopenClosedEditorAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.reopenClosedEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class ClearRecentFilesAction extends Action {
    private readonly workspacesService;
    private readonly historyService;
    private readonly dialogService;
    static readonly ID = "workbench.action.clearRecentFiles";
    static readonly LABEL: string;
    constructor(id: string, label: string, workspacesService: IWorkspacesService, historyService: IHistoryService, dialogService: IDialogService);
    run(): Promise<void>;
}
export declare class ShowEditorsInActiveGroupByMostRecentlyUsedAction extends Action {
    private readonly quickInputService;
    static readonly ID = "workbench.action.showEditorsInActiveGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService);
    run(): Promise<void>;
}
export declare class ShowAllEditorsByAppearanceAction extends Action {
    private readonly quickInputService;
    static readonly ID = "workbench.action.showAllEditors";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService);
    run(): Promise<void>;
}
export declare class ShowAllEditorsByMostRecentlyUsedAction extends Action {
    private readonly quickInputService;
    static readonly ID = "workbench.action.showAllEditorsByMostRecentlyUsed";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService);
    run(): Promise<void>;
}
declare abstract class AbstractQuickAccessEditorAction extends Action {
    private prefix;
    private itemActivation;
    private readonly quickInputService;
    private readonly keybindingService;
    constructor(id: string, label: string, prefix: string, itemActivation: ItemActivation | undefined, quickInputService: IQuickInputService, keybindingService: IKeybindingService);
    run(): Promise<void>;
}
export declare class QuickAccessPreviousRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    static readonly ID = "workbench.action.quickOpenPreviousRecentlyUsedEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService, keybindingService: IKeybindingService);
}
export declare class QuickAccessLeastRecentlyUsedEditorAction extends AbstractQuickAccessEditorAction {
    static readonly ID = "workbench.action.quickOpenLeastRecentlyUsedEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService, keybindingService: IKeybindingService);
}
export declare class QuickAccessPreviousRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    static readonly ID = "workbench.action.quickOpenPreviousRecentlyUsedEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService, keybindingService: IKeybindingService);
}
export declare class QuickAccessLeastRecentlyUsedEditorInGroupAction extends AbstractQuickAccessEditorAction {
    static readonly ID = "workbench.action.quickOpenLeastRecentlyUsedEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService, keybindingService: IKeybindingService);
}
export declare class QuickAccessPreviousEditorFromHistoryAction extends Action {
    private readonly quickInputService;
    private readonly keybindingService;
    private readonly editorGroupService;
    static readonly ID = "workbench.action.openPreviousEditorFromHistory";
    static readonly LABEL: string;
    constructor(id: string, label: string, quickInputService: IQuickInputService, keybindingService: IKeybindingService, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class OpenNextRecentlyUsedEditorAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.openNextRecentlyUsedEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class OpenPreviousRecentlyUsedEditorAction extends Action {
    private readonly historyService;
    static readonly ID = "workbench.action.openPreviousRecentlyUsedEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService);
    run(): Promise<void>;
}
export declare class OpenNextRecentlyUsedEditorInGroupAction extends Action {
    private readonly historyService;
    private readonly editorGroupsService;
    static readonly ID = "workbench.action.openNextRecentlyUsedEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService, editorGroupsService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class OpenPreviousRecentlyUsedEditorInGroupAction extends Action {
    private readonly historyService;
    private readonly editorGroupsService;
    static readonly ID = "workbench.action.openPreviousRecentlyUsedEditorInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService, editorGroupsService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class ClearEditorHistoryAction extends Action {
    private readonly historyService;
    private readonly dialogService;
    static readonly ID = "workbench.action.clearEditorHistory";
    static readonly LABEL: string;
    constructor(id: string, label: string, historyService: IHistoryService, dialogService: IDialogService);
    run(): Promise<void>;
}
export declare class MoveEditorLeftInGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorLeftInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorRightInGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorRightInGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToPreviousGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToPreviousGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToNextGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToNextGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToAboveGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToAboveGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToBelowGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToBelowGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToLeftGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToLeftGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToRightGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToRightGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToFirstGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToFirstGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class MoveEditorToLastGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.moveEditorToLastGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToPreviousGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToPreviousGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToNextGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToNextGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToAboveGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToAboveGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToBelowGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToBelowGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToLeftGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToLeftGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToRightGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToRightGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToFirstGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToFirstGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class SplitEditorToLastGroupAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.splitEditorToLastGroup";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutSingleAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutSingle";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutTwoColumnsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoColumns";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutThreeColumnsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutThreeColumns";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutTwoRowsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoRows";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutThreeRowsAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutThreeRows";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutTwoByTwoGridAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoByTwoGrid";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutTwoColumnsBottomAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoColumnsBottom";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
export declare class EditorLayoutTwoRowsRightAction extends ExecuteCommandAction {
    static readonly ID = "workbench.action.editorLayoutTwoRowsRight";
    static readonly LABEL: string;
    constructor(id: string, label: string, commandService: ICommandService);
}
declare abstract class AbstractCreateEditorGroupAction extends Action {
    private direction;
    private editorGroupService;
    constructor(id: string, label: string, direction: GroupDirection, editorGroupService: IEditorGroupsService);
    run(): Promise<void>;
}
export declare class NewEditorGroupLeftAction extends AbstractCreateEditorGroupAction {
    static readonly ID = "workbench.action.newGroupLeft";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class NewEditorGroupRightAction extends AbstractCreateEditorGroupAction {
    static readonly ID = "workbench.action.newGroupRight";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class NewEditorGroupAboveAction extends AbstractCreateEditorGroupAction {
    static readonly ID = "workbench.action.newGroupAbove";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class NewEditorGroupBelowAction extends AbstractCreateEditorGroupAction {
    static readonly ID = "workbench.action.newGroupBelow";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorGroupService: IEditorGroupsService);
}
export declare class ToggleEditorTypeAction extends Action {
    private readonly editorService;
    private readonly editorResolverService;
    static readonly ID = "workbench.action.toggleEditorType";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorService: IEditorService, editorResolverService: IEditorResolverService);
    run(): Promise<void>;
}
export declare class ReOpenInTextEditorAction extends Action {
    private readonly editorService;
    static readonly ID = "workbench.action.reopenTextEditor";
    static readonly LABEL: string;
    constructor(id: string, label: string, editorService: IEditorService);
    run(): Promise<void>;
}
export {};
