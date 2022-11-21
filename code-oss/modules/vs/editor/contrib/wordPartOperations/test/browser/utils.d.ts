import { ServiceIdentifier, ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
export declare class StaticServiceAccessor implements ServicesAccessor {
    private services;
    withService<T>(id: ServiceIdentifier<T>, service: T): this;
    get<T>(id: ServiceIdentifier<T>): T;
}
