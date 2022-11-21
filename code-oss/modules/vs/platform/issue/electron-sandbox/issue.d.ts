import { ICommonIssueService } from 'vs/platform/issue/common/issue';
export declare const IIssueService: import("vs/platform/instantiation/common/instantiation").ServiceIdentifier<IIssueService>;
export interface IIssueService extends ICommonIssueService {
    stopTracing(): Promise<void>;
}
