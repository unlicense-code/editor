import { MementoObject } from 'vs/workbench/common/memento';
import { IThemeService, Themable } from 'vs/platform/theme/common/themeService';
import { IStorageService, StorageScope, StorageTarget } from 'vs/platform/storage/common/storage';
export declare class Component extends Themable {
    private readonly id;
    private readonly memento;
    constructor(id: string, themeService: IThemeService, storageService: IStorageService);
    getId(): string;
    protected getMemento(scope: StorageScope, target: StorageTarget): MementoObject;
    protected saveState(): void;
}
