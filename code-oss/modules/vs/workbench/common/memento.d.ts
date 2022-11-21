import { IStorageService, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
export declare type MementoObject = {
    [key: string]: any;
};
export declare class Memento {
    private storageService;
    private static readonly applicationMementos;
    private static readonly profileMementos;
    private static readonly workspaceMementos;
    private static readonly COMMON_PREFIX;
    private readonly id;
    constructor(id: string, storageService: IStorageService);
    getMemento(scope: StorageScope, target: StorageTarget): MementoObject;
    saveMemento(): void;
    static clear(scope: StorageScope): void;
}
