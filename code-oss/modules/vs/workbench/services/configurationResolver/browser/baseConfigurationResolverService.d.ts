import { IStringDictionary } from 'vs/base/common/collections';
import { IProcessEnvironment } from 'vs/base/common/platform';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { ConfigurationTarget, IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { ILabelService } from 'vs/platform/label/common/label';
import { IQuickInputService } from 'vs/platform/quickinput/common/quickInput';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { AbstractVariableResolverService } from 'vs/workbench/services/configurationResolver/common/variableResolver';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IPathService } from 'vs/workbench/services/path/common/pathService';
export declare abstract class BaseConfigurationResolverService extends AbstractVariableResolverService {
    private readonly configurationService;
    private readonly commandService;
    private readonly workspaceContextService;
    private readonly quickInputService;
    private readonly labelService;
    private readonly pathService;
    static readonly INPUT_OR_COMMAND_VARIABLES_PATTERN: RegExp;
    private userInputAccessQueue;
    constructor(context: {
        getAppRoot: () => string | undefined;
        getExecPath: () => string | undefined;
    }, envVariablesPromise: Promise<IProcessEnvironment>, editorService: IEditorService, configurationService: IConfigurationService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, quickInputService: IQuickInputService, labelService: ILabelService, pathService: IPathService, extensionService: IExtensionService);
    resolveWithInteractionReplace(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<any>;
    resolveWithInteraction(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<Map<string, string> | undefined>;
    /**
     * Add all items from newMapping to fullMapping. Returns false if newMapping is undefined.
     */
    private updateMapping;
    /**
     * Finds and executes all input and command variables in the given configuration and returns their values as a dictionary.
     * Please note: this method does not substitute the input or command variables (so the configuration is not modified).
     * The returned dictionary can be passed to "resolvePlatform" for the actual substitution.
     * See #6569.
     *
     * @param variableToCommandMap Aliases for commands
     */
    private resolveWithInputAndCommands;
    /**
     * Recursively finds all command or input variables in object and pushes them into variables.
     * @param object object is searched for variables.
     * @param variables All found variables are returned in variables.
     */
    private findVariables;
    /**
     * Takes the provided input info and shows the quick pick so the user can provide the value for the input
     * @param variable Name of the input variable.
     * @param inputInfos Information about each possible input variable.
     */
    private showUserInput;
}
