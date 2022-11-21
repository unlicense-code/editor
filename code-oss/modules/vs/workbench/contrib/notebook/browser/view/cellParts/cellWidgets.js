/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var ClickTargetType;
(function (ClickTargetType) {
    ClickTargetType[ClickTargetType["Container"] = 0] = "Container";
    ClickTargetType[ClickTargetType["ContributedTextItem"] = 1] = "ContributedTextItem";
    ClickTargetType[ClickTargetType["ContributedCommandItem"] = 2] = "ContributedCommandItem";
})(ClickTargetType || (ClickTargetType = {}));
