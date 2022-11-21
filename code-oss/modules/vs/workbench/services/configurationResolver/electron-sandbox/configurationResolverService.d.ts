import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { BaseConfigurationResolverService } from 'vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService';
import { ILabelService } from 'vs/platform/label/common/label';
import { IShellEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/shellEnvironmentService';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare class ConfigurationResolverService extends BaseConfigurationResolverService {
    constructor(editorService: IEditorService, environmentService: INativeWorkbenchEnvironmentService, configurationService: IConfigurationService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, quickInputService: IQuickInputService, labelService: ILabelService, shellEnvironmentService: IShellEnvironmentService, pathService: IPathService, extensionService: IExtensionService);
}
