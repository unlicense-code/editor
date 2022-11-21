import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { URI } from 'vs/base/common/uri';
import { IResolvedNotebookEditorModel } from 'vs/workbench/contrib/notebook/common/notebookCommon';
import { IReference } from 'vs/base/common/lifecycle';
import { INotebookService } from 'vs/workbench/contrib/notebook/common/notebookService';
import { Event } from 'vs/base/common/event';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { IUriIdentityService } from 'vs/platform/uriIdentity/common/uriIdentity';
import { INotebookConflictEvent, INotebookEditorModelResolverService, IUntitledNotebookResource } from 'vs/workbench/contrib/notebook/common/notebookEditorModelResolverService';
export declare class NotebookModelResolverServiceImpl implements INotebookEditorModelResolverService {
    private readonly _notebookService;
    private readonly _extensionService;
    private readonly _uriIdentService;
    readonly _serviceBrand: undefined;
    private readonly _data;
    readonly onDidSaveNotebook: Event<URI>;
    readonly onDidChangeDirty: Event<IResolvedNotebookEditorModel>;
    private readonly _onWillFailWithConflict;
    readonly onWillFailWithConflict: Event<INotebookConflictEvent>;
    constructor(instantiationService: IInstantiationService, _notebookService: INotebookService, _extensionService: IExtensionService, _uriIdentService: IUriIdentityService);
    dispose(): void;
    isDirty(resource: URI): boolean;
    resolve(resource: URI, viewType?: string): Promise<IReference<IResolvedNotebookEditorModel>>;
    resolve(resource: IUntitledNotebookResource, viewType: string): Promise<IReference<IResolvedNotebookEditorModel>>;
}
