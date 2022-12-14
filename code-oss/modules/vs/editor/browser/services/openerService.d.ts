import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ICodeEditorService } from 'vs/editor/browser/services/codeEditorService';
import { ICommandService } from 'vs/platform/commands/common/commands';
import { IExternalOpener, IExternalUriResolver, IOpener, IOpenerService, IResolvedExternalUri, IValidator, OpenOptions, ResolveExternalUriOptions } from 'vs/platform/opener/common/opener';
export declare class OpenerService implements IOpenerService {
    readonly _serviceBrand: undefined;
    private readonly _openers;
    private readonly _validators;
    private readonly _resolvers;
    private readonly _resolvedUriTargets;
    private _defaultExternalOpener;
    private readonly _externalOpeners;
    constructor(editorService: ICodeEditorService, commandService: ICommandService);
    registerOpener(opener: IOpener): IDisposable;
    registerValidator(validator: IValidator): IDisposable;
    registerExternalUriResolver(resolver: IExternalUriResolver): IDisposable;
    setDefaultExternalOpener(externalOpener: IExternalOpener): void;
    registerExternalOpener(opener: IExternalOpener): IDisposable;
    open(target: URI | string, options?: OpenOptions): Promise<boolean>;
    resolveExternalUri(resource: URI, options?: ResolveExternalUriOptions): Promise<IResolvedExternalUri>;
    private _doOpenExternal;
    dispose(): void;
}
