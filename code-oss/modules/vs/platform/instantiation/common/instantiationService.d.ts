import { SyncDescriptor0 } from 'vs/platform/instantiation/common/descriptors';
import { Graph } from 'vs/platform/instantiation/common/graph';
import { GetLeadingNonServiceArgs, IInstantiationService, ServiceIdentifier, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
export declare class InstantiationService implements IInstantiationService {
    private readonly _services;
    private readonly _strict;
    private readonly _parent?;
    private readonly _enableTracing;
    readonly _serviceBrand: undefined;
    readonly _globalGraph?: Graph<string>;
    private _globalGraphImplicitDependency?;
    constructor(_services?: ServiceCollection, _strict?: boolean, _parent?: InstantiationService | undefined, _enableTracing?: boolean);
    createChild(services: ServiceCollection): IInstantiationService;
    invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;
    createInstance<T>(descriptor: SyncDescriptor0<T>): T;
    createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
    private _createInstance;
    private _setServiceInstance;
    private _getServiceInstanceOrDescriptor;
    protected _getOrCreateServiceInstance<T>(id: ServiceIdentifier<T>, _trace: Trace): T;
    private readonly _activeInstantiations;
    private _safeCreateAndCacheServiceInstance;
    private _createAndCacheServiceInstance;
    private _createServiceInstanceWithOwner;
    private _createServiceInstance;
    private _throwIfStrict;
}
declare const enum TraceType {
    Creation = 0,
    Invocation = 1,
    Branch = 2
}
export declare class Trace {
    readonly type: TraceType;
    readonly name: string | null;
    static all: Set<string>;
    private static readonly _None;
    static traceInvocation(_enableTracing: boolean, ctor: any): Trace;
    static traceCreation(_enableTracing: boolean, ctor: any): Trace;
    private static _totals;
    private readonly _start;
    private readonly _dep;
    private constructor();
    branch(id: ServiceIdentifier<any>, first: boolean): Trace;
    stop(): void;
}
export {};
