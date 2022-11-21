import { Event } from 'vs/base/common/event';
import { IStorageService } from 'vs/platform/storage/common/storage';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IEnvironmentVariableCollectionWithPersistence, IEnvironmentVariableService, IMergedEnvironmentVariableCollection } from 'vs/workbench/contrib/terminal/common/environmentVariable';
/**
 * Tracks and persists environment variable collections as defined by extensions.
 */
export declare class EnvironmentVariableService implements IEnvironmentVariableService {
    private readonly _extensionService;
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    collections: Map<string, IEnvironmentVariableCollectionWithPersistence>;
    mergedCollection: IMergedEnvironmentVariableCollection;
    private readonly _onDidChangeCollections;
    get onDidChangeCollections(): Event<IMergedEnvironmentVariableCollection>;
    constructor(_extensionService: IExtensionService, _storageService: IStorageService);
    set(extensionIdentifier: string, collection: IEnvironmentVariableCollectionWithPersistence): void;
    delete(extensionIdentifier: string): void;
    private _updateCollections;
    private _persistCollectionsEventually;
    protected _persistCollections(): void;
    private _notifyCollectionUpdatesEventually;
    protected _notifyCollectionUpdates(): void;
    private _resolveMergedCollection;
    private _invalidateExtensionCollections;
}
