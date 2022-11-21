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
import * as DOM from 'vs/base/browser/dom';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { Disposable, DisposableStore } from 'vs/base/common/lifecycle';
import * as paths from 'vs/base/common/path';
import * as nls from 'vs/nls';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { FileKind } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
import { attachBadgeStyler } from 'vs/platform/theme/common/styler';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { FileMatch, Match, FolderMatch, FolderMatchNoRoot, FolderMatchWorkspaceRoot } from 'vs/workbench/contrib/search/common/searchModel';
import { isEqual } from 'vs/base/common/resources';
import { MenuId } from 'vs/platform/actions/common/actions';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { MenuWorkbenchToolBar } from 'vs/platform/actions/browser/toolbar';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
import { FileFocusKey, FolderFocusKey, MatchFocusKey } from 'vs/workbench/contrib/search/common/constants';
export class SearchDelegate {
    static ITEM_HEIGHT = 22;
    getHeight(element) {
        return SearchDelegate.ITEM_HEIGHT;
    }
    getTemplateId(element) {
        if (element instanceof FolderMatch) {
            return FolderMatchRenderer.TEMPLATE_ID;
        }
        else if (element instanceof FileMatch) {
            return FileMatchRenderer.TEMPLATE_ID;
        }
        else if (element instanceof Match) {
            return MatchRenderer.TEMPLATE_ID;
        }
        console.error('Invalid search tree element', element);
        throw new Error('Invalid search tree element');
    }
}
let FolderMatchRenderer = class FolderMatchRenderer extends Disposable {
    searchView;
    labels;
    themeService;
    contextService;
    labelService;
    instantiationService;
    contextKeyService;
    static TEMPLATE_ID = 'folderMatch';
    templateId = FolderMatchRenderer.TEMPLATE_ID;
    constructor(searchView, labels, themeService, contextService, labelService, instantiationService, contextKeyService) {
        super();
        this.searchView = searchView;
        this.labels = labels;
        this.themeService = themeService;
        this.contextService = contextService;
        this.labelService = labelService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
    }
    renderCompressedElements(node, index, templateData, height) {
        const compressed = node.element;
        const folder = compressed.elements[compressed.elements.length - 1];
        folder.compressionStartParent = compressed.elements[0];
        const label = compressed.elements.map(e => e.name());
        if (folder.resource) {
            const fileKind = (folder instanceof FolderMatchWorkspaceRoot) ? FileKind.ROOT_FOLDER : FileKind.FOLDER;
            templateData.label.setResource({ resource: folder.resource, name: label }, {
                fileKind,
                separator: this.labelService.getSeparator(folder.resource.scheme),
            });
        }
        else {
            templateData.label.setLabel(nls.localize('searchFolderMatch.other.label', "Other files"));
        }
        this.renderFolderDetails(folder, templateData);
    }
    renderTemplate(container) {
        const disposables = new DisposableStore();
        const folderMatchElement = DOM.append(container, DOM.$('.foldermatch'));
        const label = this.labels.create(folderMatchElement, { supportDescriptionHighlights: true, supportHighlights: true });
        disposables.add(label);
        const badge = new CountBadge(DOM.append(folderMatchElement, DOM.$('.badge')));
        disposables.add(attachBadgeStyler(badge, this.themeService));
        const actionBarContainer = DOM.append(folderMatchElement, DOM.$('.actionBarContainer'));
        const disposableElements = new DisposableStore();
        disposables.add(disposableElements);
        const contextKeyService = this.contextKeyService.createOverlay([[FolderFocusKey.key, true]]);
        const instantiationService = this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService]));
        const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
            menuOptions: {
                shouldForwardArgs: true
            },
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            toolbarOptions: {
                primaryGroup: g => /^inline/.test(g),
            },
        }));
        return {
            label,
            badge,
            actions,
            disposables,
            disposableActions: disposableElements
        };
    }
    renderElement(node, index, templateData) {
        const folderMatch = node.element;
        folderMatch.compressionStartParent = undefined;
        if (folderMatch.resource) {
            const workspaceFolder = this.contextService.getWorkspaceFolder(folderMatch.resource);
            if (workspaceFolder && isEqual(workspaceFolder.uri, folderMatch.resource)) {
                templateData.label.setFile(folderMatch.resource, { fileKind: FileKind.ROOT_FOLDER, hidePath: true });
            }
            else {
                templateData.label.setFile(folderMatch.resource, { fileKind: FileKind.FOLDER, hidePath: this.searchView.isTreeLayoutViewVisible });
            }
        }
        else {
            templateData.label.setLabel(nls.localize('searchFolderMatch.other.label', "Other files"));
        }
        this.renderFolderDetails(folderMatch, templateData);
    }
    disposeElement(element, index, templateData) {
        templateData.disposableActions.clear();
    }
    disposeCompressedElements(node, index, templateData, height) {
        templateData.disposableActions.clear();
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
    }
    renderFolderDetails(folder, templateData) {
        const count = folder.recursiveMatchCount();
        templateData.badge.setCount(count);
        templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchFileMatches', "{0} files found", count) : nls.localize('searchFileMatch', "{0} file found", count));
        templateData.actions.context = { viewer: this.searchView.getControl(), element: folder };
    }
};
FolderMatchRenderer = __decorate([
    __param(2, IThemeService),
    __param(3, IWorkspaceContextService),
    __param(4, ILabelService),
    __param(5, IInstantiationService),
    __param(6, IContextKeyService)
], FolderMatchRenderer);
export { FolderMatchRenderer };
let FileMatchRenderer = class FileMatchRenderer extends Disposable {
    searchView;
    labels;
    themeService;
    contextService;
    configurationService;
    instantiationService;
    contextKeyService;
    static TEMPLATE_ID = 'fileMatch';
    templateId = FileMatchRenderer.TEMPLATE_ID;
    constructor(searchView, labels, themeService, contextService, configurationService, instantiationService, contextKeyService) {
        super();
        this.searchView = searchView;
        this.labels = labels;
        this.themeService = themeService;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
    }
    renderCompressedElements(node, index, templateData, height) {
        throw new Error('Should never happen since node is incompressible.');
    }
    renderTemplate(container) {
        const disposables = new DisposableStore();
        const fileMatchElement = DOM.append(container, DOM.$('.filematch'));
        const label = this.labels.create(fileMatchElement);
        disposables.add(label);
        const badge = new CountBadge(DOM.append(fileMatchElement, DOM.$('.badge')));
        disposables.add(attachBadgeStyler(badge, this.themeService));
        const actionBarContainer = DOM.append(fileMatchElement, DOM.$('.actionBarContainer'));
        const contextKeyService = this.contextKeyService.createOverlay([[FileFocusKey.key, true]]);
        const instantiationService = this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService]));
        const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
            menuOptions: {
                shouldForwardArgs: true
            },
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            toolbarOptions: {
                primaryGroup: g => /^inline/.test(g),
            },
        }));
        return {
            el: fileMatchElement,
            label,
            badge,
            actions,
            disposables,
        };
    }
    renderElement(node, index, templateData) {
        const fileMatch = node.element;
        templateData.el.setAttribute('data-resource', fileMatch.resource.toString());
        const decorationConfig = this.configurationService.getValue('search').decorations;
        templateData.label.setFile(fileMatch.resource, { hidePath: this.searchView.isTreeLayoutViewVisible && !(fileMatch.parent() instanceof FolderMatchNoRoot), hideIcon: false, fileDecorations: { colors: decorationConfig.colors, badges: decorationConfig.badges } });
        const count = fileMatch.count();
        templateData.badge.setCount(count);
        templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchMatches', "{0} matches found", count) : nls.localize('searchMatch', "{0} match found", count));
        templateData.actions.context = { viewer: this.searchView.getControl(), element: fileMatch };
    }
    disposeElement(element, index, templateData) {
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
    }
};
FileMatchRenderer = __decorate([
    __param(2, IThemeService),
    __param(3, IWorkspaceContextService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IContextKeyService)
], FileMatchRenderer);
export { FileMatchRenderer };
let MatchRenderer = class MatchRenderer extends Disposable {
    searchModel;
    searchView;
    contextService;
    configurationService;
    instantiationService;
    contextKeyService;
    static TEMPLATE_ID = 'match';
    templateId = MatchRenderer.TEMPLATE_ID;
    constructor(searchModel, searchView, contextService, configurationService, instantiationService, contextKeyService) {
        super();
        this.searchModel = searchModel;
        this.searchView = searchView;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
    }
    renderCompressedElements(node, index, templateData, height) {
        throw new Error('Should never happen since node is incompressible.');
    }
    renderTemplate(container) {
        container.classList.add('linematch');
        const parent = DOM.append(container, DOM.$('a.plain.match'));
        const before = DOM.append(parent, DOM.$('span'));
        const match = DOM.append(parent, DOM.$('span.findInFileMatch'));
        const replace = DOM.append(parent, DOM.$('span.replaceMatch'));
        const after = DOM.append(parent, DOM.$('span'));
        const lineNumber = DOM.append(container, DOM.$('span.matchLineNum'));
        const actionBarContainer = DOM.append(container, DOM.$('span.actionBarContainer'));
        const disposables = new DisposableStore();
        const contextKeyService = this.contextKeyService.createOverlay([[MatchFocusKey.key, true]]);
        const instantiationService = this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService]));
        const actions = disposables.add(instantiationService.createInstance(MenuWorkbenchToolBar, actionBarContainer, MenuId.SearchActionMenu, {
            menuOptions: {
                shouldForwardArgs: true
            },
            hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
            toolbarOptions: {
                primaryGroup: g => /^inline/.test(g),
            },
        }));
        return {
            parent,
            before,
            match,
            replace,
            after,
            lineNumber,
            actions,
            disposables,
        };
    }
    renderElement(node, index, templateData) {
        const match = node.element;
        const preview = match.preview();
        const replace = this.searchModel.isReplaceActive() && !!this.searchModel.replaceString;
        templateData.before.textContent = preview.before;
        templateData.match.textContent = preview.inside;
        templateData.match.classList.toggle('replace', replace);
        templateData.replace.textContent = replace ? match.replaceString : '';
        templateData.after.textContent = preview.after;
        templateData.parent.title = (preview.before + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
        const numLines = match.range().endLineNumber - match.range().startLineNumber;
        const extraLinesStr = numLines > 0 ? `+${numLines}` : '';
        const showLineNumbers = this.configurationService.getValue('search').showLineNumbers;
        const lineNumberStr = showLineNumbers ? `:${match.range().startLineNumber}` : '';
        templateData.lineNumber.classList.toggle('show', (numLines > 0) || showLineNumbers);
        templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
        templateData.lineNumber.setAttribute('title', this.getMatchTitle(match, showLineNumbers));
        templateData.actions.context = { viewer: this.searchView.getControl(), element: match };
    }
    disposeTemplate(templateData) {
        templateData.disposables.dispose();
    }
    getMatchTitle(match, showLineNumbers) {
        const startLine = match.range().startLineNumber;
        const numLines = match.range().endLineNumber - match.range().startLineNumber;
        const lineNumStr = showLineNumbers ?
            nls.localize('lineNumStr', "From line {0}", startLine, numLines) + ' ' :
            '';
        const numLinesStr = numLines > 0 ?
            '+ ' + nls.localize('numLinesStr', "{0} more lines", numLines) :
            '';
        return lineNumStr + numLinesStr;
    }
};
MatchRenderer = __decorate([
    __param(2, IWorkspaceContextService),
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __param(5, IContextKeyService)
], MatchRenderer);
export { MatchRenderer };
let SearchAccessibilityProvider = class SearchAccessibilityProvider {
    searchModel;
    labelService;
    constructor(searchModel, labelService) {
        this.searchModel = searchModel;
        this.labelService = labelService;
    }
    getWidgetAriaLabel() {
        return nls.localize('search', "Search");
    }
    getAriaLabel(element) {
        if (element instanceof FolderMatch) {
            const count = element.allDownstreamFileMatches().reduce((total, current) => total + current.count(), 0);
            return element.resource ?
                nls.localize('folderMatchAriaLabel', "{0} matches in folder root {1}, Search result", count, element.name()) :
                nls.localize('otherFilesAriaLabel', "{0} matches outside of the workspace, Search result", count);
        }
        if (element instanceof FileMatch) {
            const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
            return nls.localize('fileMatchAriaLabel', "{0} matches in file {1} of folder {2}, Search result", element.count(), element.name(), paths.dirname(path));
        }
        if (element instanceof Match) {
            const match = element;
            const searchModel = this.searchModel;
            const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
            const matchString = match.getMatchString();
            const range = match.range();
            const matchText = match.text().substr(0, range.endColumn + 150);
            if (replace) {
                return nls.localize('replacePreviewResultAria', "Replace '{0}' with '{1}' at column {2} in line {3}", matchString, match.replaceString, range.startColumn + 1, matchText);
            }
            return nls.localize('searchResultAria', "Found '{0}' at column {1} in line '{2}'", matchString, range.startColumn + 1, matchText);
        }
        return null;
    }
};
SearchAccessibilityProvider = __decorate([
    __param(1, ILabelService)
], SearchAccessibilityProvider);
export { SearchAccessibilityProvider };
