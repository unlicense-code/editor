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
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { CachedListVirtualDelegate } from 'vs/base/browser/ui/list/list';
import { createMatches } from 'vs/base/common/filters';
import { dispose } from 'vs/base/common/lifecycle';
import severity from 'vs/base/common/severity';
import { localize } from 'vs/nls';
import { IContextViewService } from 'vs/platform/contextview/browser/contextView';
import { ILabelService } from 'vs/platform/label/common/label';
import { attachBadgeStyler } from 'vs/platform/theme/common/styler';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { AbstractExpressionsRenderer, renderExpressionValue, renderVariable } from 'vs/workbench/contrib/debug/browser/baseDebugView';
import { handleANSIOutput } from 'vs/workbench/contrib/debug/browser/debugANSIHandling';
import { debugConsoleEvaluationInput } from 'vs/workbench/contrib/debug/browser/debugIcons';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { Variable } from 'vs/workbench/contrib/debug/common/debugModel';
import { RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, SimpleReplElement } from 'vs/workbench/contrib/debug/common/replModel';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
const $ = dom.$;
export class ReplEvaluationInputsRenderer {
    static ID = 'replEvaluationInput';
    get templateId() {
        return ReplEvaluationInputsRenderer.ID;
    }
    renderTemplate(container) {
        dom.append(container, $('span.arrow' + ThemeIcon.asCSSSelector(debugConsoleEvaluationInput)));
        const input = dom.append(container, $('.expression'));
        const label = new HighlightedLabel(input);
        return { label };
    }
    renderElement(element, index, templateData) {
        const evaluation = element.element;
        templateData.label.set(evaluation.value, createMatches(element.filterData));
    }
    disposeTemplate(templateData) {
        // noop
    }
}
let ReplGroupRenderer = class ReplGroupRenderer {
    linkDetector;
    themeService;
    static ID = 'replGroup';
    constructor(linkDetector, themeService) {
        this.linkDetector = linkDetector;
        this.themeService = themeService;
    }
    get templateId() {
        return ReplGroupRenderer.ID;
    }
    renderTemplate(container) {
        const label = dom.append(container, $('.expression'));
        return { label };
    }
    renderElement(element, _index, templateData) {
        const replGroup = element.element;
        dom.clearNode(templateData.label);
        const result = handleANSIOutput(replGroup.name, this.linkDetector, this.themeService, undefined);
        templateData.label.appendChild(result);
    }
    disposeTemplate(_templateData) {
        // noop
    }
};
ReplGroupRenderer = __decorate([
    __param(1, IThemeService)
], ReplGroupRenderer);
export { ReplGroupRenderer };
export class ReplEvaluationResultsRenderer {
    linkDetector;
    static ID = 'replEvaluationResult';
    get templateId() {
        return ReplEvaluationResultsRenderer.ID;
    }
    constructor(linkDetector) {
        this.linkDetector = linkDetector;
    }
    renderTemplate(container) {
        const output = dom.append(container, $('.evaluation-result.expression'));
        const value = dom.append(output, $('span.value'));
        return { value };
    }
    renderElement(element, index, templateData) {
        const expression = element.element;
        renderExpressionValue(expression, templateData.value, {
            showHover: false,
            colorize: true,
            linkDetector: this.linkDetector
        });
    }
    disposeTemplate(templateData) {
        // noop
    }
}
let ReplSimpleElementsRenderer = class ReplSimpleElementsRenderer {
    linkDetector;
    editorService;
    labelService;
    themeService;
    static ID = 'simpleReplElement';
    constructor(linkDetector, editorService, labelService, themeService) {
        this.linkDetector = linkDetector;
        this.editorService = editorService;
        this.labelService = labelService;
        this.themeService = themeService;
    }
    get templateId() {
        return ReplSimpleElementsRenderer.ID;
    }
    renderTemplate(container) {
        const data = Object.create(null);
        container.classList.add('output');
        const expression = dom.append(container, $('.output.expression.value-and-source'));
        data.container = container;
        data.countContainer = dom.append(expression, $('.count-badge-wrapper'));
        data.count = new CountBadge(data.countContainer);
        data.value = dom.append(expression, $('span.value'));
        data.source = dom.append(expression, $('.source'));
        data.toDispose = [];
        data.toDispose.push(attachBadgeStyler(data.count, this.themeService));
        data.toDispose.push(dom.addDisposableListener(data.source, 'click', e => {
            e.preventDefault();
            e.stopPropagation();
            const source = data.getReplElementSource();
            if (source) {
                source.source.openInEditor(this.editorService, {
                    startLineNumber: source.lineNumber,
                    startColumn: source.column,
                    endLineNumber: source.lineNumber,
                    endColumn: source.column
                });
            }
        }));
        return data;
    }
    renderElement({ element }, index, templateData) {
        this.setElementCount(element, templateData);
        templateData.elementListener = element.onDidChangeCount(() => this.setElementCount(element, templateData));
        // value
        dom.clearNode(templateData.value);
        // Reset classes to clear ansi decorations since templates are reused
        templateData.value.className = 'value';
        const result = handleANSIOutput(element.value, this.linkDetector, this.themeService, element.session.root);
        templateData.value.appendChild(result);
        templateData.value.classList.add((element.severity === severity.Warning) ? 'warn' : (element.severity === severity.Error) ? 'error' : (element.severity === severity.Ignore) ? 'ignore' : 'info');
        templateData.source.textContent = element.sourceData ? `${element.sourceData.source.name}:${element.sourceData.lineNumber}` : '';
        templateData.source.title = element.sourceData ? `${this.labelService.getUriLabel(element.sourceData.source.uri)}:${element.sourceData.lineNumber}` : '';
        templateData.getReplElementSource = () => element.sourceData;
    }
    setElementCount(element, templateData) {
        if (element.count >= 2) {
            templateData.count.setCount(element.count);
            templateData.countContainer.hidden = false;
        }
        else {
            templateData.countContainer.hidden = true;
        }
    }
    disposeTemplate(templateData) {
        dispose(templateData.toDispose);
    }
    disposeElement(_element, _index, templateData) {
        templateData.elementListener.dispose();
    }
};
ReplSimpleElementsRenderer = __decorate([
    __param(1, IEditorService),
    __param(2, ILabelService),
    __param(3, IThemeService)
], ReplSimpleElementsRenderer);
export { ReplSimpleElementsRenderer };
let ReplVariablesRenderer = class ReplVariablesRenderer extends AbstractExpressionsRenderer {
    linkDetector;
    static ID = 'replVariable';
    get templateId() {
        return ReplVariablesRenderer.ID;
    }
    constructor(linkDetector, debugService, contextViewService, themeService) {
        super(debugService, contextViewService, themeService);
        this.linkDetector = linkDetector;
    }
    renderExpression(expression, data, highlights) {
        renderVariable(expression, data, true, highlights, this.linkDetector);
        data.expression.classList.toggle('nested-variable', isNestedVariable(expression));
    }
    getInputBoxOptions(expression) {
        return undefined;
    }
};
ReplVariablesRenderer = __decorate([
    __param(1, IDebugService),
    __param(2, IContextViewService),
    __param(3, IThemeService)
], ReplVariablesRenderer);
export { ReplVariablesRenderer };
export class ReplRawObjectsRenderer {
    linkDetector;
    static ID = 'rawObject';
    constructor(linkDetector) {
        this.linkDetector = linkDetector;
    }
    get templateId() {
        return ReplRawObjectsRenderer.ID;
    }
    renderTemplate(container) {
        container.classList.add('output');
        const expression = dom.append(container, $('.output.expression'));
        const name = dom.append(expression, $('span.name'));
        const label = new HighlightedLabel(name);
        const value = dom.append(expression, $('span.value'));
        return { container, expression, name, label, value };
    }
    renderElement(node, index, templateData) {
        // key
        const element = node.element;
        templateData.label.set(element.name ? `${element.name}:` : '', createMatches(node.filterData));
        if (element.name) {
            templateData.name.textContent = `${element.name}:`;
        }
        else {
            templateData.name.textContent = '';
        }
        // value
        renderExpressionValue(element.value, templateData.value, {
            showHover: false,
            linkDetector: this.linkDetector
        });
    }
    disposeTemplate(templateData) {
        // noop
    }
}
function isNestedVariable(element) {
    return element instanceof Variable && (element.parent instanceof ReplEvaluationResult || element.parent instanceof Variable);
}
export class ReplDelegate extends CachedListVirtualDelegate {
    configurationService;
    replOptions;
    constructor(configurationService, replOptions) {
        super();
        this.configurationService = configurationService;
        this.replOptions = replOptions;
    }
    getHeight(element) {
        const config = this.configurationService.getValue('debug');
        if (!config.console.wordWrap) {
            return this.estimateHeight(element, true);
        }
        return super.getHeight(element);
    }
    /**
     * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
     */
    estimateHeight(element, ignoreValueLength = false) {
        const lineHeight = this.replOptions.replConfiguration.lineHeight;
        const countNumberOfLines = (str) => str.match(/\n/g)?.length ?? 0;
        const hasValue = (e) => typeof e.value === 'string';
        if (hasValue(element) && !isNestedVariable(element)) {
            const value = element.value;
            const valueRows = countNumberOfLines(value)
                + (ignoreValueLength ? 0 : Math.floor(value.length / 70)) // Make an estimate for wrapping
                + (element instanceof SimpleReplElement ? 0 : 1); // A SimpleReplElement ends in \n if it's a complete line
            return Math.max(valueRows, 1) * lineHeight;
        }
        return lineHeight;
    }
    getTemplateId(element) {
        if (element instanceof Variable && element.name) {
            return ReplVariablesRenderer.ID;
        }
        if (element instanceof ReplEvaluationResult || (element instanceof Variable && !element.name)) {
            // Variable with no name is a top level variable which should be rendered like a repl element #17404
            return ReplEvaluationResultsRenderer.ID;
        }
        if (element instanceof ReplEvaluationInput) {
            return ReplEvaluationInputsRenderer.ID;
        }
        if (element instanceof SimpleReplElement) {
            return ReplSimpleElementsRenderer.ID;
        }
        if (element instanceof ReplGroup) {
            return ReplGroupRenderer.ID;
        }
        return ReplRawObjectsRenderer.ID;
    }
    hasDynamicHeight(element) {
        if (isNestedVariable(element)) {
            // Nested variables should always be in one line #111843
            return false;
        }
        // Empty elements should not have dynamic height since they will be invisible
        return element.toString().length > 0;
    }
}
function isDebugSession(obj) {
    return typeof obj.getReplElements === 'function';
}
export class ReplDataSource {
    hasChildren(element) {
        if (isDebugSession(element)) {
            return true;
        }
        return !!element.hasChildren;
    }
    getChildren(element) {
        if (isDebugSession(element)) {
            return Promise.resolve(element.getReplElements());
        }
        if (element instanceof RawObjectReplElement) {
            return element.getChildren();
        }
        if (element instanceof ReplGroup) {
            return Promise.resolve(element.getChildren());
        }
        return element.getChildren();
    }
}
export class ReplAccessibilityProvider {
    getWidgetAriaLabel() {
        return localize('debugConsole', "Debug Console");
    }
    getAriaLabel(element) {
        if (element instanceof Variable) {
            return localize('replVariableAriaLabel', "Variable {0}, value {1}", element.name, element.value);
        }
        if (element instanceof SimpleReplElement || element instanceof ReplEvaluationInput || element instanceof ReplEvaluationResult) {
            return element.value + (element instanceof SimpleReplElement && element.count > 1 ? localize({ key: 'occurred', comment: ['Front will the value of the debug console element. Placeholder will be replaced by a number which represents occurrance count.'] }, ", occurred {0} times", element.count) : '');
        }
        if (element instanceof RawObjectReplElement) {
            return localize('replRawObjectAriaLabel', "Debug console variable {0}, value {1}", element.name, element.value);
        }
        if (element instanceof ReplGroup) {
            return localize('replGroup', "Debug console group {0}", element.name);
        }
        return '';
    }
}
