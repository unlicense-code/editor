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
import { DomScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { coalesce } from 'vs/base/common/arrays';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import * as lifecycle from 'vs/base/common/lifecycle';
import { isMacintosh } from 'vs/base/common/platform';
import { Range } from 'vs/editor/common/core/range';
import { ModelDecorationOptions } from 'vs/editor/common/model/textModel';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import * as nls from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { WorkbenchAsyncDataTree } from 'vs/platform/list/browser/listService';
import { editorHoverBackground, editorHoverBorder, editorHoverForeground } from 'vs/platform/theme/common/colorRegistry';
import { attachStylerCallback } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { renderExpressionValue } from 'vs/workbench/contrib/debug/browser/baseDebugView';
import { LinkDetector } from 'vs/workbench/contrib/debug/browser/linkDetector';
import { VariablesRenderer } from 'vs/workbench/contrib/debug/browser/variablesView';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { Expression, Variable } from 'vs/workbench/contrib/debug/common/debugModel';
import { getExactExpressionStartAndEnd } from 'vs/workbench/contrib/debug/common/debugUtils';
const $ = dom.$;
async function doFindExpression(container, namesToFind) {
    if (!container) {
        return null;
    }
    const children = await container.getChildren();
    // look for our variable in the list. First find the parents of the hovered variable if there are any.
    const filtered = children.filter(v => namesToFind[0] === v.name);
    if (filtered.length !== 1) {
        return null;
    }
    if (namesToFind.length === 1) {
        return filtered[0];
    }
    else {
        return doFindExpression(filtered[0], namesToFind.slice(1));
    }
}
export async function findExpressionInStackFrame(stackFrame, namesToFind) {
    const scopes = await stackFrame.getScopes();
    const nonExpensive = scopes.filter(s => !s.expensive);
    const expressions = coalesce(await Promise.all(nonExpensive.map(scope => doFindExpression(scope, namesToFind))));
    // only show if all expressions found have the same value
    return expressions.length > 0 && expressions.every(e => e.value === expressions[0].value) ? expressions[0] : undefined;
}
let DebugHoverWidget = class DebugHoverWidget {
    editor;
    debugService;
    instantiationService;
    themeService;
    static ID = 'debug.hoverWidget';
    // editor.IContentWidget.allowEditorOverflow
    allowEditorOverflow = true;
    _isVisible;
    showCancellationSource;
    domNode;
    tree;
    showAtPosition;
    positionPreference;
    highlightDecorations = this.editor.createDecorationsCollection();
    complexValueContainer;
    complexValueTitle;
    valueContainer;
    treeContainer;
    toDispose;
    scrollbar;
    debugHoverComputer;
    constructor(editor, debugService, instantiationService, themeService) {
        this.editor = editor;
        this.debugService = debugService;
        this.instantiationService = instantiationService;
        this.themeService = themeService;
        this.toDispose = [];
        this._isVisible = false;
        this.showAtPosition = null;
        this.positionPreference = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
        this.debugHoverComputer = this.instantiationService.createInstance(DebugHoverComputer, this.editor);
    }
    create() {
        this.domNode = $('.debug-hover-widget');
        this.complexValueContainer = dom.append(this.domNode, $('.complex-value'));
        this.complexValueTitle = dom.append(this.complexValueContainer, $('.title'));
        this.treeContainer = dom.append(this.complexValueContainer, $('.debug-hover-tree'));
        this.treeContainer.setAttribute('role', 'tree');
        const tip = dom.append(this.complexValueContainer, $('.tip'));
        tip.textContent = nls.localize({ key: 'quickTip', comment: ['"switch to editor language hover" means to show the programming language hover widget instead of the debug hover'] }, 'Hold {0} key to switch to editor language hover', isMacintosh ? 'Option' : 'Alt');
        const dataSource = new DebugHoverDataSource();
        const linkeDetector = this.instantiationService.createInstance(LinkDetector);
        this.tree = this.instantiationService.createInstance(WorkbenchAsyncDataTree, 'DebugHover', this.treeContainer, new DebugHoverDelegate(), [this.instantiationService.createInstance(VariablesRenderer, linkeDetector)], dataSource, {
            accessibilityProvider: new DebugHoverAccessibilityProvider(),
            mouseSupport: false,
            horizontalScrolling: true,
            useShadows: false,
            keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: (e) => e.name },
            overrideStyles: {
                listBackground: editorHoverBackground
            }
        });
        this.valueContainer = $('.value');
        this.valueContainer.tabIndex = 0;
        this.valueContainer.setAttribute('role', 'tooltip');
        this.scrollbar = new DomScrollableElement(this.valueContainer, { horizontal: 2 /* ScrollbarVisibility.Hidden */ });
        this.domNode.appendChild(this.scrollbar.getDomNode());
        this.toDispose.push(this.scrollbar);
        this.editor.applyFontInfo(this.domNode);
        this.toDispose.push(attachStylerCallback(this.themeService, { editorHoverBackground, editorHoverBorder, editorHoverForeground }, colors => {
            if (colors.editorHoverBackground) {
                this.domNode.style.backgroundColor = colors.editorHoverBackground.toString();
            }
            else {
                this.domNode.style.backgroundColor = '';
            }
            if (colors.editorHoverBorder) {
                this.domNode.style.border = `1px solid ${colors.editorHoverBorder}`;
            }
            else {
                this.domNode.style.border = '';
            }
            if (colors.editorHoverForeground) {
                this.domNode.style.color = colors.editorHoverForeground.toString();
            }
            else {
                this.domNode.style.color = '';
            }
        }));
        this.toDispose.push(this.tree.onDidChangeContentHeight(() => this.layoutTreeAndContainer(false)));
        this.registerListeners();
        this.editor.addContentWidget(this);
    }
    registerListeners() {
        this.toDispose.push(dom.addStandardDisposableListener(this.domNode, 'keydown', (e) => {
            if (e.equals(9 /* KeyCode.Escape */)) {
                this.hide();
            }
        }));
        this.toDispose.push(this.editor.onDidChangeConfiguration((e) => {
            if (e.hasChanged(45 /* EditorOption.fontInfo */)) {
                this.editor.applyFontInfo(this.domNode);
            }
        }));
        this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
            if (e instanceof Variable && this.tree.hasNode(e)) {
                await this.tree.updateChildren(e, false, true);
                await this.tree.expand(e);
            }
        }));
    }
    isHovered() {
        return !!this.domNode?.matches(':hover');
    }
    isVisible() {
        return this._isVisible;
    }
    willBeVisible() {
        return !!this.showCancellationSource;
    }
    getId() {
        return DebugHoverWidget.ID;
    }
    getDomNode() {
        return this.domNode;
    }
    async showAt(position, focus) {
        this.showCancellationSource?.cancel();
        const cancellationSource = this.showCancellationSource = new CancellationTokenSource();
        const session = this.debugService.getViewModel().focusedSession;
        if (!session || !this.editor.hasModel()) {
            this.hide();
            return;
        }
        const result = await this.debugHoverComputer.compute(position, cancellationSource.token);
        if (this.isVisible() && !result.rangeChanged) {
            return;
        }
        if (!result.range || cancellationSource.token.isCancellationRequested) {
            this.hide();
            return;
        }
        const expression = await this.debugHoverComputer.evaluate(session);
        if (cancellationSource.token.isCancellationRequested || !expression || (expression instanceof Expression && !expression.available)) {
            this.hide();
            return;
        }
        this.highlightDecorations.set([{
                range: result.range,
                options: DebugHoverWidget._HOVER_HIGHLIGHT_DECORATION_OPTIONS
            }]);
        return this.doShow(result.range.getStartPosition(), expression, focus);
    }
    static _HOVER_HIGHLIGHT_DECORATION_OPTIONS = ModelDecorationOptions.register({
        description: 'bdebug-hover-highlight',
        className: 'hoverHighlight'
    });
    async doShow(position, expression, focus, forceValueHover = false) {
        if (!this.domNode) {
            this.create();
        }
        this.showAtPosition = position;
        this._isVisible = true;
        if (!expression.hasChildren || forceValueHover) {
            this.complexValueContainer.hidden = true;
            this.valueContainer.hidden = false;
            renderExpressionValue(expression, this.valueContainer, {
                showChanged: false,
                colorize: true
            });
            this.valueContainer.title = '';
            this.editor.layoutContentWidget(this);
            this.scrollbar.scanDomNode();
            if (focus) {
                this.editor.render();
                this.valueContainer.focus();
            }
            return undefined;
        }
        this.valueContainer.hidden = true;
        await this.tree.setInput(expression);
        this.complexValueTitle.textContent = expression.value;
        this.complexValueTitle.title = expression.value;
        this.layoutTreeAndContainer(true);
        this.tree.scrollTop = 0;
        this.tree.scrollLeft = 0;
        this.complexValueContainer.hidden = false;
        if (focus) {
            this.editor.render();
            this.tree.domFocus();
        }
    }
    layoutTreeAndContainer(initialLayout) {
        const scrollBarHeight = 10;
        const treeHeight = Math.min(Math.max(266, this.editor.getLayoutInfo().height * 0.55), this.tree.contentHeight + scrollBarHeight);
        this.treeContainer.style.height = `${treeHeight}px`;
        this.tree.layout(treeHeight, initialLayout ? 400 : undefined);
        this.editor.layoutContentWidget(this);
        this.scrollbar.scanDomNode();
    }
    afterRender(positionPreference) {
        if (positionPreference) {
            // Remember where the editor placed you to keep position stable #109226
            this.positionPreference = [positionPreference];
        }
    }
    hide() {
        if (this.showCancellationSource) {
            this.showCancellationSource.cancel();
            this.showCancellationSource = undefined;
        }
        if (!this._isVisible) {
            return;
        }
        if (dom.isAncestor(document.activeElement, this.domNode)) {
            this.editor.focus();
        }
        this._isVisible = false;
        this.highlightDecorations.clear();
        this.editor.layoutContentWidget(this);
        this.positionPreference = [1 /* ContentWidgetPositionPreference.ABOVE */, 2 /* ContentWidgetPositionPreference.BELOW */];
    }
    getPosition() {
        return this._isVisible ? {
            position: this.showAtPosition,
            preference: this.positionPreference
        } : null;
    }
    dispose() {
        this.toDispose = lifecycle.dispose(this.toDispose);
    }
};
DebugHoverWidget = __decorate([
    __param(1, IDebugService),
    __param(2, IInstantiationService),
    __param(3, IThemeService)
], DebugHoverWidget);
export { DebugHoverWidget };
class DebugHoverAccessibilityProvider {
    getWidgetAriaLabel() {
        return nls.localize('treeAriaLabel', "Debug Hover");
    }
    getAriaLabel(element) {
        return nls.localize({ key: 'variableAriaLabel', comment: ['Do not translate placeholders. Placeholders are name and value of a variable.'] }, "{0}, value {1}, variables, debug", element.name, element.value);
    }
}
class DebugHoverDataSource {
    hasChildren(element) {
        return element.hasChildren;
    }
    getChildren(element) {
        return element.getChildren();
    }
}
class DebugHoverDelegate {
    getHeight(element) {
        return 18;
    }
    getTemplateId(element) {
        return VariablesRenderer.ID;
    }
}
let DebugHoverComputer = class DebugHoverComputer {
    editor;
    debugService;
    languageFeaturesService;
    _currentRange;
    _currentExpression;
    constructor(editor, debugService, languageFeaturesService) {
        this.editor = editor;
        this.debugService = debugService;
        this.languageFeaturesService = languageFeaturesService;
    }
    async compute(position, token) {
        const session = this.debugService.getViewModel().focusedSession;
        if (!session || !this.editor.hasModel()) {
            return { rangeChanged: false };
        }
        const model = this.editor.getModel();
        const result = await this.doCompute(model, position, token);
        if (!result) {
            return { rangeChanged: false };
        }
        const { range, matchingExpression } = result;
        const rangeChanged = this._currentRange ?
            !this._currentRange.equalsRange(range) :
            true;
        this._currentExpression = matchingExpression;
        this._currentRange = Range.lift(range);
        return { rangeChanged, range: this._currentRange };
    }
    async doCompute(model, position, token) {
        if (this.languageFeaturesService.evaluatableExpressionProvider.has(model)) {
            const supports = this.languageFeaturesService.evaluatableExpressionProvider.ordered(model);
            const results = coalesce(await Promise.all(supports.map(async (support) => {
                try {
                    return await support.provideEvaluatableExpression(model, position, token);
                }
                catch (err) {
                    return undefined;
                }
            })));
            if (results.length > 0) {
                let matchingExpression = results[0].expression;
                const range = results[0].range;
                if (!matchingExpression) {
                    const lineContent = model.getLineContent(position.lineNumber);
                    matchingExpression = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
                }
                return { range, matchingExpression };
            }
        }
        else { // old one-size-fits-all strategy
            const lineContent = model.getLineContent(position.lineNumber);
            const { start, end } = getExactExpressionStartAndEnd(lineContent, position.column, position.column);
            // use regex to extract the sub-expression #9821
            const matchingExpression = lineContent.substring(start - 1, end);
            return {
                matchingExpression,
                range: new Range(position.lineNumber, start, position.lineNumber, start + matchingExpression.length)
            };
        }
        return null;
    }
    async evaluate(session) {
        if (!this._currentExpression) {
            throw new Error('No expression to evaluate');
        }
        if (session.capabilities.supportsEvaluateForHovers) {
            const expression = new Expression(this._currentExpression);
            await expression.evaluate(session, this.debugService.getViewModel().focusedStackFrame, 'hover');
            return expression;
        }
        else {
            const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
            if (focusedStackFrame) {
                return await findExpressionInStackFrame(focusedStackFrame, coalesce(this._currentExpression.split('.').map(word => word.trim())));
            }
        }
        return undefined;
    }
};
DebugHoverComputer = __decorate([
    __param(1, IDebugService),
    __param(2, ILanguageFeaturesService)
], DebugHoverComputer);
