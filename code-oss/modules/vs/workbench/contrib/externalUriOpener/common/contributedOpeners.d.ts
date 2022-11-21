import { Disposable } from 'vs/base/common/lifecycle';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
export declare class ContributedExternalUriOpenersStore extends Disposable {
    private readonly _extensionService;
    private static readonly STORAGE_ID;
    private readonly _openers;
    private readonly _memento;
    private _mementoObject;
    constructor(storageService: IStorageService, _extensionService: IExtensionService);
    didRegisterOpener(id: string, extensionId: string): void;
    private add;
    delete(id: string): void;
    private invalidateOpenersOnExtensionsChanged;
    private updateSchema;
}
