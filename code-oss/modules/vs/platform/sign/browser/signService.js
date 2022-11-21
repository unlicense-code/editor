/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class SignService {
    _token;
    constructor(_token) {
        this._token = _token;
    }
    async createNewMessage(value) {
        return { id: '', data: value };
    }
    async validate(message, value) {
        return true;
    }
    async sign(value) {
        const token = await Promise.resolve(this._token);
        return token || '';
    }
}
