import { IJSONSchema } from 'vs/base/common/jsonSchema';
import { IMessage } from 'vs/workbench/services/extensions/common/extensions';
import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ExtensionKind } from 'vs/platform/environment/common/environment';
import { IActivationEventsGenerator } from 'vs/platform/extensionManagement/common/implicitActivationEvents';
export declare class ExtensionMessageCollector {
    private readonly _messageHandler;
    private readonly _extension;
    private readonly _extensionPointId;
    constructor(messageHandler: (msg: IMessage) => void, extension: IExtensionDescription, extensionPointId: string);
    private _msg;
    error(message: string): void;
    warn(message: string): void;
    info(message: string): void;
}
export interface IExtensionPointUser<T> {
    description: IExtensionDescription;
    value: T;
    collector: ExtensionMessageCollector;
}
export declare type IExtensionPointHandler<T> = (extensions: readonly IExtensionPointUser<T>[], delta: ExtensionPointUserDelta<T>) => void;
export interface IExtensionPoint<T> {
    readonly name: string;
    setHandler(handler: IExtensionPointHandler<T>): void;
    readonly defaultExtensionKind: ExtensionKind[] | undefined;
}
export declare class ExtensionPointUserDelta<T> {
    readonly added: readonly IExtensionPointUser<T>[];
    readonly removed: readonly IExtensionPointUser<T>[];
    private static _toSet;
    static compute<T>(previous: readonly IExtensionPointUser<T>[] | null, current: readonly IExtensionPointUser<T>[]): ExtensionPointUserDelta<T>;
    constructor(added: readonly IExtensionPointUser<T>[], removed: readonly IExtensionPointUser<T>[]);
}
export declare class ExtensionPoint<T> implements IExtensionPoint<T> {
    readonly name: string;
    readonly defaultExtensionKind: ExtensionKind[] | undefined;
    private _handler;
    private _users;
    private _delta;
    constructor(name: string, defaultExtensionKind: ExtensionKind[] | undefined);
    setHandler(handler: IExtensionPointHandler<T>): void;
    acceptUsers(users: IExtensionPointUser<T>[]): void;
    private _handle;
}
export declare const schema: IJSONSchema;
export declare type toArray<T> = T extends Array<any> ? T : T[];
export interface IExtensionPointDescriptor<T> {
    extensionPoint: string;
    deps?: IExtensionPoint<any>[];
    jsonSchema: IJSONSchema;
    defaultExtensionKind?: ExtensionKind[];
    /**
     * A function which runs before the extension point has been validated and which
     * can should collect automatic activation events from the contribution.
     */
    activationEventsGenerator?: IActivationEventsGenerator<toArray<T>>;
}
export declare class ExtensionsRegistryImpl {
    private readonly _extensionPoints;
    registerExtensionPoint<T>(desc: IExtensionPointDescriptor<T>): IExtensionPoint<T>;
    getExtensionPoints(): ExtensionPoint<any>[];
}
export declare const ExtensionsRegistry: ExtensionsRegistryImpl;
