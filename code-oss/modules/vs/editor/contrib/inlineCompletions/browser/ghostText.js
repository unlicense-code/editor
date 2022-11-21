/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
import { applyEdits } from 'vs/editor/contrib/inlineCompletions/browser/utils';
export class GhostText {
    lineNumber;
    parts;
    additionalReservedLineCount;
    static equals(a, b) {
        return a === b || (!!a && !!b && a.equals(b));
    }
    constructor(lineNumber, parts, additionalReservedLineCount = 0) {
        this.lineNumber = lineNumber;
        this.parts = parts;
        this.additionalReservedLineCount = additionalReservedLineCount;
    }
    equals(other) {
        return this.lineNumber === other.lineNumber &&
            this.parts.length === other.parts.length &&
            this.parts.every((part, index) => part.equals(other.parts[index]));
    }
    /**
     * Only used for testing/debugging.
    */
    render(documentText, debug = false) {
        const l = this.lineNumber;
        return applyEdits(documentText, [
            ...this.parts.map(p => ({
                range: { startLineNumber: l, endLineNumber: l, startColumn: p.column, endColumn: p.column },
                text: debug ? `[${p.lines.join('\n')}]` : p.lines.join('\n')
            })),
        ]);
    }
    renderForScreenReader(lineText) {
        if (this.parts.length === 0) {
            return '';
        }
        const lastPart = this.parts[this.parts.length - 1];
        const cappedLineText = lineText.substr(0, lastPart.column - 1);
        const text = applyEdits(cappedLineText, this.parts.map(p => ({
            range: { startLineNumber: 1, endLineNumber: 1, startColumn: p.column, endColumn: p.column },
            text: p.lines.join('\n')
        })));
        return text.substring(this.parts[0].column - 1);
    }
    isEmpty() {
        return this.parts.every(p => p.lines.length === 0);
    }
}
export class GhostTextPart {
    column;
    lines;
    preview;
    constructor(column, lines, 
    /**
     * Indicates if this part is a preview of an inline suggestion when a suggestion is previewed.
    */
    preview) {
        this.column = column;
        this.lines = lines;
        this.preview = preview;
    }
    equals(other) {
        return this.column === other.column &&
            this.lines.length === other.lines.length &&
            this.lines.every((line, index) => line === other.lines[index]);
    }
}
export class GhostTextReplacement {
    lineNumber;
    columnStart;
    length;
    newLines;
    additionalReservedLineCount;
    constructor(lineNumber, columnStart, length, newLines, additionalReservedLineCount = 0) {
        this.lineNumber = lineNumber;
        this.columnStart = columnStart;
        this.length = length;
        this.newLines = newLines;
        this.additionalReservedLineCount = additionalReservedLineCount;
    }
    parts = [
        new GhostTextPart(this.columnStart + this.length, this.newLines, false),
    ];
    renderForScreenReader(_lineText) {
        return this.newLines.join('\n');
    }
    render(documentText, debug = false) {
        const startLineNumber = this.lineNumber;
        const endLineNumber = this.lineNumber;
        if (debug) {
            return applyEdits(documentText, [
                {
                    range: { startLineNumber, endLineNumber, startColumn: this.columnStart, endColumn: this.columnStart },
                    text: `(`
                },
                {
                    range: { startLineNumber, endLineNumber, startColumn: this.columnStart + this.length, endColumn: this.columnStart + this.length },
                    text: `)[${this.newLines.join('\n')}]`
                }
            ]);
        }
        else {
            return applyEdits(documentText, [
                {
                    range: { startLineNumber, endLineNumber, startColumn: this.columnStart, endColumn: this.columnStart + this.length },
                    text: this.newLines.join('\n')
                }
            ]);
        }
    }
}
export class BaseGhostTextWidgetModel extends Disposable {
    editor;
    _expanded = undefined;
    onDidChangeEmitter = new Emitter();
    onDidChange = this.onDidChangeEmitter.event;
    get expanded() {
        if (this._expanded === undefined) {
            // TODO this should use a global hidden setting.
            // See https://github.com/microsoft/vscode/issues/125037.
            return true;
        }
        return this._expanded;
    }
    constructor(editor) {
        super();
        this.editor = editor;
        this._register(editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(108 /* EditorOption.suggest */) && this._expanded === undefined) {
                this.onDidChangeEmitter.fire();
            }
        }));
    }
    setExpanded(expanded) {
        this._expanded = true;
        this.onDidChangeEmitter.fire();
    }
}
