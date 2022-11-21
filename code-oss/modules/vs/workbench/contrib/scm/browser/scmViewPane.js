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
import 'vs/css!./media/scm';
import { Event, Emitter } from 'vs/base/common/event';
import { basename, dirname } from 'vs/base/common/resources';
import { Disposable, DisposableStore, combinedDisposable, dispose, toDisposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { ViewPane, ViewAction } from 'vs/workbench/browser/parts/views/viewPane';
import { append, $, Dimension, asCSSUrl, trackFocus, clearNode } from 'vs/base/browser/dom';
import { ISCMViewService, ISCMService, SCMInputChangeReason, VIEW_PANE_ID, REPOSITORIES_VIEW_PANE_ID } from 'vs/workbench/contrib/scm/common/scm';
import { ResourceLabels } from 'vs/workbench/browser/labels';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IContextViewService, IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IContextKeyService, ContextKeyExpr, RawContextKey } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IKeybindingService } from 'vs/platform/keybinding/common/keybinding';
import { MenuItemAction, IMenuService, registerAction2, MenuId, MenuRegistry, Action2 } from 'vs/platform/actions/common/actions';
import { ActionRunner, Action, Separator } from 'vs/base/common/actions';
import { ActionBar } from 'vs/base/browser/ui/actionbar/actionbar';
import { IThemeService, ThemeIcon } from 'vs/platform/theme/common/themeService';
import { isSCMResource, isSCMResourceGroup, connectPrimaryMenuToInlineActionBar, isSCMRepository, isSCMInput, collectContextMenuActions, getActionViewItemProvider, isSCMActionButton } from './util';
import { attachBadgeStyler } from 'vs/platform/theme/common/styler';
import { WorkbenchCompressibleObjectTree } from 'vs/platform/list/browser/listService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { disposableTimeout, ThrottledDelayer } from 'vs/base/common/async';
import { ResourceTree } from 'vs/base/common/resourceTree';
import { Iterable } from 'vs/base/common/iterator';
import { URI } from 'vs/base/common/uri';
import { FileKind } from 'vs/platform/files/common/files';
import { compareFileNames, comparePaths } from 'vs/base/common/comparers';
import { createMatches } from 'vs/base/common/filters';
import { IViewDescriptorService } from 'vs/workbench/common/views';
import { localize } from 'vs/nls';
import { coalesce, flatten } from 'vs/base/common/arrays';
import { memoize } from 'vs/base/common/decorators';
import { IStorageService, WillSaveStateReason } from 'vs/platform/storage/common/storage';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { SIDE_BAR_BACKGROUND, PANEL_BACKGROUND } from 'vs/workbench/common/theme';
import { CodeEditorWidget } from 'vs/editor/browser/widget/codeEditorWidget';
import { getSimpleEditorOptions } from 'vs/workbench/contrib/codeEditor/browser/simpleEditorOptions';
import { IModelService } from 'vs/editor/common/services/model';
import { EditorExtensionsRegistry } from 'vs/editor/browser/editorExtensions';
import { MenuPreventer } from 'vs/workbench/contrib/codeEditor/browser/menuPreventer';
import { SelectionClipboardContributionID } from 'vs/workbench/contrib/codeEditor/browser/selectionClipboard';
import { ContextMenuController } from 'vs/editor/contrib/contextmenu/browser/contextmenu';
import * as platform from 'vs/base/common/platform';
import { compare, format } from 'vs/base/common/strings';
import { SuggestController } from 'vs/editor/contrib/suggest/browser/suggestController';
import { SnippetController2 } from 'vs/editor/contrib/snippet/browser/snippetController2';
import { Schemas } from 'vs/base/common/network';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { ModesHoverController } from 'vs/editor/contrib/hover/browser/hover';
import { ColorDetector } from 'vs/editor/contrib/colorPicker/browser/colorDetector';
import { LinkDetector } from 'vs/editor/contrib/links/browser/links';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ILabelService } from 'vs/platform/label/common/label';
import { DEFAULT_FONT_FAMILY } from 'vs/workbench/browser/style';
import { Codicon } from 'vs/base/common/codicons';
import { RepositoryRenderer } from 'vs/workbench/contrib/scm/browser/scmRepositoryRenderer';
import { ColorScheme } from 'vs/platform/theme/common/theme';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from 'vs/workbench/browser/parts/editor/editorCommands';
import { createAndFillInContextMenuActions } from 'vs/platform/actions/browser/menuEntryActionViewItem';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { MarkdownRenderer, openLinkFromMarkdown } from 'vs/editor/contrib/markdownRenderer/browser/markdownRenderer';
import { Button, ButtonWithDescription, ButtonWithDropdown } from 'vs/base/browser/ui/button/button';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { RepositoryContextKeys } from 'vs/workbench/contrib/scm/browser/scmViewService';
import { DragAndDropController } from 'vs/editor/contrib/dnd/browser/dnd';
import { DropIntoEditorController } from 'vs/editor/contrib/dropIntoEditor/browser/dropIntoEditorContribution';
import { MessageController } from 'vs/editor/contrib/message/browser/messageController';
import { contrastBorder, registerColor } from 'vs/platform/theme/common/colorRegistry';
import { defaultButtonStyles } from 'vs/platform/theme/browser/defaultStyles';
let ActionButtonRenderer = class ActionButtonRenderer {
    commandService;
    contextMenuService;
    notificationService;
    static DEFAULT_HEIGHT = 30;
    static TEMPLATE_ID = 'actionButton';
    get templateId() { return ActionButtonRenderer.TEMPLATE_ID; }
    actionButtons = new Map();
    constructor(commandService, contextMenuService, notificationService) {
        this.commandService = commandService;
        this.contextMenuService = contextMenuService;
        this.notificationService = notificationService;
    }
    renderTemplate(container) {
        // hack
        container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
        // Use default cursor & disable hover for list item
        container.parentElement.parentElement.classList.add('cursor-default', 'force-no-hover');
        const buttonContainer = append(container, $('.button-container'));
        const actionButton = new SCMActionButton(buttonContainer, this.contextMenuService, this.commandService, this.notificationService);
        return { actionButton, disposable: Disposable.None, templateDisposable: actionButton };
    }
    renderElement(node, index, templateData, height) {
        templateData.disposable.dispose();
        const disposables = new DisposableStore();
        const actionButton = node.element;
        templateData.actionButton.setButton(node.element.button);
        // Remember action button
        this.actionButtons.set(actionButton, templateData.actionButton);
        disposables.add({ dispose: () => this.actionButtons.delete(actionButton) });
        templateData.disposable = disposables;
    }
    renderCompressedElements() {
        throw new Error('Should never happen since node is incompressible');
    }
    focusActionButton(actionButton) {
        this.actionButtons.get(actionButton)?.focus();
    }
    disposeElement(node, index, template) {
        template.disposable.dispose();
    }
    disposeTemplate(templateData) {
        templateData.disposable.dispose();
        templateData.templateDisposable.dispose();
    }
};
ActionButtonRenderer = __decorate([
    __param(0, ICommandService),
    __param(1, IContextMenuService),
    __param(2, INotificationService)
], ActionButtonRenderer);
let InputRenderer = class InputRenderer {
    outerLayout;
    overflowWidgetsDomNode;
    updateHeight;
    instantiationService;
    static DEFAULT_HEIGHT = 26;
    static TEMPLATE_ID = 'input';
    get templateId() { return InputRenderer.TEMPLATE_ID; }
    inputWidgets = new Map();
    contentHeights = new WeakMap();
    editorSelections = new WeakMap();
    constructor(outerLayout, overflowWidgetsDomNode, updateHeight, instantiationService) {
        this.outerLayout = outerLayout;
        this.overflowWidgetsDomNode = overflowWidgetsDomNode;
        this.updateHeight = updateHeight;
        this.instantiationService = instantiationService;
    }
    renderTemplate(container) {
        // hack
        container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-no-twistie');
        // Disable hover for list item
        container.parentElement.parentElement.classList.add('force-no-hover');
        const templateDisposable = new DisposableStore();
        const inputElement = append(container, $('.scm-input'));
        const inputWidget = this.instantiationService.createInstance(SCMInputWidget, inputElement, this.overflowWidgetsDomNode);
        templateDisposable.add(inputWidget);
        return { inputWidget, elementDisposables: templateDisposable.add(new DisposableStore()), templateDisposable };
    }
    renderElement(node, index, templateData) {
        const input = node.element;
        templateData.inputWidget.input = input;
        // Remember widget
        this.inputWidgets.set(input, templateData.inputWidget);
        templateData.elementDisposables.add({ dispose: () => this.inputWidgets.delete(input) });
        // Widget cursor selections
        const selections = this.editorSelections.get(input);
        if (selections) {
            templateData.inputWidget.selections = selections;
        }
        templateData.elementDisposables.add(toDisposable(() => {
            const selections = templateData.inputWidget.selections;
            if (selections) {
                this.editorSelections.set(input, selections);
            }
        }));
        // Rerender the element whenever the editor content height changes
        const onDidChangeContentHeight = () => {
            const contentHeight = templateData.inputWidget.getContentHeight();
            const lastContentHeight = this.contentHeights.get(input);
            this.contentHeights.set(input, contentHeight);
            if (lastContentHeight !== contentHeight) {
                this.updateHeight(input, contentHeight + 10);
                templateData.inputWidget.layout();
            }
        };
        const startListeningContentHeightChange = () => {
            templateData.elementDisposables.add(templateData.inputWidget.onDidChangeContentHeight(onDidChangeContentHeight));
            onDidChangeContentHeight();
        };
        // Setup height change listener on next tick
        const timeout = disposableTimeout(startListeningContentHeightChange, 0);
        templateData.elementDisposables.add(timeout);
        // Layout the editor whenever the outer layout happens
        const layoutEditor = () => templateData.inputWidget.layout();
        templateData.elementDisposables.add(this.outerLayout.onDidChange(layoutEditor));
        layoutEditor();
    }
    renderCompressedElements() {
        throw new Error('Should never happen since node is incompressible');
    }
    disposeElement(group, index, template) {
        template.elementDisposables.clear();
    }
    disposeTemplate(templateData) {
        templateData.templateDisposable.dispose();
    }
    getHeight(input) {
        return (this.contentHeights.get(input) ?? InputRenderer.DEFAULT_HEIGHT) + 10;
    }
    getRenderedInputWidget(input) {
        return this.inputWidgets.get(input);
    }
    getFocusedInput() {
        for (const [input, inputWidget] of this.inputWidgets) {
            if (inputWidget.hasFocus()) {
                return input;
            }
        }
        return undefined;
    }
    clearValidation() {
        for (const [, inputWidget] of this.inputWidgets) {
            inputWidget.clearValidation();
        }
    }
};
InputRenderer = __decorate([
    __param(3, IInstantiationService)
], InputRenderer);
let ResourceGroupRenderer = class ResourceGroupRenderer {
    actionViewItemProvider;
    scmViewService;
    themeService;
    static TEMPLATE_ID = 'resource group';
    get templateId() { return ResourceGroupRenderer.TEMPLATE_ID; }
    constructor(actionViewItemProvider, scmViewService, themeService) {
        this.actionViewItemProvider = actionViewItemProvider;
        this.scmViewService = scmViewService;
        this.themeService = themeService;
    }
    renderTemplate(container) {
        // hack
        container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
        const element = append(container, $('.resource-group'));
        const name = append(element, $('.name'));
        const actionsContainer = append(element, $('.actions'));
        const actionBar = new ActionBar(actionsContainer, { actionViewItemProvider: this.actionViewItemProvider });
        const countContainer = append(element, $('.count'));
        const count = new CountBadge(countContainer);
        const styler = attachBadgeStyler(count, this.themeService);
        const disposables = combinedDisposable(actionBar, styler);
        return { name, count, actionBar, elementDisposables: new DisposableStore(), disposables };
    }
    renderElement(node, index, template) {
        const group = node.element;
        template.name.textContent = group.label;
        template.actionBar.clear();
        template.actionBar.context = group;
        template.count.setCount(group.elements.length);
        const menus = this.scmViewService.menus.getRepositoryMenus(group.provider);
        template.elementDisposables.add(connectPrimaryMenuToInlineActionBar(menus.getResourceGroupMenu(group), template.actionBar));
    }
    renderCompressedElements(node, index, templateData, height) {
        throw new Error('Should never happen since node is incompressible');
    }
    disposeElement(group, index, template) {
        template.elementDisposables.clear();
    }
    disposeTemplate(template) {
        template.elementDisposables.dispose();
        template.disposables.dispose();
    }
};
ResourceGroupRenderer = __decorate([
    __param(1, ISCMViewService),
    __param(2, IThemeService)
], ResourceGroupRenderer);
class RepositoryPaneActionRunner extends ActionRunner {
    getSelectedResources;
    constructor(getSelectedResources) {
        super();
        this.getSelectedResources = getSelectedResources;
    }
    async runAction(action, context) {
        if (!(action instanceof MenuItemAction)) {
            return super.runAction(action, context);
        }
        const selection = this.getSelectedResources();
        const contextIsSelected = selection.some(s => s === context);
        const actualContext = contextIsSelected ? selection : [context];
        const args = flatten(actualContext.map(e => ResourceTree.isResourceNode(e) ? ResourceTree.collect(e) : [e]));
        await action.run(...args);
    }
}
let ResourceRenderer = class ResourceRenderer {
    viewModelProvider;
    labels;
    actionViewItemProvider;
    actionRunner;
    labelService;
    scmViewService;
    themeService;
    static TEMPLATE_ID = 'resource';
    get templateId() { return ResourceRenderer.TEMPLATE_ID; }
    disposables = new DisposableStore();
    renderedResources = new Map();
    constructor(viewModelProvider, labels, actionViewItemProvider, actionRunner, labelService, scmViewService, themeService) {
        this.viewModelProvider = viewModelProvider;
        this.labels = labels;
        this.actionViewItemProvider = actionViewItemProvider;
        this.actionRunner = actionRunner;
        this.labelService = labelService;
        this.scmViewService = scmViewService;
        this.themeService = themeService;
        themeService.onDidColorThemeChange(this.onDidColorThemeChange, this, this.disposables);
    }
    renderTemplate(container) {
        const element = append(container, $('.resource'));
        const name = append(element, $('.name'));
        const fileLabel = this.labels.create(name, { supportDescriptionHighlights: true, supportHighlights: true });
        const actionsContainer = append(fileLabel.element, $('.actions'));
        const actionBar = new ActionBar(actionsContainer, {
            actionViewItemProvider: this.actionViewItemProvider,
            actionRunner: this.actionRunner
        });
        const decorationIcon = append(element, $('.decoration-icon'));
        const disposables = combinedDisposable(actionBar, fileLabel);
        return { element, name, fileLabel, decorationIcon, actionBar, elementDisposables: new DisposableStore(), disposables };
    }
    renderElement(node, index, template) {
        const resourceOrFolder = node.element;
        const iconResource = ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.element : resourceOrFolder;
        const uri = ResourceTree.isResourceNode(resourceOrFolder) ? resourceOrFolder.uri : resourceOrFolder.sourceUri;
        const fileKind = ResourceTree.isResourceNode(resourceOrFolder) ? FileKind.FOLDER : FileKind.FILE;
        const viewModel = this.viewModelProvider();
        const tooltip = !ResourceTree.isResourceNode(resourceOrFolder) && resourceOrFolder.decorations.tooltip || '';
        template.actionBar.clear();
        template.actionBar.context = resourceOrFolder;
        let matches;
        let descriptionMatches;
        let strikethrough;
        if (ResourceTree.isResourceNode(resourceOrFolder)) {
            if (resourceOrFolder.element) {
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.element.resourceGroup.provider);
                template.elementDisposables.add(connectPrimaryMenuToInlineActionBar(menus.getResourceMenu(resourceOrFolder.element), template.actionBar));
                template.element.classList.toggle('faded', resourceOrFolder.element.decorations.faded);
                strikethrough = resourceOrFolder.element.decorations.strikeThrough;
            }
            else {
                matches = createMatches(node.filterData);
                const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.context.provider);
                template.elementDisposables.add(connectPrimaryMenuToInlineActionBar(menus.getResourceFolderMenu(resourceOrFolder.context), template.actionBar));
                template.element.classList.remove('faded');
            }
        }
        else {
            [matches, descriptionMatches] = this._processFilterData(uri, node.filterData);
            const menus = this.scmViewService.menus.getRepositoryMenus(resourceOrFolder.resourceGroup.provider);
            template.elementDisposables.add(connectPrimaryMenuToInlineActionBar(menus.getResourceMenu(resourceOrFolder), template.actionBar));
            template.element.classList.toggle('faded', resourceOrFolder.decorations.faded);
            strikethrough = resourceOrFolder.decorations.strikeThrough;
        }
        const renderedData = {
            tooltip,
            uri,
            fileLabelOptions: {
                hidePath: viewModel.mode === "tree" /* ViewModelMode.Tree */,
                fileKind,
                matches,
                descriptionMatches,
                strikethrough
            },
            iconResource
        };
        this.renderIcon(template, renderedData);
        this.renderedResources.set(template, renderedData);
        template.elementDisposables.add(toDisposable(() => this.renderedResources.delete(template)));
        template.element.setAttribute('data-tooltip', tooltip);
    }
    disposeElement(resource, index, template) {
        template.elementDisposables.clear();
    }
    renderCompressedElements(node, index, template, height) {
        const compressed = node.element;
        const folder = compressed.elements[compressed.elements.length - 1];
        const label = compressed.elements.map(e => e.name);
        const fileKind = FileKind.FOLDER;
        const matches = createMatches(node.filterData);
        template.fileLabel.setResource({ resource: folder.uri, name: label }, {
            fileDecorations: { colors: false, badges: true },
            fileKind,
            matches,
            separator: this.labelService.getSeparator(folder.uri.scheme)
        });
        template.actionBar.clear();
        template.actionBar.context = folder;
        const menus = this.scmViewService.menus.getRepositoryMenus(folder.context.provider);
        template.elementDisposables.add(connectPrimaryMenuToInlineActionBar(menus.getResourceFolderMenu(folder.context), template.actionBar));
        template.name.classList.remove('strike-through');
        template.element.classList.remove('faded');
        template.decorationIcon.style.display = 'none';
        template.decorationIcon.style.backgroundImage = '';
        template.element.setAttribute('data-tooltip', '');
    }
    disposeCompressedElements(node, index, template, height) {
        template.elementDisposables.clear();
    }
    disposeTemplate(template) {
        template.elementDisposables.dispose();
        template.disposables.dispose();
    }
    _processFilterData(uri, filterData) {
        if (!filterData) {
            return [undefined, undefined];
        }
        if (!filterData.label) {
            const matches = createMatches(filterData);
            return [matches, undefined];
        }
        const fileName = basename(uri);
        const label = filterData.label;
        const pathLength = label.length - fileName.length;
        const matches = createMatches(filterData.score);
        // FileName match
        if (label === fileName) {
            return [matches, undefined];
        }
        // FilePath match
        const labelMatches = [];
        const descriptionMatches = [];
        for (const match of matches) {
            if (match.start > pathLength) {
                // Label match
                labelMatches.push({
                    start: match.start - pathLength,
                    end: match.end - pathLength
                });
            }
            else if (match.end < pathLength) {
                // Description match
                descriptionMatches.push(match);
            }
            else {
                // Spanning match
                labelMatches.push({
                    start: 0,
                    end: match.end - pathLength
                });
                descriptionMatches.push({
                    start: match.start,
                    end: pathLength
                });
            }
        }
        return [labelMatches, descriptionMatches];
    }
    onDidColorThemeChange() {
        for (const [template, data] of this.renderedResources) {
            this.renderIcon(template, data);
        }
    }
    renderIcon(template, data) {
        const theme = this.themeService.getColorTheme();
        const icon = theme.type === ColorScheme.LIGHT ? data.iconResource?.decorations.icon : data.iconResource?.decorations.iconDark;
        template.fileLabel.setFile(data.uri, {
            ...data.fileLabelOptions,
            fileDecorations: { colors: false, badges: !icon },
        });
        if (icon) {
            if (ThemeIcon.isThemeIcon(icon)) {
                template.decorationIcon.className = `decoration-icon ${ThemeIcon.asClassName(icon)}`;
                if (icon.color) {
                    template.decorationIcon.style.color = theme.getColor(icon.color.id)?.toString() ?? '';
                }
                template.decorationIcon.style.display = '';
                template.decorationIcon.style.backgroundImage = '';
            }
            else {
                template.decorationIcon.className = 'decoration-icon';
                template.decorationIcon.style.color = '';
                template.decorationIcon.style.display = '';
                template.decorationIcon.style.backgroundImage = asCSSUrl(icon);
            }
            template.decorationIcon.title = data.tooltip;
        }
        else {
            template.decorationIcon.className = 'decoration-icon';
            template.decorationIcon.style.color = '';
            template.decorationIcon.style.display = 'none';
            template.decorationIcon.style.backgroundImage = '';
            template.decorationIcon.title = '';
        }
    }
    dispose() {
        this.disposables.dispose();
    }
};
ResourceRenderer = __decorate([
    __param(4, ILabelService),
    __param(5, ISCMViewService),
    __param(6, IThemeService)
], ResourceRenderer);
class ListDelegate {
    inputRenderer;
    constructor(inputRenderer) {
        this.inputRenderer = inputRenderer;
    }
    getHeight(element) {
        if (isSCMInput(element)) {
            return this.inputRenderer.getHeight(element);
        }
        else if (isSCMActionButton(element)) {
            return ActionButtonRenderer.DEFAULT_HEIGHT + 10;
        }
        else {
            return 22;
        }
    }
    getTemplateId(element) {
        if (isSCMRepository(element)) {
            return RepositoryRenderer.TEMPLATE_ID;
        }
        else if (isSCMInput(element)) {
            return InputRenderer.TEMPLATE_ID;
        }
        else if (isSCMActionButton(element)) {
            return ActionButtonRenderer.TEMPLATE_ID;
        }
        else if (ResourceTree.isResourceNode(element) || isSCMResource(element)) {
            return ResourceRenderer.TEMPLATE_ID;
        }
        else {
            return ResourceGroupRenderer.TEMPLATE_ID;
        }
    }
}
class SCMTreeFilter {
    filter(element) {
        if (ResourceTree.isResourceNode(element)) {
            return true;
        }
        else if (isSCMResourceGroup(element)) {
            return element.elements.length > 0 || !element.hideWhenEmpty;
        }
        else {
            return true;
        }
    }
}
export class SCMTreeSorter {
    viewModelProvider;
    get viewModel() { return this.viewModelProvider(); }
    constructor(viewModelProvider) {
        this.viewModelProvider = viewModelProvider;
    }
    compare(one, other) {
        if (isSCMRepository(one)) {
            if (!isSCMRepository(other)) {
                throw new Error('Invalid comparison');
            }
            return 0;
        }
        if (isSCMInput(one)) {
            return -1;
        }
        else if (isSCMInput(other)) {
            return 1;
        }
        if (isSCMActionButton(one)) {
            return -1;
        }
        else if (isSCMActionButton(other)) {
            return 1;
        }
        if (isSCMResourceGroup(one)) {
            if (!isSCMResourceGroup(other)) {
                throw new Error('Invalid comparison');
            }
            return 0;
        }
        // List
        if (this.viewModel.mode === "list" /* ViewModelMode.List */) {
            // FileName
            if (this.viewModel.sortKey === "name" /* ViewModelSortKey.Name */) {
                const oneName = basename(one.sourceUri);
                const otherName = basename(other.sourceUri);
                return compareFileNames(oneName, otherName);
            }
            // Status
            if (this.viewModel.sortKey === "status" /* ViewModelSortKey.Status */) {
                const oneTooltip = one.decorations.tooltip ?? '';
                const otherTooltip = other.decorations.tooltip ?? '';
                if (oneTooltip !== otherTooltip) {
                    return compare(oneTooltip, otherTooltip);
                }
            }
            // Path (default)
            const onePath = one.sourceUri.fsPath;
            const otherPath = other.sourceUri.fsPath;
            return comparePaths(onePath, otherPath);
        }
        // Tree
        const oneIsDirectory = ResourceTree.isResourceNode(one);
        const otherIsDirectory = ResourceTree.isResourceNode(other);
        if (oneIsDirectory !== otherIsDirectory) {
            return oneIsDirectory ? -1 : 1;
        }
        const oneName = ResourceTree.isResourceNode(one) ? one.name : basename(one.sourceUri);
        const otherName = ResourceTree.isResourceNode(other) ? other.name : basename(other.sourceUri);
        return compareFileNames(oneName, otherName);
    }
}
__decorate([
    memoize
], SCMTreeSorter.prototype, "viewModel", null);
let SCMTreeKeyboardNavigationLabelProvider = class SCMTreeKeyboardNavigationLabelProvider {
    viewModelProvider;
    labelService;
    constructor(viewModelProvider, labelService) {
        this.viewModelProvider = viewModelProvider;
        this.labelService = labelService;
    }
    getKeyboardNavigationLabel(element) {
        if (ResourceTree.isResourceNode(element)) {
            return element.name;
        }
        else if (isSCMRepository(element) || isSCMInput(element) || isSCMActionButton(element)) {
            return undefined;
        }
        else if (isSCMResourceGroup(element)) {
            return element.label;
        }
        else {
            const viewModel = this.viewModelProvider();
            if (viewModel.mode === "list" /* ViewModelMode.List */) {
                // In List mode match using the file name and the path.
                // Since we want to match both on the file name and the
                // full path we return an array of labels. A match in the
                // file name takes precedence over a match in the path.
                const fileName = basename(element.sourceUri);
                const filePath = this.labelService.getUriLabel(element.sourceUri, { relative: true });
                return [fileName, filePath];
            }
            else {
                // In Tree mode only match using the file name
                return basename(element.sourceUri);
            }
        }
    }
    getCompressedNodeKeyboardNavigationLabel(elements) {
        const folders = elements;
        return folders.map(e => e.name).join('/');
    }
};
SCMTreeKeyboardNavigationLabelProvider = __decorate([
    __param(1, ILabelService)
], SCMTreeKeyboardNavigationLabelProvider);
export { SCMTreeKeyboardNavigationLabelProvider };
function getSCMResourceId(element) {
    if (ResourceTree.isResourceNode(element)) {
        const group = element.context;
        return `folder:${group.provider.id}/${group.id}/$FOLDER/${element.uri.toString()}`;
    }
    else if (isSCMRepository(element)) {
        const provider = element.provider;
        return `repo:${provider.id}`;
    }
    else if (isSCMInput(element)) {
        const provider = element.repository.provider;
        return `input:${provider.id}`;
    }
    else if (isSCMActionButton(element)) {
        const provider = element.repository.provider;
        return `actionButton:${provider.id}`;
    }
    else if (isSCMResource(element)) {
        const group = element.resourceGroup;
        const provider = group.provider;
        return `resource:${provider.id}/${group.id}/${element.sourceUri.toString()}`;
    }
    else {
        const provider = element.provider;
        return `group:${provider.id}/${element.id}`;
    }
}
class SCMResourceIdentityProvider {
    getId(element) {
        return getSCMResourceId(element);
    }
}
let SCMAccessibilityProvider = class SCMAccessibilityProvider {
    labelService;
    workspaceContextService;
    constructor(labelService, workspaceContextService) {
        this.labelService = labelService;
        this.workspaceContextService = workspaceContextService;
    }
    getWidgetAriaLabel() {
        return localize('scm', "Source Control Management");
    }
    getAriaLabel(element) {
        if (ResourceTree.isResourceNode(element)) {
            return this.labelService.getUriLabel(element.uri, { relative: true, noPrefix: true }) || element.name;
        }
        else if (isSCMRepository(element)) {
            let folderName = '';
            if (element.provider.rootUri) {
                const folder = this.workspaceContextService.getWorkspaceFolder(element.provider.rootUri);
                if (folder?.uri.toString() === element.provider.rootUri.toString()) {
                    folderName = folder.name;
                }
                else {
                    folderName = basename(element.provider.rootUri);
                }
            }
            return `${folderName} ${element.provider.label}`;
        }
        else if (isSCMInput(element)) {
            return localize('input', "Source Control Input");
        }
        else if (isSCMActionButton(element)) {
            return element.button?.command.title ?? '';
        }
        else if (isSCMResourceGroup(element)) {
            return element.label;
        }
        else {
            const result = [];
            result.push(basename(element.sourceUri));
            if (element.decorations.tooltip) {
                result.push(element.decorations.tooltip);
            }
            const path = this.labelService.getUriLabel(dirname(element.sourceUri), { relative: true, noPrefix: true });
            if (path) {
                result.push(path);
            }
            return result.join(', ');
        }
    }
};
SCMAccessibilityProvider = __decorate([
    __param(0, ILabelService),
    __param(1, IWorkspaceContextService)
], SCMAccessibilityProvider);
export { SCMAccessibilityProvider };
function isRepositoryItem(item) {
    return Array.isArray(item.groupItems);
}
function asTreeElement(node, forceIncompressible, viewState) {
    const element = (node.childrenCount === 0 && node.element) ? node.element : node;
    const collapsed = viewState ? viewState.collapsed.indexOf(getSCMResourceId(element)) > -1 : false;
    return {
        element,
        children: Iterable.map(node.children, node => asTreeElement(node, false, viewState)),
        incompressible: !!node.element || forceIncompressible,
        collapsed,
        collapsible: node.childrenCount > 0
    };
}
var ViewModelMode;
(function (ViewModelMode) {
    ViewModelMode["List"] = "list";
    ViewModelMode["Tree"] = "tree";
})(ViewModelMode || (ViewModelMode = {}));
var ViewModelSortKey;
(function (ViewModelSortKey) {
    ViewModelSortKey["Path"] = "path";
    ViewModelSortKey["Name"] = "name";
    ViewModelSortKey["Status"] = "status";
})(ViewModelSortKey || (ViewModelSortKey = {}));
const Menus = {
    ViewSort: new MenuId('SCMViewSort'),
    Repositories: new MenuId('SCMRepositories'),
};
const ContextKeys = {
    ViewModelMode: new RawContextKey('scmViewModelMode', "list" /* ViewModelMode.List */),
    ViewModelSortKey: new RawContextKey('scmViewModelSortKey', "path" /* ViewModelSortKey.Path */),
    ViewModelAreAllRepositoriesCollapsed: new RawContextKey('scmViewModelAreAllRepositoriesCollapsed', false),
    ViewModelIsAnyRepositoryCollapsible: new RawContextKey('scmViewModelIsAnyRepositoryCollapsible', false),
    SCMProvider: new RawContextKey('scmProvider', undefined),
    SCMProviderRootUri: new RawContextKey('scmProviderRootUri', undefined),
    SCMProviderHasRootUri: new RawContextKey('scmProviderHasRootUri', undefined),
    RepositoryCount: new RawContextKey('scmRepositoryCount', 0),
    RepositoryVisibilityCount: new RawContextKey('scmRepositoryVisibleCount', 0),
    RepositoryVisibility(repository) {
        return new RawContextKey(`scmRepositoryVisible:${repository.provider.id}`, false);
    }
};
MenuRegistry.appendMenuItem(MenuId.SCMTitle, {
    title: localize('sortAction', "View & Sort"),
    submenu: Menus.ViewSort,
    when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0)),
    group: '0_view&sort'
});
MenuRegistry.appendMenuItem(Menus.ViewSort, {
    title: localize('repositories', "Repositories"),
    submenu: Menus.Repositories,
    group: '0_repositories'
});
class RepositoryVisibilityAction extends Action2 {
    repository;
    constructor(repository) {
        const title = repository.provider.rootUri ? basename(repository.provider.rootUri) : repository.provider.label;
        super({
            id: `workbench.scm.action.toggleRepositoryVisibility.${repository.provider.id}`,
            title,
            f1: false,
            precondition: ContextKeyExpr.or(ContextKeys.RepositoryVisibilityCount.notEqualsTo(1), ContextKeys.RepositoryVisibility(repository).isEqualTo(false)),
            toggled: ContextKeys.RepositoryVisibility(repository).isEqualTo(true),
            menu: { id: Menus.Repositories, group: '0_repositories' }
        });
        this.repository = repository;
    }
    run(accessor) {
        const scmViewService = accessor.get(ISCMViewService);
        scmViewService.toggleVisibility(this.repository);
    }
}
let RepositoryVisibilityActionController = class RepositoryVisibilityActionController {
    scmViewService;
    contextKeyService;
    items = new Map();
    repositoryCountContextKey;
    repositoryVisibilityCountContextKey;
    disposables = new DisposableStore();
    constructor(scmViewService, scmService, contextKeyService) {
        this.scmViewService = scmViewService;
        this.contextKeyService = contextKeyService;
        this.repositoryCountContextKey = ContextKeys.RepositoryCount.bindTo(contextKeyService);
        this.repositoryVisibilityCountContextKey = ContextKeys.RepositoryVisibilityCount.bindTo(contextKeyService);
        scmViewService.onDidChangeVisibleRepositories(this.onDidChangeVisibleRepositories, this, this.disposables);
        scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
        scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
        for (const repository of scmService.repositories) {
            this.onDidAddRepository(repository);
        }
    }
    onDidAddRepository(repository) {
        const action = registerAction2(class extends RepositoryVisibilityAction {
            constructor() {
                super(repository);
            }
        });
        const contextKey = ContextKeys.RepositoryVisibility(repository).bindTo(this.contextKeyService);
        contextKey.set(this.scmViewService.isVisible(repository));
        this.items.set(repository, {
            contextKey,
            dispose() {
                contextKey.reset();
                action.dispose();
            }
        });
        this.updateRepositoriesCounts();
    }
    onDidRemoveRepository(repository) {
        this.items.get(repository)?.dispose();
        this.items.delete(repository);
        this.updateRepositoriesCounts();
    }
    onDidChangeVisibleRepositories() {
        let count = 0;
        for (const [repository, item] of this.items) {
            const isVisible = this.scmViewService.isVisible(repository);
            item.contextKey.set(isVisible);
            if (isVisible) {
                count++;
            }
        }
        this.repositoryCountContextKey.set(this.items.size);
        this.repositoryVisibilityCountContextKey.set(count);
    }
    updateRepositoriesCounts() {
        this.repositoryCountContextKey.set(this.items.size);
        this.repositoryVisibilityCountContextKey.set(Iterable.reduce(this.items.keys(), (r, repository) => r + (this.scmViewService.isVisible(repository) ? 1 : 0), 0));
    }
    dispose() {
        this.disposables.dispose();
        dispose(this.items.values());
        this.items.clear();
    }
};
RepositoryVisibilityActionController = __decorate([
    __param(0, ISCMViewService),
    __param(1, ISCMService),
    __param(2, IContextKeyService)
], RepositoryVisibilityActionController);
let ViewModel = class ViewModel {
    tree;
    inputRenderer;
    instantiationService;
    editorService;
    configurationService;
    scmViewService;
    storageService;
    uriIdentityService;
    _onDidChangeMode = new Emitter();
    onDidChangeMode = this._onDidChangeMode.event;
    _onDidChangeSortKey = new Emitter();
    onDidChangeSortKey = this._onDidChangeSortKey.event;
    visible = false;
    get mode() { return this._mode; }
    set mode(mode) {
        if (this._mode === mode) {
            return;
        }
        this._mode = mode;
        for (const [, item] of this.items) {
            for (const groupItem of item.groupItems) {
                groupItem.tree.clear();
                if (mode === "tree" /* ViewModelMode.Tree */) {
                    for (const resource of groupItem.resources) {
                        groupItem.tree.add(resource.sourceUri, resource);
                    }
                }
            }
        }
        // Update sort key based on view mode
        this.sortKey = this.getViewModelSortKey();
        this.refresh();
        this._onDidChangeMode.fire(mode);
        this.modeContextKey.set(mode);
        this.storageService.store(`scm.viewMode`, mode, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
    }
    get sortKey() { return this._sortKey; }
    set sortKey(sortKey) {
        if (this._sortKey === sortKey) {
            return;
        }
        this._sortKey = sortKey;
        this.refresh();
        this._onDidChangeSortKey.fire(sortKey);
        this.sortKeyContextKey.set(sortKey);
        if (this._mode === "list" /* ViewModelMode.List */) {
            this.storageService.store(`scm.viewSortKey`, sortKey, 1 /* StorageScope.WORKSPACE */, 0 /* StorageTarget.USER */);
        }
    }
    _treeViewStateIsStale = false;
    get treeViewState() {
        if (this.visible && this._treeViewStateIsStale) {
            this.updateViewState();
            this._treeViewStateIsStale = false;
        }
        return this._treeViewState;
    }
    items = new Map();
    visibilityDisposables = new DisposableStore();
    scrollTop;
    alwaysShowRepositories = false;
    showActionButton = false;
    firstVisible = true;
    disposables = new DisposableStore();
    modeContextKey;
    sortKeyContextKey;
    areAllRepositoriesCollapsedContextKey;
    isAnyRepositoryCollapsibleContextKey;
    scmProviderContextKey;
    scmProviderRootUriContextKey;
    scmProviderHasRootUriContextKey;
    _mode;
    _sortKey;
    _treeViewState;
    constructor(tree, inputRenderer, instantiationService, editorService, configurationService, scmViewService, storageService, uriIdentityService, contextKeyService) {
        this.tree = tree;
        this.inputRenderer = inputRenderer;
        this.instantiationService = instantiationService;
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.scmViewService = scmViewService;
        this.storageService = storageService;
        this.uriIdentityService = uriIdentityService;
        // View mode and sort key
        this._mode = this.getViewModelMode();
        this._sortKey = this.getViewModelSortKey();
        // TreeView state
        const storageViewState = this.storageService.get(`scm.viewState`, 1 /* StorageScope.WORKSPACE */);
        if (storageViewState) {
            try {
                this._treeViewState = JSON.parse(storageViewState);
            }
            catch { /* noop */ }
        }
        this.modeContextKey = ContextKeys.ViewModelMode.bindTo(contextKeyService);
        this.modeContextKey.set(this._mode);
        this.sortKeyContextKey = ContextKeys.ViewModelSortKey.bindTo(contextKeyService);
        this.sortKeyContextKey.set(this._sortKey);
        this.areAllRepositoriesCollapsedContextKey = ContextKeys.ViewModelAreAllRepositoriesCollapsed.bindTo(contextKeyService);
        this.isAnyRepositoryCollapsibleContextKey = ContextKeys.ViewModelIsAnyRepositoryCollapsible.bindTo(contextKeyService);
        this.scmProviderContextKey = ContextKeys.SCMProvider.bindTo(contextKeyService);
        this.scmProviderRootUriContextKey = ContextKeys.SCMProviderRootUri.bindTo(contextKeyService);
        this.scmProviderHasRootUriContextKey = ContextKeys.SCMProviderHasRootUri.bindTo(contextKeyService);
        configurationService.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this.disposables);
        this.onDidChangeConfiguration();
        Event.filter(this.tree.onDidChangeCollapseState, e => isSCMRepository(e.node.element), this.disposables)(this.updateRepositoryCollapseAllContextKeys, this, this.disposables);
        this.disposables.add(this.tree.onDidChangeCollapseState(() => this._treeViewStateIsStale = true));
        this.storageService.onWillSaveState(e => {
            if (e.reason === WillSaveStateReason.SHUTDOWN) {
                this.storageService.store(`scm.viewState`, JSON.stringify(this.treeViewState), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        });
    }
    onDidChangeConfiguration(e) {
        if (!e || e.affectsConfiguration('scm.alwaysShowRepositories') || e.affectsConfiguration('scm.showActionButton')) {
            this.alwaysShowRepositories = this.configurationService.getValue('scm.alwaysShowRepositories');
            this.showActionButton = this.configurationService.getValue('scm.showActionButton');
            this.refresh();
        }
    }
    _onDidChangeVisibleRepositories({ added, removed }) {
        for (const repository of added) {
            const disposable = combinedDisposable(repository.provider.groups.onDidSplice(splice => this._onDidSpliceGroups(item, splice)), repository.input.onDidChangeVisibility(() => this.refresh(item)), repository.provider.onDidChange(() => {
                if (this.showActionButton) {
                    this.refresh(item);
                }
            }));
            const groupItems = repository.provider.groups.elements.map(group => this.createGroupItem(group));
            const item = {
                element: repository, groupItems, dispose() {
                    dispose(this.groupItems);
                    disposable.dispose();
                }
            };
            this.items.set(repository, item);
        }
        for (const repository of removed) {
            const item = this.items.get(repository);
            item.dispose();
            this.items.delete(repository);
        }
        this.refresh();
    }
    _onDidSpliceGroups(item, { start, deleteCount, toInsert }) {
        const itemsToInsert = toInsert.map(group => this.createGroupItem(group));
        const itemsToDispose = item.groupItems.splice(start, deleteCount, ...itemsToInsert);
        for (const item of itemsToDispose) {
            item.dispose();
        }
        this.refresh();
    }
    createGroupItem(group) {
        const tree = new ResourceTree(group, group.provider.rootUri || URI.file('/'), this.uriIdentityService.extUri);
        const resources = [...group.elements];
        const disposable = combinedDisposable(group.onDidChange(() => this.tree.refilter()), group.onDidSplice(splice => this._onDidSpliceGroup(item, splice)));
        const item = { element: group, resources, tree, dispose() { disposable.dispose(); } };
        if (this._mode === "tree" /* ViewModelMode.Tree */) {
            for (const resource of resources) {
                item.tree.add(resource.sourceUri, resource);
            }
        }
        return item;
    }
    _onDidSpliceGroup(item, { start, deleteCount, toInsert }) {
        const before = item.resources.length;
        const deleted = item.resources.splice(start, deleteCount, ...toInsert);
        const after = item.resources.length;
        if (this._mode === "tree" /* ViewModelMode.Tree */) {
            for (const resource of deleted) {
                item.tree.delete(resource.sourceUri);
            }
            for (const resource of toInsert) {
                item.tree.add(resource.sourceUri, resource);
            }
        }
        if (before !== after && (before === 0 || after === 0)) {
            this.refresh();
        }
        else {
            this.refresh(item);
        }
    }
    setVisible(visible) {
        if (visible) {
            this.visibilityDisposables = new DisposableStore();
            this.scmViewService.onDidChangeVisibleRepositories(this._onDidChangeVisibleRepositories, this, this.visibilityDisposables);
            this._onDidChangeVisibleRepositories({ added: this.scmViewService.visibleRepositories, removed: Iterable.empty() });
            if (typeof this.scrollTop === 'number') {
                this.tree.scrollTop = this.scrollTop;
                this.scrollTop = undefined;
            }
            this.editorService.onDidActiveEditorChange(this.onDidActiveEditorChange, this, this.visibilityDisposables);
            this.onDidActiveEditorChange();
        }
        else {
            this.updateViewState();
            this.visibilityDisposables.dispose();
            this._onDidChangeVisibleRepositories({ added: Iterable.empty(), removed: [...this.items.keys()] });
            this.scrollTop = this.tree.scrollTop;
        }
        this.visible = visible;
        this.updateRepositoryCollapseAllContextKeys();
    }
    refresh(item) {
        if (!this.alwaysShowRepositories && this.items.size === 1) {
            const provider = Iterable.first(this.items.values()).element.provider;
            this.scmProviderContextKey.set(provider.contextValue);
            this.scmProviderRootUriContextKey.set(provider.rootUri?.toString());
            this.scmProviderHasRootUriContextKey.set(!!provider.rootUri);
        }
        else {
            this.scmProviderContextKey.set(undefined);
            this.scmProviderRootUriContextKey.set(undefined);
            this.scmProviderHasRootUriContextKey.set(false);
        }
        const focusedInput = this.inputRenderer.getFocusedInput();
        if (!this.alwaysShowRepositories && (this.items.size === 1 && (!item || isRepositoryItem(item)))) {
            const item = Iterable.first(this.items.values());
            this.tree.setChildren(null, this.render(item, this.treeViewState).children);
        }
        else if (item) {
            this.tree.setChildren(item.element, this.render(item, this.treeViewState).children);
        }
        else {
            const items = coalesce(this.scmViewService.visibleRepositories.map(r => this.items.get(r)));
            this.tree.setChildren(null, items.map(item => this.render(item, this.treeViewState)));
        }
        if (focusedInput) {
            this.inputRenderer.getRenderedInputWidget(focusedInput)?.focus();
        }
        this.updateRepositoryCollapseAllContextKeys();
    }
    render(item, treeViewState) {
        if (isRepositoryItem(item)) {
            const children = [];
            const hasSomeChanges = item.groupItems.some(item => item.element.elements.length > 0);
            if (item.element.input.visible) {
                children.push({ element: item.element.input, incompressible: true, collapsible: false });
            }
            if (hasSomeChanges || (this.items.size === 1 && (!this.showActionButton || !item.element.provider.actionButton))) {
                children.push(...item.groupItems.map(i => this.render(i, treeViewState)));
            }
            if (this.showActionButton && item.element.provider.actionButton) {
                const button = {
                    element: {
                        type: 'actionButton',
                        repository: item.element,
                        button: item.element.provider.actionButton,
                    },
                    incompressible: true,
                    collapsible: false
                };
                children.push(button);
            }
            const collapsed = treeViewState ? treeViewState.collapsed.indexOf(getSCMResourceId(item.element)) > -1 : false;
            return { element: item.element, children, incompressible: true, collapsed, collapsible: true };
        }
        else {
            const children = this.mode === "list" /* ViewModelMode.List */
                ? Iterable.map(item.resources, element => ({ element, incompressible: true }))
                : Iterable.map(item.tree.root.children, node => asTreeElement(node, true, treeViewState));
            const collapsed = treeViewState ? treeViewState.collapsed.indexOf(getSCMResourceId(item.element)) > -1 : false;
            return { element: item.element, children, incompressible: true, collapsed, collapsible: true };
        }
    }
    updateViewState() {
        const collapsed = [];
        const visit = (node) => {
            if (node.element && node.collapsible && node.collapsed) {
                collapsed.push(getSCMResourceId(node.element));
            }
            for (const child of node.children) {
                visit(child);
            }
        };
        visit(this.tree.getNode());
        this._treeViewState = { collapsed };
    }
    onDidActiveEditorChange() {
        if (!this.configurationService.getValue('scm.autoReveal')) {
            return;
        }
        if (this.firstVisible) {
            this.firstVisible = false;
            this.visibilityDisposables.add(disposableTimeout(() => this.onDidActiveEditorChange(), 250));
            return;
        }
        const uri = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor, { supportSideBySide: SideBySideEditor.PRIMARY });
        if (!uri) {
            return;
        }
        for (const repository of this.scmViewService.visibleRepositories) {
            const item = this.items.get(repository);
            if (!item) {
                continue;
            }
            // go backwards from last group
            for (let j = item.groupItems.length - 1; j >= 0; j--) {
                const groupItem = item.groupItems[j];
                const resource = this.mode === "tree" /* ViewModelMode.Tree */
                    ? groupItem.tree.getNode(uri)?.element
                    : groupItem.resources.find(r => this.uriIdentityService.extUri.isEqual(r.sourceUri, uri));
                if (resource) {
                    this.tree.reveal(resource);
                    this.tree.setSelection([resource]);
                    this.tree.setFocus([resource]);
                    return;
                }
            }
        }
    }
    focus() {
        if (this.tree.getFocus().length === 0) {
            for (const repository of this.scmViewService.visibleRepositories) {
                const widget = this.inputRenderer.getRenderedInputWidget(repository.input);
                if (widget) {
                    widget.focus();
                    return;
                }
            }
        }
        this.tree.domFocus();
    }
    updateRepositoryCollapseAllContextKeys() {
        if (!this.visible || this.scmViewService.visibleRepositories.length === 1) {
            this.isAnyRepositoryCollapsibleContextKey.set(false);
            this.areAllRepositoriesCollapsedContextKey.set(false);
            return;
        }
        this.isAnyRepositoryCollapsibleContextKey.set(this.scmViewService.visibleRepositories.some(r => this.tree.hasElement(r) && this.tree.isCollapsible(r)));
        this.areAllRepositoriesCollapsedContextKey.set(this.scmViewService.visibleRepositories.every(r => this.tree.hasElement(r) && (!this.tree.isCollapsible(r) || this.tree.isCollapsed(r))));
    }
    collapseAllRepositories() {
        for (const repository of this.scmViewService.visibleRepositories) {
            if (this.tree.isCollapsible(repository)) {
                this.tree.collapse(repository);
            }
        }
    }
    expandAllRepositories() {
        for (const repository of this.scmViewService.visibleRepositories) {
            if (this.tree.isCollapsible(repository)) {
                this.tree.expand(repository);
            }
        }
    }
    getViewModelMode() {
        let mode = this.configurationService.getValue('scm.defaultViewMode') === 'list' ? "list" /* ViewModelMode.List */ : "tree" /* ViewModelMode.Tree */;
        const storageMode = this.storageService.get(`scm.viewMode`, 1 /* StorageScope.WORKSPACE */);
        if (typeof storageMode === 'string') {
            mode = storageMode;
        }
        return mode;
    }
    getViewModelSortKey() {
        // Tree
        if (this._mode === "tree" /* ViewModelMode.Tree */) {
            return "path" /* ViewModelSortKey.Path */;
        }
        // List
        let viewSortKey;
        const viewSortKeyString = this.configurationService.getValue('scm.defaultViewSortKey');
        switch (viewSortKeyString) {
            case 'name':
                viewSortKey = "name" /* ViewModelSortKey.Name */;
                break;
            case 'status':
                viewSortKey = "status" /* ViewModelSortKey.Status */;
                break;
            default:
                viewSortKey = "path" /* ViewModelSortKey.Path */;
                break;
        }
        const storageSortKey = this.storageService.get(`scm.viewSortKey`, 1 /* StorageScope.WORKSPACE */);
        if (typeof storageSortKey === 'string') {
            viewSortKey = storageSortKey;
        }
        return viewSortKey;
    }
    dispose() {
        this.visibilityDisposables.dispose();
        this.disposables.dispose();
        dispose(this.items.values());
        this.items.clear();
    }
};
ViewModel = __decorate([
    __param(2, IInstantiationService),
    __param(3, IEditorService),
    __param(4, IConfigurationService),
    __param(5, ISCMViewService),
    __param(6, IStorageService),
    __param(7, IUriIdentityService),
    __param(8, IContextKeyService)
], ViewModel);
class SetListViewModeAction extends ViewAction {
    constructor(menu = {}) {
        super({
            id: 'workbench.scm.action.setListViewMode',
            title: localize('setListViewMode', "View as List"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.listTree,
            toggled: ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */),
            menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
        });
    }
    async runInView(_, view) {
        view.viewModel.mode = "list" /* ViewModelMode.List */;
    }
}
class SetListViewModeNavigationAction extends SetListViewModeAction {
    constructor() {
        super({
            id: MenuId.SCMTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("tree" /* ViewModelMode.Tree */)),
            group: 'navigation',
            order: -1000
        });
    }
}
class SetTreeViewModeAction extends ViewAction {
    constructor(menu = {}) {
        super({
            id: 'workbench.scm.action.setTreeViewMode',
            title: localize('setTreeViewMode', "View as Tree"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.listFlat,
            toggled: ContextKeys.ViewModelMode.isEqualTo("tree" /* ViewModelMode.Tree */),
            menu: { id: Menus.ViewSort, group: '1_viewmode', ...menu }
        });
    }
    async runInView(_, view) {
        view.viewModel.mode = "tree" /* ViewModelMode.Tree */;
    }
}
class SetTreeViewModeNavigationAction extends SetTreeViewModeAction {
    constructor() {
        super({
            id: MenuId.SCMTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.RepositoryCount.notEqualsTo(0), ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */)),
            group: 'navigation',
            order: -1000
        });
    }
}
registerAction2(SetListViewModeAction);
registerAction2(SetTreeViewModeAction);
registerAction2(SetListViewModeNavigationAction);
registerAction2(SetTreeViewModeNavigationAction);
class RepositorySortAction extends ViewAction {
    sortKey;
    constructor(sortKey, title) {
        super({
            id: `workbench.scm.action.repositories.setSortKey.${sortKey}`,
            title,
            viewId: VIEW_PANE_ID,
            f1: false,
            toggled: RepositoryContextKeys.RepositorySortKey.isEqualTo(sortKey),
            menu: [
                {
                    id: Menus.Repositories,
                    group: '1_sort'
                },
                {
                    id: MenuId.ViewTitle,
                    when: ContextKeyExpr.equals('view', REPOSITORIES_VIEW_PANE_ID),
                    group: '1_sort',
                },
            ]
        });
        this.sortKey = sortKey;
    }
    runInView(accessor) {
        accessor.get(ISCMViewService).toggleSortKey(this.sortKey);
    }
}
class RepositorySortByDiscoveryTimeAction extends RepositorySortAction {
    constructor() {
        super("discoveryTime" /* ISCMRepositorySortKey.DiscoveryTime */, localize('repositorySortByDiscoveryTime', "Sort by Discovery Time"));
    }
}
class RepositorySortByNameAction extends RepositorySortAction {
    constructor() {
        super("name" /* ISCMRepositorySortKey.Name */, localize('repositorySortByName', "Sort by Name"));
    }
}
class RepositorySortByPathAction extends RepositorySortAction {
    constructor() {
        super("path" /* ISCMRepositorySortKey.Path */, localize('repositorySortByPath', "Sort by Path"));
    }
}
registerAction2(RepositorySortByDiscoveryTimeAction);
registerAction2(RepositorySortByNameAction);
registerAction2(RepositorySortByPathAction);
class SetSortKeyAction extends ViewAction {
    sortKey;
    constructor(sortKey, title) {
        super({
            id: `workbench.scm.action.setSortKey.${sortKey}`,
            title,
            viewId: VIEW_PANE_ID,
            f1: false,
            toggled: ContextKeys.ViewModelSortKey.isEqualTo(sortKey),
            precondition: ContextKeys.ViewModelMode.isEqualTo("list" /* ViewModelMode.List */),
            menu: { id: Menus.ViewSort, group: '2_sort' }
        });
        this.sortKey = sortKey;
    }
    async runInView(_, view) {
        view.viewModel.sortKey = this.sortKey;
    }
}
class SetSortByNameAction extends SetSortKeyAction {
    constructor() {
        super("name" /* ViewModelSortKey.Name */, localize('sortChangesByName', "Sort Changes by Name"));
    }
}
class SetSortByPathAction extends SetSortKeyAction {
    constructor() {
        super("path" /* ViewModelSortKey.Path */, localize('sortChangesByPath', "Sort Changes by Path"));
    }
}
class SetSortByStatusAction extends SetSortKeyAction {
    constructor() {
        super("status" /* ViewModelSortKey.Status */, localize('sortChangesByStatus', "Sort Changes by Status"));
    }
}
registerAction2(SetSortByNameAction);
registerAction2(SetSortByPathAction);
registerAction2(SetSortByStatusAction);
class CollapseAllRepositoriesAction extends ViewAction {
    constructor() {
        super({
            id: `workbench.scm.action.collapseAllRepositories`,
            title: localize('collapse all', "Collapse All Repositories"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.collapseAll,
            menu: {
                id: MenuId.SCMTitle,
                group: 'navigation',
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(false))
            }
        });
    }
    async runInView(_, view) {
        view.viewModel.collapseAllRepositories();
    }
}
class ExpandAllRepositoriesAction extends ViewAction {
    constructor() {
        super({
            id: `workbench.scm.action.expandAllRepositories`,
            title: localize('expand all', "Expand All Repositories"),
            viewId: VIEW_PANE_ID,
            f1: false,
            icon: Codicon.expandAll,
            menu: {
                id: MenuId.SCMTitle,
                group: 'navigation',
                when: ContextKeyExpr.and(ContextKeyExpr.equals('view', VIEW_PANE_ID), ContextKeys.ViewModelIsAnyRepositoryCollapsible.isEqualTo(true), ContextKeys.ViewModelAreAllRepositoriesCollapsed.isEqualTo(true))
            }
        });
    }
    async runInView(_, view) {
        view.viewModel.expandAllRepositories();
    }
}
registerAction2(CollapseAllRepositoriesAction);
registerAction2(ExpandAllRepositoriesAction);
let SCMInputWidget = class SCMInputWidget {
    modelService;
    languageService;
    keybindingService;
    configurationService;
    instantiationService;
    scmViewService;
    contextViewService;
    openerService;
    static ValidationTimeouts = {
        [2 /* InputValidationType.Information */]: 5000,
        [1 /* InputValidationType.Warning */]: 8000,
        [0 /* InputValidationType.Error */]: 10000
    };
    defaultInputFontFamily = DEFAULT_FONT_FAMILY;
    element;
    editorContainer;
    placeholderTextContainer;
    inputEditor;
    disposables = new DisposableStore();
    model;
    repositoryIdContextKey;
    repositoryDisposables = new DisposableStore();
    validation;
    validationDisposable = Disposable.None;
    validationHasFocus = false;
    _validationTimer;
    // This is due to "Setup height change listener on next tick" above
    // https://github.com/microsoft/vscode/issues/108067
    lastLayoutWasTrash = false;
    shouldFocusAfterLayout = false;
    onDidChangeContentHeight;
    get input() {
        return this.model?.input;
    }
    set input(input) {
        if (input === this.input) {
            return;
        }
        this.clearValidation();
        this.editorContainer.classList.remove('synthetic-focus');
        this.repositoryDisposables.dispose();
        this.repositoryDisposables = new DisposableStore();
        this.repositoryIdContextKey.set(input?.repository.id);
        if (!input) {
            this.model?.textModel.dispose();
            this.inputEditor.setModel(undefined);
            this.model = undefined;
            return;
        }
        let query;
        if (input.repository.provider.rootUri) {
            query = `rootUri=${encodeURIComponent(input.repository.provider.rootUri.toString())}`;
        }
        const uri = URI.from({
            scheme: Schemas.vscodeSourceControl,
            path: `${input.repository.provider.contextValue}/${input.repository.provider.id}/input`,
            query
        });
        if (this.configurationService.getValue('editor.wordBasedSuggestions', { resource: uri }) !== false) {
            this.configurationService.updateValue('editor.wordBasedSuggestions', false, { resource: uri }, 8 /* ConfigurationTarget.MEMORY */);
        }
        const textModel = this.modelService.getModel(uri) ?? this.modelService.createModel('', this.languageService.createById('scminput'), uri);
        this.inputEditor.setModel(textModel);
        // Validation
        const validationDelayer = new ThrottledDelayer(200);
        const validate = async () => {
            const position = this.inputEditor.getSelection()?.getStartPosition();
            const offset = position && textModel.getOffsetAt(position);
            const value = textModel.getValue();
            this.setValidation(await input.validateInput(value, offset || 0));
        };
        const triggerValidation = () => validationDelayer.trigger(validate);
        this.repositoryDisposables.add(validationDelayer);
        this.repositoryDisposables.add(this.inputEditor.onDidChangeCursorPosition(triggerValidation));
        // Adaptive indentation rules
        const opts = this.modelService.getCreationOptions(textModel.getLanguageId(), textModel.uri, textModel.isForSimpleWidget);
        const onEnter = Event.filter(this.inputEditor.onKeyDown, e => e.keyCode === 3 /* KeyCode.Enter */, this.repositoryDisposables);
        this.repositoryDisposables.add(onEnter(() => textModel.detectIndentation(opts.insertSpaces, opts.tabSize)));
        // Keep model in sync with API
        textModel.setValue(input.value);
        this.repositoryDisposables.add(input.onDidChange(({ value, reason }) => {
            if (value === textModel.getValue()) { // circuit breaker
                return;
            }
            textModel.setValue(value);
            const position = reason === SCMInputChangeReason.HistoryPrevious
                ? textModel.getFullModelRange().getStartPosition()
                : textModel.getFullModelRange().getEndPosition();
            this.inputEditor.setPosition(position);
            this.inputEditor.revealPositionInCenterIfOutsideViewport(position);
        }));
        this.repositoryDisposables.add(input.onDidChangeFocus(() => this.focus()));
        this.repositoryDisposables.add(input.onDidChangeValidationMessage((e) => this.setValidation(e, { focus: true, timeout: true })));
        this.repositoryDisposables.add(input.onDidChangeValidateInput((e) => triggerValidation()));
        // Keep API in sync with model, update placeholder visibility and validate
        const updatePlaceholderVisibility = () => this.placeholderTextContainer.classList.toggle('hidden', textModel.getValueLength() > 0);
        this.repositoryDisposables.add(textModel.onDidChangeContent(() => {
            input.setValue(textModel.getValue(), true);
            updatePlaceholderVisibility();
            triggerValidation();
        }));
        updatePlaceholderVisibility();
        // Update placeholder text
        const updatePlaceholderText = () => {
            const binding = this.keybindingService.lookupKeybinding('scm.acceptInput');
            const label = binding ? binding.getLabel() : (platform.isMacintosh ? 'Cmd+Enter' : 'Ctrl+Enter');
            const placeholderText = format(input.placeholder, label);
            this.inputEditor.updateOptions({ ariaLabel: placeholderText });
            this.placeholderTextContainer.textContent = placeholderText;
        };
        this.repositoryDisposables.add(input.onDidChangePlaceholder(updatePlaceholderText));
        this.repositoryDisposables.add(this.keybindingService.onDidUpdateKeybindings(updatePlaceholderText));
        updatePlaceholderText();
        // Update input template
        let commitTemplate = '';
        const updateTemplate = () => {
            if (typeof input.repository.provider.commitTemplate === 'undefined' || !input.visible) {
                return;
            }
            const oldCommitTemplate = commitTemplate;
            commitTemplate = input.repository.provider.commitTemplate;
            const value = textModel.getValue();
            if (value && value !== oldCommitTemplate) {
                return;
            }
            textModel.setValue(commitTemplate);
        };
        this.repositoryDisposables.add(input.repository.provider.onDidChangeCommitTemplate(updateTemplate, this));
        updateTemplate();
        // Update input enablement
        const updateEnablement = (enabled) => {
            this.inputEditor.updateOptions({ readOnly: !enabled });
        };
        this.repositoryDisposables.add(input.onDidChangeEnablement(enabled => updateEnablement(enabled)));
        updateEnablement(input.enabled);
        // Save model
        this.model = { input, textModel };
    }
    get selections() {
        return this.inputEditor.getSelections();
    }
    set selections(selections) {
        if (selections) {
            this.inputEditor.setSelections(selections);
        }
    }
    setValidation(validation, options) {
        if (this._validationTimer) {
            clearTimeout(this._validationTimer);
            this._validationTimer = 0;
        }
        this.validation = validation;
        this.renderValidation();
        if (options?.focus && !this.hasFocus()) {
            this.focus();
        }
        if (validation && options?.timeout) {
            this._validationTimer = setTimeout(() => this.setValidation(undefined), SCMInputWidget.ValidationTimeouts[validation.type]);
        }
    }
    constructor(container, overflowWidgetsDomNode, contextKeyService, modelService, languageService, keybindingService, configurationService, instantiationService, scmViewService, contextViewService, openerService) {
        this.modelService = modelService;
        this.languageService = languageService;
        this.keybindingService = keybindingService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.scmViewService = scmViewService;
        this.contextViewService = contextViewService;
        this.openerService = openerService;
        this.element = append(container, $('.scm-editor'));
        this.editorContainer = append(this.element, $('.scm-editor-container'));
        this.placeholderTextContainer = append(this.editorContainer, $('.scm-editor-placeholder'));
        const fontFamily = this.getInputEditorFontFamily();
        const fontSize = this.getInputEditorFontSize();
        const lineHeight = this.computeLineHeight(fontSize);
        // We respect the configured `editor.accessibilitySupport` setting to be able to have wrapping
        // even when a screen reader is attached.
        const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
        this.setPlaceholderFontStyles(fontFamily, fontSize, lineHeight);
        const contextKeyService2 = contextKeyService.createScoped(this.element);
        this.repositoryIdContextKey = contextKeyService2.createKey('scmRepository', undefined);
        const editorOptions = {
            ...getSimpleEditorOptions(),
            lineDecorationsWidth: 4,
            dragAndDrop: true,
            cursorWidth: 1,
            fontSize: fontSize,
            lineHeight: lineHeight,
            fontFamily: fontFamily,
            wrappingStrategy: 'advanced',
            wrappingIndent: 'none',
            padding: { top: 3, bottom: 3 },
            quickSuggestions: false,
            scrollbar: { alwaysConsumeMouseWheel: false },
            overflowWidgetsDomNode,
            renderWhitespace: 'none',
            dropIntoEditor: { enabled: true },
            accessibilitySupport
        };
        const codeEditorWidgetOptions = {
            isSimpleWidget: true,
            contributions: EditorExtensionsRegistry.getSomeEditorContributions([
                ColorDetector.ID,
                ContextMenuController.ID,
                DragAndDropController.ID,
                DropIntoEditorController.ID,
                LinkDetector.ID,
                MenuPreventer.ID,
                MessageController.ID,
                ModesHoverController.ID,
                SelectionClipboardContributionID,
                SnippetController2.ID,
                SuggestController.ID,
            ])
        };
        const services = new ServiceCollection([IContextKeyService, contextKeyService2]);
        const instantiationService2 = instantiationService.createChild(services);
        this.inputEditor = instantiationService2.createInstance(CodeEditorWidget, this.editorContainer, editorOptions, codeEditorWidgetOptions);
        this.disposables.add(this.inputEditor);
        this.disposables.add(this.inputEditor.onDidFocusEditorText(() => {
            if (this.input?.repository) {
                this.scmViewService.focus(this.input.repository);
            }
            this.editorContainer.classList.add('synthetic-focus');
            this.renderValidation();
        }));
        this.disposables.add(this.inputEditor.onDidBlurEditorText(() => {
            this.editorContainer.classList.remove('synthetic-focus');
            setTimeout(() => {
                if (!this.validation || !this.validationHasFocus) {
                    this.clearValidation();
                }
            }, 0);
        }));
        const firstLineKey = contextKeyService2.createKey('scmInputIsInFirstPosition', false);
        const lastLineKey = contextKeyService2.createKey('scmInputIsInLastPosition', false);
        this.disposables.add(this.inputEditor.onDidChangeCursorPosition(({ position }) => {
            const viewModel = this.inputEditor._getViewModel();
            const lastLineNumber = viewModel.getLineCount();
            const lastLineCol = viewModel.getLineContent(lastLineNumber).length + 1;
            const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(position);
            firstLineKey.set(viewPosition.lineNumber === 1 && viewPosition.column === 1);
            lastLineKey.set(viewPosition.lineNumber === lastLineNumber && viewPosition.column === lastLineCol);
        }));
        const relevantSettings = [
            'scm.inputFontFamily',
            'editor.fontFamily',
            'scm.inputFontSize',
            'editor.accessibilitySupport'
        ];
        const onInputFontFamilyChanged = Event.filter(this.configurationService.onDidChangeConfiguration, (e) => {
            for (const setting of relevantSettings) {
                if (e.affectsConfiguration(setting)) {
                    return true;
                }
            }
            return false;
        }, this.disposables);
        this.disposables.add(onInputFontFamilyChanged(() => {
            const fontFamily = this.getInputEditorFontFamily();
            const fontSize = this.getInputEditorFontSize();
            const lineHeight = this.computeLineHeight(fontSize);
            const accessibilitySupport = this.configurationService.getValue('editor.accessibilitySupport');
            this.inputEditor.updateOptions({
                fontFamily: fontFamily,
                fontSize: fontSize,
                lineHeight: lineHeight,
                accessibilitySupport
            });
            this.setPlaceholderFontStyles(fontFamily, fontSize, lineHeight);
        }));
        this.onDidChangeContentHeight = Event.signal(Event.filter(this.inputEditor.onDidContentSizeChange, e => e.contentHeightChanged, this.disposables));
    }
    getContentHeight() {
        const editorContentHeight = this.inputEditor.getContentHeight();
        return Math.min(editorContentHeight, 134);
    }
    layout() {
        const editorHeight = this.getContentHeight();
        const dimension = new Dimension(this.element.clientWidth - 2, editorHeight);
        if (dimension.width < 0) {
            this.lastLayoutWasTrash = true;
            return;
        }
        this.lastLayoutWasTrash = false;
        this.inputEditor.layout(dimension);
        this.renderValidation();
        if (this.shouldFocusAfterLayout) {
            this.shouldFocusAfterLayout = false;
            this.focus();
        }
    }
    focus() {
        if (this.lastLayoutWasTrash) {
            this.lastLayoutWasTrash = false;
            this.shouldFocusAfterLayout = true;
            return;
        }
        this.inputEditor.focus();
        this.editorContainer.classList.add('synthetic-focus');
    }
    hasFocus() {
        return this.inputEditor.hasTextFocus();
    }
    renderValidation() {
        this.clearValidation();
        this.editorContainer.classList.toggle('validation-info', this.validation?.type === 2 /* InputValidationType.Information */);
        this.editorContainer.classList.toggle('validation-warning', this.validation?.type === 1 /* InputValidationType.Warning */);
        this.editorContainer.classList.toggle('validation-error', this.validation?.type === 0 /* InputValidationType.Error */);
        if (!this.validation || !this.inputEditor.hasTextFocus()) {
            return;
        }
        const disposables = new DisposableStore();
        this.validationDisposable = this.contextViewService.showContextView({
            getAnchor: () => this.editorContainer,
            render: container => {
                const validationContainer = append(container, $('.scm-editor-validation-container'));
                validationContainer.classList.toggle('validation-info', this.validation.type === 2 /* InputValidationType.Information */);
                validationContainer.classList.toggle('validation-warning', this.validation.type === 1 /* InputValidationType.Warning */);
                validationContainer.classList.toggle('validation-error', this.validation.type === 0 /* InputValidationType.Error */);
                validationContainer.style.width = `${this.editorContainer.clientWidth}px`;
                const element = append(validationContainer, $('.scm-editor-validation'));
                const message = this.validation.message;
                if (typeof message === 'string') {
                    element.textContent = message;
                }
                else {
                    const tracker = trackFocus(element);
                    disposables.add(tracker);
                    disposables.add(tracker.onDidFocus(() => (this.validationHasFocus = true)));
                    disposables.add(tracker.onDidBlur(() => {
                        this.validationHasFocus = false;
                        this.contextViewService.hideContextView();
                    }));
                    const renderer = disposables.add(this.instantiationService.createInstance(MarkdownRenderer, {}));
                    const renderedMarkdown = renderer.render(message, {
                        actionHandler: {
                            callback: (link) => {
                                openLinkFromMarkdown(this.openerService, link, message.isTrusted);
                                this.contextViewService.hideContextView();
                            },
                            disposables: disposables
                        },
                    });
                    disposables.add(renderedMarkdown);
                    element.appendChild(renderedMarkdown.element);
                }
                const actionsContainer = append(validationContainer, $('.scm-editor-validation-actions'));
                const actionbar = new ActionBar(actionsContainer);
                const action = new Action('scmInputWidget.validationMessage.close', localize('label.close', "Close"), Codicon.close.classNames, true, () => {
                    this.contextViewService.hideContextView();
                });
                disposables.add(actionbar);
                actionbar.push(action, { icon: true, label: false });
                return Disposable.None;
            },
            onHide: () => {
                this.validationHasFocus = false;
                disposables.dispose();
            },
            anchorAlignment: 0 /* AnchorAlignment.LEFT */
        });
    }
    getInputEditorFontFamily() {
        const inputFontFamily = this.configurationService.getValue('scm.inputFontFamily').trim();
        if (inputFontFamily.toLowerCase() === 'editor') {
            return this.configurationService.getValue('editor.fontFamily').trim();
        }
        if (inputFontFamily.length !== 0 && inputFontFamily.toLowerCase() !== 'default') {
            return inputFontFamily;
        }
        return this.defaultInputFontFamily;
    }
    getInputEditorFontSize() {
        return this.configurationService.getValue('scm.inputFontSize');
    }
    computeLineHeight(fontSize) {
        return Math.round(fontSize * 1.5);
    }
    setPlaceholderFontStyles(fontFamily, fontSize, lineHeight) {
        this.placeholderTextContainer.style.fontFamily = fontFamily;
        this.placeholderTextContainer.style.fontSize = `${fontSize}px`;
        this.placeholderTextContainer.style.lineHeight = `${lineHeight}px`;
    }
    clearValidation() {
        this.validationDisposable.dispose();
        this.validationHasFocus = false;
    }
    dispose() {
        this.input = undefined;
        this.repositoryDisposables.dispose();
        this.clearValidation();
        this.disposables.dispose();
    }
};
SCMInputWidget = __decorate([
    __param(2, IContextKeyService),
    __param(3, IModelService),
    __param(4, ILanguageService),
    __param(5, IKeybindingService),
    __param(6, IConfigurationService),
    __param(7, IInstantiationService),
    __param(8, ISCMViewService),
    __param(9, IContextViewService),
    __param(10, IOpenerService)
], SCMInputWidget);
let SCMViewPane = class SCMViewPane extends ViewPane {
    scmService;
    scmViewService;
    commandService;
    editorService;
    menuService;
    _onDidLayout;
    layoutCache;
    listContainer;
    tree;
    _viewModel;
    get viewModel() { return this._viewModel; }
    listLabels;
    inputRenderer;
    actionButtonRenderer;
    disposables = new DisposableStore();
    constructor(options, scmService, scmViewService, keybindingService, themeService, contextMenuService, commandService, editorService, instantiationService, viewDescriptorService, configurationService, contextKeyService, menuService, openerService, telemetryService) {
        super({ ...options, titleMenuId: MenuId.SCMTitle }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
        this.scmService = scmService;
        this.scmViewService = scmViewService;
        this.commandService = commandService;
        this.editorService = editorService;
        this.menuService = menuService;
        this._onDidLayout = new Emitter();
        this.layoutCache = {
            height: undefined,
            width: undefined,
            onDidChange: this._onDidLayout.event
        };
        this._register(Event.any(this.scmService.onDidAddRepository, this.scmService.onDidRemoveRepository)(() => this._onDidChangeViewWelcomeState.fire()));
    }
    renderBody(container) {
        super.renderBody(container);
        // List
        this.listContainer = append(container, $('.scm-view.show-file-icons'));
        const overflowWidgetsDomNode = $('.scm-overflow-widgets-container.monaco-editor');
        const updateActionsVisibility = () => this.listContainer.classList.toggle('show-actions', this.configurationService.getValue('scm.alwaysShowActions'));
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowActions'), this.disposables)(updateActionsVisibility));
        updateActionsVisibility();
        const updateProviderCountVisibility = () => {
            const value = this.configurationService.getValue('scm.providerCountBadge');
            this.listContainer.classList.toggle('hide-provider-counts', value === 'hidden');
            this.listContainer.classList.toggle('auto-provider-counts', value === 'auto');
        };
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.providerCountBadge'), this.disposables)(updateProviderCountVisibility));
        updateProviderCountVisibility();
        this.inputRenderer = this.instantiationService.createInstance(InputRenderer, this.layoutCache, overflowWidgetsDomNode, (input, height) => this.tree.updateElementHeight(input, height));
        const delegate = new ListDelegate(this.inputRenderer);
        this.actionButtonRenderer = this.instantiationService.createInstance(ActionButtonRenderer);
        this.listLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this.onDidChangeBodyVisibility });
        this._register(this.listLabels);
        const actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
        this._register(actionRunner);
        this._register(actionRunner.onWillRun(() => this.tree.domFocus()));
        const renderers = [
            this.instantiationService.createInstance(RepositoryRenderer, getActionViewItemProvider(this.instantiationService)),
            this.inputRenderer,
            this.actionButtonRenderer,
            this.instantiationService.createInstance(ResourceGroupRenderer, getActionViewItemProvider(this.instantiationService)),
            this._register(this.instantiationService.createInstance(ResourceRenderer, () => this._viewModel, this.listLabels, getActionViewItemProvider(this.instantiationService), actionRunner))
        ];
        const filter = new SCMTreeFilter();
        const sorter = new SCMTreeSorter(() => this._viewModel);
        const keyboardNavigationLabelProvider = this.instantiationService.createInstance(SCMTreeKeyboardNavigationLabelProvider, () => this._viewModel);
        const identityProvider = new SCMResourceIdentityProvider();
        this.tree = this.instantiationService.createInstance(WorkbenchCompressibleObjectTree, 'SCM Tree Repo', this.listContainer, delegate, renderers, {
            transformOptimization: false,
            identityProvider,
            horizontalScrolling: false,
            setRowLineHeight: false,
            filter,
            sorter,
            keyboardNavigationLabelProvider,
            overrideStyles: {
                listBackground: this.viewDescriptorService.getViewLocationById(this.id) === 1 /* ViewContainerLocation.Panel */ ? PANEL_BACKGROUND : SIDE_BAR_BACKGROUND
            },
            accessibilityProvider: this.instantiationService.createInstance(SCMAccessibilityProvider)
        });
        this._register(this.tree.onDidOpen(this.open, this));
        this._register(this.tree.onContextMenu(this.onListContextMenu, this));
        this._register(this.tree.onDidScroll(this.inputRenderer.clearValidation, this.inputRenderer));
        this._register(this.tree);
        append(this.listContainer, overflowWidgetsDomNode);
        this._register(this.instantiationService.createInstance(RepositoryVisibilityActionController));
        this._viewModel = this.instantiationService.createInstance(ViewModel, this.tree, this.inputRenderer);
        this._register(this._viewModel);
        this.listContainer.classList.add('file-icon-themable-tree');
        this.listContainer.classList.add('show-file-icons');
        this.updateIndentStyles(this.themeService.getFileIconTheme());
        this._register(this.themeService.onDidFileIconThemeChange(this.updateIndentStyles, this));
        this._register(this._viewModel.onDidChangeMode(this.onDidChangeMode, this));
        this._register(this.onDidChangeBodyVisibility(this._viewModel.setVisible, this._viewModel));
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.alwaysShowRepositories'), this.disposables)(this.updateActions, this));
        this.updateActions();
    }
    updateIndentStyles(theme) {
        this.listContainer.classList.toggle('list-view-mode', this._viewModel.mode === "list" /* ViewModelMode.List */);
        this.listContainer.classList.toggle('tree-view-mode', this._viewModel.mode === "tree" /* ViewModelMode.Tree */);
        this.listContainer.classList.toggle('align-icons-and-twisties', (this._viewModel.mode === "list" /* ViewModelMode.List */ && theme.hasFileIcons) || (theme.hasFileIcons && !theme.hasFolderIcons));
        this.listContainer.classList.toggle('hide-arrows', this._viewModel.mode === "tree" /* ViewModelMode.Tree */ && theme.hidesExplorerArrows === true);
    }
    onDidChangeMode() {
        this.updateIndentStyles(this.themeService.getFileIconTheme());
    }
    layoutBody(height = this.layoutCache.height, width = this.layoutCache.width) {
        if (height === undefined) {
            return;
        }
        if (width !== undefined) {
            super.layoutBody(height, width);
        }
        this.layoutCache.height = height;
        this.layoutCache.width = width;
        this._onDidLayout.fire();
        this.listContainer.style.height = `${height}px`;
        this.tree.layout(height, width);
    }
    focus() {
        super.focus();
        if (this.isExpanded()) {
            this._viewModel.focus();
        }
    }
    async open(e) {
        if (!e.element) {
            return;
        }
        else if (isSCMRepository(e.element)) {
            this.scmViewService.focus(e.element);
            return;
        }
        else if (isSCMResourceGroup(e.element)) {
            const provider = e.element.provider;
            const repository = Iterable.find(this.scmService.repositories, r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
            return;
        }
        else if (ResourceTree.isResourceNode(e.element)) {
            const provider = e.element.context.provider;
            const repository = Iterable.find(this.scmService.repositories, r => r.provider === provider);
            if (repository) {
                this.scmViewService.focus(repository);
            }
            return;
        }
        else if (isSCMInput(e.element)) {
            this.scmViewService.focus(e.element.repository);
            const widget = this.inputRenderer.getRenderedInputWidget(e.element);
            if (widget) {
                widget.focus();
                this.tree.setFocus([], e.browserEvent);
                const selection = this.tree.getSelection();
                if (selection.length === 1 && selection[0] === e.element) {
                    setTimeout(() => this.tree.setSelection([]));
                }
            }
            return;
        }
        else if (isSCMActionButton(e.element)) {
            this.scmViewService.focus(e.element.repository);
            // Focus the action button
            const target = e.browserEvent?.target;
            if (target.classList.contains('monaco-tl-row') || target.classList.contains('button-container')) {
                this.actionButtonRenderer.focusActionButton(e.element);
                this.tree.setFocus([], e.browserEvent);
            }
            return;
        }
        // ISCMResource
        if (e.element.command?.id === API_OPEN_EDITOR_COMMAND_ID || e.element.command?.id === API_OPEN_DIFF_EDITOR_COMMAND_ID) {
            await this.commandService.executeCommand(e.element.command.id, ...(e.element.command.arguments || []), e);
        }
        else {
            await e.element.open(!!e.editorOptions.preserveFocus);
            if (e.editorOptions.pinned) {
                const activeEditorPane = this.editorService.activeEditorPane;
                activeEditorPane?.group.pinEditor(activeEditorPane.input);
            }
        }
        const provider = e.element.resourceGroup.provider;
        const repository = Iterable.find(this.scmService.repositories, r => r.provider === provider);
        if (repository) {
            this.scmViewService.focus(repository);
        }
    }
    onListContextMenu(e) {
        if (!e.element) {
            const menu = this.menuService.createMenu(Menus.ViewSort, this.contextKeyService);
            const actions = [];
            createAndFillInContextMenuActions(menu, undefined, actions);
            return this.contextMenuService.showContextMenu({
                getAnchor: () => e.anchor,
                getActions: () => actions,
                onHide: () => {
                    menu.dispose();
                }
            });
        }
        const element = e.element;
        let context = element;
        let actions = [];
        if (isSCMRepository(element)) {
            const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
            const menu = menus.repositoryMenu;
            context = element.provider;
            actions = collectContextMenuActions(menu);
        }
        else if (isSCMInput(element) || isSCMActionButton(element)) {
            // noop
        }
        else if (isSCMResourceGroup(element)) {
            const menus = this.scmViewService.menus.getRepositoryMenus(element.provider);
            const menu = menus.getResourceGroupMenu(element);
            actions = collectContextMenuActions(menu);
        }
        else if (ResourceTree.isResourceNode(element)) {
            if (element.element) {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.element.resourceGroup.provider);
                const menu = menus.getResourceMenu(element.element);
                actions = collectContextMenuActions(menu);
            }
            else {
                const menus = this.scmViewService.menus.getRepositoryMenus(element.context.provider);
                const menu = menus.getResourceFolderMenu(element.context);
                actions = collectContextMenuActions(menu);
            }
        }
        else {
            const menus = this.scmViewService.menus.getRepositoryMenus(element.resourceGroup.provider);
            const menu = menus.getResourceMenu(element);
            actions = collectContextMenuActions(menu);
        }
        const actionRunner = new RepositoryPaneActionRunner(() => this.getSelectedResources());
        actionRunner.onWillRun(() => this.tree.domFocus());
        this.contextMenuService.showContextMenu({
            getAnchor: () => e.anchor,
            getActions: () => actions,
            getActionsContext: () => context,
            actionRunner
        });
    }
    getSelectedResources() {
        return this.tree.getSelection()
            .filter(r => !!r && !isSCMResourceGroup(r));
    }
    shouldShowWelcome() {
        return this.scmService.repositoryCount === 0;
    }
    getActionsContext() {
        return this.scmViewService.visibleRepositories.length === 1 ? this.scmViewService.visibleRepositories[0].provider : undefined;
    }
    dispose() {
        this.disposables.dispose();
        super.dispose();
    }
};
SCMViewPane = __decorate([
    __param(1, ISCMService),
    __param(2, ISCMViewService),
    __param(3, IKeybindingService),
    __param(4, IThemeService),
    __param(5, IContextMenuService),
    __param(6, ICommandService),
    __param(7, IEditorService),
    __param(8, IInstantiationService),
    __param(9, IViewDescriptorService),
    __param(10, IConfigurationService),
    __param(11, IContextKeyService),
    __param(12, IMenuService),
    __param(13, IOpenerService),
    __param(14, ITelemetryService)
], SCMViewPane);
export { SCMViewPane };
export const scmProviderSeparatorBorderColor = registerColor('scm.providerBorder', { dark: '#454545', light: '#C8C8C8', hcDark: contrastBorder, hcLight: contrastBorder }, localize('scm.providerBorder', "SCM Provider separator border."));
export class SCMActionButton {
    container;
    contextMenuService;
    commandService;
    notificationService;
    button;
    disposables = new MutableDisposable();
    constructor(container, contextMenuService, commandService, notificationService) {
        this.container = container;
        this.contextMenuService = contextMenuService;
        this.commandService = commandService;
        this.notificationService = notificationService;
    }
    dispose() {
        this.disposables?.dispose();
    }
    setButton(button) {
        // Clear old button
        this.clear();
        if (!button) {
            return;
        }
        if (button.secondaryCommands?.length) {
            const actions = [];
            for (let index = 0; index < button.secondaryCommands.length; index++) {
                const commands = button.secondaryCommands[index];
                for (const command of commands) {
                    actions.push(new Action(command.id, command.title, undefined, true, async () => await this.executeCommand(command.id, ...(command.arguments || []))));
                }
                if (commands.length) {
                    actions.push(new Separator());
                }
            }
            // Remove last separator
            actions.pop();
            // ButtonWithDropdown
            this.button = new ButtonWithDropdown(this.container, {
                actions: actions,
                addPrimaryActionToDropdown: false,
                contextMenuProvider: this.contextMenuService,
                title: button.command.tooltip,
                supportIcons: true,
                ...defaultButtonStyles
            });
        }
        else if (button.description) {
            // ButtonWithDescription
            this.button = new ButtonWithDescription(this.container, { supportIcons: true, title: button.command.tooltip, ...defaultButtonStyles });
            this.button.description = button.description;
        }
        else {
            // Button
            this.button = new Button(this.container, { supportIcons: true, title: button.command.tooltip, ...defaultButtonStyles });
        }
        this.button.enabled = button.enabled;
        this.button.label = button.command.title;
        this.button.onDidClick(async () => await this.executeCommand(button.command.id, ...(button.command.arguments || [])), null, this.disposables.value);
        this.disposables.value.add(this.button);
    }
    focus() {
        this.button?.focus();
    }
    clear() {
        this.disposables.value = new DisposableStore();
        this.button = undefined;
        clearNode(this.container);
    }
    async executeCommand(commandId, ...args) {
        try {
            await this.commandService.executeCommand(commandId, ...args);
        }
        catch (ex) {
            this.notificationService.error(ex);
        }
    }
}
