export declare const IStateService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IStateService>;
export interface IStateService {
    readonly _serviceBrand: undefined;
    getItem<T>(key: string, defaultValue: T): T;
    getItem<T>(key: string, defaultValue?: T): T | undefined;
}
