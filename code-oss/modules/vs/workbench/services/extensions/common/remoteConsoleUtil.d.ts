import { IRemoteConsoleLog } from 'vs/base/common/console';
import { ILogService } from 'vs/platform/log/common/log';
export declare function logRemoteEntry(logService: ILogService, entry: IRemoteConsoleLog, label?: string | null): void;
export declare function logRemoteEntryIfError(logService: ILogService, entry: IRemoteConsoleLog, label: string): void;
