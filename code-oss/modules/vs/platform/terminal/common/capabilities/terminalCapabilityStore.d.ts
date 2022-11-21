import { Disposable } from 'vs/base/common/lifecycle';
import { ITerminalCapabilityImplMap, ITerminalCapabilityStore, TerminalCapability } from 'vs/platform/terminal/common/capabilities/capabilities';
export declare class TerminalCapabilityStore extends Disposable implements ITerminalCapabilityStore {
    private _map;
    private readonly _onDidRemoveCapability;
    readonly onDidRemoveCapability: import("vs/base/common/event").Event<TerminalCapability>;
    private readonly _onDidAddCapability;
    readonly onDidAddCapability: import("vs/base/common/event").Event<TerminalCapability>;
    get items(): IterableIterator<TerminalCapability>;
    add<T extends TerminalCapability>(capability: T, impl: ITerminalCapabilityImplMap[T]): void;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
    remove(capability: TerminalCapability): void;
    has(capability: TerminalCapability): boolean;
}
export declare class TerminalCapabilityStoreMultiplexer extends Disposable implements ITerminalCapabilityStore {
    readonly _stores: ITerminalCapabilityStore[];
    private readonly _onDidRemoveCapability;
    readonly onDidRemoveCapability: import("vs/base/common/event").Event<TerminalCapability>;
    private readonly _onDidAddCapability;
    readonly onDidAddCapability: import("vs/base/common/event").Event<TerminalCapability>;
    get items(): IterableIterator<TerminalCapability>;
    private _items;
    has(capability: TerminalCapability): boolean;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
    add(store: ITerminalCapabilityStore): void;
}
