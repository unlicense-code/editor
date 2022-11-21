import { IFileService } from 'vs/platform/files/common/files';
import { NativeWorkingCopyBackupService } from 'vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupService';
import { VSBufferReadable, VSBufferReadableStream } from 'vs/base/common/buffer';
import { CancellationToken } from 'vs/base/common/cancellation';
import { IWorkingCopyIdentifier } from 'vs/workbench/services/workingCopy/common/workingCopy';
export declare class NodeTestWorkingCopyBackupService extends NativeWorkingCopyBackupService {
    readonly fileService: IFileService;
    private backupResourceJoiners;
    private discardBackupJoiners;
    discardedBackups: IWorkingCopyIdentifier[];
    discardedAllBackups: boolean;
    private pendingBackupsArr;
    private diskFileSystemProvider;
    constructor(testDir: string, workspaceBackupPath: string);
    waitForAllBackups(): Promise<void>;
    joinBackupResource(): Promise<void>;
    backup(identifier: IWorkingCopyIdentifier, content?: VSBufferReadableStream | VSBufferReadable, versionId?: number, meta?: any, token?: CancellationToken): Promise<void>;
    joinDiscardBackup(): Promise<void>;
    discardBackup(identifier: IWorkingCopyIdentifier): Promise<void>;
    discardBackups(filter?: {
        except: IWorkingCopyIdentifier[];
    }): Promise<void>;
    getBackupContents(identifier: IWorkingCopyIdentifier): Promise<string>;
    dispose(): void;
}
