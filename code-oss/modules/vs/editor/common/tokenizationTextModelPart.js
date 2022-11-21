/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var BackgroundTokenizationState;
(function (BackgroundTokenizationState) {
    BackgroundTokenizationState[BackgroundTokenizationState["Uninitialized"] = 0] = "Uninitialized";
    BackgroundTokenizationState[BackgroundTokenizationState["InProgress"] = 1] = "InProgress";
    BackgroundTokenizationState[BackgroundTokenizationState["Completed"] = 2] = "Completed";
})(BackgroundTokenizationState || (BackgroundTokenizationState = {}));
