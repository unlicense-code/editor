import { MainThreadEditorTabsShape } from 'vs/workbench/api/common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { EditorGroupColumn } from 'vs/workbench/services/editor/common/editorGroupColumn';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
export declare class MainThreadEditorTabs implements MainThreadEditorTabsShape {
    private readonly _editorGroupsService;
    private readonly _configurationService;
    private readonly _dispoables;
    private readonly _proxy;
    private _tabGroupModel;
    private readonly _groupLookup;
    private readonly _tabInfoLookup;
    constructor(extHostContext: IExtHostContext, _editorGroupsService: IEditorGroupsService, _configurationService: IConfigurationService, editorService: IEditorService);
    dispose(): void;
    /**
     * Creates a tab object with the correct properties
     * @param editor The editor input represented by the tab
     * @param group The group the tab is in
     * @returns A tab object
     */
    private _buildTabObject;
    private _editorInputToDto;
    /**
     * Generates a unique id for a tab
     * @param editor The editor input
     * @param groupId The group id
     * @returns A unique identifier for a specific tab
     */
    private _generateTabId;
    /**
     * Called whenever a group activates, updates the model by marking the group as active an notifies the extension host
     */
    private _onDidGroupActivate;
    /**
     * Called when the tab label changes
     * @param groupId The id of the group the tab exists in
     * @param editorInput The editor input represented by the tab
     */
    private _onDidTabLabelChange;
    /**
     * Called when a new tab is opened
     * @param groupId The id of the group the tab is being created in
     * @param editorInput The editor input being opened
     * @param editorIndex The index of the editor within that group
     */
    private _onDidTabOpen;
    /**
     * Called when a tab is closed
     * @param groupId The id of the group the tab is being removed from
     * @param editorIndex The index of the editor within that group
     */
    private _onDidTabClose;
    /**
     * Called when the active tab changes
     * @param groupId The id of the group the tab is contained in
     * @param editorIndex The index of the tab
     */
    private _onDidTabActiveChange;
    /**
     * Called when the dirty indicator on the tab changes
     * @param groupId The id of the group the tab is in
     * @param editorIndex The index of the tab
     * @param editor The editor input represented by the tab
     */
    private _onDidTabDirty;
    /**
     * Called when the tab is pinned/unpinned
     * @param groupId The id of the group the tab is in
     * @param editorIndex The index of the tab
     * @param editor The editor input represented by the tab
     */
    private _onDidTabPinChange;
    /**
 * Called when the tab is preview / unpreviewed
 * @param groupId The id of the group the tab is in
 * @param editorIndex The index of the tab
 * @param editor The editor input represented by the tab
 */
    private _onDidTabPreviewChange;
    private _onDidTabMove;
    /**
     * Builds the model from scratch based on the current state of the editor service.
     */
    private _createTabsModel;
    /**
     * The main handler for the tab events
     * @param events The list of events to process
     */
    private _updateTabsModel;
    $moveTab(tabId: string, index: number, viewColumn: EditorGroupColumn, preserveFocus?: boolean): void;
    $closeTab(tabIds: string[], preserveFocus?: boolean): Promise<boolean>;
    $closeGroup(groupIds: number[], preserveFocus?: boolean): Promise<boolean>;
}
