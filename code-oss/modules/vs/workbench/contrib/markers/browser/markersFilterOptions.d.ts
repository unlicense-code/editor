import { IFilter } from 'vs/base/common/filters';
import { IExpression } from 'vs/base/common/glob';
import { URI } from 'vs/base/common/uri';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class ResourceGlobMatcher {
    private readonly globalExpression;
    private readonly expressionsByRoot;
    constructor(globalExpression: IExpression, rootExpressions: {
        root: URI;
        expression: IExpression;
    }[], uriIdentityService: IUriIdentityService);
    matches(resource: URI): boolean;
}
export declare class FilterOptions {
    readonly filter: string;
    static readonly _filter: IFilter;
    static readonly _messageFilter: IFilter;
    readonly showWarnings: boolean;
    readonly showErrors: boolean;
    readonly showInfos: boolean;
    readonly textFilter: {
        readonly text: string;
        readonly negate: boolean;
    };
    readonly excludesMatcher: ResourceGlobMatcher;
    readonly includesMatcher: ResourceGlobMatcher;
    static EMPTY(uriIdentityService: IUriIdentityService): FilterOptions;
    constructor(filter: string, filesExclude: {
        root: URI;
        expression: IExpression;
    }[] | IExpression, showWarnings: boolean, showErrors: boolean, showInfos: boolean, uriIdentityService: IUriIdentityService);
    private setPattern;
}
