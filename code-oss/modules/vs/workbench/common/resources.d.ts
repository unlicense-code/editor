import { URI } from 'vs/base/common/uri';
import { Disposable } from 'vs/base/common/lifecycle';
import { IExpression } from 'vs/base/common/glob';
import { IWorkspaceContextService } from 'vs/platform/workspace/common/workspace';
import { IConfigurationService, IConfigurationChangeEvent } from 'vs/platform/configuration/common/configuration';
export declare class ResourceGlobMatcher extends Disposable {
    private globFn;
    private shouldUpdate;
    private readonly contextService;
    private readonly configurationService;
    private static readonly NO_ROOT;
    private readonly _onExpressionChange;
    readonly onExpressionChange: import("vs/base/common/event").Event<void>;
    private readonly mapRootToParsedExpression;
    private readonly mapRootToExpressionConfig;
    constructor(globFn: (root?: URI) => IExpression, shouldUpdate: (event: IConfigurationChangeEvent) => boolean, contextService: IWorkspaceContextService, configurationService: IConfigurationService);
    private registerListeners;
    private updateExcludes;
    matches(resource: URI, hasSibling?: (name: string) => boolean): boolean;
}
