/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IHistoryService = createDecorator('historyService');
/**
 * Limit editor navigation to certain kinds.
 */
export var GoFilter;
(function (GoFilter) {
    /**
     * Navigate between editor navigation history
     * entries from any kind of navigation source.
     */
    GoFilter[GoFilter["NONE"] = 0] = "NONE";
    /**
     * Only navigate between editor navigation history
     * entries that were resulting from edits.
     */
    GoFilter[GoFilter["EDITS"] = 1] = "EDITS";
    /**
     * Only navigate between editor navigation history
     * entries that were resulting from navigations, such
     * as "Go to definition".
     */
    GoFilter[GoFilter["NAVIGATION"] = 2] = "NAVIGATION";
})(GoFilter || (GoFilter = {}));
/**
 * Limit editor navigation to certain scopes.
 */
export var GoScope;
(function (GoScope) {
    /**
     * Navigate across all editors and editor groups.
     */
    GoScope[GoScope["DEFAULT"] = 0] = "DEFAULT";
    /**
     * Navigate only in editors of the active editor group.
     */
    GoScope[GoScope["EDITOR_GROUP"] = 1] = "EDITOR_GROUP";
    /**
     * Navigate only in the active editor.
     */
    GoScope[GoScope["EDITOR"] = 2] = "EDITOR";
})(GoScope || (GoScope = {}));
