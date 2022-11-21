import { IFileService } from 'vs/platform/files/common/files';
import { IOpenerService } from 'vs/platform/opener/common/opener';
import { IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IWorkbenchEnvironmentService } from 'vs/workbench/services/environment/common/environmentService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { ITunnelService } from 'vs/platform/tunnel/common/tunnel';
export declare class LinkDetector {
    private readonly editorService;
    private readonly fileService;
    private readonly openerService;
    private readonly pathService;
    private readonly tunnelService;
    private readonly environmentService;
    constructor(editorService: IEditorService, fileService: IFileService, openerService: IOpenerService, pathService: IPathService, tunnelService: ITunnelService, environmentService: IWorkbenchEnvironmentService);
    /**
     * Matches and handles web urls, absolute and relative file links in the string provided.
     * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
     * 'onclick' event is attached to all anchored links that opens them in the editor.
     * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
     * and added as a child of the returned <span>.
     */
    linkify(text: string, splitLines?: boolean, workspaceFolder?: IWorkspaceFolder, includeFulltext?: boolean): HTMLElement;
    private createWebLink;
    private createPathLink;
    private createLink;
    private decorateLink;
    private detectLinks;
}
