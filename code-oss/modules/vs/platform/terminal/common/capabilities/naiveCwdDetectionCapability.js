/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
export class NaiveCwdDetectionCapability {
    _process;
    constructor(_process) {
        this._process = _process;
    }
    type = 1 /* TerminalCapability.NaiveCwdDetection */;
    _cwd = '';
    _onDidChangeCwd = new Emitter();
    onDidChangeCwd = this._onDidChangeCwd.event;
    async getCwd() {
        if (!this._process) {
            return Promise.resolve('');
        }
        const newCwd = await this._process.getCwd();
        if (newCwd !== this._cwd) {
            this._onDidChangeCwd.fire(newCwd);
        }
        this._cwd = newCwd;
        return this._cwd;
    }
}
