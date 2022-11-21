/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { basename } from 'vs/base/common/resources';
import { localize } from 'vs/nls';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
export const IDialogService = createDecorator('dialogService');
export const IFileDialogService = createDecorator('fileDialogService');
export var ConfirmResult;
(function (ConfirmResult) {
    ConfirmResult[ConfirmResult["SAVE"] = 0] = "SAVE";
    ConfirmResult[ConfirmResult["DONT_SAVE"] = 1] = "DONT_SAVE";
    ConfirmResult[ConfirmResult["CANCEL"] = 2] = "CANCEL";
})(ConfirmResult || (ConfirmResult = {}));
const MAX_CONFIRM_FILES = 10;
export function getFileNamesMessage(fileNamesOrResources) {
    const message = [];
    message.push(...fileNamesOrResources.slice(0, MAX_CONFIRM_FILES).map(fileNameOrResource => typeof fileNameOrResource === 'string' ? fileNameOrResource : basename(fileNameOrResource)));
    if (fileNamesOrResources.length > MAX_CONFIRM_FILES) {
        if (fileNamesOrResources.length - MAX_CONFIRM_FILES === 1) {
            message.push(localize('moreFile', "...1 additional file not shown"));
        }
        else {
            message.push(localize('moreFiles', "...{0} additional files not shown", fileNamesOrResources.length - MAX_CONFIRM_FILES));
        }
    }
    message.push('');
    return message.join('\n');
}
