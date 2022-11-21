import { URI } from 'vs/base/common/uri';
import { IDisposable, Disposable } from 'vs/base/common/lifecycle';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IWorkspaceContextService, IWorkspace, ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from 'vs/platform/workspace/common/workspace';
import { ILabelService, ResourceLabelFormatter, ResourceLabelFormatting, IFormatterChangeEvent } from 'vs/platform/label/common/label';
import { ILifecycleService } from 'vs/workbench/services/lifecycle/common/lifecycle';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
import { IStorageService } from 'vs/platform/storage/common/storage';
export declare class LabelService extends Disposable implements ILabelService {
    private readonly environmentService;
    private readonly contextService;
    private readonly pathService;
    private readonly remoteAgentService;
    readonly _serviceBrand: undefined;
    private formatters;
    private readonly _onDidChangeFormatters;
    readonly onDidChangeFormatters: import("vs/base/common/event").Event<IFormatterChangeEvent>;
    private readonly storedFormattersMemento;
    private readonly storedFormatters;
    private os;
    private userHome;
    constructor(environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService, pathService: IPathService, remoteAgentService: IRemoteAgentService, storageService: IStorageService, lifecycleService: ILifecycleService);
    private resolveRemoteEnvironment;
    findFormatting(resource: URI): ResourceLabelFormatting | undefined;
    getUriLabel(resource: URI, options?: {
        relative?: boolean;
        noPrefix?: boolean;
        separator?: '/' | '\\';
    }): string;
    private doGetUriLabel;
    getUriBasenameLabel(resource: URI): string;
    getWorkspaceLabel(workspace: IWorkspace | IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI, options?: {
        verbose: boolean;
    }): string;
    private doGetWorkspaceLabel;
    private doGetSingleFolderWorkspaceLabel;
    getSeparator(scheme: string, authority?: string): '/' | '\\';
    getHostLabel(scheme: string, authority?: string): string;
    getHostTooltip(scheme: string, authority?: string): string | undefined;
    registerCachedFormatter(formatter: ResourceLabelFormatter): IDisposable;
    registerFormatter(formatter: ResourceLabelFormatter): IDisposable;
    private formatUri;
    private appendWorkspaceSuffix;
}
