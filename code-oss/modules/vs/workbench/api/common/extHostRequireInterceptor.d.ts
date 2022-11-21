import { URI } from 'vs/base/common/uri';
import { IExtHostConfiguration } from 'vs/workbench/api/common/extHostConfiguration';
import { IExtensionApiFactory, IExtensionRegistries } from 'vs/workbench/api/common/extHost.api.impl';
import { IExtHostInitDataService } from 'vs/workbench/api/common/extHostInitDataService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtHostExtensionService } from 'vs/workbench/api/common/extHostExtensionService';
import { ILogService } from 'vs/platform/log/common/log';
interface LoadFunction {
    (request: string): any;
}
interface IAlternativeModuleProvider {
    alternativeModuleName(name: string): string | undefined;
}
interface INodeModuleFactory extends Partial<IAlternativeModuleProvider> {
    readonly nodeModuleName: string | string[];
    load(request: string, parent: URI, original: LoadFunction): any;
}
export declare abstract class RequireInterceptor {
    private _apiFactory;
    private _extensionRegistry;
    private readonly _instaService;
    private readonly _extHostConfiguration;
    private readonly _extHostExtensionService;
    private readonly _initData;
    private readonly _logService;
    protected readonly _factories: Map<string, INodeModuleFactory>;
    protected readonly _alternatives: ((moduleName: string) => string | undefined)[];
    constructor(_apiFactory: IExtensionApiFactory, _extensionRegistry: IExtensionRegistries, _instaService: IInstantiationService, _extHostConfiguration: IExtHostConfiguration, _extHostExtensionService: IExtHostExtensionService, _initData: IExtHostInitDataService, _logService: ILogService);
    install(): Promise<void>;
    protected abstract _installInterceptor(): void;
    register(interceptor: INodeModuleFactory | IAlternativeModuleProvider): void;
}
export {};
