/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class SignService {
    static _nextId = 1;
    validators = new Map();
    vsda() {
        return new Promise((resolve, reject) => require(['vsda'], resolve, reject));
    }
    async createNewMessage(value) {
        try {
            const vsda = await this.vsda();
            const validator = new vsda.validator();
            if (validator) {
                const id = String(SignService._nextId++);
                this.validators.set(id, validator);
                return {
                    id: id,
                    data: validator.createNewMessage(value)
                };
            }
        }
        catch (e) {
            // ignore errors silently
        }
        return { id: '', data: value };
    }
    async validate(message, value) {
        if (!message.id) {
            return true;
        }
        const validator = this.validators.get(message.id);
        if (!validator) {
            return false;
        }
        this.validators.delete(message.id);
        try {
            return (validator.validate(value) === 'ok');
        }
        catch (e) {
            // ignore errors silently
            return false;
        }
    }
    async sign(value) {
        try {
            const vsda = await this.vsda();
            const signer = new vsda.signer();
            if (signer) {
                return signer.sign(value);
            }
        }
        catch (e) {
            // ignore errors silently
        }
        return value;
    }
}
