import { IStringDictionary } from 'vs/base/common/collections';
import { Event } from 'vs/base/common/event';
import { IChannel, IServerChannel } from 'vs/base/parts/ipc/common/ipc';
import { AbstractPolicyService, IPolicyService, PolicyDefinition, PolicyValue } from 'vs/platform/policy/common/policy';
export declare class PolicyChannel implements IServerChannel {
    private service;
    private readonly disposables;
    constructor(service: IPolicyService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
    dispose(): void;
}
export declare class PolicyChannelClient extends AbstractPolicyService implements IPolicyService {
    private readonly channel;
    constructor(policiesData: IStringDictionary<{
        definition: PolicyDefinition;
        value: PolicyValue;
    }>, channel: IChannel);
    protected _updatePolicyDefinitions(policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void>;
}
