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
import { localize } from 'vs/nls';
import { basename } from 'vs/base/common/resources';
import { dispose, Disposable, DisposableStore, combinedDisposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { Event } from 'vs/base/common/event';
import { VIEW_PANE_ID, ISCMService, ISCMViewService } from 'vs/workbench/contrib/scm/common/scm';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { EditorResourceAccessor } from 'vs/workbench/common/editor';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { Schemas } from 'vs/base/common/network';
import { Iterable } from 'vs/base/common/iterator';
function getCount(repository) {
    if (typeof repository.provider.count === 'number') {
        return repository.provider.count;
    }
    else {
        return repository.provider.groups.elements.reduce((r, g) => r + g.elements.length, 0);
    }
}
let SCMStatusController = class SCMStatusController {
    scmService;
    scmViewService;
    statusbarService;
    contextKeyService;
    activityService;
    editorService;
    configurationService;
    uriIdentityService;
    statusBarDisposable = Disposable.None;
    focusDisposable = Disposable.None;
    focusedRepository = undefined;
    badgeDisposable = new MutableDisposable();
    disposables = new DisposableStore();
    repositoryDisposables = new Set();
    constructor(scmService, scmViewService, statusbarService, contextKeyService, activityService, editorService, configurationService, uriIdentityService) {
        this.scmService = scmService;
        this.scmViewService = scmViewService;
        this.statusbarService = statusbarService;
        this.contextKeyService = contextKeyService;
        this.activityService = activityService;
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.uriIdentityService = uriIdentityService;
        this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
        this.scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
        const onDidChangeSCMCountBadge = Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('scm.countBadge'));
        onDidChangeSCMCountBadge(this.renderActivityCount, this, this.disposables);
        for (const repository of this.scmService.repositories) {
            this.onDidAddRepository(repository);
        }
        this.scmViewService.onDidFocusRepository(this.focusRepository, this, this.disposables);
        this.focusRepository(this.scmViewService.focusedRepository);
        editorService.onDidActiveEditorChange(() => this.tryFocusRepositoryBasedOnActiveEditor(), this, this.disposables);
        this.renderActivityCount();
    }
    tryFocusRepositoryBasedOnActiveEditor(repositories = this.scmService.repositories) {
        const resource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor);
        if (!resource) {
            return false;
        }
        let bestRepository = null;
        let bestMatchLength = Number.POSITIVE_INFINITY;
        for (const repository of repositories) {
            const root = repository.provider.rootUri;
            if (!root) {
                continue;
            }
            const path = this.uriIdentityService.extUri.relativePath(root, resource);
            if (path && !/^\.\./.test(path) && path.length < bestMatchLength) {
                bestRepository = repository;
                bestMatchLength = path.length;
            }
        }
        if (!bestRepository) {
            return false;
        }
        this.focusRepository(bestRepository);
        return true;
    }
    onDidAddRepository(repository) {
        const onDidChange = Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
        const changeDisposable = onDidChange(() => this.renderActivityCount());
        const onDidRemove = Event.filter(this.scmService.onDidRemoveRepository, e => e === repository);
        const removeDisposable = onDidRemove(() => {
            disposable.dispose();
            this.repositoryDisposables.delete(disposable);
            this.renderActivityCount();
        });
        const disposable = combinedDisposable(changeDisposable, removeDisposable);
        this.repositoryDisposables.add(disposable);
        this.tryFocusRepositoryBasedOnActiveEditor(Iterable.single(repository));
    }
    onDidRemoveRepository(repository) {
        if (this.focusedRepository !== repository) {
            return;
        }
        this.focusRepository(Iterable.first(this.scmService.repositories));
    }
    focusRepository(repository) {
        if (this.focusedRepository === repository) {
            return;
        }
        this.focusDisposable.dispose();
        this.focusedRepository = repository;
        if (repository && repository.provider.onDidChangeStatusBarCommands) {
            this.focusDisposable = repository.provider.onDidChangeStatusBarCommands(() => this.renderStatusBar(repository));
        }
        this.renderStatusBar(repository);
        this.renderActivityCount();
    }
    renderStatusBar(repository) {
        this.statusBarDisposable.dispose();
        if (!repository) {
            return;
        }
        const commands = repository.provider.statusBarCommands || [];
        const label = repository.provider.rootUri
            ? `${basename(repository.provider.rootUri)} (${repository.provider.label})`
            : repository.provider.label;
        const disposables = new DisposableStore();
        for (let index = 0; index < commands.length; index++) {
            const command = commands[index];
            const tooltip = `${label}${command.tooltip ? ` - ${command.tooltip}` : ''}`;
            disposables.add(this.statusbarService.addEntry({
                name: localize('status.scm', "Source Control"),
                text: command.title,
                ariaLabel: tooltip,
                tooltip,
                command: command.id ? command : undefined
            }, `status.scm.${index}`, 0 /* MainThreadStatusBarAlignment.LEFT */, 10000 - index));
        }
        this.statusBarDisposable = disposables;
    }
    renderActivityCount() {
        const countBadgeType = this.configurationService.getValue('scm.countBadge');
        let count = 0;
        if (countBadgeType === 'all') {
            count = Iterable.reduce(this.scmService.repositories, (r, repository) => r + getCount(repository), 0);
        }
        else if (countBadgeType === 'focused' && this.focusedRepository) {
            count = getCount(this.focusedRepository);
        }
        if (count > 0) {
            const badge = new NumberBadge(count, num => localize('scmPendingChangesBadge', '{0} pending changes', num));
            this.badgeDisposable.value = this.activityService.showViewActivity(VIEW_PANE_ID, { badge, clazz: 'scm-viewlet-label' });
        }
        else {
            this.badgeDisposable.value = undefined;
        }
    }
    dispose() {
        this.focusDisposable.dispose();
        this.statusBarDisposable.dispose();
        this.badgeDisposable.dispose();
        this.disposables = dispose(this.disposables);
        dispose(this.repositoryDisposables.values());
        this.repositoryDisposables.clear();
    }
};
SCMStatusController = __decorate([
    __param(0, ISCMService),
    __param(1, ISCMViewService),
    __param(2, IStatusbarService),
    __param(3, IContextKeyService),
    __param(4, IActivityService),
    __param(5, IEditorService),
    __param(6, IConfigurationService),
    __param(7, IUriIdentityService)
], SCMStatusController);
export { SCMStatusController };
let SCMActiveResourceContextKeyController = class SCMActiveResourceContextKeyController {
    contextKeyService;
    editorService;
    scmService;
    uriIdentityService;
    activeResourceHasChangesContextKey;
    activeResourceRepositoryContextKey;
    disposables = new DisposableStore();
    repositoryDisposables = new Set();
    constructor(contextKeyService, editorService, scmService, uriIdentityService) {
        this.contextKeyService = contextKeyService;
        this.editorService = editorService;
        this.scmService = scmService;
        this.uriIdentityService = uriIdentityService;
        this.activeResourceHasChangesContextKey = contextKeyService.createKey('scmActiveResourceHasChanges', false);
        this.activeResourceRepositoryContextKey = contextKeyService.createKey('scmActiveResourceRepository', undefined);
        this.scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
        for (const repository of this.scmService.repositories) {
            this.onDidAddRepository(repository);
        }
        editorService.onDidActiveEditorChange(this.updateContextKey, this, this.disposables);
    }
    onDidAddRepository(repository) {
        const onDidChange = Event.any(repository.provider.onDidChange, repository.provider.onDidChangeResources);
        const changeDisposable = onDidChange(() => this.updateContextKey());
        const onDidRemove = Event.filter(this.scmService.onDidRemoveRepository, e => e === repository);
        const removeDisposable = onDidRemove(() => {
            disposable.dispose();
            this.repositoryDisposables.delete(disposable);
            this.updateContextKey();
        });
        const disposable = combinedDisposable(changeDisposable, removeDisposable);
        this.repositoryDisposables.add(disposable);
    }
    updateContextKey() {
        const activeResource = EditorResourceAccessor.getOriginalUri(this.editorService.activeEditor);
        if (activeResource?.scheme === Schemas.file || activeResource?.scheme === Schemas.vscodeRemote) {
            const activeResourceRepository = Iterable.find(this.scmService.repositories, r => Boolean(r.provider.rootUri && this.uriIdentityService.extUri.isEqualOrParent(activeResource, r.provider.rootUri)));
            this.activeResourceRepositoryContextKey.set(activeResourceRepository?.id);
            for (const resourceGroup of activeResourceRepository?.provider.groups.elements ?? []) {
                if (resourceGroup.elements
                    .some(scmResource => this.uriIdentityService.extUri.isEqual(activeResource, scmResource.sourceUri))) {
                    this.activeResourceHasChangesContextKey.set(true);
                    return;
                }
            }
            this.activeResourceHasChangesContextKey.set(false);
        }
        else {
            this.activeResourceHasChangesContextKey.set(false);
            this.activeResourceRepositoryContextKey.set(undefined);
        }
    }
    dispose() {
        this.disposables = dispose(this.disposables);
        dispose(this.repositoryDisposables.values());
        this.repositoryDisposables.clear();
    }
};
SCMActiveResourceContextKeyController = __decorate([
    __param(0, IContextKeyService),
    __param(1, IEditorService),
    __param(2, ISCMService),
    __param(3, IUriIdentityService)
], SCMActiveResourceContextKeyController);
export { SCMActiveResourceContextKeyController };
