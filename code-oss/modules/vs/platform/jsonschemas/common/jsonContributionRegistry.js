/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import * as platform from 'vs/platform/registry/common/platform';
export const Extensions = {
    JSONContribution: 'base.contributions.json'
};
function normalizeId(id) {
    if (id.length > 0 && id.charAt(id.length - 1) === '#') {
        return id.substring(0, id.length - 1);
    }
    return id;
}
class JSONContributionRegistry {
    schemasById;
    _onDidChangeSchema = new Emitter();
    onDidChangeSchema = this._onDidChangeSchema.event;
    constructor() {
        this.schemasById = {};
    }
    registerSchema(uri, unresolvedSchemaContent) {
        this.schemasById[normalizeId(uri)] = unresolvedSchemaContent;
        this._onDidChangeSchema.fire(uri);
    }
    notifySchemaChanged(uri) {
        this._onDidChangeSchema.fire(uri);
    }
    getSchemaContributions() {
        return {
            schemas: this.schemasById,
        };
    }
}
const jsonContributionRegistry = new JSONContributionRegistry();
platform.Registry.add(Extensions.JSONContribution, jsonContributionRegistry);
