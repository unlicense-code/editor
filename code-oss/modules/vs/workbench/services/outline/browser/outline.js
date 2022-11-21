/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IOutlineService = createDecorator('IOutlineService');
export var OutlineTarget;
(function (OutlineTarget) {
    OutlineTarget[OutlineTarget["OutlinePane"] = 1] = "OutlinePane";
    OutlineTarget[OutlineTarget["Breadcrumbs"] = 2] = "Breadcrumbs";
    OutlineTarget[OutlineTarget["QuickPick"] = 4] = "QuickPick";
})(OutlineTarget || (OutlineTarget = {}));
export var OutlineConfigKeys;
(function (OutlineConfigKeys) {
    OutlineConfigKeys["icons"] = "outline.icons";
    OutlineConfigKeys["collapseItems"] = "outline.collapseItems";
    OutlineConfigKeys["problemsEnabled"] = "outline.problems.enabled";
    OutlineConfigKeys["problemsColors"] = "outline.problems.colors";
    OutlineConfigKeys["problemsBadges"] = "outline.problems.badges";
})(OutlineConfigKeys || (OutlineConfigKeys = {}));
export var OutlineConfigCollapseItemsValues;
(function (OutlineConfigCollapseItemsValues) {
    OutlineConfigCollapseItemsValues["Collapsed"] = "alwaysCollapse";
    OutlineConfigCollapseItemsValues["Expanded"] = "alwaysExpand";
})(OutlineConfigCollapseItemsValues || (OutlineConfigCollapseItemsValues = {}));
