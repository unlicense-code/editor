import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
export declare function dedupExtensions(system: IExtensionDescription[], user: IExtensionDescription[], development: IExtensionDescription[], logService: ILogService): IExtensionDescription[];
