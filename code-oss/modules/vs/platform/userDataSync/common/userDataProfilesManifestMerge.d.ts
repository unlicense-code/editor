import { IUserDataProfile } from 'vs/platform/userDataProfile/common/userDataProfile';
import { ISyncUserDataProfile } from 'vs/platform/userDataSync/common/userDataSync';
interface IRelaxedMergeResult {
    local: {
        added: ISyncUserDataProfile[];
        removed: IUserDataProfile[];
        updated: ISyncUserDataProfile[];
    };
    remote: {
        added: IUserDataProfile[];
        removed: ISyncUserDataProfile[];
        updated: IUserDataProfile[];
    } | null;
}
export declare type IMergeResult = Required<IRelaxedMergeResult>;
export declare function merge(local: IUserDataProfile[], remote: ISyncUserDataProfile[] | null, lastSync: ISyncUserDataProfile[] | null, ignored: string[]): IMergeResult;
export {};
