import { VSBuffer } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IDataTransformer, IErrorTransformer, WriteableStream } from 'vs/base/common/stream';
import { URI } from 'vs/base/common/uri';
import { IFileReadStreamOptions, IFileSystemProviderWithOpenReadWriteCloseCapability } from 'vs/platform/files/common/files';
export interface ICreateReadStreamOptions extends IFileReadStreamOptions {
    /**
     * The size of the buffer to use before sending to the stream.
     */
    bufferSize: number;
    /**
     * Allows to massage any possibly error that happens during reading.
     */
    errorTransformer?: IErrorTransformer;
}
/**
 * A helper to read a file from a provider with open/read/close capability into a stream.
 */
export declare function readFileIntoStream<T>(provider: IFileSystemProviderWithOpenReadWriteCloseCapability, resource: URI, target: WriteableStream<T>, transformer: IDataTransformer<VSBuffer, T>, options: ICreateReadStreamOptions, token: CancellationToken): Promise<void>;
