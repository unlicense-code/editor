import { IURLHandler } from 'vs/platform/url/common/url';
import { ExtensionIdentifier } from 'vs/platform/extensions/common/extensions';
export declare const IExtensionUrlHandler: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IExtensionUrlHandler>;
export interface IExtensionUrlHandler {
    readonly _serviceBrand: undefined;
    registerExtensionHandler(extensionId: ExtensionIdentifier, handler: IURLHandler): void;
    unregisterExtensionHandler(extensionId: ExtensionIdentifier): void;
}
export interface ExtensionUrlHandlerEvent {
    readonly extensionId: string;
}
