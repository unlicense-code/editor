import { URI } from 'vs/base/common/uri';
import { IChecksumService } from 'vs/platform/checksum/common/checksumService';
import { IFileService } from 'vs/platform/files/common/files';
export declare class ChecksumService implements IChecksumService {
    private readonly fileService;
    readonly _serviceBrand: undefined;
    constructor(fileService: IFileService);
    checksum(resource: URI): Promise<string>;
}
