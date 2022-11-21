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
import * as dom from 'vs/base/browser/dom';
import { Disposable, DisposableStore, toDisposable } from 'vs/base/common/lifecycle';
import * as strings from 'vs/base/common/strings';
import 'vs/css!./ghostText';
import { applyFontInfo } from 'vs/editor/browser/config/domFontInfo';
import { EditorFontLigatures } from 'vs/editor/common/config/editorOptions';
import { LineTokens } from 'vs/editor/common/tokens/lineTokens';
import { Position } from 'vs/editor/common/core/position';
import { Range } from 'vs/editor/common/core/range';
import { StringBuilder } from 'vs/editor/common/core/stringBuilder';
import { InjectedTextCursorStops } from 'vs/editor/common/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { LineDecoration } from 'vs/editor/common/viewLayout/lineDecorations';
import { RenderLineInput, renderViewLine } from 'vs/editor/common/viewLayout/viewLineRenderer';
import { GhostTextReplacement } from 'vs/editor/contrib/inlineCompletions/browser/ghostText';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
const ttPolicy = window.trustedTypes?.createPolicy('editorGhostText', { createHTML: value => value });
let GhostTextWidget = class GhostTextWidget extends Disposable {
    editor;
    model;
    instantiationService;
    languageService;
    disposed = false;
    partsWidget = this._register(this.instantiationService.createInstance(DecorationsWidget, this.editor));
    additionalLinesWidget = this._register(new AdditionalLinesWidget(this.editor, this.languageService.languageIdCodec));
    viewMoreContentWidget = undefined;
    constructor(editor, model, instantiationService, languageService) {
        super();
        this.editor = editor;
        this.model = model;
        this.instantiationService = instantiationService;
        this.languageService = languageService;
        this._register(this.editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(29 /* EditorOption.disableMonospaceOptimizations */)
                || e.hasChanged(107 /* EditorOption.stopRenderingLineAfter */)
                || e.hasChanged(89 /* EditorOption.renderWhitespace */)
                || e.hasChanged(84 /* EditorOption.renderControlCharacters */)
                || e.hasChanged(46 /* EditorOption.fontLigatures */)
                || e.hasChanged(45 /* EditorOption.fontInfo */)
                || e.hasChanged(60 /* EditorOption.lineHeight */)) {
                this.update();
            }
        }));
        this._register(toDisposable(() => {
            this.disposed = true;
            this.update();
            this.viewMoreContentWidget?.dispose();
            this.viewMoreContentWidget = undefined;
        }));
        this._register(model.onDidChange(() => {
            this.update();
        }));
        this.update();
    }
    shouldShowHoverAtViewZone(viewZoneId) {
        return (this.additionalLinesWidget.viewZoneId === viewZoneId);
    }
    replacementDecoration = this._register(new DisposableDecorations(this.editor));
    update() {
        const ghostText = this.model.ghostText;
        if (!this.editor.hasModel() || !ghostText || this.disposed) {
            this.partsWidget.clear();
            this.additionalLinesWidget.clear();
            this.replacementDecoration.clear();
            return;
        }
        const inlineTexts = new Array();
        const additionalLines = new Array();
        function addToAdditionalLines(lines, className) {
            if (additionalLines.length > 0) {
                const lastLine = additionalLines[additionalLines.length - 1];
                if (className) {
                    lastLine.decorations.push(new LineDecoration(lastLine.content.length + 1, lastLine.content.length + 1 + lines[0].length, className, 0 /* InlineDecorationType.Regular */));
                }
                lastLine.content += lines[0];
                lines = lines.slice(1);
            }
            for (const line of lines) {
                additionalLines.push({
                    content: line,
                    decorations: className ? [new LineDecoration(1, line.length + 1, className, 0 /* InlineDecorationType.Regular */)] : []
                });
            }
        }
        if (ghostText instanceof GhostTextReplacement) {
            this.replacementDecoration.setDecorations([
                {
                    range: new Range(ghostText.lineNumber, ghostText.columnStart, ghostText.lineNumber, ghostText.columnStart + ghostText.length),
                    options: {
                        inlineClassName: 'inline-completion-text-to-replace',
                        description: 'GhostTextReplacement'
                    }
                },
            ]);
        }
        else {
            this.replacementDecoration.setDecorations([]);
        }
        const textBufferLine = this.editor.getModel().getLineContent(ghostText.lineNumber);
        let hiddenTextStartColumn = undefined;
        let lastIdx = 0;
        for (const part of ghostText.parts) {
            let lines = part.lines;
            if (hiddenTextStartColumn === undefined) {
                inlineTexts.push({
                    column: part.column,
                    text: lines[0],
                    preview: part.preview,
                });
                lines = lines.slice(1);
            }
            else {
                addToAdditionalLines([textBufferLine.substring(lastIdx, part.column - 1)], undefined);
            }
            if (lines.length > 0) {
                addToAdditionalLines(lines, 'ghost-text');
                if (hiddenTextStartColumn === undefined && part.column <= textBufferLine.length) {
                    hiddenTextStartColumn = part.column;
                }
            }
            lastIdx = part.column - 1;
        }
        if (hiddenTextStartColumn !== undefined) {
            addToAdditionalLines([textBufferLine.substring(lastIdx)], undefined);
        }
        this.partsWidget.setParts(ghostText.lineNumber, inlineTexts, hiddenTextStartColumn !== undefined ? { column: hiddenTextStartColumn, length: textBufferLine.length + 1 - hiddenTextStartColumn } : undefined);
        this.additionalLinesWidget.updateLines(ghostText.lineNumber, additionalLines, ghostText.additionalReservedLineCount);
        if (0 < 0) {
            // Not supported at the moment, condition is always false.
            this.viewMoreContentWidget = this.renderViewMoreLines(new Position(ghostText.lineNumber, this.editor.getModel().getLineMaxColumn(ghostText.lineNumber)), '', 0);
        }
        else {
            this.viewMoreContentWidget?.dispose();
            this.viewMoreContentWidget = undefined;
        }
    }
    renderViewMoreLines(position, firstLineText, remainingLinesLength) {
        const fontInfo = this.editor.getOption(45 /* EditorOption.fontInfo */);
        const domNode = document.createElement('div');
        domNode.className = 'suggest-preview-additional-widget';
        applyFontInfo(domNode, fontInfo);
        const spacer = document.createElement('span');
        spacer.className = 'content-spacer';
        spacer.append(firstLineText);
        domNode.append(spacer);
        const newline = document.createElement('span');
        newline.className = 'content-newline suggest-preview-text';
        newline.append('⏎  ');
        domNode.append(newline);
        const disposableStore = new DisposableStore();
        const button = document.createElement('div');
        button.className = 'button suggest-preview-text';
        button.append(`+${remainingLinesLength} lines…`);
        disposableStore.add(dom.addStandardDisposableListener(button, 'mousedown', (e) => {
            this.model?.setExpanded(true);
            e.preventDefault();
            this.editor.focus();
        }));
        domNode.append(button);
        return new ViewMoreLinesContentWidget(this.editor, position, domNode, disposableStore);
    }
};
GhostTextWidget = __decorate([
    __param(2, IInstantiationService),
    __param(3, ILanguageService)
], GhostTextWidget);
export { GhostTextWidget };
class DisposableDecorations {
    editor;
    decorationIds = [];
    constructor(editor) {
        this.editor = editor;
    }
    setDecorations(decorations) {
        // Using change decorations ensures that we update the id's before some event handler is called.
        this.editor.changeDecorations(accessor => {
            this.decorationIds = accessor.deltaDecorations(this.decorationIds, decorations);
        });
    }
    clear() {
        this.setDecorations([]);
    }
    dispose() {
        this.clear();
    }
}
class DecorationsWidget {
    editor;
    decorationIds = [];
    constructor(editor) {
        this.editor = editor;
    }
    dispose() {
        this.clear();
    }
    clear() {
        // Using change decorations ensures that we update the id's before some event handler is called.
        this.editor.changeDecorations(accessor => {
            this.decorationIds = accessor.deltaDecorations(this.decorationIds, []);
        });
    }
    setParts(lineNumber, parts, hiddenText) {
        const textModel = this.editor.getModel();
        if (!textModel) {
            return;
        }
        const hiddenTextDecorations = new Array();
        if (hiddenText) {
            hiddenTextDecorations.push({
                range: Range.fromPositions(new Position(lineNumber, hiddenText.column), new Position(lineNumber, hiddenText.column + hiddenText.length)),
                options: {
                    inlineClassName: 'ghost-text-hidden',
                    description: 'ghost-text-hidden',
                }
            });
        }
        // Using change decorations ensures that we update the id's before some event handler is called.
        this.editor.changeDecorations(accessor => {
            this.decorationIds = accessor.deltaDecorations(this.decorationIds, parts.map(p => {
                return ({
                    range: Range.fromPositions(new Position(lineNumber, p.column)),
                    options: {
                        description: 'ghost-text',
                        after: { content: p.text, inlineClassName: p.preview ? 'ghost-text-decoration-preview' : 'ghost-text-decoration', cursorStops: InjectedTextCursorStops.Left },
                        showIfCollapsed: true,
                    }
                });
            }).concat(hiddenTextDecorations));
        });
    }
}
class AdditionalLinesWidget {
    editor;
    languageIdCodec;
    _viewZoneId = undefined;
    get viewZoneId() { return this._viewZoneId; }
    constructor(editor, languageIdCodec) {
        this.editor = editor;
        this.languageIdCodec = languageIdCodec;
    }
    dispose() {
        this.clear();
    }
    clear() {
        this.editor.changeViewZones((changeAccessor) => {
            if (this._viewZoneId) {
                changeAccessor.removeZone(this._viewZoneId);
                this._viewZoneId = undefined;
            }
        });
    }
    updateLines(lineNumber, additionalLines, minReservedLineCount) {
        const textModel = this.editor.getModel();
        if (!textModel) {
            return;
        }
        const { tabSize } = textModel.getOptions();
        this.editor.changeViewZones((changeAccessor) => {
            if (this._viewZoneId) {
                changeAccessor.removeZone(this._viewZoneId);
                this._viewZoneId = undefined;
            }
            const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
            if (heightInLines > 0) {
                const domNode = document.createElement('div');
                renderLines(domNode, tabSize, additionalLines, this.editor.getOptions(), this.languageIdCodec);
                this._viewZoneId = changeAccessor.addZone({
                    afterLineNumber: lineNumber,
                    heightInLines: heightInLines,
                    domNode,
                    afterColumnAffinity: 1 /* PositionAffinity.Right */
                });
            }
        });
    }
}
function renderLines(domNode, tabSize, lines, opts, languageIdCodec) {
    const disableMonospaceOptimizations = opts.get(29 /* EditorOption.disableMonospaceOptimizations */);
    const stopRenderingLineAfter = opts.get(107 /* EditorOption.stopRenderingLineAfter */);
    // To avoid visual confusion, we don't want to render visible whitespace
    const renderWhitespace = 'none';
    const renderControlCharacters = opts.get(84 /* EditorOption.renderControlCharacters */);
    const fontLigatures = opts.get(46 /* EditorOption.fontLigatures */);
    const fontInfo = opts.get(45 /* EditorOption.fontInfo */);
    const lineHeight = opts.get(60 /* EditorOption.lineHeight */);
    const sb = new StringBuilder(10000);
    sb.appendString('<div class="suggest-preview-text">');
    for (let i = 0, len = lines.length; i < len; i++) {
        const lineData = lines[i];
        const line = lineData.content;
        sb.appendString('<div class="view-line');
        sb.appendString('" style="top:');
        sb.appendString(String(i * lineHeight));
        sb.appendString('px;width:1000000px;">');
        const isBasicASCII = strings.isBasicASCII(line);
        const containsRTL = strings.containsRTL(line);
        const lineTokens = LineTokens.createEmpty(line, languageIdCodec);
        renderViewLine(new RenderLineInput((fontInfo.isMonospace && !disableMonospaceOptimizations), fontInfo.canUseHalfwidthRightwardsArrow, line, false, isBasicASCII, containsRTL, 0, lineTokens, lineData.decorations, tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures !== EditorFontLigatures.OFF, null), sb);
        sb.appendString('</div>');
    }
    sb.appendString('</div>');
    applyFontInfo(domNode, fontInfo);
    const html = sb.build();
    const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
    domNode.innerHTML = trustedhtml;
}
class ViewMoreLinesContentWidget extends Disposable {
    editor;
    position;
    domNode;
    allowEditorOverflow = false;
    suppressMouseDown = false;
    constructor(editor, position, domNode, disposableStore) {
        super();
        this.editor = editor;
        this.position = position;
        this.domNode = domNode;
        this._register(disposableStore);
        this._register(toDisposable(() => {
            this.editor.removeContentWidget(this);
        }));
        this.editor.addContentWidget(this);
    }
    getId() {
        return 'editor.widget.viewMoreLinesWidget';
    }
    getDomNode() {
        return this.domNode;
    }
    getPosition() {
        return {
            position: this.position,
            preference: [0 /* ContentWidgetPositionPreference.EXACT */]
        };
    }
}
