import { IDisposable } from 'vs/base/common/lifecycle';
import { IFileService } from 'vs/platform/files/common/files';
import { DiskFileSystemProviderClient } from 'vs/platform/files/common/diskFileSystemProviderClient';
import { ILogService } from 'vs/platform/log/common/log';
import { IRemoteAgentService } from 'vs/workbench/services/remote/common/remoteAgentService';
export declare const REMOTE_FILE_SYSTEM_CHANNEL_NAME = "remoteFilesystem";
export declare class RemoteFileSystemProviderClient extends DiskFileSystemProviderClient {
    static register(remoteAgentService: IRemoteAgentService, fileService: IFileService, logService: ILogService): IDisposable;
    private constructor();
}
