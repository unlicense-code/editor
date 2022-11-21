import { Disposable } from 'vs/base/common/lifecycle';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
import { IFileService } from 'vs/platform/files/common/files';
import { ILabelService } from 'vs/platform/label/common/label';
import { ILogService } from 'vs/platform/log/common/log';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { ITerminalEditorService, ITerminalGroupService, ITerminalService } from 'vs/workbench/contrib/terminal/browser/terminal';
import { IEditorResolverService } from 'vs/workbench/services/editor/common/editorResolverService';
/**
 * The main contribution for the terminal contrib. This contains calls to other components necessary
 * to set up the terminal but don't need to be tracked in the long term (where TerminalService would
 * be more relevant).
 */
export declare class TerminalMainContribution extends Disposable implements IWorkbenchContribution {
    private readonly _fileService;
    private readonly _logService;
    constructor(editorResolverService: IEditorResolverService, environmentService: IEnvironmentService, _fileService: IFileService, labelService: ILabelService, _logService: ILogService, terminalService: ITerminalService, terminalEditorService: ITerminalEditorService, terminalGroupService: ITerminalGroupService);
    private _registerLogChannel;
}
