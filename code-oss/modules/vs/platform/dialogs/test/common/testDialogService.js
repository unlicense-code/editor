/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event } from 'vs/base/common/event';
export class TestDialogService {
    onWillShowDialog = Event.None;
    onDidShowDialog = Event.None;
    confirmResult = undefined;
    setConfirmResult(result) {
        this.confirmResult = result;
    }
    async confirm(confirmation) {
        if (this.confirmResult) {
            const confirmResult = this.confirmResult;
            this.confirmResult = undefined;
            return confirmResult;
        }
        return { confirmed: false };
    }
    async show(severity, message, buttons, options) { return { choice: 0 }; }
    async input() { {
        return { choice: 0, values: [] };
    } }
    async about() { }
}
