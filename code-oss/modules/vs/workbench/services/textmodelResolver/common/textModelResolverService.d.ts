import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IDisposable, IReference, Disposable } from 'vs/base/common/lifecycle';
import { IModelService } from 'vs/editor/common/services/model';
import { ITextModelService, ITextModelContentProvider, IResolvedTextEditorModel } from 'vs/editor/common/services/resolverService';
import { IFileService } from 'vs/platform/files/common/files';
import { IUndoRedoService } from 'vs/platform/undoRedo/common/undoRedo';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
export declare class TextModelResolverService extends Disposable implements ITextModelService {
    private readonly instantiationService;
    private readonly fileService;
    private readonly undoRedoService;
    private readonly modelService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private _resourceModelCollection;
    private get resourceModelCollection();
    private _asyncModelCollection;
    private get asyncModelCollection();
    constructor(instantiationService: IInstantiationService, fileService: IFileService, undoRedoService: IUndoRedoService, modelService: IModelService, uriIdentityService: IUriIdentityService);
    createModelReference(resource: URI): Promise<IReference<IResolvedTextEditorModel>>;
    registerTextModelContentProvider(scheme: string, provider: ITextModelContentProvider): IDisposable;
    canHandleResource(resource: URI): boolean;
}
