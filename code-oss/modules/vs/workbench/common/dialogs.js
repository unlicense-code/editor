/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { DeferredPromise } from 'vs/base/common/async';
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export class DialogsModel extends Disposable {
    dialogs = [];
    _onWillShowDialog = this._register(new Emitter());
    onWillShowDialog = this._onWillShowDialog.event;
    _onDidShowDialog = this._register(new Emitter());
    onDidShowDialog = this._onDidShowDialog.event;
    show(dialog) {
        const promise = new DeferredPromise();
        const item = {
            args: dialog,
            close: result => {
                this.dialogs.splice(0, 1);
                promise.complete(result);
                this._onDidShowDialog.fire();
            }
        };
        this.dialogs.push(item);
        this._onWillShowDialog.fire();
        return {
            item,
            result: promise.p
        };
    }
}
