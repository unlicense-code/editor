import { Disposable } from 'vs/base/common/lifecycle';
import { IExtHostDocumentsAndEditors } from 'vs/workbench/api/common/extHostDocumentsAndEditors';
import { IExtHostEditorTabs } from 'vs/workbench/api/common/extHostEditorTabs';
import { IExtHostExtensionService } from 'vs/workbench/api/common/extHostExtensionService';
import { IExtHostWorkspace } from 'vs/workbench/api/common/extHostWorkspace';
import { IConfigurationResolverService } from 'vs/workbench/services/configurationResolver/common/configurationResolver';
import { IExtHostConfiguration } from './extHostConfiguration';
export interface IExtHostVariableResolverProvider {
    readonly _serviceBrand: undefined;
    getResolver(): Promise<IConfigurationResolverService>;
}
export declare const IExtHostVariableResolverProvider: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostVariableResolverProvider>;
export declare class ExtHostVariableResolverProviderService extends Disposable implements IExtHostVariableResolverProvider {
    private readonly extensionService;
    private readonly workspaceService;
    private readonly editorService;
    private readonly configurationService;
    private readonly editorTabs;
    readonly _serviceBrand: undefined;
    private _resolver;
    constructor(extensionService: IExtHostExtensionService, workspaceService: IExtHostWorkspace, editorService: IExtHostDocumentsAndEditors, configurationService: IExtHostConfiguration, editorTabs: IExtHostEditorTabs);
    getResolver(): Promise<IConfigurationResolverService>;
    protected homeDir(): string | undefined;
}
