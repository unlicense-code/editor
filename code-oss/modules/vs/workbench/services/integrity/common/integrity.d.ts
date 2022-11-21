import { URI } from 'vs/base/common/uri';
export declare const IIntegrityService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IIntegrityService>;
export interface ChecksumPair {
    uri: URI;
    actual: string;
    expected: string;
    isPure: boolean;
}
export interface IntegrityTestResult {
    isPure: boolean;
    proof: ChecksumPair[];
}
export interface IIntegrityService {
    readonly _serviceBrand: undefined;
    isPure(): Promise<IntegrityTestResult>;
}
