import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { MainThreadConfigurationShape } from '../common/extHost.protocol';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { ConfigurationTarget, IConfigurationService, IConfigurationOverrides } from 'vs/platform/configuration/common/configuration';
import { IEnvironmentService } from 'vs/platform/environment/common/environment';
export declare class MainThreadConfiguration implements MainThreadConfigurationShape {
    private readonly _workspaceContextService;
    private readonly configurationService;
    private readonly _environmentService;
    private readonly _configurationListener;
    constructor(extHostContext: IExtHostContext, _workspaceContextService: IWorkspaceContextService, configurationService: IConfigurationService, _environmentService: IEnvironmentService);
    private _getConfigurationData;
    dispose(): void;
    $updateConfigurationOption(target: ConfigurationTarget | null, key: string, value: any, overrides: IConfigurationOverrides | undefined, scopeToLanguage: boolean | undefined): Promise<void>;
    $removeConfigurationOption(target: ConfigurationTarget | null, key: string, overrides: IConfigurationOverrides | undefined, scopeToLanguage: boolean | undefined): Promise<void>;
    private writeConfiguration;
    private _updateValue;
    private deriveConfigurationTarget;
}
