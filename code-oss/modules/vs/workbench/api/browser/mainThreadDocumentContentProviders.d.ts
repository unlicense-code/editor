import { UriComponents } from 'vs/base/common/uri';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IExtHostContext } from 'vs/workbench/services/extensions/common/extHostCustomers';
import { MainThreadDocumentContentProvidersShape } from '../common/extHost.protocol';
export declare class MainThreadDocumentContentProviders implements MainThreadDocumentContentProvidersShape {
    private readonly _textModelResolverService;
    private readonly _languageService;
    private readonly _modelService;
    private readonly _editorWorkerService;
    private readonly _resourceContentProvider;
    private readonly _pendingUpdate;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _textModelResolverService: ITextModelService, _languageService: ILanguageService, _modelService: IModelService, _editorWorkerService: IEditorWorkerService);
    dispose(): void;
    $registerTextContentProvider(handle: number, scheme: string): void;
    $unregisterTextContentProvider(handle: number): void;
    $onVirtualDocumentChange(uri: UriComponents, value: string): void;
}
