/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IJSONEditingService = createDecorator('jsonEditingService');
export var JSONEditingErrorCode;
(function (JSONEditingErrorCode) {
    /**
     * Error when trying to write and save to the file while it is dirty in the editor.
     */
    JSONEditingErrorCode[JSONEditingErrorCode["ERROR_FILE_DIRTY"] = 0] = "ERROR_FILE_DIRTY";
    /**
     * Error when trying to write to a file that contains JSON errors.
     */
    JSONEditingErrorCode[JSONEditingErrorCode["ERROR_INVALID_FILE"] = 1] = "ERROR_INVALID_FILE";
})(JSONEditingErrorCode || (JSONEditingErrorCode = {}));
export class JSONEditingError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
