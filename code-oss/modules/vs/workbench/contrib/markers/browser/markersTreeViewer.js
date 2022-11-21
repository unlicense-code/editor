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
import * as network from 'vs/base/common/network';
import * as paths from 'vs/base/common/path';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { HighlightedLabel } from 'vs/base/browser/ui/highlightedlabel/highlightedLabel';
import { MarkerSeverity } from 'vs/platform/markers/common/markers';
import { ResourceMarkers, Marker, RelatedInformation, MarkerTableItem } from 'vs/workbench/contrib/markers/browser/markersModel';
import Messages from 'vs/workbench/contrib/markers/browser/messages';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { attachBadgeStyler } from 'vs/platform/theme/common/styler';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { dispose, Disposable, toDisposable, DisposableStore } from 'vs/base/common/lifecycle';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { QuickFixAction, QuickFixActionViewItem } from 'vs/workbench/contrib/markers/browser/markersViewActions';
import { ILabelService } from 'vs/platform/label/common/label';
import { dirname, basename, isEqual } from 'vs/base/common/resources';
import { FilterOptions } from 'vs/workbench/contrib/markers/browser/markersFilterOptions';
import { Emitter } from 'vs/base/common/event';
import { isUndefinedOrNull } from 'vs/base/common/types';
import { Action } from 'vs/base/common/actions';
import { localize } from 'vs/nls';
import { createCancelablePromise, Delayer } from 'vs/base/common/async';
import { IModelService } from 'vs/editor/common/services/model';
import { Range } from 'vs/editor/common/core/range';
import { applyCodeAction, ApplyCodeActionReason, getCodeActions } from 'vs/editor/contrib/codeAction/browser/codeAction';
import { CodeActionKind, CodeActionTriggerSource } from 'vs/editor/contrib/codeAction/common/types';
import { IEditorService, ACTIVE_GROUP } from 'vs/workbench/services/editor/common/editorService';
import { SeverityIcon } from 'vs/platform/severityIcon/common/severityIcon';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IFileService } from 'vs/platform/files/common/files';
import { Progress } from 'vs/platform/progress/common/progress';
import { ActionViewItem } from 'vs/base/browser/ui/actionbar/actionViewItems';
import { Codicon } from 'vs/base/common/codicons';
import { registerIcon } from 'vs/platform/theme/common/iconRegistry';
import { Link } from 'vs/platform/opener/browser/link';
import { ILanguageFeaturesService } from 'vs/editor/common/services/languageFeatures';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { MarkersContextKeys } from 'vs/workbench/contrib/markers/common/markers';
import { unsupportedSchemas } from 'vs/platform/markers/common/markerService';
let MarkersWidgetAccessibilityProvider = class MarkersWidgetAccessibilityProvider {
    labelService;
    constructor(labelService) {
        this.labelService = labelService;
    }
    getWidgetAriaLabel() {
        return localize('problemsView', "Problems View");
    }
    getAriaLabel(element) {
        if (element instanceof ResourceMarkers) {
            const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
            return Messages.MARKERS_TREE_ARIA_LABEL_RESOURCE(element.markers.length, element.name, paths.dirname(path));
        }
        if (element instanceof Marker || element instanceof MarkerTableItem) {
            return Messages.MARKERS_TREE_ARIA_LABEL_MARKER(element);
        }
        if (element instanceof RelatedInformation) {
            return Messages.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION(element.raw);
        }
        return null;
    }
};
MarkersWidgetAccessibilityProvider = __decorate([
    __param(0, ILabelService)
], MarkersWidgetAccessibilityProvider);
export { MarkersWidgetAccessibilityProvider };
var TemplateId;
(function (TemplateId) {
    TemplateId["ResourceMarkers"] = "rm";
    TemplateId["Marker"] = "m";
    TemplateId["RelatedInformation"] = "ri";
})(TemplateId || (TemplateId = {}));
export class VirtualDelegate {
    markersViewState;
    static LINE_HEIGHT = 22;
    constructor(markersViewState) {
        this.markersViewState = markersViewState;
    }
    getHeight(element) {
        if (element instanceof Marker) {
            const viewModel = this.markersViewState.getViewModel(element);
            const noOfLines = !viewModel || viewModel.multiline ? element.lines.length : 1;
            return noOfLines * VirtualDelegate.LINE_HEIGHT;
        }
        return VirtualDelegate.LINE_HEIGHT;
    }
    getTemplateId(element) {
        if (element instanceof ResourceMarkers) {
            return "rm" /* TemplateId.ResourceMarkers */;
        }
        else if (element instanceof Marker) {
            return "m" /* TemplateId.Marker */;
        }
        else {
            return "ri" /* TemplateId.RelatedInformation */;
        }
    }
}
var FilterDataType;
(function (FilterDataType) {
    FilterDataType[FilterDataType["ResourceMarkers"] = 0] = "ResourceMarkers";
    FilterDataType[FilterDataType["Marker"] = 1] = "Marker";
    FilterDataType[FilterDataType["RelatedInformation"] = 2] = "RelatedInformation";
})(FilterDataType || (FilterDataType = {}));
let ResourceMarkersRenderer = class ResourceMarkersRenderer {
    labels;
    themeService;
    labelService;
    fileService;
    renderedNodes = new Map();
    disposables = new DisposableStore();
    constructor(labels, onDidChangeRenderNodeCount, themeService, labelService, fileService) {
        this.labels = labels;
        this.themeService = themeService;
        this.labelService = labelService;
        this.fileService = fileService;
        onDidChangeRenderNodeCount(this.onDidChangeRenderNodeCount, this, this.disposables);
    }
    templateId = "rm" /* TemplateId.ResourceMarkers */;
    renderTemplate(container) {
        const data = Object.create(null);
        const resourceLabelContainer = dom.append(container, dom.$('.resource-label-container'));
        data.resourceLabel = this.labels.create(resourceLabelContainer, { supportHighlights: true });
        const badgeWrapper = dom.append(container, dom.$('.count-badge-wrapper'));
        data.count = new CountBadge(badgeWrapper);
        data.styler = attachBadgeStyler(data.count, this.themeService);
        return data;
    }
    renderElement(node, _, templateData) {
        const resourceMarkers = node.element;
        const uriMatches = node.filterData && node.filterData.uriMatches || [];
        if (this.fileService.hasProvider(resourceMarkers.resource) || resourceMarkers.resource.scheme === network.Schemas.untitled) {
            templateData.resourceLabel.setFile(resourceMarkers.resource, { matches: uriMatches });
        }
        else {
            templateData.resourceLabel.setResource({ name: resourceMarkers.name, description: this.labelService.getUriLabel(dirname(resourceMarkers.resource), { relative: true }), resource: resourceMarkers.resource }, { matches: uriMatches });
        }
        this.updateCount(node, templateData);
        this.renderedNodes.set(node, templateData);
    }
    disposeElement(node) {
        this.renderedNodes.delete(node);
    }
    disposeTemplate(templateData) {
        templateData.resourceLabel.dispose();
        templateData.styler.dispose();
    }
    onDidChangeRenderNodeCount(node) {
        const templateData = this.renderedNodes.get(node);
        if (!templateData) {
            return;
        }
        this.updateCount(node, templateData);
    }
    updateCount(node, templateData) {
        templateData.count.setCount(node.children.reduce((r, n) => r + (n.visible ? 1 : 0), 0));
    }
    dispose() {
        this.disposables.dispose();
    }
};
ResourceMarkersRenderer = __decorate([
    __param(2, IThemeService),
    __param(3, ILabelService),
    __param(4, IFileService)
], ResourceMarkersRenderer);
export { ResourceMarkersRenderer };
export class FileResourceMarkersRenderer extends ResourceMarkersRenderer {
}
let MarkerRenderer = class MarkerRenderer {
    markersViewState;
    instantiationService;
    openerService;
    constructor(markersViewState, instantiationService, openerService) {
        this.markersViewState = markersViewState;
        this.instantiationService = instantiationService;
        this.openerService = openerService;
    }
    templateId = "m" /* TemplateId.Marker */;
    renderTemplate(container) {
        const data = Object.create(null);
        data.markerWidget = new MarkerWidget(container, this.markersViewState, this.openerService, this.instantiationService);
        return data;
    }
    renderElement(node, _, templateData) {
        templateData.markerWidget.render(node.element, node.filterData);
    }
    disposeTemplate(templateData) {
        templateData.markerWidget.dispose();
    }
};
MarkerRenderer = __decorate([
    __param(1, IInstantiationService),
    __param(2, IOpenerService)
], MarkerRenderer);
export { MarkerRenderer };
const expandedIcon = registerIcon('markers-view-multi-line-expanded', Codicon.chevronUp, localize('expandedIcon', 'Icon indicating that multiple lines are shown in the markers view.'));
const collapsedIcon = registerIcon('markers-view-multi-line-collapsed', Codicon.chevronDown, localize('collapsedIcon', 'Icon indicating that multiple lines are collapsed in the markers view.'));
const toggleMultilineAction = 'problems.action.toggleMultiline';
class ToggleMultilineActionViewItem extends ActionViewItem {
    render(container) {
        super.render(container);
        this.updateExpandedAttribute();
    }
    updateClass() {
        super.updateClass();
        this.updateExpandedAttribute();
    }
    updateExpandedAttribute() {
        this.element?.setAttribute('aria-expanded', `${this._action.class === ThemeIcon.asClassName(expandedIcon)}`);
    }
}
class MarkerWidget extends Disposable {
    parent;
    markersViewModel;
    _openerService;
    actionBar;
    icon;
    messageAndDetailsContainer;
    disposables = this._register(new DisposableStore());
    constructor(parent, markersViewModel, _openerService, _instantiationService) {
        super();
        this.parent = parent;
        this.markersViewModel = markersViewModel;
        this._openerService = _openerService;
        this.actionBar = this._register(new ActionBar(dom.append(parent, dom.$('.actions')), {
            actionViewItemProvider: (action) => action.id === QuickFixAction.ID ? _instantiationService.createInstance(QuickFixActionViewItem, action) : undefined
        }));
        this.icon = dom.append(parent, dom.$(''));
        this.messageAndDetailsContainer = dom.append(parent, dom.$('.marker-message-details-container'));
    }
    render(element, filterData) {
        this.actionBar.clear();
        this.disposables.clear();
        dom.clearNode(this.messageAndDetailsContainer);
        this.icon.className = `marker-icon codicon ${SeverityIcon.className(MarkerSeverity.toSeverity(element.marker.severity))}`;
        this.renderQuickfixActionbar(element);
        this.renderMessageAndDetails(element, filterData);
        this.disposables.add(dom.addDisposableListener(this.parent, dom.EventType.MOUSE_OVER, () => this.markersViewModel.onMarkerMouseHover(element)));
        this.disposables.add(dom.addDisposableListener(this.parent, dom.EventType.MOUSE_LEAVE, () => this.markersViewModel.onMarkerMouseLeave(element)));
    }
    renderQuickfixActionbar(marker) {
        const viewModel = this.markersViewModel.getViewModel(marker);
        if (viewModel) {
            const quickFixAction = viewModel.quickFixAction;
            this.actionBar.push([quickFixAction], { icon: true, label: false });
            this.icon.classList.toggle('quickFix', quickFixAction.enabled);
            quickFixAction.onDidChange(({ enabled }) => {
                if (!isUndefinedOrNull(enabled)) {
                    this.icon.classList.toggle('quickFix', enabled);
                }
            }, this, this.disposables);
            quickFixAction.onShowQuickFixes(() => {
                const quickFixActionViewItem = this.actionBar.viewItems[0];
                if (quickFixActionViewItem) {
                    quickFixActionViewItem.showQuickFixes();
                }
            }, this, this.disposables);
        }
    }
    renderMultilineActionbar(marker, parent) {
        const multilineActionbar = this.disposables.add(new ActionBar(dom.append(parent, dom.$('.multiline-actions')), {
            actionViewItemProvider: (action) => {
                if (action.id === toggleMultilineAction) {
                    return new ToggleMultilineActionViewItem(undefined, action, { icon: true });
                }
                return undefined;
            }
        }));
        this.disposables.add(toDisposable(() => multilineActionbar.dispose()));
        const viewModel = this.markersViewModel.getViewModel(marker);
        const multiline = viewModel && viewModel.multiline;
        const action = new Action(toggleMultilineAction);
        action.enabled = !!viewModel && marker.lines.length > 1;
        action.tooltip = multiline ? localize('single line', "Show message in single line") : localize('multi line', "Show message in multiple lines");
        action.class = ThemeIcon.asClassName(multiline ? expandedIcon : collapsedIcon);
        action.run = () => { if (viewModel) {
            viewModel.multiline = !viewModel.multiline;
        } return Promise.resolve(); };
        multilineActionbar.push([action], { icon: true, label: false });
    }
    renderMessageAndDetails(element, filterData) {
        const { marker, lines } = element;
        const viewState = this.markersViewModel.getViewModel(element);
        const multiline = !viewState || viewState.multiline;
        const lineMatches = filterData && filterData.lineMatches || [];
        this.messageAndDetailsContainer.title = element.marker.message;
        const lineElements = [];
        for (let index = 0; index < (multiline ? lines.length : 1); index++) {
            const lineElement = dom.append(this.messageAndDetailsContainer, dom.$('.marker-message-line'));
            const messageElement = dom.append(lineElement, dom.$('.marker-message'));
            const highlightedLabel = new HighlightedLabel(messageElement);
            highlightedLabel.set(lines[index].length > 1000 ? `${lines[index].substring(0, 1000)}...` : lines[index], lineMatches[index]);
            if (lines[index] === '') {
                lineElement.style.height = `${VirtualDelegate.LINE_HEIGHT}px`;
            }
            lineElements.push(lineElement);
        }
        this.renderDetails(marker, filterData, lineElements[0]);
        this.renderMultilineActionbar(element, lineElements[0]);
    }
    renderDetails(marker, filterData, parent) {
        parent.classList.add('details-container');
        if (marker.source || marker.code) {
            const source = new HighlightedLabel(dom.append(parent, dom.$('.marker-source')));
            const sourceMatches = filterData && filterData.sourceMatches || [];
            source.set(marker.source, sourceMatches);
            if (marker.code) {
                if (typeof marker.code === 'string') {
                    const code = new HighlightedLabel(dom.append(parent, dom.$('.marker-code')));
                    const codeMatches = filterData && filterData.codeMatches || [];
                    code.set(marker.code, codeMatches);
                }
                else {
                    // TODO@sandeep: these widgets should be disposed
                    const container = dom.$('.marker-code');
                    const code = new HighlightedLabel(container);
                    new Link(parent, { href: marker.code.target.toString(), label: container, title: marker.code.target.toString() }, undefined, this._openerService);
                    const codeMatches = filterData && filterData.codeMatches || [];
                    code.set(marker.code.value, codeMatches);
                }
            }
        }
        const lnCol = dom.append(parent, dom.$('span.marker-line'));
        lnCol.textContent = Messages.MARKERS_PANEL_AT_LINE_COL_NUMBER(marker.startLineNumber, marker.startColumn);
    }
}
let RelatedInformationRenderer = class RelatedInformationRenderer {
    labelService;
    constructor(labelService) {
        this.labelService = labelService;
    }
    templateId = "ri" /* TemplateId.RelatedInformation */;
    renderTemplate(container) {
        const data = Object.create(null);
        dom.append(container, dom.$('.actions'));
        dom.append(container, dom.$('.icon'));
        data.resourceLabel = new HighlightedLabel(dom.append(container, dom.$('.related-info-resource')));
        data.lnCol = dom.append(container, dom.$('span.marker-line'));
        const separator = dom.append(container, dom.$('span.related-info-resource-separator'));
        separator.textContent = ':';
        separator.style.paddingRight = '4px';
        data.description = new HighlightedLabel(dom.append(container, dom.$('.marker-description')));
        return data;
    }
    renderElement(node, _, templateData) {
        const relatedInformation = node.element.raw;
        const uriMatches = node.filterData && node.filterData.uriMatches || [];
        const messageMatches = node.filterData && node.filterData.messageMatches || [];
        templateData.resourceLabel.set(basename(relatedInformation.resource), uriMatches);
        templateData.resourceLabel.element.title = this.labelService.getUriLabel(relatedInformation.resource, { relative: true });
        templateData.lnCol.textContent = Messages.MARKERS_PANEL_AT_LINE_COL_NUMBER(relatedInformation.startLineNumber, relatedInformation.startColumn);
        templateData.description.set(relatedInformation.message, messageMatches);
        templateData.description.element.title = relatedInformation.message;
    }
    disposeTemplate(templateData) {
        // noop
    }
};
RelatedInformationRenderer = __decorate([
    __param(0, ILabelService)
], RelatedInformationRenderer);
export { RelatedInformationRenderer };
export class Filter {
    options;
    constructor(options) {
        this.options = options;
    }
    filter(element, parentVisibility) {
        if (element instanceof ResourceMarkers) {
            return this.filterResourceMarkers(element);
        }
        else if (element instanceof Marker) {
            return this.filterMarker(element, parentVisibility);
        }
        else {
            return this.filterRelatedInformation(element, parentVisibility);
        }
    }
    filterResourceMarkers(resourceMarkers) {
        if (unsupportedSchemas.has(resourceMarkers.resource.scheme)) {
            return false;
        }
        // Filter resource by pattern first (globs)
        // Excludes pattern
        if (this.options.excludesMatcher.matches(resourceMarkers.resource)) {
            return false;
        }
        // Includes pattern
        if (this.options.includesMatcher.matches(resourceMarkers.resource)) {
            return true;
        }
        // Fiter by text. Do not apply negated filters on resources instead use exclude patterns
        if (this.options.textFilter.text && !this.options.textFilter.negate) {
            const uriMatches = FilterOptions._filter(this.options.textFilter.text, basename(resourceMarkers.resource));
            if (uriMatches) {
                return { visibility: true, data: { type: 0 /* FilterDataType.ResourceMarkers */, uriMatches: uriMatches || [] } };
            }
        }
        return 2 /* TreeVisibility.Recurse */;
    }
    filterMarker(marker, parentVisibility) {
        const matchesSeverity = this.options.showErrors && MarkerSeverity.Error === marker.marker.severity ||
            this.options.showWarnings && MarkerSeverity.Warning === marker.marker.severity ||
            this.options.showInfos && MarkerSeverity.Info === marker.marker.severity;
        if (!matchesSeverity) {
            return false;
        }
        if (!this.options.textFilter.text) {
            return true;
        }
        const lineMatches = [];
        for (const line of marker.lines) {
            const lineMatch = FilterOptions._messageFilter(this.options.textFilter.text, line);
            lineMatches.push(lineMatch || []);
        }
        const sourceMatches = marker.marker.source ? FilterOptions._filter(this.options.textFilter.text, marker.marker.source) : undefined;
        const codeMatches = marker.marker.code ? FilterOptions._filter(this.options.textFilter.text, typeof marker.marker.code === 'string' ? marker.marker.code : marker.marker.code.value) : undefined;
        const matched = sourceMatches || codeMatches || lineMatches.some(lineMatch => lineMatch.length > 0);
        // Matched and not negated
        if (matched && !this.options.textFilter.negate) {
            return { visibility: true, data: { type: 1 /* FilterDataType.Marker */, lineMatches, sourceMatches: sourceMatches || [], codeMatches: codeMatches || [] } };
        }
        // Matched and negated - exclude it only if parent visibility is not set
        if (matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return false;
        }
        // Not matched and negated - include it only if parent visibility is not set
        if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return true;
        }
        return parentVisibility;
    }
    filterRelatedInformation(relatedInformation, parentVisibility) {
        if (!this.options.textFilter.text) {
            return true;
        }
        const uriMatches = FilterOptions._filter(this.options.textFilter.text, basename(relatedInformation.raw.resource));
        const messageMatches = FilterOptions._messageFilter(this.options.textFilter.text, paths.basename(relatedInformation.raw.message));
        const matched = uriMatches || messageMatches;
        // Matched and not negated
        if (matched && !this.options.textFilter.negate) {
            return { visibility: true, data: { type: 2 /* FilterDataType.RelatedInformation */, uriMatches: uriMatches || [], messageMatches: messageMatches || [] } };
        }
        // Matched and negated - exclude it only if parent visibility is not set
        if (matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return false;
        }
        // Not matched and negated - include it only if parent visibility is not set
        if (!matched && this.options.textFilter.negate && parentVisibility === 2 /* TreeVisibility.Recurse */) {
            return true;
        }
        return parentVisibility;
    }
}
let MarkerViewModel = class MarkerViewModel extends Disposable {
    marker;
    modelService;
    instantiationService;
    editorService;
    languageFeaturesService;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    modelPromise = null;
    codeActionsPromise = null;
    constructor(marker, modelService, instantiationService, editorService, languageFeaturesService) {
        super();
        this.marker = marker;
        this.modelService = modelService;
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.languageFeaturesService = languageFeaturesService;
        this._register(toDisposable(() => {
            if (this.modelPromise) {
                this.modelPromise.cancel();
            }
            if (this.codeActionsPromise) {
                this.codeActionsPromise.cancel();
            }
        }));
    }
    _multiline = true;
    get multiline() {
        return this._multiline;
    }
    set multiline(value) {
        if (this._multiline !== value) {
            this._multiline = value;
            this._onDidChange.fire();
        }
    }
    _quickFixAction = null;
    get quickFixAction() {
        if (!this._quickFixAction) {
            this._quickFixAction = this._register(this.instantiationService.createInstance(QuickFixAction, this.marker));
        }
        return this._quickFixAction;
    }
    showLightBulb() {
        this.setQuickFixes(true);
    }
    async setQuickFixes(waitForModel) {
        const codeActions = await this.getCodeActions(waitForModel);
        this.quickFixAction.quickFixes = codeActions ? this.toActions(codeActions) : [];
        this.quickFixAction.autoFixable(!!codeActions && codeActions.hasAutoFix);
    }
    getCodeActions(waitForModel) {
        if (this.codeActionsPromise !== null) {
            return this.codeActionsPromise;
        }
        return this.getModel(waitForModel)
            .then(model => {
            if (model) {
                if (!this.codeActionsPromise) {
                    this.codeActionsPromise = createCancelablePromise(cancellationToken => {
                        return getCodeActions(this.languageFeaturesService.codeActionProvider, model, new Range(this.marker.range.startLineNumber, this.marker.range.startColumn, this.marker.range.endLineNumber, this.marker.range.endColumn), {
                            type: 1 /* CodeActionTriggerType.Invoke */, triggerAction: CodeActionTriggerSource.ProblemsView, filter: { include: CodeActionKind.QuickFix }
                        }, Progress.None, cancellationToken).then(actions => {
                            return this._register(actions);
                        });
                    });
                }
                return this.codeActionsPromise;
            }
            return null;
        });
    }
    toActions(codeActions) {
        return codeActions.validActions.map(item => new Action(item.action.command ? item.action.command.id : item.action.title, item.action.title, undefined, true, () => {
            return this.openFileAtMarker(this.marker)
                .then(() => this.instantiationService.invokeFunction(applyCodeAction, item, ApplyCodeActionReason.FromProblemsView));
        }));
    }
    openFileAtMarker(element) {
        const { resource, selection } = { resource: element.resource, selection: element.range };
        return this.editorService.openEditor({
            resource,
            options: {
                selection,
                preserveFocus: true,
                pinned: false,
                revealIfVisible: true
            },
        }, ACTIVE_GROUP).then(() => undefined);
    }
    getModel(waitForModel) {
        const model = this.modelService.getModel(this.marker.resource);
        if (model) {
            return Promise.resolve(model);
        }
        if (waitForModel) {
            if (!this.modelPromise) {
                this.modelPromise = createCancelablePromise(cancellationToken => {
                    return new Promise((c) => {
                        this._register(this.modelService.onModelAdded(model => {
                            if (isEqual(model.uri, this.marker.resource)) {
                                c(model);
                            }
                        }));
                    });
                });
            }
            return this.modelPromise;
        }
        return Promise.resolve(null);
    }
};
MarkerViewModel = __decorate([
    __param(1, IModelService),
    __param(2, IInstantiationService),
    __param(3, IEditorService),
    __param(4, ILanguageFeaturesService)
], MarkerViewModel);
export { MarkerViewModel };
let MarkersViewModel = class MarkersViewModel extends Disposable {
    contextKeyService;
    instantiationService;
    _onDidChange = this._register(new Emitter());
    onDidChange = this._onDidChange.event;
    _onDidChangeViewMode = this._register(new Emitter());
    onDidChangeViewMode = this._onDidChangeViewMode.event;
    markersViewStates = new Map();
    markersPerResource = new Map();
    bulkUpdate = false;
    hoveredMarker = null;
    hoverDelayer = new Delayer(300);
    viewModeContextKey;
    constructor(multiline = true, viewMode = "tree" /* MarkersViewMode.Tree */, contextKeyService, instantiationService) {
        super();
        this.contextKeyService = contextKeyService;
        this.instantiationService = instantiationService;
        this._multiline = multiline;
        this._viewMode = viewMode;
        this.viewModeContextKey = MarkersContextKeys.MarkersViewModeContextKey.bindTo(this.contextKeyService);
        this.viewModeContextKey.set(viewMode);
    }
    add(marker) {
        if (!this.markersViewStates.has(marker.id)) {
            const viewModel = this.instantiationService.createInstance(MarkerViewModel, marker);
            const disposables = [viewModel];
            viewModel.multiline = this.multiline;
            viewModel.onDidChange(() => {
                if (!this.bulkUpdate) {
                    this._onDidChange.fire(marker);
                }
            }, this, disposables);
            this.markersViewStates.set(marker.id, { viewModel, disposables });
            const markers = this.markersPerResource.get(marker.resource.toString()) || [];
            markers.push(marker);
            this.markersPerResource.set(marker.resource.toString(), markers);
        }
    }
    remove(resource) {
        const markers = this.markersPerResource.get(resource.toString()) || [];
        for (const marker of markers) {
            const value = this.markersViewStates.get(marker.id);
            if (value) {
                dispose(value.disposables);
            }
            this.markersViewStates.delete(marker.id);
            if (this.hoveredMarker === marker) {
                this.hoveredMarker = null;
            }
        }
        this.markersPerResource.delete(resource.toString());
    }
    getViewModel(marker) {
        const value = this.markersViewStates.get(marker.id);
        return value ? value.viewModel : null;
    }
    onMarkerMouseHover(marker) {
        this.hoveredMarker = marker;
        this.hoverDelayer.trigger(() => {
            if (this.hoveredMarker) {
                const model = this.getViewModel(this.hoveredMarker);
                if (model) {
                    model.showLightBulb();
                }
            }
        });
    }
    onMarkerMouseLeave(marker) {
        if (this.hoveredMarker === marker) {
            this.hoveredMarker = null;
        }
    }
    _multiline = true;
    get multiline() {
        return this._multiline;
    }
    set multiline(value) {
        let changed = false;
        if (this._multiline !== value) {
            this._multiline = value;
            changed = true;
        }
        this.bulkUpdate = true;
        this.markersViewStates.forEach(({ viewModel }) => {
            if (viewModel.multiline !== value) {
                viewModel.multiline = value;
                changed = true;
            }
        });
        this.bulkUpdate = false;
        if (changed) {
            this._onDidChange.fire(undefined);
        }
    }
    _viewMode = "tree" /* MarkersViewMode.Tree */;
    get viewMode() {
        return this._viewMode;
    }
    set viewMode(value) {
        if (this._viewMode === value) {
            return;
        }
        this._viewMode = value;
        this._onDidChangeViewMode.fire(value);
        this.viewModeContextKey.set(value);
    }
    dispose() {
        this.markersViewStates.forEach(({ disposables }) => dispose(disposables));
        this.markersViewStates.clear();
        this.markersPerResource.clear();
        super.dispose();
    }
};
MarkersViewModel = __decorate([
    __param(2, IContextKeyService),
    __param(3, IInstantiationService)
], MarkersViewModel);
export { MarkersViewModel };
