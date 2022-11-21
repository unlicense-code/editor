import { ISCMService, ISCMViewService } from 'vs/workbench/contrib/scm/common/scm';
import { IActivityService } from 'vs/workbench/services/activity/common/activity';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IStatusbarService } from 'vs/workbench/services/statusbar/browser/statusbar';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class SCMStatusController implements IWorkbenchContribution {
    private readonly scmService;
    private readonly scmViewService;
    private readonly statusbarService;
    readonly contextKeyService: IContextKeyService;
    private readonly activityService;
    private readonly editorService;
    private readonly configurationService;
    private readonly uriIdentityService;
    private statusBarDisposable;
    private focusDisposable;
    private focusedRepository;
    private readonly badgeDisposable;
    private disposables;
    private repositoryDisposables;
    constructor(scmService: ISCMService, scmViewService: ISCMViewService, statusbarService: IStatusbarService, contextKeyService: IContextKeyService, activityService: IActivityService, editorService: IEditorService, configurationService: IConfigurationService, uriIdentityService: IUriIdentityService);
    private tryFocusRepositoryBasedOnActiveEditor;
    private onDidAddRepository;
    private onDidRemoveRepository;
    private focusRepository;
    private renderStatusBar;
    private renderActivityCount;
    dispose(): void;
}
export declare class SCMActiveResourceContextKeyController implements IWorkbenchContribution {
    readonly contextKeyService: IContextKeyService;
    private readonly editorService;
    private readonly scmService;
    private readonly uriIdentityService;
    private activeResourceHasChangesContextKey;
    private activeResourceRepositoryContextKey;
    private disposables;
    private repositoryDisposables;
    constructor(contextKeyService: IContextKeyService, editorService: IEditorService, scmService: ISCMService, uriIdentityService: IUriIdentityService);
    private onDidAddRepository;
    private updateContextKey;
    dispose(): void;
}
