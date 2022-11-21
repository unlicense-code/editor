import { URI } from 'vs/base/common/uri';
import { ExtensionStoragePaths as CommonExtensionStoragePaths } from 'vs/workbench/api/common/extHostStoragePaths';
export declare class ExtensionStoragePaths extends CommonExtensionStoragePaths {
    private _workspaceStorageLock;
    protected _getWorkspaceStorageURI(storageName: string): Promise<URI>;
    onWillDeactivateAll(): void;
}
