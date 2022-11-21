import { IIntegrityService, IntegrityTestResult } from 'vs/workbench/services/integrity/common/integrity';
export declare class IntegrityService implements IIntegrityService {
    readonly _serviceBrand: undefined;
    isPure(): Promise<IntegrityTestResult>;
}
