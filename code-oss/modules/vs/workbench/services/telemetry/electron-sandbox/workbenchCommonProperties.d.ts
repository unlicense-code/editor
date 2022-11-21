import { IStorageService } from 'vs/platform/storage/common/storage';
import { IFileService } from 'vs/platform/files/common/files';
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, fileService: IFileService, release: string, hostname: string, commit: string | undefined, version: string | undefined, machineId: string, isInternalTelemetry: boolean, installSourcePath: string, remoteAuthority?: string): Promise<{
    [name: string]: string | boolean | undefined;
}>;
