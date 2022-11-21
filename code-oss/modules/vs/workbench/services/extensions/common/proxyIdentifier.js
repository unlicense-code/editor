/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class ProxyIdentifier {
    static count = 0;
    _proxyIdentifierBrand = undefined;
    sid;
    nid;
    constructor(sid) {
        this.sid = sid;
        this.nid = (++ProxyIdentifier.count);
    }
}
const identifiers = [];
export function createProxyIdentifier(identifier) {
    const result = new ProxyIdentifier(identifier);
    identifiers[result.nid] = result;
    return result;
}
export function getStringIdentifierForProxy(nid) {
    return identifiers[nid].sid;
}
/**
 * Marks the object as containing buffers that should be serialized more efficiently.
 */
export class SerializableObjectWithBuffers {
    value;
    constructor(value) {
        this.value = value;
    }
}
