/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as Assert from 'vs/base/common/assert';
import * as Types from 'vs/base/common/types';
class RegistryImpl {
    data = new Map();
    add(id, data) {
        Assert.ok(Types.isString(id));
        Assert.ok(Types.isObject(data));
        Assert.ok(!this.data.has(id), 'There is already an extension with this id');
        this.data.set(id, data);
    }
    knows(id) {
        return this.data.has(id);
    }
    as(id) {
        return this.data.get(id) || null;
    }
}
export const Registry = new RegistryImpl();
