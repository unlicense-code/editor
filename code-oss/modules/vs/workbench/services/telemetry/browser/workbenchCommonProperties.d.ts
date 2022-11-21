import { IStorageService } from 'vs/platform/storage/common/storage';
export declare function resolveWorkbenchCommonProperties(storageService: IStorageService, commit: string | undefined, version: string | undefined, isInternalTelemetry: boolean, remoteAuthority?: string, productIdentifier?: string, removeMachineId?: boolean, resolveAdditionalProperties?: () => {
    [key: string]: any;
}): Promise<{
    [name: string]: string | boolean | undefined;
}>;
