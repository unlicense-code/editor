import { Emitter } from 'vs/base/common/event';
import { URI, UriComponents } from 'vs/base/common/uri';
import { IURITransformer } from 'vs/base/common/uriIpc';
import { IFileChange } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { RemoteAgentConnectionContext } from 'vs/platform/remote/common/remoteAgentEnvironment';
import { IServerEnvironmentService } from 'vs/server/node/serverEnvironmentService';
import { AbstractDiskFileSystemProviderChannel, ISessionFileWatcher } from 'vs/platform/files/node/diskFileSystemProviderServer';
export declare class RemoteAgentFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<RemoteAgentConnectionContext> {
    private readonly environmentService;
    private readonly uriTransformerCache;
    constructor(logService: ILogService, environmentService: IServerEnvironmentService);
    protected getUriTransformer(ctx: RemoteAgentConnectionContext): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents, supportVSCodeResource?: boolean): URI;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
