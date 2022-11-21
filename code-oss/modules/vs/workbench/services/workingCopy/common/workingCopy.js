/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var WorkingCopyCapabilities;
(function (WorkingCopyCapabilities) {
    /**
     * Signals no specific capability for the working copy.
     */
    WorkingCopyCapabilities[WorkingCopyCapabilities["None"] = 0] = "None";
    /**
     * Signals that the working copy requires
     * additional input when saving, e.g. an
     * associated path to save to.
     */
    WorkingCopyCapabilities[WorkingCopyCapabilities["Untitled"] = 2] = "Untitled";
})(WorkingCopyCapabilities || (WorkingCopyCapabilities = {}));
/**
 * @deprecated it is important to provide a type identifier
 * for working copies to enable all capabilities.
 */
export const NO_TYPE_ID = '';
