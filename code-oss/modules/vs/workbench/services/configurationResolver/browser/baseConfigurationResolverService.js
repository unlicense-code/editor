/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Queue } from 'vs/base/common/async';
import { Schemas } from 'vs/base/common/network';
import * as Types from 'vs/base/common/types';
import { isCodeEditor, isDiffEditor } from 'vs/editor/browser/editorBrowser';
import * as nls from 'vs/nls';
import { EditorResourceAccessor, SideBySideEditor } from 'vs/workbench/common/editor';
import { AbstractVariableResolverService } from 'vs/workbench/services/configurationResolver/common/variableResolver';
export class BaseConfigurationResolverService extends AbstractVariableResolverService {
    configurationService;
    commandService;
    workspaceContextService;
    quickInputService;
    labelService;
    pathService;
    static INPUT_OR_COMMAND_VARIABLES_PATTERN = /\${((input|command):(.*?))}/g;
    userInputAccessQueue = new Queue();
    constructor(context, envVariablesPromise, editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService) {
        super({
            getFolderUri: (folderName) => {
                const folder = workspaceContextService.getWorkspace().folders.filter(f => f.name === folderName).pop();
                return folder ? folder.uri : undefined;
            },
            getWorkspaceFolderCount: () => {
                return workspaceContextService.getWorkspace().folders.length;
            },
            getConfigurationValue: (folderUri, suffix) => {
                return configurationService.getValue(suffix, folderUri ? { resource: folderUri } : {});
            },
            getAppRoot: () => {
                return context.getAppRoot();
            },
            getExecPath: () => {
                return context.getExecPath();
            },
            getFilePath: () => {
                const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
                    supportSideBySide: SideBySideEditor.PRIMARY,
                    filterByScheme: [Schemas.file, Schemas.vscodeUserData, this.pathService.defaultUriScheme]
                });
                if (!fileResource) {
                    return undefined;
                }
                return this.labelService.getUriLabel(fileResource, { noPrefix: true });
            },
            getWorkspaceFolderPathForFile: () => {
                const fileResource = EditorResourceAccessor.getOriginalUri(editorService.activeEditor, {
                    supportSideBySide: SideBySideEditor.PRIMARY,
                    filterByScheme: [Schemas.file, Schemas.vscodeUserData, this.pathService.defaultUriScheme]
                });
                if (!fileResource) {
                    return undefined;
                }
                const wsFolder = workspaceContextService.getWorkspaceFolder(fileResource);
                if (!wsFolder) {
                    return undefined;
                }
                return this.labelService.getUriLabel(wsFolder.uri, { noPrefix: true });
            },
            getSelectedText: () => {
                const activeTextEditorControl = editorService.activeTextEditorControl;
                let activeControl = null;
                if (isCodeEditor(activeTextEditorControl)) {
                    activeControl = activeTextEditorControl;
                }
                else if (isDiffEditor(activeTextEditorControl)) {
                    const original = activeTextEditorControl.getOriginalEditor();
                    const modified = activeTextEditorControl.getModifiedEditor();
                    activeControl = original.hasWidgetFocus() ? original : modified;
                }
                const activeModel = activeControl?.getModel();
                const activeSelection = activeControl?.getSelection();
                if (activeModel && activeSelection) {
                    return activeModel.getValueInRange(activeSelection);
                }
                return undefined;
            },
            getLineNumber: () => {
                const activeTextEditorControl = editorService.activeTextEditorControl;
                if (isCodeEditor(activeTextEditorControl)) {
                    const selection = activeTextEditorControl.getSelection();
                    if (selection) {
                        const lineNumber = selection.positionLineNumber;
                        return String(lineNumber);
                    }
                }
                return undefined;
            },
            getExtension: id => {
                return extensionService.getExtension(id);
            },
        }, labelService, pathService.userHome().then(home => home.path), envVariablesPromise);
        this.configurationService = configurationService;
        this.commandService = commandService;
        this.workspaceContextService = workspaceContextService;
        this.quickInputService = quickInputService;
        this.labelService = labelService;
        this.pathService = pathService;
    }
    async resolveWithInteractionReplace(folder, config, section, variables, target) {
        // resolve any non-interactive variables and any contributed variables
        config = await this.resolveAnyAsync(folder, config);
        // resolve input variables in the order in which they are encountered
        return this.resolveWithInteraction(folder, config, section, variables, target).then(mapping => {
            // finally substitute evaluated command variables (if there are any)
            if (!mapping) {
                return null;
            }
            else if (mapping.size > 0) {
                return this.resolveAnyAsync(folder, config, Object.fromEntries(mapping));
            }
            else {
                return config;
            }
        });
    }
    async resolveWithInteraction(folder, config, section, variables, target) {
        // resolve any non-interactive variables and any contributed variables
        const resolved = await this.resolveAnyMap(folder, config);
        config = resolved.newConfig;
        const allVariableMapping = resolved.resolvedVariables;
        // resolve input and command variables in the order in which they are encountered
        return this.resolveWithInputAndCommands(folder, config, variables, section, target).then(inputOrCommandMapping => {
            if (this.updateMapping(inputOrCommandMapping, allVariableMapping)) {
                return allVariableMapping;
            }
            return undefined;
        });
    }
    /**
     * Add all items from newMapping to fullMapping. Returns false if newMapping is undefined.
     */
    updateMapping(newMapping, fullMapping) {
        if (!newMapping) {
            return false;
        }
        for (const [key, value] of Object.entries(newMapping)) {
            fullMapping.set(key, value);
        }
        return true;
    }
    /**
     * Finds and executes all input and command variables in the given configuration and returns their values as a dictionary.
     * Please note: this method does not substitute the input or command variables (so the configuration is not modified).
     * The returned dictionary can be passed to "resolvePlatform" for the actual substitution.
     * See #6569.
     *
     * @param variableToCommandMap Aliases for commands
     */
    async resolveWithInputAndCommands(folder, configuration, variableToCommandMap, section, target) {
        if (!configuration) {
            return Promise.resolve(undefined);
        }
        // get all "inputs"
        let inputs = [];
        if (this.workspaceContextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && section) {
            const overrides = folder ? { resource: folder.uri } : {};
            const result = this.configurationService.inspect(section, overrides);
            if (result && (result.userValue || result.workspaceValue || result.workspaceFolderValue)) {
                switch (target) {
                    case 2 /* ConfigurationTarget.USER */:
                        inputs = result.userValue?.inputs;
                        break;
                    case 5 /* ConfigurationTarget.WORKSPACE */:
                        inputs = result.workspaceValue?.inputs;
                        break;
                    default: inputs = result.workspaceFolderValue?.inputs;
                }
            }
            else {
                const valueResult = this.configurationService.getValue(section, overrides);
                if (valueResult) {
                    inputs = valueResult.inputs;
                }
            }
        }
        // extract and dedupe all "input" and "command" variables and preserve their order in an array
        const variables = [];
        this.findVariables(configuration, variables);
        const variableValues = Object.create(null);
        for (const variable of variables) {
            const [type, name] = variable.split(':', 2);
            let result;
            switch (type) {
                case 'input':
                    result = await this.showUserInput(name, inputs);
                    break;
                case 'command': {
                    // use the name as a command ID #12735
                    const commandId = (variableToCommandMap ? variableToCommandMap[name] : undefined) || name;
                    result = await this.commandService.executeCommand(commandId, configuration);
                    if (typeof result !== 'string' && !Types.isUndefinedOrNull(result)) {
                        throw new Error(nls.localize('commandVariable.noStringType', "Cannot substitute command variable '{0}' because command did not return a result of type string.", commandId));
                    }
                    break;
                }
                default:
                    // Try to resolve it as a contributed variable
                    if (this._contributedVariables.has(variable)) {
                        result = await this._contributedVariables.get(variable)();
                    }
            }
            if (typeof result === 'string') {
                variableValues[variable] = result;
            }
            else {
                return undefined;
            }
        }
        return variableValues;
    }
    /**
     * Recursively finds all command or input variables in object and pushes them into variables.
     * @param object object is searched for variables.
     * @param variables All found variables are returned in variables.
     */
    findVariables(object, variables) {
        if (typeof object === 'string') {
            let matches;
            while ((matches = BaseConfigurationResolverService.INPUT_OR_COMMAND_VARIABLES_PATTERN.exec(object)) !== null) {
                if (matches.length === 4) {
                    const command = matches[1];
                    if (variables.indexOf(command) < 0) {
                        variables.push(command);
                    }
                }
            }
            for (const contributed of this._contributedVariables.keys()) {
                if ((variables.indexOf(contributed) < 0) && (object.indexOf('${' + contributed + '}') >= 0)) {
                    variables.push(contributed);
                }
            }
        }
        else if (Array.isArray(object)) {
            for (const value of object) {
                this.findVariables(value, variables);
            }
        }
        else if (object) {
            for (const value of Object.values(object)) {
                this.findVariables(value, variables);
            }
        }
    }
    /**
     * Takes the provided input info and shows the quick pick so the user can provide the value for the input
     * @param variable Name of the input variable.
     * @param inputInfos Information about each possible input variable.
     */
    showUserInput(variable, inputInfos) {
        if (!inputInfos) {
            return Promise.reject(new Error(nls.localize('inputVariable.noInputSection', "Variable '{0}' must be defined in an '{1}' section of the debug or task configuration.", variable, 'input')));
        }
        // find info for the given input variable
        const info = inputInfos.filter(item => item.id === variable).pop();
        if (info) {
            const missingAttribute = (attrName) => {
                throw new Error(nls.localize('inputVariable.missingAttribute', "Input variable '{0}' is of type '{1}' and must include '{2}'.", variable, info.type, attrName));
            };
            switch (info.type) {
                case 'promptString': {
                    if (!Types.isString(info.description)) {
                        missingAttribute('description');
                    }
                    const inputOptions = { prompt: info.description, ignoreFocusLost: true };
                    if (info.default) {
                        inputOptions.value = info.default;
                    }
                    if (info.password) {
                        inputOptions.password = info.password;
                    }
                    return this.userInputAccessQueue.queue(() => this.quickInputService.input(inputOptions)).then(resolvedInput => {
                        return resolvedInput;
                    });
                }
                case 'pickString': {
                    if (!Types.isString(info.description)) {
                        missingAttribute('description');
                    }
                    if (Array.isArray(info.options)) {
                        for (const pickOption of info.options) {
                            if (!Types.isString(pickOption) && !Types.isString(pickOption.value)) {
                                missingAttribute('value');
                            }
                        }
                    }
                    else {
                        missingAttribute('options');
                    }
                    const picks = new Array();
                    for (const pickOption of info.options) {
                        const value = Types.isString(pickOption) ? pickOption : pickOption.value;
                        const label = Types.isString(pickOption) ? undefined : pickOption.label;
                        // If there is no label defined, use value as label
                        const item = {
                            label: label ? `${label}: ${value}` : value,
                            value: value
                        };
                        if (value === info.default) {
                            item.description = nls.localize('inputVariable.defaultInputValue', "(Default)");
                            picks.unshift(item);
                        }
                        else {
                            picks.push(item);
                        }
                    }
                    const pickOptions = { placeHolder: info.description, matchOnDetail: true, ignoreFocusLost: true };
                    return this.userInputAccessQueue.queue(() => this.quickInputService.pick(picks, pickOptions, undefined)).then(resolvedInput => {
                        if (resolvedInput) {
                            return resolvedInput.value;
                        }
                        return undefined;
                    });
                }
                case 'command': {
                    if (!Types.isString(info.command)) {
                        missingAttribute('command');
                    }
                    return this.userInputAccessQueue.queue(() => this.commandService.executeCommand(info.command, info.args)).then(result => {
                        if (typeof result === 'string' || Types.isUndefinedOrNull(result)) {
                            return result;
                        }
                        throw new Error(nls.localize('inputVariable.command.noStringType', "Cannot substitute input variable '{0}' because command '{1}' did not return a result of type string.", variable, info.command));
                    });
                }
                default:
                    throw new Error(nls.localize('inputVariable.unknownType', "Input variable '{0}' can only be of type 'promptString', 'pickString', or 'command'.", variable));
            }
        }
        return Promise.reject(new Error(nls.localize('inputVariable.undefinedVariable', "Undefined input variable '{0}' encountered. Remove or define '{0}' to continue.", variable)));
    }
}
