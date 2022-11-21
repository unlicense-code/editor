import { IFileService } from 'vs/platform/files/common/files';
export declare function resolveCommonProperties(fileService: IFileService, release: string, hostname: string, arch: string, commit: string | undefined, version: string | undefined, machineId: string | undefined, isInternalTelemetry: boolean, installSourcePath: string, product?: string): Promise<{
    [name: string]: string | boolean | undefined;
}>;
export declare function verifyMicrosoftInternalDomain(domainList: readonly string[]): boolean;
