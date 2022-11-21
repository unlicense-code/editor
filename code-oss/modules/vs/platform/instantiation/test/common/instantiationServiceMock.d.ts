import * as sinon from 'sinon';
import { DisposableStore } from 'vs/base/common/lifecycle';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { InstantiationService } from 'vs/platform/instantiation/common/instantiationService';
import { ServiceCollection } from 'vs/platform/instantiation/common/serviceCollection';
export declare class TestInstantiationService extends InstantiationService {
    private _serviceCollection;
    private _servciesMap;
    constructor(_serviceCollection?: ServiceCollection, strict?: boolean);
    get<T>(service: ServiceIdentifier<T>): T;
    set<T>(service: ServiceIdentifier<T>, instance: T): T;
    mock<T>(service: ServiceIdentifier<T>): T | sinon.SinonMock;
    stub<T>(service: ServiceIdentifier<T>, ctor: Function): T;
    stub<T>(service: ServiceIdentifier<T>, obj: Partial<T>): T;
    stub<T, V>(service: ServiceIdentifier<T>, ctor: Function, property: string, value: V): V extends Function ? sinon.SinonSpy : sinon.SinonStub;
    stub<T, V>(service: ServiceIdentifier<T>, obj: Partial<T>, property: string, value: V): V extends Function ? sinon.SinonSpy : sinon.SinonStub;
    stub<T, V>(service: ServiceIdentifier<T>, property: string, value: V): V extends Function ? sinon.SinonSpy : sinon.SinonStub;
    stubPromise<T>(service?: ServiceIdentifier<T>, fnProperty?: string, value?: any): T | sinon.SinonStub;
    stubPromise<T, V>(service?: ServiceIdentifier<T>, ctor?: any, fnProperty?: string, value?: V): V extends Function ? sinon.SinonSpy : sinon.SinonStub;
    stubPromise<T, V>(service?: ServiceIdentifier<T>, obj?: any, fnProperty?: string, value?: V): V extends Function ? sinon.SinonSpy : sinon.SinonStub;
    spy<T>(service: ServiceIdentifier<T>, fnProperty: string): sinon.SinonSpy;
    private _create;
    private _getOrCreateService;
    private _createService;
    private _createStub;
    private isServiceMock;
}
export declare type ServiceIdCtorPair<T> = [id: ServiceIdentifier<T>, ctorOrInstance: T | (new (...args: any[]) => T)];
export declare function createServices(disposables: DisposableStore, services: ServiceIdCtorPair<any>[]): TestInstantiationService;
