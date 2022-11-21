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
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { convertLinkRangeToBuffer, getXtermLineContent } from 'vs/workbench/contrib/terminal/browser/links/terminalLinkHelpers';
import { TERMINAL_CONFIG_SECTION } from 'vs/workbench/contrib/terminal/common/terminal';
var Constants;
(function (Constants) {
    /**
     * The max line length to try extract word links from.
     */
    Constants[Constants["MaxLineLength"] = 2000] = "MaxLineLength";
})(Constants || (Constants = {}));
let TerminalWordLinkDetector = class TerminalWordLinkDetector {
    xterm;
    _configurationService;
    static id = 'word';
    // Word links typically search the workspace so it makes sense that their maximum link length is
    // quite small.
    maxLinkLength = 100;
    constructor(xterm, _configurationService) {
        this.xterm = xterm;
        this._configurationService = _configurationService;
    }
    detect(lines, startLine, endLine) {
        const links = [];
        const wordSeparators = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).wordSeparators;
        // Get the text representation of the wrapped line
        const text = getXtermLineContent(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
        if (text === '' || text.length > 2000 /* Constants.MaxLineLength */) {
            return [];
        }
        // Parse out all words from the wrapped line
        const words = this._parseWords(text, wordSeparators);
        // Map the words to ITerminalLink objects
        for (const word of words) {
            if (word.text === '') {
                continue;
            }
            if (word.text.length > 0 && word.text.charAt(word.text.length - 1) === ':') {
                word.text = word.text.slice(0, -1);
                word.endIndex--;
            }
            const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
                startColumn: word.startIndex + 1,
                startLineNumber: 1,
                endColumn: word.endIndex + 1,
                endLineNumber: 1
            }, startLine);
            links.push({
                text: word.text,
                bufferRange,
                type: "Search" /* TerminalBuiltinLinkType.Search */
            });
        }
        return links;
    }
    _parseWords(text, separators) {
        const words = [];
        const wordSeparators = separators.split('');
        const characters = text.split('');
        let startIndex = 0;
        for (let i = 0; i < text.length; i++) {
            if (wordSeparators.includes(characters[i])) {
                words.push({ startIndex, endIndex: i, text: text.substring(startIndex, i) });
                startIndex = i + 1;
            }
        }
        if (startIndex < text.length) {
            words.push({ startIndex, endIndex: text.length, text: text.substring(startIndex) });
        }
        return words;
    }
};
TerminalWordLinkDetector = __decorate([
    __param(1, IConfigurationService)
], TerminalWordLinkDetector);
export { TerminalWordLinkDetector };
