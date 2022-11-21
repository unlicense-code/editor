import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from 'vs/base/common/buffer';
import { URI } from 'vs/base/common/uri';
import { IFileService, IFileStatWithMetadata, IWriteFileOptions } from 'vs/platform/files/common/files';
import { INativeHostService } from 'vs/platform/native/electron-sandbox/native';
import { INativeWorkbenchEnvironmentService } from 'vs/workbench/services/environment/electron-sandbox/environmentService';
import { IElevatedFileService } from 'vs/workbench/services/files/common/elevatedFileService';
export declare class NativeElevatedFileService implements IElevatedFileService {
    private readonly nativeHostService;
    private readonly fileService;
    private readonly environmentService;
    readonly _serviceBrand: undefined;
    constructor(nativeHostService: INativeHostService, fileService: IFileService, environmentService: INativeWorkbenchEnvironmentService);
    isSupported(resource: URI): boolean;
    writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
}
