import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { GroupIdentifier } from 'vs/workbench/common/editor';
import { IEditorGroupsService, IEditorGroup } from 'vs/workbench/services/editor/common/editorGroupsService';
import { ACTIVE_GROUP_TYPE, SIDE_GROUP_TYPE } from 'vs/workbench/services/editor/common/editorService';
/**
 * A way to address editor groups through a column based system
 * where `0` is the first column. Will fallback to `SIDE_GROUP`
 * in case the column is invalid.
 */
export declare type EditorGroupColumn = number;
export declare function columnToEditorGroup(editorGroupService: IEditorGroupsService, configurationService: IConfigurationService, column?: number): GroupIdentifier | ACTIVE_GROUP_TYPE | SIDE_GROUP_TYPE;
export declare function editorGroupToColumn(editorGroupService: IEditorGroupsService, editorGroup: IEditorGroup | GroupIdentifier): EditorGroupColumn;
