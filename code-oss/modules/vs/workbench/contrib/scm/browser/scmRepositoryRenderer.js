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
import { DisposableStore, combinedDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { append, $ } from 'vs/base/browser/dom';
import { ISCMViewService } from 'vs/workbench/contrib/scm/common/scm';
import { CountBadge } from 'vs/base/browser/ui/countBadge/countBadge';
import { IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IThemeService } from 'vs/platform/theme/common/themeService';
import { connectPrimaryMenu, isSCMRepository, StatusBarAction } from './util';
import { attachBadgeStyler } from 'vs/platform/theme/common/styler';
import { ToolBar } from 'vs/base/browser/ui/toolbar/toolbar';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { basename } from 'vs/base/common/resources';
let RepositoryRenderer = class RepositoryRenderer {
    actionViewItemProvider;
    scmViewService;
    commandService;
    contextMenuService;
    themeService;
    workspaceContextService;
    static TEMPLATE_ID = 'repository';
    get templateId() { return RepositoryRenderer.TEMPLATE_ID; }
    constructor(actionViewItemProvider, scmViewService, commandService, contextMenuService, themeService, workspaceContextService) {
        this.actionViewItemProvider = actionViewItemProvider;
        this.scmViewService = scmViewService;
        this.commandService = commandService;
        this.contextMenuService = contextMenuService;
        this.themeService = themeService;
        this.workspaceContextService = workspaceContextService;
    }
    renderTemplate(container) {
        // hack
        if (container.classList.contains('monaco-tl-contents')) {
            container.parentElement.parentElement.querySelector('.monaco-tl-twistie').classList.add('force-twistie');
        }
        const provider = append(container, $('.scm-provider'));
        const label = append(provider, $('.label'));
        const name = append(label, $('span.name'));
        const description = append(label, $('span.description'));
        const actions = append(provider, $('.actions'));
        const toolBar = new ToolBar(actions, this.contextMenuService, { actionViewItemProvider: this.actionViewItemProvider });
        const countContainer = append(provider, $('.count'));
        const count = new CountBadge(countContainer);
        const badgeStyler = attachBadgeStyler(count, this.themeService);
        const visibilityDisposable = toolBar.onDidChangeDropdownVisibility(e => provider.classList.toggle('active', e));
        const templateDisposable = combinedDisposable(visibilityDisposable, toolBar, badgeStyler);
        return { label, name, description, countContainer, count, toolBar, elementDisposables: new DisposableStore(), templateDisposable };
    }
    renderElement(arg, index, templateData, height) {
        const repository = isSCMRepository(arg) ? arg : arg.element;
        if (repository.provider.rootUri) {
            const folder = this.workspaceContextService.getWorkspaceFolder(repository.provider.rootUri);
            if (folder?.uri.toString() === repository.provider.rootUri.toString()) {
                templateData.name.textContent = folder.name;
            }
            else {
                templateData.name.textContent = basename(repository.provider.rootUri);
            }
            templateData.label.title = `${repository.provider.label}: ${repository.provider.rootUri.fsPath}`;
            templateData.description.textContent = repository.provider.label;
        }
        else {
            templateData.label.title = repository.provider.label;
            templateData.name.textContent = repository.provider.label;
            templateData.description.textContent = '';
        }
        let statusPrimaryActions = [];
        let menuPrimaryActions = [];
        let menuSecondaryActions = [];
        const updateToolbar = () => {
            templateData.toolBar.setActions([...statusPrimaryActions, ...menuPrimaryActions], menuSecondaryActions);
        };
        const onDidChangeProvider = () => {
            const commands = repository.provider.statusBarCommands || [];
            statusPrimaryActions = commands.map(c => new StatusBarAction(c, this.commandService));
            updateToolbar();
            const count = repository.provider.count || 0;
            templateData.countContainer.setAttribute('data-count', String(count));
            templateData.count.setCount(count);
        };
        // TODO@joao TODO@lszomoru
        let disposed = false;
        templateData.elementDisposables.add(toDisposable(() => disposed = true));
        templateData.elementDisposables.add(repository.provider.onDidChange(() => {
            if (disposed) {
                return;
            }
            onDidChangeProvider();
        }));
        onDidChangeProvider();
        const menus = this.scmViewService.menus.getRepositoryMenus(repository.provider);
        templateData.elementDisposables.add(connectPrimaryMenu(menus.titleMenu.menu, (primary, secondary) => {
            menuPrimaryActions = primary;
            menuSecondaryActions = secondary;
            updateToolbar();
        }));
        templateData.toolBar.context = repository.provider;
    }
    renderCompressedElements() {
        throw new Error('Should never happen since node is incompressible');
    }
    disposeElement(group, index, template) {
        template.elementDisposables.clear();
    }
    disposeTemplate(templateData) {
        templateData.elementDisposables.dispose();
        templateData.templateDisposable.dispose();
    }
};
RepositoryRenderer = __decorate([
    __param(1, ISCMViewService),
    __param(2, ICommandService),
    __param(3, IContextMenuService),
    __param(4, IThemeService),
    __param(5, IWorkspaceContextService)
], RepositoryRenderer);
export { RepositoryRenderer };
