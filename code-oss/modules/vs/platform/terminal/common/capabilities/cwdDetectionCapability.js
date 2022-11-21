/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
export class CwdDetectionCapability {
    type = 0 /* TerminalCapability.CwdDetection */;
    _cwd = '';
    _cwds = new Map();
    /**
     * Gets the list of cwds seen in this session in order of last accessed.
     */
    get cwds() {
        return Array.from(this._cwds.keys());
    }
    _onDidChangeCwd = new Emitter();
    onDidChangeCwd = this._onDidChangeCwd.event;
    getCwd() {
        return this._cwd;
    }
    updateCwd(cwd) {
        const didChange = this._cwd !== cwd;
        this._cwd = cwd;
        const count = this._cwds.get(this._cwd) || 0;
        this._cwds.delete(this._cwd); // Delete to put it at the bottom of the iterable
        this._cwds.set(this._cwd, count + 1);
        if (didChange) {
            this._onDidChangeCwd.fire(cwd);
        }
    }
}
