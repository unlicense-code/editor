import { IContextKeyService } from 'vs/platform/contextkey/common/contextkey';
import { IBreakpointContribution } from 'vs/workbench/contrib/debug/common/debug';
export declare class Breakpoints {
    private readonly breakpointContribution;
    private readonly contextKeyService;
    private breakpointsWhen;
    constructor(breakpointContribution: IBreakpointContribution, contextKeyService: IContextKeyService);
    get language(): string;
    get enabled(): boolean;
}
