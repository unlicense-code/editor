import { URI } from 'vs/base/common/uri';
export declare const IChecksumService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IChecksumService>;
export interface IChecksumService {
    readonly _serviceBrand: undefined;
    /**
     * Computes the checksum of the contents of the resource.
     */
    checksum(resource: URI): Promise<string>;
}
