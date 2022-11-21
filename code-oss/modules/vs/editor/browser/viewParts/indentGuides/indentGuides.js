/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import 'vs/css!./indentGuides';
import { DynamicViewOverlay } from 'vs/editor/browser/view/dynamicViewOverlay';
import { editorActiveIndentGuides, editorBracketHighlightingForeground1, editorBracketHighlightingForeground2, editorBracketHighlightingForeground3, editorBracketHighlightingForeground4, editorBracketHighlightingForeground5, editorBracketHighlightingForeground6, editorBracketPairGuideActiveBackground1, editorBracketPairGuideActiveBackground2, editorBracketPairGuideActiveBackground3, editorBracketPairGuideActiveBackground4, editorBracketPairGuideActiveBackground5, editorBracketPairGuideActiveBackground6, editorBracketPairGuideBackground1, editorBracketPairGuideBackground2, editorBracketPairGuideBackground3, editorBracketPairGuideBackground4, editorBracketPairGuideBackground5, editorBracketPairGuideBackground6, editorIndentGuides } from 'vs/editor/common/core/editorColorRegistry';
import { registerThemingParticipant } from 'vs/platform/theme/common/themeService';
import { Position } from 'vs/editor/common/core/position';
import { ArrayQueue } from 'vs/base/common/arrays';
import { isDefined } from 'vs/base/common/types';
import { BracketPairGuidesClassNames } from 'vs/editor/common/model/guidesTextModelPart';
import { IndentGuide, HorizontalGuidesState } from 'vs/editor/common/textModelGuides';
export class IndentGuidesOverlay extends DynamicViewOverlay {
    _context;
    _primaryPosition;
    _lineHeight;
    _spaceWidth;
    _renderResult;
    _maxIndentLeft;
    _bracketPairGuideOptions;
    constructor(context) {
        super();
        this._context = context;
        this._primaryPosition = null;
        const options = this._context.configuration.options;
        const wrappingInfo = options.get(134 /* EditorOption.wrappingInfo */);
        const fontInfo = options.get(45 /* EditorOption.fontInfo */);
        this._lineHeight = options.get(60 /* EditorOption.lineHeight */);
        this._spaceWidth = fontInfo.spaceWidth;
        this._maxIndentLeft = wrappingInfo.wrappingColumn === -1 ? -1 : (wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
        this._bracketPairGuideOptions = options.get(13 /* EditorOption.guides */);
        this._renderResult = null;
        this._context.addEventHandler(this);
    }
    dispose() {
        this._context.removeEventHandler(this);
        this._renderResult = null;
        super.dispose();
    }
    // --- begin event handlers
    onConfigurationChanged(e) {
        const options = this._context.configuration.options;
        const wrappingInfo = options.get(134 /* EditorOption.wrappingInfo */);
        const fontInfo = options.get(45 /* EditorOption.fontInfo */);
        this._lineHeight = options.get(60 /* EditorOption.lineHeight */);
        this._spaceWidth = fontInfo.spaceWidth;
        this._maxIndentLeft = wrappingInfo.wrappingColumn === -1 ? -1 : (wrappingInfo.wrappingColumn * fontInfo.typicalHalfwidthCharacterWidth);
        this._bracketPairGuideOptions = options.get(13 /* EditorOption.guides */);
        return true;
    }
    onCursorStateChanged(e) {
        const selection = e.selections[0];
        const newPosition = selection.getPosition();
        if (!this._primaryPosition?.equals(newPosition)) {
            this._primaryPosition = newPosition;
            return true;
        }
        return false;
    }
    onDecorationsChanged(e) {
        // true for inline decorations
        return true;
    }
    onFlushed(e) {
        return true;
    }
    onLinesChanged(e) {
        return true;
    }
    onLinesDeleted(e) {
        return true;
    }
    onLinesInserted(e) {
        return true;
    }
    onScrollChanged(e) {
        return e.scrollTopChanged; // || e.scrollWidthChanged;
    }
    onZonesChanged(e) {
        return true;
    }
    onLanguageConfigurationChanged(e) {
        return true;
    }
    // --- end event handlers
    prepareRender(ctx) {
        if (!this._bracketPairGuideOptions.indentation && this._bracketPairGuideOptions.bracketPairs === false) {
            this._renderResult = null;
            return;
        }
        const visibleStartLineNumber = ctx.visibleRange.startLineNumber;
        const visibleEndLineNumber = ctx.visibleRange.endLineNumber;
        const scrollWidth = ctx.scrollWidth;
        const lineHeight = this._lineHeight;
        const activeCursorPosition = this._primaryPosition;
        const indents = this.getGuidesByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition);
        const output = [];
        for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
            const lineIndex = lineNumber - visibleStartLineNumber;
            const indent = indents[lineIndex];
            let result = '';
            const leftOffset = ctx.visibleRangeForPosition(new Position(lineNumber, 1))?.left ?? 0;
            for (const guide of indent) {
                const left = guide.column === -1
                    ? leftOffset + (guide.visibleColumn - 1) * this._spaceWidth
                    : ctx.visibleRangeForPosition(new Position(lineNumber, guide.column)).left;
                if (left > scrollWidth || (this._maxIndentLeft > 0 && left > this._maxIndentLeft)) {
                    break;
                }
                const className = guide.horizontalLine ? (guide.horizontalLine.top ? 'horizontal-top' : 'horizontal-bottom') : 'vertical';
                const width = guide.horizontalLine
                    ? (ctx.visibleRangeForPosition(new Position(lineNumber, guide.horizontalLine.endColumn))?.left ?? (left + this._spaceWidth)) - left
                    : this._spaceWidth;
                result += `<div class="core-guide ${guide.className} ${className}" style="left:${left}px;height:${lineHeight}px;width:${width}px"></div>`;
            }
            output[lineIndex] = result;
        }
        this._renderResult = output;
    }
    getGuidesByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition) {
        const bracketGuides = this._bracketPairGuideOptions.bracketPairs !== false
            ? this._context.viewModel.getBracketGuidesInRangeByLine(visibleStartLineNumber, visibleEndLineNumber, activeCursorPosition, {
                highlightActive: this._bracketPairGuideOptions.highlightActiveBracketPair,
                horizontalGuides: this._bracketPairGuideOptions.bracketPairsHorizontal === true
                    ? HorizontalGuidesState.Enabled
                    : this._bracketPairGuideOptions.bracketPairsHorizontal === 'active'
                        ? HorizontalGuidesState.EnabledForActive
                        : HorizontalGuidesState.Disabled,
                includeInactive: this._bracketPairGuideOptions.bracketPairs === true,
            })
            : null;
        const indentGuides = this._bracketPairGuideOptions.indentation
            ? this._context.viewModel.getLinesIndentGuides(visibleStartLineNumber, visibleEndLineNumber)
            : null;
        let activeIndentStartLineNumber = 0;
        let activeIndentEndLineNumber = 0;
        let activeIndentLevel = 0;
        if (this._bracketPairGuideOptions.highlightActiveIndentation !== false && activeCursorPosition) {
            const activeIndentInfo = this._context.viewModel.getActiveIndentGuide(activeCursorPosition.lineNumber, visibleStartLineNumber, visibleEndLineNumber);
            activeIndentStartLineNumber = activeIndentInfo.startLineNumber;
            activeIndentEndLineNumber = activeIndentInfo.endLineNumber;
            activeIndentLevel = activeIndentInfo.indent;
        }
        const { indentSize } = this._context.viewModel.model.getOptions();
        const result = [];
        for (let lineNumber = visibleStartLineNumber; lineNumber <= visibleEndLineNumber; lineNumber++) {
            const lineGuides = new Array();
            result.push(lineGuides);
            const bracketGuidesInLine = bracketGuides ? bracketGuides[lineNumber - visibleStartLineNumber] : [];
            const bracketGuidesInLineQueue = new ArrayQueue(bracketGuidesInLine);
            const indentGuidesInLine = indentGuides ? indentGuides[lineNumber - visibleStartLineNumber] : [];
            for (let indentLvl = 1; indentLvl <= indentGuidesInLine; indentLvl++) {
                const indentGuide = (indentLvl - 1) * indentSize + 1;
                const isActive = 
                // Disable active indent guide if there are bracket guides.
                (this._bracketPairGuideOptions.highlightActiveIndentation === 'always' || bracketGuidesInLine.length === 0) &&
                    activeIndentStartLineNumber <= lineNumber &&
                    lineNumber <= activeIndentEndLineNumber &&
                    indentLvl === activeIndentLevel;
                lineGuides.push(...bracketGuidesInLineQueue.takeWhile(g => g.visibleColumn < indentGuide) || []);
                const peeked = bracketGuidesInLineQueue.peek();
                if (!peeked || peeked.visibleColumn !== indentGuide || peeked.horizontalLine) {
                    lineGuides.push(new IndentGuide(indentGuide, -1, isActive ? 'core-guide-indent-active' : 'core-guide-indent', null, -1, -1));
                }
            }
            lineGuides.push(...bracketGuidesInLineQueue.takeWhile(g => true) || []);
        }
        return result;
    }
    render(startLineNumber, lineNumber) {
        if (!this._renderResult) {
            return '';
        }
        const lineIndex = lineNumber - startLineNumber;
        if (lineIndex < 0 || lineIndex >= this._renderResult.length) {
            return '';
        }
        return this._renderResult[lineIndex];
    }
}
function transparentToUndefined(color) {
    if (color && color.isTransparent()) {
        return undefined;
    }
    return color;
}
registerThemingParticipant((theme, collector) => {
    const editorIndentGuidesColor = theme.getColor(editorIndentGuides);
    if (editorIndentGuidesColor) {
        collector.addRule(`.monaco-editor .lines-content .core-guide-indent { box-shadow: 1px 0 0 0 ${editorIndentGuidesColor} inset; }`);
    }
    const editorActiveIndentGuidesColor = theme.getColor(editorActiveIndentGuides) || editorIndentGuidesColor;
    if (editorActiveIndentGuidesColor) {
        collector.addRule(`.monaco-editor .lines-content .core-guide-indent-active { box-shadow: 1px 0 0 0 ${editorActiveIndentGuidesColor} inset; }`);
    }
    const colors = [
        { bracketColor: editorBracketHighlightingForeground1, guideColor: editorBracketPairGuideBackground1, guideColorActive: editorBracketPairGuideActiveBackground1 },
        { bracketColor: editorBracketHighlightingForeground2, guideColor: editorBracketPairGuideBackground2, guideColorActive: editorBracketPairGuideActiveBackground2 },
        { bracketColor: editorBracketHighlightingForeground3, guideColor: editorBracketPairGuideBackground3, guideColorActive: editorBracketPairGuideActiveBackground3 },
        { bracketColor: editorBracketHighlightingForeground4, guideColor: editorBracketPairGuideBackground4, guideColorActive: editorBracketPairGuideActiveBackground4 },
        { bracketColor: editorBracketHighlightingForeground5, guideColor: editorBracketPairGuideBackground5, guideColorActive: editorBracketPairGuideActiveBackground5 },
        { bracketColor: editorBracketHighlightingForeground6, guideColor: editorBracketPairGuideBackground6, guideColorActive: editorBracketPairGuideActiveBackground6 }
    ];
    const colorProvider = new BracketPairGuidesClassNames();
    const colorValues = colors
        .map(c => {
        const bracketColor = theme.getColor(c.bracketColor);
        const guideColor = theme.getColor(c.guideColor);
        const guideColorActive = theme.getColor(c.guideColorActive);
        const effectiveGuideColor = transparentToUndefined(transparentToUndefined(guideColor) ?? bracketColor?.transparent(0.3));
        const effectiveGuideColorActive = transparentToUndefined(transparentToUndefined(guideColorActive) ?? bracketColor);
        if (!effectiveGuideColor || !effectiveGuideColorActive) {
            return undefined;
        }
        return {
            guideColor: effectiveGuideColor,
            guideColorActive: effectiveGuideColorActive,
        };
    })
        .filter(isDefined);
    if (colorValues.length > 0) {
        for (let level = 0; level < 30; level++) {
            const colors = colorValues[level % colorValues.length];
            collector.addRule(`.monaco-editor .${colorProvider.getInlineClassNameOfLevel(level).replace(/ /g, '.')} { --guide-color: ${colors.guideColor}; --guide-color-active: ${colors.guideColorActive}; }`);
        }
        collector.addRule(`.monaco-editor .vertical { box-shadow: 1px 0 0 0 var(--guide-color) inset; }`);
        collector.addRule(`.monaco-editor .horizontal-top { border-top: 1px solid var(--guide-color); }`);
        collector.addRule(`.monaco-editor .horizontal-bottom { border-bottom: 1px solid var(--guide-color); }`);
        collector.addRule(`.monaco-editor .vertical.${colorProvider.activeClassName} { box-shadow: 1px 0 0 0 var(--guide-color-active) inset; }`);
        collector.addRule(`.monaco-editor .horizontal-top.${colorProvider.activeClassName} { border-top: 1px solid var(--guide-color-active); }`);
        collector.addRule(`.monaco-editor .horizontal-bottom.${colorProvider.activeClassName} { border-bottom: 1px solid var(--guide-color-active); }`);
    }
});
