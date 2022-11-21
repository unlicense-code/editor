import { IExtensionHostInitData } from 'vs/workbench/services/extensions/common/extensionHostProtocol';
export declare const IExtHostInitDataService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtHostInitDataService>;
export interface IExtHostInitDataService extends Readonly<IExtensionHostInitData> {
    readonly _serviceBrand: undefined;
}
