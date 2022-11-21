import { IStringDictionary } from 'vs/base/common/collections';
import { Emitter, Event } from 'vs/base/common/event';
import { Disposable } from 'vs/base/common/lifecycle';
export declare type PolicyName = string;
export declare type PolicyValue = string | number;
export declare type PolicyDefinition = {
    type: 'string' | 'number';
};
export declare const IPolicyService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IPolicyService>;
export interface IPolicyService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<readonly PolicyName[]>;
    updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<IStringDictionary<PolicyValue>>;
    getPolicyValue(name: PolicyName): PolicyValue | undefined;
    serialize(): IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }> | undefined;
}
export declare abstract class AbstractPolicyService extends Disposable implements IPolicyService {
    readonly _serviceBrand: undefined;
    protected policyDefinitions: IStringDictionary<PolicyDefinition>;
    protected policies: Map<string, PolicyValue>;
    protected readonly _onDidChange: Emitter<readonly string[]>;
    readonly onDidChange: Event<readonly string[]>;
    updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<IStringDictionary<PolicyValue>>;
    getPolicyValue(name: PolicyName): PolicyValue | undefined;
    serialize(): IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }>;
    protected abstract _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
}
export declare class NullPolicyService implements IPolicyService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<any>;
    updatePolicyDefinitions(): Promise<{}>;
    getPolicyValue(): undefined;
    serialize(): undefined;
}
