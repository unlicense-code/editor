/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { matchesFuzzy, matchesFuzzy2 } from 'vs/base/common/filters';
import * as strings from 'vs/base/common/strings';
export class FilterOptions {
    filter;
    static _filter = matchesFuzzy2;
    static _messageFilter = matchesFuzzy;
    showResolved = true;
    showUnresolved = true;
    textFilter;
    constructor(filter, showResolved, showUnresolved) {
        this.filter = filter;
        filter = filter.trim();
        this.showResolved = showResolved;
        this.showUnresolved = showUnresolved;
        const negate = filter.startsWith('!');
        this.textFilter = { text: (negate ? strings.ltrim(filter, '!') : filter).trim(), negate };
    }
}
