import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from 'vs/base/common/buffer';
import { URI } from 'vs/base/common/uri';
import { IFileStatWithMetadata, IWriteFileOptions } from 'vs/platform/files/common/files';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
export declare class BrowserElevatedFileService implements IElevatedFileService {
    readonly _serviceBrand: undefined;
    isSupported(resource: URI): boolean;
    writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
}
