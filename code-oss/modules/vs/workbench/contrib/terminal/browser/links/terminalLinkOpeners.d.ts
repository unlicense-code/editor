import { OperatingSystem } from 'vs/base/common/platform';
import { URI } from 'vs/base/common/uri';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IFileService } from 'vs/platform/files/common/files';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { ITerminalLinkOpener, ITerminalSimpleLink } from 'vs/workbench/contrib/terminal/browser/links/links';
import { ILineColumnInfo } from 'vs/workbench/contrib/terminal/browser/links/terminalLinkManager';
import { ITerminalCapabilityStore } from 'vs/platform/terminal/common/capabilities/capabilities';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IHostService } from 'vs/workbench/services/host/browser/host';
import { QueryBuilder } from 'vs/workbench/services/search/common/queryBuilder';
import { ISearchService } from 'vs/workbench/services/search/common/search';
export declare class TerminalLocalFileLinkOpener implements ITerminalLinkOpener {
    private readonly _os;
    private readonly _editorService;
    constructor(_os: OperatingSystem, _editorService: IEditorService);
    open(link: ITerminalSimpleLink): Promise<void>;
    /**
     * Returns line and column number of URl if that is present, otherwise line 1 column 1.
     *
     * @param link Url link which may contain line and column number.
     */
    extractLineColumnInfo(link: string, uri: URI): ILineColumnInfo;
}
export declare class TerminalLocalFolderInWorkspaceLinkOpener implements ITerminalLinkOpener {
    private readonly _commandService;
    constructor(_commandService: ICommandService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
export declare class TerminalLocalFolderOutsideWorkspaceLinkOpener implements ITerminalLinkOpener {
    private readonly _hostService;
    constructor(_hostService: IHostService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
export declare class TerminalSearchLinkOpener implements ITerminalLinkOpener {
    private readonly _capabilities;
    private readonly _initialCwd;
    private readonly _localFileOpener;
    private readonly _localFolderInWorkspaceOpener;
    private readonly _os;
    private readonly _fileService;
    private readonly _instantiationService;
    private readonly _quickInputService;
    private readonly _searchService;
    private readonly _workspaceContextService;
    private readonly _workbenchEnvironmentService;
    protected _fileQueryBuilder: QueryBuilder;
    constructor(_capabilities: ITerminalCapabilityStore, _initialCwd: Promise<string>, _localFileOpener: TerminalLocalFileLinkOpener, _localFolderInWorkspaceOpener: TerminalLocalFolderInWorkspaceLinkOpener, _os: OperatingSystem, _fileService: IFileService, _instantiationService: IInstantiationService, _quickInputService: IQuickInputService, _searchService: ISearchService, _workspaceContextService: IWorkspaceContextService, _workbenchEnvironmentService: IWorkbenchEnvironmentService);
    open(link: ITerminalSimpleLink): Promise<void>;
    private _getExactMatch;
    private _tryOpenExactLink;
}
export declare class TerminalUrlLinkOpener implements ITerminalLinkOpener {
    private readonly _isRemote;
    private readonly _openerService;
    constructor(_isRemote: boolean, _openerService: IOpenerService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
