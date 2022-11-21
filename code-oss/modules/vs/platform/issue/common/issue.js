/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var IssueType;
(function (IssueType) {
    IssueType[IssueType["Bug"] = 0] = "Bug";
    IssueType[IssueType["PerformanceIssue"] = 1] = "PerformanceIssue";
    IssueType[IssueType["FeatureRequest"] = 2] = "FeatureRequest";
})(IssueType || (IssueType = {}));
