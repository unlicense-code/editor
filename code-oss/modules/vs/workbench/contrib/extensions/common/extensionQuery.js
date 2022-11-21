/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { flatten } from 'vs/base/common/arrays';
import { EXTENSION_CATEGORIES } from 'vs/platform/extensions/common/extensions';
export class Query {
    value;
    sortBy;
    groupBy;
    constructor(value, sortBy, groupBy) {
        this.value = value;
        this.sortBy = sortBy;
        this.groupBy = groupBy;
        this.value = value.trim();
    }
    static suggestions(query) {
        const commands = ['installed', 'updates', 'enabled', 'disabled', 'builtin', 'featured', 'popular', 'recommended', 'recentlyPublished', 'workspaceUnsupported', 'deprecated', 'sort', 'category', 'tag', 'ext', 'id'];
        const subcommands = {
            'sort': ['installs', 'rating', 'name', 'publishedDate', 'updateDate'],
            'category': EXTENSION_CATEGORIES.map(c => `"${c.toLowerCase()}"`),
            'tag': [''],
            'ext': [''],
            'id': ['']
        };
        const queryContains = (substr) => query.indexOf(substr) > -1;
        const hasSort = subcommands.sort.some(subcommand => queryContains(`@sort:${subcommand}`));
        const hasCategory = subcommands.category.some(subcommand => queryContains(`@category:${subcommand}`));
        return flatten(commands.map(command => {
            if (hasSort && command === 'sort' || hasCategory && command === 'category') {
                return [];
            }
            if (command in subcommands) {
                return subcommands[command]
                    .map(subcommand => `@${command}:${subcommand}${subcommand === '' ? '' : ' '}`);
            }
            else {
                return queryContains(`@${command}`) ? [] : [`@${command} `];
            }
        }));
    }
    static parse(value) {
        let sortBy = '';
        value = value.replace(/@sort:(\w+)(-\w*)?/g, (match, by, order) => {
            sortBy = by;
            return '';
        });
        let groupBy = '';
        value = value.replace(/@group:(\w+)(-\w*)?/g, (match, by, order) => {
            groupBy = by;
            return '';
        });
        return new Query(value, sortBy, groupBy);
    }
    toString() {
        let result = this.value;
        if (this.sortBy) {
            result = `${result}${result ? ' ' : ''}@sort:${this.sortBy}`;
        }
        if (this.groupBy) {
            result = `${result}${result ? ' ' : ''}@group:${this.groupBy}`;
        }
        return result;
    }
    isValid() {
        return !/@outdated/.test(this.value);
    }
    equals(other) {
        return this.value === other.value && this.sortBy === other.sortBy;
    }
}
