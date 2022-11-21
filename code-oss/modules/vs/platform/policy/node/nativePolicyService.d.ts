import { AbstractPolicyService, IPolicyService, PolicyDefinition } from 'vs/platform/policy/common/policy';
import { IStringDictionary } from 'vs/base/common/collections';
import { ILogService } from 'vs/platform/log/common/log';
export declare class NativePolicyService extends AbstractPolicyService implements IPolicyService {
    private readonly logService;
    private readonly productName;
    private throttler;
    private watcher;
    constructor(logService: ILogService, productName: string);
    protected _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
    private _onDidPolicyChange;
}
