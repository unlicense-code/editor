import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
export declare class DeltaExtensionsResult {
    readonly removedDueToLooping: IExtensionDescription[];
    constructor(removedDueToLooping: IExtensionDescription[]);
}
export declare class ExtensionDescriptionRegistry {
    private readonly _onDidChange;
    readonly onDidChange: import("vs/base/common/event").Event<void>;
    private _extensionDescriptions;
    private _extensionsMap;
    private _extensionsArr;
    private _activationMap;
    constructor(extensionDescriptions: IExtensionDescription[]);
    private _initialize;
    set(extensionDescriptions: IExtensionDescription[]): void;
    deltaExtensions(toAdd: IExtensionDescription[], toRemove: ExtensionIdentifier[]): DeltaExtensionsResult;
    private static _findLoopingExtensions;
    containsActivationEvent(activationEvent: string): boolean;
    containsExtension(extensionId: ExtensionIdentifier): boolean;
    getExtensionDescriptionsForActivationEvent(activationEvent: string): IExtensionDescription[];
    getAllExtensionDescriptions(): IExtensionDescription[];
    getExtensionDescription(extensionId: ExtensionIdentifier | string): IExtensionDescription | undefined;
    getExtensionDescriptionByUUID(uuid: string): IExtensionDescription | undefined;
    getExtensionDescriptionByIdOrUUID(extensionId: ExtensionIdentifier | string, uuid: string | undefined): IExtensionDescription | undefined;
}
