/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { mapArrayOrNot } from 'vs/base/common/arrays';
import { ILogService } from 'vs/platform/log/common/log';
import { SearchRange, TextSearchMatch } from 'vs/workbench/services/search/common/search';
import * as searchExtTypes from 'vs/workbench/services/search/common/searchExtTypes';
export function anchorGlob(glob) {
    return glob.startsWith('**') || glob.startsWith('/') ? glob : `/${glob}`;
}
/**
 * Create a vscode.TextSearchMatch by using our internal TextSearchMatch type for its previewOptions logic.
 */
export function createTextSearchResult(uri, text, range, previewOptions) {
    const searchRange = mapArrayOrNot(range, rangeToSearchRange);
    const internalResult = new TextSearchMatch(text, searchRange, previewOptions);
    const internalPreviewRange = internalResult.preview.matches;
    return {
        ranges: mapArrayOrNot(searchRange, searchRangeToRange),
        uri,
        preview: {
            text: internalResult.preview.text,
            matches: mapArrayOrNot(internalPreviewRange, searchRangeToRange)
        }
    };
}
function rangeToSearchRange(range) {
    return new SearchRange(range.start.line, range.start.character, range.end.line, range.end.character);
}
function searchRangeToRange(range) {
    return new searchExtTypes.Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
}
let OutputChannel = class OutputChannel {
    prefix;
    logService;
    constructor(prefix, logService) {
        this.prefix = prefix;
        this.logService = logService;
    }
    appendLine(msg) {
        this.logService.debug(`${this.prefix}#search`, msg);
    }
};
OutputChannel = __decorate([
    __param(1, ILogService)
], OutputChannel);
export { OutputChannel };
