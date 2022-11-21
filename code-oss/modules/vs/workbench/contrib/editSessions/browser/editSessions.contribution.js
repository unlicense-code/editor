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
import { Disposable, MutableDisposable } from 'vs/base/common/lifecycle';
import { Extensions as WorkbenchExtensions } from 'vs/workbench/common/contributions';
import { Registry } from 'vs/platform/registry/common/platform';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { Action2, MenuRegistry, registerAction2 } from 'vs/platform/actions/common/actions';
import { localize } from 'vs/nls';
import { IEditSessionsStorageService, ChangeType, FileType, EDIT_SESSION_SYNC_CATEGORY, EDIT_SESSIONS_CONTAINER_ID, EditSessionSchemaVersion, IEditSessionsLogService, EDIT_SESSIONS_VIEW_ICON, EDIT_SESSIONS_TITLE, EDIT_SESSIONS_SHOW_VIEW, EDIT_SESSIONS_DATA_VIEW_ID, decodeEditSessionFileContent } from 'vs/workbench/contrib/editSessions/common/editSessions';
import { ISCMService } from 'vs/workbench/contrib/scm/common/scm';
import { IFileService } from 'vs/platform/files/common/files';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { URI } from 'vs/base/common/uri';
import { basename, joinPath, relativePath } from 'vs/base/common/resources';
import { encodeBase64 } from 'vs/base/common/buffer';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IProgressService } from 'vs/platform/progress/common/progress';
import { EditSessionsWorkbenchService } from 'vs/workbench/contrib/editSessions/browser/editSessionsStorageService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { UserDataSyncStoreError } from 'vs/platform/userDataSync/common/userDataSync';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { INotificationService, Severity } from 'vs/platform/notification/common/notification';
import { getFileNamesMessage, IDialogService, IFileDialogService } from 'vs/platform/dialogs/common/dialogs';
import { IProductService } from 'vs/platform/product/common/productService';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { workbenchConfigurationNodeBase } from 'vs/workbench/common/configuration';
import { Extensions as ConfigurationExtensions } from 'vs/platform/configuration/common/configurationRegistry';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { ExtensionsRegistry } from 'vs/workbench/services/extensions/common/extensionsRegistry';
import { ContextKeyExpr, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { getVirtualWorkspaceLocation } from 'vs/platform/workspace/common/virtualWorkspace';
import { Schemas } from 'vs/base/common/network';
import { IsWebContext } from 'vs/platform/contextkey/common/contextkeys';
import { isProposedApiEnabled } from 'vs/workbench/services/extensions/common/extensions';
import { EditSessionsLogService } from 'vs/workbench/contrib/editSessions/common/editSessionsLogService';
import { Extensions as ViewExtensions, IViewsService } from 'vs/workbench/common/views';
import { SyncDescriptor } from 'vs/platform/instantiation/common/descriptors';
import { ViewPaneContainer } from 'vs/workbench/browser/parts/views/viewPaneContainer';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { EditSessionsDataViews } from 'vs/workbench/contrib/editSessions/browser/editSessionsViews';
import { EditSessionsFileSystemProvider } from 'vs/workbench/contrib/editSessions/browser/editSessionsFileSystemProvider';
import { isNative } from 'vs/base/common/platform';
import { WorkspaceFolderCountContext } from 'vs/workbench/common/contextkeys';
import { CancellationTokenSource } from 'vs/base/common/cancellation';
import { equals } from 'vs/base/common/objects';
import { EditSessionIdentityMatch, IEditSessionIdentityService } from 'vs/platform/workspace/common/editSessions';
import { ThemeIcon } from 'vs/platform/theme/common/themeService';
import { IOutputService } from 'vs/workbench/services/output/common/output';
import * as Constants from 'vs/workbench/contrib/logs/common/logConstants';
import { sha1Hex } from 'vs/base/browser/hash';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IActivityService, NumberBadge } from 'vs/workbench/services/activity/common/activity';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
registerSingleton(IEditSessionsLogService, EditSessionsLogService, 1 /* InstantiationType.Delayed */);
registerSingleton(IEditSessionsStorageService, EditSessionsWorkbenchService, 1 /* InstantiationType.Delayed */);
const continueWorkingOnCommand = {
    id: '_workbench.editSessions.actions.continueEditSession',
    title: { value: localize('continue working on', "Continue Working On..."), original: 'Continue Working On...' },
    precondition: WorkspaceFolderCountContext.notEqualsTo('0'),
    f1: true
};
const openLocalFolderCommand = {
    id: '_workbench.editSessions.actions.continueEditSession.openLocalFolder',
    title: { value: localize('continue edit session in local folder', "Open In Local Folder"), original: 'Open In Local Folder' },
    category: EDIT_SESSION_SYNC_CATEGORY,
    precondition: IsWebContext
};
const showOutputChannelCommand = {
    id: 'workbench.editSessions.actions.showOutputChannel',
    title: { value: localize('show log', 'Show Log'), original: 'Show Log' },
    category: EDIT_SESSION_SYNC_CATEGORY
};
const resumingProgressOptions = {
    location: 10 /* ProgressLocation.Window */,
    type: 'syncing',
    title: `[${localize('resuming edit session window', 'Resuming edit session...')}](command:${showOutputChannelCommand.id})`
};
const queryParamName = 'editSessionId';
const useEditSessionsWithContinueOn = 'workbench.editSessions.continueOn';
let EditSessionsContribution = class EditSessionsContribution extends Disposable {
    editSessionsStorageService;
    fileService;
    progressService;
    openerService;
    telemetryService;
    scmService;
    notificationService;
    dialogService;
    logService;
    environmentService;
    instantiationService;
    productService;
    configurationService;
    contextService;
    editSessionIdentityService;
    quickInputService;
    commandService;
    contextKeyService;
    fileDialogService;
    lifecycleService;
    storageService;
    activityService;
    editorService;
    continueEditSessionOptions = [];
    shouldShowViewsContext;
    static APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY = 'applicationLaunchedViaContinueOn';
    accountsMenuBadgeDisposable = this._register(new MutableDisposable());
    constructor(editSessionsStorageService, fileService, progressService, openerService, telemetryService, scmService, notificationService, dialogService, logService, environmentService, instantiationService, productService, configurationService, contextService, editSessionIdentityService, quickInputService, commandService, contextKeyService, fileDialogService, lifecycleService, storageService, activityService, editorService) {
        super();
        this.editSessionsStorageService = editSessionsStorageService;
        this.fileService = fileService;
        this.progressService = progressService;
        this.openerService = openerService;
        this.telemetryService = telemetryService;
        this.scmService = scmService;
        this.notificationService = notificationService;
        this.dialogService = dialogService;
        this.logService = logService;
        this.environmentService = environmentService;
        this.instantiationService = instantiationService;
        this.productService = productService;
        this.configurationService = configurationService;
        this.contextService = contextService;
        this.editSessionIdentityService = editSessionIdentityService;
        this.quickInputService = quickInputService;
        this.commandService = commandService;
        this.contextKeyService = contextKeyService;
        this.fileDialogService = fileDialogService;
        this.lifecycleService = lifecycleService;
        this.storageService = storageService;
        this.activityService = activityService;
        this.editorService = editorService;
        this.autoResumeEditSession();
        this.registerActions();
        this.registerViews();
        this.registerContributedEditSessionOptions();
        this.shouldShowViewsContext = EDIT_SESSIONS_SHOW_VIEW.bindTo(this.contextKeyService);
        this._register(this.fileService.registerProvider(EditSessionsFileSystemProvider.SCHEMA, new EditSessionsFileSystemProvider(this.editSessionsStorageService)));
        this.lifecycleService.onWillShutdown((e) => e.join(this.autoStoreEditSession(), { id: 'autoStoreWorkingChanges', label: localize('autoStoreWorkingChanges', 'Storing current working changes...') }));
        this._register(this.editSessionsStorageService.onDidSignIn(() => this.updateAccountsMenuBadge()));
        this._register(this.editSessionsStorageService.onDidSignOut(() => this.updateAccountsMenuBadge()));
    }
    autoResumeEditSession() {
        void this.progressService.withProgress(resumingProgressOptions, async () => {
            performance.mark('code/willResumeEditSessionFromIdentifier');
            this.telemetryService.publicLog2('editSessions.continue.resume');
            const shouldAutoResumeOnReload = this.configurationService.getValue('workbench.editSessions.autoResume') === 'onReload';
            if (this.environmentService.editSessionId !== undefined) {
                this.logService.info(`Resuming cloud changes, reason: found editSessionId ${this.environmentService.editSessionId} in environment service...`);
                await this.resumeEditSession(this.environmentService.editSessionId).finally(() => this.environmentService.editSessionId = undefined);
            }
            else if (shouldAutoResumeOnReload && this.editSessionsStorageService.isSignedIn) {
                this.logService.info('Resuming cloud changes, reason: cloud changes enabled...');
                // Attempt to resume edit session based on edit workspace identifier
                // Note: at this point if the user is not signed into edit sessions,
                // we don't want them to be prompted to sign in and should just return early
                await this.resumeEditSession(undefined, true);
            }
            else if (shouldAutoResumeOnReload) {
                // The application has previously launched via a protocol URL Continue On flow
                const hasApplicationLaunchedFromContinueOnFlow = this.storageService.getBoolean(EditSessionsContribution.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, -1 /* StorageScope.APPLICATION */, false);
                const handlePendingEditSessions = () => {
                    // display a badge in the accounts menu but do not prompt the user to sign in again
                    this.updateAccountsMenuBadge();
                    // attempt a resume if we are in a pending state and the user just signed in
                    const disposable = this.editSessionsStorageService.onDidSignIn(async () => {
                        disposable.dispose();
                        this.resumeEditSession(undefined, true);
                        this.storageService.remove(EditSessionsContribution.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, -1 /* StorageScope.APPLICATION */);
                        this.environmentService.continueOn = undefined;
                    });
                };
                if ((this.environmentService.continueOn !== undefined) &&
                    !this.editSessionsStorageService.isSignedIn &&
                    // and user has not yet been prompted to sign in on this machine
                    hasApplicationLaunchedFromContinueOnFlow === false) {
                    this.storageService.store(EditSessionsContribution.APPLICATION_LAUNCHED_VIA_CONTINUE_ON_STORAGE_KEY, true, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                    await this.editSessionsStorageService.initialize(true);
                    if (this.editSessionsStorageService.isSignedIn) {
                        await this.resumeEditSession(undefined, true);
                    }
                    else {
                        handlePendingEditSessions();
                    }
                    // store the fact that we prompted the user
                }
                else if (!this.editSessionsStorageService.isSignedIn &&
                    // and user has been prompted to sign in on this machine
                    hasApplicationLaunchedFromContinueOnFlow === true) {
                    handlePendingEditSessions();
                }
            }
            performance.mark('code/didResumeEditSessionFromIdentifier');
        });
    }
    updateAccountsMenuBadge() {
        if (this.editSessionsStorageService.isSignedIn) {
            return this.accountsMenuBadgeDisposable.clear();
        }
        const badge = new NumberBadge(1, () => localize('check for pending cloud changes', 'Check for pending cloud changes'));
        this.accountsMenuBadgeDisposable.value = this.activityService.showAccountsActivity({ badge, priority: 1 });
    }
    async autoStoreEditSession() {
        if (this.configurationService.getValue('workbench.experimental.editSessions.autoStore') === 'onShutdown') {
            await this.progressService.withProgress({
                location: 10 /* ProgressLocation.Window */,
                type: 'syncing',
                title: localize('store working changes', 'Storing working changes...')
            }, async () => this.storeEditSession(false));
        }
    }
    registerViews() {
        const container = Registry.as(ViewExtensions.ViewContainersRegistry).registerViewContainer({
            id: EDIT_SESSIONS_CONTAINER_ID,
            title: EDIT_SESSIONS_TITLE,
            ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [EDIT_SESSIONS_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
            icon: EDIT_SESSIONS_VIEW_ICON,
            hideIfEmpty: true
        }, 0 /* ViewContainerLocation.Sidebar */, { doNotRegisterOpenCommand: true });
        this._register(this.instantiationService.createInstance(EditSessionsDataViews, container));
    }
    registerActions() {
        this.registerContinueEditSessionAction();
        this.registerResumeLatestEditSessionAction();
        this.registerStoreLatestEditSessionAction();
        this.registerContinueInLocalFolderAction();
        this.registerShowEditSessionViewAction();
        this.registerShowEditSessionOutputChannelAction();
    }
    registerShowEditSessionOutputChannelAction() {
        this._register(registerAction2(class ShowEditSessionOutput extends Action2 {
            constructor() {
                super(showOutputChannelCommand);
            }
            run(accessor, ...args) {
                const outputChannel = accessor.get(IOutputService);
                void outputChannel.showChannel(Constants.editSessionsLogChannelId);
            }
        }));
    }
    registerShowEditSessionViewAction() {
        const that = this;
        this._register(registerAction2(class ShowEditSessionView extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.showEditSessions',
                    title: { value: localize('show cloud changes', "Show Cloud Changes"), original: 'Show Cloud Changes' },
                    category: EDIT_SESSION_SYNC_CATEGORY,
                    f1: true
                });
            }
            async run(accessor) {
                that.shouldShowViewsContext.set(true);
                const viewsService = accessor.get(IViewsService);
                await viewsService.openView(EDIT_SESSIONS_DATA_VIEW_ID);
            }
        }));
    }
    registerContinueEditSessionAction() {
        const that = this;
        this._register(registerAction2(class ContinueEditSessionAction extends Action2 {
            constructor() {
                super(continueWorkingOnCommand);
            }
            async run(accessor, workspaceUri) {
                that.telemetryService.publicLog2('editSessions.continue.store');
                // First ask the user to pick a destination, if necessary
                let uri = workspaceUri;
                let destination;
                if (!uri) {
                    destination = await that.pickContinueEditSessionDestination();
                }
                if (!destination && !uri) {
                    return;
                }
                // Determine if we need to store an edit session, asking for edit session auth if necessary
                const shouldStoreEditSession = await that.shouldContinueOnWithEditSession();
                // Run the store action to get back a ref
                let ref;
                if (shouldStoreEditSession) {
                    ref = await that.progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        type: 'syncing',
                        title: localize('store your working changes', 'Storing your working changes...')
                    }, async () => that.storeEditSession(false));
                }
                // Append the ref to the URI
                uri = destination ? await that.resolveDestination(destination) : uri;
                if (uri === undefined) {
                    return;
                }
                if (ref !== undefined && uri !== 'noDestinationUri') {
                    const encodedRef = encodeURIComponent(ref);
                    uri = uri.with({
                        query: uri.query.length > 0 ? (uri.query + `&${queryParamName}=${encodedRef}&continueOn=1`) : `${queryParamName}=${encodedRef}&continueOn=1`
                    });
                    // Open the URI
                    that.logService.info(`Opening ${uri.toString()}`);
                    await that.openerService.open(uri, { openExternal: true });
                }
                else if (!shouldStoreEditSession && uri !== 'noDestinationUri') {
                    // Open the URI without an edit session ref
                    that.logService.info(`Opening ${uri.toString()}`);
                    await that.openerService.open(uri, { openExternal: true });
                }
                else if (ref === undefined && shouldStoreEditSession) {
                    that.logService.warn(`Failed to store working changes when invoking ${continueWorkingOnCommand.id}.`);
                }
            }
        }));
    }
    registerResumeLatestEditSessionAction() {
        const that = this;
        this._register(registerAction2(class ResumeLatestEditSessionAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.resumeLatest',
                    title: { value: localize('resume latest cloud changes', "Resume Latest Changes from Cloud"), original: 'Resume Latest Changes from Cloud' },
                    category: EDIT_SESSION_SYNC_CATEGORY,
                    f1: true,
                });
            }
            async run(accessor, editSessionId) {
                await that.progressService.withProgress(resumingProgressOptions, async () => {
                    that.telemetryService.publicLog2('editSessions.resume');
                    await that.resumeEditSession(editSessionId);
                });
            }
        }));
    }
    registerStoreLatestEditSessionAction() {
        const that = this;
        this._register(registerAction2(class StoreLatestEditSessionAction extends Action2 {
            constructor() {
                super({
                    id: 'workbench.editSessions.actions.storeCurrent',
                    title: { value: localize('store working changes in cloud', "Store Working Changes in Cloud"), original: 'Store Working Changes in Cloud' },
                    category: EDIT_SESSION_SYNC_CATEGORY,
                    f1: true,
                });
            }
            async run(accessor) {
                await that.progressService.withProgress({
                    location: 15 /* ProgressLocation.Notification */,
                    title: localize('storing working changes', 'Storing working changes...')
                }, async () => {
                    that.telemetryService.publicLog2('editSessions.store');
                    await that.storeEditSession(true);
                });
            }
        }));
    }
    async resumeEditSession(ref, silent, force) {
        // Edit sessions are not currently supported in empty workspaces
        // https://github.com/microsoft/vscode/issues/159220
        if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            return;
        }
        this.logService.info(ref !== undefined ? `Resuming changes from cloud with ref ${ref}...` : 'Resuming changes from cloud...');
        if (silent && !(await this.editSessionsStorageService.initialize(false, true))) {
            return;
        }
        const data = await this.editSessionsStorageService.read(ref);
        if (!data) {
            if (ref === undefined && !silent) {
                this.notificationService.info(localize('no cloud changes', 'There are no changes to resume from the cloud.'));
            }
            else if (ref !== undefined) {
                this.notificationService.warn(localize('no cloud changes for ref', 'Could not resume changes from the cloud for ID {0}.', ref));
            }
            this.logService.info(ref !== undefined ? `Aborting resuming changes from cloud as no edit session content is available to be applied from ref ${ref}.` : `Aborting resuming edit session as no edit session content is available to be applied`);
            return;
        }
        const editSession = data.editSession;
        ref = data.ref;
        if (editSession.version > EditSessionSchemaVersion) {
            this.notificationService.error(localize('client too old', "Please upgrade to a newer version of {0} to resume your working changes from the cloud.", this.productService.nameLong));
            return;
        }
        try {
            const { changes, conflictingChanges } = await this.generateChanges(editSession, ref, force);
            if (changes.length === 0) {
                return;
            }
            // TODO@joyceerhl Provide the option to diff files which would be overwritten by edit session contents
            if (conflictingChanges.length > 0) {
                const yes = localize('resume edit session yes', 'Yes');
                const cancel = localize('resume edit session cancel', 'Cancel');
                // Allow to show edit sessions
                const result = await this.dialogService.show(Severity.Warning, conflictingChanges.length > 1 ?
                    localize('resume edit session warning many', 'Resuming your working changes from the cloud will overwrite the following {0} files. Do you want to proceed?', conflictingChanges.length) :
                    localize('resume edit session warning 1', 'Resuming your working changes from the cloud will overwrite {0}. Do you want to proceed?', basename(conflictingChanges[0].uri)), [cancel, yes], {
                    detail: conflictingChanges.length > 1 ? getFileNamesMessage(conflictingChanges.map((c) => c.uri)) : undefined,
                    cancelId: 0
                });
                if (result.choice === 0) {
                    return;
                }
            }
            for (const { uri, type, contents } of changes) {
                if (type === ChangeType.Addition) {
                    await this.fileService.writeFile(uri, decodeEditSessionFileContent(editSession.version, contents));
                }
                else if (type === ChangeType.Deletion && await this.fileService.exists(uri)) {
                    await this.fileService.del(uri);
                }
            }
            this.logService.info(`Deleting edit session with ref ${ref} after successfully applying it to current workspace...`);
            await this.editSessionsStorageService.delete(ref);
            this.logService.info(`Deleted edit session with ref ${ref}.`);
        }
        catch (ex) {
            this.logService.error('Failed to resume edit session, reason: ', ex.toString());
            this.notificationService.error(localize('resume failed', "Failed to resume your working changes from the cloud."));
        }
    }
    async generateChanges(editSession, ref, force = false) {
        const changes = [];
        const conflictingChanges = [];
        const workspaceFolders = this.contextService.getWorkspace().folders;
        for (const folder of editSession.folders) {
            const cancellationTokenSource = new CancellationTokenSource();
            let folderRoot;
            if (folder.canonicalIdentity) {
                // Look for an edit session identifier that we can use
                for (const f of workspaceFolders) {
                    const identity = await this.editSessionIdentityService.getEditSessionIdentifier(f, cancellationTokenSource);
                    this.logService.info(`Matching identity ${identity} against edit session folder identity ${folder.canonicalIdentity}...`);
                    if (equals(identity, folder.canonicalIdentity)) {
                        folderRoot = f;
                        break;
                    }
                    if (identity !== undefined) {
                        const match = await this.editSessionIdentityService.provideEditSessionIdentityMatch(f, identity, folder.canonicalIdentity, cancellationTokenSource);
                        if (match === EditSessionIdentityMatch.Complete) {
                            folderRoot = f;
                            break;
                        }
                        else if (match === EditSessionIdentityMatch.Partial &&
                            this.configurationService.getValue('workbench.experimental.editSessions.partialMatches.enabled') === true) {
                            if (!force) {
                                // Surface partially matching edit session
                                this.notificationService.prompt(Severity.Info, localize('editSessionPartialMatch', 'You have pending working changes in the cloud for this workspace. Would you like to resume them?'), [{ label: localize('resume', 'Resume'), run: () => this.resumeEditSession(ref, false, true) }]);
                            }
                            else {
                                folderRoot = f;
                                break;
                            }
                        }
                    }
                }
            }
            else {
                folderRoot = workspaceFolders.find((f) => f.name === folder.name);
            }
            if (!folderRoot) {
                this.logService.info(`Skipping applying ${folder.workingChanges.length} changes from edit session with ref ${ref} as no matching workspace folder was found.`);
                return { changes: [], conflictingChanges: [] };
            }
            const localChanges = new Set();
            for (const repository of this.scmService.repositories) {
                if (repository.provider.rootUri !== undefined &&
                    this.contextService.getWorkspaceFolder(repository.provider.rootUri)?.name === folder.name) {
                    const repositoryChanges = this.getChangedResources(repository);
                    repositoryChanges.forEach((change) => localChanges.add(change.toString()));
                }
            }
            for (const change of folder.workingChanges) {
                const uri = joinPath(folderRoot.uri, change.relativeFilePath);
                changes.push({ uri, type: change.type, contents: change.contents });
                if (await this.willChangeLocalContents(localChanges, uri, change)) {
                    conflictingChanges.push({ uri, type: change.type, contents: change.contents });
                }
            }
        }
        return { changes, conflictingChanges };
    }
    async willChangeLocalContents(localChanges, uriWithIncomingChanges, incomingChange) {
        if (!localChanges.has(uriWithIncomingChanges.toString())) {
            return false;
        }
        const { contents, type } = incomingChange;
        switch (type) {
            case (ChangeType.Addition): {
                const [originalContents, incomingContents] = await Promise.all([sha1Hex(contents), sha1Hex(encodeBase64((await this.fileService.readFile(uriWithIncomingChanges)).value))]);
                return originalContents !== incomingContents;
            }
            case (ChangeType.Deletion): {
                return await this.fileService.exists(uriWithIncomingChanges);
            }
            default:
                throw new Error('Unhandled change type.');
        }
    }
    async storeEditSession(fromStoreCommand) {
        const folders = [];
        let hasEdits = false;
        // Save all saveable editors before building edit session contents
        await this.editorService.saveAll();
        for (const repository of this.scmService.repositories) {
            // Look through all resource groups and compute which files were added/modified/deleted
            const trackedUris = this.getChangedResources(repository); // A URI might appear in more than one resource group
            const workingChanges = [];
            const { rootUri } = repository.provider;
            const workspaceFolder = rootUri ? this.contextService.getWorkspaceFolder(rootUri) : undefined;
            let name = workspaceFolder?.name;
            for (const uri of trackedUris) {
                const workspaceFolder = this.contextService.getWorkspaceFolder(uri);
                if (!workspaceFolder) {
                    this.logService.info(`Skipping working change ${uri.toString()} as no associated workspace folder was found.`);
                    continue;
                }
                name = name ?? workspaceFolder.name;
                const relativeFilePath = relativePath(workspaceFolder.uri, uri) ?? uri.path;
                // Only deal with file contents for now
                try {
                    if (!(await this.fileService.stat(uri)).isFile) {
                        continue;
                    }
                }
                catch { }
                hasEdits = true;
                if (await this.fileService.exists(uri)) {
                    const contents = encodeBase64((await this.fileService.readFile(uri)).value);
                    workingChanges.push({ type: ChangeType.Addition, fileType: FileType.File, contents: contents, relativeFilePath: relativeFilePath });
                }
                else {
                    // Assume it's a deletion
                    workingChanges.push({ type: ChangeType.Deletion, fileType: FileType.File, contents: undefined, relativeFilePath: relativeFilePath });
                }
            }
            const canonicalIdentity = workspaceFolder ? await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, new CancellationTokenSource()) : undefined;
            folders.push({ workingChanges, name: name ?? '', canonicalIdentity: canonicalIdentity ?? undefined });
        }
        if (!hasEdits) {
            this.logService.info('Skipped storing working changes in the cloud as there are no edits to store.');
            if (fromStoreCommand) {
                this.notificationService.info(localize('no working changes to store', 'Skipped storing working changes in the cloud as there are no edits to store.'));
            }
            return undefined;
        }
        const data = { folders, version: 2 };
        try {
            this.logService.info(`Storing edit session...`);
            const ref = await this.editSessionsStorageService.write(data);
            this.logService.info(`Stored edit session with ref ${ref}.`);
            return ref;
        }
        catch (ex) {
            this.logService.error(`Failed to store edit session, reason: `, ex.toString());
            if (ex instanceof UserDataSyncStoreError) {
                switch (ex.code) {
                    case "TooLarge" /* UserDataSyncErrorCode.TooLarge */:
                        // Uploading a payload can fail due to server size limits
                        this.telemetryService.publicLog2('editSessions.upload.failed', { reason: 'TooLarge' });
                        this.notificationService.error(localize('payload too large', 'Your working changes exceed the size limit and cannot be stored.'));
                        break;
                    default:
                        this.telemetryService.publicLog2('editSessions.upload.failed', { reason: 'unknown' });
                        this.notificationService.error(localize('payload failed', 'Your working changes cannot be stored.'));
                        break;
                }
            }
        }
        return undefined;
    }
    getChangedResources(repository) {
        return repository.provider.groups.elements.reduce((resources, resourceGroups) => {
            resourceGroups.elements.forEach((resource) => resources.add(resource.sourceUri));
            return resources;
        }, new Set()); // A URI might appear in more than one resource group
    }
    hasEditSession() {
        for (const repository of this.scmService.repositories) {
            if (this.getChangedResources(repository).size > 0) {
                return true;
            }
        }
        return false;
    }
    async shouldContinueOnWithEditSession() {
        // If the user is already signed in, we should store edit session
        if (this.editSessionsStorageService.isSignedIn) {
            return this.hasEditSession();
        }
        // If the user has been asked before and said no, don't use edit sessions
        if (this.configurationService.getValue(useEditSessionsWithContinueOn) === 'off') {
            return false;
        }
        // Prompt the user to use edit sessions if they currently could benefit from using it
        if (this.hasEditSession()) {
            return this.editSessionsStorageService.initialize(true);
        }
        return false;
    }
    //#region Continue Edit Session extension contribution point
    registerContributedEditSessionOptions() {
        continueEditSessionExtPoint.setHandler(extensions => {
            const continueEditSessionOptions = [];
            for (const extension of extensions) {
                if (!isProposedApiEnabled(extension.description, 'contribEditSessions')) {
                    continue;
                }
                if (!Array.isArray(extension.value)) {
                    continue;
                }
                for (const contribution of extension.value) {
                    const command = MenuRegistry.getCommand(contribution.command);
                    if (!command) {
                        return;
                    }
                    const icon = command.icon;
                    const title = typeof command.title === 'string' ? command.title : command.title.value;
                    continueEditSessionOptions.push(new ContinueEditSessionItem(ThemeIcon.isThemeIcon(icon) ? `$(${icon.id}) ${title}` : title, command.id, command.source, ContextKeyExpr.deserialize(contribution.when)));
                }
            }
            this.continueEditSessionOptions = continueEditSessionOptions;
        });
    }
    registerContinueInLocalFolderAction() {
        const that = this;
        this._register(registerAction2(class ContinueInLocalFolderAction extends Action2 {
            constructor() {
                super(openLocalFolderCommand);
            }
            async run(accessor) {
                const selection = await that.fileDialogService.showOpenDialog({
                    title: localize('continueEditSession.openLocalFolder.title', 'Select a local folder to continue your edit session in'),
                    canSelectFolders: true,
                    canSelectMany: false,
                    canSelectFiles: false,
                    availableFileSystems: [Schemas.file]
                });
                return selection?.length !== 1 ? undefined : URI.from({
                    scheme: that.productService.urlProtocol,
                    authority: Schemas.file,
                    path: selection[0].path
                });
            }
        }));
    }
    async pickContinueEditSessionDestination() {
        const quickPick = this.quickInputService.createQuickPick();
        const workspaceContext = this.contextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */
            ? this.contextService.getWorkspace().folders[0].name
            : this.contextService.getWorkspace().folders.map((folder) => folder.name).join(', ');
        quickPick.placeholder = localize('continueEditSessionPick.title.v2', "Select a development environment to continue working on {0} in", `'${workspaceContext}'`);
        quickPick.items = this.createPickItems();
        const command = await new Promise((resolve, reject) => {
            quickPick.onDidHide(() => resolve(undefined));
            quickPick.onDidAccept((e) => {
                const selection = quickPick.activeItems[0].command;
                resolve(selection);
                quickPick.hide();
            });
            quickPick.show();
        });
        quickPick.dispose();
        return command;
    }
    async resolveDestination(command) {
        try {
            const uri = await this.commandService.executeCommand(command);
            // Some continue on commands do not return a URI
            // to support extensions which want to be in control
            // of how the destination is opened
            if (uri === undefined) {
                return 'noDestinationUri';
            }
            return URI.isUri(uri) ? uri : undefined;
        }
        catch (ex) {
            return undefined;
        }
    }
    createPickItems() {
        const items = [...this.continueEditSessionOptions].filter((option) => option.when === undefined || this.contextKeyService.contextMatchesRules(option.when));
        if (getVirtualWorkspaceLocation(this.contextService.getWorkspace()) !== undefined && isNative) {
            items.push(new ContinueEditSessionItem('$(folder) ' + localize('continueEditSessionItem.openInLocalFolder.v2', 'Open in Local Folder'), openLocalFolderCommand.id, localize('continueEditSessionItem.builtin', 'Built-in')));
        }
        return items.sort((item1, item2) => item1.label.localeCompare(item2.label));
    }
};
EditSessionsContribution = __decorate([
    __param(0, IEditSessionsStorageService),
    __param(1, IFileService),
    __param(2, IProgressService),
    __param(3, IOpenerService),
    __param(4, ITelemetryService),
    __param(5, ISCMService),
    __param(6, INotificationService),
    __param(7, IDialogService),
    __param(8, IEditSessionsLogService),
    __param(9, IEnvironmentService),
    __param(10, IInstantiationService),
    __param(11, IProductService),
    __param(12, IConfigurationService),
    __param(13, IWorkspaceContextService),
    __param(14, IEditSessionIdentityService),
    __param(15, IQuickInputService),
    __param(16, ICommandService),
    __param(17, IContextKeyService),
    __param(18, IFileDialogService),
    __param(19, ILifecycleService),
    __param(20, IStorageService),
    __param(21, IActivityService),
    __param(22, IEditorService)
], EditSessionsContribution);
export { EditSessionsContribution };
class ContinueEditSessionItem {
    label;
    command;
    description;
    when;
    constructor(label, command, description, when) {
        this.label = label;
        this.command = command;
        this.description = description;
        this.when = when;
    }
}
const continueEditSessionExtPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'continueEditSession',
    jsonSchema: {
        description: localize('continueEditSessionExtPoint', 'Contributes options for continuing the current edit session in a different environment'),
        type: 'array',
        items: {
            type: 'object',
            properties: {
                command: {
                    description: localize('continueEditSessionExtPoint.command', 'Identifier of the command to execute. The command must be declared in the \'commands\'-section and return a URI representing a different environment where the current edit session can be continued.'),
                    type: 'string'
                },
                group: {
                    description: localize('continueEditSessionExtPoint.group', 'Group into which this item belongs.'),
                    type: 'string'
                },
                when: {
                    description: localize('continueEditSessionExtPoint.when', 'Condition which must be true to show this item.'),
                    type: 'string'
                }
            },
            required: ['command']
        }
    }
});
//#endregion
const workbenchRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchRegistry.registerWorkbenchContribution(EditSessionsContribution, 3 /* LifecyclePhase.Restored */);
Registry.as(ConfigurationExtensions.Configuration).registerConfiguration({
    ...workbenchConfigurationNodeBase,
    'properties': {
        'workbench.experimental.editSessions.autoStore': {
            enum: ['onShutdown', 'off'],
            enumDescriptions: [
                localize('autoStore.onShutdown', "Automatically store current edit session on window close."),
                localize('autoStore.off', "Never attempt to automatically store an edit session.")
            ],
            'type': 'string',
            'tags': ['experimental', 'usesOnlineServices'],
            'default': 'off',
            'markdownDescription': localize('autoStore', "Controls whether to automatically store an available edit session for the current workspace."),
        },
        'workbench.editSessions.autoResume': {
            enum: ['onReload', 'off'],
            enumDescriptions: [
                localize('autoResume.onReload', "Automatically resume available edit session on window reload."),
                localize('autoResume.off', "Never attempt to resume an edit session.")
            ],
            'type': 'string',
            'tags': ['usesOnlineServices'],
            'default': 'onReload',
            'markdownDescription': localize('autoResume', "Controls whether to automatically resume an available edit session for the current workspace."),
        },
        'workbench.editSessions.continueOn': {
            enum: ['prompt', 'off'],
            enumDescriptions: [
                localize('continueOn.promptForAuth', 'Prompt the user to sign in to store edit sessions with Continue Working On.'),
                localize('continueOn.off', 'Do not use edit sessions with Continue Working On unless the user has already turned on edit sessions.')
            ],
            type: 'string',
            tags: ['usesOnlineServices'],
            default: 'prompt',
            markdownDescription: localize('continueOn', 'Controls whether to prompt the user to store edit sessions when using Continue Working On.')
        },
        'workbench.experimental.editSessions.continueOn': {
            enum: ['prompt', 'off'],
            enumDescriptions: [
                localize('continueOn.promptForAuth', 'Prompt the user to sign in to store edit sessions with Continue Working On.'),
                localize('continueOn.off', 'Do not use edit sessions with Continue Working On unless the user has already turned on edit sessions.')
            ],
            type: 'string',
            tags: ['experimental', 'usesOnlineServices'],
            default: 'prompt',
            markdownDeprecationMessage: localize('continueOnDeprecated', 'This setting is deprecated in favor of {0}.', '`#workbench.experimental.continueOn#`'),
            markdownDescription: localize('continueOn', 'Controls whether to prompt the user to store edit sessions when using Continue Working On.')
        },
        'workbench.experimental.editSessions.enabled': {
            'type': 'boolean',
            'tags': ['experimental', 'usesOnlineServices'],
            'default': true,
            'markdownDeprecationMessage': localize('editSessionsEnabledDeprecated', "This setting is deprecated as Edit Sessions are no longer experimental. Please see {0} and {1} for configuring behavior related to Edit Sessions.", '`#workbench.editSessions.autoResume#`', '`#workbench.editSessions.continueOn#`')
        },
        'workbench.experimental.editSessions.autoResume': {
            enum: ['onReload', 'off'],
            enumDescriptions: [
                localize('autoResume.onReload', "Automatically resume available edit session on window reload."),
                localize('autoResume.off', "Never attempt to resume an edit session.")
            ],
            'type': 'string',
            'tags': ['experimental', 'usesOnlineServices'],
            'default': 'onReload',
            'markdownDeprecationMessage': localize('autoResumeDeprecated', "This setting is deprecated in favor of {0}.", '`#workbench.editSessions.autoResume#`')
        },
        'workbench.experimental.editSessions.partialMatches.enabled': {
            'type': 'boolean',
            'tags': ['experimental', 'usesOnlineServices'],
            'default': false,
            'markdownDescription': localize('editSessionsPartialMatchesEnabled', "Controls whether to surface edit sessions which partially match the current session.")
        }
    }
});
