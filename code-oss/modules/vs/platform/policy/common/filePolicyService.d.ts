import { URI } from 'vs/base/common/uri';
import { IFileService } from 'vs/platform/files/common/files';
import { ILogService } from 'vs/platform/log/common/log';
import { AbstractPolicyService, IPolicyService } from 'vs/platform/policy/common/policy';
export declare class FilePolicyService extends AbstractPolicyService implements IPolicyService {
    private readonly file;
    private readonly fileService;
    private readonly logService;
    private readonly throttledDelayer;
    constructor(file: URI, fileService: IFileService, logService: ILogService);
    protected _updatePolicyDefinitions(): Promise<void>;
    private read;
    private refresh;
}
