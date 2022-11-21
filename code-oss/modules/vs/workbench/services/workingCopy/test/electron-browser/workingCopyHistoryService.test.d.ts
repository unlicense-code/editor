import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { TestLifecycleService } from 'vs/workbench/test/browser/workbenchTestServices';
import { TestConfigurationService } from 'vs/platform/configuration/test/common/testConfigurationService';
import { NativeWorkingCopyHistoryService } from 'vs/workbench/services/workingCopy/electron-sandbox/workingCopyHistoryService';
export declare class TestWorkingCopyHistoryService extends NativeWorkingCopyHistoryService {
    readonly _fileService: IFileService;
    readonly _configurationService: TestConfigurationService;
    readonly _lifecycleService: TestLifecycleService;
    constructor(testDir: URI | string);
}
