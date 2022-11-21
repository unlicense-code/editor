import { IReference } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
import { ICustomEditorModel, ICustomEditorModelManager } from 'vs/workbench/contrib/customEditor/common/customEditor';
export declare class CustomEditorModelManager implements ICustomEditorModelManager {
    private readonly _references;
    getAllModels(resource: URI): Promise<ICustomEditorModel[]>;
    get(resource: URI, viewType: string): Promise<ICustomEditorModel | undefined>;
    tryRetain(resource: URI, viewType: string): Promise<IReference<ICustomEditorModel>> | undefined;
    add(resource: URI, viewType: string, model: Promise<ICustomEditorModel>): Promise<IReference<ICustomEditorModel>>;
    disposeAllModelsForView(viewType: string): void;
    private key;
}
