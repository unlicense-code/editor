import { IStorageService } from 'vs/platform/storage/common/storage';
import { ExceptionBreakpoint, Expression, Breakpoint, FunctionBreakpoint, DataBreakpoint } from 'vs/workbench/contrib/debug/common/debugModel';
import { IEvaluate, IExpression, IDebugModel } from 'vs/workbench/contrib/debug/common/debug';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class DebugStorage {
    private readonly storageService;
    private readonly textFileService;
    private readonly uriIdentityService;
    constructor(storageService: IStorageService, textFileService: ITextFileService, uriIdentityService: IUriIdentityService);
    loadDebugUxState(): 'simple' | 'default';
    storeDebugUxState(value: 'simple' | 'default'): void;
    loadBreakpoints(): Breakpoint[];
    loadFunctionBreakpoints(): FunctionBreakpoint[];
    loadExceptionBreakpoints(): ExceptionBreakpoint[];
    loadDataBreakpoints(): DataBreakpoint[];
    loadWatchExpressions(): Expression[];
    loadChosenEnvironments(): {
        [key: string]: string;
    };
    storeChosenEnvironments(environments: {
        [key: string]: string;
    }): void;
    storeWatchExpressions(watchExpressions: (IExpression & IEvaluate)[]): void;
    storeBreakpoints(debugModel: IDebugModel): void;
}
