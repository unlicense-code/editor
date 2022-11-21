import { ExtHostConfigProvider } from 'vs/workbench/api/common/extHostConfiguration';
import { ExtensionDescriptionRegistry } from 'vs/workbench/services/extensions/common/extensionDescriptionRegistry';
import type * as vscode from 'vscode';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export interface IExtensionRegistries {
    mine: ExtensionDescriptionRegistry;
    all: ExtensionDescriptionRegistry;
}
export interface IExtensionApiFactory {
    (extension: IExtensionDescription, extensionInfo: IExtensionRegistries, configProvider: ExtHostConfigProvider): typeof vscode;
}
/**
 * This method instantiates and returns the extension API surface
 */
export declare function createApiFactoryAndRegisterActors(accessor: ServicesAccessor): IExtensionApiFactory;
