import { URI as uri } from 'vs/base/common/uri';
import { ITextModel } from 'vs/editor/common/model';
import { IModelService } from 'vs/editor/common/services/model';
import { ILanguageService } from 'vs/editor/common/languages/language';
import { ITextModelService, ITextModelContentProvider } from 'vs/editor/common/services/resolverService';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { IDebugService } from 'vs/workbench/contrib/debug/common/debug';
import { IEditorWorkerService } from 'vs/editor/common/services/editorWorker';
/**
 * Debug URI format
 *
 * a debug URI represents a Source object and the debug session where the Source comes from.
 *
 *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
 *       \___/ \____________/ \__________________________________________/ \______/
 *         |          |                             |                          |
 *      scheme   source.path                    session id            source.reference
 *
 * the arbitrary_path and the session id are encoded with 'encodeURIComponent'
 *
 */
export declare class DebugContentProvider implements IWorkbenchContribution, ITextModelContentProvider {
    private readonly debugService;
    private readonly modelService;
    private readonly languageService;
    private readonly editorWorkerService;
    private static INSTANCE;
    private readonly pendingUpdates;
    constructor(textModelResolverService: ITextModelService, debugService: IDebugService, modelService: IModelService, languageService: ILanguageService, editorWorkerService: IEditorWorkerService);
    dispose(): void;
    provideTextContent(resource: uri): Promise<ITextModel> | null;
    /**
     * Reload the model content of the given resource.
     * If there is no model for the given resource, this method does nothing.
     */
    static refreshDebugContent(resource: uri): void;
    /**
     * Create or reload the model content of the given resource.
     */
    private createOrUpdateContentModel;
}
