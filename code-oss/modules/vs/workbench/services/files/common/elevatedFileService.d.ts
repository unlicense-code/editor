import { URI } from 'vs/base/common/uri';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from 'vs/base/common/buffer';
import { IFileStatWithMetadata, IWriteFileOptions } from 'vs/platform/files/common/files';
export declare const IElevatedFileService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IElevatedFileService>;
export interface IElevatedFileService {
    readonly _serviceBrand: undefined;
    /**
     * Whether saving elevated is supported for the provided resource.
     */
    isSupported(resource: URI): boolean;
    /**
     * Attempts to write to the target resource elevated. This may bring
     * up a dialog to ask for admin username / password.
     */
    writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
}
