import { VSBufferReadableStream } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
export declare namespace WebviewResourceResponse {
    enum Type {
        Success = 0,
        Failed = 1,
        AccessDenied = 2,
        NotModified = 3
    }
    class StreamSuccess {
        readonly stream: VSBufferReadableStream;
        readonly etag: string | undefined;
        readonly mtime: number | undefined;
        readonly mimeType: string;
        readonly type = Type.Success;
        constructor(stream: VSBufferReadableStream, etag: string | undefined, mtime: number | undefined, mimeType: string);
    }
    const Failed: {
        readonly type: Type.Failed;
    };
    const AccessDenied: {
        readonly type: Type.AccessDenied;
    };
    class NotModified {
        readonly mimeType: string;
        readonly mtime: number | undefined;
        readonly type = Type.NotModified;
        constructor(mimeType: string, mtime: number | undefined);
    }
    type StreamResponse = StreamSuccess | typeof Failed | typeof AccessDenied | NotModified;
}
export declare function loadLocalResource(requestUri: URI, options: {
    ifNoneMatch: string | undefined;
    roots: ReadonlyArray<URI>;
}, fileService: IFileService, logService: ILogService, token: CancellationToken): Promise<WebviewResourceResponse.StreamResponse>;
